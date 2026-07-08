import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    confetti?: (options?: any) => void
  }
}

export type AchievementKey =
  | 'LAND_ON_PORTFOLIO'
  | 'VIEW_RESUME'
  | 'FULLSCREEN_PDF'
  | 'TRIGGER_CHAOS'
  | 'CHAT_QUERY'
  | 'EXPAND_PROMOTION'

export type Achievement = {
  key: AchievementKey
  title: string
  description: string
  xp: number
}

export const ACHIEVEMENTS: Record<AchievementKey, Omit<Achievement, 'key'>> = {
  LAND_ON_PORTFOLIO: {
    title: 'Hello World!',
    description: 'Land on Parth\'s portfolio website.',
    xp: 100,
  },
  VIEW_RESUME: {
    title: 'Resume Scout',
    description: 'Access the Interactive Resume page.',
    xp: 150,
  },
  FULLSCREEN_PDF: {
    title: 'Deep Focus',
    description: 'Inspect the resume PDF in fullscreen mode.',
    xp: 150,
  },
  TRIGGER_CHAOS: {
    title: 'Chaos Engineer',
    description: 'Trigger a simulator failure injection in the cockpit.',
    xp: 250,
  },
  CHAT_QUERY: {
    title: 'Interrogator',
    description: 'Ask the AI chatbot assistant a question.',
    xp: 200,
  },
  EXPAND_PROMOTION: {
    title: 'SDE Promotion Track',
    description: 'Inspect SDE II promotion details in the timeline.',
    xp: 150,
  },
}

export type QuestToast = {
  id: string
  title: string
  description: string
  xp?: number
  type: 'achievement' | 'levelup'
}

type QuestContextType = {
  level: number
  xp: number
  unlockedAchievements: Record<AchievementKey, boolean>
  toasts: QuestToast[]
  unlockAchievement: (key: AchievementKey) => void
  removeToast: (id: string) => void
  resetQuests: () => void
}

const QuestContext = createContext<QuestContextType | undefined>(undefined)

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState<number>(1)
  const [xp, setXp] = useState<number>(0)
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<AchievementKey, boolean>>({
    LAND_ON_PORTFOLIO: false,
    VIEW_RESUME: false,
    FULLSCREEN_PDF: false,
    TRIGGER_CHAOS: false,
    CHAT_QUERY: false,
    EXPAND_PROMOTION: false,
  })
  const [toasts, setToasts] = useState<QuestToast[]>([])

  // Mutable ref to handle instant synchronous check & locking, preventing StrictMode double toasts
  const unlockedRef = useRef<Record<AchievementKey, boolean>>({
    LAND_ON_PORTFOLIO: false,
    VIEW_RESUME: false,
    FULLSCREEN_PDF: false,
    TRIGGER_CHAOS: false,
    CHAT_QUERY: false,
    EXPAND_PROMOTION: false,
  })

  // Load confetti script dynamically on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.confetti) return
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem('quest_level')
      const savedXp = localStorage.getItem('quest_xp')
      const savedUnlocked = localStorage.getItem('quest_unlocked')

      if (savedLevel) setLevel(parseInt(savedLevel, 10))
      if (savedXp) setXp(parseInt(savedXp, 10))
      if (savedUnlocked) {
        const parsed = JSON.parse(savedUnlocked)
        setUnlockedAchievements(parsed)
        unlockedRef.current = parsed
      }
    } catch (e) {
      console.warn('Failed to load quest status from localStorage:', e)
    }
  }, [])

  // Sync state to localStorage on updates
  const saveState = (newLvl: number, newXp: number, newUnlocked: Record<AchievementKey, boolean>) => {
    try {
      localStorage.setItem('quest_level', newLvl.toString())
      localStorage.setItem('quest_xp', newXp.toString())
      localStorage.setItem('quest_unlocked', JSON.stringify(newUnlocked))
    } catch (e) {
      console.warn('Failed to save quest status to localStorage:', e)
    }
  }

  const addToast = (title: string, description: string, type: 'achievement' | 'levelup', rewardXp?: number) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, xp: rewardXp, type }])
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const unlockAchievement = (key: AchievementKey) => {
    // Check ref synchronously to ignore double calls in the same render tick
    if (unlockedRef.current[key]) return

    // Immediately mark as unlocked in ref
    unlockedRef.current[key] = true

    const achievement = ACHIEVEMENTS[key]
    const updatedUnlocked = { ...unlockedRef.current }
    
    let newXp = xp + achievement.xp
    let newLvl = level
    let leveledUp = false

    // Handle leveling up logic (each level requires 500 XP)
    const xpNeeded = 500
    if (newXp >= xpNeeded && level < 5) {
      newXp = newXp - xpNeeded
      newLvl = level + 1
      leveledUp = true
    }

    setLevel(newLvl)
    setXp(newXp)
    setUnlockedAchievements(updatedUnlocked)
    saveState(newLvl, newXp, updatedUnlocked)

    // Trigger unlocked toast
    addToast(
      `Achievement Unlocked: ${achievement.title}`,
      achievement.description,
      'achievement',
      achievement.xp
    )

    // Trigger level up effects
    if (leveledUp) {
      // Trigger canvas confetti burst
      if (typeof window !== 'undefined' && window.confetti) {
        try {
          window.confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.6 }
          })
        } catch (e) {
          console.warn('Confetti burst failed:', e)
        }
      }

      setTimeout(() => {
        const classNames = [
          'Novice Reviewer',
          'Observer',
          'Reliability Inspector',
          'Systems Analyst',
          'Lead System Evaluator',
        ]
        addToast(
          `Level Up! 🌟 Level ${newLvl}`,
          `You unlocked the Class: ${classNames[newLvl - 1]}`,
          'levelup'
        )
      }, 800) // slight offset for clean visual separation
    }
  }

  const resetQuests = () => {
    const initialUnlocked = {
      LAND_ON_PORTFOLIO: false,
      VIEW_RESUME: false,
      FULLSCREEN_PDF: false,
      TRIGGER_CHAOS: false,
      CHAT_QUERY: false,
      EXPAND_PROMOTION: false,
    }
    unlockedRef.current = initialUnlocked
    setLevel(1)
    setXp(0)
    setUnlockedAchievements(initialUnlocked)
    localStorage.removeItem('quest_level')
    localStorage.removeItem('quest_xp')
    localStorage.removeItem('quest_unlocked')
    setToasts([])
  }

  return (
    <QuestContext.Provider
      value={{
        level,
        xp,
        unlockedAchievements,
        toasts,
        unlockAchievement,
        removeToast,
        resetQuests,
      }}
    >
      {children}
    </QuestContext.Provider>
  )
}

export function useQuest() {
  const context = useContext(QuestContext)
  if (!context) {
    throw new Error('useQuest must be used inside a QuestProvider')
  }
  return context;
}
