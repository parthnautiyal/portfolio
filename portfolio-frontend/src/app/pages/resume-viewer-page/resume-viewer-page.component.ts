import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getPersonal, getExperience, getEducation, getSkills, getResumeProjects } from '../../utils/contentLoader';
import { QuestService } from '../../services/quest.service';
import { SkillIconComponent } from '../../components/skill-icon/skill-icon.component';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

type RecruiterFocus = 'all' | 'backend' | 'devops' | 'fullstack';

export type Token = {
  text: string;
  isLink: boolean;
  to?: string;
  isMatch?: boolean;
  matchIndex?: number;
};

@Component({
  selector: 'app-resume-viewer-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkillIconComponent, SafeUrlPipe],
  templateUrl: './resume-viewer-page.component.html',
  styleUrls: ['./resume-viewer-page.component.css']
})
export class ResumeViewerPageComponent implements OnInit, OnDestroy {
  personal = getPersonal();
  experience = getExperience();
  projects = getResumeProjects();
  education = getEducation();
  skillCategories = getSkills();

  activeTab: 'interactive' | 'pdf' = 'interactive';
  recruiterFocus: RecruiterFocus = 'all';
  focusOptions: RecruiterFocus[] = ['all', 'backend', 'devops', 'fullstack'];
  copied = false;
  searchTerm = '';
  isPdfFullscreen = false;
  isPdfFullscreenClosing = false;
  activeMatchIndex = 0;
  totalMatches = 0;

  // Cached tokens to avoid recalculation loops
  summaryTokens: Token[] = [];
  experienceTokens: { role: Token[]; company: Token[]; location: Token[]; period: Token[]; bullets: Token[][] }[] = [];
  projectsTokens: { title: Token[]; tech: Token[]; links: { label: string; url: string }[]; bullets: Token[][] }[] = [];

  constructor(
    private questService: QuestService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.questService.unlockAchievement('VIEW_RESUME');
    this.tokenizeResume();
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }

