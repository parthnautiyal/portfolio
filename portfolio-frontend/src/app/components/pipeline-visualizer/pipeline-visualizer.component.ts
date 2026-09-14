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
  activeStageId = 'latex-ast';

  pipelineStages: Stage[] = [
    {
      id: 'git-trigger',
      name: 'Trigger & Webhook Ingestion',
      icon: 'FiGitCommit',
      description: 'Accepts 3 trigger channels: Git push (main), In-Browser Dev Console PIN hook, or Overleaf sync workflow.',
      status: 'success',
      configTitle: 'Deployment Trigger & Webhook Ingestion Log',
      configContent: `[10:45:12 AM] Trigger Received: Webhook Channel B (Dev Console PIN Authorized)
[10:45:13 AM] Triggering Vercel serverless deployment pipeline...
[10:45:14 AM] Deploying branch: main (Commit ref: 8af1a392)
[10:45:15 AM] Cloning repository from GitHub parthnautiyal/portfolio...
[10:45:16 AM] Secure Environment Variables Injected:
  - VERCEL_DEPLOY_HOOK_URL = [encrypted]
  - OVERLEAF_SHARE_URL = [encrypted]
  - ADMIN_PIN = [verified constant-time]`
    },
    {
      id: 'latex-ast',
      name: 'LaTeX Parser & AST Tokenizer',
      icon: 'FiCode',
      description: 'Executes npm run prebuild (scripts/parse-resume-tex.js) to parse LaTeX source and emit strongly-typed TS models.',
      status: 'success',
      configTitle: 'Deterministic LaTeX AST Parser Log (parse-resume-tex.js)',
      configContent: `> portfolio-frontend@0.0.0 prebuild
> node ../scripts/parse-resume-tex.js

[parse-resume-tex] Reading LaTeX file: public/Parth_Nautiyal_Resume.tex
[parse-resume-tex] Tokenizing AST:
  ✓ Personal Header & Contacts: Parth Nautiyal (parthnautiyal2002@gmail.com)
  ✓ Experience Block: 3 production roles (ZopSmart SDE II, SDE I, SDE Intern)
  ✓ Projects Block: 2 featured systems (OutreachIQ, Multi-LLM RAG Portfolio)
  ✓ Skills Block: 6 categories, 39 skills mapped to icons & brand colors
  ✓ Education Block: Lovely Professional University (B.Tech CSE, 8.9 CGPA)
[parse-resume-tex] Emitted TypeScript models:
  → src/app/content/personal.ts
  → src/app/content/experience.ts
  → src/app/content/resume-projects.ts
  → src/app/content/skills.ts
  → src/app/content/education.ts
[parse-resume-tex] Generated razor-sharp preview via pdf2png: 1488x2104 (574 KB)
[parse-resume-tex] 100% synchronized with Parth_Nautiyal_Resume.tex!`
    },
    {
      id: 'angular-build',
      name: 'Angular 21 Application Compiler',
      icon: 'FiLayers',
      description: 'Compiles Angular 21 Standalone Components, Signal state, and code-split chunks using the modern esbuild pipeline.',
      status: 'success',
      configTitle: 'Angular 21 Application Builder Log (@angular/build:application)',
      configContent: `> portfolio-frontend@0.0.0 build
> ng build --configuration production

Initial chunk files                       | Names                                  |  Raw size
spec-app-app.js                           | spec-app-app                           | 180.01 kB
styles.css                                | styles                                 | 157.92 kB
chunk-KWG36TWR.js                         | -                                      |  15.26 kB
spec-app-utils-contentLoader.js           | spec-app-utils-contentLoader           |   9.89 kB
chunk-RSTWSNOR.js                         | -                                      |   4.75 kB
spec-app-utils-analytics.js               | spec-app-utils-analytics               |   4.42 kB

Application bundle generation complete. [1.706 seconds]
✓ 0 errors, 0 compilation warnings
✓ Static prerender & asset hashing complete`
    },
    {
      id: 'tailwind-v4',
      name: 'Tailwind CSS v4 & PostCSS Engine',
      icon: 'FiCpu',
      description: 'Resolves Tailwind CSS v4 design system, color tokens, and container queries via @tailwindcss/postcss.',
      status: 'success',
      configTitle: 'Tailwind CSS v4 & PostCSS Processing Stats',
      configContent: `[INFO] Tailwind CSS v4 engine initialized for src/styles.css
[INFO] Resolving @import "tailwindcss" directives & @variant dark (.dark &)
[INFO] Scanning template markup (src/app/**/*.{html,ts})
[INFO] High-performance CSS tree-shaking & JIT compilation:
  - Base utility styles compiled
  - Custom design tokens: --bg-main, --bg-glow, --color-primary
  - Responsive breakpoint variants generated: sm, md, lg, xl
[INFO] Final optimized stylesheet: styles.css (157 kB, ~28 kB gzip)`
    },
    {
      id: 'edge-distribution',
      name: 'Global Edge Anycast Deployment',
      icon: 'FiCheckCircle',
      description: 'Distributes static assets and serverless functions across 80+ Edge PoPs worldwide with sub-10ms TTFB.',
      status: 'success',
      configTitle: 'Edge Routing & Core Web Vitals Audit',
      configContent: `[INFO] Deploying static bundles and serverless API routes to Vercel Global Edge:
  ✓ /api/sync-resume.js   (Deploy Hook Webhook Controller)
  ✓ /api/job-match.js     (AI Job Description Parser)
  ✓ /api/chat.js          (Multi-LLM Fallback Orchestrator)
  ✓ /api/github.js        (Stale-While-Revalidate Repo Stats)
  ✓ /api/health.js        (Synthetic Latency & Health Probes)
[INFO] Edge caching active (Cache-Control: public, s-maxage=31536000, immutable)
[INFO] Performance Web Vitals Verification:
  - FCP (First Contentful Paint): 0.4s  [EXCELLENT]
  - LCP (Largest Contentful Paint): 0.8s [OPTIMIZED]
  - CLS (Cumulative Layout Shift): 0.00  [ZERO SHIFT]
  - TTFB (Time to First Byte):    0.08s [EDGE FAST]
[INFO] Production deployment LIVE: https://parthnautiyal.vercel.app`
    }
  ];

  get activeStage(): Stage {
    return this.pipelineStages.find(s => s.id === this.activeStageId) || this.pipelineStages[1];
  }

  setActiveStage(id: string) {
    this.activeStageId = id;
  }
}
