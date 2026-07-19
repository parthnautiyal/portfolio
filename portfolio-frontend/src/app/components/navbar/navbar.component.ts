import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { getPersonal } from '../../utils/contentLoader';
import { trackLinkClick } from '../../utils/analytics';
import { OllamaDiagnosticModalComponent } from '../ollama-diagnostic-modal/ollama-diagnostic-modal.component';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, OllamaDiagnosticModalComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  personal = getPersonal();
  themeMode: ThemeMode = 'dark';
  ollamaStatus: 'checking' | 'connected' | 'offline' = 'checking';
  ollamaModel = 'llama3';
  isOllamaModalOpen = false;
  isMobileMenuOpen = false;
  currentUrl = '';

  private ollamaInterval: any;


  links = [
    { to: '/', label: 'Home' },
    { to: '/experience', label: 'Experience' },
    { to: '/projects', label: 'Projects' },
    { to: '/resume', label: 'Resume' },
    { to: '/system', label: 'System Architecture' },
  ];

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.isMobileMenuOpen = false;
      }
    });
  }

  ngOnInit() {
    this.currentUrl = this.router.url;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_theme_mode');
      const savedTheme: ThemeMode = (saved === 'light' || saved === 'dark') ? saved : 'dark';
      this.themeMode = savedTheme;
      this.applyTheme(savedTheme);

      const savedUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434';
      const savedModel = localStorage.getItem('portfolio_ollama_model') || 'llama3';
      this.ollamaModel = savedModel;

      this.checkOllama(savedUrl);
      this.ollamaInterval = setInterval(() => {
        const url = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434';
        this.checkOllama(url);
      }, 15000);

    }
  }

  ngOnDestroy() {
    if (this.ollamaInterval) clearInterval(this.ollamaInterval);
  }

  private applyTheme(active: 'light' | 'dark', animate = false) {
    if (typeof window === 'undefined') return;

    if (animate) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;background:${active === 'light' ? '#fff' : '#060814'};opacity:0;transition:opacity 0.18s ease`;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.opacity = '0.14';
          setTimeout(() => {
            if (active === 'light') {
              document.documentElement.classList.add('light-theme');
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.remove('light-theme');
              document.documentElement.classList.add('dark');
            }
            window.localStorage.setItem('theme', active);
            overlay.style.opacity = '0';
            setTimeout(() => document.body.removeChild(overlay), 300);
          }, 120);
        });
      });
      return;
    }

    if (active === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
    window.localStorage.setItem('theme', active);
  }

  cycleTheme() {
    const next: ThemeMode = this.themeMode === 'dark' ? 'light' : 'dark';
    this.themeMode = next;
    localStorage.setItem('portfolio_theme_mode', next);
    this.applyTheme(next, true);
  }

  async checkOllama(url: string) {
    try {
      const res = await fetch(`${url}/api/tags`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      this.ollamaStatus = res.ok ? 'connected' : 'offline';
    } catch {
      this.ollamaStatus = 'offline';
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onLinkClick(name: string, url: string) {
    trackLinkClick(name, url);
  }

  isActive(path: string): boolean {
    if (path === '/') {
      return this.currentUrl === '/' || this.currentUrl === '';
    }
    return this.currentUrl.startsWith(path);
  }
}
