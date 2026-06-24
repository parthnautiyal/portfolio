import { useState } from 'react'
import { getPersonal } from '../utils/contentLoader.ts'
import { TbRocket, TbShieldCheck, TbClockUp, TbActivity, TbChevronDown, TbChevronUp } from 'react-icons/tb'

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

  const toggle = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label))
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
          const isOpen = expanded === item.label
          return (
            <div
              key={item.label}
              className={`card-elevated px-3 py-4 text-xs cursor-pointer select-none transition-all duration-200 ${
                isOpen ? 'ring-1 ring-blue-500/30 dark:ring-sky-400/30 md:col-span-2' : ''
              }`}
              onClick={() => toggle(item.label)}
              role="button"
              aria-expanded={isOpen}
            >
              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <div className="flex items-center gap-1">
                  <Icon className={`${item.color} dark:opacity-80`} size={18} />
                  {isOpen
                    ? <TbChevronUp className="text-slate-400" size={14} />
                    : <TbChevronDown className="text-slate-400" size={14} />
                  }
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                {item.value}
              </p>
              {isOpen && (
                <p className="mt-3 text-[0.65rem] leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-200/40 dark:border-slate-800/40 pt-2 animate-fade-up">
                  {item.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
