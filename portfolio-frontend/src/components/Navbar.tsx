import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { personal } from '../content/personal'

const links = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Experience' },
  { to: '/projects', label: 'Projects' },
  { to: '/playground', label: 'Playground' },
  { to: '/chat', label: 'Chat' },
  { to: '/contact', label: 'Contact' },
]

type Theme = 'light' | 'dark'

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = window.localStorage.getItem('theme') as Theme | null
    const initial: Theme = stored ?? 'light'
    setTheme(initial)
    if (initial === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'

    // Apply dark class to html element
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Save to localStorage
    window.localStorage.setItem('theme', next)

    // Update state
    setTheme(next)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:bg-slate-100 dark:focus:text-slate-900"
      >
        Skip to main content
      </a>
      <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NavLink to="/" aria-label="Home" className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {personal.name}
        </NavLink>
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-live="polite"
            className="hidden rounded-full border border-slate-300 px-3 py-1 text-[0.7rem] text-slate-700 hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-100 md:inline-block"
          >
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <NavLink
            to="/contact"
            className="hidden rounded-full border border-slate-900 px-4 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-900 hover:text-white dark:border-slate-100 dark:text-slate-50 dark:hover:bg-slate-50 dark:hover:text-slate-900 md:inline-block"
          >
            Contact
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

