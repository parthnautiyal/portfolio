import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiX, FiCheck, FiCpu, FiServer, FiAlertTriangle, FiBookOpen, FiTerminal } from 'react-icons/fi'

interface OllamaDiagnosticModalProps {
  isOpen: boolean
  onClose: () => void
  currentOllamaUrl?: string
  currentOllamaModel?: string
}

export default function OllamaDiagnosticModal({
  isOpen,
  onClose,
  currentOllamaUrl = 'http://localhost:11434',
  currentOllamaModel = 'llama3',
}: OllamaDiagnosticModalProps) {
  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>('cloud')
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'connected' | 'failed'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      testConnection()
    }
  }, [isOpen])

  const testConnection = async () => {
    setPingStatus('checking')
    setErrorMessage('')
    setAvailableModels([])
    
    try {
      // 1. Fetch tags to check connectivity and models
      const response = await fetch(`${currentOllamaUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }
      
      const data = await response.json()
      const models = data.models ? data.models.map((m: any) => m.name) : []
      setAvailableModels(models)
      setPingStatus('connected')
    } catch (err: any) {
      setPingStatus('failed')
      setErrorMessage(
        err.message === 'Failed to fetch'
          ? 'Could not connect. This usually means Ollama is not running, or CORS origins are not configured.'
          : err.message
      )
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--bg-main)] rounded-2xl shadow-2xl border border-slate-200/20 dark:border-slate-800/30 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-2">
            <FiCpu className="text-blue-500" size={20} />
            <h2 className="text-lg font-bold text-[var(--color-text-bright)]">AI Connection Status & Setup</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Diagnostic Checker bar */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200/40 dark:border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`inline-block h-3.5 w-3.5 rounded-full shrink-0 ${
              pingStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              pingStatus === 'checking' ? 'bg-amber-500 animate-spin border border-dashed border-white' :
              pingStatus === 'failed' ? 'bg-rose-500' : 'bg-slate-400'
            }`} />
            <div>
              <p className="text-xs font-bold text-[var(--color-text-bright)] uppercase tracking-wider">
                Local Ollama Status
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {pingStatus === 'checking' && 'Testing localhost connection...'}
                {pingStatus === 'connected' && `Online · Connected to ${currentOllamaUrl}`}
                {pingStatus === 'failed' && 'Offline / CORS Blocked'}
                {pingStatus === 'idle' && 'Not tested yet'}
              </p>
            </div>
          </div>
          
          <button
            onClick={testConnection}
            disabled={pingStatus === 'checking'}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            {pingStatus === 'checking' ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'cloud'
                ? 'border-blue-500 text-blue-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Option 1: Google Gemini (Cloud)
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'local'
                ? 'border-blue-500 text-blue-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Option 2: Local Ollama (Offline)
          </button>
        </div>

        {/* Instructions Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          
          {activeTab === 'cloud' && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-bright)] flex items-center gap-1.5 mb-1.5">
                  <FiBookOpen className="text-blue-500" size={14} />
                  Google Gemini Setup (No Install Required)
                </h3>
                <p>
                  The easiest way to run the recruiter sandbox and chatbot features is to provide a Gemini API Key. Google provides a generous free tier for developers and testers.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 font-bold text-[0.65rem]">1</span>
                  <p>
                    Go to <strong><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-sky-400 hover:underline">Google AI Studio</a></strong> and sign in with your Google account.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 font-bold text-[0.65rem]">2</span>
                  <p>
                    Click <strong>Create API Key</strong>, copy the generated key string (starts with <code>AIzaSy</code>).
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 font-bold text-[0.65rem]">3</span>
                  <p>
                    Open the <strong>Developer API Settings panel</strong> (gear icon in ATS Checker page header or Settings menu) and paste your key. It is stored securely in your browser's local storage and never sent to any server.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-bright)] flex items-center gap-1.5 mb-1.5">
                  <FiServer className="text-blue-500" size={14} />
                  Running Local Ollama (100% Offline & Private)
                </h3>
                <p>
                  To run evaluations locally without transmitting data, you can connect directly to Ollama running on your desktop.
                </p>
              </div>

              {pingStatus === 'failed' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2">
                  <FiAlertTriangle className="mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[0.7rem] uppercase tracking-wider font-bold">Connection Check Failed</strong>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {pingStatus === 'connected' && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-start gap-2">
                  <FiCheck className="mt-0.5 shrink-0" size={16} />
                  <div>
                    <strong className="block text-[0.7rem] uppercase tracking-wider font-bold">Successfully Connected!</strong>
                    <p className="mt-0.5">
                      Detected available local models: <code className="bg-slate-900 px-1 py-0.5 rounded text-[var(--color-text-bright)]">{availableModels.join(', ') || 'none'}</code>.
                      {availableModels.includes(currentOllamaModel) ? (
                        <span> Selected model "{currentOllamaModel}" is ready to serve queries.</span>
                      ) : (
                        <span className="text-amber-500 font-semibold"> Warning: Target model "{currentOllamaModel}" is not in list of pulled models. Run <code>ollama pull {currentOllamaModel}</code>.</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-[var(--color-text-bright)] flex items-center gap-1">
                    <FiTerminal size={12} className="text-blue-500" />
                    Step 1: Install Ollama
                  </h4>
                  <p className="mt-0.5 text-slate-500">
                    Download and install the app from <strong><a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-sky-400 hover:underline">ollama.com</a></strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[var(--color-text-bright)] flex items-center gap-1">
                    <FiTerminal size={12} className="text-blue-500" />
                    Step 2: Enable Browser CORS Origins (Crucial)
                  </h4>
                  <p className="mt-0.5 text-slate-500">
                    For websites to securely query your local server, you must enable CORS origins in Ollama's configuration environment:
                  </p>
                  
                  {/* OS Specific instructions */}
                  <div className="mt-2 space-y-2 border-l-2 border-slate-200/50 dark:border-slate-800/50 pl-3">
                    <div>
                      <span className="font-bold text-[var(--color-text-bright)]">macOS Terminal:</span>
                      <pre className="mt-1 p-2 rounded bg-slate-950 text-green-400 font-mono text-[0.65rem] overflow-x-auto">
                        OLLAMA_ORIGINS="*" ollama serve
                      </pre>
                      <p className="text-[0.65rem] text-slate-500 mt-1">
                        (Close any running GUI Ollama application from the top bar before executing this command)
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-[var(--color-text-bright)]">Windows Powershell:</span>
                      <pre className="mt-1 p-2 rounded bg-slate-950 text-green-400 font-mono text-[0.65rem] overflow-x-auto">
                        $env:OLLAMA_ORIGINS="*"&#10;ollama serve
                      </pre>
                    </div>

                    <div>
                      <span className="font-bold text-[var(--color-text-bright)]">Linux Systemd:</span>
                      <p className="mt-0.5 text-slate-500">
                        Run <code>sudo systemctl edit ollama.service</code> and insert under <code>[Service]</code>:
                      </p>
                      <pre className="mt-1 p-2 rounded bg-slate-950 text-green-400 font-mono text-[0.65rem]">
                        Environment="OLLAMA_ORIGINS=*"
                      </pre>
                      <p className="text-[0.65rem] text-slate-500 mt-1">
                        Then restart: <code>sudo systemctl daemon-reload && sudo systemctl restart ollama</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[var(--color-text-bright)] flex items-center gap-1">
                    <FiTerminal size={12} className="text-blue-500" />
                    Step 3: Pull the Model
                  </h4>
                  <p className="mt-0.5 text-slate-500">
                    Pull your desired model (defaults to <code>{currentOllamaModel}</code>) in your terminal:
                  </p>
                  <pre className="mt-1 p-2 rounded bg-slate-950 text-green-400 font-mono text-[0.65rem]">
                    ollama pull {currentOllamaModel}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 font-bold hover:opacity-95 transition-opacity cursor-pointer text-xs"
          >
            Close Dialog
          </button>
        </div>
        </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
