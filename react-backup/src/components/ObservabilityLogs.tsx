import { useState, useEffect, useRef } from 'react'
import { FiActivity, FiTerminal, FiPlay } from 'react-icons/fi'
import type { FailureState } from '../pages/SystemCockpitPage.tsx'

type Props = {
  failureState: FailureState
}

type LogLine = {
  timestamp: string
  service: string
  level: 'INFO' | 'WARN' | 'ERROR'
  traceId: string
  message: string
}

export default function ObservabilityLogs({ failureState }: Props) {
  const [logs, setLogs] = useState<LogLine[]>([
    {
      timestamp: new Date(Date.now() - 10000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'Running scripts/sync-resume.js: checking local workspace dependencies...'
    },
    {
      timestamp: new Date(Date.now() - 9000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'Successfully synchronized Parth_Nautiyal_Resume.pdf to public folder.'
    },
    {
      timestamp: new Date(Date.now() - 8000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'PDF text layer parsed (4321 characters found). Invoking LLM schema generator...'
    },
    {
      timestamp: new Date(Date.now() - 6000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'Gemini structured JSON output parsed successfully. Wrote content files to src/content/*.ts.'
    },
    {
      timestamp: new Date(Date.now() - 4000).toISOString(),
      service: 'visitor-client',
      level: 'INFO',
      traceId: 'client-init',
      message: 'React application bootstrapped. Auto dark-mode preference check complete.'
    },
    {
      timestamp: new Date(Date.now() - 3000).toISOString(),
      service: 'serverless-api',
      level: 'INFO',
      traceId: 'server-init',
      message: 'Vercel Serverless environment initialized. Route handler mappings complete.'
    }
  ])

  // Sparkline metrics state
  const [metrics, setMetrics] = useState({
    rps: [0, 0, 1, 0, 2, 0, 1, 0, 1, 1],
    latency: [98, 105, 112, 95, 120, 101, 108, 114, 97, 102],
    storage: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    tokens: [850, 850, 850, 850, 850, 850, 850, 850, 850, 850]
  })

  // Real browser performance vitals state
  const [vitals, setVitals] = useState({
    fcp: '0.45',
    lcp: '0.92',
    cls: '0.01',
    ttfb: '0.09'
  })

  const logsContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs])

  // Fetch actual performance vitals where supported
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        const paintEntries = performance.getEntriesByType('paint')
        const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint')
        const fcpVal = fcpEntry ? (fcpEntry.startTime / 1000).toFixed(2) : '0.45'

        const navEntries = performance.getEntriesByType('navigation')
        const navEntry = navEntries[0] as PerformanceNavigationTiming
        const ttfbVal = navEntry ? (navEntry.responseStart / 1000).toFixed(2) : '0.09'

        setVitals({
          fcp: fcpVal,
          lcp: (parseFloat(fcpVal) * 1.6).toFixed(2),
          cls: '0.01',
          ttfb: ttfbVal
        })
      } catch (e) {
        // Fallback to defaults
      }
    }
  }, [])

  // Calculate actual localStorage usage in KB
  const getLocalStorageSize = () => {
    if (typeof window === 'undefined') return 12
    try {
      let total = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length + key.length) * 2 // 2 bytes per UTF-16 character
        }
      }
      return Math.max(1, Math.round(total / 102.4) / 10) // Size in KB
    } catch (e) {
      return 12
    }
  }

  // Periodically generate metrics and logs
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStorageSize = getLocalStorageSize()

      setMetrics((prev) => {
        const updateArray = (arr: number[], min: number, max: number, failFactor = 1) => {
          const nextVal = Math.round((min + Math.random() * (max - min)) * failFactor)
          return [...arr.slice(1), Math.max(0, nextVal)]
        }

        let baseLatency = 100
        let latencyMultiplier = 1
        
        if (failureState.gatewayLatency) {
          baseLatency = 10000 // 10s latency
          latencyMultiplier = 1.05
        }

        const nextLatency = updateArray(prev.latency, baseLatency - 15, baseLatency + 20, latencyMultiplier)
        const nextRps = updateArray(prev.rps, 0, 3)
        const nextTokens = updateArray(prev.tokens, 800, 950)

        return {
          rps: nextRps,
          latency: nextLatency,
          storage: [...prev.storage.slice(1), currentStorageSize],
          tokens: nextTokens
        }
      })

      // Random background event logs
      if (Math.random() > 0.7) {
        const events = [
          { service: 'visitor-client', message: 'Visitor page view tracking successfully posted to Analytics.' },
          { service: 'serverless-api', message: 'GET /api/github - status: 200 OK (cache HIT at edge).' },
          { service: 'visitor-client', message: `Theme synchronization check completed. Mode active: ${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}` },
          { service: 'local-sync-cli', message: 'Cron verification: local resume sync hash is identical to Git repository. No recompilation needed.' }
        ]

        // Inject warning/error logs if failures are active
        if (failureState.geminiLimit && Math.random() > 0.4) {
          events.push({
            service: 'gemini-service',
            message: 'Google Gemini API quota limit warning: Server returned code 429 (Resource Exhausted).'
          })
        }
        if (failureState.gatewayLatency && Math.random() > 0.4) {
          events.push({
            service: 'serverless-api',
            message: 'Slow Execution Alert: serverless execution threshold exceeded (limit: 5000ms).'
          })
        }
        if (failureState.cloudMountOffline && Math.random() > 0.4) {
          events.push({
            service: 'local-sync-cli',
            message: 'iCloud Storage synchronization skipped: directory mount not found at "~/Library/Mobile Documents/com~apple~CloudDocs".'
          })
        }
        if (failureState.ollamaOffline && Math.random() > 0.4) {
          events.push({
            service: 'ollama-fallback',
            message: 'Failed to establish socket connection to localhost:11434 (Connection Refused).'
          })
        }

        const selectedEvent = events[Math.floor(Math.random() * events.length)]
        
        setLogs((prev) => [
          ...prev.slice(-90),
          {
            timestamp: new Date().toISOString(),
            service: selectedEvent.service,
            level: selectedEvent.message.toLowerCase().includes('error') || selectedEvent.message.toLowerCase().includes('refused')
              ? 'ERROR' 
              : selectedEvent.message.toLowerCase().includes('warning') || selectedEvent.message.toLowerCase().includes('skipped') || selectedEvent.message.toLowerCase().includes('slow')
              ? 'WARN' 
              : 'INFO',
            traceId: 'sys-pulse',
            message: selectedEvent.message
          }
        ])
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [failureState])

  // Sparkline path drawer
  const drawSparkline = (data: number[], width: number, height: number) => {
    if (data.length < 2) return ''
    const minVal = Math.min(...data)
    const maxVal = Math.max(...data, 1)
    const delta = maxVal - minVal || 1
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((val - minVal) / delta) * (height - 8) - 4
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  // Simulates a user query trace
  const triggerTransaction = () => {
    const id = 'tr-' + Math.random().toString(36).substring(2, 10)
    const time = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString()

    const newLogs: LogLine[] = []

    // 1. Client query
    newLogs.push({
      timestamp: time(0),
      service: 'visitor-client',
      level: 'INFO',
      traceId: id,
      message: 'POST /api/chat - query: "Tell me about Parth\'s skills and professional highlights."'
    })

    // 2. Gateway execution
    newLogs.push({
      timestamp: time(20),
      service: 'serverless-api',
      level: 'INFO',
      traceId: id,
      message: 'Serverless Handler: forwarding payload to Gemini with localized RAG context.'
    })

    if (failureState.gatewayLatency) {
      newLogs.push({
        timestamp: time(120),
        service: 'serverless-api',
        level: 'WARN',
        traceId: id,
        message: 'Network Gateway warning: connection speed throttled (Latency simulated at 10s).'
      })
    }

    // 3. Gemini / Ollama completion
    if (failureState.geminiLimit) {
      newLogs.push(
        {
          timestamp: time(150),
          service: 'gemini-service',
          level: 'ERROR',
          traceId: id,
          message: 'Gemini endpoint failed: HTTP/1.1 429 Rate Limit Exceeded.'
        },
        {
          timestamp: time(160),
          service: 'serverless-api',
          level: 'INFO',
          traceId: id,
          message: 'Active Redirection: switching routing parameters to Local Ollama Fallback (⑧)...'
        }
      )

      if (failureState.ollamaOffline) {
        newLogs.push(
          {
            timestamp: time(250),
            service: 'ollama-fallback',
            message: 'Failed to invoke Ollama offline API: Server at http://localhost:11434 is offline.',
            level: 'ERROR',
            traceId: id
          },
          {
            timestamp: time(260),
            service: 'serverless-api',
            message: 'All API routes exhausted. Retrieving static pre-compiled profile reply from static storage.',
            level: 'WARN',
            traceId: id
          }
        )
      } else {
        newLogs.push({
          timestamp: time(480),
          service: 'ollama-fallback',
          message: 'Ollama engine (llama3) successfully generated query context. Response stream parsed.',
          level: 'INFO',
          traceId: id
        })
      }
    } else {
      newLogs.push({
        timestamp: time(180),
        service: 'gemini-service',
        level: 'INFO',
        traceId: id,
        message: 'Google Gemini 2.5 Flash response compiled successfully (tokens processed: 1184).'
      })
    }

    // 4. Return response
    newLogs.push({
      timestamp: time(failureState.gatewayLatency ? 10050 : 250),
      service: 'serverless-api',
      level: 'INFO',
      traceId: id,
      message: `POST /api/chat - response 200 OK (${failureState.gatewayLatency ? '10045ms' : '230ms'})`
    })

    newLogs.push({
      timestamp: time(failureState.gatewayLatency ? 10070 : 270),
      service: 'visitor-client',
      level: 'INFO',
      traceId: id,
      message: 'Chat Console: successfully rendered markdown response layout.'
    })

    setLogs((prev) => [...prev, ...newLogs])
  }

  const latestVal = (arr: number[]) => arr[arr.length - 1]

  return (
    <div className="grid gap-6">
      {/* Performance Vitals Card row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FCP */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">First Content Paint (FCP)</div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {vitals.fcp} <span className="text-[0.65rem] font-medium text-slate-500">s</span>
          </div>
          <span className="text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 w-max mt-2">
            Excellent
          </span>
        </div>

        {/* LCP */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">Largest Paint (LCP)</div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {vitals.lcp} <span className="text-[0.65rem] font-medium text-slate-500">s</span>
          </div>
          <span className="text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 w-max mt-2">
            Optimized
          </span>
        </div>

        {/* CLS */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">Layout Shift (CLS)</div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {vitals.cls}
          </div>
          <span className="text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 w-max mt-2">
            Stable
          </span>
        </div>

        {/* TTFB */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <div className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">Server TTFB</div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {vitals.ttfb} <span className="text-[0.65rem] font-medium text-slate-500">s</span>
          </div>
          <span className="text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 w-max mt-2">
            Edge Fast
          </span>
        </div>
      </div>

      {/* Metrics Sparkline Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Request Rate */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>Serverless API RPS</span>
            <FiActivity className="text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">
              {latestVal(metrics.rps)} <span className="text-[0.65rem] font-medium text-slate-500">req/s</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className="w-full h-full stroke-blue-500" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.rps, 200, 40)}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 2: Latency */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>Serverless Latency</span>
            <FiActivity className="text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-black ${
              failureState.gatewayLatency ? 'text-amber-500' : 'text-green-500'
            }`}>
              {latestVal(metrics.latency)} <span className="text-[0.65rem] font-medium text-slate-500">ms</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className={`w-full h-full ${
              failureState.gatewayLatency ? 'stroke-amber-500' : 'stroke-green-500'
            }`} viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.latency, 200, 40)}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 3: Storage */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>LocalStorage Used</span>
            <FiActivity className="text-teal-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">
              {latestVal(metrics.storage)} <span className="text-[0.65rem] font-medium text-slate-500">KB</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className="w-full h-full stroke-teal-500" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.storage, 200, 40)}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 4: Session Tokens */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-[0.62rem] font-bold text-slate-500 uppercase tracking-wider">
            <span>Active Session Tokens</span>
            <FiActivity className="text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">
              {latestVal(metrics.tokens)} <span className="text-[0.65rem] font-medium text-slate-500">tkn</span>
            </span>
          </div>
          <div className="h-10 pt-1">
            <svg className="w-full h-full stroke-purple-500" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                d={drawSparkline(metrics.tokens, 200, 40)}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Log Console Frame */}
      <div className="glass-card p-4 space-y-3 flex flex-col h-[380px]">
        <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-800/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-green-500/10 text-green-500">
              <FiTerminal size={14} />
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Real-Time Routing & Telemetry Stream Logs</span>
          </div>
          
          <button
            onClick={triggerTransaction}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg btn-gradient text-[0.65rem] font-bold shadow transition-transform active:scale-95 cursor-pointer"
          >
            <FiPlay size={10} /> Simulate API Chat Trace
          </button>
        </div>

        {/* Logs viewport */}
        <div 
          ref={logsContainerRef}
          className="flex-1 overflow-y-auto font-mono text-[0.6rem] space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850 text-slate-300 select-text leading-relaxed scrollbar"
        >
          {logs.map((log, idx) => (
            <div key={idx} className="hover:bg-slate-900/60 py-0.5 rounded px-1 flex gap-2">
              <span className="text-slate-500 shrink-0 select-none">[{log.timestamp.split('T')[1].slice(0, 12)}]</span>
              <span className={`font-semibold shrink-0 select-none ${
                log.service === 'visitor-client' ? 'text-teal-400' :
                log.service === 'serverless-api' ? 'text-blue-400' :
                log.service === 'gemini-service' ? 'text-indigo-400' :
                log.service === 'ollama-fallback' ? 'text-purple-400' : 'text-amber-400'
              }`}>
                {log.service.padEnd(16)}
              </span>
              <span className={`font-bold shrink-0 select-none ${
                log.level === 'ERROR' ? 'text-red-500' : log.level === 'WARN' ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {log.level.padEnd(5)}
              </span>
              <span className="text-slate-500 font-semibold shrink-0 select-none">{log.traceId}</span>
              <span className="text-slate-100 flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
