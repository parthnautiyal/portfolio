import { useState, useEffect } from 'react'
import { FiSliders, FiCheck, FiMinus, FiAward, FiAlertCircle, FiChevronRight } from 'react-icons/fi'

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
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini')

  useEffect(() => {
    // Sync with state stored by AtsCheckerPage
    const savedKey = localStorage.getItem('portfolio_custom_api_key') || ''
    const savedProvider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai') || 'gemini'
    setCustomKey(savedKey)
    setProvider(savedProvider)
  }, [])

  const runAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first.')
      return
    }

    setLoading(true)
    setError('')
    setReport(null)

    try {
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong during analysis.')
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
