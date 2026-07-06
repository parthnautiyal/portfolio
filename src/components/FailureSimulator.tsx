import { FiAlertOctagon, FiActivity, FiDatabase, FiLayers } from 'react-icons/fi'
import type { FailureState } from '../pages/SystemCockpitPage.tsx'

type Props = {
  state: FailureState
  onToggle: (key: keyof FailureState) => void
}

export default function FailureSimulator({ state, onToggle }: Props) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <FiAlertOctagon className="text-red-500" />
          Chaos Engineering & Failure Injection
        </h3>
        <p className="text-[0.65rem] text-slate-500 mt-0.5">
          Toggle distributed system failures to witness self-healing and resilience policies in real-time.
        </p>
      </div>

      <div className="grid gap-3">
        {/* Kafka Broker Outage */}
        <button
          onClick={() => onToggle('kafkaDown')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.kafkaDown
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.kafkaDown ? 'bg-rose-500/20' : 'bg-blue-500/10 text-blue-500'}`}>
            <FiActivity size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">Kafka Cluster Down</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.kafkaDown ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.kafkaDown ? 'Active Outage' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Crashes Kafka brokers. Witness partition replication suspension, event buffering in memory, and consumer lag growth.
            </p>
          </div>
        </button>

        {/* Payment Circuit Breaker */}
        <button
          onClick={() => onToggle('circuitBreakerTripped')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.circuitBreakerTripped
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.circuitBreakerTripped ? 'bg-amber-500/20' : 'bg-indigo-500/10 text-indigo-500'}`}>
            <FiLayers size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">Payment API Latency</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.circuitBreakerTripped ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.circuitBreakerTripped ? 'Trip Circuit' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Injects a 10-second sleep on gateway endpoints. Incurs Resilience4j circuit tripping and triggers fallback workflow strategies.
            </p>
          </div>
        </button>

        {/* Database Connection Exhaustion */}
        <button
          onClick={() => onToggle('dbExhausted')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.dbExhausted
              ? 'bg-red-500/10 border-red-500/40 text-red-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.dbExhausted ? 'bg-red-500/20' : 'bg-sky-500/10 text-sky-500'}`}>
            <FiDatabase size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">HikariCP Pool Exhaustion</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.dbExhausted ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.dbExhausted ? 'Exhausted' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Blocks database connection threads. Triggers connection timeout exceptions, and displays p99 load spikes.
            </p>
          </div>
        </button>

        {/* Kubernetes Pod Crash */}
        <button
          onClick={() => onToggle('podCrashed')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.podCrashed
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.podCrashed ? 'bg-rose-500/20' : 'bg-purple-500/10 text-purple-500'}`}>
            <FiAlertOctagon size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">K8s Pod Crash Loop</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.podCrashed ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.podCrashed ? 'CrashLoop' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Kills a replica of order-service. Displays pod failure detection, ingress controller rerouting, and pod container automatic restart.
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
