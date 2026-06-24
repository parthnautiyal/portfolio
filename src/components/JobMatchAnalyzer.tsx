import { useState, useEffect } from 'react'
import { FiSliders, FiCheck, FiMinus, FiAward, FiAlertCircle, FiChevronRight, FiKey } from 'react-icons/fi'
import { getPersonal, getExperience, getSkills } from '../utils/contentLoader.ts'

const jobMatchSystemPrompt = `
You are a senior technical recruiter and calibrated resume-scoring expert. Hiring managers rely on your scores to make decisions — do NOT inflate. Be honest, evidence-based, and penalise gaps explicitly.

## Scoring Rubric (100 points total)

### 1. Required Skills Match — 40 pts
Award points for each must-have technical skill from the JD that the candidate explicitly has. Partial credit for adjacent/similar skills (e.g., MySQL when PostgreSQL is required). Zero credit for skills the candidate does not mention.

### 2. Experience Depth — 25 pts
Compare the years of relevant experience EXPLICITLY required in the JD against the candidate's actual tenure in directly relevant roles.
- Full 25 pts: candidate meets or exceeds required years.
- Proportional penalty: if JD requires N years and candidate has M years, award (M/N) × 25 pts, capped at 25.
- HARD RULE: A candidate with ≤2 years total experience MUST NOT score above 70 total regardless of other factors.
- HARD RULE: A candidate with ~2.5 years for a role requiring 5+ years MUST NOT score above 75 total.

### 3. Seniority Alignment — 15 pts
- Full 15 pts: level matches (e.g., mid-level JD, mid-level candidate).
- 8–10 pts: one level gap (e.g., JD wants Senior, candidate is Mid-level SDE II).
- 0–5 pts: significant gap (e.g., JD wants Staff/Principal/Lead, candidate is junior/mid).

### 4. Measurable Impact & Achievements — 10 pts
Quantified metrics (latency reduction %, uptime, coverage improvement, throughput numbers) that are directly relevant to what the role requires. More relevant metrics = more points.

### 5. Nice-to-Have Skills — 10 pts
Good-to-have or bonus skills from the JD that the candidate possesses.

## Rules
- Be STRICT. A 92% score means the candidate is nearly perfect for the role. Reserve 85+ for genuine strong fits.
- If there is an experience or seniority gap, the customPitch MUST honestly acknowledge it (e.g., "Parth brings strong fundamentals but is ~2 years short of the 5 years this role requires").
- missingSkills MUST include an experience gap entry formatted as "X+ years experience (candidate has ~Y years)" when a shortfall exists.
- matchingSkills must be limited to skills EXPLICITLY present in the candidate profile — do not infer.
- relevantProjects must match actual project names from the candidate's profile.

## Output Format
Return ONLY a valid JSON object. No markdown fences. No prose.
{
  "matchPercentage": 72,
  "customPitch": "...",
  "matchingSkills": ["Java", "Spring Boot", "Kafka"],
  "missingSkills": ["5+ years experience (candidate has ~2.5 years)", "AWS CloudFront"],
  "relevantProjects": ["project-name"]
}
`

type MatchReport = {
  matchPercentage: number
  customPitch: string
  matchingSkills: string[]
  missingSkills: string[]
  relevantProjects: string[]
}

