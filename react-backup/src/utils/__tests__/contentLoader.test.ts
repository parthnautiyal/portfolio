/**
 * contentLoader.test.ts
 *
 * Unit tests for the contentLoader utility.
 * Uses an in-memory StorageAdapter to avoid touching the real localStorage.
 *
 * Coverage:
 *  - evictIfStale: version-based cache invalidation
 *  - hasSDE2Role: pure role detection
 *  - formatEducation: pure education transformation
 *  - resolveSkillCategory: data-driven category assignment
 *  - getPersonal / getExperience / getEducation / getSkills: public accessors
 *    with and without storage overrides
 */

import { describe, it, expect } from 'vitest'
import {
  evictIfStale,
  hasSDE2Role,
  formatEducation,
  resolveSkillCategory,
  getPersonal,
  getExperience,
  getEducation,
  getSkills,
  DATA_VERSION,
  STORAGE_KEY,
  VERSION_KEY,
} from '../contentLoader'
import type { StorageAdapter } from '../contentLoader'
import { personal as defaultPersonal } from '../../content/personal'
import { experience as defaultExperience } from '../../content/experience'

// ---------------------------------------------------------------------------
// In-memory storage adapter for tests (Dependency Inversion)
// ---------------------------------------------------------------------------

function makeStorage(initial: Record<string, string> = {}): StorageAdapter {
  const store: Record<string, string> = { ...initial }
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value },
    removeItem: (key) => { delete store[key] },
  }
}

// ---------------------------------------------------------------------------
// evictIfStale
// ---------------------------------------------------------------------------

describe('evictIfStale', () => {
  it('removes STORAGE_KEY and writes current DATA_VERSION when version is absent', () => {
    const storage = makeStorage({
      [STORAGE_KEY]: '{"personal":{}}',
    })
    evictIfStale(storage)
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
    expect(storage.getItem(VERSION_KEY)).toBe(DATA_VERSION)
  })

  it('removes stale data when stored version differs from DATA_VERSION', () => {
    const storage = makeStorage({
      [VERSION_KEY]: 'v-old',
      [STORAGE_KEY]: '{"personal":{}}',
    })
    evictIfStale(storage)
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
    expect(storage.getItem(VERSION_KEY)).toBe(DATA_VERSION)
  })

  it('leaves data intact when version already matches DATA_VERSION', () => {
    const payload = '{"personal":{"name":"Test"}}'
    const storage = makeStorage({
      [VERSION_KEY]: DATA_VERSION,
      [STORAGE_KEY]: payload,
    })
    evictIfStale(storage)
    expect(storage.getItem(STORAGE_KEY)).toBe(payload)
  })
})

// ---------------------------------------------------------------------------
// hasSDE2Role
// ---------------------------------------------------------------------------

