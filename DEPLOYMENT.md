# Deployment Guide — Angular (Vercel) + Spring Boot (Render)

## Architecture

```
Browser → vercel.app
           ├── /api/* → Render (Spring Boot :8080) → Gmail SMTP / Gemini / GitHub
           └── /*     → Angular SPA (static files)
```

Vercel rewrites proxy all `/api/*` traffic to Render. Browser never hits Render directly — no CORS issues.

---

## Prerequisites

- GitHub account with this repo pushed
- Vercel account — [vercel.com](https://vercel.com) (free, sign up with GitHub)
- Render account — [render.com](https://render.com) (free, sign up with GitHub)
- Gmail App Password (for contact form)

---

## Part 1 — Deploy Spring Boot backend to Render

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "deploy: add Dockerfile and deployment config"
git push origin main
```

### Step 2 — Create Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `portfolio-backend` |
| **Environment** | `Docker` |
| **Branch** | `main` |
| **Instance Type** | `Free` |

4. Click **Create Web Service** — do not deploy yet, set env vars first.

### Step 3 — Set environment variables on Render

Go to your service → **Environment** tab → add:

| Key | Value | Required |
|-----|-------|----------|
| `EMAIL_USER` | Your Gmail address | Yes (contact form) |
| `EMAIL_PASS` | Gmail App Password (16 chars) | Yes (contact form) |
| `GEMINI_API_KEY` | Gemini API key | Optional (AI chat) |
| `OPENAI_API_KEY` | OpenAI API key | Optional (AI chat fallback) |
| `CORS_ALLOWED_ORIGINS` | `https://YOUR_APP.vercel.app,http://localhost:4200` | Optional |

**How to get Gmail App Password:**
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already on
3. Search "App Passwords" → create one → name it "Portfolio"
4. Copy the 16-character password — this is `EMAIL_PASS`

### Step 4 — Deploy and get URL

Click **Deploy**. First build takes ~3–5 minutes (Maven downloads dependencies).

Once deployed, copy your service URL:
```
https://portfolio-backend-xxxx.onrender.com
```

> **Free tier note:** Render spins down after 15 minutes of inactivity. First request after idle takes ~30–60 seconds to wake up. Subsequent requests are fast.

---

## Part 2 — Deploy Angular frontend to Vercel

### Step 1 — Fill in Render URL

Edit `portfolio-frontend/vercel.json` and replace the placeholder:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://portfolio-backend-xxxx.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Commit the change:
```bash
git add portfolio-frontend/vercel.json
git commit -m "chore: set Render backend URL in Vercel rewrites"
git push origin main
```

### Step 2 — Deploy to Vercel via CLI

```bash
npm i -g vercel
cd portfolio-frontend
vercel
```

When prompted:

| Prompt | Answer |
|--------|--------|
| Set up and deploy? | `Y` |
| Link to existing project? | `N` |
| Project name | `portfolio-frontend` (or anything) |
| Directory | `./` |
| Build command | `npm run build` |
| Output directory | `dist/portfolio-frontend/browser` |
| Install command | `npm install` |

### Step 3 — Deploy to production

```bash
vercel --prod
```

Copy your production URL: `https://your-app.vercel.app`

### Step 4 — Update CORS on Render

Go to Render → your service → **Environment** → update `CORS_ALLOWED_ORIGINS`:

```
https://your-app.vercel.app,http://localhost:4200
```

Render restarts automatically.

---

## Verification checklist

| Feature | How to test |
|---------|-------------|
| Angular app loads | Visit `https://your-app.vercel.app` |
| Contact form | Submit message → check Gmail inbox |
| AI chat | Open chat page → send a message |
| GitHub projects | Projects page shows repos |

To verify Render proxy is working, open browser DevTools → Network → any `/api/` call should return 200.

---

## Redeployment

**Backend (Render):** Auto-deploys on every push to `main`. Can also trigger manually from Render dashboard → **Manual Deploy**.

**Frontend (Vercel):**
```bash
cd portfolio-frontend
vercel --prod
```

Or connect repo to Vercel for auto-deploy on push:
Vercel dashboard → your project → **Settings → Git** → connect repo → set root directory to `portfolio-frontend`.

---

## Custom domain (optional)

**Vercel:**
1. Dashboard → your project → **Settings → Domains**
2. Add your domain (e.g. `parthnautiyal.dev`)
3. Add the DNS records at your registrar — Vercel provisions SSL automatically

**Render:** Same flow under your service → **Settings → Custom Domain**.

After adding custom domain, update `CORS_ALLOWED_ORIGINS` on Render to include it.

---

## Troubleshooting

**Contact form fails:**
- Check `EMAIL_USER` and `EMAIL_PASS` are set on Render
- `EMAIL_PASS` must be a Gmail App Password (16 chars), not login password
- Render dashboard → your service → **Logs** for error details

**Chat returns error:**
- Check `GEMINI_API_KEY` or `OPENAI_API_KEY` is set on Render
- Without keys, chat uses Ollama fallback (local only) or returns default message

**`/api/*` returns 404 on Vercel:**
- `portfolio-frontend/vercel.json` placeholder was not replaced with real Render URL
- Redeploy after fixing the URL

**Backend cold start (first request slow):**
- Normal on Render free tier — service sleeps after 15 min idle
- Upgrade to Render Starter ($7/mo) to eliminate cold starts

**Angular app shows blank page:**
- Run `npm run build` locally to catch build errors first
- Check Vercel build logs for TypeScript errors

**CORS errors in browser:**
- Should not happen if using Vercel proxy rewrites for all `/api/*` calls
- If calling Render directly from browser (e.g. hardcoded URL), add `CORS_ALLOWED_ORIGINS` on Render
