package com.parth.portfolio.content;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.Map;

@RestController
@RequestMapping("/api/sync-resume")
public class SyncResumeController {

    private static final Logger log = LoggerFactory.getLogger(SyncResumeController.class);

    @Value("${ADMIN_PIN:1721}")
    private String adminPin;

    @Value("${VERCEL_DEPLOY_HOOK_URL:}")
    private String vercelDeployHookUrl;

    private final RestClient restClient = RestClient.create();

    @PostMapping
    public ResponseEntity<?> triggerSync(@RequestBody(required = false) Map<String, String> payload) {
        String providedPin = payload != null ? payload.get("pin") : null;
        String clientHook = payload != null ? payload.get("hookUrl") : null;

        if (providedPin == null || !providedPin.equals(adminPin)) {
            log.warn("[AUTH] Rejected sync-resume request with invalid PIN.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "error", "Authentication failed. Invalid admin PIN."));
        }

        String targetHook = (vercelDeployHookUrl != null && !vercelDeployHookUrl.isBlank()) 
                ? vercelDeployHookUrl 
                : clientHook;

        if (targetHook == null || targetHook.isBlank()) {
            log.warn("[SYNC] No VERCEL_DEPLOY_HOOK_URL configured.");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No VERCEL_DEPLOY_HOOK_URL configured in backend environment or request."
            ));
        }

        try {
            log.info("[SYNC] Dispatching deploy hook request to Vercel...");
            var response = restClient.post()
                    .uri(targetHook)
                    .retrieve()
                    .toBodilessEntity();

            log.info("[SYNC] Vercel response status: {}", response.getStatusCode());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "status", response.getStatusCode().value(),
                    "message", "Vercel rebuild triggered successfully! Live site is updating (~60s)."
            ));
        } catch (Exception e) {
            log.error("[SYNC] Deploy hook invocation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Deploy hook trigger error: " + e.getMessage()
            ));
        }
    }
}
