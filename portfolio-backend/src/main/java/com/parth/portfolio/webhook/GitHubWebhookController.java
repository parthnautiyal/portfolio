package com.parth.portfolio.webhook;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parth.portfolio.projects.Project;
import com.parth.portfolio.projects.ProjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@RestController
@RequestMapping("/webhook/github")
public class GitHubWebhookController {

    private static final Logger log = LoggerFactory.getLogger(GitHubWebhookController.class);

    private final ObjectMapper objectMapper;
    private final ProjectService projectService;
    private final String webhookSecret;
    private final String requiredTopic;

    public GitHubWebhookController(ObjectMapper objectMapper, ProjectService projectService) {
        this.objectMapper = objectMapper;
        this.projectService = projectService;
        this.webhookSecret = System.getenv("GITHUB_WEBHOOK_SECRET");
        this.requiredTopic = System.getenv("GITHUB_PORTFOLIO_TOPIC") != null
                ? System.getenv("GITHUB_PORTFOLIO_TOPIC")
                : "portfolio-project";
    }

    @PostMapping
    public ResponseEntity<Void> handleWebhook(
            @RequestBody byte[] payload,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signatureHeader,
            @RequestHeader(value = "X-GitHub-Event", required = false) String event
    ) {
        if (webhookSecret != null && signatureHeader != null && !signatureHeader.isBlank()) {
            String expected = "sha256=" + DigestUtils.appendMd5DigestAsHex(
                    (webhookSecret + new String(payload, StandardCharsets.UTF_8)).getBytes(StandardCharsets.UTF_8),
                    new StringBuilder()
            );
            if (!expected.equals(signatureHeader)) {
                log.warn("GitHub webhook signature mismatch");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            JsonNode repo = root.path("repository");
            if (repo.isMissingNode()) {
                return ResponseEntity.ok().build();
            }

            String fullName = repo.path("full_name").asText();
            String name = repo.path("name").asText();
            String description = repo.path("description").asText("");
            String htmlUrl = repo.path("html_url").asText();
            String language = repo.path("language").asText(null);
            String pushedAt = repo.path("pushed_at").asText(null);

            List<String> topics = new ArrayList<>();
            JsonNode topicsNode = repo.path("topics");
            if (topicsNode.isArray()) {
                Iterator<JsonNode> it = topicsNode.elements();
                while (it.hasNext()) {
                    topics.add(it.next().asText());
                }
            }

            if (!topics.contains(requiredTopic)) {
                log.info("Skipping repo {} because it does not have topic {}", fullName, requiredTopic);
                return ResponseEntity.ok().build();
            }

            Project project = new Project();
            project.setId(name.toLowerCase().replaceAll("[^a-z0-9]+", "-"));
            project.setName(name);
            project.setDescription(description);
            project.setUrl(htmlUrl);

            List<String> stack = new ArrayList<>();
            if (language != null) {
                stack.add(language);
            }
            project.setStack(stack);
            project.setTopics(topics);

            if (pushedAt != null && !pushedAt.isBlank()) {
                try {
                    project.setLastUpdated(OffsetDateTime.parse(pushedAt));
                } catch (Exception ignored) {
                    project.setLastUpdated(OffsetDateTime.now());
                }
            } else {
                project.setLastUpdated(OffsetDateTime.now());
            }

            projectService.upsert(project);
            log.info("Upserted project from GitHub webhook: {}", fullName);

            return ResponseEntity.accepted().build();
        } catch (Exception e) {
            log.error("Failed to handle GitHub webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

