import { Link } from 'react-router-dom'
import { personal } from '../content/personal'
import { SiSpringboot, SiKubernetes, SiDocker, SiGithubactions } from 'react-icons/si'

export default function Hero() {
  return (
    <section id="top" className="relative py-20 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-64 bg-gradient-to-b from-slate-100/80 via-slate-50/40 to-transparent dark:from-slate-800/50 dark:via-slate-900/30" />
      {/* Decorative circles */}
      <div className="pointer-events-none absolute right-0 top-10 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/10" />
      <div className="pointer-events-none absolute left-0 bottom-10 -z-10 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl dark:bg-purple-400/10" />
      <div className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
        <div className="space-y-6 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Portfolio
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl">
            {personal.name}
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {personal.title}
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {personal.summary}
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <a
              href={personal.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-900 px-5 py-2 font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-900 hover:text-white dark:border-slate-100 dark:text-slate-100 dark:hover:bg-slate-100 dark:hover:text-slate-900"
            >
              View Resume
            </a>
            <Link
              to="/projects"
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-slate-700 shadow-sm transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-100 dark:hover:text-slate-100"
            >
              View Projects
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-slate-700 shadow-sm transition hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-100 dark:hover:text-slate-100"
            >
              Contact Me
            </Link>
          </div>
        </div>

        <div className="animate-fade-up md:delay-100">
          <div className="card-elevated flex flex-col items-center gap-4 p-6 text-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
              PN
            </div>
            <p className="text-center text-xs text-slate-600 dark:text-slate-300">
              Building reliable backend systems, automating deployments, and
              improving developer experience through clean tooling.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-[0.65rem] text-slate-600 dark:text-slate-300">
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

