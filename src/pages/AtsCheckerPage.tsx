import { useState, useEffect } from 'react'
import { FiCpu, FiSettings, FiCheckCircle, FiAlertTriangle, FiUploadCloud, FiBookOpen, FiTerminal, FiTrendingUp, FiTrash2, FiClock, FiKey } from 'react-icons/fi'
import JobMatchAnalyzer from '../components/JobMatchAnalyzer.tsx'
import OllamaDiagnosticModal from '../components/OllamaDiagnosticModal.tsx'
// Templates sourced directly from interviewstreet/hiring-agent — run `npm run sync:vendor` to update
import criteriaTemplate from '../../vendor/hiring-agent/prompts/templates/resume_evaluation_criteria.jinja?raw'
import systemMsgTemplate from '../../vendor/hiring-agent/prompts/templates/resume_evaluation_system_message.jinja?raw'

type Category = {
  name: string
  score: number
  max: number
  evidence: string[]
  bonusPoints: string[]
  deductions: string[]
}

type EvaluationReport = {
  overallScore: number
  analysis: string
  categories: Category[]
  bonusPointsTotal?: number
  deductionsTotal?: number
  keyStrengths?: string[]
  areasForImprovement?: string[]
}

// Scores computed against the real interviewstreet/hiring-agent rubric:
// Open Source 0-35 | Self Projects 0-30 | Production 0-25 | Technical Skills 0-10 | Bonus ≤20 | Deductions
// Parth: no external OSS contributions (personal repos only) → 10/35
//        Portfolio + a few side projects → 15/30
//        SDE I→II, 2+ yrs, quantified metrics → 23/25
//        Java/Spring/Kafka/K8s/TypeScript → 9/10
//        Bonus: portfolio website +2, LinkedIn +1 → +3
//        Deductions: most projects lack live demo → -3
//        Total: 10+15+23+9+3-3 = 57  ← matches real HackerRank score
const parthBenchmark: EvaluationReport = {
  overallScore: 57,
  bonusPointsTotal: 3,
  deductionsTotal: 3,
  keyStrengths: [
    "Rapid career progression (Intern → SDE I → SDE II) with quantified production impact",
    "Strong backend depth: Spring Boot, Kafka event-driven architecture, Temporal workflows",
    "Meaningful DevOps breadth: Kubernetes, Helm, Grafana, Prometheus, Datadog, SonarQube",
    "TDD adoption led to 45% code coverage improvement; MTTR reduced 40%"
  ],
  areasForImprovement: [
    "Zero contributions to external open-source projects — biggest score gap (only personal repos)",
    "Most personal/side projects lack live demos, reducing verifiability",
    "No GSoC, Hacktoberfest wins, or community programme participation on record",
    "Publishing technical articles on microservice scaling would strengthen public profile"
  ],
  analysis: "Parth Nautiyal scores 57/100 under the HackerRank hiring-agent rubric — a realistic assessment that reflects both genuine strengths and clear gaps. The rubric weighs open-source contributions heavily (35 points) and Parth currently holds personal repositories only, with no recorded contributions to external projects; this single gap accounts for the bulk of lost points. His production experience, however, is genuinely strong: a trajectory from intern to SDE II within two years at ZopSmart, with quantified outcomes (50% latency reduction, 70% rollback reduction, 45% coverage gain) places him near the top of the Production Experience band. His technical skills span Java, Spring Boot, Kafka, Kubernetes, and full observability tooling — well above average for his seniority. Closing the open-source gap (even one accepted PR to a 1k+ star repo) and adding live demos to side projects would push the score into the 70–80 range.",
  categories: [
    {
      name: "Open Source",
      score: 10,
      max: 35,
      evidence: [
        "Active GitHub profile with personal project repositories.",
        "Portfolio website publicly hosted and linked."
      ],
      bonusPoints: [
        "Portfolio website present (+2 pts).",
        "LinkedIn profile linked (+1 pt)."
      ],
      deductions: [
        "All GitHub repositories are personal projects — no contributions to external/third-party repositories.",
        "No GSoC, Hacktoberfest meaningful contribution, or community programme participation detected.",
        "Per rubric: if all GitHub repos are self_project type, Open Source score is capped at 10."
      ]
    },
    {
      name: "Self Projects",
      score: 15,
      max: 30,
      evidence: [
        "Developer portfolio site built with React 19, Vite, TailwindCSS, and Vercel serverless.",
        "Integrated multi-provider AI pipeline (Gemini, OpenAI, Ollama) with graceful fallbacks."
      ],
      bonusPoints: [
        "Portfolio site demonstrates frontend depth beyond typical backend engineers.",
        "AI integration shows cross-domain curiosity."
      ],
      deductions: [
        "Most listed projects lack live demo URLs — 2–3 pt deduction per project without demo.",
        "No evidence of community adoption, forks, or star counts on side projects."
      ]
    },
    {
      name: "Production Experience",
      score: 23,
      max: 25,
      evidence: [
        "SDE II at ZopSmart (Mar 2026–Present): architecting Kafka event-driven microservices, Temporal workflow orchestration across 20+ services.",
        "SDE I at ZopSmart (Jul 2024–Mar 2026): reduced API latency 50%, rollbacks 70%, MTTR 40%; raised unit test coverage 45%.",
        "Intern at ZopSmart (Jan 2024–Jul 2024): first production exposure, promoted twice within 2 years.",
        "Containerised deployments via Docker, Kubernetes, Helm across staging and production environments."
      ],
      bonusPoints: [
        "Intern → SDE I → SDE II within 24 months demonstrates consistent impact.",
        "Quantified metrics for every role — rare at this seniority.",
        "Experience with distributed systems (Kafka, Temporal) usually seen in more senior engineers."
      ],
      deductions: [
        "Total production tenure ~2.5 years — strong for the rubric band but not yet senior-level tenure."
      ]
    },
    {
      name: "Technical Skills",
      score: 9,
      max: 10,
      evidence: [
        "Backend: Java, Spring Boot, Spring Security, REST, Kafka, Temporal.",
        "DevOps: Docker, Kubernetes, Helm, Rancher, Azure, CI/CD (Jenkins/GitHub Actions).",
        "Observability: Grafana, Prometheus, Datadog.",
        "Frontend: TypeScript, Angular, React.",
        "Quality: SonarQube, Snyk, JUnit, Mockito (TDD)."
      ],
      bonusPoints: [
        "Multi-stack: strong backend AND DevOps breadth is uncommon at SDE II level.",
        "Security tooling (Snyk, Spring Security) adds extra dimension."
      ],
      deductions: [
        "No evidence of algorithm-contest performance or competitive programming."
      ]
    }
  ]
}

