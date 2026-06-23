import { getExperience } from '../utils/contentLoader'
import { HiOutlineBriefcase } from 'react-icons/hi'

export default function Experience() {
  const experience = getExperience()
  return (
    <section id="experience" className="py-16">
      <h2 className="section-heading animate-fade-up">Experience</h2>
      <ol className="mt-8 space-y-10 border-l-2 border-[var(--border-color)] pl-8">
        {experience.map((item: any, index: number) => (
          <li key={item.role + item.period} className="relative">
            {/* Icon */}
            <div className="absolute -left-[2.7rem] top-1.5 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-main)] shadow-sm">
              <HiOutlineBriefcase
                className={`${index === 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                size={18}
              />
            </div>

            {/* Content wrapped in glass-card */}
            <div className="card-elevated space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--color-text-bright)]">
                  {item.role}
                </h3>
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  {item.company}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>{item.location}</span>
                  <span>•</span>
                  <span>{item.period}</span>
                </div>
              </div>

              <ul className="space-y-2 text-sm leading-relaxed text-[var(--color-text)]">
                {item.bullets.map((bullet: string) => (
                  <li key={bullet} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)] opacity-80"></span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

