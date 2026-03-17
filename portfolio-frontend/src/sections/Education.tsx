import { education } from '../content/education'
import { HiAcademicCap } from 'react-icons/hi'

export default function Education() {
  return (
    <section id="education" className="py-16">
      <h2 className="section-heading animate-fade-up">Education</h2>
      <div className="mt-4 card-elevated p-5 text-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <HiAcademicCap className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-slate-50">{education.institution}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {education.degree} · {education.location}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              CGPA: {education.cgpa} · {education.period}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          Relevant coursework
        </p>
        <ul className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          {education.coursework.map((c) => (
            <li
              key={c}
              className="rounded-full border border-slate-200 px-2 py-0.5 dark:border-slate-700"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

