package com.parth.portfolio.jobmatch;

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

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@RestController
@RequestMapping("/api/job-match")
public class JobMatchController {

    private static final Logger log = LoggerFactory.getLogger(JobMatchController.class);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<?> evaluateMatch(@RequestBody JobMatchRequest request) {
        String jobDescription = request.getJobDescription();
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Job description is required\"}");
        }

        String provider = request.getApiProvider() != null ? request.getApiProvider().toLowerCase() : "";
        String customKey = request.getCustomApiKey();

        String geminiKey = (customKey != null && "gemini".equals(provider)) 
                ? customKey 
                : System.getenv("GEMINI_API_KEY");
        String openaiKey = (customKey != null && "openai".equals(provider)) 
                ? customKey 
                : System.getenv("OPENAI_API_KEY");

        // 1. Build the candidate profile text
        String profileText = loadProfileText();

        // 2. Prepare the recruitment system prompt
        String systemPrompt = """
                You are an expert recruitment advisor.
                You are given a candidate profile (Parth Nautiyal) and a target Job Description (JD).
                Evaluate the match quality between Parth's profile and the JD.

                Provide a structured evaluation containing:
                1. matchPercentage: An integer from 0 to 100 representing the fit score.
                2. customPitch: A short, compelling 2-3 sentence elevator pitch written directly to the hiring manager explaining why Parth is a great fit (referencing his specific accomplishments like latency reduction or coverage improvement if relevant).
                3. matchingSkills: Array of specific key skills requested in the JD that Parth possesses.
                4. missingSkills: Array of key skills requested in the JD that Parth does not explicitly mention in his profile (things he might need to learn or cover).
                5. relevantProjects: Array of strings matching the names of the most relevant projects Parth has worked on that align with their stack.

                Format the output strictly as a JSON object matching this schema:
                {
                  "matchPercentage": 85,
                  "customPitch": "...",
                  "matchingSkills": ["Java", "Spring Boot"],
                  "missingSkills": ["AWS CloudFront"],
                  "relevantProjects": ["training-upskilling-v2"]
                }

                Return ONLY this JSON block. Do not wrap in markdown ```json tags. Do not write any conversational text.
                """;

        if ((geminiKey == null || geminiKey.isBlank()) && (openaiKey == null || openaiKey.isBlank())) {
            // Attempt local Ollama fallback
            try {
                ObjectNode ollamaBody = objectMapper.createObjectNode();
                ollamaBody.put("model", "llama3");
                ollamaBody.put("prompt", systemPrompt + "\n\nCandidate Profile:\n" + profileText + "\n\nTarget Job Description:\n" + jobDescription);
                ollamaBody.put("stream", false);
                
                ObjectNode options = ollamaBody.putObject("options");
                options.put("temperature", 0.1);

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:11434/api/generate"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(ollamaBody), StandardCharsets.UTF_8))
                        .timeout(Duration.ofSeconds(10))
                        .build();

                HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (res.statusCode() == 200) {
                    JsonNode node = objectMapper.readTree(res.body());
                    String responseText = node.path("response").asText("").trim();
                    String cleaned = responseText.replaceAll("```json", "").replaceAll("```", "").trim();
                    // Validate JSON parsing
                    objectMapper.readTree(cleaned);
                    return ResponseEntity.ok()
                            .header("Content-Type", "application/json")
                            .body(cleaned);
                }
            } catch (Exception e) {
                log.info("Local Ollama job match failed: {}", e.getMessage());
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"error\": \"No API key configured. Please set GEMINI_API_KEY on the server or provide a custom key in the Developer Settings panel.\"}");
        }

        try {
            String jsonResponse = "";
            if (geminiKey != null && !geminiKey.isBlank() && ("gemini".equals(provider) || openaiKey == null || openaiKey.isBlank())) {
                // Gemini API Call
                ObjectNode geminiBody = objectMapper.createObjectNode();
                ArrayNode contents = geminiBody.putArray("contents");
                ObjectNode userPart = contents.addObject();
                ArrayNode parts = userPart.putArray("parts");
                ObjectNode textPart = parts.addObject();
                textPart.put("text", systemPrompt + "\n\nCandidate Profile:\n" + profileText + "\n\nJob Description:\n" + jobDescription);

                ObjectNode config = geminiBody.putObject("generationConfig");
                config.put("responseMimeType", "application/json");

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
                jsonResponse = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText("").trim();
            } else {
                // OpenAI API Call
                ObjectNode openaiBody = objectMapper.createObjectNode();
                openaiBody.put("model", "gpt-4o-mini");
                
                ObjectNode format = openaiBody.putObject("response_format");
                format.put("type", "json_object");

                ArrayNode messages = openaiBody.putArray("messages");
                
                ObjectNode sysMsg = messages.addObject();
                sysMsg.put("role", "system");
                sysMsg.put("content", "You are a precise job match evaluator.");
                
                ObjectNode userMsg = messages.addObject();
                userMsg.put("role", "user");
                userMsg.put("content", systemPrompt + "\n\nCandidate Profile:\n" + profileText + "\n\nJob Description:\n" + jobDescription);

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
                jsonResponse = root.path("choices").get(0).path("message").path("content").asText("").trim();
            }

            // Verify valid JSON
            objectMapper.readTree(jsonResponse);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(jsonResponse);

        } catch (Exception e) {
            log.error("Failed to execute Job Match:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Job matching failed: " + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }

    private String loadProfileText() {
        // Try reading updated frontend TS files, stripping the TypeScript export wrapper.
        String personalData = extractJSONFromTS("personal.ts", "personal");
        String experienceData = extractJSONFromTS("experience.ts", "experience");
        String skillsData = extractJSONFromTS("skills.ts", "skillCategories");
        String educationData = extractJSONFromTS("education.ts", "education");

        if (personalData.isEmpty() || experienceData.isEmpty()) {
            return """
                    Name: Parth Nautiyal
                    Title: Backend Engineer
                    Summary: Full-stack engineer with hands-on experience optimizing Spring Boot APIs and implementing CI/CD pipelines.
                    Email: parthnautiyal2002@gmail.com
                    GitHub: https://github.com/parthnautiyal
                    LinkedIn: https://linkedin.com/in/parthnautiyal
                    
                    Experience:
                    - Software Development Engineer II at ZopSmart (Mar 2026 - Present): Scaling 20+ Spring Boot microservices, Kafka event-driven architectures, Temporal workflow orchestration.
                    - Software Development Engineer I at ZopSmart (Jul 2024 - Mar 2026): Spring Boot REST APIs, caching CI/CD pipelines, MTTR reduction, observability with Grafana/Prometheus/Datadog.
                    
                    Skills: Java, Spring Boot, Spring Security, Kafka, Temporal, TypeScript, React, Docker, Kubernetes, Rancher, Helm, MySQL.
                    """;
        }

        return String.format(
                "Personal Data:\n%s\n\nExperience Data:\n%s\n\nSkills Categories:\n%s\n\nEducation Data:\n%s\n",
                personalData, experienceData, skillsData, educationData
        );
    }

    private String extractJSONFromTS(String fileName, String variableName) {
        try (InputStream is = getClass().getResourceAsStream("/content/" + fileName)) {
            if (is == null) return "";
            String content = new String(is.readAllBytes(), StandardCharsets.UTF_8).trim();
            int eqIdx = content.indexOf("=");
            if (eqIdx != -1) {
                String jsonPart = content.substring(eqIdx + 1).trim();
                if (jsonPart.endsWith(";")) {
                    jsonPart = jsonPart.substring(0, jsonPart.length() - 1);
                }
                return jsonPart;
            }
        } catch (Exception e) {
            log.warn("Failed to load content classpath resource: /content/{}", fileName, e);
        }
        return "";
    }
}
