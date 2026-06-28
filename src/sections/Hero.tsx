import { Link } from 'react-router-dom'
import { getPersonal } from '../utils/contentLoader.ts'
import { SiSpringboot, SiKubernetes, SiDocker, SiGithubactions, SiOpenjdk } from 'react-icons/si'

export default function Hero() {
  const personal = getPersonal()
  return (
    <section id="top" className="relative py-24 md:py-32">
      {/* Seamless decorative glows — no banding */}
      <div className="pointer-events-none absolute -inset-x-16 inset-y-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[600px] rounded-full bg-blue-500/8 blur-[120px] dark:bg-blue-400/12" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[500px] rounded-full bg-purple-500/8 blur-[120px] dark:bg-purple-400/10" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent dark:via-blue-400/15" />
      </div>
      
      <div className="grid gap-12 md:grid-cols-[1.3fr_0.7fr] md:items-center">
        <div className="space-y-8 animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary)]">
            Full-Stack Developer
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            Hi, I&apos;m{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-sky-400 dark:to-indigo-300">
              {personal.name}
            </span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-[var(--color-text-bright)]">
            {personal.title}
          </p>
          <p className="max-w-2xl text-base md:text-lg leading-relaxed text-[var(--color-text-muted)]">
            {personal.summary}
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4 text-sm">
            <a
              href={personal.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-7 py-3 font-semibold shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              View Resume
            </a>
            <Link
              to="/projects"
              className="rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--color-text-bright)] px-7 py-3 font-semibold shadow-sm transition-all hover:border-[var(--border-color-hover)] hover:scale-[1.02] active:scale-[0.98]"
            >
              View Projects
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--color-text-bright)] px-7 py-3 font-semibold shadow-sm transition-all hover:border-[var(--border-color-hover)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Me
            </Link>
          </div>
        </div>

        <div className="animate-fade-up md:delay-100 flex justify-center">
          <div className="card-elevated flex flex-col items-center gap-6 p-8 text-sm w-full max-w-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/10 text-xl font-bold text-blue-600 dark:bg-sky-400/10 dark:text-sky-400 border border-blue-500/20">
              PN
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-[var(--color-text-bright)] text-base">Parth Nautiyal</p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Building reliable backend systems, automating deployments, and
                improving developer experience through clean tooling.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="pill flex items-center gap-1">
                <SiOpenjdk className="text-orange-600 dark:text-orange-400" size={12} />
                Java
              </span>
              <span className="pill flex items-center gap-1">
                <SiSpringboot className="text-green-600 dark:text-green-400" size={12} />
                Spring Boot
              </span>
              <span className="pill flex items-center gap-1">
                <SiKubernetes className="text-blue-600 dark:text-blue-400" size={12} />
                Kubernetes
              </span>
              <span className="pill flex items-center gap-1">
                <SiDocker className="text-blue-500 dark:text-blue-400" size={12} />
                Docker
              </span>
              <span className="pill flex items-center gap-1">
                <SiGithubactions className="text-slate-800 dark:text-slate-200" size={12} />
                CI/CD
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

