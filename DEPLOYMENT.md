# Deployment Guide — Vercel (Free Tier)

**Why Vercel over Netlify:** The project uses an `/api/` folder for serverless functions (contact form, GitHub proxy). This is Vercel's native convention — zero restructuring needed. Netlify requires moving functions to `netlify/functions/` with a different module format.

---

## Prerequisites

- GitHub account with this repo pushed
- Vercel account (free) — sign up at vercel.com with your GitHub account
- Gmail App Password for the contact form

---

## Step 1 — Push to GitHub

If not already on GitHub:

```bash
git add .
git commit -m "deploy: production-ready portfolio"
git push origin main
```

---

## Step 2 — Import project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** → select your portfolio repo
3. Vercel auto-detects Vite. Confirm these settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as-is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Do **not** deploy yet — set environment variables first (Step 3)

---

## Step 3 — Set environment variables

In the Vercel import screen, click **"Environment Variables"** and add:

### Required — Contact Form

| Name | Value |
|------|-------|
| `EMAIL_USER` | `parthnautiyal2002@gmail.com` |
| `EMAIL_PASS` | Your Gmail App Password (see below) |

**How to get a Gmail App Password:**
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already on
3. Search "App Passwords" → create one → select "Mail" + "Other (Custom)" → name it "Portfolio"
4. Copy the 16-character password — use this as `EMAIL_PASS`

> Your real Gmail password will NOT work. Must be an App Password.

### Optional but Recommended — GitHub API (removes rate limit)

| Name | Value |
|------|-------|
| `GITHUB_TOKEN` | GitHub personal access token |

**How to create a GitHub token:**
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Name: "Portfolio Deploy", select only the `public_repo` scope
4. Generate and copy — use as `GITHUB_TOKEN`

Without this token, GitHub API is limited to 60 requests/hour per IP (enough for low traffic, but can hit limits).

---

## Step 4 — Deploy

Click **"Deploy"**. Vercel will:

1. Run `npm install`
2. Run `node scripts/fetch-projects.js` (prebuild — fetches your GitHub repos)
3. Run `tsc -b && vite build`
4. Serve `dist/` at your `.vercel.app` URL
5. Wire `/api/*` routes to your serverless functions automatically

First deploy takes ~2 minutes.

---

## Step 5 — Verify everything works

Once deployed, open your `.vercel.app` URL and check:

| Feature | How to test |
|---------|-------------|
| **Projects** | Should show your GitHub repos (not "API unavailable") |
| **Contact form** | Submit a test message — check your Gmail inbox |
| **Terminal easter egg** | Press `Ctrl + \`` or click terminal icon bottom-right |
| **Resume download** | Click "View Resume" in hero section |

---

## Step 6 — Custom domain (optional)

1. In Vercel dashboard → your project → **Settings → Domains**
2. Click **"Add Domain"** → enter your domain (e.g. `parthnautiyal.dev`)
3. Vercel shows DNS records to add — go to your domain registrar and add them
4. Vercel provisions SSL automatically within ~5 minutes

Free `.vercel.app` subdomain works fine without a custom domain.

---

## Redeployment (future updates)

Every `git push` to `main` triggers an automatic redeploy on Vercel. No manual steps needed.

```bash
# Make changes, then:
git add .
git commit -m "your change"
git push origin main
# Vercel auto-deploys in ~1-2 minutes
```

To manually redeploy (e.g. to refresh GitHub projects without a code change):

Vercel dashboard → your project → **Deployments** → **"Redeploy"** on the latest deployment.

---

## Troubleshooting

**Contact form returns error:**
- Check `EMAIL_USER` and `EMAIL_PASS` are set in Vercel → Settings → Environment Variables
- Confirm `EMAIL_PASS` is a Gmail App Password (16 chars), not your login password
- Check Vercel → Functions logs for the `/api/contact` error message

**Projects show old/no data:**
- If `GITHUB_TOKEN` is missing and rate limit is hit, the build-time fetch falls back to `src/content/projects.json`
- Fix: add `GITHUB_TOKEN` env var and redeploy

**White page / broken styles:**
- Check Vercel build logs for TypeScript or Vite errors
- Run `npm run build` locally first to catch errors before deploying

**Serverless function timeout:**
- Free tier functions timeout at 10s
- The contact and GitHub functions are fast (< 2s) — not an issue
