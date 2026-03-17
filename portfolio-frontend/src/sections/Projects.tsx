import { useEffect, useState } from 'react'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import ProjectSkeleton from '../components/ProjectSkeleton'

type Project = {
  id: string
  name: string
  description: string
  url: string
  stack: string[]
  lastUpdated?: string
}

const mockProjects: Project[] = [
  {
    id: 'training-upskilling-v2',
    name: 'Training and Upskilling v2',
    description:
      'Full-stack e-learning platform with course publishing, real-time progress tracking, and interactive dashboards.',
    url: 'https://github.com/your-github-username/training-upskilling-v2',
    stack: ['TypeScript', 'Angular.js', 'MySQL'],
  },
  {
    id: 'automated-deployment-pipeline',
    name: 'Automated Deployment Pipeline',
    description:
      'Automated CI/CD pipeline on AWS EC2 with Jenkins, Ansible, Docker, and Kubernetes to streamline deployments.',
    url: 'https://github.com/your-github-username/automated-deployment-pipeline',
    stack: ['Jenkins', 'AWS EC2', 'Ansible', 'Docker', 'Kubernetes'],
  },
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
    if (!baseUrl) return

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${baseUrl}/projects`)
        if (!res.ok) {
          throw new Error('Failed to fetch projects')
        }
        const data = (await res.json()) as Project[]
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data)
        }
      } catch {
        // fallback to mockProjects
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <section id="projects" className="py-16">
      <h2 className="section-heading animate-fade-up">Projects</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {loading ? (
          <>
            <ProjectSkeleton />
            <ProjectSkeleton />
          </>
        ) : (
          projects.map((project) => (
          <article
            key={project.id}
            className="group card-elevated flex flex-col justify-between p-5 transition-all hover:scale-[1.02]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {project.name}
                </h3>
                <FiGithub className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" size={18} />
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{project.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[0.65rem] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View on GitHub
                <FiExternalLink size={12} />
              </a>
              {project.lastUpdated && (
                <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                  Updated {new Date(project.lastUpdated).toLocaleDateString()}
                </span>
              )}
            </div>
          </article>
          ))
        )}
      </div>
    </section>
  )
}