// Adapts the interviewstreet/hiring-agent JSON schema to our EvaluationReport shape.
// Their schema: { scores: { open_source, self_projects, production, technical_skills }, bonus_points, deductions, key_strengths, areas_for_improvement }
// Their evidence fields are strings; we convert to string[] and synthesize overallScore + analysis.
function transformHiringAgentResponse(raw: Record<string, any>): EvaluationReport {
  const scores = (raw.scores ?? {}) as Record<string, any>
  const bonus = (raw.bonus_points ?? {}) as Record<string, any>
  const deducts = (raw.deductions ?? {}) as Record<string, any>

  const bonusTotal: number = bonus.total ?? 0
  const deductTotal: number = deducts.total ?? 0

  const categoryMap = [
    { key: 'open_source',      name: 'Open Source',          max: 35 },
    { key: 'self_projects',    name: 'Self Projects',        max: 30 },
    { key: 'production',       name: 'Production Experience', max: 25 },
    { key: 'technical_skills', name: 'Technical Skills',     max: 10 },
  ]

  const categories: Category[] = categoryMap.map(({ key, name, max }) => {
    const cat = scores[key] ?? {}
    const evidenceStr: string = cat.evidence ?? ''
    const evidence = evidenceStr
      ? evidenceStr.split(/(?<=[.!?])\s+/).map((s: string) => s.trim()).filter(Boolean)
      : []
    return {
      name,
      score: cat.score ?? 0,
      max: cat.max ?? max,
      evidence,
      bonusPoints: [],
      deductions: [],
    }
  })

  const sumScores = categories.reduce((acc, c) => acc + c.score, 0)
  const overallScore = Math.max(0, Math.min(100, sumScores + bonusTotal - deductTotal))

  const analysisParts = categories.map(c => `${c.name} (${c.score}/${c.max}): ${c.evidence.slice(0, 2).join(' ')}`)
  if (bonus.breakdown) analysisParts.push(`Bonus (+${bonusTotal}): ${bonus.breakdown}`)
  if (deducts.reasons) analysisParts.push(`Deductions (−${deductTotal}): ${deducts.reasons}`)
  const analysis = analysisParts.join('\n\n')

  return {
    overallScore,
    analysis,
    categories,
    bonusPointsTotal: bonusTotal,
    deductionsTotal: deductTotal,
    keyStrengths: Array.isArray(raw.key_strengths) ? raw.key_strengths : [],
    areasForImprovement: Array.isArray(raw.areas_for_improvement) ? raw.areas_for_improvement : [],
  }
}

