import { useState, useEffect, useRef } from 'react'
import { onLCP, onINP, onCLS } from 'web-vitals'
import SystemArchitectureCanvas from '../components/SystemArchitectureCanvas.tsx'
import { FiActivity, FiServer, FiClock, FiDatabase, FiZap } from 'react-icons/fi'

type CWVState = {
  lcp: number | null
  inp: number | null
  cls: number | null
}

function getPageLoadMs(): number | null {
  try {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (!nav || nav.loadEventEnd === 0) return null
    return Math.round(nav.loadEventEnd - nav.startTime)
  } catch {
    return null
  }
}

function getHeapMb(): number | null {
  try {
    const mem = (performance as any).memory
    if (!mem) return null
    return parseFloat((mem.usedJSHeapSize / 1048576).toFixed(1))
  } catch {
    return null
  }
}

function getResourceDurations(): number[] {
  try {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return entries
      .map(e => Math.round(e.duration))
      .filter(d => d > 0)
      .slice(-10)
  } catch {
    return []
  }
}

function formatSession(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec.toString().padStart(2, '0')}s` : `${s}s`
}

export default function PlaygroundPage() {
  const sessionStartRef = useRef(Date.now())
  const [pageLoadMs, setPageLoadMs] = useState<number | null>(null)
  const [assetCount, setAssetCount] = useState(0)
  const [heapMb, setHeapMb] = useState<number | null>(null)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [resourceDurations, setResourceDurations] = useState<number[]>([])
  const [cwv, setCwv] = useState<CWVState>({ lcp: null, inp: null, cls: null })

  useEffect(() => {
    onLCP((m) => setCwv((prev) => ({ ...prev, lcp: m.value })))
    onINP((m) => setCwv((prev) => ({ ...prev, inp: m.value })))
    onCLS((m) => setCwv((prev) => ({ ...prev, cls: m.value })))
  }, [])

  useEffect(() => {
    const readPerf = () => {
      setPageLoadMs(getPageLoadMs())
      setAssetCount(performance.getEntriesByType('resource').length)
      setHeapMb(getHeapMb())
      setResourceDurations(getResourceDurations())
    }

    if (document.readyState === 'complete') {
      readPerf()
    } else {
      window.addEventListener('load', readPerf, { once: true })
    }

    const interval = setInterval(() => {
      setSessionSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000))
      setHeapMb(getHeapMb())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const generateChartPath = (data: number[], width: number, height: number) => {
    if (data.length < 2) return ''
    const maxVal = Math.max(...data, 1)
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - (val / maxVal) * height
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  const loadColor = pageLoadMs === null ? 'text-slate-400' : pageLoadMs < 1000 ? 'text-green-500' : pageLoadMs < 2500 ? 'text-amber-500' : 'text-rose-500'
  const loadBadge = pageLoadMs === null
    ? { label: '—', cls: 'bg-slate-500/10 text-slate-400' }
    : pageLoadMs < 1000
      ? { label: 'Fast', cls: 'bg-green-500/10 text-green-500' }
      : pageLoadMs < 2500
        ? { label: 'Ok', cls: 'bg-amber-500/10 text-amber-500' }
        : { label: 'Slow', cls: 'bg-rose-500/10 text-rose-500' }

  const heapColor = heapMb === null ? 'text-slate-400' : heapMb < 50 ? 'text-green-500' : heapMb < 100 ? 'text-amber-500' : 'text-rose-500'
  const heapBadge = heapMb === null
    ? { label: 'N/A', cls: 'bg-slate-500/10 text-slate-400' }
    : heapMb < 50
      ? { label: 'Normal', cls: 'bg-green-500/10 text-green-500' }
      : heapMb < 100
        ? { label: 'Elevated', cls: 'bg-amber-500/10 text-amber-500' }
        : { label: 'High', cls: 'bg-rose-500/10 text-rose-500' }

  const maxDuration = resourceDurations.length > 0 ? Math.max(...resourceDurations) : 0
  const sparkPath = generateChartPath(resourceDurations, 200, 80)

  return (
    <section className="py-8 space-y-10 animate-fade-up">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Observability Playground</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Live browser performance telemetry for this page — all values sourced from the Performance API and web-vitals.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 — Page Load Time */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiZap className="text-blue-500" size={18} />
            <span className={`text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${loadBadge.cls}`}>
              {loadBadge.label}
            </span>
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${loadColor}`}>
              {pageLoadMs === null
                ? '—'
                : pageLoadMs < 1000
                  ? pageLoadMs
                  : (pageLoadMs / 1000).toFixed(2)}
              {pageLoadMs !== null && (
                <span className="text-sm font-semibold ml-1">{pageLoadMs < 1000 ? 'ms' : 's'}</span>
              )}
            </p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Page Load Time</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">PerformanceNavigationTiming</p>
          </div>
        </div>

        {/* Card 2 — Assets Loaded */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiActivity className="text-indigo-500" size={18} />
            <span className="text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 bg-indigo-500/10 text-indigo-500">Real</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-indigo-500 dark:text-indigo-400">{assetCount}</p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Assets Loaded</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">JS · CSS · fonts · images</p>
          </div>
        </div>

        {/* Card 3 — JS Heap */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiDatabase className={heapColor} size={18} />
            <span className={`text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${heapBadge.cls}`}>
              {heapBadge.label}
            </span>
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${heapColor}`}>
              {heapMb === null ? 'N/A' : heapMb}
              {heapMb !== null && <span className="text-sm font-semibold ml-1">MB</span>}
            </p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">JS Heap Used</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">performance.memory · Chrome only</p>
          </div>
        </div>

        {/* Card 4 — Session Duration */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiClock className="text-purple-500" size={18} />
            <span className="text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 bg-purple-500/10 text-purple-500 animate-pulse-slow">Live</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-purple-500 dark:text-purple-400">{formatSession(sessionSeconds)}</p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Session Duration</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">Time since page open</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        <SystemArchitectureCanvas />

        <div className="space-y-6">
          {/* Resource Load Sparkline */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FiActivity className="text-blue-500" size={14} />
                Resource Load Timings
              </h3>
              <span className="text-[0.6rem] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Real</span>
            </div>
            <div className="h-36 glass-panel rounded-2xl p-3 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                {[20, 40, 60].map(y => (
                  <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-slate-300/30 dark:text-slate-700/40" />
                ))}
                {sparkPath ? (
                  <>
                    <path
                      d={`${sparkPath} L 200,80 L 0,80 Z`}
                      fill="rgba(59,130,246,0.08)"
                    />
                    <path
                      d={sparkPath}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <text x="100" y="45" textAnchor="middle" fontSize="8" fill="gray">
                    Loading…
                  </text>
                )}
              </svg>
            </div>
            <div className="flex justify-between text-[0.6rem] text-slate-400 dark:text-slate-500">
              <span>{assetCount} resources · last {resourceDurations.length} shown</span>
              <span>{maxDuration > 0 ? `Max: ${maxDuration}ms` : 'No data'}</span>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FiServer className="text-blue-500" size={14} />
                Core Web Vitals
              </h3>
              <span className="text-[0.6rem] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                <span className="text-xs font-semibold">LCP</span>
                <span className={`text-xs font-bold ${cwv.lcp === null ? 'text-slate-400' : cwv.lcp < 2500 ? 'text-green-500' : cwv.lcp < 4000 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {cwv.lcp === null ? 'Measuring…' : `${(cwv.lcp / 1000).toFixed(2)}s ${cwv.lcp < 2500 ? '✓' : '⚠'}`}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                <span className="text-xs font-semibold">INP</span>
                <span className={`text-xs font-bold ${cwv.inp === null ? 'text-slate-400' : cwv.inp < 200 ? 'text-green-500' : cwv.inp < 500 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {cwv.inp === null ? 'Interact to measure' : `${cwv.inp.toFixed(0)}ms ${cwv.inp < 200 ? '✓' : '⚠'}`}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
                <span className="text-xs font-semibold">CLS</span>
                <span className={`text-xs font-bold ${cwv.cls === null ? 'text-slate-400' : cwv.cls < 0.1 ? 'text-green-500' : cwv.cls < 0.25 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {cwv.cls === null ? 'Measuring…' : `${cwv.cls.toFixed(3)} ${cwv.cls < 0.1 ? '✓' : '⚠'}`}
                </span>
              </div>
            </div>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500">
              All metrics are real — sourced from Performance API and web-vitals.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
