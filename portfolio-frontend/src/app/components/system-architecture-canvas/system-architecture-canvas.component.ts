import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FailureState } from '../../pages/system-architecture-page/system-architecture-page.component';

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

  selectedNode = 'vercel-cdn';
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
        description: "Parth's primary credentials file (Parth_Nautiyal_Resume.pdf) edited locally. Committed to the repo and served as a static asset from Vercel CDN.",
        tradeOffs: 'Keeps a clean offline master copy; requires a git push to update the live version on Vercel.',
        pattern: 'Static Asset — Single Source of Truth',
        codeSnippet: '# Update resume:\ncp ~/Documents/Parth_Nautiyal_Resume.pdf portfolio-frontend/public/\ngit add . && git commit -m "chore: update resume"\ngit push origin main  # Vercel auto-deploys',
        x: 150,
        y: 70
      },
      {
        id: 'github',
        label: '② GitHub Repository',
        icon: 'FiCode',
        description: 'Source of truth for the entire codebase. Hosts both Angular frontend (portfolio-frontend/) and Spring Boot backend (portfolio-backend/). Push to main triggers auto-deploy on both Vercel and Render.',
        tradeOffs: 'Unified monorepo simplifies cross-service changes; Vercel and Render watch separate subdirectories.',
        pattern: 'Monorepo with Separate Deploy Targets',
        codeSnippet: '# Repo structure:\n/portfolio-frontend   → Vercel (Angular SPA)\n/portfolio-backend    → Render (Spring Boot)\n\ngit push origin main\n# → Vercel rebuilds frontend\n# → Render rebuilds backend Docker image',
        x: 150,
        y: 200
      },
      {
        id: 'vercel-cdn',
        label: '③ Vercel CDN',
        icon: 'FiGlobe',
        description: 'Hosts the compiled Angular SPA as static files on a global edge network. All /api/* requests are proxied to the Render backend via vercel.json rewrites — keeping API keys server-side and avoiding CORS.',
        tradeOffs: 'Zero server management, instant global CDN; /api/* adds one extra hop through Vercel edge before hitting Render.',
        pattern: 'Edge CDN + Reverse Proxy',
        codeSnippet: '// vercel.json (portfolio-frontend/)\n{\n  "rewrites": [\n    {\n      "source": "/api/:path*",\n      "destination": "https://portfolio-zs63.onrender.com/api/:path*"\n    },\n    { "source": "/(.*)", "destination": "/index.html" }\n  ]\n}',
        x: 380,
        y: 70
      },
      {
        id: 'visitor-browser',
        label: '④ Visitor Browser',
        icon: 'FiNavigation',
        description: 'Renders the Angular SPA. All API calls use relative /api/* paths — transparently proxied by Vercel to Render. Manages theme, quest XP, and chat history in localStorage.',
        tradeOffs: 'Instant interactions after load; first backend request after Render cold start may take 30-60s on free tier.',
        pattern: 'Client-Side Rendering (CSR)',
        codeSnippet: "// All API calls use relative paths:\nawait fetch('/api/chat', { method: 'POST', body: JSON.stringify(req) })\nawait fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })\n// Vercel edge proxies these to Render",
        x: 610,
        y: 70,
      },
      {
        id: 'render-backend',
        label: '⑤ Render (Spring Boot)',
        icon: 'FiCpu',
        description: 'Spring Boot backend hosted on Render free tier as a Docker container. Handles contact form delivery (via Resend HTTP API), AI chat proxying (Gemini/Ollama), and GitHub data. Sleeps after 15 min idle — first request after idle takes ~30-60s (cold start).',
        tradeOffs: 'Free persistent JVM server; cold start delay on free tier. Upgrade to Render Starter ($7/mo) to eliminate cold starts.',
        pattern: 'Containerised REST API (Docker on Render)',
        codeSnippet: '// Dockerfile (portfolio-backend/)\nFROM eclipse-temurin:21-jdk-alpine AS build\nRUN ./mvnw clean package -DskipTests\n\nFROM eclipse-temurin:21-jre-alpine\nCOPY --from=build /app/target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java", "-jar", "app.jar"]',
        x: 380,
        y: 200,
        hasWarning: this.failureState?.gatewayLatency
      },
      {
        id: 'resend-api',
        label: '⑥ Resend API',
        icon: 'FiCpu',
        description: 'Transactional email delivery via Resend HTTP API. Spring Boot POSTs contact form submissions as JSON to api.resend.com/emails — no SMTP, no port 587, works on all cloud platforms. RESEND_API_KEY stored as a Render environment variable.',
        tradeOffs: 'Reliable HTTP delivery, free tier (100 emails/day); requires RESEND_API_KEY env var. Custom domain verification unlocks branded from-address.',
        pattern: 'HTTP Transactional Email (Resend)',
        codeSnippet: '// ContactController.java\nHttpRequest req = HttpRequest.newBuilder()\n  .uri(URI.create("https://api.resend.com/emails"))\n  .header("Authorization", "Bearer " + resendKey)\n  .header("Content-Type", "application/json")\n  .POST(BodyPublishers.ofString(payload))\n  .build();\nHttpResponse<String> resp = http.send(req, ofString());\n// No SMTP — pure HTTP, never blocked by Render',
        x: 380,
        y: 330,
        isOffline: this.failureState?.cloudMountOffline
      },
      {
        id: 'gemini-api',
        label: '⑦ Google Gemini API',
        icon: 'FiCpu',
        description: "Primary external LLM. Spring Boot's ChatController proxies visitor messages to Gemini 2.5 Flash, injecting Parth's career context as a system prompt. API key stored server-side on Render.",
        tradeOffs: 'Large context window, fast inference; requires GEMINI_API_KEY env var and internet connectivity from Render.',
        pattern: 'Server-Side LLM Proxy',
        codeSnippet: '// ChatController.java\nHttpRequest req = HttpRequest.newBuilder()\n  .uri(URI.create("https://generativelanguage.googleapis.com"\n    + "/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey))\n  .POST(BodyPublishers.ofString(body))\n  .build();\nHttpResponse<String> res = httpClient.send(req, ofString());',
        x: 610,
        y: 200,
        isOffline: this.failureState?.geminiLimit
      },
      {
        id: 'ollama-local',
        label: '⑧ Ollama (Local Dev)',
        icon: 'FiCpu',
        description: 'Local Ollama server used during development only. Spring Boot falls back to Ollama (localhost:11434) when no cloud API key is configured — useful for offline testing without burning API quota.',
        tradeOffs: 'Free offline inference; not available in production (Render cannot reach localhost:11434).',
        pattern: 'Local LLM Dev Fallback',
        codeSnippet: '// ChatController.java — fallback logic:\nif (geminiKey == null && openaiKey == null) {\n  // Try local Ollama first\n  HttpRequest ollamaReq = HttpRequest.newBuilder()\n    .uri(URI.create("http://localhost:11434/api/chat"))\n    .timeout(Duration.ofSeconds(5))\n    .build();\n  // Falls back to default message if Ollama offline\n}',
        x: 610,
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
