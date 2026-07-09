import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SystemArchitectureCanvas from '../components/SystemArchitectureCanvas.tsx'
import FailureSimulator from '../components/FailureSimulator.tsx'
import PipelineVisualizer from '../components/PipelineVisualizer.tsx'
import ObservabilityLogs from '../components/ObservabilityLogs.tsx'

export type FailureState = {
  geminiLimit: boolean
  gatewayLatency: boolean
  cloudMountOffline: boolean
  ollamaOffline: boolean
}

export default function SystemCockpitPage() {
  const [searchParams] = useSearchParams()
  const selectParam = searchParams.get('select')

  const [failureState, setFailureState] = useState<FailureState>({
    geminiLimit: false,
    gatewayLatency: false,
    cloudMountOffline: false,
    ollamaOffline: false
  })

  useEffect(() => {
    if (selectParam) {
      setFailureState({
        geminiLimit: selectParam === 'gemini',
        gatewayLatency: selectParam === 'latency',
        cloudMountOffline: selectParam === 'cloud',
        ollamaOffline: selectParam === 'ollama'
      })
    }
  }, [selectParam])

  const handleToggleFailure = (key: keyof FailureState) => {
    setFailureState((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <section className="py-8 space-y-10 animate-scale-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">System & Build Pipeline</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Interactive system flowcharts, build pipeline configurations, and browser performance telemetry metrics.
        </p>
      </div>

      {/* Main Grid workspace */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Architecture Canvas */}
        <SystemArchitectureCanvas failureState={failureState} />

        {/* System Simulation Control Panel */}
        <FailureSimulator state={failureState} onToggle={handleToggleFailure} />
      </div>

      {/* Real-time Telemetry & Log Monitor */}
      <ObservabilityLogs failureState={failureState} />

      {/* DevOps build pipeline configuration */}
      <PipelineVisualizer />
    </section>
  )
}
