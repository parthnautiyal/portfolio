import * as SimpleIcons from 'react-icons/si'
import { skillCategories } from '../content/skills'

export default function Skills() {
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
                    className="group flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-all hover:scale-105 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                    style={{
                      borderColor: `${skill.color}20`,
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

