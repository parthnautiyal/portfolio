import { useState, useEffect } from 'react'
import { FiCpu, FiSettings, FiCheckCircle, FiAlertTriangle, FiUploadCloud, FiBookOpen, FiTerminal, FiTrendingUp } from 'react-icons/fi'
import JobMatchAnalyzer from '../components/JobMatchAnalyzer'

type Category = {
  name: string
  score: number
  evidence: string[]
  bonusPoints: string[]
  deductions: string[]
}

type EvaluationReport = {
  overallScore: number
  analysis: string
  categories: Category[]
}

const parthBenchmark: EvaluationReport = {
  overallScore: 94,
  analysis: "Parth Nautiyal exhibits a exceptionally strong profile for a Full-Stack and DevOps SDE. His professional experience at ZopSmart contains strong, quantifiable metrics (reducing API latency by 50%, improving code coverage by 45%, reducing rollbacks by 70%) that demonstrate immediate business and engineering impact. His backend technical depth in Spring Boot, Kafka microservices, and distributed architecture is outstanding. To reach a perfect 100, Parth could further expand his public open-source contributions and write deep-dive technical articles about microservice scaling.",
  categories: [
    {
      "name": "Production Experience",
      "score": 96,
      "evidence": [
        "SDE I at ZopSmart scaling Spring Boot microservices.",
        "Built CI/CD pipelines cut rollback incidents by 70%.",
        "Managed containerized releases via Kubernetes and Helm."
      ],
      "bonusPoints": [
        "Quantified business results (99.9% uptime, latency reduced by 50%).",
        "Experience in high-throughput messaging (Kafka) and distributed architecture."
      ],
      "deductions": []
    },
    {
      "name": "Technical Depth",
      "score": 93,
      "evidence": [
        "Integrated distributed systems using Kafka and Spring Security.",
        "Adopted Test-Driven Development (TDD) using JUnit and Mockito."
      ],
      "bonusPoints": [
        "Strong understanding of concurrency, reactive streams, and API security schemas."
      ],
      "deductions": [
        "No explicit mention of low-level memory tuning or custom database driver optimization."
      ]
    },
    {
      "name": "Tools & Observability",
      "score": 95,
      "evidence": [
        "Implemented Grafana, Prometheus, and Datadog to optimize MTTR.",
        "Extensive DevOps toolbelt: Ansible, Docker, Jenkins, Git, Maven."
      ],
      "bonusPoints": [
        "Excellent observability footprint - MTTR reduced by 40% using metrics dashboards.",
        "Multi-language capability (Java, TypeScript, Python)."
      ],
      "deductions": []
    },
    {
      "name": "Engineering Rigor",
      "score": 92,
      "evidence": [
        "Led TDD practices increasing codebase unit test coverage by 45%."
      ],
      "bonusPoints": [
        "Strong automated validation gates integrated natively into CI/CD pipelines."
      ],
      "deductions": [
        "Lack of open-source contributions linked to public foundations or repository maintainership."
      ]
    }
  ]
}

