/**
 * QuestContext.tsx
 *
 * Gamified achievement and levelling system for the portfolio.
 *
 * SOLID Principles applied:
 *  - Single Responsibility: XP/level calculation is a pure function, script
 *    loading is isolated, and the provider only orchestrates state.
 *  - Open-Closed: new AchievementKeys can be added to ACHIEVEMENTS without
 *    changing provider logic.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    confetti?: (options?: object) => void
  }
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

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
    description: "Land on Parth's portfolio website.",
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
    description: 'Trigger a simulation event in the system architecture dashboard.',
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

// ---------------------------------------------------------------------------
// Pure helpers (Single Responsibility – no side-effects)
// ---------------------------------------------------------------------------

/** Level threshold in XP required to advance one level. */
export const XP_PER_LEVEL = 500

/** Maximum attainable level. */
export const MAX_LEVEL = 5

/** Class names indexed by level (1-based). */
export const LEVEL_CLASS_NAMES = [
  'Novice Reviewer',
  'Observer',
  'Reliability Inspector',
  'Systems Analyst',
  'Lead System Evaluator',
]

/**
 * Pure function: computes the new XP total and level after adding a reward.
 * Returns { newXp, newLevel, leveledUp }.
 */
export function calculateLevelAndXp(
  currentXp: number,
  currentLevel: number,
  rewardXp: number,
): { newXp: number; newLevel: number; leveledUp: boolean } {
  const total = currentXp + rewardXp
  if (total >= XP_PER_LEVEL && currentLevel < MAX_LEVEL) {
    return {
      newXp: total - XP_PER_LEVEL,
      newLevel: currentLevel + 1,
      leveledUp: true,
    }
  }
  return { newXp: total, newLevel: currentLevel, leveledUp: false }
}

/** Builds the initial (all-false) unlocked achievements map. */
export function buildInitialUnlocked(): Record<AchievementKey, boolean> {
  return {
    LAND_ON_PORTFOLIO: false,
    VIEW_RESUME: false,
    FULLSCREEN_PDF: false,
    TRIGGER_CHAOS: false,
    CHAT_QUERY: false,
    EXPAND_PROMOTION: false,
  }
}

// ---------------------------------------------------------------------------
// Script loader helper (Single Responsibility)
// ---------------------------------------------------------------------------

/**
 * Dynamically appends a <script> tag to <head> if it hasn't been loaded yet.
 * Returns the script element, or null if the guard check prevented loading.
 */
export function loadScriptOnce(src: string, guard: () => boolean): HTMLScriptElement | null {
  if (typeof window === 'undefined' || guard()) return null
  const script = document.createElement('script')
  script.src = src
  script.async = true
  document.head.appendChild(script)
  return script
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const QuestContext = createContext<QuestContextType | undefined>(undefined)

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLevel = localStorage.getItem('quest_level')
        if (savedLevel) return parseInt(savedLevel, 10)
      } catch (e) {
        // ignore
      }
    }
    return 1
  })

  const [xp, setXp] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedXp = localStorage.getItem('quest_xp')
        if (savedXp) return parseInt(savedXp, 10)
      } catch (e) {
        // ignore
      }
    }
    return 0
  })

  const [unlockedAchievements, setUnlockedAchievements] = useState<
    Record<AchievementKey, boolean>
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUnlocked = localStorage.getItem('quest_unlocked')
        if (savedUnlocked) {
          return JSON.parse(savedUnlocked) as Record<AchievementKey, boolean>
        }
      } catch (e) {
        // ignore
      }
    }
    return buildInitialUnlocked()
  })

  const [toasts, setToasts] = useState<QuestToast[]>([])

  // Ref used for synchronous "already unlocked?" check, preventing double
  // toasts in React StrictMode.
  const unlockedRef = useRef<Record<AchievementKey, boolean>>(unlockedAchievements)

  // Load canvas-confetti once for level-up celebrations.
  useEffect(() => {
    loadScriptOnce(
      'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
      () => Boolean(window.confetti),
    )
  }, [])

  // Persist state to localStorage whenever it changes.
  const persistState = (
    newLvl: number,
    newXp: number,
    newUnlocked: Record<AchievementKey, boolean>,
  ) => {
    try {
      localStorage.setItem('quest_level', newLvl.toString())
      localStorage.setItem('quest_xp', newXp.toString())
      localStorage.setItem('quest_unlocked', JSON.stringify(newUnlocked))
    } catch (e) {
      console.warn('[Quest] Failed to persist quest status to localStorage:', e)
    }
  }

  const addToast = (
    title: string,
    description: string,
    type: 'achievement' | 'levelup',
    rewardXp?: number,
  ) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, xp: rewardXp, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const unlockAchievement = (key: AchievementKey) => {
    // Synchronous ref check prevents duplicate unlocks in the same tick.
    if (unlockedRef.current[key]) return
    unlockedRef.current[key] = true

    const achievement = ACHIEVEMENTS[key]
    const updatedUnlocked = { ...unlockedRef.current }

    // Delegate XP/level maths to the pure helper.
    const { newXp, newLevel, leveledUp } = calculateLevelAndXp(xp, level, achievement.xp)

    setLevel(newLevel)
    setXp(newXp)
    setUnlockedAchievements(updatedUnlocked)
    persistState(newLevel, newXp, updatedUnlocked)

    addToast(
      `Achievement Unlocked: ${achievement.title}`,
      achievement.description,
      'achievement',
      achievement.xp,
    )

    if (leveledUp) {
      // Fire subtle corner confetti burst on level-up.
      if (typeof window !== 'undefined' && window.confetti) {
        try {
          window.confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 1 } })
          window.confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 1 } })
        } catch (e) {
          console.warn('[Quest] Confetti burst failed:', e)
        }
      }

      setTimeout(() => {
        addToast(
          `Level Up! 🌟 Level ${newLevel}`,
          `You unlocked the Class: ${LEVEL_CLASS_NAMES[newLevel - 1]}`,
          'levelup',
        )
      }, 800) // Slight offset for visual separation
    }
  }

  const resetQuests = () => {
    const initial = buildInitialUnlocked()
    unlockedRef.current = initial
    setLevel(1)
    setXp(0)
    setUnlockedAchievements(initial)
    setToasts([])
    localStorage.removeItem('quest_level')
    localStorage.removeItem('quest_xp')
    localStorage.removeItem('quest_unlocked')
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

export function useQuest(): QuestContextType {
  const context = useContext(QuestContext)
  if (!context) {
    throw new Error('useQuest must be used inside a QuestProvider')
  }
  return context
}
