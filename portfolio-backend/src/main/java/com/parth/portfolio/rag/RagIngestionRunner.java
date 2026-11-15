package com.parth.portfolio.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Initializes RAG and ingests the knowledge base on a background thread after startup, so a slow
 * (Neon cold start) or failing DB/OpenAI never blocks or crashes boot. Chat simply runs without
 * retrieved context until (unless) this completes.
 */
@Component
public class RagIngestionRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(RagIngestionRunner.class);

    static final String KNOWLEDGE_BASE = "knowledge-base/profile.md";

    private final RagService ragService;

    public RagIngestionRunner(RagService ragService) {
        this.ragService = ragService;
    }

    @Override
    public void run(ApplicationArguments args) {
        Thread.ofVirtual().name("rag-ingestion").start(this::ingest);
    }

    private void ingest() {
        try {
            if (!ragService.initialize()) {
                return;
            }
            String text;
            try (InputStream in = new ClassPathResource(KNOWLEDGE_BASE).getInputStream()) {
                text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            }
            ragService.ingestIfNeeded(text, KNOWLEDGE_BASE);
        } catch (Exception e) {
            log.warn("RAG ingestion failed, chat continues with static context only: {}", e.getMessage());
        }
    }
}
