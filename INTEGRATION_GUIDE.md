# Integration Guide

## Current Integration Status

### ✅ Fully Integrated
- **Frontend-Backend Communication**: Frontend properly uses `VITE_API_BASE_URL` to connect to backend
- **Lombok**: All DTOs now use `@Data` annotation for cleaner code
- **CORS**: Backend controllers have `@CrossOrigin` for development
- **Dark Mode**: Fully functional with localStorage persistence

### ⚠️ Partially Integrated (Needs Configuration)
- **Chat Feature**: Works but requires `OPENAI_API_KEY` environment variable
- **Contact Form**: Backend logs messages but doesn't send emails yet
- **Projects**: Uses mock data, needs GitHub webhook setup for real data

### ❌ Not Yet Integrated
- **Email Service**: Contact form doesn't send emails
- **Analytics**: No tracking implemented
- **Resume PDF**: Placeholder file needs to be replaced
- **OG Image**: Referenced but not created
- **GitHub Webhooks**: Not configured to auto-update projects

---

## Environment Setup

### Frontend (.env.local)

Create `/portfolio-frontend/.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

**Production:** Change to your deployed backend URL.

### Backend Environment Variables

Create `/portfolio-backend/.env` or set in your deployment platform:

```bash
# Required for Chat Feature
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o-mini

# Optional - for GitHub Webhook
GITHUB_WEBHOOK_SECRET=your-secret
GITHUB_PORTFOLIO_TOPIC=portfolio-project
```

---

## Feature Integration Steps

### 1. Chat Feature (OpenAI Integration)

**Status:** ⚠️ Needs API Key

**Steps:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to backend environment:
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxx
   OPENAI_MODEL=gpt-4o-mini
   ```
3. Restart backend server
4. Test at http://localhost:5173/chat

**Cost:** ~$0.10-0.50 per 100 chat messages (gpt-4o-mini)

---

### 2. Contact Form Email Integration

**Status:** ❌ Not Integrated

**Option A: Spring Boot Mail (Gmail)**

1. Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

2. Add to `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${GMAIL_USERNAME}
spring.mail.password=${GMAIL_APP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Your email to receive contact form submissions
contact.recipient.email=${CONTACT_EMAIL}
```

3. Create `EmailService.java`:
```java
@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${contact.recipient.email}")
    private String recipientEmail;

    public void sendContactEmail(ContactRequest request) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("Portfolio Contact: " + request.getName());
        message.setText(String.format(
            "From: %s <%s>\n\nMessage:\n%s",
            request.getName(),
            request.getEmail(),
            request.getMessage()
        ));
        mailSender.send(message);
    }
}
```

4. Update `ContactController.java`:
```java
@Autowired
private EmailService emailService;

@PostMapping
@CrossOrigin
public ResponseEntity<Void> submit(@RequestBody ContactRequest request) {
    // ... validation ...

    emailService.sendContactEmail(request);
    return ResponseEntity.status(HttpStatus.ACCEPTED).build();
}
```

5. Set environment variables:
```bash
GMAIL_USERNAME=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
CONTACT_EMAIL=your-email@gmail.com
```

**Get Gmail App Password:**
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"

**Option B: SendGrid (Recommended for Production)**

1. Add dependency:
```xml
<dependency>
    <groupId>com.sendgrid</groupId>
    <artifactId>sendgrid-java</artifactId>
    <version>4.9.3</version>
</dependency>
```

2. Get API key from https://sendgrid.com
3. Set environment: `SENDGRID_API_KEY=SG.xxxxx`
4. Implement SendGrid email service

---

### 3. GitHub Webhook for Auto-Updating Projects

**Status:** ❌ Not Configured

**Steps:**

1. **Generate Webhook Secret:**
```bash
openssl rand -hex 32
```

2. **Add to backend environment:**
```bash
GITHUB_WEBHOOK_SECRET=your-generated-secret
GITHUB_PORTFOLIO_TOPIC=portfolio-project
```

3. **Deploy backend to public URL** (required for webhooks)

4. **Configure GitHub Webhook:**
   - Go to your GitHub profile → Settings → Developer settings → Webhooks
   - Or for each repo: Settings → Webhooks → Add webhook
   - Payload URL: `https://your-backend.com/webhook/github`
   - Content type: `application/json`
   - Secret: (paste the secret from step 1)
   - Events: Select "Repositories" or "Just the push event"

5. **Tag repos with topic:**
   - Add `portfolio-project` topic to repos you want to display
   - Webhook will automatically update your portfolio

**Note:** Projects are stored in-memory. For production, add a database (PostgreSQL, MongoDB) to persist projects.

---

### 4. Production CORS Configuration

**Current:** `@CrossOrigin` allows all origins (development only)

**Production Fix:**

Update `application.properties`:
```properties
# Production CORS
cors.allowed.origins=${ALLOWED_ORIGINS:https://your-frontend-domain.com}
```