  onSearchChange() {
    this.activeMatchIndex = 0;
    this.tokenizeResume();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleNextMatch();
    }
  }

  tokenizeResume() {
    let matchCounter = 0;

    const tokenizeText = (text: string): Token[] => {
      if (!text) return [];

      const linksMap = [
        { pattern: /\bKafka\b/g, to: '/system?select=kafka' },
        { pattern: /\bTemporal\b/g, to: '/system?select=temporal' },
        { pattern: /\b(?:Kubernetes|K8s)\b/g, to: '/system?select=k8s' },
        { pattern: /\bResilience4j\b/g, to: '/system?select=circuit' },
        { pattern: /\bSpring Boot\b/g, to: '/system' },
        { pattern: /\b(?:CI\/CD pipelines|CI\/CD|Jenkins|Helm|Docker)\b/g, to: '/system' },
        { pattern: /\b(?:Java|TypeScript|REST APIs|APIs|JUnit|Mockito|TDD)\b/g, to: '/projects' },
        { pattern: /\b(?:microservices|microservice)\b/gi, to: '/projects' },
        { pattern: /\b(?:e-learning platform|training-upskilling)\b/gi, to: '/projects' },
        { pattern: /\b(?:ZopSmart)\b/g, to: '/experience' },
        { pattern: /\b(?:Lovely Professional University)\b/g, to: '/experience' },
        { pattern: /\b(?:B\.Tech)\b/g, to: '/experience' },
        { pattern: /\b(?:email|phone|contact)\b/gi, to: '/contact' }
      ];

      let tokens: Token[] = [{ text, isLink: false }];

      for (const mapping of linksMap) {
        const nextTokens: Token[] = [];
        for (const token of tokens) {
          if (token.isLink) {
            nextTokens.push(token);
            continue;
          }
          const parts = token.text.split(mapping.pattern);
          const matches = token.text.match(mapping.pattern) || [];
          parts.forEach((part, index) => {
            if (part) {
              nextTokens.push({ text: part, isLink: false });
            }
            if (index < matches.length) {
              nextTokens.push({ text: matches[index], isLink: true, to: mapping.to });
            }
          });
        }
        tokens = nextTokens;
      }

      if (!this.searchTerm.trim()) {
        return tokens;
      }

      const escapedTerm = this.searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const searchRegex = new RegExp(`(${escapedTerm})`, 'gi');

      const finalTokens: Token[] = [];
      for (const token of tokens) {
        if (token.isLink) {
          const parts = token.text.split(searchRegex);
          parts.forEach(part => {
            if (part.toLowerCase() === this.searchTerm.toLowerCase()) {
              finalTokens.push({
                text: part,
                isLink: true,
                to: token.to,
                isMatch: true,
                matchIndex: matchCounter++
              });
            } else {
              finalTokens.push({ text: part, isLink: true, to: token.to, isMatch: false });
            }
          });
          continue;
        }

        const parts = token.text.split(searchRegex);
        parts.forEach(part => {
          if (part.toLowerCase() === this.searchTerm.toLowerCase()) {
            finalTokens.push({
              text: part,
              isLink: false,
              isMatch: true,
              matchIndex: matchCounter++
            });
          } else if (part) {
            finalTokens.push({ text: part, isLink: false });
          }
        });
      }

      return finalTokens;
    };

    // Cached tokens for Personal summary
    this.summaryTokens = tokenizeText(this.personal.summary);

    // Cached tokens for Experiences
    this.experienceTokens = this.experience.map(exp => ({
      role: tokenizeText(exp.role),
      company: tokenizeText(exp.company),
      location: tokenizeText(exp.location),
      period: tokenizeText(exp.period),
      bullets: exp.bullets.map(b => tokenizeText(b))
    }));

    // Cached tokens for Projects
    this.projectsTokens = this.projects.map(proj => ({
      title: tokenizeText(proj.title),
      tech: tokenizeText(proj.tech),
      links: proj.links,
      bullets: proj.bullets.map(b => tokenizeText(b))
    }));

    this.totalMatches = matchCounter;
    this.cdr.markForCheck();
  }

  handleNextMatch() {
    if (this.totalMatches === 0) return;
    this.activeMatchIndex = (this.activeMatchIndex + 1) % this.totalMatches;
    this.scrollToMatch(this.activeMatchIndex);
    this.cdr.markForCheck();
  }

  handlePrevMatch() {
    if (this.totalMatches === 0) return;
    this.activeMatchIndex = (this.activeMatchIndex - 1 + this.totalMatches) % this.totalMatches;
    this.scrollToMatch(this.activeMatchIndex);
    this.cdr.markForCheck();
  }

  scrollToMatch(index: number) {
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const element = document.getElementById(`search-match-${index}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 45);
  }

  handleOpenPdfFullscreen() {
    this.isPdfFullscreenClosing = false;
    this.isPdfFullscreen = true;
    this.questService.unlockAchievement('FULLSCREEN_PDF');
    if (typeof document !== 'undefined') {
      document.body.classList.add('overflow-hidden');
    }
    this.cdr.markForCheck();
  }

  handleClosePdfFullscreen() {
    this.isPdfFullscreenClosing = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.ngZone.run(() => {
        this.isPdfFullscreen = false;
        this.isPdfFullscreenClosing = false;
        if (typeof document !== 'undefined') {
          document.body.classList.remove('overflow-hidden');
        }
        this.cdr.markForCheck();
      });
    }, 200);
  }

  async handleCopyText() {
    const expText = this.experience
      .map(
        (exp: any) =>
          `${exp.role} at ${exp.company} (${exp.period})\n${exp.location}\n` +
          exp.bullets.map((b: string) => `• ${b}`).join('\n')
      )
      .join('\n\n');

    const projText = this.projects
      .map(
        (proj) =>
          `${proj.title}\n${proj.tech}\n` +
          proj.bullets.map((b) => `• ${b}`).join('\n')
      )
      .join('\n\n');

    const skillsText = this.skillCategories
      .map((cat) => `${cat.name}: ${cat.items.map((s) => s.name).join(', ')}`)
      .join('\n');

    const plainTextResume = `
PARTH NAUTIYAL
${this.personal.title}
Email: ${this.personal.email} | Phone: ${this.personal.phone}
LinkedIn: ${this.personal.linkedin} | GitHub: ${this.personal.github} | LeetCode: ${this.personal.leetcode}

SUMMARY
${this.personal.summary}

PROFESSIONAL EXPERIENCE
${expText}

PROJECTS
${projText}

EDUCATION
${this.education.degree} - ${this.education.institution} (${this.education.period})
Location: ${this.education.location} | CGPA: ${this.education.cgpa}
Coursework: ${this.education.coursework.join(', ')}

TECHNICAL SKILLS
${skillsText}
    `.trim();

    try {
      if (typeof navigator !== 'undefined') {
        await navigator.clipboard.writeText(plainTextResume);
        this.copied = true;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.ngZone.run(() => {
            this.copied = false;
            this.cdr.markForCheck();
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy resume text:', err);
    }
  }

  setRecruiterFocus(focus: RecruiterFocus) {
    this.recruiterFocus = focus;
    this.cdr.markForCheck();
  }

  isHighlighted(text: string, category?: string): boolean {
    if (this.recruiterFocus === 'all' || !text) return false;

    const t = text.toLowerCase();
    const c = category ? category.toLowerCase() : '';

    if (this.recruiterFocus === 'backend') {
      const backendKeywords = [
        'spring boot', 'spring', 'java', 'kafka', 'temporal', 'microservice', 'microservices',
        'postgresql', 'mysql', 'redis', 'pgvector', 'qdrant', 'sql', 'rest api', 'rest apis',
        'api', 'apis', 'idempotency', 'workflow', 'orchestration', 'asynchronous', 'streaming',
        'latency', 'throughput', 'concurrency', 'completablefuture', 'junit', 'mockito', 'tdd',
        'test-driven', 'backend', 'database', 'distributed systems', 'dbms', 'object oriented',
        'ingestion', 'retries', 'event-driven', 'rag', 'langchain4j', 'spring ai'
      ];
      const backendCategories = [
        'languages & frameworks', 'databases & search', 'distributed systems & cloud',
        'testing & methodologies', 'backend', 'database', 'messaging'
      ];

      if (c && backendCategories.some(cat => c.includes(cat) || cat.includes(c))) {
        // Exclude frontend-only tools if in generic category
        if (t === 'react' || t === 'angular' || t === 'html' || t === 'css') return false;
        return true;
      }

      return backendKeywords.some(kw => {
        if (kw.includes(' ') || kw.includes('/') || kw.includes('-')) {
          return t.includes(kw);
        }
        return new RegExp(`\\b${kw}\\b`, 'i').test(t);
      });
    }

    if (this.recruiterFocus === 'devops') {
      const devopsKeywords = [
        'docker', 'kubernetes', 'k8s', 'rancher', 'helm', 'azure', 'cloud', 'ci/cd', 'ci/cd pipelines',
        'pipeline', 'pipelines', 'jenkins', 'git', 'linux', 'sonarqube', 'snyk', 'prometheus',
        'grafana', 'datadog', 'observability', 'mttr', 'monitoring', 'incident', 'caching',
        'build time', 'deployment', 'retries', 'resilience', 'cloud computing', 'distributed systems'
      ];
      const devopsCategories = [
        'devops & observability', 'distributed systems & cloud', 'cloud', 'infrastructure'
      ];

      if (c && devopsCategories.some(cat => c.includes(cat) || cat.includes(c))) {
        if (t === 'java' || t === 'rest apis' || t === 'react') return false;
        return true;
      }

      return devopsKeywords.some(kw => {
        if (kw.includes(' ') || kw.includes('/') || kw.includes('-')) {
          return t.includes(kw);
        }
        return new RegExp(`\\b${kw}\\b`, 'i').test(t);
      });
    }

    if (this.recruiterFocus === 'fullstack') {
      const fullstackKeywords = [
        'full-stack', 'fullstack', 'react', 'angular', 'typescript', 'javascript', 'html', 'css',
        'frontend', 'ui', 'ux', 'web', 'client', 'rest api', 'rest apis', 'api', 'apis',
        'claude', 'gemini', 'openai', 'ollama', 'langchain4j', 'spring ai', 'rag', 'prompt engineering',
        'chat', 'chatbot', 'recruitment platform', 'gmail api', 'oauth', 'spring boot', 'java',
        'postgresql', 'mysql', 'redis', 'tailwind', 'microservices', 'platform', 'fullpage',
        'database management systems', 'web app', 'full-stack platform'
      ];
      const fullstackCategories = [
        'languages & frameworks', 'ai & llm integration', 'databases & search', 'frontend', 'tools'
      ];

      if (c && fullstackCategories.some(cat => c.includes(cat) || cat.includes(c))) {
        return true;
      }

      return fullstackKeywords.some(kw => {
        if (kw.includes(' ') || kw.includes('/') || kw.includes('-')) {
          return t.includes(kw);
        }
        return new RegExp(`\\b${kw}\\b`, 'i').test(t);
      });
    }

    return false;
  }

  getMatchingCount(): number {
    if (this.recruiterFocus === 'all') return 0;
    let count = 0;

    this.experience.forEach((exp: any) => {
      exp.bullets.forEach((b: string) => {
        if (this.isHighlighted(b)) count++;
      });
    });

    this.projects.forEach((p: any) => {
      p.bullets.forEach((b: string) => {
        if (this.isHighlighted(b)) count++;
      });
    });

    this.skillCategories.forEach(cat => {
      cat.items.forEach(s => {
        if (this.isHighlighted(s.name, cat.name)) count++;
      });
    });

    return count;
  }

  getRoutePath(to?: string): string {
    if (!to) return '';
    return to.split('?')[0];
  }

  getQueryParams(to?: string): Record<string, string> {
    if (!to || !to.includes('?')) return {};
    const queryString = to.split('?')[1];
    const params: Record<string, string> = {};
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[key] = decodeURIComponent(value || '');
      }
    }
    return params;
  }

  getBulletPlainString(tokens: Token[]): string {
    return tokens.map(t => t.text).join('');
  }
}
