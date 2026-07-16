import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Stage = {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'success' | 'checking';
  configTitle: string;
  configContent: string;
};

@Component({
  selector: 'app-pipeline-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipeline-visualizer.component.html',
  styleUrls: ['./pipeline-visualizer.component.css']
})
export class PipelineVisualizerComponent {
  activeStageId = 'vite-compile';

  pipelineStages: Stage[] = [
    {
      id: 'git-commit',
      name: 'GitHub Webhook',
      icon: 'FiGitCommit',
      description: 'Vercel GitHub integration detects push triggers to main branch and initiates automatic build.',
      status: 'success',
      configTitle: 'GitHub Repository push event webhook logs',
      configContent: `[10:45:12 AM] Git Commit Detected: 8af1a392 ("Refactor system architecture dashboard")
[10:45:13 AM] Triggering Vercel deployment pipeline...
[10:45:14 AM] Deploying branch: main (commit author: Parth Nautiyal)
[10:45:15 AM] Cloning repository from GitHub parthnautiyal/portfolio...
[10:45:16 AM] Environment variables successfully injected (GEMINI_API_KEY = encrypted)`
    },
    {
      id: 'vite-compile',
      name: 'Vite Compilation',
      icon: 'FiCode',
      description: 'Runs npm run build compiling TypeScript, minifying assets, and bundling modules via Vite.',
      status: 'success',
      configTitle: 'Vite static site compiler log output',
      configContent: `> portfolio-frontend@0.0.0 build
> tsc -b && vite build

vite v7.3.1 building for production...
transforming...
✓ 457 modules transformed.
rendering chunks...
computing html, css and js bundles...

dist/index.html                     3.45 kB │ gzip: 1.21 kB
dist/assets/index-D7b3e21a.css      18.42 kB │ gzip: 4.88 kB
dist/assets/index-B9e8f4c2.js      142.10 kB │ gzip: 44.52 kB
✓ built in 1.84s`
    },
    {
      id: 'postcss-purge',
      name: 'Tailwind CSS processing',
      icon: 'FiLayers',
      description: 'Processes utility classes using Tailwind CSS v4 and PostCSS autoprefixer, purging unused styles.',
      status: 'success',
      configTitle: 'PostCSS Tailwind v4 compiler stats',
      configContent: `[INFO] PostCSS processing initiated for src/index.css
[INFO] Resolving @tailwindcss/postcss compiler directives
[INFO] Scanning source code files for active classes (src/**/*.{ts,tsx,html})
[INFO] Purging unused tailwind components & utility classes
[INFO] CSS assets optimization & minification completed
[INFO] Generated styles bundle size: 18.42 kB (74.2% size reduction)`
    },
    {
      id: 'serverless-map',
      name: 'Serverless Bundling',
      icon: 'FiCpu',
      description: 'Bundles Spring Boot proxy application configuration into Vercel runtime mappings.',
      status: 'success',
      configTitle: 'Vercel Routing maps & Spring Boot proxies',
      configContent: `{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "http://localhost:8080/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

[INFO] Binding /api/chat (Target: ChatController.java)
[INFO] Binding /api/contact (Target: ContactController.java)
[INFO] Binding /api/job-match (Target: JobMatchController.java)
[INFO] Binding /api/update-content (Target: UpdateContentController.java)`
    },
    {
      id: 'edge-cdn',
      name: 'Edge CDN Deploy',
      icon: 'FiCheckCircle',
      description: 'Deploys static files to 80+ Edge PoPs global Anycast network and runs a Core Web Vitals audit.',
      status: 'success',
      configTitle: 'Edge caching status & Web Vitals audit results',
      configContent: `[INFO] Deployed static workspace assets to global Vercel CDN.
[INFO] Routing tables updated. Edge caching active (Cache-Control: public, max-age=0, must-revalidate)
[INFO] Verifying performance vitals:
  - FCP (First Contentful Paint): 0.4s
  - LCP (Largest Contentful Paint): 0.8s
  - CLS (Cumulative Layout Shift): 0.01
[INFO] Edge Deployment SUCCESSFUL. Live URL: https://parthnautiyal.com`
    }
  ];

  get activeStage(): Stage {
    return this.pipelineStages.find(s => s.id === this.activeStageId) || this.pipelineStages[1];
  }

  setActiveStage(id: string) {
    this.activeStageId = id;
  }
}
