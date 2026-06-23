import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERNAME = 'parthnautiyal'
const OUTPUT = join(__dirname, '../src/content/projects.json')

const RESUME_PROJECT_OVERRIDES = {
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
    description: 'Personal portfolio website featuring AI-powered chatbot, ATS resume analyzer, observability playground, and glassmorphic design system.',
    stack: ['React', 'TypeScript', 'TailwindCSS', 'Vite'],
    isResumeProject: true,
  },
}

const RESUME_PROJECT_NAMES = Object.keys(RESUME_PROJECT_OVERRIDES)

async function main() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'portfolio-build',
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  console.log('Fetching GitHub repos...')

  let repos
  try {
    const res = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=50`,
      { headers }
    )

    if (!res.ok) {
      const remaining = res.headers.get('x-ratelimit-remaining')
      const reset = res.headers.get('x-ratelimit-reset')
      console.warn(`GitHub API ${res.status}. Remaining: ${remaining}. Reset: ${reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'unknown'}`)
      if (existsSync(OUTPUT)) {
        console.log('Keeping existing projects.json')
      } else {
        writeFileSync(OUTPUT, JSON.stringify([], null, 2))
        console.log('Wrote empty projects.json (API failed, no existing file)')
      }
      return
    }

    repos = await res.json()
  } catch (err) {
    console.error('Network error fetching repos:', err.message)
    if (!existsSync(OUTPUT)) writeFileSync(OUTPUT, JSON.stringify([], null, 2))
    return
  }

  const mapped = repos
    .filter(repo => !repo.fork)
    .map(repo => {
      const key = repo.name.toLowerCase()
      const override = RESUME_PROJECT_OVERRIDES[key] || {}
      const stack =
        override.stack ??
        (repo.topics?.length > 0 ? repo.topics : repo.language ? [repo.language] : ['Software Engineering'])

      return {
        id: key,
        name: repo.name,
        description: override.description || repo.description || 'Professional software repository showcasing scalable systems implementation.',
        url: repo.html_url,
        stack,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        lastUpdated: repo.pushed_at,
        isResumeProject: override.isResumeProject ?? RESUME_PROJECT_NAMES.includes(key),
      }
    })

  writeFileSync(OUTPUT, JSON.stringify(mapped, null, 2))
  console.log(`Wrote ${mapped.length} repos → src/content/projects.json`)
}

main().catch(err => {
  console.error('fetch-projects failed:', err)
  // Never fail the build
})
