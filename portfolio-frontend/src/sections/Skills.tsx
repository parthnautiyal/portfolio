import * as SimpleIcons from 'react-icons/si'
import { getSkills } from '../utils/contentLoader'

export default function Skills() {
  const skillCategories = getSkills()
  return (
    <section id="skills" className="py-16">
      <h2 className="section-heading animate-fade-up">Skills</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {skillCategories.map((category) => (
          <div key={category.name} className="card-elevated p-4">
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {category.name}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {category.items.map((skill) => {
                const IconComponent = SimpleIcons[skill.icon as keyof typeof SimpleIcons]
                return (
                  <a
                    key={skill.name}
                    href={skill.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--color-text)] transition-all hover:scale-105 hover:border-[var(--border-color-hover)] hover:shadow-md"
                    style={{
                      borderColor: `${skill.color}40`, // Add opacity to custom skill colored borders for glass accent
                    }}
                  >
                    {IconComponent && (
                      <IconComponent
                        className="transition-colors"
                        style={{ color: skill.color }}
                        size={16}
                      />
                    )}
                    <span className="font-medium">{skill.name}</span>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

