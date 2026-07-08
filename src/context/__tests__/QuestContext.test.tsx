/**
 * QuestContext.test.tsx
 *
 * Unit tests for QuestContext covering:
 *  - calculateLevelAndXp pure function
 *  - buildInitialUnlocked pure factory
 *  - loadScriptOnce helper
 *  - QuestProvider + useQuest integration:
 *      - achievement unlocking
 *      - XP accumulation
 *      - level-up threshold
 *      - toast queue management
 *      - quest reset
 *      - localStorage persistence
 *  - useQuest throws outside provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import {
  calculateLevelAndXp,
  buildInitialUnlocked,
  loadScriptOnce,
  QuestProvider,
  useQuest,
  ACHIEVEMENTS,
  XP_PER_LEVEL,
  MAX_LEVEL,
  LEVEL_CLASS_NAMES,
} from '../QuestContext.tsx'

// ---------------------------------------------------------------------------
// calculateLevelAndXp — pure function tests
// ---------------------------------------------------------------------------

describe('calculateLevelAndXp', () => {
  it('adds XP without levelling up when under threshold', () => {
    const { newXp, newLevel, leveledUp } = calculateLevelAndXp(100, 1, 200)
    expect(newXp).toBe(300)
    expect(newLevel).toBe(1)
    expect(leveledUp).toBe(false)
  })

  it('levels up and carries over remaining XP when threshold is hit exactly', () => {
    const { newXp, newLevel, leveledUp } = calculateLevelAndXp(0, 1, XP_PER_LEVEL)
    expect(newXp).toBe(0)
    expect(newLevel).toBe(2)
    expect(leveledUp).toBe(true)
  })

  it('levels up and carries over remaining XP when threshold is exceeded', () => {
    const { newXp, newLevel, leveledUp } = calculateLevelAndXp(400, 1, 200)
    // 400+200 = 600 >= 500 → level up, remainder = 100
    expect(newXp).toBe(100)
    expect(newLevel).toBe(2)
    expect(leveledUp).toBe(true)
  })

  it('does NOT level up beyond MAX_LEVEL', () => {
    const { newXp, newLevel, leveledUp } = calculateLevelAndXp(400, MAX_LEVEL, 200)
    expect(newLevel).toBe(MAX_LEVEL)
    expect(leveledUp).toBe(false)
    // XP still accumulates above threshold when at max level
    expect(newXp).toBe(600)
  })

  it('handles zero reward XP', () => {
    const { newXp, newLevel, leveledUp } = calculateLevelAndXp(250, 2, 0)
    expect(newXp).toBe(250)
    expect(newLevel).toBe(2)
    expect(leveledUp).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// buildInitialUnlocked — pure factory test
// ---------------------------------------------------------------------------

describe('buildInitialUnlocked', () => {
  it('returns an object with all achievement keys set to false', () => {
    const initial = buildInitialUnlocked()
    const keys = Object.keys(initial) as Array<keyof typeof initial>
    expect(keys.length).toBeGreaterThan(0)
    keys.forEach((key) => {
      expect(initial[key]).toBe(false)
    })
  })

  it('returns a fresh object each call (no shared reference)', () => {
    const a = buildInitialUnlocked()
    const b = buildInitialUnlocked()
    a.LAND_ON_PORTFOLIO = true
    expect(b.LAND_ON_PORTFOLIO).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// loadScriptOnce
// ---------------------------------------------------------------------------

describe('loadScriptOnce', () => {
  afterEach(() => {
    // Clean up any appended scripts
    document.head.querySelectorAll('script[data-test]').forEach((el) => el.remove())
  })

  it('appends a script element to document.head when guard returns false', () => {
    const before = document.head.querySelectorAll('script').length
    const script = loadScriptOnce('https://example.com/lib.js', () => false)
    expect(script).not.toBeNull()
    expect(document.head.querySelectorAll('script').length).toBe(before + 1)
  })

  it('does NOT append a script when guard returns true', () => {
    const before = document.head.querySelectorAll('script').length
    const script = loadScriptOnce('https://example.com/lib.js', () => true)
    expect(script).toBeNull()
    expect(document.head.querySelectorAll('script').length).toBe(before)
  })
})

// ---------------------------------------------------------------------------
// QuestProvider + useQuest integration tests
// ---------------------------------------------------------------------------

/** Helper: wraps the hook inside QuestProvider. */
function renderQuestHook() {
  return renderHook(() => useQuest(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QuestProvider>{children}</QuestProvider>
    ),
  })
}

describe('useQuest — initial state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts at level 1 with 0 XP and all achievements locked', () => {
    const { result } = renderQuestHook()
    expect(result.current.level).toBe(1)
    expect(result.current.xp).toBe(0)
    const keys = Object.keys(result.current.unlockedAchievements)
    keys.forEach((k) => {
      expect(result.current.unlockedAchievements[k as keyof typeof result.current.unlockedAchievements]).toBe(false)
    })
  })

  it('starts with an empty toast queue', () => {
    const { result } = renderQuestHook()
    expect(result.current.toasts).toHaveLength(0)
  })
})