export default function JobMatchAnalyzer() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<MatchReport | null>(null)
  const [error, setError] = useState('')

  // Developer settings loading
  const [customKey, setCustomKey] = useState('')
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'ollama'>('gemini')
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('llama3')

  useEffect(() => {
    // Sync with state stored by AtsCheckerPage
    const savedKey = localStorage.getItem('portfolio_custom_api_key') || ''
    const savedProvider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai' | 'ollama') || 'gemini'
    const savedOllamaUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434'
    const savedOllamaModel = localStorage.getItem('portfolio_ollama_model') || 'llama3'
    setCustomKey(savedKey)
    setProvider(savedProvider)
    setOllamaUrl(savedOllamaUrl)
    setOllamaModel(savedOllamaModel)
  }, [])

  const runAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.')
      return
    }

    setLoading(true)
    setError('')
    setReport(null)

    // Load active resume content
    const personalData = getPersonal()
    const experienceData = getExperience()
    const skillsData = getSkills()

    const parthProfileText = `
Name: ${personalData.name}
Title: ${personalData.title}
Summary: ${personalData.summary}
Email: ${personalData.email}
GitHub: ${personalData.github}
LinkedIn: ${personalData.linkedin}

Experience:
${experienceData.map((exp: any) => `- ${exp.role} at ${exp.company} (${exp.period}):\n  ${exp.bullets.join('\n  ')}`).join('\n\n')}

Skills:
${skillsData.map((cat: any) => cat.items.map((item: any) => `- ${item.name} (${cat.name})`).join('\n')).join('\n')}
`

    const fullPrompt = `${jobMatchSystemPrompt}\n\nCandidate Profile:\n${parthProfileText}\n\nTarget Job Description:\n${jobDescription}`

    const parseJsonResponse = (text: string): MatchReport => {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleaned) as MatchReport
      if (parsed.matchPercentage === undefined || !parsed.customPitch) {
        throw new Error('Response did not match expected schema.')
      }
      return parsed
    }

    const runOllama = async (): Promise<MatchReport> => {
      // Auto-detect first available model; fall back to configured name
      let model = ollamaModel
      try {
        const tags = await fetch(`${ollamaUrl}/api/tags`)
        if (tags.ok) {
          const { models } = await tags.json()
          if (Array.isArray(models) && models.length > 0) model = models[0].name
        }
      } catch { /* keep configured model */ }

      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: fullPrompt, stream: false, options: { temperature: 0.1 } })
      })
      if (!res.ok) throw new Error(`Ollama unavailable at ${ollamaUrl} — ensure it is running with at least one model pulled.`)
      const data = await res.json()
      return parseJsonResponse(data.response)
    }

    const tryOllamaFallback = async (primaryErr: string) => {
      setError(`Primary provider failed (${primaryErr}) — trying local Ollama…`)
      try {
        setReport(await runOllama())
        setError('')
      } catch (ollamaErr: any) {
        setError(`${primaryErr} | Ollama fallback: ${ollamaErr.message}`)
      }
    }

    try {
      // Ollama — direct, no fallback
      if (provider === 'ollama') {
        setReport(await runOllama())
        return
      }

      // Custom Gemini key — call directly from client
      if (customKey && provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${customKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        )
        if (!res.ok) {
          const msg = await res.text()
          await tryOllamaFallback(`Gemini ${res.status}`)
          console.warn('Gemini error detail:', msg.slice(0, 300))
          return
        }
        const result = await res.json()
        setReport(parseJsonResponse(result.candidates[0].content.parts[0].text))
        return
      }

      // Custom OpenAI key — call directly from client
      if (customKey && provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are a precise job match evaluator.' },
              { role: 'user', content: fullPrompt }
            ]
          })
        })
        if (!res.ok) {
          const msg = await res.text()
          await tryOllamaFallback(`OpenAI ${res.status}`)
          console.warn('OpenAI error detail:', msg.slice(0, 300))
          return
        }
        const result = await res.json()
        setReport(parseJsonResponse(result.choices[0].message.content))
        return
      }

      // No custom key — proxy through serverless (uses server-side env key)
      const response = await fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, apiProvider: provider })
      })
      if (!response.ok) {
        const errText = await response.text()
        let errMsg = 'No API key configured. Add your Gemini key in Settings.'
        try { errMsg = JSON.parse(errText).error || errMsg } catch {}
        await tryOllamaFallback(errMsg)
        return
      }
      setReport(await response.json() as MatchReport)

    } catch (err: any) {
      setError(err.message || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <FiSliders className="text-blue-500" />
        Recruiter Job-Match Analyzer
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        Paste a job description from your company below. The AI will map Parth's microservices and DevOps skills against your stack and explain why he is a fit.
      </p>

      {!customKey && provider !== 'ollama' && (
        <div className="flex items-start gap-3 p-3 glass-panel rounded-xl border-l-4 border-l-amber-500">
          <FiKey className="text-amber-500 shrink-0 mt-0.5" size={14} />
          <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
            No API key set — analysis uses the server key (may be unavailable in dev).{' '}
            Add your Gemini key in the <strong>Settings</strong> panel above for direct client-side analysis.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste Job Description here (e.g. Seeking a Backend Engineer with 1+ years experience in Java Spring Boot, Kafka, and Docker)..."
          rows={6}
          className="w-full text-xs rounded-xl glass-panel p-4 outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 border-none"
        />
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
          <FiAlertCircle />
          {error}
        </div>
      )}

      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing Matching Index...
          </>
        ) : (
          <>
            Analyze Job Fit
          </>
        )}
      </button>

      {/* Analysis Output */}
      {report && (
        <div className="mt-4 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 space-y-4 animate-fade-up">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <FiAward className="text-blue-500" />
              Candidate Suitability
            </span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${
              report.matchPercentage >= 80 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-amber-500/10 text-amber-500'
            }`}>
              {report.matchPercentage}% Match
            </span>
          </div>

          <div className="p-4 glass-panel rounded-xl">
            <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Tailored Elevator Pitch</h4>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {report.customPitch}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-green-500 mb-2 flex items-center gap-1">
                <FiCheck size={12} /> Matching Stack
              </h4>
              {report.matchingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {report.matchingSkills.map((s, idx) => (
                    <span key={idx} className="rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 text-[0.65rem] font-medium border border-green-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[0.65rem] text-slate-400">No overlapping skills detected.</p>
              )}
            </div>

            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1">
                <FiMinus size={12} /> Gaps / Tech Gaps
              </h4>
              {report.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {report.missingSkills.map((s, idx) => (
                    <span key={idx} className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[0.65rem] font-medium border border-amber-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[0.65rem] text-slate-400">Zero skills gaps detected!</p>
              )}
            </div>
          </div>

          {report.relevantProjects.length > 0 && (
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-2">Recommended Projects to Inspect</h4>
              <ul className="text-xs space-y-1">
                {report.relevantProjects.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <FiChevronRight className="text-blue-500" size={10} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