export default function AtsCheckerPage() {
  // Settings state
  const [showSettings, setShowSettings] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'ollama'>('gemini')
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('llama3')
  const [activeTab, setActiveTab] = useState<'ats' | 'job-match'>('ats')

  // Scanner state
  const [resumeInput, setResumeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<EvaluationReport | null>(null)
  const [error, setError] = useState('')

  // PDF Parser drag-and-drop state
  const [pdfDragActive, setPdfDragActive] = useState(false)
  const [isPdfParsing, setIsPdfParsing] = useState(false)
  const [pdfStatusMessage, setPdfStatusMessage] = useState('')
  
  // PDF File Reference for history log labeling
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  // Recruiter History Log State & Diagnostic Modal State
  const [history, setHistory] = useState<any[]>([])
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false)

  // Uploaded candidate report — session-only (resets on page refresh)
  const [uploadedReport, setUploadedReport] = useState<EvaluationReport | null>(null)
  const [candidateName, setCandidateName] = useState<string | null>(null)

  // Load custom settings
  useEffect(() => {
    const savedKey = localStorage.getItem('portfolio_custom_api_key') || ''
    const savedProvider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai' | 'ollama') || 'gemini'
    const savedOllamaUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434'
    const savedOllamaModel = localStorage.getItem('portfolio_ollama_model') || 'llama3'
    setCustomKey(savedKey)
    setProvider(savedProvider)
    setOllamaUrl(savedOllamaUrl)
    setOllamaModel(savedOllamaModel)

    // Load history
    const savedHistory = localStorage.getItem('portfolio_ats_history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to parse history:', e)
      }
    }
  }, [])

  const saveSettings = () => {
    localStorage.setItem('portfolio_custom_api_key', customKey)
    localStorage.setItem('portfolio_api_provider', provider)
    localStorage.setItem('portfolio_ollama_url', ollamaUrl)
    localStorage.setItem('portfolio_ollama_model', ollamaModel)
    setShowSettings(false)
  }

  const saveToHistory = (newReport: EvaluationReport, fileObj?: File | null) => {
    let resumeName = fileObj ? fileObj.name : 'Pasted Resume Text'
    if (resumeName === 'Pasted Resume Text') {
      const snippet = resumeInput.trim().substring(0, 30)
      if (snippet) {
        resumeName = `"${snippet}..."`
      }
    }

    const newItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      resumeName,
      report: newReport
    }

    const updated = [newItem, ...history].slice(0, 10)
    setHistory(updated)
    localStorage.setItem('portfolio_ats_history', JSON.stringify(updated))
  }

  const nameFromFile = (file: File | null): string => {
    if (!file) return 'Uploaded Candidate'
    return file.name
      .replace(/\.[^.]+$/, '')          // drop extension
      .replace(/[-_\.]/g, ' ')          // separators → spaces
      .replace(/\b(resume|cv|curriculum|vitae|r)\b/gi, '')  // strip common suffixes
      .replace(/\s{2,}/g, ' ')
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'Uploaded Candidate'
  }

  // Client-Side PDF Text Extractor
  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target?.result as ArrayBuffer)
        try {
          let pdfjsLib = (window as any)['pdfjs-dist/build/pdf']
          if (!pdfjsLib) {
            setPdfStatusMessage('Loading PDF parser...')
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js'
            script.onload = async () => {
              const loadedLib = (window as any)['pdfjs-dist/build/pdf']
              loadedLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
              resolve(parsePdfBytes(loadedLib, typedarray))
            }
            script.onerror = () => reject(new Error('Failed to load PDF worker from CDN.'))
            document.head.appendChild(script)
          } else {
            resolve(parsePdfBytes(pdfjsLib, typedarray))
          }
        } catch (err) {
          reject(err)
        }
      }
      fileReader.onerror = (err) => reject(err)
      fileReader.readAsArrayBuffer(file)
    })
  }

  const parsePdfBytes = async (pdfjsLib: any, bytes: Uint8Array): Promise<string> => {
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
    const pageTexts: string[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      setPdfStatusMessage(`Parsing page ${pageNum} of ${pdf.numPages}…`)
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      type TextItem = {
        str: string
        transform: number[]  // [a, b, c, d, x, y] — x=transform[4], y=transform[5]
        height: number
        width: number
        hasEOL?: boolean
      }

      // Filter to real text items only (pdfjs can emit markedContent objects with no str)
      const items = textContent.items.filter((it: any) => typeof it.str === 'string') as TextItem[]
      if (items.length === 0) continue

      // Group items into visual lines by Y coordinate.
      // PDF Y-axis: 0 = bottom, increases upward → descending Y = reading order top-to-bottom.
      const Y_TOLERANCE = 3  // pts — items within this range share a line

      type Line = { y: number; maxHeight: number; items: TextItem[] }
      const lines: Line[] = []

      // Pre-sort: top-to-bottom (desc Y), then left-to-right (asc X) so grouping is stable
      const sorted = [...items].sort((a, b) => {
        const dy = b.transform[5] - a.transform[5]
        if (Math.abs(dy) > Y_TOLERANCE) return dy
        return a.transform[4] - b.transform[4]
      })

      for (const item of sorted) {
        if (!item.str) continue
        const y = item.transform[5]
        const existing = lines.find(l => Math.abs(l.y - y) <= Y_TOLERANCE)
        if (existing) {
          existing.items.push(item)
          existing.maxHeight = Math.max(existing.maxHeight, item.height || 10)
        } else {
          lines.push({ y, maxHeight: item.height || 10, items: [item] })
        }
      }

      // Ensure lines are top-to-bottom and items within each line are left-to-right
      lines.sort((a, b) => b.y - a.y)
      lines.forEach(l => l.items.sort((a, b) => a.transform[4] - b.transform[4]))

      let pageText = ''
      let prevY: number | null = null
      let prevMaxHeight = 12

      for (const line of lines) {
        // Decide separator from previous line based on vertical gap
        if (prevY !== null) {
          const yGap = prevY - line.y                      // positive = downward movement
          const normalized = yGap / (prevMaxHeight || 12)  // gap in units of line height

          // Gap > ~1.8 line-heights = section/paragraph break
          pageText += normalized > 1.8 ? '\n\n' : '\n'
        }

        // Reconstruct line text, inserting spaces/tabs based on horizontal gaps
        let lineStr = ''
        let prevEndX = 0

        for (const item of line.items) {
          const x = item.transform[4]

          if (lineStr.length > 0) {
            const gap = x - prevEndX
            if (gap > 30) lineStr += '\t'       // column-level gap (e.g., two-column resume)
            else if (gap > 1) lineStr += ' '    // word-level gap
          }

          lineStr += item.str
          prevEndX = x + (item.width || 0)

          // hasEOL: some PDFs explicitly mark line ends; treat as a space to avoid merging words
          if (item.hasEOL) lineStr += ' '
        }

        const trimmed = lineStr.trim()
        if (trimmed) {
          pageText += trimmed
          prevY = line.y
          prevMaxHeight = line.maxHeight
        }
      }

      if (pageText.trim()) pageTexts.push(pageText.trim())
    }

    if (pageTexts.length === 0) {
      throw new Error(
        'No text layer found in this PDF. It may be a scanned image — try copying the text manually.'
      )
    }

    // Join pages with a clear break so section headings near page boundaries aren't merged
    return pageTexts.join('\n\n')
  }

  const handlePdfExtract = async (file: File) => {
    setIsPdfParsing(true)
    setPdfStatusMessage('Reading PDF file…')
    setError('')
    try {
      const extractedText = await extractTextFromPdf(file)
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Extracted text is too short. PDF may be image-only — copy text manually.')
      }
      setResumeInput(extractedText)
      setPdfStatusMessage(`Extracted ${extractedText.length.toLocaleString()} chars across ${extractedText.split('\n').length} lines`)
      setPdfFile(file)
    } catch (err: any) {
      setError(`PDF Extraction failed: ${err.message}`)
    } finally {
      setIsPdfParsing(false)
    }
  }

  const runScan = async () => {
    if (!resumeInput.trim()) {
      setError('Please paste some resume text first.')
      return
    }

    setLoading(true)
    setError('')
    setReport(null)

    // Build prompts from the vendored hiring-agent templates
    const userPrompt = criteriaTemplate.replace('{{ text_content }}', resumeInput)
    const systemMsg = systemMsgTemplate

    const parseAtsResponse = (text: string): EvaluationReport => {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleaned) as Record<string, any>
      // Hiring-agent format: has `scores` dict, no `overallScore`
      if (parsed.scores && !parsed.overallScore) {
        return transformHiringAgentResponse(parsed)
      }
      // Legacy / server-transformed format
      if (!parsed.overallScore || !parsed.categories) {
        throw new Error('Response did not match expected schema.')
      }
      return parsed as EvaluationReport
    }

    const runOllamaScan = async (): Promise<EvaluationReport> => {
      let model = ollamaModel
      try {
        const tags = await fetch(`${ollamaUrl}/api/tags`)
        if (tags.ok) {
          const { models } = await tags.json()
          if (Array.isArray(models) && models.length > 0) model = models[0].name
        }
      } catch { /* keep configured model */ }

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: `${systemMsg}\n\n${userPrompt}`, stream: false, options: { temperature: 0.1 } })
      })
      if (!response.ok) {
        throw new Error(`Ollama unavailable at ${ollamaUrl} — ensure it is running with at least one model pulled.`)
      }
      const resJson = await response.json()
      return parseAtsResponse(resJson.response)
    }

    const tryOllamaFallback = async (primaryErr: string) => {
      setError(`Primary provider failed (${primaryErr}) — trying local Ollama…`)
      try {
        const data = await runOllamaScan()
        setReport(data)
        setUploadedReport(data)
        setCandidateName(nameFromFile(pdfFile))
        saveToHistory(data, pdfFile)
        setError('')
      } catch (ollamaErr: any) {
        setError(`Evaluation failed: ${primaryErr} | Ollama fallback: ${ollamaErr.message}`)
      }
    }

    try {
      if (provider === 'ollama') {
        const data = await runOllamaScan()
        setReport(data)
        setUploadedReport(data)
        setCandidateName(nameFromFile(pdfFile))
        saveToHistory(data, pdfFile)
        return
      }

      if (customKey && provider === 'gemini') {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${customKey}`,
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
        if (!res.ok) {
          await tryOllamaFallback(`Gemini ${res.status}`)
          return
        }
        const result = await res.json()
        const data = parseAtsResponse(result.candidates[0].content.parts[0].text)
        setReport(data)
        setUploadedReport(data)
        setCandidateName(nameFromFile(pdfFile))
        saveToHistory(data, pdfFile)
        return
      }

      if (customKey && provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemMsg },
              { role: 'user', content: userPrompt }
            ]
          })
        })
        if (!res.ok) {
          await tryOllamaFallback(`OpenAI ${res.status}`)
          return
        }
        const result = await res.json()
        const data = parseAtsResponse(result.choices[0].message.content)
        setReport(data)
        setUploadedReport(data)
        setCandidateName(nameFromFile(pdfFile))
        saveToHistory(data, pdfFile)
        return
      }

      // No custom key — proxy through serverless
      const response = await fetch('/api/ats-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumeInput, apiProvider: provider })
      })
      if (!response.ok) {
        const errText = await response.text()
        let errMsg = 'No API key configured. Add your key in Settings.'
        try { errMsg = JSON.parse(errText).error || errMsg } catch {}
        await tryOllamaFallback(errMsg)
        return
      }
      const data = await response.json() as EvaluationReport
      setReport(data)
      setUploadedReport(data)
      saveToHistory(data, pdfFile)

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
            Provide your own API Key or configure local Ollama. Stored locally in your browser.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'gemini' | 'openai' | 'ollama')}
                className="w-full text-xs rounded-lg glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="ollama">Ollama (Local Offline LLM)</option>
              </select>
            </div>
            {provider === 'ollama' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">Ollama URL</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full text-xs rounded-lg glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full text-xs rounded-lg glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">API Key</label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                  className="w-full text-xs rounded-lg glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
                />
              </div>
            )}
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

      {/* Gemini API Key Banner */}
      {!customKey && provider !== 'ollama' && (
        <div className="mt-4 flex items-start gap-3 p-4 glass-card border-l-4 border-l-amber-500">
          <FiKey className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-500">Gemini API Key Required for AI Features</p>
            <p className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5">
              No server-side key is configured. The Recruiter ATS Sandbox needs a free Gemini API Key to run.{' '}
              <button
                onClick={() => setShowSettings(true)}
                className="text-blue-500 dark:text-sky-400 underline cursor-pointer"
              >
                Add your key in Settings →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        
        {/* Left Side: Benchmark / Uploaded Candidate Report */}
        <div className="space-y-6">
          {(() => {
            const displayReport = uploadedReport ?? parthBenchmark
            const isUploadedView = uploadedReport !== null
            const accentClass = isUploadedView ? 'border-l-green-500' : 'border-l-blue-600 dark:border-l-sky-400'
            const scoreClass = isUploadedView ? 'text-green-500' : 'text-blue-600 dark:text-sky-400'
            const badgeClass = isUploadedView
              ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400'
            return (
              <>
                <div className={`glass-card p-6 border-l-4 ${accentClass}`}>
                  {/* Name + score row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <p className={`text-2xl font-extrabold leading-tight tracking-tight truncate ${scoreClass}`}>
                        {isUploadedView ? (candidateName ?? 'Uploaded Candidate') : 'Parth Nautiyal'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[0.6rem] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>
                          {isUploadedView ? 'ATS Scan Results' : 'Benchmark Score'}
                        </span>
                        {isUploadedView && (
                          <button
                            onClick={() => { setUploadedReport(null); setCandidateName(null) }}
                            className="text-[0.6rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer bg-transparent border-none whitespace-nowrap"
                          >
                            ← Reset to Parth
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end gap-0.5 shrink-0">
                      <span className={`text-4xl font-extrabold leading-none ${scoreClass}`}>
                        {displayReport.overallScore}
                      </span>
                      <span className="text-sm text-slate-400 mb-0.5">/100</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {displayReport.analysis}
                  </p>
                </div>

                {/* Bonus / Deductions summary */}
                {(displayReport.bonusPointsTotal !== undefined || displayReport.deductionsTotal !== undefined) && (
                  <div className="flex gap-3">
                    {displayReport.bonusPointsTotal !== undefined && displayReport.bonusPointsTotal > 0 && (
                      <div className="flex-1 glass-panel rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-extrabold text-green-500">+{displayReport.bonusPointsTotal}</p>
                        <p className="text-[0.6rem] text-slate-400 uppercase tracking-wider font-bold">Bonus pts</p>
                      </div>
                    )}
                    {displayReport.deductionsTotal !== undefined && displayReport.deductionsTotal > 0 && (
                      <div className="flex-1 glass-panel rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-extrabold text-amber-500">−{displayReport.deductionsTotal}</p>
                        <p className="text-[0.6rem] text-slate-400 uppercase tracking-wider font-bold">Deductions</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Key strengths + improvements */}
                {(displayReport.keyStrengths?.length || displayReport.areasForImprovement?.length) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {displayReport.keyStrengths && displayReport.keyStrengths.length > 0 && (
                      <div className="glass-card p-4 space-y-2">
                        <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-green-500 flex items-center gap-1">
                          <FiCheckCircle size={10} /> Key Strengths
                        </h3>
                        <ul className="space-y-1">
                          {displayReport.keyStrengths.map((s, i) => (
                            <li key={i} className="text-[0.7rem] text-slate-600 dark:text-slate-300 flex gap-1.5">
                              <span className="text-green-500 mt-0.5">✓</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {displayReport.areasForImprovement && displayReport.areasForImprovement.length > 0 && (
                      <div className="glass-card p-4 space-y-2">
                        <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                          <FiAlertTriangle size={10} /> To Improve
                        </h3>
                        <ul className="space-y-1">
                          {displayReport.areasForImprovement.map((s, i) => (
                            <li key={i} className="text-[0.7rem] text-slate-600 dark:text-slate-300 flex gap-1.5">
                              <span className="text-amber-500 mt-0.5">→</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category Breakdown</h3>
                  {displayReport.categories.map((cat, idx) => {
                    const maxPts = cat.max ?? 100
                    const pct = Math.round((cat.score / maxPts) * 100)
                    const barColor = isUploadedView ? 'bg-green-500' : 'bg-blue-500'
                    return (
                      <div key={idx} className="glass-card p-5">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <FiTerminal className={isUploadedView ? 'text-green-500' : 'text-blue-500'} size={14} />
                            {cat.name}
                          </h4>
                          <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded ${
                            isUploadedView
                              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20'
                              : 'text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/20'
                          }`}>
                            {cat.score}/{maxPts}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 mb-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="space-y-3">
                          {cat.evidence.length > 0 && (
                            <div>
                              <h5 className="text-[0.65rem] uppercase tracking-wider font-bold text-slate-400 mb-1">Evidence</h5>
                              <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                {cat.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
                              </ul>
                            </div>
                          )}

                          {cat.bonusPoints.length > 0 && (
                            <div>
                              <h5 className="text-[0.65rem] uppercase tracking-wider font-bold text-green-500 flex items-center gap-1 mb-1">
                                <FiCheckCircle size={10} /> Bonus
                              </h5>
                              <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                {cat.bonusPoints.map((bp, i) => <li key={i}>{bp}</li>)}
                              </ul>
                            </div>
                          )}

                          {cat.deductions.length > 0 && (
                            <div>
                              <h5 className="text-[0.65rem] uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1 mb-1">
                                <FiAlertTriangle size={10} /> Gaps
                              </h5>
                              <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                {cat.deductions.map((ded, i) => <li key={i}>{ded}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}
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

                {/* Drag and Drop PDF Zone */}
                <div className="space-y-2">
                  <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
                    Upload Resume (.PDF)
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setPdfDragActive(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      setPdfDragActive(false)
                    }}
                    onDrop={async (e) => {
                      e.preventDefault()
                      setPdfDragActive(false)
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        await handlePdfExtract(e.dataTransfer.files[0])
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${
                      pdfDragActive 
                        ? 'border-blue-500 bg-blue-500/5' 
                        : 'border-slate-200/60 dark:border-slate-800/60 hover:border-blue-500 dark:hover:border-sky-400 bg-slate-50/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          await handlePdfExtract(e.target.files[0])
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <FiUploadCloud className="text-slate-400 mb-2" size={24} />
                    {isPdfParsing ? (
                      <p className="text-xs text-blue-500 animate-pulse font-medium">{pdfStatusMessage}</p>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text)]">
                          Drag & drop resume PDF or click to browse
                        </p>
                        <p className="text-[0.65rem] text-slate-500 mt-0.5">
                          Extracted text will automatically populate the textarea below
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
                    Resume Plain Text
                  </label>
                  <textarea
                    value={resumeInput}
                    onChange={(e) => setResumeInput(e.target.value)}
                    placeholder="Paste plain text of the resume here..."
                    rows={10}
                    className="w-full text-xs rounded-xl glass-panel p-4 outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 border-none font-mono"
                  />
                </div>

                {error && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <FiAlertTriangle className="shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={() => setIsDiagnosticModalOpen(true)}
                      className="text-[0.65rem] font-semibold text-blue-500 dark:text-sky-400 hover:underline self-start mt-1 cursor-pointer bg-transparent border-none outline-none"
                    >
                      Need help? Open AI Diagnostic Setup Guides
                    </button>
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

              {/* History Log Card */}
              {history.length > 0 && (
                <div className="glass-card p-6 space-y-4 animate-fade-up">
                  <div className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FiClock /> Previous Evaluations Log
                    </h4>
                    <button
                      onClick={() => {
                        localStorage.removeItem('portfolio_ats_history')
                        setHistory([])
                      }}
                      className="text-[0.65rem] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                    >
                      <FiTrash2 size={10} /> Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setReport(item.report)
                          setUploadedReport(item.report)
                          setCandidateName(
                            item.resumeName && !item.resumeName.startsWith('"')
                              ? item.resumeName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
                              : item.resumeName ?? 'Uploaded Candidate'
                          )
                          setError('')
                        }}
                        className={`p-3 glass-panel rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors border ${
                          report?.overallScore === item.report.overallScore && report?.analysis === item.report.analysis
                            ? 'border-blue-500/50 bg-blue-500/5'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[var(--color-text-bright)] truncate">
                            {item.resumeName}
                          </p>
                          <p className="text-[0.6rem] text-slate-500 mt-0.5">
                            {item.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded ${
                            item.report.overallScore >= 80 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {item.report.overallScore}%
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const filtered = history.filter(h => h.id !== item.id)
                              setHistory(filtered)
                              localStorage.setItem('portfolio_ats_history', JSON.stringify(filtered))
                              if (report?.overallScore === item.report.overallScore && report?.analysis === item.report.analysis) {
                                setReport(null)
                              }
                            }}
                            className="p-1 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      <OllamaDiagnosticModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        currentOllamaUrl={ollamaUrl}
        currentOllamaModel={ollamaModel}
      />
    </section>
  )
}
