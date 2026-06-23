import { useEffect, useState } from 'react'
import { FiGithub, FiExternalLink, FiStar, FiGitBranch, FiBookmark } from 'react-icons/fi'
import ProjectSkeleton from '../components/ProjectSkeleton.tsx'

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

// Projects mentioned in Parth's resume — these are always pinned at the top
const RESUME_PROJECT_NAMES = [
  'training-upskilling-v2',
  'training-upskilling',
  'automated-deployment-pipeline',
  'portfolio',
]

// Enhanced descriptions & stacks from resume for known projects
const RESUME_PROJECT_OVERRIDES: Record<string, Partial<Project>> = {
  'training-upskilling-v2': {
    description:
      'Full-stack e-learning platform for 500+ users with real-time progress tracking, automated workflows, course management, scheduling, and certificate automation. Reduced manual administrative effort by 6+ hours/week.',
    stack: ['Angular.js', 'TypeScript', 'MySQL'],
    isResumeProject: true,
  },
  'training-upskilling': {
    description:
      'Full-stack e-learning platform for 500+ users with real-time progress tracking, automated workflows, course management, scheduling, and certificate automation.',
    stack: ['Angular.js', 'TypeScript', 'MySQL'],
    isResumeProject: true,
  },
  'automated-deployment-pipeline': {
    description:
      'Automated CI/CD pipeline on AWS EC2 with Jenkins, Ansible, Docker, and Kubernetes to streamline deployments and release management across distributed environments.',
    stack: ['Jenkins', 'AWS EC2', 'Ansible', 'Docker', 'Kubernetes'],
    isResumeProject: true,
  },
  portfolio: {
    description:
      'Personal portfolio website featuring AI-powered chatbot, ATS resume analyzer, observability playground, and glassmorphic design system.',
    stack: ['React', 'TypeScript', 'TailwindCSS', 'Vite'],
    isResumeProject: true,
  },
}

// Fallback projects if GitHub API fails
const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'training-upskilling-v2',
    name: 'training-upskilling-v2',
    description:
      'Full-stack e-learning platform for 500+ users with real-time progress tracking, automated workflows, course management, scheduling, and certificate automation. Reduced manual administrative effort by 6+ hours/week.',
    url: 'https://github.com/parthnautiyal/training-upskilling-v2',
    stack: ['Angular.js', 'TypeScript', 'MySQL'],
    stars: 5,
    forks: 2,
    isResumeProject: true,
  },
  {
    id: 'automated-deployment-pipeline',
    name: 'automated-deployment-pipeline',
    description:
      'Automated CI/CD pipeline on AWS EC2 with Jenkins, Ansible, Docker, and Kubernetes to streamline deployments.',
    url: 'https://github.com/parthnautiyal/automated-deployment-pipeline',
    stack: ['Jenkins', 'AWS EC2', 'Ansible', 'Docker', 'Kubernetes'],
    stars: 8,
    forks: 3,
    isResumeProject: true,
  },
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks'>('updated')
  const [githubError, setGithubError] = useState(false)

  useEffect(() => {
    const fetchGitHubProjects = async () => {
      // Check Session Storage Cache (15 min TTL)
      const cached = sessionStorage.getItem('github_repos')
      const cachedAt = sessionStorage.getItem('github_repos_at')
      if (cached && cachedAt) {
        const age = Date.now() - parseInt(cachedAt)
        if (age < 15 * 60 * 1000) {
          try {
            const parsed = JSON.parse(cached) as Project[]
            if (parsed && parsed.length > 0) {
              setProjects(parsed)
              setLoading(false)
              return
            }
          } catch {
            // ignore cache error, fall through to fetch
          }
        }
      }

      setLoading(true)
      setGithubError(false)
      try {
        const response = await fetch(
          'https://api.github.com/users/parthnautiyal/repos?sort=updated&per_page=50'
        )
        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`)
        }

        const repos = (await response.json()) as any[]

        // Map GitHub repos to our Project type
        const mapped: Project[] = repos
          .filter((repo) => !repo.fork)
          .map((repo) => {
            const key = repo.name.toLowerCase()
            const override = RESUME_PROJECT_OVERRIDES[key] || {}

            const stack =
              override.stack ??
              (repo.topics && repo.topics.length > 0
                ? repo.topics
                : repo.language
                ? [repo.language]
                : ['Software Engineering'])

            return {
              id: key,
              name: repo.name,
              description:
                override.description ||
                repo.description ||
                'Professional software repository showcasing scalable systems implementation.',
              url: repo.html_url,
              stack,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              lastUpdated: repo.pushed_at,
              isResumeProject: override.isResumeProject ?? RESUME_PROJECT_NAMES.includes(key),
            }
          })

        if (mapped.length > 0) {
          setProjects(mapped)
          sessionStorage.setItem('github_repos', JSON.stringify(mapped))
          sessionStorage.setItem('github_repos_at', Date.now().toString())
        }
      } catch (err) {
        console.warn('GitHub API failed, using fallback portfolio data:', err)
        setGithubError(true)
        setProjects(FALLBACK_PROJECTS)
      } finally {
        setLoading(false)
      }
    }

    void fetchGitHubProjects()
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
            {githubError
              ? 'Showing resume projects · GitHub API unavailable'
              : 'Resume projects are pinned · others sorted by your selection'}
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
          <>
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </>
        ) : (
          displayProjects.map((project) => (
            <article
              key={project.id}
              className={`group glass-card flex flex-col justify-between p-5 transition-all hover:scale-[1.02] ${
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
                    <FiGithub className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" size={16} />
                  </div>
                </div>
                <p className="text-[0.7rem] leading-relaxed text-slate-600 dark:text-slate-300 min-h-[50px] line-clamp-3">
                  {project.description}
                </p>
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
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  View Repo
                  <FiExternalLink size={10} />
                </a>

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
            </article>
          ))
        )}
      </div>
    </section>
  )
}
