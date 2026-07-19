import { FiAlertOctagon, FiActivity, FiCpu, FiCloudOff } from 'react-icons/fi'
import type { FailureState } from '../pages/SystemCockpitPage.tsx'
import { useQuest } from '../context/QuestContext.tsx'

type Props = {
  state: FailureState
  onToggle: (key: keyof FailureState) => void
}

export default function FailureSimulator({ state, onToggle }: Props) {
  const { unlockAchievement } = useQuest()

  const handleToggle = (key: keyof FailureState) => {
    onToggle(key)
    unlockAchievement('TRIGGER_CHAOS')
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <FiAlertOctagon className="text-blue-500 dark:text-sky-400" />
          System Telemetry & Architecture Simulation
        </h3>
        <p className="text-[0.65rem] text-slate-500 mt-0.5">
          Toggle real system scenario parameters to observe how the portfolio architecture handles failures, delays, and offlines.
        </p>
      </div>

      <div className="grid gap-3">
        {/* Gemini API Outage */}
        <button
          onClick={() => handleToggle('geminiLimit')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.geminiLimit
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.geminiLimit ? 'bg-rose-500/20' : 'bg-red-500/10 text-red-500'}`}>
            <FiAlertOctagon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">Gemini API Outage</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.geminiLimit ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.geminiLimit ? '429 Rate Limit' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Simulates a Gemini API rate limit (429) or service interruption. Witness fallback response routes routing requests to the local Ollama LLM endpoint or a static answer.
            </p>
          </div>
        </button>

        {/* Vercel Serverless Latency */}
        <button
          onClick={() => handleToggle('gatewayLatency')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.gatewayLatency
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.gatewayLatency ? 'bg-amber-500/20' : 'bg-amber-500/10 text-amber-500'}`}>
            <FiActivity size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">Serverless API Latency</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.gatewayLatency ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.gatewayLatency ? '10s Delay Injected' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Simulates serverless function cold starts and network throttling. Triggers client-side request timeout boundaries and loads visual loader overlays.
            </p>
          </div>
        </button>

        {/* Cloud Mount Offline */}
        <button
          onClick={() => handleToggle('cloudMountOffline')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.cloudMountOffline
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.cloudMountOffline ? 'bg-rose-500/20' : 'bg-blue-500/10 text-blue-500'}`}>
            <FiCloudOff size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">iCloud / GDrive Offline</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.cloudMountOffline ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.cloudMountOffline ? 'Unmounted' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Simulates local cloud directories being unmounted. The local Node.js sync CLI script catches the error gracefully, logs the issue, and skips copy actions.
            </p>
          </div>
        </button>

        {/* Ollama Local Engine Offline */}
        <button
          onClick={() => handleToggle('ollamaOffline')}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
            state.ollamaOffline
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'glass-panel border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-lg shrink-0 ${state.ollamaOffline ? 'bg-rose-500/20' : 'bg-purple-500/10 text-purple-500'}`}>
            <FiCpu size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <span className="text-xs font-bold text-[var(--color-text-bright)]">Local Ollama Server Offline</span>
              <span className={`text-[0.55rem] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                state.ollamaOffline ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {state.ollamaOffline ? 'Offline' : 'Healthy'}
              </span>
            </div>
            <p className="text-[0.6rem] text-slate-500 mt-1 leading-relaxed">
              Simulates the developer's local Ollama instance (http://localhost:11434) being offline. Restricts developer-side offline parsing and backup chat routing.
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
