import { useState } from 'react'
import SystemArchitectureCanvas from '../components/SystemArchitectureCanvas.tsx'
import FailureSimulator from '../components/FailureSimulator.tsx'
import PipelineVisualizer from '../components/PipelineVisualizer.tsx'
import ObservabilityLogs from '../components/ObservabilityLogs.tsx'

export type FailureState = {
  kafkaDown: boolean
  circuitBreakerTripped: boolean
  dbExhausted: boolean
  podCrashed: boolean
}

export default function SystemCockpitPage() {
  const [failureState, setFailureState] = useState<FailureState>({
    kafkaDown: false,
    circuitBreakerTripped: false,
    dbExhausted: false,
    podCrashed: false
  })

  const handleToggleFailure = (key: keyof FailureState) => {
    setFailureState((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <section className="py-8 space-y-10 animate-fade-up">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">System & Observability Cockpit</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Interactive simulation dashboard illustrating backend system reliability, design patterns, and deployment configurations.
        </p>
      </div>

      {/* Main Grid workspace */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Architecture Canvas */}
        <SystemArchitectureCanvas />

        {/* Chaos Engineering Panel */}
        <FailureSimulator state={failureState} onToggle={handleToggleFailure} />
      </div>

      {/* Observability Telemetry & log feed */}
      <ObservabilityLogs failureState={failureState} />

      {/* DevOps configuration visualizer */}
      <PipelineVisualizer />
    </section>
  )
}
