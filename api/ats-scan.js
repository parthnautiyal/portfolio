import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATES = join(__dirname, '..', 'vendor', 'hiring-agent', 'prompts', 'templates')

function loadTemplates(resumeText) {
  const criteria = readFileSync(join(TEMPLATES, 'resume_evaluation_criteria.jinja'), 'utf-8')
  const systemMsg = readFileSync(join(TEMPLATES, 'resume_evaluation_system_message.jinja'), 'utf-8')
  return {
    systemMsg,
    userPrompt: criteria.replace('{{ text_content }}', resumeText),
  }
}

// Adapts interviewstreet/hiring-agent JSON schema → EvaluationReport
function transformHiringAgentResponse(raw) {
  const scores = raw.scores ?? {}
  const bonus = raw.bonus_points ?? {}
  const deducts = raw.deductions ?? {}

  const bonusTotal = bonus.total ?? 0
  const deductTotal = deducts.total ?? 0

  const categoryMap = [
    { key: 'open_source',      name: 'Open Source',          max: 35 },
    { key: 'self_projects',    name: 'Self Projects',        max: 30 },
    { key: 'production',       name: 'Production Experience', max: 25 },
    { key: 'technical_skills', name: 'Technical Skills',     max: 10 },
  ]

  const categories = categoryMap.map(({ key, name, max }) => {
    const cat = scores[key] ?? {}
    const evidenceStr = cat.evidence ?? ''
    const evidence = evidenceStr
      ? evidenceStr.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
      : []
    return { name, score: cat.score ?? 0, max: cat.max ?? max, evidence, bonusPoints: [], deductions: [] }
  })

  const sumScores = categories.reduce((acc, c) => acc + c.score, 0)
  const overallScore = Math.max(0, Math.min(100, sumScores + bonusTotal - deductTotal))

  const analysisParts = categories.map(c => `${c.name} (${c.score}/${c.max}): ${c.evidence.slice(0, 2).join(' ')}`)
  if (bonus.breakdown) analysisParts.push(`Bonus (+${bonusTotal}): ${bonus.breakdown}`)
  if (deducts.reasons) analysisParts.push(`Deductions (−${deductTotal}): ${deducts.reasons}`)

  return {
    overallScore,
    analysis: analysisParts.join('\n\n'),
    categories,
    bonusPointsTotal: bonusTotal,
    deductionsTotal: deductTotal,
    keyStrengths: Array.isArray(raw.key_strengths) ? raw.key_strengths : [],
    areasForImprovement: Array.isArray(raw.areas_for_improvement) ? raw.areas_for_improvement : [],
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { resumeText } = req.body ?? {}

  if (!resumeText?.trim()) {
    return res.status(400).json({ error: 'Resume text is required' })
  }

  const geminiKey = process.env.GEMINI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!geminiKey && !openaiKey) {
    return res.status(400).json({
      error: 'No API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY on the server, or provide your own key in Settings.'
    })
  }

  let templates
  try {
    templates = loadTemplates(resumeText)
  } catch {
    return res.status(500).json({ error: 'Failed to load hiring-agent templates. Run: git submodule update --init vendor/hiring-agent' })
  }

  const { systemMsg, userPrompt } = templates

  try {
    let jsonText = ''

    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemMsg }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      )
      if (!response.ok) throw new Error(`Gemini ${response.status}: ${await response.text()}`)
      const result = await response.json()
      jsonText = result.candidates[0].content.parts[0].text
    } else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userPrompt }
          ]
        })
      })
      if (!response.ok) throw new Error(`OpenAI ${response.status}: ${await response.text()}`)
      const result = await response.json()
      jsonText = result.choices[0].message.content
    }

    const raw = JSON.parse(jsonText.replace(/```json/g, '').replace(/```/g, '').trim())
    const report = raw.scores && !raw.overallScore ? transformHiringAgentResponse(raw) : raw
    return res.status(200).json(report)

  } catch (err) {
    console.error('ATS scan failed:', err.message)
    return res.status(500).json({ error: `ATS scan failed: ${err.message}` })
  }
}
