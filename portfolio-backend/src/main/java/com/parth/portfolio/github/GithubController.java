package com.parth.portfolio.github;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    private static final Logger log = LoggerFactory.getLogger(GithubController.class);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final java.util.concurrent.ConcurrentHashMap<String, CacheEntry> cache = 
            new java.util.concurrent.ConcurrentHashMap<>();

    private static final long CACHE_DURATION_MS = 300000; // 5 minutes

    private static class CacheEntry {
        final String responseBody;
        final long expiresAt;

        CacheEntry(String responseBody, long expiresAt) {
            this.responseBody = responseBody;
            this.expiresAt = expiresAt;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    @GetMapping
    public ResponseEntity<String> getRepos(@RequestParam(value = "username", defaultValue = "parthnautiyal") String username) {
        CacheEntry cached = cache.get(username);
        if (cached != null && !cached.isExpired()) {
            log.info("Returning cached GitHub repos for user: {}", username);
            return ResponseEntity.ok()
                    .header("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
                    .body(cached.responseBody);
        }

        String token = System.getenv("GITHUB_TOKEN");
        
        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                .uri(URI.create("https://api.github.com/users/" + username + "/repos?sort=updated&per_page=50"))
                .header("Accept", "application/vnd.github.v3+json")
                .header("User-Agent", "portfolio-app")
                .GET();

        if (token != null && !token.isBlank()) {
            reqBuilder.header("Authorization", "Bearer " + token);
        }

        try {
            HttpResponse<String> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.error("GitHub API returned error code {}: {}", response.statusCode(), response.body());
                return ResponseEntity.status(response.statusCode()).body(response.body());
            }

            // Cache the response
            cache.put(username, new CacheEntry(response.body(), System.currentTimeMillis() + CACHE_DURATION_MS));

            return ResponseEntity.ok()
                    .header("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
                    .body(response.body());
        } catch (Exception e) {
            log.error("Failed to proxy GitHub repos for username: {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to fetch GitHub repos\"}");
        }
    }
}