describe('hasSDE2Role', () => {
  it('returns true when role includes "sde ii" (case-insensitive)', () => {
    expect(hasSDE2Role([{ role: 'Software Development Engineer II' }])).toBe(true)
  })

  it('returns true when role includes "sde-2"', () => {
    expect(hasSDE2Role([{ role: 'SDE-2 Backend' }])).toBe(true)
  })

  it('returns true when role includes "sde ii" in a mixed list', () => {
    const items = [{ role: 'Software Development Engineer I' }, { role: 'SDE II' }]
    expect(hasSDE2Role(items)).toBe(true)
  })

  it('returns false when no item matches any SDE-2 pattern', () => {
    expect(hasSDE2Role([{ role: 'Software Development Engineer I' }])).toBe(false)
  })

  it('returns false for an empty array', () => {
    expect(hasSDE2Role([])).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// formatEducation
// ---------------------------------------------------------------------------

describe('formatEducation', () => {
  const base = {
    school: 'Lovely Professional University',
    degree: 'Bachelor of Technology',
    field: 'Computer Science',
    location: 'Jalandhar, India',
    period: 'Jul 2020 – Jun 2024',
    details: [
      'CGPA: 8.9',
      'Data Structures & Algorithms',
      'Operating Systems',
    ],
  }

  it('combines degree and field correctly', () => {
    const result = formatEducation(base)
    expect(result.degree).toBe('Bachelor of Technology in Computer Science')
  })

  it('extracts CGPA numeric value from details', () => {
    const result = formatEducation(base)
    expect(result.cgpa).toBe('8.9')
  })

  it('excludes CGPA line from coursework array', () => {
    const result = formatEducation(base)
    expect(result.coursework).not.toContain('CGPA: 8.9')
    expect(result.coursework).toEqual(['Data Structures & Algorithms', 'Operating Systems'])
  })

  it('handles missing field gracefully (no "in X" suffix)', () => {
    const result = formatEducation({ ...base, field: '' })
    expect(result.degree).toBe('Bachelor of Technology')
  })

  it('returns empty cgpa and coursework when details is undefined', () => {
    const result = formatEducation({ ...base, details: undefined })
    expect(result.cgpa).toBe('')
    expect(result.coursework).toEqual([])
  })

  it('maps institution and location correctly', () => {
    const result = formatEducation(base)
    expect(result.institution).toBe('Lovely Professional University')
    expect(result.location).toBe('Jalandhar, India')
  })
})

// ---------------------------------------------------------------------------
// resolveSkillCategory
// ---------------------------------------------------------------------------

describe('resolveSkillCategory', () => {
  it('assigns MySQL to Databases', () => {
    expect(resolveSkillCategory('MySQL', 'backend')).toBe('Databases')
  })

  it('assigns Kafka to Integration & Messaging (case-insensitive via caller normalization)', () => {
    expect(resolveSkillCategory('kafka', 'backend')).toBe('Integration & Messaging')
  })

  it('assigns REST to Integration & Messaging', () => {
    expect(resolveSkillCategory('rest', 'backend')).toBe('Integration & Messaging')
  })

  it('assigns Grafana (devops) to Monitoring & Observability', () => {
    expect(resolveSkillCategory('grafana', 'devops')).toBe('Monitoring & Observability')
  })

  it('assigns Docker (devops) to Cloud & DevOps', () => {
    expect(resolveSkillCategory('docker', 'devops')).toBe('Cloud & DevOps')
  })

  it('assigns Java (backend) to Programming & Frameworks', () => {
    expect(resolveSkillCategory('java', 'backend')).toBe('Programming & Frameworks')
  })

  it('assigns unknown categories to Tools', () => {
    expect(resolveSkillCategory('unknown-tool', 'misc')).toBe('Tools')
  })
})

// ---------------------------------------------------------------------------
// getPersonal
// ---------------------------------------------------------------------------

describe('getPersonal', () => {
  it('returns default personal data when storage is empty', () => {
    const storage = makeStorage()
    expect(getPersonal(storage)).toEqual(defaultPersonal)
  })

  it('merges stored personal data over defaults', () => {
    const override = { name: 'Test User', email: 'test@example.com' }
    const storage = makeStorage({
      [STORAGE_KEY]: JSON.stringify({ personal: override }),
    })
    const result = getPersonal(storage)
    expect(result.name).toBe('Test User')
    expect(result.email).toBe('test@example.com')
    // Other keys should remain from defaults
    expect(result.github).toBe(defaultPersonal.github)
  })

  it('falls back to defaults on malformed JSON', () => {
    const storage = makeStorage({ [STORAGE_KEY]: '{invalid json}' })
    expect(getPersonal(storage)).toEqual(defaultPersonal)
  })
})

// ---------------------------------------------------------------------------
// getExperience
// ---------------------------------------------------------------------------

describe('getExperience', () => {
  it('returns default experience when storage is empty', () => {
    const storage = makeStorage()
    expect(getExperience(storage)).toEqual(defaultExperience)
  })

  it('returns stored experience when it contains an SDE-II role', () => {
    const stored = [
      { role: 'Software Development Engineer II', company: 'Test Co', location: 'Remote', period: '2024', bullets: [] }
    ]
    const storage = makeStorage({
      [STORAGE_KEY]: JSON.stringify({ experience: stored }),
    })
    expect(getExperience(storage)).toEqual(stored)
  })

  it('falls back to defaults if stored experience loses the SDE-II role that defaults have', () => {
    // Default has SDE-II; stored does not → fallback to default
    const stored = [
      { role: 'Junior Developer', company: 'Old Co', location: 'Remote', period: '2022', bullets: [] }
    ]
    const storage = makeStorage({
      [STORAGE_KEY]: JSON.stringify({ experience: stored }),
    })
    expect(getExperience(storage)).toEqual(defaultExperience)
  })

  it('returns defaults on malformed JSON', () => {
    const storage = makeStorage({ [STORAGE_KEY]: 'bad json' })
    expect(getExperience(storage)).toEqual(defaultExperience)
  })
})

// ---------------------------------------------------------------------------
// getEducation
// ---------------------------------------------------------------------------

describe('getEducation', () => {
  it('returns formatted default education when storage is empty', () => {
    const storage = makeStorage()
    const result = getEducation(storage)
    expect(result.institution).toBe('Lovely Professional University')
    expect(result.cgpa).toBe('8.9')
  })

  it('returns stored education override when present', () => {
    const override = [{
      school: 'MIT',
      degree: 'Master of Science',
      field: 'AI',
      location: 'Cambridge, MA',
      period: '2025–2027',
      details: ['CGPA: 4.0', 'Machine Learning'],
    }]
    const storage = makeStorage({
      [STORAGE_KEY]: JSON.stringify({ education: override }),
    })
    const result = getEducation(storage)
    expect(result.institution).toBe('MIT')
    expect(result.degree).toBe('Master of Science in AI')
    expect(result.cgpa).toBe('4.0')
    expect(result.coursework).toContain('Machine Learning')
  })
})

// ---------------------------------------------------------------------------
// getSkills
// ---------------------------------------------------------------------------

describe('getSkills', () => {
  it('returns default skill categories when storage is empty', () => {
    const storage = makeStorage()
    const result = getSkills(storage)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].name).toBeDefined()
    expect(result[0].items.length).toBeGreaterThan(0)
  })

  it('returns default categories on empty skills array in storage', () => {
    const storage = makeStorage({
      [STORAGE_KEY]: JSON.stringify({ skills: [] }),
    })
    const result = getSkills(storage)
    // Should fall back to defaults
    expect(result.length).toBeGreaterThan(0)
  })

  it('categorises parsed skills correctly using resolveSkillCategory', () => {
    const skillsOverride = [
      { name: 'MySQL', category: 'backend' },
      { name: 'Docker', category: 'devops' },
      { name: 'Java', category: 'backend' },
    ]
    const storage = makeStorage({
      [STORAGE_KEY]: JSON.stringify({ skills: skillsOverride }),
    })
    const result = getSkills(storage)

    const catNames = result.map((c) => c.name)
    expect(catNames).toContain('Databases')
    expect(catNames).toContain('Cloud & DevOps')
    expect(catNames).toContain('Programming & Frameworks')
  })

  it('uses fallback icon and color for skills not in defaults', () => {
    const skillsOverride = [{ name: 'UnknownLib', category: 'misc' }]
    const storage = makeStorage({
      [STORAGE_KEY]: JSON.stringify({ skills: skillsOverride }),
    })
    const result = getSkills(storage)
    const item = result.flatMap((c) => c.items).find((i) => i.name === 'UnknownLib')
    expect(item).toBeDefined()
    expect(item?.icon).toBe('SiSimpleicons')
    expect(item?.color).toBe('#94a3b8')
  })
})
