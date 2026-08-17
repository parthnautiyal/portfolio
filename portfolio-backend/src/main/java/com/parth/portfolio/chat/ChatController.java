package com.parth.portfolio.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private static final String RESUME_CONTEXT = """
            You are a helpful, professional assistant representing Parth Nautiyal. Answers should be derived from his career profile:
            - SDE II at ZopSmart (Mar 2026 - Present): Scaling 20+ microservices with Kafka event-driven architecture and Temporal workflow orchestrations. Leading system reliability and performance initiatives.
            - SDE I at ZopSmart (Jul 2024 - Mar 2026): Built Spring Boot microservices, Kafka, Spring Security, Helm, Kubernetes, Grafana, Datadog. Reduced API latency by ~50%, rollbacks by 70%.
            - SDE Intern at ZopSmart (Jan 2024 - Jul 2024): Worked on TDD, JUnit, Mockito, increasing unit test coverage by 45%.
            - Skills: Java, Spring Boot, Microservices, Kafka, Temporal, SQL, TypeScript, React, Docker, Kubernetes, Rancher, Helm, Jenkins, Ansible, Grafana, Prometheus, Datadog.
            - Education: B.Tech in Computer Science from Lovely Professional University.
            - Hobbies & Interests: System Design, Open Source, Obsidian notes, custom CLI tools.

            Base answers on the above facts. Be concise, developer-friendly, and polite. If a user asks something completely unrelated, gently redirect them to Parth's work.
            """;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String message = request.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Message is required"));
        }

        String provider = request.getApiProvider() != null ? request.getApiProvider().toLowerCase() : "";
        String customKey = request.getCustomApiKey();

        String geminiKey = (customKey != null && "gemini".equals(provider)) 
                ? customKey 
                : System.getenv("GEMINI_API_KEY");
        String openaiKey = (customKey != null && "openai".equals(provider)) 
                ? customKey 
                : System.getenv("OPENAI_API_KEY");

        String activeContext = RESUME_CONTEXT;
        if (request.getKbContext() != null && !request.getKbContext().trim().isEmpty()) {
            activeContext += "\n\nADDITIONAL USER KNOWLEDGE BASE CONTEXT:\n" + request.getKbContext() 
                    + "\n\nUse this additional context to answer the user's question if relevant.";
        }

        // If no keys are configured, try Ollama or return default fallback
        if ((geminiKey == null || geminiKey.isBlank()) && (openaiKey == null || openaiKey.isBlank())) {
            try {
                // Prepare Ollama request body
                ObjectNode ollamaBody = objectMapper.createObjectNode();
                ollamaBody.put("model", "llama3");
                ArrayNode messages = ollamaBody.putArray("messages");
                
                ObjectNode systemMsg = messages.addObject();
                systemMsg.put("role", "system");
                systemMsg.put("content", activeContext);
                
                ObjectNode userMsg = messages.addObject();
                userMsg.put("role", "user");
                userMsg.put("content", message);
                
                ollamaBody.put("stream", false);

                HttpRequest ollamaReq = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:11434/api/chat"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(ollamaBody), StandardCharsets.UTF_8))
                        .timeout(Duration.ofSeconds(5))
                        .build();

                HttpResponse<String> ollamaRes = httpClient.send(ollamaReq, HttpResponse.BodyHandlers.ofString());
                if (ollamaRes.statusCode() == 200) {
                    JsonNode node = objectMapper.readTree(ollamaRes.body());
                    String reply = node.path("message").path("content").asText("");
                    return ResponseEntity.ok(new ChatResponse(reply));
                }
            } catch (Exception e) {
                log.info("Local Ollama instance not reachable: {}", e.getMessage());
            }

            // Sub-fallback response
            String defaultReply = "Hi! I'm Parth's portfolio chatbot. Currently, no server-side API Key is configured. "
                    + "Once you add GEMINI_API_KEY or paste your own key in Developer Settings, I will answer all your questions using Gemini! "
                    + "For now, Parth is a Full-Stack Engineer at ZopSmart who specializes in Spring Boot, Kafka, and DevOps.";
            return ResponseEntity.ok(new ChatResponse(defaultReply));
        }

        try {
            if (geminiKey != null && !geminiKey.isBlank() && ("gemini".equals(provider) || openaiKey == null || openaiKey.isBlank())) {
                // Call Gemini API
                ObjectNode geminiBody = objectMapper.createObjectNode();
                ArrayNode contents = geminiBody.putArray("contents");
                ObjectNode userPart = contents.addObject();
                userPart.put("role", "user");
                ArrayNode parts = userPart.putArray("parts");
                ObjectNode textPart = parts.addObject();
                textPart.put("text", activeContext + "\n\nUser Message: " + message);

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(geminiBody), StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (res.statusCode() != 200) {
                    throw new RuntimeException("Gemini API returned status " + res.statusCode() + ": " + res.body());
                }

                JsonNode root = objectMapper.readTree(res.body());
                String reply = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText("");
                return ResponseEntity.ok(new ChatResponse(reply));
            } else {
                // Call OpenAI API
                ObjectNode openaiBody = objectMapper.createObjectNode();
                openaiBody.put("model", "gpt-4o-mini");
                ArrayNode messages = openaiBody.putArray("messages");

                ObjectNode systemMsg = messages.addObject();
                systemMsg.put("role", "system");
                systemMsg.put("content", activeContext);

                ObjectNode userMsg = messages.addObject();
                userMsg.put("role", "user");
                userMsg.put("content", message);

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                        .header("Authorization", "Bearer " + openaiKey)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(openaiBody), StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (res.statusCode() != 200) {
                    throw new RuntimeException("OpenAI API returned status " + res.statusCode() + ": " + res.body());
                }

                JsonNode root = objectMapper.readTree(res.body());
                String reply = root.path("choices").get(0).path("message").path("content").asText("");
                return ResponseEntity.ok(new ChatResponse(reply));
            }
        } catch (Exception e) {
            log.error("Failed to run chat:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("Chat service failed: " + e.getMessage()));
        }
    }
}
