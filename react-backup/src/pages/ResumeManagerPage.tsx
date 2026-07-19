import { useState, useEffect } from 'react'
import { FiSliders, FiCheckCircle, FiFileText, FiCloud, FiInfo, FiKey, FiUploadCloud, FiAlertTriangle, FiRefreshCw, FiLock } from 'react-icons/fi'

// Set VITE_ADMIN_PIN in Vercel env vars to override. Defaults to 'parth'.
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'parth'

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const attempt = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      onUnlock()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <section className="py-24 flex flex-col items-center justify-center animate-fade-up">
      <div className="glass-card p-8 w-full max-w-sm space-y-5 text-center">
        <div className="flex justify-center">
          <span className="p-3 rounded-2xl bg-orange-500/10 dark:bg-indigo-500/10">
            <FiLock className="text-orange-600 dark:text-indigo-400" size={24} />
          </span>
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Admin Access</h2>
          <p className="text-xs text-slate-500 mt-1">Resume Manager is PIN-protected.</p>
        </div>
        <form onSubmit={attempt} className="space-y-3">
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter PIN"
            autoFocus
            className={`w-full glass-panel rounded-xl px-4 py-3 text-sm text-center tracking-[0.3em] outline-none border-none transition-all ${
              error ? 'ring-1 ring-rose-500/50' : 'focus:ring-1 focus:ring-orange-500/50 dark:focus:ring-indigo-500/50'
            }`}
          />
          {error && <p className="text-xs text-rose-500">Incorrect PIN.</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl btn-gradient text-xs font-semibold cursor-pointer"
          >
            Unlock
          </button>
        </form>
        <p className="text-[0.6rem] text-slate-400">
          Set <code className="font-mono">VITE_ADMIN_PIN</code> in Vercel env vars to change the PIN.
        </p>
      </div>
    </section>
  )
}

