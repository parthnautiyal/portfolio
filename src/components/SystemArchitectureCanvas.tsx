import { useState } from 'react'
import { FiHardDrive, FiCpu, FiGlobe, FiFolder, FiNavigation, FiCode, FiAlertCircle } from 'react-icons/fi'
import type { FailureState } from '../pages/SystemCockpitPage.tsx'

type SystemNode = {
  id: string
  label: string
  icon: any
  description: string
  tradeOffs: string
  pattern: string
  codeSnippet: string
  x: number
  y: number
  isOffline?: boolean
  hasWarning?: boolean
}

type Props = {
  failureState: FailureState
}

export default function SystemArchitectureCanvas({ failureState }: Props) {
  const [selectedNode, setSelectedNode] = useState<string>('sync-script')
  const [showCode, setShowCode] = useState(false)

  const systemNodes: SystemNode[] = [
    {
      id: 'resume-pdf',
      label: '① Resume PDF (Local)',
      icon: FiHardDrive,
      description: "Parth's primary credentials file (Parth_Nautiyal_Resume.pdf) edited on his local machine. Any updates to his professional history begin here.",
      tradeOffs: 'Allows keeping a clean offline master resume document; requires compilation/parsing to update the live website.',
      pattern: 'Single Source of Truth (SSOT)',
      codeSnippet: 'Parth_Nautiyal_Resume.pdf (Binary PDF file)',
      x: 150,
      y: 70
    },
    {
      id: 'sync-script',
      label: '② Sync Script (Node CLI)',
      icon: FiCode,
      description: 'A Node.js build-time CLI script (scripts/sync-resume.js) run locally. Copies the PDF to iCloud/GDrive and calls Gemini (or local Ollama) to output JSON content.',
      tradeOffs: 'Shifts parsing overhead to build-time, achieving zero server runtime load; requires manual or file-watch triggering.',
      pattern: 'Static Site Generation (SSG)',
      codeSnippet: 'node scripts/sync-resume.js\n\n// 1. Sync PDF to local CloudStorage folders\n// 2. Extract PDF text layer\n// 3. Request Gemini API to parse to structured JSON\n// 4. Overwrite local src/content/*.ts',
      x: 150,
      y: 200
    },
    {
      id: 'icloud-gdrive',
      label: '③ iCloud & GDrive',
      icon: FiFolder,
      description: 'Local macOS cloud storage mounts. Automatically backs up the resume to iCloud and Google Drive paths natively upon script execution.',
      tradeOffs: 'Zero-config automated cloud backups; requires Mac environment with both iCloud & Drive accounts signed in.',
      pattern: 'File Sync Pipeline',
      codeSnippet: 'const ICLOUD = \'~/Library/Mobile Documents/com~apple~CloudDocs/Resume\'\nconst GDRIVE = \'~/Library/CloudStorage/GoogleDrive-user/My Drive/Resume\'\n\nfs.copyFileSync(PDF_PATH, path.join(ICLOUD, \'resume.pdf\'))',
      x: 380,
      y: 70,
      isOffline: failureState.cloudMountOffline
    },
    {
      id: 'vercel-cdn',
      label: '④ Vercel CDN',
      icon: FiGlobe,
      description: 'Hosts the statically compiled React/Vite application globally. Provides ultra-low latency edge delivery, high SEO speed ratings, and near 100% availability.',
      tradeOffs: 'Extreme speed and scale; updates require a static build trigger (automated via GitHub Webhook on commit pushes).',
      pattern: 'Edge Cache Distribution',
      codeSnippet: 'git push origin main\n// Triggers Vercel CI/CD Webhook\n// Compiles and deploys production static assets',
      x: 380,
      y: 200
    },
    {
      id: 'visitor-browser',
      label: '⑤ Visitor Browser',
      icon: FiNavigation,
      description: 'Renders the glassmorphic React site. Serves interactive content, computes layouts, toggles themes, and manages local storage keys.',
      tradeOffs: 'Instant user interactions; performance depends on client-side CPU/GPU resources.',
      pattern: 'Client-Side Rendering (CSR)',
      codeSnippet: 'const activeTheme = localStorage.getItem(\'theme\')\n// Client-side routing and DOM updates',
      x: 610,
      y: 200
    },
    {
      id: 'vercel-api',
      label: '⑥ Serverless Functions',
      icon: FiCpu,
      description: 'Vercel serverless proxy endpoints (api/chat.js, api/job-match.js) acting as a secure gateway to forward client requests to LLM APIs, keeping credentials secure.',
      tradeOffs: 'Secures credentials and prevents client CORS issues; subject to serverless function cold starts.',
      pattern: 'Serverless Gateway Proxy',
      codeSnippet: 'export default async function handler(req, res) {\n  // Safe proxy endpoint hiding environment keys\n  const reply = await callGeminiAPI(req.body);\n  res.status(200).json(reply);\n}',
      x: 380,
      y: 330,
      hasWarning: failureState.gatewayLatency
    },
    {
      id: 'gemini-api',
      label: '⑦ Google Gemini API',
      icon: FiCpu,
      description: 'The primary external LLM provider. Generates responses for the Chatbot and performs ATS Job Matching comparisons based on Parth\'s resume.',
      tradeOffs: 'High speed, large context window, and accurate reasoning; requires internet connectivity and is subject to rate/quota limits.',
      pattern: 'External LLM Gateway',
      codeSnippet: 'const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\nconst model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });',
      x: 610,
      y: 330,
      isOffline: failureState.geminiLimit
    },
    {
      id: 'ollama-local',
      label: '⑧ Local Ollama Fallback',
      icon: FiCpu,
      description: 'A locally running Ollama server on Parth\'s development machine. Acts as a fully offline fallback to parse/generate text during local sync and local testing.',
      tradeOffs: 'Complete data privacy and offline capability; model inference speed is dependent on local GPU hardware.',
      pattern: 'Offline Local LLM',
      codeSnippet: 'const response = await fetch(\'http://localhost:11434/api/generate\', {\n  method: \'POST\',\n  body: JSON.stringify({ model: \'llama3\', prompt })\n})',
      x: 150,
      y: 330,
      isOffline: failureState.ollamaOffline
    }
  ]

  const activeNode = systemNodes.find(n => n.id === selectedNode) || systemNodes[1]

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <FiCode className="text-blue-500" />
          Interactive System Architecture
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Click on any node in the interactive flowchart below to inspect details, trade-offs, design patterns, and code snippets.
        </p>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="overflow-x-auto rounded-xl glass-panel p-4 bg-slate-50/50 dark:bg-slate-950/20">
        <svg viewBox="0 0 760 400" className="w-[760px] mx-auto select-none">
          {/* Defs for gradients and markers */}
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400 dark:fill-slate-600" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-rose-500 dark:fill-rose-400" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500 dark:fill-amber-400" />
            </marker>
          </defs>

          {/* Connectors (Flow Paths) */}
          {/* PDF -> Sync Script (1 -> 2) */}
          <path
            d="M 150 95 L 150 175"
            fill="none"
            strokeWidth="2"
            strokeDasharray="4,4"
            className="stroke-slate-400 dark:stroke-slate-600"
            markerEnd="url(#arrow)"
          />

          {/* Sync Script -> iCloud / GDrive (2 -> 3) */}
          <path
            d="M 215 95 L 315 75"
            fill="none"
            strokeWidth="2"
            className={`transition-colors duration-300 ${
              failureState.cloudMountOffline
                ? 'stroke-rose-500 dark:stroke-rose-450 stroke-dashed animate-pulse'
                : 'stroke-slate-400 dark:stroke-slate-600'
            }`}
            markerEnd={failureState.cloudMountOffline ? 'url(#arrow-red)' : 'url(#arrow)'}
          />

          {/* Sync Script -> Vercel CDN (2 -> 4) */}
          <path
            d="M 215 200 L 315 200"
            fill="none"
            strokeWidth="2"
            className="stroke-slate-400 dark:stroke-slate-600"
            markerEnd="url(#arrow)"
          />

          {/* Vercel CDN -> Visitor Browser (4 -> 5) */}
          <path
            d="M 445 200 L 545 200"
            fill="none"
            strokeWidth="2"
            className="stroke-slate-400 dark:stroke-slate-600"
            markerEnd="url(#arrow)"
          />

          {/* Visitor Browser <-> Serverless Functions (5 -> 6) */}
          <path
            d="M 610 225 L 445 330"
            fill="none"
            strokeWidth="2"
            className={`transition-all duration-300 ${
              failureState.gatewayLatency
                ? 'stroke-amber-500 dark:stroke-amber-400 stroke-[3px] stroke-dashed animate-pulse'
                : 'stroke-slate-400 dark:stroke-slate-600'
            }`}
            markerEnd={failureState.gatewayLatency ? 'url(#arrow-amber)' : 'url(#arrow)'}
          />

          {/* Serverless Functions -> Gemini API (6 -> 7) */}
          <path
            d="M 445 330 L 545 330"
            fill="none"
            strokeWidth="2"
            className={`transition-colors duration-300 ${
              failureState.geminiLimit
                ? 'stroke-rose-500 dark:stroke-rose-450 stroke-dashed'
                : 'stroke-slate-400 dark:stroke-slate-600'
            }`}
            markerEnd={failureState.geminiLimit ? 'url(#arrow-red)' : 'url(#arrow)'}
          />

          {/* Serverless Functions -> Ollama Local Fallback (6 -> 8) */}
          <path
            d="M 315 330 L 215 330"
            fill="none"
            strokeWidth="2"
            className={`transition-all duration-300 ${
              failureState.geminiLimit && !failureState.ollamaOffline
                ? 'stroke-emerald-500 dark:stroke-emerald-450 stroke-[3px] animate-pulse'
                : failureState.ollamaOffline
                ? 'stroke-slate-300 dark:stroke-slate-800 stroke-dashed'
                : 'stroke-slate-400 dark:stroke-slate-600 stroke-dashed'
            }`}
            markerEnd={failureState.geminiLimit && !failureState.ollamaOffline ? 'url(#arrow)' : 'url(#arrow)'}
          />

          {/* Sync Script -> Ollama Local Fallback (2 -> 8) */}
          <path
            d="M 150 225 L 150 305"
            fill="none"
            strokeWidth="2"
            className={`transition-colors duration-300 ${
              failureState.ollamaOffline
                ? 'stroke-rose-500 dark:stroke-rose-450 stroke-dashed'
                : 'stroke-slate-400 dark:stroke-slate-600'
            }`}
            markerEnd={failureState.ollamaOffline ? 'url(#arrow-red)' : 'url(#arrow)'}
          />

          {/* Node Render Loop */}
          {systemNodes.map((node) => {
            const Icon = node.icon
            const isSelected = selectedNode === node.id
            
            // Determine background/border coloring
            let fillClass = 'fill-white dark:fill-slate-900'
            let strokeClass = 'stroke-slate-200 dark:stroke-slate-800'
            let textClass = 'fill-slate-800 dark:fill-slate-100'
            let subtextClass = 'fill-slate-500 dark:fill-slate-400'
            let iconBoxClass = 'fill-blue-500/10'
            let iconClass = 'text-blue-600 dark:text-blue-400'

            if (isSelected) {
              fillClass = 'fill-blue-600 dark:fill-blue-500/90'
              strokeClass = 'stroke-blue-700 dark:stroke-blue-400'
              textClass = 'fill-white'
              subtextClass = 'fill-blue-100'
              iconBoxClass = 'fill-white/20'
              iconClass = 'text-white'
            } else if (node.isOffline) {
              fillClass = 'fill-rose-500/5 dark:fill-rose-950/20'
              strokeClass = 'stroke-rose-500/40 dark:stroke-rose-500/40'
              iconBoxClass = 'fill-rose-500/10'
              iconClass = 'text-rose-500'
            } else if (node.hasWarning) {
              fillClass = 'fill-amber-500/5 dark:fill-amber-950/20'
              strokeClass = 'stroke-amber-500/50 dark:stroke-amber-500/40'
              iconBoxClass = 'fill-amber-500/10'
              iconClass = 'text-amber-500'
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x - 65}, ${node.y - 25})`}
                onClick={() => {
                  setSelectedNode(node.id)
                  setShowCode(false)
                }}
                className="cursor-pointer group"
              >
                {/* Node Box background */}
                <rect
                  width="130"
                  height="50"
                  rx="12"
                  className={`transition-all duration-300 group-hover:scale-[1.03] ${fillClass} ${strokeClass}`}
                  strokeWidth={isSelected ? '2' : '1.5'}
                />

                {/* Node Icon container */}
                <g transform="translate(10, 15)">
                  <rect width="20" height="20" rx="6" className={iconBoxClass} />
                  <foreignObject x="2" y="2" width="16" height="16">
                    <Icon size={16} className={iconClass} />
                  </foreignObject>
                </g>

                {/* Node Text */}
                <text
                  x="38"
                  y="26"
                  fontSize="8"
                  fontWeight="bold"
                  className={textClass}
                >
                  {node.label.split(' (')[0]}
                </text>
                <text
                  x="38"
                  y="36"
                  fontSize="6.5"
                  className={subtextClass}
                >
                  {node.label.includes('(') ? '(' + node.label.split(' (')[1] : ''}
                </text>

                {/* Status Badges */}
                {node.isOffline && (
                  <g transform="translate(118, 8)">
                    <circle r="5" className="fill-rose-500 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
                  </g>
                )}
                {node.hasWarning && (
                  <g transform="translate(118, 8)">
                    <circle r="5" className="fill-amber-500 stroke-white dark:stroke-slate-900 animate-pulse" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected Node Details */}
      <div className="glass-panel p-5 rounded-2xl space-y-4 animate-fade-up relative z-10">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
              Pattern: {activeNode.pattern}
            </span>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">{activeNode.label.substring(2)}</h4>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.65rem] font-semibold bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            <FiCode size={12} />
            {showCode ? 'Description' : 'Show Snippet'}
          </button>
        </div>

        <div className="text-xs">
          {!showCode ? (
            <div className="space-y-2">
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {activeNode.description}
              </p>
              {activeNode.isOffline && (
                <div className="flex items-center gap-1.5 text-rose-500 font-semibold mt-1">
                  <FiAlertCircle size={14} />
                  <span>Outage simulated: system has suspended normal operations for this component.</span>
                </div>
              )}
              {activeNode.hasWarning && (
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold mt-1">
                  <FiAlertCircle size={14} />
                  <span>Latency warning: performance is currently degraded.</span>
                </div>
              )}
              <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-2 text-[0.7rem] text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Architectural Trade-Off:</strong> {activeNode.tradeOffs}
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-[0.65rem] font-mono overflow-x-auto overflow-y-auto leading-relaxed max-h-[180px] w-full border border-slate-800">
              {activeNode.codeSnippet}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
