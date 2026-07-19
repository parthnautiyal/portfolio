package com.parth.portfolio.contact;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.ByteArrayResource;

import jakarta.mail.internet.MimeMessage;
import java.util.Base64;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");

    @Autowired(required = false)
    private JavaMailSender mailSender;

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

        String emailUser = System.getenv("EMAIL_USER");
        String emailPass = System.getenv("EMAIL_PASS");

        if (emailUser == null || emailUser.isBlank() || emailPass == null || emailPass.isBlank() || mailSender == null) {
            log.warn("Email service is not configured. Logging message to console: From: {} <{}> Msg: {}", 
                     request.getName(), request.getEmail(), request.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Email service not configured on server");
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(emailUser);
            helper.setTo(emailUser);
            helper.setReplyTo(request.getEmail());
            helper.setSubject("Portfolio message from " + request.getName());

            String htmlContent = String.format(
                    "<p><strong>Name:</strong> %s</p>" +
                    "<p><strong>Email:</strong> <a href=\"mailto:%s\">%s</a></p>" +
                    "<hr/>" +
                    "<p>%s</p>",
                    request.getName(),
                    request.getEmail(),
                    request.getEmail(),
                    request.getMessage().replace("\n", "<br/>")
            );

            if (request.getAttachment() != null && request.getAttachment().getName() != null) {
                htmlContent += String.format("<p><em>Attachment: %s</em></p>", request.getAttachment().getName());
            }
            helper.setText(htmlContent, true);

            if (request.getAttachment() != null && request.getAttachment().getData() != null && request.getAttachment().getName() != null) {
                byte[] decodedBytes;
                try {
                    decodedBytes = Base64.getDecoder().decode(request.getAttachment().getData());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid base64 attachment data");
                }

                if (decodedBytes.length > 4 * 1024 * 1024) {
                    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("Attachment too large");
                }

                ByteArrayResource resource = new ByteArrayResource(decodedBytes);
                String mimeType = request.getAttachment().getMimeType();
                if (mimeType == null || mimeType.isBlank()) {
                    mimeType = "application/octet-stream";
                }
                helper.addAttachment(request.getAttachment().getName(), resource, mimeType);
            }

            mailSender.send(mimeMessage);
            log.info("Successfully sent contact email from {}", request.getName());
            return ResponseEntity.ok().body(new Object() {
                public final boolean ok = true;
            });
        } catch (Exception e) {
            log.error("Failed to send email:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send message");
        }
    }
}