export default function ResumeManagerPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'ollama'>('gemini')
  const [isSaved, setIsSaved] = useState(false)

  // PDF Parser State
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [parsingStatus, setParsingStatus] = useState<'idle' | 'extracting' | 'calling_ai' | 'syncing' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('llama3')

  useEffect(() => {
    const savedKey = localStorage.getItem('portfolio_custom_api_key') || ''
    const savedProvider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai' | 'ollama') || 'gemini'
    const savedOllamaUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434'
    const savedOllamaModel = localStorage.getItem('portfolio_ollama_model') || 'llama3'
    
    setCustomKey(savedKey)
    setProvider(savedProvider)
    setOllamaUrl(savedOllamaUrl)
    setOllamaModel(savedOllamaModel)
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('portfolio_custom_api_key', customKey)
    localStorage.setItem('portfolio_api_provider', provider)
    localStorage.setItem('portfolio_ollama_url', ollamaUrl)
    localStorage.setItem('portfolio_ollama_model', ollamaModel)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  // Client-Side PDF Text Extractor
  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target?.result as ArrayBuffer)
        try {
          // Check if pdfjs-dist is loaded
          let pdfjsLib = (window as any)['pdfjs-dist/build/pdf']
          if (!pdfjsLib) {
            setStatusMessage('Loading PDF parsing library from CDN...')
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
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      setStatusMessage(`Extracting text from page ${i} of ${pdf.numPages}...`)
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      text += pageText + '\n'
    }
    return text
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0])
      setParsingStatus('idle')
      setStatusMessage('')
    }
  }

  const handleParseResume = async () => {
    if (!pdfFile) return

    setParsingStatus('extracting')
    setStatusMessage('Reading PDF file...')

    try {
      // 1. Extract raw text from PDF file in-browser
      const rawText = await extractTextFromPdf(pdfFile)
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Extracted text is empty. Make sure the PDF contains text layer, not scanned images.')
      }

      setParsingStatus('calling_ai')
      setStatusMessage('Sending text to LLM parser (this can take a few moments)...')

      // Prepare Prompt
      const systemPrompt = `
You are a highly precise resume parser. You will convert the provided raw resume text of Parth Nautiyal into structured JSON matching this exact schema:

{
  "personal": {
    "name": "Parth Nautiyal",
    "title": "Full-Stack Engineer",
    "summary": "Brief summary...",
    "email": "parthnautiyal2002@gmail.com",
    "github": "https://github.com/parthnautiyal",
    "linkedin": "https://www.linkedin.com/in/parth-nautiyal/",
    "leetcode": "https://leetcode.com/u/parth_nautiyal/",
    "resumeUrl": "/Parth_Nautiyal_Resume.pdf"
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "period": "Start - End",
      "bullets": [
        "Responsibility bullet 1",
        "Responsibility bullet 2"
      ]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree (e.g. B.Tech)",
      "field": "Field of Study (e.g. Computer Science)",
      "location": "City, Country",
      "period": "Start - End",
      "details": ["GPA/CGPA", "Activities/Honors"]
    }
  ],
  "skills": [
    {
      "name": "Skill Name (e.g. React)",
      "category": "frontend" | "backend" | "devops" | "tools"
    }
  ]
}

Ensure:
1. Every experience bullet is grammatical, professional, and reflects Parth's achievements.
2. Skills are categorized accurately:
   - "frontend": React, HTML, CSS, JavaScript, TypeScript, Angular, Tailwind, etc.
   - "backend": Java, Spring Boot, Microservices, Kafka, SQL, Databases, Temporal, etc.
   - "devops": Docker, Kubernetes, Jenkins, Ansible, AWS, CI/CD, Helm, Prometheus, Grafana, Datadog, etc.
   - "tools": Git, Linux, Maven, npm, postman, IntelliJ, Jira, etc.
3. Return ONLY a single valid JSON block. Do not wrap in markdown \`\`\`json tags. Do not write any conversational text.
`;

      let parsedData: any = null
      let jsonResponseText = ''

      if (provider === 'gemini') {
        const key = customKey || import.meta.env.VITE_GEMINI_API_KEY
        if (!key) {
          throw new Error('Google Gemini API Key is missing. Please save it in settings first.')
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nResume Text:\n${rawText}` }] }],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        })

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
        }

        const resJson = await response.json()
        jsonResponseText = resJson.candidates[0].content.parts[0].text
      } else if (provider === 'openai') {
        const key = customKey || import.meta.env.VITE_OPENAI_API_KEY
        if (!key) {
          throw new Error('OpenAI API Key is missing. Please save it in settings first.')
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are a precise JSON extractor.' },
              { role: 'user', content: `${systemPrompt}\n\nResume Text:\n${rawText}` }
            ]
          })
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
        }

        const resJson = await response.json()
        jsonResponseText = resJson.choices[0].message.content
      } else {
        // Local Ollama fallbacks
        setStatusMessage(`Contacting local Ollama instance at ${ollamaUrl} (model: ${ollamaModel})...`)
        const response = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: `${systemPrompt}\n\nResume Text:\n${rawText}`,
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
        jsonResponseText = resJson.response.replace(/```json/g, '').replace(/```/g, '').trim()
      }

      parsedData = JSON.parse(jsonResponseText.trim())
      
      // Validate schema minimally
      if (!parsedData.personal || !parsedData.experience) {
        throw new Error('LLM parsed output did not match schema format. Try again.')
      }

      setParsingStatus('syncing')
      setStatusMessage('Saving details and syncing local files...')

      // 2. Persist in browser LocalStorage (ensures immediate UI updates)
      localStorage.setItem('portfolio_resume_data', JSON.stringify(parsedData))
      localStorage.setItem('portfolio_resume_data_version', 'user-upload') // mark as user upload to prevent auto-eviction

      // 3. Write locally to disk via local serverless endpoint (if running locally)
      try {
        const syncResponse = await fetch('/api/update-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData)
        })
        const syncData = await syncResponse.json()
        console.log('Disk sync response:', syncData)
      } catch (err) {
        console.log('Static host mode detected: direct file-writing skipped. Data saved in browser storage.')
      }

      setParsingStatus('success')
      setStatusMessage('Resume parsed and refined successfully! The portfolio content has been updated.')
    } catch (err: any) {
      console.error(err)
      setParsingStatus('error')
      setStatusMessage(err.message || 'Parsing failed. Check your API credentials or local Ollama configuration.')
    }
  }

  const handleClearOverride = () => {
    localStorage.removeItem('portfolio_resume_data')
    localStorage.removeItem('portfolio_resume_data_version')
    window.location.reload()
  }

  const hasOverride = !!localStorage.getItem('portfolio_resume_data')

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />

  return (
    <section className="py-8 space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Resume Management Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure API credentials, parse PDF resumes, and run local automation synchronization.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Side: Developer Key Configuration */}
        <form onSubmit={handleSave} className="glass-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FiKey className="text-orange-500 dark:text-indigo-400" />
              Developer API Key Overrides
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paste your personal API keys below. The site will run checks directly from your browser, bypassing rate limits.
            </p>

            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">
                API Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
              >
                <option value="gemini">Google Gemini (Cloud)</option>
                <option value="openai">OpenAI (ChatGPT Cloud)</option>
                <option value="ollama">Ollama (Local Offline LLM)</option>
              </select>
            </div>

            {provider === 'ollama' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Ollama Server URL
                  </label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="llama3"
                    className="w-full text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  API Key Value
                </label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                  className="w-full text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-2.5 rounded-xl btn-gradient font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSaved ? (
              <>
                <FiCheckCircle />
                Credentials Saved!
              </>
            ) : (
              'Save Key Settings'
            )}
          </button>
        </form>

        {/* Right Side: Local CLI Script Documentation */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FiCloud className="text-orange-500 dark:text-indigo-400" />
            Local Cloud-Sync Automation
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Since your website runs on a secure, zero-server architecture, resume updates and file synchronization can also be handled locally via our node automation script.
          </p>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2 p-3 glass-panel rounded-xl">
              <FiFileText className="text-orange-500 dark:text-indigo-400 mt-0.5" size={14} />
              <div>
                <strong className="text-slate-800 dark:text-slate-100">Step 1: Replace PDF</strong>
                <p className="text-[0.65rem] text-slate-500 mt-0.5">
                  Overwrite the file at the project root: <br />
                  <code className="text-orange-600 dark:text-indigo-400 font-mono">./Parth_Nautiyal_Resume.pdf</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 glass-panel rounded-xl">
              <FiSliders className="text-orange-500 dark:text-indigo-400 mt-0.5" size={14} />
              <div>
                <strong className="text-slate-800 dark:text-slate-100">Step 2: Run CLI Sync Tool</strong>
                <p className="text-[0.65rem] text-slate-500 mt-0.5">
                  Run locally (falls back to local Ollama if no keys):
                  <pre className="mt-1 p-2 rounded bg-slate-950 text-green-400 font-mono text-[0.6rem] overflow-x-auto">
                    npm run sync-resume
                  </pre>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Browser PDF Resume Parser Workspace */}
      <div className="glass-card p-6 space-y-6">
        <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FiSliders className="text-orange-500 dark:text-indigo-400" />
              In-Browser Resume Parser & Auto-Populator
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload a new resume PDF to parse the details and dynamically update all sections of the website.
            </p>
          </div>
          {hasOverride && (
            <button
              onClick={handleClearOverride}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors border border-rose-500/20 cursor-pointer"
              title="Reset website content to the statically compiled code"
            >
              <FiRefreshCw />
              Clear Override Data
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          {/* Upload Dropzone */}
          <div className="space-y-4">
            <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
              Select Resume File (.PDF)
            </label>
            <div className="border-2 border-dashed border-[var(--border-color)] hover:border-[var(--border-color-hover)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px] relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FiUploadCloud className="text-slate-400 mb-3" size={32} />
              {pdfFile ? (
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-bright)]">{pdfFile.name}</p>
                  <p className="text-[0.65rem] text-slate-500 mt-1">{(pdfFile.size / 1024).toFixed(1)} KB · Click to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text)]">Drag & drop resume PDF or click to browse</p>
                  <p className="text-[0.65rem] text-slate-500 mt-1">Files should be standard text PDFs</p>
                </div>
              )}
            </div>

            <button
              onClick={handleParseResume}
              disabled={!pdfFile || parsingStatus === 'extracting' || parsingStatus === 'calling_ai' || parsingStatus === 'syncing'}
              className="w-full py-2.5 rounded-xl btn-gradient font-medium text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              {['extracting', 'calling_ai', 'syncing'].includes(parsingStatus) ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FiSliders />
                  Parse & Auto-Populate Website
                </>
              )}
            </button>
          </div>

          {/* Status Message Panel */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[220px]">
            <div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Parser Status Console
              </span>
              
              {parsingStatus === 'idle' && (
                <div className="text-xs text-slate-500 leading-relaxed space-y-2">
                  <p>Ready to parser. When you upload a resume PDF:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[0.65rem]">
                    <li>Text is extracted client-side from the PDF.</li>
                    <li>LLM processes text into structured portfolio content.</li>
                    <li>Website details will dynamically refresh instantly.</li>
                  </ul>
                </div>
              )}

              {['extracting', 'calling_ai', 'syncing'].includes(parsingStatus) && (
                <div className="space-y-3 animate-fade-up">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-indigo-400">
                    <FiRefreshCw className="animate-spin" />
                    Processing Resume
                  </div>
                  <p className="text-xs font-mono bg-slate-950 p-3 rounded-lg text-green-400 border border-slate-800">
                    &gt; {statusMessage}
                  </p>
                </div>
              )}

              {parsingStatus === 'success' && (
                <div className="space-y-3 animate-fade-up">
                  <div className="flex items-center gap-2 text-xs font-semibold text-green-500">
                    <FiCheckCircle size={16} />
                    Auto-Population Successful!
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {statusMessage}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-bold bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors border border-green-500/20 cursor-pointer mt-2"
                  >
                    <FiRefreshCw />
                    Reload to See Updates
                  </button>
                </div>
              )}

              {parsingStatus === 'error' && (
                <div className="space-y-3 animate-fade-up">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                    <FiAlertTriangle size={16} />
                    Parsing Failed
                  </div>
                  <p className="text-xs text-rose-500 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 font-mono">
                    {statusMessage}
                  </p>
                  <p className="text-[0.65rem] text-slate-500">
                    Make sure your local Ollama server is running (e.g. <code>ollama serve</code>) or check your API key settings.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-3 flex items-center gap-1.5 text-[0.6rem] text-slate-400">
              <FiInfo />
              <span>
                {provider === 'ollama' 
                  ? `Using Ollama Model "${ollamaModel}" locally` 
                  : `Using Cloud API Provider: ${provider}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
