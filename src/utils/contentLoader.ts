/**
 * contentLoader.ts
 *
 * Provides typed accessors for portfolio content (personal info, experience,
 * education, skills) with optional localStorage overrides sourced from the
 * Resume Manager.
 *
 * SOLID Principles applied:
 *  - Single Responsibility: each exported pure function has one clear job.
 *  - Open-Closed: skill category rules are data-driven; add new categories
 *    without modifying the categorisation logic itself.
 *  - Dependency Inversion: localStorage access is abstracted behind a
 *    StorageAdapter interface so it can be swapped in tests.
 */

import { personal as defaultPersonal } from '../content/personal.ts'
import { experience as defaultExperience } from '../content/experience.ts'
import type { ExperienceItem } from '../content/experience.ts'
import { education as defaultEducation } from '../content/education.ts'
import { skillCategories as defaultSkillCategories } from '../content/skills.ts'
import type { SkillCategory, SkillItem } from '../content/skills.ts'

// ---------------------------------------------------------------------------
// Storage versioning
// ---------------------------------------------------------------------------

/** Bump whenever experience.ts, education.ts, or skills.ts schema changes. */
export const DATA_VERSION = 'v20260623-sde2'

export const STORAGE_KEY = 'portfolio_resume_data'
export const VERSION_KEY = 'portfolio_resume_data_version'

/**
 * StorageAdapter interface – thin wrapper around localStorage so tests can
 * inject an in-memory implementation (Dependency Inversion).
 */
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** Default implementation backed by the browser's localStorage. */
export const localStorageAdapter: StorageAdapter = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
}

// ---------------------------------------------------------------------------
// Version eviction (Single Responsibility: only manages cache freshness)
// ---------------------------------------------------------------------------

/**
 * Removes stale resume override data when the data schema version changes.
 * Called once when this module first loads in production.
 */
export function evictIfStale(storage: StorageAdapter = localStorageAdapter): void {
  const storedVersion = storage.getItem(VERSION_KEY)
  if (storedVersion !== DATA_VERSION) {
    storage.removeItem(STORAGE_KEY)
    storage.setItem(VERSION_KEY, DATA_VERSION)
    console.info(
      '[contentLoader] Resume data version changed — cleared stale localStorage override.',
    )
  }
}

// Run eviction check when this module first loads in the browser.
evictIfStale()

// ---------------------------------------------------------------------------
// Pure helper – parse stored JSON safely
// ---------------------------------------------------------------------------

