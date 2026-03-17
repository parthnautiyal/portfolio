package com.parth.portfolio.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private static final String RESUME_SNIPPET = """
            Parth Nautiyal is a full-stack engineer with experience in designing and scaling Spring Boot microservices,
            building CI/CD pipelines, and working with tools like Kubernetes, Docker, Kafka, and Temporal.
            Professional experience includes SDE roles at ZopSmart, focusing on API performance, observability,
            and production reliability.
            """;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    @CrossOrigin
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String apiKey = System.getenv("OPENAI_API_KEY");
        String model = System.getenv("OPENAI_MODEL");
        if (model == null || model.isBlank()) {
            model = "gpt-4o-mini";
        }

        String userMessage = request.getMessage() == null ? "" : request.getMessage();

        if (apiKey == null || apiKey.isBlank()) {
            String fallback = """
                    Chat is almost ready. Once an OPENAI_API_KEY is configured on the backend, this endpoint will call the ChatGPT API.
                    For now, here is a short summary based on the resume:
                    """ + RESUME_SNIPPET.trim();
            return ResponseEntity.ok(new ChatResponse(fallback));
        }

        try {
            String systemPrompt = """
                    You are a concise assistant that answers questions about the life, skills, and experience of Parth Nautiyal.
                    Base your answers strictly on the resume snippet below. If something is not in the snippet, say you are not sure.

                    Resume snippet:
                    """ + RESUME_SNIPPET.trim();

            String bodyJson = """
                    {
                      "model": "%s",
                      "messages": [
                        { "role": "system", "content": %s },
                        { "role": "user", "content": %s }
                      ]
                    }
                    """.formatted(
                    model,
                    objectMapper.writeValueAsString(systemPrompt),
                    objectMapper.writeValueAsString(userMessage)
            );

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("OpenAI API returned status {}: {}", response.statusCode(), response.body());
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(new ChatResponse("The chat service is temporarily unavailable. Please try again later."));
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                return ResponseEntity.ok(new ChatResponse("I could not generate a response right now."));
            }
            String reply = choices.get(0).path("message").path("content").asText("");
            if (reply.isBlank()) {
                reply = "I could not generate a response right now.";
            }

            return ResponseEntity.ok(new ChatResponse(reply));
        } catch (Exception e) {
            log.error("Failed to call OpenAI chat API", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("Something went wrong while contacting the chat service."));
        }
    }
}

