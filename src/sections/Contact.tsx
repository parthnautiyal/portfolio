import { useState } from 'react'
import { personal } from '../content/personal.ts'
import { HiMail, HiPhone } from 'react-icons/hi'
import { FiGithub, FiLinkedin } from 'react-icons/fi'

type FormState = {
  name: string
  email: string
  message: string
}

type FormErrors = {
  name?: string
  email?: string
  message?: string
}

const initialState: FormState = {
  name: '',
  email: '',
  message: '',
}

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')

    if (!validateForm()) return

    try {
      setSubmitting(true)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      setStatus('success')
      setForm(initialState)
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWhatsAppClick = () => {
    const decryptedPhone = atob('NzQ1Mzg4Njg4NQ==')
    const url = `https://wa.me/91${decryptedPhone}?text=Hi%20Parth,%20I%20saw%20your%20portfolio...`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const inputClass = (hasError: boolean) =>
    `w-full glass-panel rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 border-none text-[var(--color-text)] placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all ${
      hasError
        ? 'ring-1 ring-rose-500/50'
        : 'focus:ring-[var(--border-color-hover)]'
    }`

  return (
    <section id="contact" className="py-16">
      <h2 className="section-heading animate-fade-up">Contact</h2>
      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-300">
        Have a question or want to talk about backend systems, microservices, or
        developer tooling? Drop a message or reach out directly.
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-5 text-sm"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className={inputClass(!!errors.name)}
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-rose-500">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className={inputClass(!!errors.email)}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-rose-500">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="message"
              className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
            >
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
              placeholder="What's on your mind?"
              className={`${inputClass(!!errors.message)} resize-none`}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && (
              <p id="message-error" className="text-xs text-rose-500">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white px-6 py-2 text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Send message'}
          </button>

          {status === 'success' && (
            <p className="text-xs text-emerald-500 font-medium">
              Message sent successfully!
            </p>
          )}
          {status === 'error' && (
            <p className="text-xs text-rose-500">
              Something went wrong. Please try again later.
            </p>
          )}
        </form>

        <div className="space-y-3 text-xs">
          <p className="font-semibold text-[var(--color-text-bright)]">Direct links</p>
          <div className="space-y-2.5">
            <a
              href={`mailto:${personal.email}`}
              className="flex items-center gap-3 glass-panel rounded-xl p-3.5 transition-all hover:border-blue-500/40 dark:hover:border-sky-400/40 hover:scale-[1.02]"
            >
              <HiMail className="text-blue-500 dark:text-sky-400 shrink-0" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-[var(--color-text-muted)]">Email</p>
                <p className="truncate text-xs font-medium text-[var(--color-text-bright)]">{personal.email}</p>
              </div>
            </a>

            <button
              onClick={handleWhatsAppClick}
              type="button"
              className="flex w-full items-center gap-3 glass-panel rounded-xl p-3.5 text-left transition-all hover:border-green-500/40 hover:scale-[1.02] cursor-pointer"
            >
              <HiPhone className="text-green-500 dark:text-green-400 shrink-0" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-[var(--color-text-muted)]">WhatsApp</p>
                <p className="truncate text-xs font-medium text-[var(--color-text-bright)]">Send Instant Message</p>
              </div>
            </button>

            <a
              href={personal.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 glass-panel rounded-xl p-3.5 transition-all hover:border-slate-500/40 hover:scale-[1.02]"
            >
              <FiGithub className="text-[var(--color-text-bright)] shrink-0" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-[var(--color-text-muted)]">GitHub</p>
                <p className="truncate text-xs font-medium text-[var(--color-text-bright)]">{personal.github.replace('https://', '')}</p>
              </div>
            </a>

            <a
              href={personal.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 glass-panel rounded-xl p-3.5 transition-all hover:border-blue-600/40 hover:scale-[1.02]"
            >
              <FiLinkedin className="text-blue-500 dark:text-blue-400 shrink-0" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-[var(--color-text-muted)]">LinkedIn</p>
                <p className="truncate text-xs font-medium text-[var(--color-text-bright)]">{personal.linkedin.replace('https://', '')}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
