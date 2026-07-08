import { useState } from 'react'
import { useQuest, ACHIEVEMENTS } from '../context/QuestContext.tsx'
import type { AchievementKey } from '../context/QuestContext.tsx'
import { FiAward, FiCheckCircle, FiLock, FiX, FiRefreshCw, FiChevronLeft } from 'react-icons/fi'

export default function QuestHUD() {
  const {
    level,
    xp,
    unlockedAchievements,
    toasts,
    removeToast,
    resetQuests,
  } = useQuest()

  const [isOpen, setIsOpen] = useState(false)

  // Calculations for circular progress ring (radius = 18, circumference = 2 * pi * r ≈ 113)
  const radius = 18
  const stroke = 3
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(xp, 499) / 500) * circumference

  const classNames = [
    'Novice Reviewer',
    'Observer',
    'Reliability Inspector',
    'Systems Analyst',
    'Lead System Evaluator',
  ]

  const totalAchievements = Object.keys(ACHIEVEMENTS).length
  const unlockedCount = Object.values(unlockedAchievements).filter(Boolean).length

  return (
    <>
      {/* 1. Global Floating Toast Overlay */}
      <div className="fixed bottom-24 right-6 z-[999] flex flex-col gap-3 pointer-events-none items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 w-80 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-mac-zoom ${
              toast.type === 'levelup'
                ? 'bg-amber-500/90 dark:bg-amber-600/90 border-amber-400 text-white'
                : 'bg-white/80 dark:bg-slate-900/85 border-slate-200 dark:border-slate-800 text-[var(--color-text)]'
            }`}
          >
            <div className="text-2xl mt-0.5 select-none">
              {toast.type === 'levelup' ? '🌟' : '🏆'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight truncate">{toast.title}</p>
              <p className={`text-[0.68rem] mt-1 leading-normal opacity-90`}>
                {toast.description}
              </p>
              {toast.xp && (
                <span className="inline-block mt-1.5 text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  +{toast.xp} XP
                </span>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-slate-100/10"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 2. Floating Circular Progress HUD Pill */}
      <div className="fixed bottom-6 right-6 z-[99] print:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 p-2 pr-4 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-800 dark:border-slate-200'
              : 'bg-white/85 dark:bg-slate-900/85 text-[var(--color-text)] border-slate-200 dark:border-slate-800'
          }`}
          aria-label="Toggle Recruiter Quest HUD"
        >
          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center w-9 h-9 select-none">
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                className="text-slate-200 dark:text-slate-700/60"
                strokeWidth={stroke}
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                className="text-blue-500 dark:text-sky-400 transition-all duration-500 ease-out"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <span className="text-[0.65rem] font-black tracking-tight">{level}</span>
          </div>

          <div className="text-left min-w-[70px]">
            <p className="text-[0.55rem] font-bold uppercase tracking-wider opacity-60">Recruiter Quest</p>
            <p className="text-[0.68rem] font-black -mt-0.5 truncate max-w-[100px]">
              {classNames[level - 1]}
            </p>
          </div>
          <FiChevronLeft
            size={14}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* 3. Sliding Challenges Drawer Panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-full max-w-sm z-[98] backdrop-blur-lg bg-white/90 dark:bg-slate-950/90 shadow-2xl border-l border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 ease-out print:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black flex items-center gap-1.5 uppercase tracking-wider">
                <FiAward className="text-blue-500" size={16} /> Quest Tracker
              </h3>
              <p className="text-[0.62rem] text-slate-500 mt-0.5">
                Unlocked {unlockedCount} of {totalAchievements} achievements
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Level Info HUD */}
          <div className="py-4 space-y-2 select-none">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Recruiter Level</span>
                <h4 className="text-lg font-black text-slate-900 dark:text-slate-50 -mt-0.5">
                  Lvl {level} — {classNames[level - 1]}
                </h4>
              </div>
              <span className="text-[0.62rem] font-bold text-slate-400">{xp}/500 XP</span>
            </div>
            {/* XP progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${(xp / 500) * 100}%` }}
                className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-500 ease-out"
              ></div>
            </div>
          </div>

          {/* Challenges Checklist Scrollable list */}
          <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-3 scrollbar-thin">
            {(Object.keys(ACHIEVEMENTS) as AchievementKey[]).map((key) => {
              const item = ACHIEVEMENTS[key]
              const isUnlocked = unlockedAchievements[key]

              return (
                <div
                  key={key}
                  className={`p-3 rounded-2xl border flex gap-3 transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-150 dark:border-slate-850'
                  }`}
                >
                  <div className="mt-0.5">
                    {isUnlocked ? (
                      <FiCheckCircle className="text-emerald-500 dark:text-emerald-400" size={16} />
                    ) : (
                      <FiLock className="text-slate-400 dark:text-slate-500" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold leading-snug ${
                        isUnlocked
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-slate-700 dark:text-slate-350'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                        isUnlocked
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      +{item.xp} XP
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Reset Quests Option */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[0.65rem]">
            <span className="text-slate-400 font-bold">Quest Simulator v1.0.0</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all achievements and level back to Lvl 1?')) {
                  resetQuests()
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 transition-all cursor-pointer"
            >
              <FiRefreshCw size={10} /> Reset Progress
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
