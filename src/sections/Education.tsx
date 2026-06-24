import { getEducation } from '../utils/contentLoader.ts'
import { HiAcademicCap } from 'react-icons/hi'
import { TbCalendar, TbMapPin, TbMedal, TbExternalLink } from 'react-icons/tb'

const courseLinks: Record<string, string> = {
  'Data Structures & Algorithms': 'https://cp-algorithms.com/',
  'Operating Systems': 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
  'Cloud Computing': 'https://aws.amazon.com/what-is-cloud-computing/',
  'Database Management Systems': 'https://use-the-index-luke.com/',
  'Object Oriented Programming': 'https://refactoring.guru/design-patterns',
}

export default function Education() {
  const edu = getEducation()

  return (
    <section id="education" className="py-16">
      <h2 className="section-heading animate-fade-up">Education</h2>
      <div className="mt-8 card-elevated overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-5 p-6 border-b border-[var(--border-color)]">
          <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-2xl bg-purple-500/10">
            <HiAcademicCap className="text-purple-500 dark:text-purple-400" size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[var(--color-text-bright)]">{edu.institution}</h3>
            <p className="text-sm font-semibold text-[var(--color-primary)] mt-0.5">{edu.degree}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <TbMapPin size={12} />
                {edu.location}
              </span>
              <span className="flex items-center gap-1">
                <TbCalendar size={12} />
                {edu.period}
              </span>
              {edu.cgpa && (
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <TbMedal size={12} />
                  CGPA {edu.cgpa} / 10
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Coursework */}
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            Relevant Coursework
          </p>
          <div className="flex flex-wrap gap-2">
            {edu.coursework.map((course: string) => {
              const url = courseLinks[course]
              const inner = (
                <>
                  <span>{course}</span>
                  {url && <TbExternalLink size={11} className="opacity-40 shrink-0" />}
                </>
              )
              const base =
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text)] transition-all'
              return url ? (
                <a
                  key={course}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${base} border border-purple-500/25 bg-[var(--bg-surface)] hover:scale-105 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer`}
                >
                  {inner}
                </a>
              ) : (
                <span
                  key={course}
                  className={`${base} border border-[var(--border-color)] bg-[var(--bg-surface)]`}
                >
                  {inner}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
