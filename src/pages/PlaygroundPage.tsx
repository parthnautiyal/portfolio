import { useState, useEffect } from 'react'
import { onLCP, onINP, onCLS } from 'web-vitals'
import SystemArchitectureCanvas from '../components/SystemArchitectureCanvas.tsx'
import { FiActivity, FiServer, FiCpu, FiDatabase, FiZap } from 'react-icons/fi'

type CWVState = {
  lcp: number | null
  inp: number | null
  cls: number | null
}

export default function PlaygroundPage() {
  const [latencyData, setLatencyData] = useState<number[]>([32, 28, 45, 30, 25, 42, 38, 29, 31, 35])
  const [cpuUsage, setCpuUsage] = useState(12.5)
  const [memoryUsage, setMemoryUsage] = useState(148)
  const [requestCount, setRequestCount] = useState(2541)
  const [cwv, setCwv] = useState<CWVState>({ lcp: null, inp: null, cls: null })

  useEffect(() => {
    onLCP((m) => setCwv((prev) => ({ ...prev, lcp: m.value })))
    onINP((m) => setCwv((prev) => ({ ...prev, inp: m.value })))
    onCLS((m) => setCwv((prev) => ({ ...prev, cls: m.value })))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyData((prev) => {
        const next = [...prev.slice(1)]
        const randomShift = Math.floor(Math.random() * 20) - 10
        const val = Math.max(15, Math.min(85, prev[prev.length - 1] + randomShift))
        next.push(val)
        return next
      })

      setCpuUsage((prev) => {
        const shift = (Math.random() * 4) - 2
        return parseFloat(Math.max(5, Math.min(45, prev + shift)).toFixed(1))
      })

      setMemoryUsage((prev) => {
        const shift = Math.floor(Math.random() * 10) - 5
        return Math.max(60, Math.min(220, prev + shift))
      })

      setRequestCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const generateChartPath = (data: number[], width: number, height: number) => {
    const maxVal = Math.max(...data, 100)
    const minVal = 0
    const valRange = maxVal - minVal

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((val - minVal) / valRange) * height
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }

  const latencyCurrent = latencyData[latencyData.length - 1]
  const latencyColor = latencyCurrent < 40 ? 'text-green-500' : latencyCurrent < 60 ? 'text-amber-500' : 'text-rose-500'
  const cpuColor = cpuUsage < 25 ? 'text-green-500' : cpuUsage < 35 ? 'text-amber-500' : 'text-rose-500'
  const memColor = memoryUsage < 150 ? 'text-green-500' : memoryUsage < 190 ? 'text-amber-500' : 'text-rose-500'

  return (
    <section className="py-8 space-y-10 animate-fade-up">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Observability Playground</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          A development sandbox showcasing interactive system design maps and simulated live telemetry.
          Metrics represent a realistic microservice deployment scenario — values are simulated for demonstration.
        </p>
      </div>

      {/* 4-column metrics banner across full width */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 — API Latency */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiZap className="text-blue-500" size={18} />
            <span className={`text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
              latencyCurrent < 40 ? 'bg-green-500/10 text-green-500' : latencyCurrent < 60 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {latencyCurrent < 40 ? 'Good' : latencyCurrent < 60 ? 'Warn' : 'High'}
            </span>
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${latencyColor}`}>{latencyCurrent}<span className="text-sm font-semibold ml-1">ms</span></p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">P95 API Latency</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">Simulated microservice scenario</p>
          </div>
        </div>

        {/* Card 2 — Simulated Requests */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiActivity className="text-indigo-500" size={18} />
            <span className="text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 bg-green-500/10 text-green-500">Live</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-indigo-500 dark:text-indigo-400">{requestCount.toLocaleString()}</p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Simulated Requests</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">Mock edge traffic baseline</p>
          </div>
        </div>

        {/* Card 3 — Process Heap (Node.js / Vite dev) */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiDatabase className={memColor} size={18} />
            <span className={`text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
              memoryUsage < 150 ? 'bg-green-500/10 text-green-500' : memoryUsage < 190 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {memoryUsage < 150 ? 'Normal' : memoryUsage < 190 ? 'Elevated' : 'High'}
            </span>
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${memColor}`}>{memoryUsage}<span className="text-sm font-semibold ml-1">MB</span></p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Process Heap</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">Node.js / Vite dev server</p>
          </div>
        </div>

        {/* Card 4 — CPU */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <FiCpu className={cpuColor} size={18} />
            <span className={`text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
              cpuUsage < 25 ? 'bg-green-500/10 text-green-500' : cpuUsage < 35 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {cpuUsage < 25 ? 'Normal' : cpuUsage < 35 ? 'Busy' : 'Spiked'}
            </span>
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${cpuColor}`}>{cpuUsage}<span className="text-sm font-semibold ml-1">%</span></p>
            <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">CPU Utilisation</p>
            <p className="text-[0.6rem] text-slate-400 dark:text-slate-500 mt-0.5">Simulated host process</p>
          </div>
        </div>
      </div>

      {/* Main two-panel grid: Architecture + Live Charts */}
      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        
        {/* Left: Architecture canvas — takes 60%+ width on large screens */}
        <SystemArchitectureCanvas />

        {/* Right: Charts + CWV stacked */}
        <div className="space-y-6">
          {/* Latency Sparkline */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FiActivity className="text-blue-500" size={14} />
                Real-time Latency Stream
              </h3>
              <span className="flex items-center gap-1.5 text-[0.6rem] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse-slow">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                LIVE
              </span>
            </div>
            <div className="h-36 glass-panel rounded-2xl p-3 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                {/* subtle grid */}
                {[20, 40, 60].map(y => (
                  <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-slate-300/30 dark:text-slate-700/40" />
                ))}
                {/* area fill */}
                <path
                  d={`${generateChartPath(latencyData, 200, 80)} L 200,80 L 0,80 Z`}
                  fill="rgba(59,130,246,0.08)"
                />
                {/* line */}
                <path
                  d={generateChartPath(latencyData, 200, 80)}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[0.6rem] text-slate-400 dark:text-slate-500">
              <span>10 samples · 1.5s interval</span>
              <span>Target: &lt;50ms</span>
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
              Real metrics measured live via web-vitals. Latency, CPU & memory are simulated scenarios.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
