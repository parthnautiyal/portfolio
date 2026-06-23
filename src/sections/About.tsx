import { getPersonal } from '../utils/contentLoader.ts'
import { TbRocket, TbShieldCheck, TbClockUp, TbActivity } from 'react-icons/tb'

const highlights = [
  { label: 'API latency reduction', value: '50%+', icon: TbRocket, color: 'text-blue-500' },
  { label: 'Rollback reduction', value: '70%', icon: TbShieldCheck, color: 'text-green-500' },
  { label: 'Uptime achieved', value: '99.9%', icon: TbActivity, color: 'text-purple-500' },
  { label: 'MTTR reduction', value: '40%', icon: TbClockUp, color: 'text-orange-500' },
]

export default function About() {
  const personal = getPersonal()
  return (
    <section id="about" className="py-16">
      <h2 className="section-heading animate-fade-up">About</h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 animate-fade-up">
        {personal.summary}{' '}
        I enjoy designing reliable systems, simplifying complex workflows, and
        collaborating with product and platform teams to ship features safely.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {highlights.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="card-elevated px-3 py-4 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <Icon className={`${item.color} dark:opacity-80`} size={20} />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

