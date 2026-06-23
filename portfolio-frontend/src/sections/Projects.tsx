import { useEffect, useState } from 'react'
import { FiGithub, FiExternalLink, FiStar, FiGitBranch } from 'react-icons/fi'
import ProjectSkeleton from '../components/ProjectSkeleton'

type Project = {
  id: string
  name: string
  description: string
  url: string
  stack: string[]
  stars?: number
  forks?: number
  lastUpdated?: string
}

const mockProjects: Project[] = [
  {
    id: 'training-upskilling-v2',
    name: 'training-upskilling-v2',
    description:
      'Full-stack e-learning platform with course publishing, real-time progress tracking, and interactive dashboards.',
    url: 'https://github.com/parthnautiyal/training-upskilling-v2',
    stack: ['TypeScript', 'Angular.js', 'MySQL'],
    stars: 5,
    forks: 2
  },
  {
    id: 'automated-deployment-pipeline',
    name: 'automated-deployment-pipeline',
    description:
      'Automated CI/CD pipeline on AWS EC2 with Jenkins, Ansible, Docker, and Kubernetes to streamline deployments.',
    url: 'https://github.com/parthnautiyal/automated-deployment-pipeline',
    stack: ['Jenkins', 'AWS EC2', 'Ansible', 'Docker', 'Kubernetes'],
    stars: 8,
    forks: 3
  },
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks'>('updated')

  useEffect(() => {
    const fetchGitHubProjects = async () => {
      // 1. Check Session Storage Cache
      const cached = sessionStorage.getItem('github_repos')
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Project[]
          if (parsed && parsed.length > 0) {
            setProjects(parsed)
            return
          }
        } catch {
          // ignore cache error and fetch
        }
      }

      setLoading(true)
      try {
        const response = await fetch('https://api.github.com/users/parthnautiyal/repos?sort=updated&per_page=30')
        if (!response.ok) {
          throw new Error('GitHub API limit reached or failed')
        }

        const repos = await response.json() as any[]
        
        // Filter and map repos.
        const mapped: Project[] = repos
          .filter(repo => !repo.fork)
          .map(repo => {
            const stack = repo.topics && repo.topics.length > 0 
              ? repo.topics 
              : repo.language ? [repo.language] : ['Software Engineering']

            return {
              id: repo.name.toLowerCase(),
              name: repo.name,
              description: repo.description || 'Professional software repository showcasing scalable systems implementation.',
              url: repo.html_url,
              stack: stack,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              lastUpdated: repo.pushed_at
            }
          })

        if (mapped.length > 0) {
          setProjects(mapped)
          sessionStorage.setItem('github_repos', JSON.stringify(mapped))
        }
      } catch (err) {
        console.warn('GitHub API failed, falling back to mock portfolio data:', err)
        setProjects(mockProjects)
      } finally {
        setLoading(false)
      }
    }

    void fetchGitHubProjects()
  }, [])

  const sortedProjects = [...projects]
    .sort((a, b) => {
      if (sortBy === 'updated') {
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0
        return dateB - dateA
      }
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0)
      }
      if (sortBy === 'forks') {
        return (b.forks || 0) - (a.forks || 0)
      }
      return 0
    })
    .slice(0, 9) // Highlight top 9 repositories

  return (
    <section id="projects" className="py-16 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        <div>
          <h2 className="section-heading">Projects</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            A dynamic grid of software repositories queried directly from the GitHub API.
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
          sortedProjects.map((project) => (
            <article
              key={project.id}
              className="group glass-card flex flex-col justify-between p-5 transition-all hover:scale-[1.02]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors">
                    {project.name}
                  </h3>
                  <FiGithub className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" size={16} />
                </div>
                <p className="text-[0.7rem] leading-relaxed text-slate-600 dark:text-slate-300 min-h-[50px] line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {project.stack.map((tech) => (
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
                  rel="noreferrer"
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
                      Updated {new Date(project.lastUpdated).toLocaleDateString()}
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
