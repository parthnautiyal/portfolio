package com.parth.portfolio.rag;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModelName;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.postgresql.ds.PGSimpleDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import java.time.Duration;

/**
 * RAG wiring: OpenAI embedding model + Neon pgvector embedding store.
 * <p>
 * Both beans return {@code null} (Spring NullBean) when their env vars are missing, so the app
 * boots without them. Deliberately NOT {@code @Conditional}: Spring AOT evaluates conditions at
 * native-image build time, where these env vars are absent, which would compile RAG out of prod.
 * Both beans are {@code @Lazy}; building the store opens a DB connection (and creates the table),
 * and {@link RagService#initialize()} resolves them inside a try/catch so a down/unreachable DB or
 * bad config degrades RAG instead of failing startup.
 * <p>
 * The pgvector builder's host/port API has no SSL options, so we hand it our own DataSource
 * (Hikari over PGSimpleDataSource) with sslmode/channelBinding set — Neon enforces TLS.
 */
@Configuration
public class RagConfig {

    static final String TABLE = "resume_embeddings";
    static final int DIMENSION = 1536; // text-embedding-3-small

    @Bean
    @Lazy
    public EmbeddingModel ragEmbeddingModel() {
        if (!hasEnv("OPENAI_API_KEY")) {
            return null;
        }
        return OpenAiEmbeddingModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName(OpenAiEmbeddingModelName.TEXT_EMBEDDING_3_SMALL)
                .timeout(Duration.ofSeconds(15))
                .maxRetries(2)
                .build();
    }

    @Bean
    @Lazy
    public EmbeddingStore<TextSegment> ragEmbeddingStore() {
        if (!(hasEnv("RAG_PG_HOST") && hasEnv("RAG_PG_DATABASE")
                && hasEnv("RAG_PG_USER") && hasEnv("RAG_PG_PASSWORD"))) {
            return null;
        }
        PGSimpleDataSource pg = new PGSimpleDataSource();
        pg.setServerNames(new String[]{System.getenv("RAG_PG_HOST")});
        pg.setPortNumbers(new int[]{Integer.parseInt(envOrDefault("RAG_PG_PORT", "5432"))});
        pg.setDatabaseName(System.getenv("RAG_PG_DATABASE"));
        pg.setUser(System.getenv("RAG_PG_USER"));
        pg.setPassword(System.getenv("RAG_PG_PASSWORD"));
        pg.setSslMode(envOrDefault("RAG_PG_SSLMODE", "require"));
        pg.setChannelBinding(envOrDefault("RAG_PG_CHANNEL_BINDING", "require"));
        pg.setConnectTimeout(10);
        pg.setSocketTimeout(30);

        HikariConfig hikari = new HikariConfig();
        hikari.setPoolName("rag-pgvector");
        hikari.setDataSource(pg);
        hikari.setMaximumPoolSize(3);
        hikari.setMinimumIdle(0); // let Neon scale to zero when idle
        hikari.setIdleTimeout(Duration.ofMinutes(2).toMillis());
        hikari.setConnectionTimeout(Duration.ofSeconds(15).toMillis());

        HikariDataSource dataSource = new HikariDataSource(hikari);
        try {
            return PgVectorEmbeddingStore.datasourceBuilder()
                    .datasource(dataSource)
                    .table(TABLE)
                    .dimension(DIMENSION)
                    .createTable(true)
                    .build();
        } catch (RuntimeException e) {
            dataSource.close();
            throw e;
        }
    }

    private static String envOrDefault(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }

    private static boolean hasEnv(String name) {
        String value = System.getenv(name);
        return value != null && !value.isBlank();
    }
}
