import { personal } from '../content/personal.ts'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-slate-500 dark:text-slate-400 md:flex-row">
        <span>
          © {new Date().getFullYear()} {personal.name}
        </span>
        <div className="flex gap-4">
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-700 dark:hover:text-slate-200"
          >
            GitHub
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-700 dark:hover:text-slate-200"
          >
            LinkedIn
          </a>
          <a
            href={personal.leetcode}
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-700 dark:hover:text-slate-200"
          >
            LeetCode
          </a>
        </div>
      </div>
    </footer>
  )
}

