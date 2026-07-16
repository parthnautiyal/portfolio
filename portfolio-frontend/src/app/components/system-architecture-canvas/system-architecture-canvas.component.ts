import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FailureState } from '../../pages/system-cockpit-page/system-cockpit-page.component';

type SystemNode = {
  id: string;
  label: string;
  icon: string;
  description: string;
  tradeOffs: string;
  pattern: string;
  codeSnippet: string;
  x: number;
  y: number;
  isOffline?: boolean;
  hasWarning?: boolean;
};

@Component({
  selector: 'app-system-architecture-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-architecture-canvas.component.html',
  styleUrls: ['./system-architecture-canvas.component.css']
})
export class SystemArchitectureCanvasComponent implements OnChanges {
  @Input() failureState!: FailureState;

  selectedNode = 'sync-script';
  showCode = false;
  systemNodes: SystemNode[] = [];

  ngOnChanges(changes: SimpleChanges) {
    this.updateNodes();
  }

  updateNodes() {
    this.systemNodes = [
      {
        id: 'resume-pdf',
        label: '① Resume PDF (Local)',
        icon: 'FiHardDrive',
        description: "Parth's primary credentials file (Parth_Nautiyal_Resume.pdf) edited on his local machine. Any updates to his professional history begin here.",
        tradeOffs: 'Allows keeping a clean offline master resume document; requires compilation/parsing to update the live website.',
        pattern: 'Single Source of Truth (SSOT)',
        codeSnippet: 'Parth_Nautiyal_Resume.pdf (Binary PDF file)',
        x: 150,
        y: 70
      },
      {
        id: 'sync-script',
        label: '② Sync Script (Node CLI)',
        icon: 'FiCode',
        description: 'A Node.js build-time CLI script (scripts/sync-resume.js) run locally. Copies the PDF to iCloud/GDrive and calls Gemini (or local Ollama) to output JSON content.',
        tradeOffs: 'Shifts parsing overhead to build-time, achieving zero server runtime load; requires manual or file-watch triggering.',
        pattern: 'Static Site Generation (SSG)',
        codeSnippet: 'node scripts/sync-resume.js\n\n// 1. Sync PDF to local CloudStorage folders\n// 2. Extract PDF text layer\n// 3. Request Gemini API to parse to structured JSON\n// 4. Overwrite local src/content/*.ts',
        x: 150,
        y: 200
      },
      {
        id: 'icloud-gdrive',
        label: '③ iCloud & GDrive',
        icon: 'FiFolder',
        description: 'Local macOS cloud storage mounts. Automatically backs up the resume to iCloud and Google Drive paths natively upon script execution.',
        tradeOffs: 'Zero-config automated cloud backups; requires Mac environment with both iCloud & Drive accounts signed in.',
        pattern: 'File Sync Pipeline',
        codeSnippet: "const ICLOUD = '~/Library/Mobile Documents/com~apple~CloudDocs/Resume'\nconst GDRIVE = '~/Library/CloudStorage/GoogleDrive-user/My Drive/Resume'\n\nfs.copyFileSync(PDF_PATH, path.join(ICLOUD, 'resume.pdf'))",
        x: 380,
        y: 70,
        isOffline: this.failureState?.cloudMountOffline
      },
      {
        id: 'vercel-cdn',
        label: '④ Vercel CDN',
        icon: 'FiGlobe',
        description: 'Hosts the statically compiled Angular application globally. Provides ultra-low latency edge delivery, high SEO speed ratings, and near 100% availability.',
        tradeOffs: 'Extreme speed and scale; updates require a static build trigger (automated via GitHub Webhook on commit pushes).',
        pattern: 'Edge Cache Distribution',
        codeSnippet: 'git push origin main\n// Triggers Vercel CI/CD Webhook\n// Compiles and deploys production static assets',
        x: 380,
        y: 200
      },
      {
        id: 'visitor-browser',
        label: '⑤ Visitor Browser',
        icon: 'FiNavigation',
        description: 'Renders the glassmorphic Angular site. Serves interactive content, computes layouts, toggles themes, and manages local storage keys.',
        tradeOffs: 'Instant user interactions; performance depends on client-side CPU/GPU resources.',
        pattern: 'Client-Side Rendering (CSR)',
        codeSnippet: "const activeTheme = localStorage.getItem('theme')\n// Client-side routing and DOM updates",
        x: 610,
        y: 200
      },
      {
        id: 'vercel-api',
        label: '⑥ Serverless Functions',
        icon: 'FiCpu',
        description: 'Spring Boot secure gateway controllers (api/chat, api/job-match) acting as a secure gateway to forward client requests to LLM APIs, keeping credentials secure.',
        tradeOffs: 'Secures credentials and prevents client CORS issues; subject to gateway service runtime latency.',
        pattern: 'Serverless Gateway Proxy',
        codeSnippet: '@RestController\n@RequestMapping("/api")\npublic class ChatController {\n  // Safe backend proxy controller hiding keys\n  @PostMapping("/chat")\n  public ResponseEntity<?> chat(@RequestBody ChatRequest req) {\n     return ResponseEntity.ok(llmService.call(req));\n  }\n}',
        x: 380,
        y: 330,
        hasWarning: this.failureState?.gatewayLatency
      },
      {
        id: 'gemini-api',
        label: '⑦ Google Gemini API',
        icon: 'FiCpu',
        description: "The primary external LLM provider. Generates responses for the Chatbot and performs ATS Job Matching comparisons based on Parth's resume.",
        tradeOffs: 'High speed, large context window, and accurate reasoning; requires internet connectivity and is subject to rate/quota limits.',
        pattern: 'External LLM Gateway',
        codeSnippet: '// Backend Gemini Client Call:\nWebClient.create("https://generativelanguage.googleapis.com")\n  .post().uri("/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey)',
        x: 610,
        y: 330,
        isOffline: this.failureState?.geminiLimit
      },
      {
        id: 'ollama-local',
        label: '⑧ Local Ollama Fallback',
        icon: 'FiCpu',
        description: "A locally running Ollama server on Parth's development machine. Acts as a fully offline fallback to parse/generate text during local sync and local testing.",
        tradeOffs: 'Complete data privacy and offline capability; model inference speed is dependent on local GPU hardware.',
        pattern: 'Offline Local LLM',
        codeSnippet: "const response = await fetch('http://localhost:11434/api/generate', {\n  method: 'POST',\n  body: JSON.stringify({ model: 'llama3', prompt })\n})",
        x: 150,
        y: 330,
        isOffline: this.failureState?.ollamaOffline
      }
    ];
  }

  selectNode(id: string) {
    this.selectedNode = id;
    this.showCode = false;
  }

  get activeNode(): SystemNode {
    return this.systemNodes.find(n => n.id === this.selectedNode) || this.systemNodes[1];
  }

  toggleShowCode() {
    this.showCode = !this.showCode;
  }
}
