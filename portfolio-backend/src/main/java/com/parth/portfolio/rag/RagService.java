package com.parth.portfolio.rag;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;

/**
 * Retrieval over the resume knowledge base. Always a bean; reports unavailable (and returns
 * empty context) when OPENAI_API_KEY / RAG_PG_* are missing or the DB is unreachable.
 */
@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    static final double MIN_SCORE = 0.6;
    static final String KB_HASH_KEY = "kb_hash";
    static final String SOURCE_KEY = "source";
    private static final int SEGMENT_MAX_CHARS = 500;
    private static final int SEGMENT_OVERLAP_CHARS = 50;
    private static final String PROBE_QUERY = "Parth Nautiyal";

    private final ObjectProvider<EmbeddingModel> modelProvider;
    private final ObjectProvider<EmbeddingStore<TextSegment>> storeProvider;

    private volatile EmbeddingModel embeddingModel;
    private volatile EmbeddingStore<TextSegment> embeddingStore;

    @Autowired
    public RagService(ObjectProvider<EmbeddingModel> modelProvider,
                      ObjectProvider<EmbeddingStore<TextSegment>> storeProvider) {
        this.modelProvider = modelProvider;
        this.storeProvider = storeProvider;
    }

    /** Direct wiring, used by tests (e.g. with InMemoryEmbeddingStore). */
    RagService(EmbeddingModel embeddingModel, EmbeddingStore<TextSegment> embeddingStore) {
        this.modelProvider = null;
        this.storeProvider = null;
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
    }

    /**
     * Resolves the lazy model/store beans. Never throws; returns false (degraded mode) when RAG
     * is not configured or the store cannot be built (DB down, bad credentials, ...).
     */
    public synchronized boolean initialize() {
        if (isAvailable()) {
            return true;
        }
        if (modelProvider == null || storeProvider == null) {
            return false;
        }
        try {
            EmbeddingModel model = modelProvider.getIfAvailable();
            if (model == null) {
                log.info("RAG disabled: OPENAI_API_KEY not set");
                return false;
            }
            EmbeddingStore<TextSegment> store = storeProvider.getIfAvailable();
            if (store == null) {
                log.info("RAG disabled: RAG_PG_HOST/RAG_PG_DATABASE/RAG_PG_USER/RAG_PG_PASSWORD not set");
                return false;
            }
            this.embeddingModel = model;
            this.embeddingStore = store;
            return true;
        } catch (Exception e) {
            log.warn("RAG disabled: failed to initialize embedding store: {}", e.getMessage());
            return false;
        }
    }

    public boolean isAvailable() {
        return embeddingModel != null && embeddingStore != null;
    }

    /**
     * Ingests the knowledge-base document unless the store already holds this exact content
     * (tracked via a SHA-256 hash in segment metadata). Stale content is replaced.
     *
     * @return number of segments stored; 0 if skipped
     */
    public int ingestIfNeeded(String documentText, String sourceName) {
        if (!isAvailable()) {
            return 0;
        }
        String hash = sha256(documentText);

        Embedding probe = embeddingModel.embed(PROBE_QUERY).content();
        List<EmbeddingMatch<TextSegment>> existing = embeddingStore.search(EmbeddingSearchRequest.builder()
                .queryEmbedding(probe)
                .maxResults(1)
                .minScore(0.0)
                .build()).matches();
        if (!existing.isEmpty()) {
            TextSegment segment = existing.get(0).embedded();
            if (segment != null && hash.equals(segment.metadata().getString(KB_HASH_KEY))) {
                log.info("RAG knowledge base up to date ({}), skipping ingestion", sourceName);
                return 0;
            }
            log.info("RAG knowledge base changed, re-ingesting {}", sourceName);
            embeddingStore.removeAll();
        }

        Document document = Document.from(documentText, Metadata.from(KB_HASH_KEY, hash).put(SOURCE_KEY, sourceName));
        List<TextSegment> segments = DocumentSplitters.recursive(SEGMENT_MAX_CHARS, SEGMENT_OVERLAP_CHARS).split(document);
        List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
        embeddingStore.addAll(embeddings, segments);
        log.info("RAG ingested {} segments from {}", segments.size(), sourceName);
        return segments.size();
    }

    /**
     * Embeds the query and returns the texts of the closest knowledge-base segments
     * (cosine-similarity relevance >= {@link #MIN_SCORE}). Empty if RAG is unavailable or fails.
     */
    public List<String> retrieveRelevantContext(String userQuery, int maxResults) {
        if (!isAvailable() || userQuery == null || userQuery.isBlank() || maxResults <= 0) {
            return List.of();
        }
        try {
            Embedding queryEmbedding = embeddingModel.embed(userQuery).content();
            return embeddingStore.search(EmbeddingSearchRequest.builder()
                            .queryEmbedding(queryEmbedding)
                            .maxResults(maxResults)
                            .minScore(MIN_SCORE)
                            .build())
                    .matches().stream()
                    .map(EmbeddingMatch::embedded)
                    .filter(segment -> segment != null)
                    .map(TextSegment::text)
                    .toList();
        } catch (Exception e) {
            log.warn("RAG retrieval failed, continuing without retrieved context: {}", e.getMessage());
            return List.of();
        }
    }

    private static String sha256(String text) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
