import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { getPersonal, getExperience, getEducation, getSkills } from '../utils/contentLoader.ts'
import { FiDownload, FiPrinter, FiCopy, FiCheck, FiSliders, FiEye, FiFileText, FiMaximize, FiMinimize, FiChevronUp, FiChevronDown, FiExternalLink } from 'react-icons/fi'
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
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false)
  const [isPdfFullscreenClosing, setIsPdfFullscreenClosing] = useState(false)
  const [activeMatchIndex, setActiveMatchIndex] = useState(0)

  let matchGlobalCounter = 0

  // Lock background body scroll when fullscreen PDF is active
  useEffect(() => {
    if (isPdfFullscreen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isPdfFullscreen])

  // Pre-calculate search matches count to display X of Y
  const countMatches = (term: string) => {
    if (!term.trim()) return 0
    let count = 0
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(escapedTerm, 'gi')

    const summaryMatches = personal.summary.match(regex)
    if (summaryMatches) count += summaryMatches.length

    experience.forEach((exp: any) => {
      exp.bullets.forEach((bullet: string) => {
        const bulletMatches = bullet.match(regex)
        if (bulletMatches) count += bulletMatches.length
      })
    })

    return count
  }

  const totalMatches = countMatches(searchTerm)

  const handleNextMatch = () => {
    if (totalMatches === 0) return
    const nextIndex = (activeMatchIndex + 1) % totalMatches
    setActiveMatchIndex(nextIndex)
    scrollToMatch(nextIndex)
  }

  const handlePrevMatch = () => {
    if (totalMatches === 0) return
    const prevIndex = (activeMatchIndex - 1 + totalMatches) % totalMatches
    setActiveMatchIndex(prevIndex)
    scrollToMatch(prevIndex)
  }

  const scrollToMatch = (index: number) => {
    setTimeout(() => {
      const element = document.getElementById(`search-match-${index}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 45)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNextMatch()
    }
  }

  const handleOpenPdfFullscreen = () => {
    setIsPdfFullscreenClosing(false)
    setIsPdfFullscreen(true)
  }

  const handleClosePdfFullscreen = () => {
    setIsPdfFullscreenClosing(true)
    setTimeout(() => {
      setIsPdfFullscreen(false)
      setIsPdfFullscreenClosing(false)
    }, 280)
  }

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
    if (!searchTerm.trim()) return <>{text}</>

    const escapedTerm = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedTerm})`, 'gi'))
    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase() === searchTerm.toLowerCase()) {
            const currentIndex = matchGlobalCounter
            matchGlobalCounter++
            const isActive = currentIndex === activeMatchIndex

            return (
              <mark
                key={i}
                id={isActive ? `search-match-${currentIndex}` : undefined}
                className={`px-0.5 rounded transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-white dark:bg-amber-600 font-bold scale-[1.03] ring-2 ring-orange-500/20 dark:ring-amber-500/20'
                    : 'bg-yellow-250 dark:bg-amber-550/20 text-[var(--color-text-bright)]'
                }`}
              >
                {part}
              </mark>
            )
          }
          return part
        })}
      </>
    )
  }

  // Parse text and replace technical keywords/projects with interactive internal site links
  const renderLinkedText = (text: string) => {
    if (!text) return <></>

    const linksMap = [
      {
        pattern: /\bKafka\b/g,
        to: '/system?select=kafka'
      },
      {
        pattern: /\bTemporal\b/g,
        to: '/system?select=temporal'
      },
      {
        pattern: /\b(?:Kubernetes|K8s)\b/g,
        to: '/system?select=k8s'
      },
      {
        pattern: /\bResilience4j\b/g,
        to: '/system?select=circuit'
      },
      {
        pattern: /\bSpring Boot\b/g,
        to: '/system'
      },
      {
        pattern: /\b(?:CI\/CD pipelines|CI\/CD|Jenkins|Helm|Docker)\b/g,
        to: '/system'
      },
      {
        pattern: /\b(?:Java|TypeScript|REST APIs|APIs|JUnit|Mockito|TDD)\b/g,
        to: '/projects'
      },
      {
        pattern: /\b(?:microservices|microservice)\b/gi,
        to: '/projects'
      },
      {
        pattern: /\b(?:e-learning platform|training-upskilling)\b/gi,
        to: '/projects'
      },
      {
        pattern: /\b(?:ZopSmart)\b/g,
        to: '/experience'
      },
      {
        pattern: /\b(?:Lovely Professional University)\b/g,
        to: '/experience'
      },
      {
        pattern: /\b(?:B\.Tech)\b/g,
        to: '/experience'
      },
      {
        pattern: /\b(?:email|phone|contact)\b/gi,
        to: '/contact'
      }
    ]

    type Token = {
      text: string
      isLink: boolean
      to?: string
    }

    let tokens: Token[] = [{ text, isLink: false }]

    for (const mapping of linksMap) {
      const nextTokens: Token[] = []
      for (const token of tokens) {
        if (token.isLink) {
          nextTokens.push(token)
          continue
        }

        const parts = token.text.split(mapping.pattern)
        const matches = token.text.match(mapping.pattern) || []

        parts.forEach((part, index) => {
          if (part) {
            nextTokens.push({ text: part, isLink: false })
          }
          if (index < matches.length) {
            nextTokens.push({ text: matches[index], isLink: true, to: mapping.to })
          }
        })
      }
      tokens = nextTokens
    }

    return (
      <>
        {tokens.map((token, idx) => {
          if (token.isLink && token.to) {
            return (
              <Link
                key={idx}
                to={token.to}
                className="text-blue-600 dark:text-sky-400 hover:underline font-semibold"
              >
                {highlightSearchText(token.text)}
              </Link>
            )
          }
          return <span key={idx}>{highlightSearchText(token.text)}</span>
        })}
      </>
    )
  }

  return (
    <section className="py-8 space-y-8 animate-scale-in">
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
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--color-text-bright)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FiExternalLink /> Open in New Tab
          </a>
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

        <div className="w-full md:w-64">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setActiveMatchIndex(0)
              }}
              onKeyDown={handleKeyDown}
              className="w-full text-xs rounded-xl glass-panel pl-3 pr-24 py-2 outline-none dark:bg-slate-900 border-none text-[var(--color-text)]"
            />
            {searchTerm.trim() && (
              <div className="absolute right-2.5 flex items-center gap-1 text-[0.6rem] text-slate-500 dark:text-slate-400 select-none font-mono">
                <span>
                  {totalMatches > 0 ? `${activeMatchIndex + 1}/${totalMatches}` : '0/0'}
                </span>
                <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={handlePrevMatch}
                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-805 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Previous match"
                >
                  <FiChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMatch}
                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-805 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Next match"
                >
                  <FiChevronDown size={12} />
                </button>
              </div>
            )}
          </div>
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
      <div className="grid gap-6 md:grid-cols-2 print:block items-start">
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
              {renderLinkedText(personal.summary)}
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
                          {renderLinkedText(bullet)}
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
          className={`glass-card p-3 print:hidden md:sticky md:top-24 h-[calc(100vh-8.5rem)] ${
            activeTab === 'pdf' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between pb-2 px-1 text-slate-400 select-none h-10">
            <span className="text-[0.6rem] font-bold uppercase tracking-wider">Authentic PDF Layout</span>
            <div className="flex items-center gap-2">
              <a
                href={personal.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[0.6rem] font-bold text-white border border-slate-700 cursor-pointer shadow transition-transform active:scale-95"
              >
                <FiExternalLink size={10} /> Open in New Tab
              </a>
              <button
                onClick={handleOpenPdfFullscreen}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[0.6rem] font-bold text-white border border-slate-700 cursor-pointer shadow transition-transform active:scale-95"
              >
                <FiMaximize size={10} /> Fullscreen
              </button>
            </div>
          </div>
          <div className="w-full h-[calc(100%-2.5rem)] flex justify-center items-center">
            <div className="h-full aspect-[8.5/11] max-w-full relative rounded-xl overflow-hidden border border-[var(--border-color)]">
              <object
                data={`${personal.resumeUrl}#toolbar=1&navpanes=0&zoom=page-fit`}
                type="application/pdf"
                className="absolute inset-0 w-full h-full"
              >
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                  <FiEye size={40} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">PDF rendering is not supported by your browser.</p>
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
        </div>
      </div>

      {/* Fullscreen PDF overlay rendered via React Portal to prevent CSS transform positioning offset */}
      {isPdfFullscreen && createPortal(
        <div
          className={`fixed inset-0 z-50 bg-slate-200/85 dark:bg-slate-950/85 p-4 flex flex-col justify-center items-center print:hidden cursor-pointer backdrop-blur-md ${
            isPdfFullscreenClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
          onClick={handleClosePdfFullscreen}
        >
          <div
            className={`h-[96vh] w-[74vh] max-w-[95vw] bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-4 flex flex-col cursor-default shadow-2xl relative ${
              isPdfFullscreenClosing ? 'animate-mac-zoom-out' : 'animate-mac-zoom'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 select-none h-12">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FiFileText /> Parth_Nautiyal_Resume.pdf
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={personal.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-white cursor-pointer shadow transition-all active:scale-95"
                >
                  <FiExternalLink size={12} /> Open in New Tab
                </a>
                <button
                  onClick={handleClosePdfFullscreen}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-white cursor-pointer shadow transition-all active:scale-95"
                >
                  <FiMinimize size={12} /> Back to Page
                </button>
              </div>
            </div>
            {/* PDF Render Container */}
            <div className="flex-1 mt-4 relative w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/50">
              <object
                data={`${personal.resumeUrl}#toolbar=1&navpanes=0&zoom=page-fit`}
                type="application/pdf"
                className="absolute inset-0 w-full h-full"
              >
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                  <FiEye size={40} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">PDF rendering is not supported by your browser.</p>
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
        </div>,
        document.body
      )}
    </section>
  )
}
