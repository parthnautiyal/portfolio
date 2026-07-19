import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const ADMIN_PIN = 'parth'; // Default PIN

@Component({
  selector: 'app-resume-manager-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-manager-page.component.html',
  styleUrls: ['./resume-manager-page.component.css']
})
export class ResumeManagerPageComponent implements OnInit {
  unlocked = false;
  pin = '';
  pinError = false;

  customKey = '';
  provider: 'gemini' | 'openai' | 'ollama' = 'gemini';
  isSaved = false;

  // PDF Parser State
  pdfFile: File | null = null;
  parsingStatus: 'idle' | 'extracting' | 'calling_ai' | 'syncing' | 'success' | 'error' = 'idle';
  statusMessage = '';
  ollamaUrl = 'http://localhost:11434';
  ollamaModel = 'llama3';

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.customKey = localStorage.getItem('portfolio_custom_api_key') || '';
      this.provider = (localStorage.getItem('portfolio_api_provider') as 'gemini' | 'openai' | 'ollama') || 'gemini';
      this.ollamaUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434';
      this.ollamaModel = localStorage.getItem('portfolio_ollama_model') || 'llama3';
    }
  }

  attemptUnlock(e: Event) {
    e.preventDefault();
    if (this.pin === ADMIN_PIN) {
      this.unlocked = true;
    } else {
      this.pinError = true;
      this.pin = '';
      setTimeout(() => this.pinError = false, 2000);
    }
  }

  handleSave(e: Event) {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_custom_api_key', this.customKey);
      localStorage.setItem('portfolio_api_provider', this.provider);
      localStorage.setItem('portfolio_ollama_url', this.ollamaUrl);
      localStorage.setItem('portfolio_ollama_model', this.ollamaModel);
      this.isSaved = true;
      setTimeout(() => this.isSaved = false, 2000);
    }
  }

  handleFileChange(e: Event) {
    const inputEl = e.target as HTMLInputElement;
    if (inputEl.files && inputEl.files.length > 0) {
      this.pdfFile = inputEl.files[0];
      this.parsingStatus = 'idle';
      this.statusMessage = '';
    }
  }

  extractTextFromPdf(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
        try {
          let pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
          if (!pdfjsLib) {
            this.statusMessage = 'Loading PDF parsing library from CDN...';
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
            script.onload = async () => {
              const loadedLib = (window as any)['pdfjs-dist/build/pdf'];
              loadedLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
              resolve(this.parsePdfBytes(loadedLib, typedarray));
            };
            script.onerror = () => reject(new Error('Failed to load PDF worker from CDN.'));
            document.head.appendChild(script);
          } else {
            resolve(this.parsePdfBytes(pdfjsLib, typedarray));
          }
        } catch (err) {
          reject(err);
        }
      };
      fileReader.onerror = (err) => reject(err);
      fileReader.readAsArrayBuffer(file);
    });
  }

  async parsePdfBytes(pdfjsLib: any, bytes: Uint8Array): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      this.statusMessage = `Extracting text from page ${i} of ${pdf.numPages}...`;
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n';
    }
    return text;
  }

  async handleParseResume() {
    if (!this.pdfFile) return;

    this.parsingStatus = 'extracting';
    this.statusMessage = 'Reading PDF file...';

    try {
      const rawText = await this.extractTextFromPdf(this.pdfFile);
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Extracted text is empty. Make sure the PDF contains text layer, not scanned images.');
      }

      this.parsingStatus = 'calling_ai';
      this.statusMessage = 'Sending text to LLM parser (this can take a few moments)...';

      const systemPrompt = `
You are a highly precise resume parser. You will convert the provided raw resume text of Parth Nautiyal into structured JSON matching this exact schema:

{
  "personal": {
    "name": "Parth Nautiyal",
    "title": "Full-Stack Engineer",
    "summary": "Brief summary...",
    "email": "parthnautiyal2002@gmail.com",
    "github": "https://github.com/parthnautiyal",
    "linkedin": "https://www.linkedin.com/in/parth-nautiyal/",
    "leetcode": "https://leetcode.com/u/parth_nautiyal/",
    "resumeUrl": "/Parth_Nautiyal_Resume.pdf"
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "period": "Start - End",
      "bullets": [
        "Responsibility bullet 1",
        "Responsibility bullet 2"
      ]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree (e.g. B.Tech)",
      "field": "Field of Study (e.g. Computer Science)",
      "location": "City, Country",
      "period": "Start - End",
      "details": ["GPA/CGPA", "Activities/Honors"]
    }
  ],
  "skills": [
    {
      "name": "Skill Name (e.g. React)",
      "category": "frontend" | "backend" | "devops" | "tools"
    }
  ]
}

Ensure:
1. Every experience bullet is grammatical, professional, and reflects Parth's achievements.
2. Skills are categorized accurately:
   - "frontend": React, HTML, CSS, JavaScript, TypeScript, Angular, Tailwind, etc.
   - "backend": Java, Spring Boot, Microservices, Kafka, SQL, Databases, Temporal, etc.
   - "devops": Docker, Kubernetes, Jenkins, Ansible, AWS, CI/CD, Helm, Prometheus, Grafana, Datadog, etc.
   - "tools": Git, Linux, Maven, npm, postman, IntelliJ, Jira, etc.
3. Return ONLY a single valid JSON block. Do not wrap in markdown \`\`\`json tags. Do not write any conversational text.
`;

      let jsonResponseText = '';

      if (this.provider === 'gemini') {
        const key = this.customKey;
        if (!key) {
          throw new Error('Google Gemini API Key is missing. Please save it in settings first.');
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nResume Text:\n${rawText}` }] }],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const resJson = await response.json();
        jsonResponseText = resJson.candidates[0].content.parts[0].text;
      } else if (this.provider === 'openai') {
        const key = this.customKey;
        if (!key) {
          throw new Error('OpenAI API Key is missing. Please save it in settings first.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are a precise JSON extractor.' },
              { role: 'user', content: `${systemPrompt}\n\nResume Text:\n${rawText}` }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const resJson = await response.json();
        jsonResponseText = resJson.choices[0].message.content;
      } else {
        this.statusMessage = `Contacting local Ollama instance at ${this.ollamaUrl} (model: ${this.ollamaModel})...`;
        const response = await fetch(`${this.ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.ollamaModel,
            prompt: `${systemPrompt}\n\nResume Text:\n${rawText}`,
            stream: false,
            options: {
              temperature: 0.1
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Ollama generation failed: make sure Ollama is running at ${this.ollamaUrl} and model "${this.ollamaModel}" is pulled.`);
        }

        const resJson = await response.json();
        jsonResponseText = resJson.response.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      const parsedData = JSON.parse(jsonResponseText.trim());
      if (!parsedData.personal || !parsedData.experience) {
        throw new Error('LLM parsed output did not match schema format. Try again.');
      }

      this.parsingStatus = 'syncing';
      this.statusMessage = 'Saving details and syncing local files...';

      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio_resume_data', JSON.stringify(parsedData));
        localStorage.setItem('portfolio_resume_data_version', 'user-upload');
      }

      try {
        const syncResponse = await fetch('/api/update-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData)
        });
        const syncData = await syncResponse.json();
        console.log('Disk sync response:', syncData);
      } catch (err) {
        console.log('Static host mode detected: direct file-writing skipped. Data saved in browser storage.');
      }

      this.parsingStatus = 'success';
      this.statusMessage = 'Resume parsed and refined successfully! The portfolio content has been updated.';
    } catch (err: any) {
      console.error(err);
      this.parsingStatus = 'error';
      this.statusMessage = err.message || 'Parsing failed. Check your API credentials or local Ollama configuration.';
    }
  }

  handleClearOverride() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('portfolio_resume_data');
      localStorage.removeItem('portfolio_resume_data_version');
      window.location.reload();
    }
  }

  get hasOverride(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('portfolio_resume_data');
  }
}
