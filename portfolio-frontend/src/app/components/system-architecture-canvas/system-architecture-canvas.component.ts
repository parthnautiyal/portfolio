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
  @Input() set selectedNodeId(nodeId: string | undefined) {
    if (nodeId) {
      this.selectedNode = nodeId;
    }
  }

  selectedNode = 'overleaf-source';
  showCode = false;
  systemNodes: SystemNode[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedNodeId'] && changes['selectedNodeId'].currentValue) {
      this.selectedNode = changes['selectedNodeId'].currentValue;
    }
    this.updateNodes();
  }

  updateNodes() {
    this.systemNodes = [
      {
        id: 'overleaf-source',
        label: '① Overleaf LaTeX Source',
        icon: 'FiCode',
        description: "Primary single source of truth (Parth_Nautiyal_Resume.tex) authored on Overleaf. All experience bullet points, Kafka/Temporal metrics, technical skills taxonomy, and education are parsed deterministically into TypeScript models.",
        tradeOffs: 'Eliminates dual-maintenance drift between PDF and website; requires an automated parser step during CI/CD to compile LaTeX AST into TypeScript models.',
        pattern: 'Single Source of Truth (SSOT)',
        codeSnippet: `% Overleaf LaTeX source snippet (Parth_Nautiyal_Resume.tex)
\\section{Professional Experience}
\\textbf{ZopSmart}\\hfill\\textit{Bangalore, India}
\\textbf{Software Development Engineer II}\\hfill\\textit{Mar 2026 – Present}
\\begin{itemize}
  \\item Architected and scaled 20+ Spring Boot microservices with event-driven \\textbf{Kafka} streaming pipelines...
  \\item Refactored distributed workflow orchestration using \\textbf{Temporal}, decomposing monolithic logic into 11+ activities...
\\end{itemize}`,
        x: 120,
        y: 65
      },
      {
        id: 'sync-engine',
        label: '② 3-Channel Sync Engine',
        icon: 'FiGlobe',
        description: 'Multi-channel deployment dispatcher supporting: (A) Direct Git push to main, (B) In-browser Dev Console (sync-resume --pin 1721 calling /api/sync-resume serverless deploy hook), and (C) Scheduled GitHub Action workflow syncing Overleaf share URLs.',
        tradeOffs: 'Enables instant zero-config updates from any mobile device or browser without exposing long deployment tokens or secret credentials.',
        pattern: 'Multi-Channel Webhook Dispatcher',
        codeSnippet: `// 1. In-browser Dev Console trigger (Parth OS v2.0):
sync-resume --pin 1721

// 2. Vercel Serverless Function (/api/sync-resume.js):
const { pin } = req.body;
if (pin === process.env.ADMIN_PIN) {
  await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
  return res.json({ success: true, message: 'Vercel rebuild triggered live!' });
}`,
        x: 120,
        y: 205,
        isOffline: this.failureState?.cloudMountOffline
      },
      {
        id: 'ast-parser',
        label: '③ Deterministic AST Parser',
        icon: 'FiCpu',
        description: 'Runs during prebuild (scripts/parse-resume-tex.js). Cleans LaTeX macros, extracts 39+ skills mapped to brand colors, emits 5 type-safe TypeScript files, and compiles 2.5x high-DPI raster preview via native CoreGraphics (scripts/pdf2png).',
        tradeOffs: 'Zero runtime parsing overhead in visitor browsers (0ms client delay); requires deterministic regex lexer for LaTeX document grammar.',
        pattern: 'Zero-Dependency Compiler AST',
        codeSnippet: `// parse-resume-tex.js
const rawTex = fs.readFileSync('Parth_Nautiyal_Resume.tex', 'utf-8');
const personal = parsePersonal(rawTex);
const experience = parseExperience(rawTex);
const skills = parseSkills(rawTex);

// Emits type-safe models for Angular
fs.writeFileSync('src/app/content/experience.ts', generateTS('experience', experience));
// Generates CoreGraphics 2.5x raster preview
execSync('scripts/pdf2png Parth_Nautiyal_Resume.pdf public/resume-preview.png');`,
        x: 320,
        y: 65
      },
      {
        id: 'vercel-edge',
        label: '④ Vercel Global Edge & APIs',
        icon: 'FiGlobe',
        description: 'Serves static bundles from 80+ Edge PoPs worldwide with sub-10ms TTFB. Hosts serverless functions (/api/sync-resume, /api/job-match, /api/chat, /api/github, /api/health) with zero cold-start pre-parsed models.',
        tradeOffs: 'Global Anycast CDN performance with zero server management; serverless functions are stateless with max execution duration limits.',
        pattern: 'Edge Computing + Serverless Proxy',
        codeSnippet: `// vercel.json routes
{
  "version": 2,
  "routes": [
    { "src": "/api/sync-resume", "dest": "/api/sync-resume.js" },
    { "src": "/api/job-match",   "dest": "/api/job-match.js" },
    { "src": "/api/chat",        "dest": "/api/chat.js" },
    { "src": "/api/github",      "dest": "/api/github.js" },
    { "src": "/(.*)",            "dest": "/index.html" }
  ]
}`,
        x: 320,
        y: 205,
        hasWarning: this.failureState?.gatewayLatency
      },
      {
        id: 'angular-spa',
        label: '⑤ Angular 21 Client SPA',
        icon: 'FiNavigation',
        description: 'Modern Single Page Application built with Angular 21 Standalone Components, Signal reactivity, Tailwind CSS v4, Parth OS v2.0 terminal, and 1-tap mobile bottom navigation.',
        tradeOffs: 'Instant 60/120fps client transitions after initial download; state stored locally with zero database overhead for visitor quests and themes.',
        pattern: 'Client-Side Rendering (CSR) + Signals',
        codeSnippet: `@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, DevConsolePanelComponent, QuestHudComponent],
  template: \`
    <app-navbar></app-navbar>
    <main><router-outlet></router-outlet></main>
    <app-dev-console-panel></app-dev-console-panel>
    <app-bottom-nav></app-bottom-nav>
  \`
})
export class AppComponent {}`,
        x: 520,
        y: 65
      },
      {
        id: 'spring-boot',
        label: '⑥ Spring Boot Microservice',
        icon: 'FiCpu',
        description: 'Java 21 Spring Boot 3.4.x backend. Implements multi-provider AI prompt orchestration, transactional mail dispatchers, and OpenTelemetry trace spans for Jaeger career timeline integration.',
        tradeOffs: 'Enterprise JVM reliability with Virtual Thread concurrency (Java 21); requires dedicated container runtime for persistent server operation.',
        pattern: 'Resilient Microservice (Java 21)',
        codeSnippet: `@RestController
@RequestMapping("/api")
public class ChatController {
  private final MultiLlmOrchestrator llmOrchestrator;

  @PostMapping("/chat")
  public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req) {
    return ResponseEntity.ok(llmOrchestrator.processWithFallback(req));
  }
}`,
        x: 520,
        y: 205
      },
      {
        id: 'multi-llm',
        label: '⑦ Multi-LLM Fallback Engine',
        icon: 'FiCpu',
        description: 'Multi-provider AI query pipeline. Primary Claude 3.5 & Google Gemini 2.5 Flash, falling back to OpenAI GPT-4o-mini, and local offline Ollama (Llama 3). Dynamically injects career context into prompts.',
        tradeOffs: 'Guarantees 100% chat availability even during API rate limits or token exhaustion; requires managing multiple client credentials.',
        pattern: 'Failover Resilience Circuit',
        codeSnippet: `// MultiLlmOrchestrator.java
public ChatResponse processWithFallback(ChatRequest req) {
  try {
    return geminiClient.generate(req.getPrompt());
  } catch (RateLimitException ex) {
    logger.warn("Primary LLM throttled (429). Falling back to secondary provider...");
    return fallbackProvider.generate(req.getPrompt());
  }
}`,
        x: 700,
        y: 65,
        isOffline: this.failureState?.geminiLimit
      },
      {
        id: 'dispatcher-telemetry',
        label: '⑧ Dispatcher & Jaeger Tracing',
        icon: 'FiCpu',
        description: 'Dispatches contact submissions via Resend HTTP API (fallback to Gmail SMTP) and emits OpenTelemetry distributed trace spans to visualize request latency journeys in real time.',
        tradeOffs: 'High delivery rates without blocked SMTP ports; requires secure environment secrets configuration.',
        pattern: 'Distributed Telemetry & Mail Dispatcher',
        codeSnippet: `// ContactDispatcher.java
HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("https://api.resend.com/emails"))
  .header("Authorization", "Bearer " + resendKey)
  .header("Content-Type", "application/json")
  .POST(BodyPublishers.ofString(payload))
  .build();
HttpResponse<String> resp = httpClient.send(request, BodyHandlers.ofString());`,
        x: 700,
        y: 205,
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