Create `WebConfig.java`:
```java
@Configuration
public class WebConfig implements WebCorsRegistry {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

Remove `@CrossOrigin` from individual controllers.

---

### 5. Database Integration (Optional but Recommended)

**For:** Persisting projects, contact messages, chat history

**Add to `pom.xml`:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Add to `application.properties`:**
```properties
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/portfolio}
spring.datasource.username=${DATABASE_USERNAME:postgres}
spring.datasource.password=${DATABASE_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

**Update Models:**
```java
@Data
@Entity
@Table(name = "projects")
public class Project {
    @Id
    private String id;
    private String name;
    // ... rest of fields
}

@Data
@Entity
@Table(name = "contact_messages")
public class ContactMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String message;
    private LocalDateTime createdAt;
}
```

**Create Repositories:**
```java
@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
}

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
}
```

---

## Suggested Additions

### High Priority

1. **Resume PDF Upload**
   - Current: Placeholder `Parth_Nautiyal_Resume.pdf`
   - Action: Replace with actual resume
   - Location: `/public/Parth_Nautiyal_Resume.pdf`

2. **OG Image Creation**
   - Current: Referenced in meta tags but missing
   - Action: Create 1200x630px image with your name/title
   - Location: `/portfolio-frontend/public/og-image.png`
   - Tools: Canva, Figma, or Photoshop

3. **Favicon**
   - Current: Using Vite default
   - Action: Create custom favicon
   - Generate: https://realfavicongenerator.net/

4. **Analytics Integration**
   - Options: Google Analytics 4, Plausible, Vercel Analytics
   - Privacy-friendly: Plausible or Vercel Analytics

5. **Error Logging**
   - Backend: Add Sentry or LogRocket
   - Frontend: Add Sentry React integration

### Medium Priority

6. **Blog Section**
   - Use Markdown files or integrate with Medium/Dev.to API
   - Add to navigation

7. **Testimonials/Recommendations**
   - Add section for LinkedIn recommendations
   - Fetch via LinkedIn API or static content

8. **Skills Assessment**
   - Interactive skill levels (beginner/intermediate/expert)
   - Years of experience per skill

9. **GitHub Activity Graph**
   - Show contribution calendar
   - Use GitHub API

10. **Project Filters**
    - Filter by technology/stack
    - Search functionality

### Low Priority

11. **Light/Dark Mode Auto-Detection**
    - Currently defaults to light
    - Detect system preference on first visit

12. **Animations**
    - Add subtle scroll animations (Framer Motion)
    - Page transition effects

13. **Multi-language Support**
    - i18n for international audience
    - Use react-i18next

14. **Download Resume Button**
    - Add prominent download button on hero/about
    - Track downloads

15. **Social Share Buttons**
    - Share project pages
    - Share profile

---

## Testing Checklist

### Frontend
- [ ] All pages load without errors
- [ ] Dark mode toggle works
- [ ] Forms validate properly
- [ ] Links open in new tabs
- [ ] Mobile responsive
- [ ] SEO meta tags present

### Backend
- [ ] All endpoints return correct status codes
- [ ] CORS configured for production
- [ ] Environment variables documented
- [ ] Logs don't expose sensitive data
- [ ] Rate limiting implemented (for production)

### Integration
- [ ] Frontend connects to backend API
- [ ] Chat feature works (with API key)
- [ ] Contact form submits successfully
- [ ] Projects load from backend (if webhook configured)

---

## Deployment

### Frontend (Vercel/Netlify)
1. Connect GitHub repo
2. Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend.com`
3. Deploy

### Backend (Railway/Render/AWS)
1. Connect GitHub repo
2. Set environment variables (see `.env.example`)
3. Set build command: `mvn clean package -DskipTests`
4. Set start command: `java -jar target/portfolio-backend-0.0.1-SNAPSHOT.jar`
5. Deploy

---

## Security Best Practices

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Use environment variables** for all secrets
3. **Enable HTTPS** in production
4. **Implement rate limiting** on contact/chat endpoints
5. **Validate all inputs** on backend
6. **Keep dependencies updated** (`npm audit`, `mvn versions:display-dependency-updates`)
7. **Use Content Security Policy** headers
8. **Implement CSRF protection** for state-changing operations

---

## Performance Optimization

1. **Frontend:**
   - Code splitting (already using React.lazy)
   - Image optimization (add next/image or vite-imagetools)
   - Bundle size analysis (`npm run build -- --analyze`)
   - CDN for static assets

2. **Backend:**
   - Enable GZip compression
   - Add response caching headers
   - Database connection pooling
   - API response pagination

---

## Monitoring

1. **Uptime Monitoring:** UptimeRobot, Pingdom
2. **Error Tracking:** Sentry
3. **Performance:** Web Vitals (already implemented)
4. **Logs:** Papertrail, Logtail, CloudWatch

---

## Support

For questions or issues with integration:
1. Check `TECHNICAL_DOCUMENTATION.md` for file-by-file guide
2. Check `DEPLOYMENT.md` for deployment instructions
3. Review this integration guide

Last updated: 2026-03-10
