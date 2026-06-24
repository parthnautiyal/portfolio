import { useState } from 'react'
import { getExperience } from '../utils/contentLoader.ts'
import { HiOutlineBriefcase } from 'react-icons/hi'
import { TbBuilding, TbChevronDown, TbChevronUp, TbArrowUp } from 'react-icons/tb'

type ExperienceItem = {
  role: string
  company: string
  location: string
  period: string
  bullets: string[]
}

function groupByCompany(items: ExperienceItem[]): Map<string, ExperienceItem[]> {
  const map = new Map<string, ExperienceItem[]>()
  for (const item of items) {
    if (!map.has(item.company)) map.set(item.company, [])
    map.get(item.company)!.push(item)
  }
  return map
}

export default function Experience() {
  const experience = getExperience() as ExperienceItem[]
  const grouped = groupByCompany(experience)

  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    () => new Set(Array.from(grouped.entries()).filter(([, r]) => r.length > 1).map(([c]) => c))
  )
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(
    () => new Set(experience.map(e => e.role + e.company))
  )

  const toggleCompany = (company: string) =>
    setExpandedCompanies(prev => {
      const next = new Set(prev)
      if (next.has(company)) next.delete(company)
      else next.add(company)
      return next
    })

  const toggleRole = (key: string) =>
    setExpandedRoles(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <section id="experience" className="py-16">
      <h2 className="section-heading animate-fade-up">Experience</h2>
      <div className="mt-8 space-y-5">
        {Array.from(grouped.entries()).map(([company, roles]) => {
          const isMultiRole = roles.length > 1
          const isExpanded = expandedCompanies.has(company)
          const newest = roles[0]
          const oldest = roles[roles.length - 1]
          const dateRange = `${oldest.period.split(' – ')[0]} – ${newest.period.split(' – ')[1] ?? newest.period.split(' – ')[0]}`

          return (
            <div key={company} className="card-elevated overflow-hidden">
              {/* Company header */}
              <button
                onClick={() => isMultiRole && toggleCompany(company)}
                className={`w-full flex items-center justify-between p-5 text-left ${isMultiRole ? 'cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <TbBuilding className="text-[var(--color-primary)]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-bright)]">{company}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {dateRange}
                      {isMultiRole && ` · ${roles.length} roles`}
                    </p>
                  </div>
                </div>
                {isMultiRole && (
                  <div className="shrink-0 text-[var(--color-text-muted)] ml-2">
                    {isExpanded ? <TbChevronUp size={18} /> : <TbChevronDown size={18} />}
                  </div>
                )}
              </button>

              {/* Roles */}
              <div
                style={{
                  maxHeight: !isMultiRole || isExpanded ? '4000px' : '0',
                  transition: 'max-height 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                }}
              >
                <div className="px-5 pb-5 space-y-2">
                  {roles.map((role, idx) => {
                    const roleKey = role.role + role.company
                    const isRoleExpanded = expandedRoles.has(roleKey)
                    const isCurrent = role.period.includes('Present')

                    return (
                      <div key={roleKey}>
                        {/* Promotion badge */}
                        {isMultiRole && idx > 0 && (
                          <div className="flex items-center gap-2 py-2 pl-2">
                            <TbArrowUp className="text-green-500" size={14} />
                            <span className="text-[0.7rem] font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                              Promoted · {roles[idx - 1].period.split(' – ')[0]}
                            </span>
                          </div>
                        )}

                        {/* Role card */}
                        <div className="glass-panel rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleRole(roleKey)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <HiOutlineBriefcase className="text-[var(--color-primary)]" size={15} />
                                {isCurrent && (
                                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-[var(--color-text-bright)]">{role.role}</h4>
                                  {isCurrent && (
                                    <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 shrink-0">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)] truncate">{role.location} · {role.period}</p>
                              </div>
                            </div>
                            <span className="shrink-0 text-[var(--color-text-muted)] ml-2">
                              {isRoleExpanded ? <TbChevronUp size={13} /> : <TbChevronDown size={13} />}
                            </span>
                          </button>

                          {/* Bullets */}
                          <div
                            style={{
                              maxHeight: isRoleExpanded ? '2000px' : '0',
                              transition: 'max-height 0.4s ease',
                              overflow: 'hidden',
                            }}
                          >
                            <ul className="px-4 pb-4 pt-3 space-y-2.5 border-t border-[var(--border-color)]">
                              {role.bullets.map((bullet: string) => (
                                <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-text)]">
                                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)] opacity-70" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