function parseStoredData(storage: StorageAdapter): Record<string, unknown> | null {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Pure helper – SDE II detection (Single Responsibility)
// ---------------------------------------------------------------------------

const SDE2_PATTERNS = ['sde ii', 'sde-2', 'software development engineer ii']

/** Returns true if any experience item matches the SDE-II role patterns. */
export function hasSDE2Role(items: Array<{ role: string }>): boolean {
  return items.some((item) =>
    SDE2_PATTERNS.some((pattern) => item.role.toLowerCase().includes(pattern)),
  )
}

// ---------------------------------------------------------------------------
// Pure helper – education formatter (Single Responsibility)
// ---------------------------------------------------------------------------

export type FormattedEducation = {
  institution: string
  location: string
  degree: string
  cgpa: string
  period: string
  coursework: string[]
}

/**
 * Transforms a raw EducationItem (from content/education.ts shape) into the
 * display-ready FormattedEducation structure.
 */
export function formatEducation(edu: {
  school: string
  degree: string
  field?: string
  location: string
  period: string
  details?: string[]
}): FormattedEducation {
  const cgpaDetail =
    edu.details?.find(
      (d) => d.toLowerCase().includes('cgpa') || d.toLowerCase().includes('gpa'),
    ) ?? ''
  const cgpa = cgpaDetail.replace(/[^0-9.]/g, '')

  return {
    institution: edu.school,
    location: edu.location,
    degree: edu.field ? `${edu.degree} in ${edu.field}` : edu.degree,
    cgpa,
    period: edu.period,
    coursework:
      edu.details?.filter(
        (d) => !d.toLowerCase().includes('gpa') && !d.toLowerCase().includes('cgpa'),
      ) ?? [],
  }
}

// ---------------------------------------------------------------------------
// Pure helper – skill categorisation (Open-Closed)
// ---------------------------------------------------------------------------

/** Data-driven category membership rules. Adding new categories means adding
 *  a new entry here — no logic changes required (Open-Closed Principle). */
const SKILL_CATEGORY_RULES: Array<{
  name: string
  condition: (skillName: string, category: string) => boolean
}> = [
  {
    name: 'Databases',
    condition: (name) =>
      ['mysql', 'mongodb', 'postgresql', 'redis', 'sql', 'nosql'].includes(name),
  },
  {
    name: 'Integration & Messaging',
    condition: (name) =>
      ['kafka', 'temporal', 'rest api', 'openapi', 'grpc', 'graphql', 'rabbitmq', 'rest'].includes(
        name,
      ),
  },
  {
    name: 'Monitoring & Observability',
    condition: (name, cat) =>
      cat === 'devops' &&
      ['grafana', 'prometheus', 'datadog', 'elk', 'splunk', 'cloudwatch'].includes(name),
  },
  {
    name: 'Cloud & DevOps',
    condition: (_name, cat) => cat === 'devops',
  },
  {
    name: 'Programming & Frameworks',
    condition: (_name, cat) => cat === 'frontend' || cat === 'backend',
  },
]

/** Assigns a parsed skill to the correct category name using rule table. */
export function resolveSkillCategory(
  skillName: string,
  rawCategory: string,
): string {
  const lower = skillName.toLowerCase()
  for (const rule of SKILL_CATEGORY_RULES) {
    if (rule.condition(lower, rawCategory)) return rule.name
  }
  return 'Tools'
}

// ---------------------------------------------------------------------------
// Public accessors
// ---------------------------------------------------------------------------

export function getPersonal(storage: StorageAdapter = localStorageAdapter) {
  const data = parseStoredData(storage)
  if (data?.personal && typeof data.personal === 'object') {
    return { ...defaultPersonal, ...(data.personal as object) }
  }
  return defaultPersonal
}

export function getExperience(storage: StorageAdapter = localStorageAdapter): ExperienceItem[] {
  const data = parseStoredData(storage)
  if (Array.isArray(data?.experience) && (data.experience as ExperienceItem[]).length > 0) {
    const stored = data.experience as ExperienceItem[]
    // Guard: if default data has an SDE-II entry but the stored override lost it,
    // fall back to default to prevent displaying an incorrect seniority level.
    if (hasSDE2Role(defaultExperience) && !hasSDE2Role(stored)) {
      return defaultExperience
    }
    return stored
  }
  return defaultExperience
}

export function getEducation(storage: StorageAdapter = localStorageAdapter): FormattedEducation {
  const defaultEdu = formatEducation(defaultEducation[0])
  const data = parseStoredData(storage)

  if (Array.isArray(data?.education) && (data.education as unknown[]).length > 0) {
    try {
      return formatEducation((data.education as Parameters<typeof formatEducation>[0][])[0])
    } catch (e) {
      console.error('[contentLoader] Failed to format stored education override:', e)
    }
  }
  return defaultEdu
}

export function getSkills(storage: StorageAdapter = localStorageAdapter): SkillCategory[] {
  const data = parseStoredData(storage)

  if (!Array.isArray(data?.skills) || (data.skills as unknown[]).length === 0) {
    return defaultSkillCategories
  }

  // Build a lookup map from the default skill set for icon/url/color metadata.
  const defaultSkillsFlat: Record<string, Pick<SkillItem, 'icon' | 'url' | 'color'>> = {}
  defaultSkillCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      defaultSkillsFlat[item.name.toLowerCase()] = {
        icon: item.icon,
        url: item.url,
        color: item.color,
      }
    })
  })

  // Accumulate items per category name.
  const buckets: Record<string, SkillItem[]> = {}

  ;(data.skills as Array<{ name: string; category: string }>).forEach((skill) => {
    const lowerName = skill.name.toLowerCase()
    const matched = defaultSkillsFlat[lowerName]

    const item: SkillItem = {
      name: skill.name,
      icon: matched?.icon ?? 'SiSimpleicons',
      url: matched?.url ?? `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`,
      color: matched?.color ?? '#94a3b8',
    }

    const categoryName = resolveSkillCategory(skill.name, skill.category)
    if (!buckets[categoryName]) buckets[categoryName] = []
    buckets[categoryName].push(item)
  })

  return Object.entries(buckets)
    .map(([name, items]) => ({ name, items }))
    .filter((cat) => cat.items.length > 0)
}
