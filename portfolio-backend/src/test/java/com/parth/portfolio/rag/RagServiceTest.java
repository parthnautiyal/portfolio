package com.parth.portfolio.rag;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** RAG retrieval against InMemoryEmbeddingStore + a deterministic bag-of-words embedding model (no network). */
class RagServiceTest {

    private InMemoryEmbeddingStore<TextSegment> store;
    private RagService ragService;
    private String knowledgeBase;

    @BeforeEach
    void setUp() throws Exception {
        store = new InMemoryEmbeddingStore<>();
        ragService = new RagService(new BagOfWordsEmbeddingModel(), store);
        try (InputStream in = new ClassPathResource(RagIngestionRunner.KNOWLEDGE_BASE).getInputStream()) {
            knowledgeBase = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    void ingestsKnowledgeBaseAndRetrievesRelevantChunk() {
        int segments = ragService.ingestIfNeeded(knowledgeBase, "profile.md");
        assertTrue(segments > 1, "knowledge base should be split into multiple segments");

        List<String> results = ragService.retrieveRelevantContext("Which university did Parth study Computer Science at?", 2);

        assertFalse(results.isEmpty());
        assertTrue(results.get(0).contains("Lovely Professional University"), results.get(0));
    }

    @Test
    void retrievesProjectDetails() {
        ragService.ingestIfNeeded(knowledgeBase, "profile.md");

        List<String> results = ragService.retrieveRelevantContext("Jenkins Ansible deployment pipeline on AWS EC2", 1);

        assertEquals(1, results.size());
        assertTrue(results.get(0).contains("Automated Deployment Pipeline"), results.get(0));
    }

    @Test
    void returnsNothingBelowMinScore() {
        ragService.ingestIfNeeded(knowledgeBase, "profile.md");

        assertTrue(ragService.retrieveRelevantContext("zxqv blorf wizzle", 4).isEmpty());
    }

    @Test
    void skipsIngestionWhenContentUnchangedAndReplacesWhenChanged() {
        int first = ragService.ingestIfNeeded(knowledgeBase, "profile.md");
        assertEquals(0, ragService.ingestIfNeeded(knowledgeBase, "profile.md"));

        String changed = "Parth Nautiyal enjoys mountaineering in the Himalayas.";
        assertEquals(1, ragService.ingestIfNeeded(changed, "profile.md"));

        List<String> all = ragService.retrieveRelevantContext("Parth Nautiyal mountaineering Himalayas", first + 1);
        assertEquals(List.of(changed), all);
    }

    @Test
    void unavailableServiceReturnsEmptyContext() {
        RagService unconfigured = new RagService((EmbeddingModel) null, null);

        assertFalse(unconfigured.initialize());
        assertFalse(unconfigured.isAvailable());
        assertTrue(unconfigured.retrieveRelevantContext("anything", 4).isEmpty());
        assertEquals(0, unconfigured.ingestIfNeeded(knowledgeBase, "profile.md"));
    }

    /** Hashes lowercase word tokens into buckets; cosine similarity then tracks word overlap. */
    static class BagOfWordsEmbeddingModel implements EmbeddingModel {
        private static final int DIM = 4096;

        @Override
        public Response<List<Embedding>> embedAll(List<TextSegment> segments) {
            return Response.from(segments.stream().map(s -> embedText(s.text())).toList());
        }

        private static Embedding embedText(String text) {
            float[] vector = new float[DIM];
            for (String token : text.toLowerCase().split("[^a-z0-9]+")) {
                if (token.length() > 2) {
                    vector[Math.floorMod(token.hashCode(), DIM)] += 1f;
                }
            }
            return Embedding.from(vector);
        }
    }
}
