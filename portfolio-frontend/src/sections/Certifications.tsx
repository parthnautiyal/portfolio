import { certifications } from '../content/certifications'
import { HiOutlineBadgeCheck } from 'react-icons/hi'

export default function Certifications() {
  return (
    <section id="certifications" className="py-16">
      <h2 className="section-heading animate-fade-up">Certifications</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {certifications.map((cert) => (
          <li
            key={cert.name}
            className="card-elevated flex items-center justify-between gap-3 px-4 py-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <HiOutlineBadgeCheck className="text-green-500 dark:text-green-400" size={18} />
              <span className="font-medium text-slate-900 dark:text-slate-50">{cert.name}</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400">{cert.issuer}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

