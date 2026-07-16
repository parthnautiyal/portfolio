import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { personal } from '../content/personal.ts'
import OllamaDiagnosticModal from './OllamaDiagnosticModal.tsx'
import { FiSun, FiMoon, FiClock, FiMenu, FiX } from 'react-icons/fi'
import { trackLinkClick } from '../utils/analytics.ts'

const links = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Experience' },
  { to: '/projects', label: 'Projects' },
  { to: '/resume', label: 'Resume' },
  { to: '/system', label: 'System Architecture' },
]

type ThemeMode = 'auto' | 'light' | 'dark'

const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours()
  return hour >= 18 || hour < 6 ? 'dark' : 'light'
}

const applyTheme = (active: 'light' | 'dark', animate = false) => {
  if (animate) {
    const overlay = document.createElement('div')
    overlay.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;background:${active === 'light' ? '#fff' : '#060814'};opacity:0;transition:opacity 0.18s ease`
    document.body.appendChild(overlay)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.style.opacity = '0.14'
      setTimeout(() => {
        if (active === 'light') {
          document.documentElement.classList.add('light-theme')
          document.documentElement.classList.remove('dark')
        } else {
          document.documentElement.classList.remove('light-theme')
          document.documentElement.classList.add('dark')
        }
        window.localStorage.setItem('theme', active)
        overlay.style.opacity = '0'
        setTimeout(() => document.body.removeChild(overlay), 300)
      }, 120)
    }))
    return
  }
  if (active === 'light') {
    document.documentElement.classList.add('light-theme')
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.remove('light-theme')
    document.documentElement.classList.add('dark')
  }
  window.localStorage.setItem('theme', active)
}

export default function Navbar() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto')
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'offline'>('checking')
  const [ollamaModel, setOllamaModel] = useState<string>('llama3')
  const [isOllamaModalOpen, setIsOllamaModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const saved = (localStorage.getItem('portfolio_theme_mode') as ThemeMode) || 'auto'
    setThemeMode(saved)
    applyTheme(saved === 'auto' ? getTimeBasedTheme() : saved)

    const savedUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434'
    const savedModel = localStorage.getItem('portfolio_ollama_model') || 'llama3'
    setOllamaModel(savedModel)

    const checkOllama = async () => {
      try {
        const res = await fetch(`${savedUrl}/api/tags`, { method: 'GET', headers: { 'Accept': 'application/json' } })
        setOllamaStatus(res.ok ? 'connected' : 'offline')
      } catch {
        setOllamaStatus('offline')
      }
    }

    checkOllama()
    const checkInterval = setInterval(checkOllama, 15000)

    // Auto-theme interval — only fires when mode is 'auto'
    const themeInterval = setInterval(() => {
      const mode = (localStorage.getItem('portfolio_theme_mode') as ThemeMode) || 'auto'
      if (mode === 'auto') {
        const next = getTimeBasedTheme()
        const current = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark'
        if (next !== current) applyTheme(next, true)
      }
    }, 60000)

    return () => {
      clearInterval(checkInterval)
      clearInterval(themeInterval)
    }
  }, [])

  // Auto-close mobile menu on route transitions
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const cycleTheme = () => {
    const order: ThemeMode[] = ['auto', 'light', 'dark']
    const next = order[(order.indexOf(themeMode) + 1) % 3]
    setThemeMode(next)
    localStorage.setItem('portfolio_theme_mode', next)
    const active = next === 'auto' ? getTimeBasedTheme() : next
    applyTheme(active, true)
  }

  const ThemeIcon = themeMode === 'dark' ? FiMoon : themeMode === 'light' ? FiSun : FiClock

  return (
    <header className="sticky top-0 z-20 glass-panel border-x-0 border-t-0 bg-[var(--bg-surface)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:bg-slate-100 dark:focus:text-slate-900"
      >
        Skip to main content
      </a>
      <nav aria-label="Main navigation" className="mx-auto flex max-w-[1600px] items-center justify-between px-6 md:px-12 xl:px-16 py-4">
        <a
          href={personal.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn Profile"
          className="flex items-center gap-3 text-xl md:text-2xl font-semibold tracking-tight text-[var(--color-text-bright)] hover:text-[var(--color-primary)] transition-colors duration-200"
          onClick={() => trackLinkClick('LinkedIn Profile', personal.linkedin)}
        >
          <img
            src="/parth_avatar.jpg"
            alt=""
            className="h-8 w-8 rounded-full object-cover border border-[var(--border-color)] shadow-sm shrink-0"
          />
          <span>{personal.name.split(' ')[0]}</span>
        </a>

        {/* Central spacious links menu */}
        <ul className="hidden md:flex items-center gap-5 text-sm" role="menubar">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  [
                    'h-10 flex items-center justify-center rounded-full px-4 text-sm font-medium transition-all duration-200 border border-transparent',
                    isActive
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold border-[var(--color-primary)]/20 shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)] hover:bg-[var(--bg-surface-hover)]',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Action Controls on the right (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={cycleTheme}
            title={`Theme: ${themeMode} — click to cycle`}
            className="h-10 flex items-center justify-center gap-2 rounded-full border border-[var(--border-color)] px-4 text-sm font-medium hover:border-[var(--border-color-hover)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-all duration-200 text-[var(--color-text)]"
          >
            <ThemeIcon size={14} />
            <span className="hidden lg:inline capitalize">{themeMode}</span>
          </button>

          {/* Local AI status badge */}
          <button
            type="button"
            onClick={() => setIsOllamaModalOpen(true)}
            className="h-10 flex items-center justify-center gap-2 rounded-full border border-[var(--border-color)] px-4 text-sm font-medium hover:border-[var(--border-color-hover)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-all duration-200 text-[var(--color-text)]"
            title={`Local LLM Connectivity Setup & Status (Active Model: ${ollamaModel})`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${
              ollamaStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              ollamaStatus === 'checking' ? 'bg-amber-500 animate-pulse' :
              'bg-rose-500'
            }`} />
            <span className="hidden lg:inline text-[var(--color-text)] font-medium">
              Local AI: {ollamaStatus === 'connected' ? 'Online' : ollamaStatus === 'checking' ? 'Checking' : 'Offline'}
            </span>
          </button>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              [
                'h-10 flex items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md border-none btn-gradient',
                isActive ? 'font-bold' : '',
              ].join(' ')
            }
            onClick={() => trackLinkClick('Chatbot CTA')}
          >
            💬 Chatbot
          </NavLink>

          {/* Contact CTA */}
          <NavLink
            to="/contact"
            className="h-10 flex items-center justify-center rounded-full border border-[var(--border-color)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-color-hover)] transition-all duration-200 cursor-pointer"
            onClick={() => trackLinkClick('Contact CTA')}
          >
            Contact
          </NavLink>
        </div>

        {/* Mobile menu trigger and quick actions */}
        <div className="flex md:hidden items-center gap-2">
          <NavLink
            to="/chat"
            className="h-9 w-9 flex items-center justify-center rounded-full btn-gradient text-xs shadow-md transition-all active:scale-95"
            onClick={() => trackLinkClick('Chatbot Mobile Shortcut')}
            title="Chatbot Assistant"
          >
            💬
          </NavLink>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="h-9 w-9 flex items-center justify-center rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-color-hover)] text-[var(--color-text)] transition-all active:scale-95 cursor-pointer"
          >
            {isMobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation menu drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-surface)] backdrop-blur-xl animate-fade-in">
          <div className="px-6 py-6 space-y-6 flex flex-col">
            <ul className="space-y-2.5" role="menubar">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      [
                        'w-full h-11 flex items-center px-4 rounded-xl text-sm font-medium transition-all border border-transparent',
                        isActive
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold border-[var(--color-primary)]/20'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-bright)] hover:bg-[var(--bg-surface-hover)]',
                      ].join(' ')
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--border-color)]" />
            <div className="flex flex-col gap-3">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={cycleTheme}
                className="w-full h-11 flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 text-xs font-semibold hover:border-[var(--border-color-hover)] hover:bg-[var(--bg-surface-hover)] cursor-pointer text-[var(--color-text)] transition-all"
              >
                <span className="flex items-center gap-2">
                  <ThemeIcon size={14} />
                  <span>Theme Mode</span>
                </span>
                <span className="capitalize px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[10px]">
                  {themeMode}
                </span>
              </button>

              {/* Local AI status */}
              <button
                type="button"
                onClick={() => {
                  setIsOllamaModalOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full h-11 flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 text-xs font-semibold hover:border-[var(--border-color-hover)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    ollamaStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                    ollamaStatus === 'checking' ? 'bg-amber-500 animate-pulse' :
                    'bg-rose-500'
                  }`} />
                  <span>Local AI Setup & Status</span>
                </span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {ollamaStatus === 'connected' ? 'Online' : ollamaStatus === 'checking' ? 'Checking' : 'Offline'}
                </span>
              </button>

              <NavLink
                to="/chat"
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl btn-gradient text-sm font-semibold shadow-md transition-all active:scale-98"
                onClick={() => trackLinkClick('Chatbot CTA')}
              >
                💬 Chatbot Assistant
              </NavLink>

              {/* Contact CTA */}
              <NavLink
                to="/contact"
                className="w-full h-11 flex items-center justify-center rounded-xl border border-[var(--border-color)] px-4 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-color-hover)] transition-all active:scale-98"
                onClick={() => trackLinkClick('Contact CTA')}
              >
                Contact Me
              </NavLink>
            </div>
          </div>
        </div>
      )}

      <OllamaDiagnosticModal
        isOpen={isOllamaModalOpen}
        onClose={() => setIsOllamaModalOpen(false)}
        currentOllamaUrl={localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434'}
        currentOllamaModel={localStorage.getItem('portfolio_ollama_model') || 'llama3'}
      />
    </header>
  )
}
