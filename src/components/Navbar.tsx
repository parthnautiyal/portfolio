import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { personal } from '../content/personal.ts'
import OllamaDiagnosticModal from './OllamaDiagnosticModal.tsx'
import { FiSun, FiMoon, FiClock } from 'react-icons/fi'
import { trackLinkClick } from '../utils/analytics.ts'

const links = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Experience' },
  { to: '/projects', label: 'Projects' },
  { to: '/ats-checker', label: 'ATS Checker' },
  { to: '/playground', label: 'Playground' },
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
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <a
          href={personal.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn Profile"
          className="text-sm font-semibold tracking-tight text-[var(--color-text-bright)] hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
          onClick={() => trackLinkClick('LinkedIn Profile', personal.linkedin)}
        >
          {personal.name}
        </a>
        <ul className="hidden gap-2 text-sm md:flex" role="menubar">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  [
                    'rounded-full px-3 py-1 transition-colors',
                    isActive
                      ? 'bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={cycleTheme}
            title={`Theme: ${themeMode} — click to cycle`}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] px-2.5 py-1 text-[0.7rem] hover:border-[var(--border-color-hover)] cursor-pointer transition-colors duration-200 text-[var(--color-text)]"
          >
            <ThemeIcon size={13} />
            <span className="hidden lg:inline font-medium capitalize">{themeMode}</span>
          </button>

          {/* Local AI status badge */}
          <button
            type="button"
            onClick={() => setIsOllamaModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] px-3 py-1 text-[0.7rem] hover:border-[var(--border-color-hover)] cursor-pointer transition-colors duration-200"
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
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5',
                isActive
                  ? 'bg-blue-600 text-white dark:bg-sky-500'
                  : 'bg-blue-600/90 text-white hover:bg-blue-700 dark:bg-sky-500/90 dark:hover:bg-sky-500',
              ].join(' ')
            }
            onClick={() => trackLinkClick('Chatbot CTA')}
          >
            💬 Chatbot
          </NavLink>
          <NavLink
            to="/contact"
            className="hidden rounded-full border border-slate-900 px-4 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-900 hover:text-white dark:border-slate-100 dark:text-slate-50 dark:hover:bg-slate-50 dark:hover:text-slate-900 md:inline-block"
            onClick={() => trackLinkClick('Contact CTA')}
          >
            Contact
          </NavLink>
        </div>
      </nav>

      <OllamaDiagnosticModal
        isOpen={isOllamaModalOpen}
        onClose={() => setIsOllamaModalOpen(false)}
        currentOllamaUrl={localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434'}
        currentOllamaModel={localStorage.getItem('portfolio_ollama_model') || 'llama3'}
      />
    </header>
  )
}
