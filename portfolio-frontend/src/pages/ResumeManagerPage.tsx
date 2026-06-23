import { useState, useEffect } from 'react'
import { FiSliders, FiCheckCircle, FiFileText, FiCloud, FiInfo, FiKey } from 'react-icons/fi'

export default function ResumeManagerPage() {
  const [customKey, setCustomKey] = useState('')
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem('portfolio_custom_api_key') || ''
    const savedProvider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai') || 'gemini'
    setCustomKey(savedKey)
    setProvider(savedProvider)
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('portfolio_custom_api_key', customKey)
    localStorage.setItem('portfolio_api_provider', provider)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <section className="py-8 space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Resume Management Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure API credentials and run local automation scripts to sync your resume.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Side: Developer Key Configuration */}
        <form onSubmit={handleSave} className="glass-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FiKey className="text-blue-500" />
              Developer API Key Overrides
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If your backend serverless function reaches rate limits, paste your personal API keys below. The site will run checks directly from your browser, bypassing backend limits.
            </p>

            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">
                API Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'gemini' | 'openai')}
                className="w-full text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (ChatGPT)</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 mb-1">
                API Key Value
              </label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                className="w-full text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-2 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
            <FiCloud className="text-blue-500" />
            Local Cloud-Sync Automation
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Since your website runs on a secure, zero-server architecture, resume updates and file synchronization are handled locally on your Mac using a developer Node.js CLI script.
          </p>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2 p-3 glass-panel rounded-xl">
              <FiFileText className="text-blue-500 mt-0.5" size={14} />
              <div>
                <strong className="text-slate-800 dark:text-slate-100">Step 1: Replace PDF</strong>
                <p className="text-[0.65rem] text-slate-500 mt-0.5">
                  Overwite the file at the project root: <br />
                  <code className="text-blue-600 dark:text-sky-400 font-mono">./Parth_Nautiyal_Resume.pdf</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 glass-panel rounded-xl">
              <FiSliders className="text-blue-500 mt-0.5" size={14} />
              <div>
                <strong className="text-slate-800 dark:text-slate-100">Step 2: Run CLI Sync Tool</strong>
                <p className="text-[0.65rem] text-slate-500 mt-0.5">
                  In your terminal, execute the following command:
                  <pre className="mt-1 p-2 rounded bg-slate-950 text-green-400 font-mono text-[0.6rem] overflow-x-auto">
                    GEMINI_API_KEY=AIzaSy... npm run sync-resume
                  </pre>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 glass-panel rounded-xl">
              <FiInfo className="text-blue-500 mt-0.5" size={14} />
              <div>
                <strong className="text-slate-800 dark:text-slate-100">Step 3: What It Does</strong>
                <ul className="list-disc list-inside text-[0.65rem] text-slate-500 mt-1 space-y-0.5">
                  <li>Copies PDF to iCloud Drive folder</li>
                  <li>Copies PDF to Google Drive CloudStorage folder</li>
                  <li>Extracts PDF text & calls AI to parse it</li>
                  <li>Automatically updates website data files</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
