import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getPersonal } from '../utils/contentLoader.ts'
import { TbRocket, TbShieldCheck, TbClockUp, TbActivity } from 'react-icons/tb'

type Highlight = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  color: string
  explanation: string
}

const highlights: Highlight[] = [
  {
    label: 'API latency reduction',
    value: '50%+',
    icon: TbRocket,
    color: 'text-blue-500',
    explanation: 'Profiled 25+ Spring Boot REST endpoints with Datadog APM and identified N+1 query patterns and synchronous blocking calls. Replaced with async processing, strategic DB indexing, and response caching. P95 latency dropped from ~80ms to <40ms across the ZopSmart platform.',
  },
  {
    label: 'Rollback reduction',
    value: '70%',
    icon: TbShieldCheck,
    color: 'text-green-500',
    explanation: 'Built automated CI/CD pipelines in Jenkins with mandatory integration test gates, blue-green deployments, and pre-cutover smoke tests. Kubernetes Helm rollback policies enabled automatic recovery from failed releases within seconds instead of requiring manual intervention.',
  },
  {
    label: 'Uptime achieved',
    value: '99.9%',
    icon: TbActivity,
    color: 'text-purple-500',
    explanation: 'Deployed microservices across a Kubernetes cluster with Horizontal Pod Autoscaler (HPA), liveness/readiness probes, and circuit breakers (Resilience4j). Multi-replica deployments with zero-downtime rolling updates eliminated single points of failure across critical Spring Boot services.',
  },
  {
    label: 'MTTR reduction',
    value: '40%',
    icon: TbClockUp,
    color: 'text-orange-500',
    explanation: 'Unified Grafana dashboards correlating Prometheus metrics with Datadog APM traces. Automated alert rules reduced mean time to detect (MTTD) from ~30 minutes to under 5 minutes. Runbooks and structured incident playbooks cut resolution time by an additional 40%.',
  },
]

export default function About() {
  const personal = getPersonal()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 })

  // Lock background body scroll when popover details are displayed
  useEffect(() => {
    if (expanded) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [expanded])

  const handleOpen = (label: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cardCenterX = rect.left + rect.width / 2
    const cardCenterY = rect.top + rect.height / 2
    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2

    setClickCoords({
      x: cardCenterX - viewportCenterX,
      y: cardCenterY - viewportCenterY,
    })
    setIsClosing(false)
    setExpanded(label)
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setExpanded(null)
      setIsClosing(false)
    }, 280)
  }

  return (
    <section id="about" className="py-16">
      <h2 className="section-heading animate-fade-up">About</h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 animate-fade-up">
        {personal.summary}{' '}
        I enjoy designing reliable systems, simplifying complex workflows, and
        collaborating with product and platform teams to ship features safely.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {highlights.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="card-elevated px-4 py-5 text-xs cursor-pointer select-none transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:border-blue-500/30 dark:hover:border-sky-400/30 hover:shadow-lg flex flex-col justify-between h-28"
              onClick={(e) => handleOpen(item.label, e)}
              role="button"
              aria-haspopup="dialog"
            >
              <div className="flex items-center justify-between">
                <p className="text-[0.62rem] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 font-bold">
                  {item.label}
                </p>
                <Icon className={`${item.color} dark:opacity-85`} size={20} />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-50">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* macOS Style Spring Zoom Modal Overlay */}
      {expanded && (() => {
        const item = highlights.find((h) => h.label === expanded)
        if (!item) return null
        const Icon = item.icon

        // Custom metrics graph representations
        let miniGraph = null
        if (expanded === 'API latency reduction') {
          miniGraph = (
            <div className="space-y-2 mt-4 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/40 dark:border-slate-800/80">
              <div className="flex justify-between text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                <span>Before Optimization</span>
                <span className="text-rose-500 font-bold">80ms (P95)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[80%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                <span>Post Optimization</span>
                <span className="text-emerald-500 font-bold">40ms (P95)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[40%] rounded-full"></div>
              </div>
            </div>
          )
        } else if (expanded === 'Rollback reduction') {
          miniGraph = (
            <div className="space-y-2 mt-4 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/40 dark:border-slate-800/80">
              <div className="flex justify-between text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                <span>Manual Deploy Rollbacks</span>
                <span className="text-rose-500 font-bold">30%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[30%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                <span>Jenkins/Helm GitOps Rollbacks</span>
                <span className="text-emerald-500 font-bold">9%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[9%] rounded-full"></div>
              </div>
            </div>
          )
        } else if (expanded === 'Uptime achieved') {
          miniGraph = (
            <div className="space-y-2 mt-4 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/40 dark:border-slate-800/80">
              <div className="flex justify-between text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                <span>Kubernetes Cluster Health</span>
                <span className="text-emerald-500 font-bold">99.9% Availability</span>
              </div>
              <div className="flex gap-1 h-3 mt-1.5">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500 rounded-sm animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          )
        } else if (expanded === 'MTTR reduction') {
          miniGraph = (
            <div className="space-y-2 mt-4 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/40 dark:border-slate-800/80">
              <div className="flex justify-between text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                <span>Incident Response (MTTD)</span>
                <span className="text-amber-500 font-bold">5 mins (down from 30)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[17%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[0.65rem] font-mono text-slate-500 dark:text-slate-400">
                <span>Resolution Duration (MTTR)</span>
                <span className="text-emerald-500 font-bold">18 mins (down from 30)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[60%] rounded-full"></div>
              </div>
            </div>
          )
        }

        return createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 dark:bg-slate-950/45 backdrop-blur-[6px] print:hidden ${
              isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
            onClick={handleClose}
          >
            <div
              style={{
                '--invoked-x': `${clickCoords.x}px`,
                '--invoked-y': `${clickCoords.y}px`,
              } as React.CSSProperties}
              className={`bg-white dark:bg-slate-900 p-6 md:p-8 w-full max-w-md rounded-2xl shadow-2xl relative border border-slate-200 dark:border-slate-800 text-[var(--color-text)] ${
                isClosing ? 'animate-mac-zoom-out' : 'animate-mac-zoom'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                <span className="text-[0.65rem] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 select-none">
                  <Icon className={`${item.color}`} size={18} />
                  {item.label}
                </span>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-400 hover:text-[var(--color-text-bright)] transition-colors cursor-pointer text-xs leading-none"
                  title="Close details"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="mt-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-[0.65rem] uppercase font-bold text-slate-400 select-none">Achieved Metric</p>
                  <p className="text-4xl font-extrabold text-[var(--color-text-bright)] tracking-tight">{item.value}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[0.65rem] uppercase font-bold text-slate-400 select-none">Implementation Details</p>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.explanation}
                  </p>
                </div>
              </div>

              {/* Graphic */}
              {miniGraph}

              {/* Footer action button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-slate-100 text-xs font-bold border border-slate-800 dark:border-slate-200 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      })()}
    </section>
  )
}
