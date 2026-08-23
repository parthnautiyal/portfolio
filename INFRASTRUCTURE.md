# Infrastructure

## Architecture

Two-deployment model. Frontend on Vercel CDN (global edge), backend on Render (single region). Vercel proxies `/api/*` to Render so the frontend uses relative paths throughout.

```
Browser
  │
  ├─ GET /          → Vercel CDN (Angular static, edge-cached globally)
  ├─ GET /api/*     → Vercel edge → Render (Spring Boot native binary)
  └─ POST /api/*    → Vercel edge → Render
```

---

## Frontend

| Property | Value |
|---|---|
| Framework | Angular 21 |
| Platform | Vercel |
| URL | https://parthnautiyal.vercel.app |
| Config | `portfolio-frontend/vercel.json` |
| Build output | `dist/portfolio-frontend/browser/` |
| Build command | `ng build --configuration production` |

**Vercel proxy** (`portfolio-frontend/vercel.json`):
```json
{ "source": "/api/:path*", "destination": "https://portfolio-zs63.onrender.com/api/:path*" }
```

Vercel auto-deploys on push to `main` (connected to this repo).

---

## Backend

| Property | Value |
|---|---|
| Framework | Spring Boot 3.5, Java 21 |
| Runtime | GraalVM Native Image (no JVM — single binary) |
| Platform | Render (free tier) |
| URL | https://portfolio-zs63.onrender.com |
| Image | `ghcr.io/parthnautiyal/portfolio-backend:latest` |
| Base image | `debian:bookworm-slim` (~80 MB total) |
| Port | 10000 (Render sets `PORT=10000` env var) |
| Startup time | ~50 ms (vs ~50 s JVM cold start on free tier) |

**Free tier behaviour**: Render spins down after 15 min inactivity. Native image restarts in ~2-3 s (vs 50 s for JVM).

### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/github` | Proxy GitHub repos API (5-min cache) |
| GET | `/api/projects` | In-memory project list (seeded + webhook) |
| POST | `/api/chat` | Gemini / OpenAI / Ollama chat proxy |
| POST | `/api/contact` | Send email via Resend API |
| POST | `/api/job-match` | Resume-vs-JD evaluation via Gemini / OpenAI |
| POST | `/api/update-content` | Write content TS files (localhost only) |
| POST | `/api/webhook/github` | GitHub push webhook → upsert project |

### Environment Variables (set in Render dashboard)

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Yes | Contact form email sending |
| `GEMINI_API_KEY` | Yes | Chat + job-match AI |
| `GITHUB_TOKEN` | Recommended | Raise GitHub API rate limit |
| `EMAIL_USER` | Recommended | Destination email for contact form |
| `OPENAI_API_KEY` | No | Alternative to Gemini |
| `GITHUB_WEBHOOK_SECRET` | No | Validate GitHub webhook HMAC |
| `GITHUB_PORTFOLIO_TOPIC` | No | Filter repos by topic (default: `portfolio-project`) |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://parthnautiyal.vercel.app` |

---

## CI/CD

**Trigger**: push to `main` with changes in `portfolio-backend/**`

**Pipeline** (`.github/workflows/deploy.yml`):
1. Build GraalVM native image from `portfolio-backend/Dockerfile`
2. Push to GHCR as `ghcr.io/parthnautiyal/portfolio-backend:latest`
3. POST to Render deploy hook → Render pulls image and redeploys
4. Write job summary to Actions UI

**Build time**: ~12 min first build, ~6 min with GHA layer cache hit.

**Secrets required in GitHub repo**:

| Secret | Value |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | From Render → Service → Settings → Deploy Hook |

`GITHUB_TOKEN` for GHCR push is provided automatically by Actions.

---

## Local Development

```bash
# Frontend (Angular dev server with proxy to local backend)
cd portfolio-frontend
npm install
ng serve                    # http://localhost:4200

# Backend (JVM mode — no GraalVM needed locally)
cd portfolio-backend
./mvnw spring-boot:run      # http://localhost:8080

# Backend (native image — requires GraalVM JDK 21)
sdk install java 21.0.4-graalce
./mvnw -P!frontend -Pnative package -DskipTests
./target/portfolio-backend
```

The Angular dev server's `proxy.conf.json` forwards `/api/*` to `http://localhost:8080`, matching prod behaviour.

---

## Key Files

```
portfolio-frontend/
  vercel.json              # Vercel SPA routing + /api proxy to Render
  proxy.conf.json          # Local dev proxy (ng serve → localhost:8080)

portfolio-backend/
  Dockerfile               # Multi-stage: GraalVM native → debian:bookworm-slim
  pom.xml                  # native profile: compile-no-fork bound to package phase
  src/main/java/.../
    SpaController.java     # Serves index.html for non-API routes (combined deploy only)
    NativeHints.java       # GraalVM AOT: registers POJOs + static/** + content/**
    CorsConfig.java        # CORS from CORS_ALLOWED_ORIGINS env var

.github/workflows/
  deploy.yml               # Build → GHCR → Render deploy hook

Dockerfile                 # Root: combined frontend+backend single-binary (Fly.io alt)
fly.toml                   # Fly.io config (alternative to Render, requires payment)
```
