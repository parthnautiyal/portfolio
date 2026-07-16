import { Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import staticProjectsRaw from '../../content/projects.json';

type Project = {
  id: string;
  name: string;
  description: string;
  url: string;
  stack: string[];
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  isResumeProject?: boolean;
};

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
    stack: ['Angular', 'TypeScript', 'TailwindCSS', 'PostCSS'],
    isResumeProject: true,
  },
};

const RESUME_PROJECT_NAMES = Object.keys(RESUME_PROJECT_OVERRIDES);

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.css']
})
export class ProjectsPageComponent implements OnInit {
  projects: Project[] = staticProjectsRaw as Project[];
  loading = true;
  sortBy: 'updated' | 'stars' | 'forks' = 'updated';

  ngOnInit() {
    this.fetchProjects();
  }

  async fetchProjects() {
    const cached = sessionStorage.getItem('github_repos');
    const cachedAt = sessionStorage.getItem('github_repos_at');
    if (cached && cachedAt && Date.now() - parseInt(cachedAt, 10) < 15 * 60 * 1000) {
      try {
        const parsed = JSON.parse(cached) as Project[];
        if (parsed.length > 0) {
          this.projects = parsed;
          this.loading = false;
          return;
        }
      } catch {
        // fall through
      }
    }

    try {
      const devMode = isDevMode();
      const url = devMode
        ? 'https://api.github.com/users/parthnautiyal/repos?sort=updated&per_page=50'
        : '/api/github?username=parthnautiyal';

      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);

      const repos = (await res.json()) as any[];
      const mapped: Project[] = repos
        .filter(r => !r.fork)
        .map(r => {
          const key = r.name.toLowerCase();
          const override = RESUME_PROJECT_OVERRIDES[key] || {};
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
          };
        });

      if (mapped.length > 0) {
        this.projects = mapped;
        sessionStorage.setItem('github_repos', JSON.stringify(mapped));
        sessionStorage.setItem('github_repos_at', Date.now().toString());
      }
    } catch (err) {
      console.warn('GitHub API failed, using bundled data:', err);
    } finally {
      this.loading = false;
    }
  }

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value as 'updated' | 'stars' | 'forks';
  }

  get displayProjects(): Project[] {
    const resume = this.projects.filter(p => p.isResumeProject);
    const others = this.projects.filter(p => !p.isResumeProject);

    const sortedOthers = [...others].sort((a, b) => {
      if (this.sortBy === 'updated') {
        return (b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0) -
               (a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0);
      }
      if (this.sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
      if (this.sortBy === 'forks') return (b.forks || 0) - (a.forks || 0);
      return 0;
    });

    return [...resume, ...sortedOthers].slice(0, 12);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
