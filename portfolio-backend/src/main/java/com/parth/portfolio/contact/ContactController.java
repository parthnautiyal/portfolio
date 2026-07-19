package com.parth.portfolio.contact;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    private static final String RESEND_API = "https://api.resend.com/emails";

    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody ContactRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()
                || request.getEmail() == null || request.getEmail().trim().isEmpty()
                || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            return ResponseEntity.badRequest().body("Invalid email");
        }

        String resendKey = System.getenv("RESEND_API_KEY");
        String toEmail   = System.getenv("EMAIL_USER");

        if (resendKey == null || resendKey.isBlank()) {
            log.warn("RESEND_API_KEY not set. Message from {} <{}>: {}",
                     request.getName(), request.getEmail(), request.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Email service not configured on server");
        }

        if (toEmail == null || toEmail.isBlank()) {
            toEmail = "onboarding@resend.dev"; // safe fallback for dev
        }

        try {
            String htmlContent = String.format(
                    "<p><strong>Name:</strong> %s</p>" +
                    "<p><strong>Email:</strong> <a href=\"mailto:%s\">%s</a></p>" +
                    "<hr/>" +
                    "<p>%s</p>",
                    escapeHtml(request.getName()),
                    escapeHtml(request.getEmail()),
                    escapeHtml(request.getEmail()),
                    escapeHtml(request.getMessage()).replace("\n", "<br/>")
            );

            if (request.getAttachment() != null && request.getAttachment().getName() != null) {
                htmlContent += String.format("<p><em>Attachment: %s</em></p>",
                        escapeHtml(request.getAttachment().getName()));
            }

            var payload = new java.util.LinkedHashMap<String, Object>();
            payload.put("from", "Portfolio Contact <onboarding@resend.dev>");
            payload.put("to", List.of(toEmail));
            payload.put("reply_to", request.getEmail());
            payload.put("subject", "Portfolio message from " + request.getName());
            payload.put("html", htmlContent);

            if (request.getAttachment() != null
                    && request.getAttachment().getData() != null
                    && request.getAttachment().getName() != null) {

                byte[] decodedBytes;
                try {
                    decodedBytes = Base64.getDecoder().decode(request.getAttachment().getData());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid base64 attachment data");
                }

                if (decodedBytes.length > 4 * 1024 * 1024) {
                    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("Attachment too large");
                }

                var attachment = Map.of(
                    "filename", request.getAttachment().getName(),
                    "content",  request.getAttachment().getData()
                );
                payload.put("attachments", List.of(attachment));
            }

            String body = mapper.writeValueAsString(payload);

            HttpRequest httpReq = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API))
                    .header("Authorization", "Bearer " + resendKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> resp = http.send(httpReq, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                log.info("Email sent via Resend from {}", request.getName());
                return ResponseEntity.ok().body(Map.of("ok", true));
            } else {
                log.error("Resend API returned {}: {}", resp.statusCode(), resp.body());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send message");
            }

        } catch (Exception e) {
            log.error("Failed to send email via Resend:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send message");
        }
    }

    private static String escapeHtml(String s) {
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
