import { personal as defaultPersonal } from '../content/personal'
import { experience as defaultExperience } from '../content/experience'
import { education as defaultEducation } from '../content/education'
import { skillCategories as defaultSkillCategories } from '../content/skills'

export const getPersonal = () => {
  const stored = localStorage.getItem('portfolio_resume_data')
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
  const stored = localStorage.getItem('portfolio_resume_data')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.experience && parsed.experience.length > 0) {
        return parsed.experience
      }
    } catch (e) {
      console.error('Failed to load experience override:', e)
    }
  }
  return defaultExperience
}

export const getEducation = () => {
  const stored = localStorage.getItem('portfolio_resume_data')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.education && parsed.education.length > 0) {
        const edu = parsed.education[0]
        const cgpaDetail = edu.details?.find((d: string) => d.toLowerCase().includes('gpa') || d.toLowerCase().includes('cgpa')) || ''
        const cgpa = cgpaDetail.replace(/[^0-9.]/g, '') || defaultEducation.cgpa
        
        return {
          institution: edu.school,
          location: edu.location,
          degree: edu.field ? `${edu.degree} in ${edu.field}` : edu.degree,
          cgpa: cgpa,
          period: edu.period,
          coursework: edu.details?.filter((d: string) => !d.toLowerCase().includes('gpa') && !d.toLowerCase().includes('cgpa')) || defaultEducation.coursework
        }
      }
    } catch (e) {
      console.error('Failed to load education override:', e)
    }
  }
  return defaultEducation
}

export const getSkills = () => {
  const stored = localStorage.getItem('portfolio_resume_data')
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
