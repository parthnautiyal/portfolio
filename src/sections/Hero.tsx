import { Link } from 'react-router-dom'
import { getPersonal } from '../utils/contentLoader.ts'
import { SiSpringboot, SiKubernetes, SiDocker, SiGithubactions, SiOpenjdk } from 'react-icons/si'

export default function Hero() {
  const personal = getPersonal()
  return (
    <section id="top" className="relative py-24 md:py-32">
      {/* Seamless decorative glows — no banding or clipping borders */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-[500px] w-[600px] rounded-full bg-orange-500/8 blur-[130px] dark:bg-indigo-500/12" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[500px] rounded-full bg-amber-500/8 blur-[130px] dark:bg-purple-500/10" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/10 to-transparent dark:via-indigo-500/15" />
      </div>
      
      <div className="grid gap-12 md:grid-cols-[1.3fr_0.7fr] md:items-center">
        <div className="space-y-8 animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary)]">
            Full-Stack Developer
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            Hi, I&apos;m{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400 inline-block isolate">
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
            <Link
              to="/resume"
              className="rounded-full bg-[var(--color-primary)] hover:opacity-90 text-white px-7 py-3 font-semibold shadow-lg hover:shadow-[var(--color-primary)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
            >
              View Resume
            </Link>
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
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-[var(--color-primary)] shadow-md group">
              <img
                src="/parth_avatar.jpg"
                alt="Parth Nautiyal"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-[var(--color-text-bright)] text-base">Parth Nautiyal</p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Building reliable backend systems, automating deployments, and
                improving developer experience through clean tooling.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <a
                href="https://www.java.com"
                target="_blank"
                rel="noreferrer"
                className="pill flex items-center gap-1.5 group/pill hover:border-[var(--color-primary)] hover:text-[var(--color-text-bright)] cursor-pointer"
              >
                <SiOpenjdk className="text-orange-600 dark:text-orange-405 group-hover/pill:scale-110 transition-all duration-200" size={12} />
                Java
              </a>
              <a
                href="https://spring.io/projects/spring-boot"
                target="_blank"
                rel="noreferrer"
                className="pill flex items-center gap-1.5 group/pill hover:border-[var(--color-primary)] hover:text-[var(--color-text-bright)] cursor-pointer"
              >
                <SiSpringboot className="text-green-650 dark:text-green-400 group-hover/pill:scale-110 transition-all duration-200" size={12} />
                Spring Boot
              </a>
              <a
                href="https://kubernetes.io"
                target="_blank"
                rel="noreferrer"
                className="pill flex items-center gap-1.5 group/pill hover:border-[var(--color-primary)] hover:text-[var(--color-text-bright)] cursor-pointer"
              >
                <SiKubernetes className="text-blue-600 dark:text-blue-400 group-hover/pill:scale-110 transition-all duration-200" size={12} />
                Kubernetes
              </a>
              <a
                href="https://www.docker.com"
                target="_blank"
                rel="noreferrer"
                className="pill flex items-center gap-1.5 group/pill hover:border-[var(--color-primary)] hover:text-[var(--color-text-bright)] cursor-pointer"
              >
                <SiDocker className="text-blue-500 dark:text-blue-400 group-hover/pill:scale-110 transition-all duration-200" size={12} />
                Docker
              </a>
              <a
                href="https://github.com/features/actions"
                target="_blank"
                rel="noreferrer"
                className="pill flex items-center gap-1.5 group/pill hover:border-[var(--color-primary)] hover:text-[var(--color-text-bright)] cursor-pointer"
              >
                <SiGithubactions className="text-slate-800 dark:text-slate-200 group-hover/pill:scale-110 transition-all duration-200" size={12} />
                CI/CD
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

