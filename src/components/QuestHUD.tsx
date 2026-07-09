import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuest, ACHIEVEMENTS } from '../context/QuestContext.tsx'
import type { AchievementKey } from '../context/QuestContext.tsx'
import { FiAward, FiCheckCircle, FiLock, FiX, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const achievementLinks: Record<AchievementKey, string> = {
  LAND_ON_PORTFOLIO: '/',
  VIEW_RESUME: '/resume',
  FULLSCREEN_PDF: '/resume',
  TRIGGER_CHAOS: '/system',
  CHAT_QUERY: '/chat',
  EXPAND_PROMOTION: '/experience',
}

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
  const [position, setPosition] = useState({ x: -1, y: -1 })
  const [isDragging, setIsDragging] = useState(false)
  const [isShrunk, setIsShrunk] = useState(false)
  const [shrinkSide, setShrinkSide] = useState<'left' | 'right' | null>(null)
  const [hasOpened, setHasOpened] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio_quest_opened') === 'true'
    }
    return false
  })

  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number; moved: boolean } | null>(null)
  const navigate = useNavigate()

  // Circular progress calculations
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Left click only
    e.preventDefault()
    
    const posX = position.x !== -1 ? position.x : window.innerWidth - 200
    const posY = position.y !== -1 ? position.y : window.innerHeight - 76
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX,
      posY,
      moved: false,
    }
    
    setIsDragging(true)
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return
      const dx = moveEvent.clientX - dragRef.current.startX
      const dy = moveEvent.clientY - dragRef.current.startY
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragRef.current.moved = true
      }
      
      let newX = dragRef.current.posX + dx
      let newY = dragRef.current.posY + dy
      
      newX = Math.max(0, Math.min(window.innerWidth - 180, newX))
      newY = Math.max(0, Math.min(window.innerHeight - 70, newY))
      
      setPosition({ x: newX, y: newY })
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setIsDragging(false)
      
      if (!dragRef.current) return
      
      if (!dragRef.current.moved) {
        handleToggleOpen()
      } else {
        const x = position.x
        const threshold = 50
        if (x < threshold) {
          setIsShrunk(true)
          setShrinkSide('left')
          setPosition({ x: 0, y: position.y })
        } else if (x > window.innerWidth - 220) {
          setIsShrunk(true)
          setShrinkSide('right')
          setPosition({ x: window.innerWidth - 44, y: position.y })
        } else {
          setIsShrunk(false)
          setShrinkSide(null)
        }
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const posX = position.x !== -1 ? position.x : window.innerWidth - 200
    const posY = position.y !== -1 ? position.y : window.innerHeight - 76
    
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX,
      posY,
      moved: false,
    }
    
    setIsDragging(true)
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!dragRef.current) return
      const t = moveEvent.touches[0]
      const dx = t.clientX - dragRef.current.startX
      const dy = t.clientY - dragRef.current.startY
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragRef.current.moved = true
      }
      
      let newX = dragRef.current.posX + dx
      let newY = dragRef.current.posY + dy
      
      newX = Math.max(0, Math.min(window.innerWidth - 180, newX))
      newY = Math.max(0, Math.min(window.innerHeight - 70, newY))
      
      setPosition({ x: newX, y: newY })
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      setIsDragging(false)
      
      if (!dragRef.current) return
      
      if (!dragRef.current.moved) {
        handleToggleOpen()
      } else {
        const x = position.x
        const threshold = 50
        if (x < threshold) {
          setIsShrunk(true)
          setShrinkSide('left')
          setPosition({ x: 0, y: position.y })
        } else if (x > window.innerWidth - 220) {
          setIsShrunk(true)
          setShrinkSide('right')
          setPosition({ x: window.innerWidth - 44, y: position.y })
        } else {
          setIsShrunk(false)
          setShrinkSide(null)
        }
      }
    }
    
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next && !hasOpened) {
        setHasOpened(true)
        localStorage.setItem('portfolio_quest_opened', 'true')
      }
      return next
    })
  }

  const handleExpand = () => {
    setIsShrunk(false)
    setShrinkSide(null)
    if (shrinkSide === 'left') {
      setPosition({ x: 32, y: position.y })
    } else {
      setPosition({ x: window.innerWidth - 220, y: position.y })
    }
  }

  const handleAchievementClick = (key: AchievementKey) => {
    const target = achievementLinks[key]
    if (target) {
      navigate(target)
      setIsOpen(false)
    }
  }

  // Adjust coordinates on window resize
  useEffect(() => {
    const handleResize = () => {
      if (position.x !== -1) {
        if (isShrunk) {
          if (shrinkSide === 'left') {
            setPosition({ x: 0, y: Math.min(position.y, window.innerHeight - 70) })
          } else {
            setPosition({ x: window.innerWidth - 44, y: Math.min(position.y, window.innerHeight - 70) })
          }
        } else {
          const newX = Math.min(position.x, window.innerWidth - 190)
          const newY = Math.min(position.y, window.innerHeight - 70)
          setPosition({ x: newX, y: newY })
        }
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [position, isShrunk, shrinkSide])

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

      {/* Click Outside Transparent Overlay for closing drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[97] bg-transparent cursor-default print:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. Floating Circular Progress HUD Pill */}
      {isShrunk ? (
        <button
          onClick={handleExpand}
          style={position.y !== -1 ? { top: position.y, left: shrinkSide === 'left' ? 0 : 'auto', right: shrinkSide === 'right' ? 0 : 'auto' } : {}}
          className={`fixed z-[99] w-11 h-11 bg-[var(--color-primary)] hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
            shrinkSide === 'left' ? 'rounded-r-2xl border-l-0 border border-white/20' : 'rounded-l-2xl border-r-0 border border-white/20'
          }`}
          title="Expand Quest Tracker"
        >
          {shrinkSide === 'left' ? (
            <div className="flex items-center gap-0.5 pl-1.5 text-white">
              <FiAward size={16} />
              <FiChevronRight size={12} className="animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center gap-0.5 pr-1.5 text-white">
              <FiChevronLeft size={12} className="animate-pulse" />
              <FiAward size={16} />
            </div>
          )}
        </button>
      ) : (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={position.x !== -1 && position.y !== -1 ? { left: position.x, top: position.y, bottom: 'auto', right: 'auto' } : {}}
          className={`fixed bottom-6 right-6 z-[99] print:hidden select-none ${isDragging ? 'cursor-grabbing opacity-75' : 'cursor-grab'}`}
        >
          <button
            className={`flex items-center gap-2.5 p-2 pr-4 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 pointer-events-none ${
              isOpen
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-800 dark:border-slate-200'
                : 'bg-white/85 dark:bg-slate-900/85 text-[var(--color-text)] border-slate-200 dark:border-slate-800'
            } ${!hasOpened && !isOpen ? 'animate-highlight-pulse' : ''}`}
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
                  className="text-[var(--color-primary)] transition-all duration-500 ease-out"
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
      )}

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
                <FiAward className="text-[var(--color-primary)]" size={16} /> Quest Tracker
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
                className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500 ease-out"
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
                  onClick={() => !isUnlocked && handleAchievementClick(key)}
                  className={`p-3 rounded-2xl border flex gap-3 transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-150 dark:border-slate-850 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)] cursor-pointer hover:scale-[1.01]'
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
                    {!isUnlocked && (
                      <span className="text-[0.55rem] text-[var(--color-primary)] font-bold block mt-1">
                        Go to challenge →
                      </span>
                    )}
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