export default function AtsCheckerPage() {
  // Settings state
  const [showSettings, setShowSettings] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini')
  const [activeTab, setActiveTab] = useState<'ats' | 'job-match'>('ats')

  // Scanner state
  const [resumeInput, setResumeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<EvaluationReport | null>(null)
  const [error, setError] = useState('')

  // Load custom settings
  useEffect(() => {
    const savedKey = localStorage.getItem('portfolio_custom_api_key') || ''
    const savedProvider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai') || 'gemini'
    setCustomKey(savedKey)
    setProvider(savedProvider)
  }, [])

  const saveSettings = () => {
    localStorage.setItem('portfolio_custom_api_key', customKey)
    localStorage.setItem('portfolio_api_provider', provider)
    setShowSettings(false)
  }

  const runScan = async () => {
    if (!resumeInput.trim()) {
      setError('Please paste some resume text first.')
      return
    }

    setLoading(true)
    setError('')
    setReport(null)

    try {
      const response = await fetch('/api/ats-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeInput,
          customApiKey: customKey || undefined,
          apiProvider: provider
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to scan resume')
      }

      const data = await response.json() as EvaluationReport
      setReport(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong during evaluation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-8 animate-fade-up">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">HackerRank AI Hiring Agent</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Evaluate resumes against official HackerRank agentic scoring guidelines.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full glass-panel hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
          title="Developer Key Settings"
        >
          <FiSettings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-5 glass-card space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FiCpu className="text-blue-500" />
            Developer API Key Settings
          </h3>
          <p className="text-xs text-slate-500">
            Provide your own API Key to bypass portfolio backend rate-limits. Stored locally in your browser.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'gemini' | 'openai')}
                className="w-full text-xs rounded-lg glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (ChatGPT)</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">API Key</label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                className="w-full text-xs rounded-lg glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        
        {/* Left Side: Parth's Benchmark Report */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-l-4 border-l-blue-600 dark:border-l-sky-400">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.65rem] font-bold tracking-widest uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400 px-2.5 py-1 rounded-full">
                Parth's Benchmark Score
              </span>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-blue-600 dark:text-sky-400 leading-none">
                  {parthBenchmark.overallScore}
                </span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {parthBenchmark.analysis}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category Scorecard</h3>
            {parthBenchmark.categories.map((cat, idx) => (
              <div key={idx} className="glass-card p-5">
                <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2 mb-3">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <FiTerminal className="text-blue-500" size={14} />
                    {cat.name}
                  </h4>
                  <span className="text-xs font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
                    {cat.score}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  {cat.evidence.length > 0 && (
                    <div>
                      <h5 className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-1">Resume Evidence</h5>
                      <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        {cat.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
                      </ul>
                    </div>
                  )}

                  {cat.bonusPoints.length > 0 && (
                    <div>
                      <h5 className="text-[0.65rem] uppercase tracking-wider font-bold text-green-500 flex items-center gap-1 mb-1">
                        <FiCheckCircle size={10} /> Bonus Points
                      </h5>
                      <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        {cat.bonusPoints.map((bp, i) => <li key={i}>{bp}</li>)}
                      </ul>
                    </div>
                  )}

                  {cat.deductions.length > 0 && (
                    <div>
                      <h5 className="text-[0.65rem] uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1 mb-1">
                        <FiAlertTriangle size={10} /> Deductions / Advice
                      </h5>
                      <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        {cat.deductions.map((ded, i) => <li key={i}>{ded}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Recruiter Sandbox & Analyzer Tools */}
        <div className="space-y-6">
          <div className="flex gap-2 p-1 glass-panel rounded-xl">
            <button
              onClick={() => setActiveTab('ats')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ats'
                  ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              ATS Sandbox
            </button>
            <button
              onClick={() => setActiveTab('job-match')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'job-match'
                  ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Job-Match Analyzer
            </button>
          </div>

          {activeTab === 'ats' ? (
            <div className="space-y-6 animate-fade-up">
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FiTrendingUp className="text-blue-500" />
                  Recruiter ATS Sandbox
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your own resume text or copy/paste it below to run the HackerRank scoring agent on your credentials.
                </p>

                <div className="space-y-2">
                  <textarea
                    value={resumeInput}
                    onChange={(e) => setResumeInput(e.target.value)}
                    placeholder="Paste plain text of the resume here..."
                    rows={10}
                    className="w-full text-xs rounded-xl glass-panel p-4 outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 border-none font-mono"
                  />
                </div>

                {error && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
                    <FiAlertTriangle />
                    {error}
                  </div>
                )}

                <button
                  onClick={runScan}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Evaluating Resume...
                    </>
                  ) : (
                    <>
                      <FiUploadCloud />
                      Scan Resume
                    </>
                  )}
                </button>
              </div>

              {/* Sandbox Scan Report Output */}
              {report && (
                <div className="glass-card p-6 space-y-4 animate-fade-up">
                  <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      <FiBookOpen className="text-green-500" />
                      Evaluation Results
                    </h4>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold text-green-500 leading-none">
                        {report.overallScore}
                      </span>
                      <span className="text-xs text-slate-400 mb-1">/100</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Agent Summary</h5>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {report.analysis}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {report.categories.map((cat, idx) => (
                        <div key={idx} className="p-3 glass-panel rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold">{cat.name}</span>
                            <span className="text-xs font-bold text-green-500">{cat.score}%</span>
                          </div>
                          <div className="space-y-1.5">
                            {cat.evidence.length > 0 && (
                              <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                                <strong>Evidence:</strong> {cat.evidence.join(', ')}
                              </p>
                            )}
                            {cat.deductions.length > 0 && (
                              <p className="text-[0.7rem] text-amber-500">
                                <strong>Deductions:</strong> {cat.deductions.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-up">
              <JobMatchAnalyzer />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
