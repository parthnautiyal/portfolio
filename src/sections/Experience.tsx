import { useState } from 'react'
import { getExperience } from '../utils/contentLoader.ts'
import { FiActivity, FiCpu, FiAward } from 'react-icons/fi'
import { TbChevronDown, TbChevronUp } from 'react-icons/tb'
import { useQuest } from '../context/QuestContext.tsx'

type ExperienceItem = {
  role: string
  company: string
  location: string
  period: string
  bullets: string[]
}

export default function Experience() {
  const experience = getExperience() as ExperienceItem[]
  const { unlockAchievement } = useQuest()

  // Track accordion expanded states for debug logs
  const [sde2Expanded, setSde2Expanded] = useState(true)
  const [sde1Expanded, setSde1Expanded] = useState(true)
  const [internExpanded, setInternExpanded] = useState(true)
  const [activeSpan, setActiveSpan] = useState<'SDE-INTERN' | 'SDE-I' | 'SDE-II' | null>(null)

  const scrollToCard = (id: 'SDE-INTERN' | 'SDE-I' | 'SDE-II') => {
    setActiveSpan(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Find items in the array
  const sde2Item = experience.find(item => item.role.toLowerCase().includes('ii') || item.role.toLowerCase().includes('-2'))
  const sde1Item = experience.find(item => (item.role.toLowerCase().includes('engineer i') || item.role.toLowerCase().includes('sde i') || item.role.includes(' I ')) && !item.role.toLowerCase().includes('intern'))
  const internItem = experience.find(item => item.role.toLowerCase().includes('intern'))

  return (
    <section id="experience" className="py-16">
      <h2 className="section-heading animate-fade-up">Experience</h2>
      <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 animate-fade-up">
        Parth's software engineering journey represented as a distributed microservices trace timeline. Click any span to jump to detail logs and metrics.
      </p>

      {/* 1. Career Trace Timeline Jaeger style Chart */}
      <div className="mt-8 glass-card p-6 select-none animate-fade-up">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <FiActivity className="text-[var(--color-primary)] animate-pulse shrink-0" size={20} />
            <span className="text-xs md:text-sm font-black uppercase tracking-wider text-[var(--color-text-bright)]">
              Career Trace Timeline (Jaeger View)
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-orange-500/10 text-orange-650 dark:bg-indigo-500/10 dark:text-indigo-400 border border-orange-500/10 dark:border-indigo-500/10">
            Trace ID: zopsmart-core-prod-0x9a8b
          </span>
        </div>
        
        {/* Horizontal Timeline Ticks */}
        <div className="relative mt-8 h-8 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-550 font-bold">
          <span className="absolute left-0 -bottom-1">Jan 2024</span>
          <span className="absolute left-[20%] -bottom-1 -translate-x-1/2">Jul 2024</span>
          <span className="absolute left-[50%] -bottom-1 -translate-x-1/2 hidden sm:inline">Jul 2025</span>
          <span className="absolute left-[86.67%] -bottom-1 -translate-x-1/2 text-[var(--color-primary)]">Mar 2026</span>
          <span className="absolute right-0 -bottom-1">Present</span>
        </div>

        {/* Horizontal Trace Spans */}
        <div className="mt-5 space-y-3.5">
          {/* Parent Trace Span */}
          <div className="relative h-8 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center px-4 cursor-default">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Trace: ZopSmart Career Trace Life [30 months duration]
            </span>
          </div>

          {/* SDE Intern Span (Jan 2024 to Jul 2024: 20% width) */}
          <div className="flex items-center">
            <div className="w-[20%]">
              <button
                onClick={() => scrollToCard('SDE-INTERN')}
                className={`w-full text-left h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-between px-4 cursor-pointer shadow transition-all duration-300 hover:scale-[1.005] ${
                  activeSpan === 'SDE-INTERN' ? 'ring-2 ring-orange-400 border-white' : ''
                }`}
              >
                <span className="text-[0.65rem] md:text-xs font-bold uppercase tracking-wider truncate">
                  span.sde_intern : SDE Intern
                </span>
                <span className="text-[0.6rem] md:text-xs font-extrabold opacity-95 shrink-0">6 months (20.0%)</span>
              </button>
            </div>
          </div>

          {/* SDE I Span (Jul 2024 to Mar 2026: 66.67% width) */}
          <div className="flex items-center">
            <div className="w-[66.67%] ml-[20%]">
              <button
                onClick={() => scrollToCard('SDE-I')}
                className={`w-full text-left h-8 rounded-lg bg-blue-600 hover:bg-blue-750 text-white flex items-center justify-between px-4 cursor-pointer shadow transition-all duration-300 hover:scale-[1.005] ${
                  activeSpan === 'SDE-I' ? 'ring-2 ring-blue-400 border-white' : ''
                }`}
              >
                <span className="text-[0.65rem] md:text-xs font-bold uppercase tracking-wider truncate">
                  span.sde_1 : Software Development Engineer I
                </span>
                <span className="text-[0.6rem] md:text-xs font-extrabold opacity-95 shrink-0">20 months (66.7%)</span>
              </button>
            </div>
          </div>

          {/* SDE II Span (Mar 2026 to Present: 13.33% width) */}
          <div className="flex items-center">
            <div className="w-[13.33%] ml-[86.67%]">
              <button
                onClick={() => {
                  scrollToCard('SDE-II')
                  unlockAchievement('EXPAND_PROMOTION')
                }}
                className={`w-full text-left h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-between px-4 cursor-pointer shadow transition-all duration-300 hover:scale-[1.005] ${
                  activeSpan === 'SDE-II' ? 'ring-2 ring-emerald-400 border-white' : ''
                }`}
              >
                <span className="text-[0.65rem] md:text-xs font-bold uppercase tracking-wider truncate">
                  span.sde_2 : Software Development Engineer II
                </span>
                <span className="text-[0.6rem] md:text-xs font-extrabold opacity-95 shrink-0">4 months (13.3%)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Jaeger Details Panels Card list */}
      <div className="mt-12 space-y-6">
        {/* SDE II Card */}
        {sde2Item && (
          <div
            id="SDE-II"
            className={`card-elevated border-l-4 border-emerald-500 overflow-hidden relative transition-all duration-500 ${
              activeSpan === 'SDE-II' ? 'ring-2 ring-emerald-400 dark:ring-emerald-500' : ''
            }`}
          >
            <div className="p-6 md:p-8">
              {/* Header block */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <FiCpu className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-[var(--color-text-bright)] leading-tight">
                      {sde2Item.role}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--color-text-muted)] font-semibold mt-1">
                      {sde2Item.company} · {sde2Item.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    status: 200 OK
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-250/20 dark:border-slate-800/30">
                    duration: 4ms
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Distributed Orchestration</span>
                    <h4 className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-1">Temporal Refactoring</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Decomposed monolithic logic into 11+ workflow activities with automated retry safety and idempotency.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">System Performance</span>
                    <h4 className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-1">50% Latency Drop</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Designed and scaled 20+ Spring Boot services in an event-driven Kafka architecture under heavy volumes.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Engineering Leadership</span>
                    <h4 className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-1">2 Interns Mentored</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Led distributed systems knowledge sharing and promoted standardized platform service configurations.
                  </p>
                </div>
              </div>

              {/* Tags & Execution Logs Accordion */}
              <div className="mt-6">
                <button
                  onClick={() => setSde2Expanded(!sde2Expanded)}
                  className="w-full flex items-center justify-between text-left text-xs md:text-sm font-black text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-3 border-t border-slate-200/40 dark:border-slate-800/40 cursor-pointer transition-colors"
                >
                  <span>Tags & Trace Bullets ({sde2Item.bullets.length} items)</span>
                  {sde2Expanded ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
                </button>
                
                {sde2Expanded && (
                  <ul className="mt-3 pl-3 space-y-3.5 border-l-2 border-emerald-500/30 dark:border-emerald-500/20 animate-fade-in text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {sde2Item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-80" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Promotion Event Trigger Badge */}
        <div className="flex flex-col items-center py-4 my-2 relative select-none">
          <div className="w-0.5 h-14 bg-gradient-to-b from-emerald-500 to-blue-500" />
          <button
            onClick={() => {
              unlockAchievement('EXPAND_PROMOTION')
              scrollToCard('SDE-II')
            }}
            className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400 cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all text-xs font-bold tracking-wider uppercase"
          >
            <FiAward size={14} />
            <span>Promotion Upgrade Detected · Mar 2026</span>
            <span className="px-2 py-0.5 rounded bg-white/20 text-[0.6rem] font-extrabold uppercase">Unlock Quest</span>
          </button>
        </div>

        {/* SDE I Card */}
        {sde1Item && (
          <div
            id="SDE-I"
            className={`card-elevated border-l-4 border-blue-500 overflow-hidden relative transition-all duration-500 ${
              activeSpan === 'SDE-I' ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
            }`}
          >
            <div className="p-6 md:p-8">
              {/* Header block */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FiCpu className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-[var(--color-text-bright)] leading-tight">
                      {sde1Item.role}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--color-text-muted)] font-semibold mt-1">
                      {sde1Item.company} · {sde1Item.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    status: 301 MOVED PERMANENTLY
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-250/20 dark:border-slate-800/30">
                    duration: 20ms
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Build Infrastructure</span>
                    <h4 className="text-sm font-black text-blue-500 mt-1">9m to 4m Speedup</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Optimized CI/CD build caches and automatic retries; reduced build times by 55% and cut pipeline failures by 90%.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Quality Enforcements</span>
                    <h4 className="text-sm font-black text-blue-500 mt-1">85%+ Test Coverage</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Eliminated vulnerabilities and enforced rigorous unit/integration testing using JUnit and Mockito.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Observability Metrics</span>
                    <h4 className="text-sm font-black text-blue-500 mt-1">MTTR Reduction</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Configured real-time system observability alert rules in Grafana, Prometheus, and Datadog to resolve prod bugs.
                  </p>
                </div>
              </div>

              {/* Tags & Execution Logs Accordion */}
              <div className="mt-6">
                <button
                  onClick={() => setSde1Expanded(!sde1Expanded)}
                  className="w-full flex items-center justify-between text-left text-xs md:text-sm font-black text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-3 border-t border-slate-200/40 dark:border-slate-800/40 cursor-pointer transition-colors"
                >
                  <span>Tags & Trace Bullets ({sde1Item.bullets.length} items)</span>
                  {sde1Expanded ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
                </button>
                
                {sde1Expanded && (
                  <ul className="mt-3 pl-3 space-y-3.5 border-l-2 border-blue-500/30 dark:border-blue-500/20 animate-fade-in text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {sde1Item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 opacity-80" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transition Event Trigger Badge */}
        <div className="flex flex-col items-center py-4 my-2 relative select-none">
          <div className="w-0.5 h-14 bg-gradient-to-b from-blue-500 to-orange-500" />
          <div
            className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500 text-white border border-blue-400 shadow-md text-[0.65rem] font-bold tracking-wider uppercase"
          >
            <FiAward size={12} />
            <span>Full-time Conversion · Jul 2024</span>
          </div>
        </div>

        {/* SDE Intern Card */}
        {internItem && (
          <div
            id="SDE-INTERN"
            className={`card-elevated border-l-4 border-orange-500 overflow-hidden relative transition-all duration-500 ${
              activeSpan === 'SDE-INTERN' ? 'ring-2 ring-orange-400' : ''
            }`}
          >
            <div className="p-6 md:p-8">
              {/* Header block */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <FiCpu className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-[var(--color-text-bright)] leading-tight">
                      {internItem.role}
                    </h3>
                    <p className="text-xs md:text-sm text-[var(--color-text-muted)] font-semibold mt-1">
                      {internItem.company} · {internItem.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                    status: 200 OK
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-250/20 dark:border-slate-800/30">
                    duration: 6ms
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Quality Enforcement</span>
                    <h4 className="text-sm font-black text-orange-500 mt-1">+45% Unit Coverage</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Practiced Test-Driven Development (TDD) using JUnit and Mockito to build robust unit validation coverage.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">API Development</span>
                    <h4 className="text-sm font-black text-orange-500 mt-1">REST Controllers</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Assisted in implementing scalable endpoint controllers, mapping database entities, and optimizing local logic.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-250/20 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Systems Engineering</span>
                    <h4 className="text-sm font-black text-orange-500 mt-1">Microservices Patterns</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Shadowed senior engineers on microservices configurations, distributed logs tracking, and deployment runs.
                  </p>
                </div>
              </div>

              {/* Tags & Execution Logs Accordion */}
              <div className="mt-6">
                <button
                  onClick={() => setInternExpanded(!internExpanded)}
                  className="w-full flex items-center justify-between text-left text-xs md:text-sm font-black text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-3 border-t border-slate-200/40 dark:border-slate-800/40 cursor-pointer transition-colors"
                >
                  <span>Tags & Trace Bullets ({internItem.bullets.length} items)</span>
                  {internExpanded ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
                </button>
                
                {internExpanded && (
                  <ul className="mt-3 pl-3 space-y-3.5 border-l-2 border-orange-500/30 dark:border-orange-500/20 animate-fade-in text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {internItem.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 opacity-80" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
