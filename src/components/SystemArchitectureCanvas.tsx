import { useState } from 'react'
import { FiHardDrive, FiCpu, FiGlobe, FiFolder, FiNavigation, FiCode } from 'react-icons/fi'

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
}

const systemNodes: SystemNode[] = [
  {
    id: 'resume-pdf',
    label: 'Resume PDF (Local)',
    icon: FiHardDrive,
    description: 'The primary source of truth. Whenever Parth updates his credentials, he updates this local PDF file on his Mac.',
    tradeOffs: 'Maintains offline master document format; but requires compilation to update the web representation.',
    pattern: 'Single Source of Truth (SSOT)',
    codeSnippet: 'Parth_Nautiyal_Resume.pdf',
    x: 150,
    y: 80
  },
  {
    id: 'sync-script',
    label: 'Sync Script (Node CLI)',
    icon: FiCpu,
    description: 'A Node.js CLI script (scripts/sync-resume.js) run locally by the developer. It copies the resume PDF to iCloud/GDrive cloud directories, then re-generates src/content/*.ts files from PDF text via Gemini API so the site always reflects the latest resume data.',
    tradeOffs: 'Eliminates server overhead by shifting all compilation to build time (SSG); requires a one-time developer execution whenever the resume is updated.',
    pattern: 'Build-Time Pipeline (SSG)',
    codeSnippet: '# Run from project root after updating resume PDF:\nnode scripts/sync-resume.js\n\n# What it does:\n# 1. Copy PDF -> iCloud & Google Drive paths\n# 2. Extract text via pdf-parse\n# 3. Call Gemini API to generate structured JSON\n# 4. Overwrite src/content/*.ts with updated data',
    x: 150,
    y: 220
  },
  {
    id: 'icloud-gdrive',
    label: 'iCloud & GDrive',
    icon: FiFolder,
    description: 'Native macOS CloudStorage mount paths. The sync script copies the PDF here automatically — iCloud at ~/Library/Mobile Documents/com~apple~CloudDocs/ and Google Drive at ~/Google Drive/My Drive/. Both auto-sync to cloud on save, requiring zero external API keys.',
    tradeOffs: 'Zero-config cloud backup leveraging macOS folder mounts; requires Mac environment with both services signed in.',
    pattern: 'File System Sync (NIO)',
    codeSnippet: "const ICLOUD = path.join(os.homedir(),\n  'Library/Mobile Documents/com~apple~CloudDocs/Resume'\n)\nconst GDRIVE = path.join(os.homedir(), 'Google Drive/My Drive/Resume')\n\nfor (const dest of [ICLOUD, GDRIVE]) {\n  fs.mkdirSync(dest, { recursive: true })\n  fs.copyFileSync(PDF_PATH, path.join(dest, 'resume.pdf'))\n}",
    x: 380,
    y: 80
  },
  {
    id: 'vercel-cdn',
    label: 'Vercel CDN',
    icon: FiGlobe,
    description: 'Hosts the statically compiled React site globally. Delivers maximum speed, high SEO rating, and 99.99% uptime for $0/month.',
    tradeOffs: 'Provides extreme speed and durability; updates require a static redeploy (automated via GitHub Webhooks).',
    pattern: 'Jamstack CDN Distribution',
    codeSnippet: 'vercel deploy --prod\n// Global edge network distribution',
    x: 380,
    y: 220
  },
  {
    id: 'visitor-browser',
    label: 'Visitor Browser',
    icon: FiNavigation,
    description: "Renders the glassmorphic React site. Automatically computes auto dark mode based on the user's local hour and manages API keys in localStorage.",
    tradeOffs: 'Maximizes client-side performance; relies on the visitor\'s machine resources.',
    pattern: 'Client-Side Rendering (CSR)',
    codeSnippet: 'const hour = new Date().getHours();\nconst isNight = hour >= 18 || hour < 6;',
    x: 610,
    y: 220
  },
  {
    id: 'vercel-api',
    label: 'Serverless Functions',
    icon: FiCpu,
    description: 'Vercel Serverless proxy endpoints. Acts as a secure intermediary to hide Parth\'s Gemini API keys from the client.',
    tradeOffs: 'Secures credentials and handles CORS; subject to cold starts (minimized by lightweight Node.js runtimes).',
    pattern: 'Serverless Gateway Proxy',
    codeSnippet: 'export default async function handler(req, res) {\n  const res = await fetch("...gemini?key=" + process.env.GEMINI_KEY);\n}',
    x: 380,
    y: 360
  },
  {
    id: 'gemini-api',
    label: 'Google Gemini API',
    icon: FiCpu,
    description: 'AI backend running the resume analysis and chatbot response generation. Supports developer API key overrides.',
    tradeOffs: 'Highly accurate and fast (Gemini 2.5 Flash); requires internet access and handles API limits.',
    pattern: 'External LLM Gateway',
    codeSnippet: 'fetch("https://generativelanguage.googleapis.com/...key=" + key)',
    x: 610,
    y: 360
  }
]

