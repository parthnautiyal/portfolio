import { useState } from 'react'
import { getPersonal, getExperience, getEducation, getSkills } from '../utils/contentLoader.ts'
import { FiDownload, FiPrinter, FiCopy, FiCheck, FiSliders, FiEye, FiFileText } from 'react-icons/fi'
import * as SimpleIcons from 'react-icons/si'
import * as TablerIcons from 'react-icons/tb'

type RecruiterFocus = 'all' | 'backend' | 'devops' | 'fullstack'

export default function ResumeViewerPage() {
  const personal = getPersonal()
  const experience = getExperience()
  const education = getEducation()
  const skillCategories = getSkills()

  const [activeTab, setActiveTab] = useState<'interactive' | 'pdf'>('interactive')
  const [recruiterFocus, setRecruiterFocus] = useState<RecruiterFocus>('all')
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Copy plain text representation of the resume to clipboard
  const handleCopyText = async () => {
    const expText = experience
      .map(
        (exp: any) =>
          `${exp.role} at ${exp.company} (${exp.period})\n${exp.location}\n` +
          exp.bullets.map((b: string) => `• ${b}`).join('\n')
      )
      .join('\n\n')

    const skillsText = skillCategories
      .map((cat) => `${cat.name}: ${cat.items.map((s) => s.name).join(', ')}`)
      .join('\n')

    const plainTextResume = `
PARTH NAUTIYAL
${personal.title}
Email: ${personal.email} | Phone: ${personal.phone}
LinkedIn: ${personal.linkedin} | GitHub: ${personal.github} | LeetCode: ${personal.leetcode}

SUMMARY
${personal.summary}

PROFESSIONAL EXPERIENCE
${expText}

EDUCATION
${education.degree} - ${education.institution} (${education.period})
Location: ${education.location} | CGPA: ${education.cgpa}
Coursework: ${education.coursework.join(', ')}

TECHNICAL SKILLS
${skillsText}
    `.trim()

    try {
      await navigator.clipboard.writeText(plainTextResume)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy resume text:', err)
    }
  }

  // Print resume (opens system print dialog focused on the interactive container)
  const handlePrint = () => {
    window.print()
  }

  // Check if a skill or bullet should be highlighted based on focus filter
  const isHighlighted = (text: string, category?: string): boolean => {
    const t = text.toLowerCase()
    const c = category?.toLowerCase() ?? ''
    
    if (recruiterFocus === 'backend') {
      return (
        t.includes('spring boot') ||
        t.includes('java') ||
        t.includes('kafka') ||
        t.includes('temporal') ||
        t.includes('microservice') ||
        t.includes('sql') ||
        t.includes('rest api') ||
        t.includes('idempotency') ||
        t.includes('workflow') ||
        c.includes('backend') ||
        c.includes('database') ||
        c.includes('messaging')
      )
    }
    
    if (recruiterFocus === 'devops') {
      return (
        t.includes('kubernetes') ||
        t.includes('docker') ||
        t.includes('helm') ||
        t.includes('ci/cd') ||
        t.includes('jenkins') ||
        t.includes('ansible') ||
        t.includes('grafana') ||
        t.includes('prometheus') ||
        t.includes('datadog') ||
        t.includes('observability') ||
        c.includes('devops') ||
        c.includes('observability')
      )
    }
    
    if (recruiterFocus === 'fullstack') {
      return (
        t.includes('react') ||
        t.includes('typescript') ||
        t.includes('angular') ||
        t.includes('html') ||
        t.includes('css') ||
        t.includes('frontend') ||
        c.includes('programming') ||
        c.includes('tools')
      )
    }
    
    return false
  }

  // Highlight search terms
  const highlightSearchText = (text: string) => {
    if (!searchTerm.trim()) return text

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-amber-500/30 text-[var(--color-text-bright)] px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  return (
    <section className="py-8 space-y-8 animate-fade-up">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-4 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Interactive Resume</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse my experience, filter by job requirements, or inspect the original PDF copy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--color-text-bright)] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <FiCheck className="text-green-500" /> Copied Text
              </>
            ) : (
              <>
                <FiCopy /> Copy Plain Text
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--color-text-bright)] transition-all cursor-pointer"
          >
            <FiPrinter /> Print Resume
          </button>
          <a
            href={personal.resumeUrl}
            download="Parth_Nautiyal_Resume.pdf"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FiDownload /> Download PDF
          </a>
        </div>
      </div>

      {/* Recruiter Controls Block */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-sky-400 shrink-0">
            <FiSliders size={16} />
          </span>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-bright)]">Recruiter Role Focus</h3>
            <p className="text-[0.65rem] text-slate-500">Highlight bullets matching target role profile</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
          {(['all', 'backend', 'devops', 'fullstack'] as const).map((focus) => (
            <button
              key={focus}
              onClick={() => setRecruiterFocus(focus)}
              className={`px-3 py-1.5 rounded-full text-[0.65rem] font-bold tracking-wide capitalize transition-all cursor-pointer ${
                recruiterFocus === focus
                  ? 'bg-blue-600 text-white dark:bg-sky-500'
                  : 'bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-[var(--color-text)]'
              }`}
            >
              {focus === 'all' ? 'Standard Resume' : `${focus} engineering`}
            </button>
          ))}
        </div>

        <div className="w-full md:w-56">
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
          />
        </div>
      </div>

      {/* Mobile view selectors */}
      <div className="flex md:hidden glass-panel p-1 rounded-xl print:hidden">
        <button
          onClick={() => setActiveTab('interactive')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'interactive'
              ? 'bg-blue-600 text-white dark:bg-sky-500'
              : 'text-[var(--color-text)]'
          }`}
        >
          <FiFileText size={14} /> Interactive View
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'pdf'
              ? 'bg-blue-600 text-white dark:bg-sky-500'
              : 'text-[var(--color-text)]'
          }`}
        >
          <FiEye size={14} /> Original PDF
        </button>
      </div>

      {/* Grid workspace */}
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] print:block">
        {/* Left Side: Dynamic resume content */}
        <div
          id="printable-resume-area"
          className={`space-y-8 glass-card p-6 md:p-8 print:border-none print:shadow-none print:bg-white print:text-black print:p-0 ${
            activeTab === 'interactive' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Header */}
          <div className="text-center md:text-left space-y-2 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 print:text-black">
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-bright)] print:text-black print:text-2xl">
              {personal.name}
            </h1>
            <p className="text-sm font-semibold text-blue-600 dark:text-sky-400 print:text-blue-600">
              {personal.title}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 print:text-slate-700">
              <span>{personal.email}</span>
              <span>•</span>
              <span>{personal.phone}</span>
              <span>•</span>
              <a href={personal.linkedin} className="hover:underline">LinkedIn</a>
              <span>•</span>
              <a href={personal.github} className="hover:underline">GitHub</a>
              <span>•</span>
              <a href={personal.leetcode} className="hover:underline">LeetCode</a>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2 print:text-black">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 border-b border-blue-500/10 pb-1 print:text-blue-600 print:border-blue-500/20">
              Summary
            </h2>
            <p className="text-sm leading-relaxed text-[var(--color-text)] dark:text-slate-300 print:text-slate-800">
              {highlightSearchText(personal.summary)}
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-5 print:text-black">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 border-b border-blue-500/10 pb-1 print:text-blue-600 print:border-blue-500/20">
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp: any) => (
                <div key={exp.role + exp.company} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-sm font-bold text-[var(--color-text-bright)] print:text-black">
                      {exp.role}{' '}
                      <span className="font-semibold text-slate-500 dark:text-slate-400 print:text-slate-700">
                        at {exp.company}
                      </span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700 shrink-0">
                      {exp.period} | {exp.location}
                    </span>
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-2">
                    {exp.bullets.map((bullet: string) => {
                      const shouldHighlight = recruiterFocus !== 'all' && isHighlighted(bullet)
                      return (
                        <li
                          key={bullet}
                          className={`text-sm leading-relaxed transition-all duration-300 rounded-lg p-1 -ml-1 ${
                            shouldHighlight
                              ? 'bg-blue-600/10 text-[var(--color-text-bright)] font-medium border-l-2 border-blue-500 pl-2'
                              : 'text-[var(--color-text)] dark:text-slate-300 print:text-slate-800'
                          }`}
                        >
                          {highlightSearchText(bullet)}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-3 print:text-black">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 border-b border-blue-500/10 pb-1 print:text-blue-600 print:border-blue-500/20">
              Education
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-bold text-[var(--color-text-bright)] print:text-black">
                  {education.degree}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700">
                  {education.period}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 print:text-slate-800">
                {education.institution} · {education.location}
              </p>
              <p className="text-xs font-semibold text-[var(--color-text)] print:text-slate-800">
                CGPA/GPA: <span className="text-blue-600 dark:text-sky-400">{education.cgpa}</span>
              </p>
              <div className="pt-1">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Key Coursework:
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed print:text-slate-700">
                  {education.coursework.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4 print:text-black">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 border-b border-blue-500/10 pb-1 print:text-blue-600 print:border-blue-500/20">
              Skills Grid
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {skillCategories.map((cat) => (
                <div key={cat.name} className="border border-[var(--border-color)] dark:border-slate-800/40 rounded-xl p-3 bg-slate-900/10 print:border-slate-300 print:bg-transparent">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-slate-800 border-b border-slate-200/20 dark:border-slate-800/40 pb-1 mb-2">
                    {cat.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((skill) => {
                      const IconComponent =
                        (SimpleIcons as any)[skill.icon] ?? (TablerIcons as any)[skill.icon]
                      const shouldHighlight = recruiterFocus !== 'all' && isHighlighted(skill.name, cat.name)
                      return (
                        <span
                          key={skill.name}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.65rem] font-medium border transition-all ${
                            shouldHighlight
                              ? 'bg-blue-600/10 border-blue-500 text-blue-500 font-bold scale-105'
                              : 'bg-slate-100 dark:bg-slate-800/40 text-[var(--color-text)] border-[var(--border-color)] print:border-slate-200'
                          }`}
                        >
                          {IconComponent && (
                            <IconComponent style={{ color: skill.color }} size={12} className="shrink-0" />
                          )}
                          {skill.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Authentic PDF frame embed */}
        <div
          className={`h-[780px] glass-card p-2 print:hidden ${
            activeTab === 'pdf' ? 'block' : 'hidden md:block'
          }`}
        >
          <object
            data={personal.resumeUrl}
            type="application/pdf"
            className="w-full h-full rounded-xl overflow-hidden border border-[var(--border-color)]"
          >
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <FiEye size={40} className="text-slate-400" />
              <div>
                <p className="text-xs font-bold">PDF rendering is not supported by your browser.</p>
                <p className="text-[0.65rem] text-slate-500 mt-1">
                  You can click below to download the PDF directly to view.
                </p>
              </div>
              <a
                href={personal.resumeUrl}
                download="Parth_Nautiyal_Resume.pdf"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md transition-colors"
              >
                <FiDownload /> Download Resume
              </a>
            </div>
          </object>
        </div>
      </div>
    </section>
  )
}
