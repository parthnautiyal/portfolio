import { personal as defaultPersonal } from '../content/personal.ts'
import { experience as defaultExperience } from '../content/experience.ts'
import { education as defaultEducation } from '../content/education.ts'
import { skillCategories as defaultSkillCategories } from '../content/skills.ts'

// Bump this whenever you update experience.ts, education.ts, or skills.ts 
// so that stale localStorage resume data is automatically evicted.
const DATA_VERSION = 'v20260623-sde2'

const STORAGE_KEY = 'portfolio_resume_data'
const VERSION_KEY = 'portfolio_resume_data_version'

/** Call this early to evict stale cached resume data if data version changed. */
function evictIfStale() {
  const storedVersion = localStorage.getItem(VERSION_KEY)
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(VERSION_KEY, DATA_VERSION)
    console.info('[contentLoader] Resume data version changed — cleared stale localStorage override.')
  }
}

// Run eviction check when this module first loads
evictIfStale()

export const getPersonal = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.personal) {
        return { ...defaultPersonal, ...parsed.personal }
      }
    } catch (e) {
      console.error('Failed to load personal override:', e)
    }
  }
  return defaultPersonal
}

export const getExperience = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.experience && parsed.experience.length > 0) {
        const defaultHasSDE2 = defaultExperience.some(item => 
          item.role.toLowerCase().includes('sde ii') || 
          item.role.toLowerCase().includes('sde-2') || 
          item.role.toLowerCase().includes('software development engineer ii')
        )
        const storedHasSDE2 = parsed.experience.some((item: any) => 
          item.role.toLowerCase().includes('sde ii') || 
          item.role.toLowerCase().includes('sde-2') || 
          item.role.toLowerCase().includes('software development engineer ii')
        )
        if (defaultHasSDE2 && !storedHasSDE2) {
          return defaultExperience
        }
        return parsed.experience
      }
    } catch (e) {
      console.error('Failed to load experience override:', e)
    }
  }
  return defaultExperience
}

export const getEducation = () => {
  const edu = defaultEducation[0]
  const defaultEdu = {
    institution: edu.school,
    location: edu.location,
    degree: edu.field ? `${edu.degree} in ${edu.field}` : edu.degree,
    cgpa: edu.details?.find(d => d.toLowerCase().includes('cgpa') || d.toLowerCase().includes('gpa'))?.replace(/[^0-9.]/g, '') || '',
    period: edu.period,
    coursework: edu.details?.filter(d => !d.toLowerCase().includes('gpa') && !d.toLowerCase().includes('cgpa')) || []
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.education && parsed.education.length > 0) {
        const e = parsed.education[0]
        const cgpaDetail = e.details?.find((d: string) => d.toLowerCase().includes('gpa') || d.toLowerCase().includes('cgpa')) || ''
        const cgpa = cgpaDetail.replace(/[^0-9.]/g, '') || defaultEdu.cgpa
        return {
          institution: e.school,
          location: e.location,
          degree: e.field ? `${e.degree} in ${e.field}` : e.degree,
          cgpa,
          period: e.period,
          coursework: e.details?.filter((d: string) => !d.toLowerCase().includes('gpa') && !d.toLowerCase().includes('cgpa')) || defaultEdu.coursework
        }
      }
    } catch (e) {
      console.error('Failed to load education override:', e)
    }
  }
  return defaultEdu
}

export const getSkills = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.skills && parsed.skills.length > 0) {
        const defaultSkillsFlat: Record<string, { icon: string; url: string; color: string }> = {}
        defaultSkillCategories.forEach(cat => {
          cat.items.forEach(item => {
            defaultSkillsFlat[item.name.toLowerCase()] = {
              icon: item.icon,
              url: item.url,
              color: item.color
            }
          })
        })
        
        const categories: Record<string, any[]> = {
          'Programming & Frameworks': [],
          'Databases': [],
          'Cloud & DevOps': [],
          'Integration & Messaging': [],
          'Monitoring & Observability': [],
          'Tools': []
        }
        
        parsed.skills.forEach((skill: any) => {
          const lowerName = skill.name.toLowerCase()
          const matched = defaultSkillsFlat[lowerName]
          
          const item = {
            name: skill.name,
            icon: matched?.icon || 'SiSimpleicons',
            url: matched?.url || `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`,
            color: matched?.color || '#94a3b8'
          }
          
          if (skill.category === 'frontend' || skill.category === 'backend') {
            if (['mysql', 'mongodb', 'postgresql', 'redis', 'sql', 'nosql'].includes(lowerName)) {
              categories['Databases'].push(item)
            } else if (['kafka', 'temporal', 'rest api', 'openapi', 'grpc', 'graphql', 'rabbitmq'].includes(lowerName)) {
              categories['Integration & Messaging'].push(item)
            } else {
              categories['Programming & Frameworks'].push(item)
            }
          } else if (skill.category === 'devops') {
            if (['grafana', 'prometheus', 'datadog', 'elk', 'splunk', 'cloudwatch'].includes(lowerName)) {
              categories['Monitoring & Observability'].push(item)
            } else {
              categories['Cloud & DevOps'].push(item)
            }
          } else {
            categories['Tools'].push(item)
          }
        })
        
        return Object.keys(categories)
          .map(name => ({
            name,
            items: categories[name]
          }))
          .filter(cat => cat.items.length > 0)
      }
    } catch (e) {
      console.error('Failed to load skills override:', e)
    }
  }
  return defaultSkillCategories
}
