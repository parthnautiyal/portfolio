import { useState, useEffect } from 'react'
import SystemArchitectureCanvas from '../components/SystemArchitectureCanvas'
import { FiActivity, FiServer, FiAlertCircle } from 'react-icons/fi'

export default function PlaygroundPage() {
  // Telemetry metrics states
  const [latencyData, setLatencyData] = useState<number[]>([32, 28, 45, 30, 25, 42, 38, 29, 31, 35])
  const [cpuUsage, setCpuUsage] = useState(12.5)
  const [memoryUsage, setMemoryUsage] = useState(148) // MB
  const [requestCount, setRequestCount] = useState(2541)

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random network request latency fluctuations
      setLatencyData((prev) => {
        const next = [...prev.slice(1)]
        const randomShift = Math.floor(Math.random() * 20) - 10 // -10 to +10
        const val = Math.max(15, Math.min(85, prev[prev.length - 1] + randomShift))
        next.push(val)
        return next
      })

      // Simulate CPU fluctuation
      setCpuUsage((prev) => {
        const shift = (Math.random() * 4) - 2 // -2% to +2%
        return parseFloat(Math.max(5, Math.min(45, prev + shift)).toFixed(1))
      })

      // Simulate Memory fluctuation
      setMemoryUsage((prev) => {
        const shift = Math.floor(Math.random() * 10) - 5 // -5MB to +5MB
        return Math.max(100, Math.min(256, prev + shift))
      })

      // Increment request count
      setRequestCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Create SVG path for charts based on numbers array
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
  };

  return (
    <section className="py-8 space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Observability Playground</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          A development sandbox showcasing interactive system design maps and live telemetry streams.
        </p>
      </div>

      {/* Grid Layout: Widen grid columns for architecture and telemetry */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        
        {/* Left Side: System Architecture Map */}
        <SystemArchitectureCanvas />

        {/* Right Side: Telemetry Dashboard */}
        <div className="glass-card p-6 space-y-6">
          <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FiActivity className="text-blue-500" />
              Live Observability Dashboard
            </h3>
            <span className="flex items-center gap-1.5 text-[0.6rem] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse-slow">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              ONLINE
            </span>
          </div>

          {/* Telemetry Numbers Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass-panel rounded-2xl space-y-1">
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">API Latency</span>
              <span className="text-xl font-extrabold text-blue-500 dark:text-sky-400">
                {latencyData[latencyData.length - 1]} ms
              </span>
              <span className="text-[0.55rem] text-slate-500 dark:text-slate-400 block">Avg Response Time</span>
            </div>

            <div 
              className="p-4 glass-panel rounded-2xl space-y-1 cursor-help"
              title="This is a simulated metrics baseline representing Parth's edge microservice deployment logs. It models HTTP edge traffic to showcase full-stack observability features."
            >
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">Simulated Requests</span>
              <span className="text-xl font-extrabold text-blue-500 dark:text-sky-400">
                {requestCount}
              </span>
              <span className="text-[0.55rem] text-slate-500 dark:text-slate-400 block">Edge Region Mock Baseline</span>
            </div>

            <div className="p-4 glass-panel rounded-2xl space-y-1">
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">JVM Heap Usage</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                {memoryUsage} MB
              </span>
              <span className="text-[0.55rem] text-slate-500 dark:text-slate-400 block">Max Pool: 256MB</span>
            </div>

            <div className="p-4 glass-panel rounded-2xl space-y-1">
              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">Telemetry CPU</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                {cpuUsage} %
              </span>
              <span className="text-[0.55rem] text-slate-500 dark:text-slate-400 block">Vercel Edge Instance</span>
            </div>
          </div>

          {/* SVG Latency Chart */}
          <div className="space-y-2">
            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">API Latency (Real-time Stream)</span>
            <div className="h-32 glass-panel rounded-2xl p-2 relative overflow-hidden flex items-end">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="200" y2="20" stroke="light-dark(rgba(0,0,0,0.03), rgba(255,255,255,0.03))" strokeWidth="1" />
                <line x1="0" y1="40" x2="200" y2="40" stroke="light-dark(rgba(0,0,0,0.03), rgba(255,255,255,0.03))" strokeWidth="1" />
                <line x1="0" y1="60" x2="200" y2="60" stroke="light-dark(rgba(0,0,0,0.03), rgba(255,255,255,0.03))" strokeWidth="1" />
                
                {/* SVG Path line */}
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
          </div>

          {/* Core Web Vitals Status Indicators */}
          <div className="space-y-3">
            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">User Core Web Vitals (Real Metrics)</span>
            
            <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
              <div className="flex items-center gap-2">
                <FiServer className="text-blue-500" />
                <span className="text-xs font-semibold">LCP (Largest Contentful Paint)</span>
              </div>
              <span className="text-xs font-bold text-green-500">1.1s (Good)</span>
            </div>

            <div className="flex items-center justify-between p-3 glass-panel rounded-xl">
              <div className="flex items-center gap-2">
                <FiActivity className="text-blue-500" />
                <span className="text-xs font-semibold">INP (Interaction to Next Paint)</span>
              </div>
              <span className="text-xs font-bold text-green-500">12ms (Good)</span>
            </div>

            <div className="flex items-center justify-between p-3 glass-panel rounded-xl text-amber-500 bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center gap-2">
                <FiAlertCircle />
                <span className="text-xs font-semibold">DB Replica Sync Delay</span>
              </div>
              <span className="text-xs font-bold">0.4ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
