import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../../services/quest.service';
import { OllamaDiagnosticModalComponent } from '../../components/ollama-diagnostic-modal/ollama-diagnostic-modal.component';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type KBDocument = {
  name: string;
  size: number;
  content: string;
};

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, OllamaDiagnosticModalComponent],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef<HTMLDivElement>;
  private lastMessageCount = 0;

  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content:
        "Hi, I'm Parth's AI Hiring Agent. You can ask me anything about his engineering experience, system architecture, or tech stack. You can also upload reference documents on the right (like JDs, team notes, or blog write-ups) to query Parth's profile against them!"
    }
  ];

  input = '';
  loading = false;
  documents: KBDocument[] = [];
  textContext = '';
  textContextSaved = '';
  kbTab: 'file' | 'text' = 'file';

  showSettings = false;
  customKey = '';
  provider: 'gemini' | 'openai' | 'ollama' = 'gemini';
  ollamaUrl = 'http://localhost:11434';
  ollamaModel = 'llama3';
  ollamaStatus: 'checking' | 'connected' | 'offline' = 'checking';
  isOllamaModalOpen = false;

  private modelNoteShown = false;
  private ollamaInterval: any;
  private apiBaseUrl = '/api'; // Maps to Spring Boot API pathing /api

  constructor(private questService: QuestService) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedDocs = localStorage.getItem('portfolio_kb_documents');
      if (savedDocs) {
        try { this.documents = JSON.parse(savedDocs); } catch (e) { console.error(e); }
      }
      const savedText = localStorage.getItem('portfolio_kb_text_context');
      if (savedText) {
        this.textContext = savedText;
        this.textContextSaved = savedText;
      }
      this.customKey = localStorage.getItem('portfolio_custom_api_key') || '';
      this.provider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai' | 'ollama') || 'gemini';
      this.ollamaUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434';
      this.ollamaModel = localStorage.getItem('portfolio_ollama_model') || 'llama3';

      this.checkOllama(this.ollamaUrl);
      this.ollamaInterval = setInterval(() => {
        const url = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434';
        this.checkOllama(url);
      }, 15000);
    }
  }

  ngOnDestroy() {
    if (this.ollamaInterval) clearInterval(this.ollamaInterval);
  }

  async checkOllama(url: string) {
    try {
      const res = await fetch(`${url}/api/tags`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      this.ollamaStatus = res.ok ? 'connected' : 'offline';
    } catch {
      this.ollamaStatus = 'offline';
    }
  }

  ngAfterViewChecked() {
    if (this.messages.length !== this.lastMessageCount) {
      this.lastMessageCount = this.messages.length;
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    try {
      const el = this.chatMessagesRef.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {}
  }

  saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_custom_api_key', this.customKey);
      localStorage.setItem('portfolio_api_provider', this.provider);
      localStorage.setItem('portfolio_ollama_url', this.ollamaUrl);
      localStorage.setItem('portfolio_ollama_model', this.ollamaModel);
      this.showSettings = false;
    }
  }

  handleDocUpload(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    if (inputEl.files && inputEl.files.length > 0) {
      const file = inputEl.files[0];
      if (file.size > 200 * 1024) {
        alert('File size exceeds 200KB. Please upload smaller text/markdown files.');
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const text = event.target?.result as string;
        this.documents = [
          ...this.documents.filter(d => d.name !== file.name),
          {
            name: file.name,
            size: file.size,
            content: text
          }
        ];
        if (typeof window !== 'undefined') {
          localStorage.setItem('portfolio_kb_documents', JSON.stringify(this.documents));
        }
      };
      fileReader.readAsText(file);
    }
  }

  handleDeleteDoc(name: string) {
    this.documents = this.documents.filter(d => d.name !== name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_kb_documents', JSON.stringify(this.documents));
    }
  }

  handleSaveTextContext() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_kb_text_context', this.textContext);
      this.textContextSaved = this.textContext;
    }
  }

  handleClearTextContext() {
    this.textContext = '';
    this.textContextSaved = '';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('portfolio_kb_text_context');
    }
  }

  async sendMessage() {
    if (!this.input.trim() || this.loading) return;
    const userMsgContent = this.input.trim();
    const userMessage: ChatMessage = { role: 'user', content: userMsgContent };
    this.messages = [...this.messages, userMessage];
    this.input = '';
    this.loading = true;
    this.questService.unlockAchievement('CHAT_QUERY');

    // Build context
    const parts: string[] = [];
    if (this.documents.length > 0) {
      parts.push(
        this.documents
          .map(doc => `--- DOCUMENT: ${doc.name} ---\n${doc.content}\n--- END DOCUMENT ---`)
          .join('\n\n')
      );
    }
    if (this.textContextSaved.trim()) {
      parts.push(`--- INJECTED CONTEXT ---\n${this.textContextSaved.trim()}\n--- END INJECTED CONTEXT ---`);
    }
    const kbContext = parts.join('\n\n');

    if (this.provider === 'ollama') {
      try {
        await this.callOllamaDirectly(userMsgContent, kbContext, this.ollamaUrl, this.ollamaModel);
      } catch (err: any) {
        this.messages = [
          ...this.messages,
          {
            role: 'assistant',
            content: `❌ Local Ollama call failed. Make sure your Ollama daemon is running at ${this.ollamaUrl} and model "${this.ollamaModel}" is pulled. Error: ${err.message}`
          }
        ];
      } finally {
        this.loading = false;
      }
      return;
    }

    const chatEndpoint = `${this.apiBaseUrl}/chat`;
    try {
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgContent,
          customApiKey: this.customKey,
          apiProvider: this.provider,
          kbContext: kbContext
        })
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to communicate with LLM server');
      }

      const data = await res.json() as { reply: string };
      this.messages = [...this.messages, { role: 'assistant', content: data.reply }];
    } catch (err: any) {
      console.warn('Backend serverless chat failed, checking local Ollama fallback:', err.message);

      try {
        this.messages = [
          ...this.messages,
          {
            role: 'assistant',
            content: '⚠️ Cloud service unavailable or rate-limited. Attempting local Ollama fallback...'
          }
        ];
        await this.callOllamaDirectly(userMsgContent, kbContext, this.ollamaUrl, this.ollamaModel);
      } catch (ollamaErr: any) {
        const errorContent = `
⚠️ **Cloud service unavailable or rate-limited. Attempting local Ollama fallback...**

**Chat Service Error**: \`${err.message}\`
**Local Ollama Fallback also failed**: \`${ollamaErr.message}\`

---

#### 🛠️ How to Resolve: Setup & Run Local AI Offline
To run chatbot queries locally, please set up Ollama using the steps below:

1. **Install Ollama**:
   Download and install the app from **[ollama.com](https://ollama.com)**.
2. **Pull the Model**:
   Run the pull command in your terminal to fetch the target model (or pull any model; the client will auto-detect and use it):
   \`\`\`bash
   ollama pull ${this.ollamaModel}
   \`\`\`
3. **Start Ollama with CORS origins enabled (Crucial for Web Access)**:
   - **macOS (Terminal)**: Quit the running Ollama menu bar app first, then run:
     \`\`\`bash
     OLLAMA_ORIGINS="*" ollama serve
     \`\`\`
   - **Windows (PowerShell)**:
     \`\`\`powershell
     $env:OLLAMA_ORIGINS="*"
     ollama serve
     \`\`\`
   - **Linux**: Run \`sudo systemctl edit ollama.service\` and add \`Environment="OLLAMA_ORIGINS=*"\` under \`[Service]\`, then restart Ollama.

*Tip: For setup verification and status monitoring, click the **Local AI** badge in the header.*
        `;
        this.messages = [
          ...this.messages.filter(m => !m.content.includes('Ollama fallback')),
          {
            role: 'assistant',
            content: errorContent.trim()
          }
        ];
      }
    } finally {
      this.loading = false;
    }
  }

  async callOllamaDirectly(msg: string, kbContext: string, url: string, model: string) {
    let modelToUse = model;

    try {
      const tagsResponse = await fetch(`${url}/api/tags`);
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        const models = tagsData.models ? tagsData.models.map((m: any) => m.name) : [];
        if (models.length > 0 && !models.some((m: string) => m === model || m.startsWith(model + ':'))) {
          modelToUse = models[0];
          if (!this.modelNoteShown) {
            this.modelNoteShown = true;
            this.messages = [
              ...this.messages,
              {
                role: 'assistant',
                content: `ℹ️ Configured model "${model}" was not found. Automatically falling back to available model "${modelToUse}" for this session.`
              }
            ];
          }
        }
      }
    } catch (e) {
      console.warn('Ollama model list check failed, proceeding with target:', e);
    }

    const resumeContext = `
You are a helpful, professional assistant representing Parth Nautiyal. Answers should be derived from his career profile:
- SDE II at ZopSmart (Mar 2026 - Present): Scaling microservices (20+ APIs), Kafka, event-driven architectures, Temporal workflow orchestrations.
- SDE I at ZopSmart (Jul 2024 - Mar 2026): Built Spring Boot microservices, Kafka, Spring Security, Helm, Kubernetes, Grafana, Datadog. Reduced API latency by ~50%.
- SDE Intern at ZopSmart (Jan 2024 - Jul 2024): Worked on TDD, JUnit, Mockito, increasing coverage by 45%.
- Skills: Java, Spring Boot, Microservices, Kafka, SQL, TypeScript, React, Docker, Kubernetes, Jenkins, Ansible, Grafana.
- Education: B.Tech in Computer Science from Lovely Professional University.
- Hobbies & Interests: System Design, Open Source, Obsidian notes, custom CLI tools.

Base answers on the above facts. Be concise, developer-friendly, and polite.
`;

    let fullPrompt = `${resumeContext}\n`;
    if (kbContext.trim()) {
      fullPrompt += `\nADDITIONAL CONTEXT DOCUMENTS:\n${kbContext}\n`;
    }
    fullPrompt += `\nUser Question: ${msg}\n\nHelpful Response:`;

    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        prompt: fullPrompt,
        stream: false,
        options: { temperature: 0.2 }
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama status code ${res.status}`);
    }

    const data = await res.json() as { response: string };
    const list = [...this.messages];
    if (list[list.length - 1].content.includes('Ollama fallback')) {
      list.pop();
    }
    this.messages = [...list, { role: 'assistant', content: data.response }];
  }

  onSubmit(e: Event) {
    e.preventDefault();
    void this.sendMessage();
  }

  get totalKbItems(): number {
    return this.documents.length + (this.textContextSaved.trim() ? 1 : 0);
  }
}
