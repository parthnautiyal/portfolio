## Deployment Guide

This document explains how to deploy the React frontend and Spring Boot backend, and how to wire GitHub webhooks so new projects appear automatically.

---

## 1. Overview

- **Frontend**: `portfolio-frontend` (Vite + React + TypeScript + Tailwind)
- **Backend**: `portfolio-backend` (Spring Boot 3.5.0, Maven)
- **Integration**:
  - Frontend calls `GET /projects` and `POST /contact` on the backend.
  - GitHub sends webhooks to `POST /webhook/github` to keep projects in sync.

---

## 2. Backend deployment (Spring Boot)

You can deploy the backend to any Java-capable host. Below is a generic workflow you can adapt to Render, Railway, Fly.io, or a small VPS.

### 2.1 Build the backend

From `portfolio-backend`:

```bash
./mvnw clean package
```

This creates a fat jar in `target/portfolio-backend-0.0.1-SNAPSHOT.jar` (version may differ).

### 2.2 Choose a host and run the jar

On your chosen host (Linux VM, container, or platform):

```bash
java -jar portfolio-backend-0.0.1-SNAPSHOT.jar
```

Make sure the service:

- Listens on port `8080` (default), or adjust via `server.port`.
- Is reachable over HTTPS on a public URL, e.g. `https://api.yourdomain.com`.

### 2.3 Environment variables

Configure at least:

- `GITHUB_WEBHOOK_SECRET`: shared secret between GitHub and `/webhook/github`.
- `GITHUB_PORTFOLIO_TOPIC`: topic used to filter repos (default: `portfolio-project`).

Optional (for future email integration):

- SMTP / email provider credentials (to enhance `/contact` to actually send emails).

### 2.4 CORS configuration

The controllers currently use `@CrossOrigin` at method level. In production, you can restrict allowed origins globally (e.g., only your frontend domain).

Example (application-level) CORS bean (to add later if you want tighter control):

```java
// Pseudocode for a CORS config bean
// @Bean
// public WebMvcConfigurer corsConfigurer() {
//   return new WebMvcConfigurer() {
//     @Override
//     public void addCorsMappings(CorsRegistry registry) {
//       registry.addMapping("/**")
//         .allowedOrigins("https://your-frontend-domain.com")
//         .allowedMethods("GET", "POST", "OPTIONS");
//     }
//   };
// }
```

---

## 3. Frontend deployment (React + Vite)

You can use Vercel or Netlify; both work well with Vite.

### 3.1 Build the frontend

From `portfolio-frontend`:

```bash
npm install
npm run build
```

This produces a static build in `dist/`.

### 3.2 Deploy to Vercel (example)

1. Push your project to GitHub.
2. Go to Vercel, create a new project from your repo.
3. Set:
   - **Framework**: Vite.
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. In Vercel project settings → Environment Variables:
   - `VITE_API_BASE_URL=https://api.yourdomain.com` (or your backend URL).
5. Deploy. Vercel will:
   - Install dependencies.
   - Run `npm run build`.
   - Host the contents of `dist` at your Vercel URL.

### 3.3 Deploy to Netlify (alternative)

1. Create a new site from your repository.
2. Set:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. In Site Settings → Environment variables:
   - `VITE_API_BASE_URL=https://api.yourdomain.com`
4. Deploy the site.

---

## 4. Configure GitHub webhook for automatic projects

Once the backend is publicly reachable (e.g., `https://api.yourdomain.com`):

1. In GitHub, go to the repo you want to show on your portfolio.
2. Under **Settings → Webhooks → Add webhook**:
   - **Payload URL**: `https://api.yourdomain.com/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: a strong random string (must match `GITHUB_WEBHOOK_SECRET` on the backend).
   - **Events**: at least `Just the push event`.
3. Save.
4. Tag the repo with the topic configured in `GITHUB_PORTFOLIO_TOPIC` (default: `portfolio-project`).
5. Push a new commit to that repo.

The flow:

- GitHub sends a webhook to `/webhook/github` on each push.
- Backend parses the `repository` data, checks that the topic list includes your portfolio topic.
- Backend upserts the `Project` in its in-memory store.
- Frontend `Projects` section calls `GET /projects` and shows the updated list.

Repeat for each repo you want to appear on your portfolio (add the same topic and webhook scope).

---

## 5. Contact form in production

The frontend `Contact` section submits to `POST {VITE_API_BASE_URL}/contact`.

For a production-ready setup:

1. Keep the current controller to validate input and log messages.
2. Enhance it later to send emails by integrating:
   - Spring Mail with SMTP, or
   - A transactional email provider (e.g., SendGrid, Mailgun).
3. Add provider credentials as environment variables on the backend host and wire them into the contact service.

---

## 6. CI/CD (optional)

To reflect your CI/CD experience, you can:

- Add a GitHub Actions workflow that:
  - Runs `npm run lint` and `npm run build` for the frontend.
  - Runs `./mvnw test` and `./mvnw package` for the backend.
  - Triggers deploys to Vercel/Netlify and your backend host on successful builds.

This is optional but a good showcase of your DevOps practices.

