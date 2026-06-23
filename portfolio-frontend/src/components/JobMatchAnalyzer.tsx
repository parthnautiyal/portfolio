import { useState, useEffect } from 'react'
import { FiSliders, FiCheck, FiMinus, FiAward, FiAlertCircle, FiChevronRight } from 'react-icons/fi'
import { getPersonal, getExperience, getSkills } from '../utils/contentLoader'

const jobMatchSystemPrompt = `
You are an expert recruitment advisor.
You are given a candidate profile (Parth Nautiyal) and a target Job Description (JD).
Evaluate the match quality between Parth's profile and the JD.

Provide a structured evaluation containing:
1. matchPercentage: An integer from 0 to 100 representing the fit score.
2. customPitch: A short, compelling 2-3 sentence elevator pitch written directly to the hiring manager explaining why Parth is a great fit (referencing his specific accomplishments like latency reduction or coverage improvement if relevant).
3. matchingSkills: Array of specific key skills requested in the JD that Parth possesses.
4. missingSkills: Array of key skills requested in the JD that Parth does not explicitly mention in his profile (things he might need to learn or cover).
5. relevantProjects: Array of strings matching the names of the most relevant projects Parth has worked on that align with their stack.

Format the output strictly as a JSON object matching this schema:
{
  "matchPercentage": 85,
  "customPitch": "...",
  "matchingSkills": ["Java", "Spring Boot"],
  "missingSkills": ["AWS CloudFront"],
  "relevantProjects": ["training-upskilling-v2"]
}

Return ONLY this JSON block. Do not wrap in markdown \`\`\`json tags. Do not write any conversational text.
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

    const runOllamaAnalysis = async () => {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: `${jobMatchSystemPrompt}\n\nCandidate Profile:\n${parthProfileText}\n\nTarget Job Description:\n${jobDescription}`,
          stream: false,
          options: {
            temperature: 0.1
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama generation failed: make sure Ollama is running at ${ollamaUrl} and model "${ollamaModel}" is pulled.`)
      }

      const resJson = await response.json()
      const jsonResponseText = resJson.response.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsedData = JSON.parse(jsonResponseText) as MatchReport
      
      if (parsedData.matchPercentage === undefined || !parsedData.customPitch) {
        throw new Error('Ollama parsed output did not match expected schema format.')
      }
      return parsedData
    }

    try {
      if (provider === 'ollama') {
        const data = await runOllamaAnalysis()
        setReport(data)
      } else {
        const response = await fetch('/api/job-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription,
            customApiKey: customKey || undefined,
            apiProvider: provider
          })
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Failed to analyze job description')
        }

        const data = await response.json() as MatchReport
        setReport(data)
      }
    } catch (err: any) {
      if (provider !== 'ollama') {
        console.warn('Backend job match failed, trying client-side Ollama fallback:', err.message)
        setError('Backend failed/keyless. Running client-side fallback via local Ollama...')
        try {
          const data = await runOllamaAnalysis()
          setReport(data)
          setError('') // clear fallback message
        } catch (ollamaErr: any) {
          setError(`Analysis failed: ${err.message}. (Ollama Fallback also failed: ${ollamaErr.message})`)
        }
      } else {
        setError(err.message || 'Something went wrong during Ollama analysis.')
      }
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
