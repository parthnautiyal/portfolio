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
    const t = text.toLowerCase();
    const c = category?.toLowerCase() ?? '';
    
    if (this.recruiterFocus === 'backend') {
      return (
        t.includes('spring boot') ||
        t.includes('java') ||
        t.includes('kafka') ||
        t.includes('temporal') ||
        t.includes('microservice') ||
        t.includes('sql') ||
        t.includes('rest api') ||
        t.includes('idempotency') ||
        t.includes('workflow') ||
        c.includes('backend') ||
        c.includes('database') ||
        c.includes('messaging')
      );
    }
    
    if (this.recruiterFocus === 'devops') {
      return (
        t.includes('kubernetes') ||
        t.includes('docker') ||
        t.includes('helm') ||
        t.includes('ci/cd') ||
        t.includes('jenkins') ||
        t.includes('ansible') ||
        t.includes('grafana') ||
        t.includes('prometheus') ||
        t.includes('datadog') ||
        t.includes('observability') ||
        c.includes('devops') ||
        c.includes('observability')
      );
    }
    
    if (this.recruiterFocus === 'fullstack') {
      return (
        t.includes('react') ||
        t.includes('typescript') ||
        t.includes('angular') ||
        t.includes('html') ||
        t.includes('css') ||
        t.includes('frontend') ||
        c.includes('programming') ||
        c.includes('tools')
      );
    }
    
    return false;
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
