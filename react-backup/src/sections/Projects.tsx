import { useEffect, useState } from 'react'
import { FiGithub, FiExternalLink, FiStar, FiGitBranch, FiBookmark } from 'react-icons/fi'
import ProjectSkeleton from '../components/ProjectSkeleton.tsx'
import staticProjectsRaw from '../content/projects.json'

type Project = {
  id: string
  name: string
  description: string
  url: string
  stack: string[]
  stars?: number
  forks?: number
  lastUpdated?: string
  isResumeProject?: boolean
}

const STATIC_PROJECTS = staticProjectsRaw as Project[]

const RESUME_PROJECT_OVERRIDES: Record<string, Partial<Project>> = {
  'training-upskilling-v2': {
    description: 'Full-stack e-learning platform for 500+ users with real-time progress tracking, automated workflows, course management, scheduling, and certificate automation. Reduced manual administrative effort by 6+ hours/week.',
    stack: ['Angular.js', 'TypeScript', 'MySQL'],
    isResumeProject: true,
  },
  'training-upskilling': {
    description: 'Full-stack e-learning platform for 500+ users with real-time progress tracking, automated workflows, course management, scheduling, and certificate automation.',
    stack: ['Angular.js', 'TypeScript', 'MySQL'],
    isResumeProject: true,
  },
  'automated-deployment-pipeline': {
    description: 'Automated CI/CD pipeline on AWS EC2 with Jenkins, Ansible, Docker, and Kubernetes to streamline deployments and release management across distributed environments.',
    stack: ['Jenkins', 'AWS EC2', 'Ansible', 'Docker', 'Kubernetes'],
    isResumeProject: true,
  },
  portfolio: {
    description: 'Personal portfolio website featuring an interactive resume viewer, a real-time system observability cockpit, an AI-powered chatbot, and a glassmorphic design system.',
    stack: ['React', 'TypeScript', 'TailwindCSS', 'Vite'],
    isResumeProject: true,
  },
}

const RESUME_PROJECT_NAMES = Object.keys(RESUME_PROJECT_OVERRIDES)

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks'>('updated')

  useEffect(() => {
    const fetchProjects = async () => {
      const cached = sessionStorage.getItem('github_repos')
      const cachedAt = sessionStorage.getItem('github_repos_at')
      if (cached && cachedAt && Date.now() - parseInt(cachedAt) < 15 * 60 * 1000) {
        try {
          const parsed = JSON.parse(cached) as Project[]
          if (parsed.length > 0) { setProjects(parsed); setLoading(false); return }
        } catch { /* fall through */ }
      }

      try {
        const url = import.meta.env.DEV
          ? 'https://api.github.com/users/parthnautiyal/repos?sort=updated&per_page=50'
          : '/api/github?username=parthnautiyal'

        const res = await fetch(url)
        if (!res.ok) throw new Error(`${res.status}`)

        const repos = (await res.json()) as any[]
        const mapped: Project[] = repos
          .filter(r => !r.fork)
          .map(r => {
            const key = r.name.toLowerCase()
            const override = RESUME_PROJECT_OVERRIDES[key] || {}
            return {
              id: key,
              name: r.name,
              description: override.description || r.description || '',
              url: r.html_url,
              stack: override.stack ?? (r.topics?.length ? r.topics : r.language ? [r.language] : ['Software Engineering']),
              stars: r.stargazers_count,
              forks: r.forks_count,
              lastUpdated: r.pushed_at,
              isResumeProject: override.isResumeProject ?? RESUME_PROJECT_NAMES.includes(key),
            }
          })

        if (mapped.length > 0) {
          setProjects(mapped)
          sessionStorage.setItem('github_repos', JSON.stringify(mapped))
          sessionStorage.setItem('github_repos_at', Date.now().toString())
        }
      } catch (err) {
        console.warn('GitHub API failed, using bundled data:', err)
        // STATIC_PROJECTS already set as initial state — no-op
      } finally {
        setLoading(false)
      }
    }
    void fetchProjects()
  }, [])

  // Split projects into resume-pinned and the rest
  const sortOthers = (list: Project[]) =>
    [...list].sort((a, b) => {
      if (sortBy === 'updated') {
        return (
          (b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0) -
          (a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0)
        )
      }
      if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0)
      if (sortBy === 'forks') return (b.forks || 0) - (a.forks || 0)
      return 0
    })

  const resumeProjects = projects.filter((p) => p.isResumeProject)
  const otherProjects = sortOthers(projects.filter((p) => !p.isResumeProject))
  const displayProjects = [...resumeProjects, ...otherProjects].slice(0, 12)

  return (
    <section id="projects" className="py-16 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        <div>
          <h2 className="section-heading">Projects</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Resume projects are pinned · others sorted by your selection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="project-sort" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sort By
          </label>
          <select
            id="project-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs rounded-xl glass-panel px-3 py-2 outline-none dark:bg-slate-900 border-none cursor-pointer text-[var(--color-text)]"
          >
            <option value="updated">Latest Updated</option>
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <><ProjectSkeleton /><ProjectSkeleton /><ProjectSkeleton /></>
        ) : displayProjects.map((project) => (
            <a
              key={project.id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group glass-card flex flex-col justify-between p-5 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-sky-400/10 hover:border-blue-500/30 dark:hover:border-sky-400/30 ${
                project.isResumeProject ? 'ring-1 ring-blue-500/20 dark:ring-sky-400/20' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {project.isResumeProject && (
                      <span title="Featured in resume" className="text-blue-500 dark:text-sky-400">
                        <FiBookmark size={13} />
                      </span>
                    )}
                    <FiGithub className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors" size={16} />
                  </div>
                </div>
                {project.description && (
                  <p className="text-[0.7rem] leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    {project.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {project.stack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[0.6rem] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 capitalize"
                    >
                      {tech.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200/40 dark:border-slate-800/40 pt-3 flex items-center justify-between text-[0.65rem]">
                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-sky-400 group-hover:gap-2 transition-all">
                  View Repo
                  <FiExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>

                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  {project.stars !== undefined && project.stars > 0 && (
                    <span className="flex items-center gap-0.5">
                      <FiStar size={10} />
                      {project.stars}
                    </span>
                  )}
                  {project.forks !== undefined && project.forks > 0 && (
                    <span className="flex items-center gap-0.5">
                      <FiGitBranch size={10} />
                      {project.forks}
                    </span>
                  )}
                  {project.lastUpdated && (
                    <span>
                      {new Date(project.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
      </div>
    </section>
  )
}
