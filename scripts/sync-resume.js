#!/usr/bin/env node
/**
 * sync-resume.js — Resume sync + content generator
 *
 * Usage: node scripts/sync-resume.js
 *
 * What it does:
 *   1. Copies Parth_Nautiyal_Resume.pdf → iCloud Drive & Google Drive (if mounted)
 *   2. Copies PDF to public/ so the site can serve it
 *   3. Extracts text from the PDF using pdf-parse
 *   4. Sends text to Gemini (or Ollama fallback) to generate structured JSON
 *   5. Writes updated src/content/*.ts files so the site reflects the latest resume
 *
 * Requires (at least one):
 *   GEMINI_API_KEY   — Google Gemini API key (recommended, free tier)
 *   OPENAI_API_KEY   — OpenAI key (fallback)
 *   Local Ollama     — fully offline fallback (auto-detected)
 */

import fs from 'fs'
import path from 'path'
import os from 'os'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const scriptDir = path.dirname(new URL(import.meta.url).pathname)
const rootDir = path.resolve(scriptDir, '../')          // /projects/portfolio
const PDF_SRC = path.join(rootDir, 'Parth_Nautiyal_Resume.pdf')
const PDF_PUBLIC = path.join(rootDir, 'public', 'Parth_Nautiyal_Resume.pdf')
const CONTENT_DIR = path.join(rootDir, 'src', 'content')

async function main() {
  console.log('sync-resume: starting')

  if (!fs.existsSync(PDF_SRC)) {
    console.error(`ERROR: Resume PDF not found at ${PDF_SRC}`)
    process.exit(1)
  }

  // 1 — Copy to public/
  fs.mkdirSync(path.dirname(PDF_PUBLIC), { recursive: true })
  fs.copyFileSync(PDF_SRC, PDF_PUBLIC)
  console.log(`Copied → public/Parth_Nautiyal_Resume.pdf`)

  // 2 — Copy to iCloud (macOS)
  const icloudBase = path.join(os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs')
  if (fs.existsSync(icloudBase)) {
    const dest = path.join(icloudBase, 'Resume', 'Parth_Nautiyal_Resume.pdf')
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(PDF_SRC, dest)
    console.log(`Synced  → iCloud: ${dest}`)
  } else {
    console.log('iCloud Drive not detected — skipping')
  }

  // 3 — Copy to Google Drive (macOS CloudStorage mount)
  const cloudStorage = path.join(os.homedir(), 'Library', 'CloudStorage')
  if (fs.existsSync(cloudStorage)) {
    const entries = fs.readdirSync(cloudStorage)
    const gdriveEntry = entries.find((e) => e.toLowerCase().includes('googledrive'))
    if (gdriveEntry) {
      const dest = path.join(cloudStorage, gdriveEntry, 'My Drive', 'Resume', 'Parth_Nautiyal_Resume.pdf')
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(PDF_SRC, dest)
      console.log(`Synced  → Google Drive: ${dest}`)
    } else {
      console.log('Google Drive mount not found in ~/Library/CloudStorage — skipping')
    }
  } else {
    console.log('~/Library/CloudStorage not found — skipping Google Drive sync')
  }

  // 4 — Extract PDF text
  console.log('Extracting PDF text...')
  const buffer = fs.readFileSync(PDF_SRC)
  const parsed = await pdfParse(buffer)
  const pdfText = parsed.text

  if (!pdfText || pdfText.trim().length < 50) {
    console.error('ERROR: Extracted PDF text is too short — check the PDF has a text layer')
    process.exit(1)
  }
  console.log(`Extracted ${pdfText.length} chars from PDF`)

  // 5 — Choose AI provider
  const geminiKey = process.env.GEMINI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  const ollamaUrl = process.env.OLLAMA_HOST || 'http://localhost:11434'

  let jsonText = ''

  const SYSTEM_PROMPT = `
You are a precise resume parser. Convert the provided raw resume text into a single valid JSON object
matching this exact schema (no markdown fences, no extra text):

{
  "personal": {
    "name": "Parth Nautiyal",
    "title": "...",
    "summary": "...",
    "email": "...",
    "phone": "...",
    "github": "https://github.com/parthnautiyal",
    "linkedin": "https://www.linkedin.com/in/parth-nautiyal/",
    "leetcode": "https://leetcode.com/u/parth_nautiyal/",
    "resumeUrl": "/Parth_Nautiyal_Resume.pdf"
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company",
      "location": "City, Country",
      "period": "Mon YYYY - Mon YYYY",
      "bullets": ["Achievement bullet 1 with metrics", "..."]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "B.Tech",
      "field": "Computer Science",
      "location": "City, Country",
      "period": "YYYY - YYYY",
      "details": ["CGPA: X.X/10", "..."]
    }
  ]
}

Rules:
- Extract ALL experience entries chronologically (newest first).
- Keep bullet points concise and metric-driven.
- Return ONLY the JSON object.
`

  if (geminiKey) {
    console.log('Using Gemini API...')
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nResume Text:\n${pdfText}` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )
    if (!res.ok) {
      console.error(`Gemini error ${res.status}: ${await res.text()}`)
      process.exit(1)
    }
    const result = await res.json()
    jsonText = result.candidates[0].content.parts[0].text

  } else if (openaiKey) {
    console.log('Using OpenAI API...')
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a precise JSON extractor.' },
          { role: 'user', content: `${SYSTEM_PROMPT}\n\nResume Text:\n${pdfText}` },
        ],
      }),
    })
    if (!res.ok) {
      console.error(`OpenAI error ${res.status}: ${await res.text()}`)
      process.exit(1)
    }
    const result = await res.json()
    jsonText = result.choices[0].message.content

  } else {
    // Auto-detect Ollama model
    console.log(`Using local Ollama at ${ollamaUrl}...`)
    let model = process.env.OLLAMA_MODEL || 'llama3'
    try {
      const tags = await fetch(`${ollamaUrl}/api/tags`)
      if (tags.ok) {
        const data = await tags.json()
        if (data.models?.length) model = data.models[0].name
      }
    } catch { /* use default */ }

    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${SYSTEM_PROMPT}\n\nResume Text:\n${pdfText}`,
        stream: false,
        options: { temperature: 0.1 },
      }),
    })
    if (!res.ok) {
      console.error(`Ollama error: make sure Ollama is running and model "${model}" is pulled`)
      process.exit(1)
    }
    const data = await res.json()
    jsonText = data.response.replace(/```json/g, '').replace(/```/g, '').trim()
  }

  // 6 — Parse and write
  let parsed2
  try {
    parsed2 = JSON.parse(jsonText.trim())
  } catch (e) {
    console.error('ERROR: Failed to parse AI response as JSON:', e.message)
    console.error('Raw response:\n', jsonText.slice(0, 500))
    process.exit(1)
  }

  if (parsed2.personal) writeTS('personal.ts', 'personal', parsed2.personal)
  if (parsed2.experience) writeTS('experience.ts', 'experience', parsed2.experience)
  if (parsed2.education) writeTS('education.ts', 'education', parsed2.education)

  console.log('Done — site content updated. Run `npm run build` and deploy.')
}

function writeTS(filename, varName, data) {
  const filePath = path.join(CONTENT_DIR, filename)
  const content = `export const ${varName} = ${JSON.stringify(data, null, 2)}\n`
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Wrote  → src/content/${filename}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})
