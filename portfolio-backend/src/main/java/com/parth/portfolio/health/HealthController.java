package com.parth.portfolio.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping
public class HealthController {

    @GetMapping({"/api/health", "/health", "/api/ping", "/ping"})
    public ResponseEntity<?> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "portfolio-backend",
                "environment", "production",
                "timestamp", Instant.now().toString()
        ));
    }
}