export default function SystemArchitectureCanvas() {
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(systemNodes[1]) // Default to sync script
  const [showCode, setShowCode] = useState(false)

  const activeNode = selectedNode || systemNodes[1]

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
      <div className="overflow-x-auto rounded-xl glass-panel p-4">
        <svg viewBox="0 0 760 440" className="w-[760px] mx-auto select-none">
          {/* Defs for gradients and markers */}
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Connectors (Flow Paths) */}
          {/* PDF -> Sync Script */}
          <path d="M 150 120 L 150 190" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" markerEnd="url(#arrow)" />
          
          {/* Sync Script -> iCloud / GDrive */}
          <path d="M 195 210 L 320 90" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Sync Script -> Vercel CDN (updates build files) */}
          <path d="M 195 220 L 340 220" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Vercel CDN -> Visitor Browser */}
          <path d="M 425 220 L 570 220" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Visitor Browser <-> Vercel API (serverless calls) */}
          <path d="M 610 260 L 425 350" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Vercel API -> Gemini API */}
          <path d="M 425 365 L 570 365" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Direct Developer Key Browser Call -> Gemini API */}
          <path d="M 610 260 L 610 320" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3,3" markerEnd="url(#arrow)" />

          {/* Node Render Loop */}
          {systemNodes.map((node) => {
            const Icon = node.icon
            const isSelected = activeNode.id === node.id
            return (
              <g
                key={node.id}
                transform={`translate(${node.x - 45}, ${node.y - 25})`}
                onClick={() => {
                  setSelectedNode(node)
                  setShowCode(false)
                }}
                className="cursor-pointer"
              >
                {/* Node Box background */}
                <rect
                  width="130"
                  height="50"
                  rx="10"
                  fill={isSelected ? 'url(#blueGradient)' : 'light-dark(rgba(255,255,255,0.7), rgba(30,41,59,0.7))'}
                  stroke={isSelected ? '#2563eb' : 'light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.1))'}
                  strokeWidth={isSelected ? '2' : '1'}
                  className="transition-all duration-300 hover:scale-105"
                />
                {/* Node Icon */}
                <g transform="translate(10, 15)">
                  <rect width="20" height="20" rx="4" fill={isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.1)'} />
                  <foreignObject x="2" y="2" width="16" height="16">
                    <Icon size={16} className={isSelected ? 'text-white' : 'text-blue-500'} />
                  </foreignObject>
                </g>
                {/* Node Text */}
                <text
                  x="38"
                  y="28"
                  fontSize="8"
                  fontWeight="bold"
                  fill={isSelected ? '#ffffff' : 'light-dark(#1e293b, #f8fafc)'}
                >
                  {node.label.split(' (')[0]}
                </text>
                <text
                  x="38"
                  y="38"
                  fontSize="6"
                  fill={isSelected ? 'rgba(255,255,255,0.7)' : 'light-dark(#64748b, #94a3b8)'}
                >
                  {node.label.includes('(') ? '(' + node.label.split(' (')[1] : ''}
                </text>
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
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">{activeNode.label}</h4>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.65rem] font-semibold bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            <FiCode size={12} />
            {showCode ? 'Description' : 'Show Code'}
          </button>
        </div>

        <div className="text-xs">
          {!showCode ? (
            <div className="space-y-2">
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                {activeNode.description}
              </p>
              <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-2 text-[0.7rem] text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Architectural Trade-Off:</strong> {activeNode.tradeOffs}
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-slate-950 text-green-400 text-[0.65rem] font-mono overflow-x-auto overflow-y-auto leading-relaxed max-h-[180px] w-full">
              {activeNode.codeSnippet}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