describe('useQuest — unlockAchievement', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('marks the achievement as unlocked', () => {
    const { result } = renderQuestHook()

    act(() => {
      result.current.unlockAchievement('LAND_ON_PORTFOLIO')
    })

    expect(result.current.unlockedAchievements.LAND_ON_PORTFOLIO).toBe(true)
  })

  it('adds the correct XP for the achievement', () => {
    const { result } = renderQuestHook()
    const expectedXp = ACHIEVEMENTS.LAND_ON_PORTFOLIO.xp

    act(() => {
      result.current.unlockAchievement('LAND_ON_PORTFOLIO')
    })

    expect(result.current.xp).toBe(expectedXp)
  })

  it('does not add XP when the same achievement is unlocked twice', () => {
    const { result } = renderQuestHook()
    const expectedXp = ACHIEVEMENTS.LAND_ON_PORTFOLIO.xp

    act(() => {
      result.current.unlockAchievement('LAND_ON_PORTFOLIO')
      result.current.unlockAchievement('LAND_ON_PORTFOLIO')
    })

    expect(result.current.xp).toBe(expectedXp) // not doubled
  })

  it('adds a toast notification on unlock', () => {
    const { result } = renderQuestHook()

    act(() => {
      result.current.unlockAchievement('VIEW_RESUME')
    })

    expect(result.current.toasts.length).toBeGreaterThan(0)
    const toast = result.current.toasts[0]
    expect(toast.type).toBe('achievement')
    expect(toast.title).toContain(ACHIEVEMENTS.VIEW_RESUME.title)
  })

  it('auto-removes the toast after 4 seconds', () => {
    const { result } = renderQuestHook()

    act(() => {
      result.current.unlockAchievement('VIEW_RESUME')
    })

    expect(result.current.toasts.length).toBeGreaterThan(0)

    act(() => {
      vi.advanceTimersByTime(4100)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('levels up when accumulated XP reaches XP_PER_LEVEL', () => {
    const { result } = renderQuestHook()

    // Each unlock must be in its own act() so React re-renders between calls
    // and the next unlock reads the freshly updated xp/level from state.
    // LAND_ON_PORTFOLIO=100, VIEW_RESUME=150 → 250
    // FULLSCREEN_PDF=150 → 400
    // EXPAND_PROMOTION=150 → 550 >= 500 → level up, remainder = 50
    act(() => { result.current.unlockAchievement('LAND_ON_PORTFOLIO') })
    act(() => { result.current.unlockAchievement('VIEW_RESUME') })
    act(() => { result.current.unlockAchievement('FULLSCREEN_PDF') })
    act(() => { result.current.unlockAchievement('EXPAND_PROMOTION') })

    expect(result.current.level).toBe(2)
    expect(result.current.xp).toBe(50) // 550 - 500
  })

  it('persists state to localStorage on achievement unlock', () => {
    const { result } = renderQuestHook()

    act(() => {
      result.current.unlockAchievement('CHAT_QUERY')
    })

    expect(localStorage.getItem('quest_xp')).toBe(String(ACHIEVEMENTS.CHAT_QUERY.xp))
    expect(localStorage.getItem('quest_level')).toBe('1')
    const unlocked = JSON.parse(localStorage.getItem('quest_unlocked') ?? '{}')
    expect(unlocked.CHAT_QUERY).toBe(true)
  })
})

describe('useQuest — removeToast', () => {
  it('removes the toast with the matching id', () => {
    const { result } = renderQuestHook()
    vi.useFakeTimers()

    act(() => {
      result.current.unlockAchievement('TRIGGER_CHAOS')
    })

    const toastId = result.current.toasts[0]?.id

    act(() => {
      result.current.removeToast(toastId)
    })

    expect(result.current.toasts.find((t) => t.id === toastId)).toBeUndefined()
    vi.useRealTimers()
  })
})

describe('useQuest — resetQuests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => { vi.useRealTimers() })

  it('resets XP, level, achievements, and toasts to initial values', () => {
    const { result } = renderQuestHook()

    act(() => {
      result.current.unlockAchievement('LAND_ON_PORTFOLIO')
    })
    act(() => {
      result.current.resetQuests()
    })

    expect(result.current.level).toBe(1)
    expect(result.current.xp).toBe(0)
    expect(result.current.toasts).toHaveLength(0)
    const keys = Object.keys(result.current.unlockedAchievements)
    keys.forEach((k) => {
      expect(result.current.unlockedAchievements[k as keyof typeof result.current.unlockedAchievements]).toBe(false)
    })
  })

  it('clears localStorage on reset', () => {
    const { result } = renderQuestHook()

    act(() => {
      result.current.unlockAchievement('LAND_ON_PORTFOLIO')
    })
    act(() => {
      result.current.resetQuests()
    })

    expect(localStorage.getItem('quest_level')).toBeNull()
    expect(localStorage.getItem('quest_xp')).toBeNull()
    expect(localStorage.getItem('quest_unlocked')).toBeNull()
  })
})

describe('useQuest — LEVEL_CLASS_NAMES coverage', () => {
  it('has a class name for every level up to MAX_LEVEL', () => {
    expect(LEVEL_CLASS_NAMES.length).toBeGreaterThanOrEqual(MAX_LEVEL)
  })
})

describe('useQuest — error when used outside provider', () => {
  it('throws an informative error', () => {
    expect(() => {
      renderHook(() => useQuest())
    }).toThrow('useQuest must be used inside a QuestProvider')
  })
})
