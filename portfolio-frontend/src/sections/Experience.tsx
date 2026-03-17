import { experience } from '../content/experience'
import { HiOutlineBriefcase } from 'react-icons/hi'

export default function Experience() {
  return (
    <section id="experience" className="py-16">
      <h2 className="section-heading animate-fade-up">Experience</h2>
      <ol className="mt-8 space-y-10 border-l-2 border-slate-200 dark:border-slate-700 pl-8">
        {experience.map((item, index) => (
          <li key={item.role + item.period} className="relative">
            {/* Icon */}
            <div className="absolute -left-[2.15rem] top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-50 to-blue-100 shadow-md dark:border-slate-900 dark:from-blue-900/40 dark:to-blue-800/40">
              <HiOutlineBriefcase
                className={`${index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                size={18}
              />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {item.role}
                </h3>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.company}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.location}</span>
                  <span>•</span>
                  <span>{item.period}</span>
                </div>
              </div>

              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"></span>
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

