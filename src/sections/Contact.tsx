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

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user types
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

    if (!validateForm()) {
      setStatus('error')
      return
    }

    if (!apiBase) {
      setStatus('error')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(`${apiBase}/contact`, {
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
    // Decodes base64 phone number 'NzQ1Mzg4Njg4NQ==' -> '7453886885'
    const decryptedPhone = atob('NzQ1Mzg4Njg4NQ==')
    const url = `https://wa.me/91${decryptedPhone}?text=Hi%20Parth,%20I%20saw%20your%20portfolio...`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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
          className="card-elevated space-y-4 p-5 text-sm"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-offset-1 focus:ring-1 ${
                errors.name
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-700'
                  : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:focus:border-slate-100 dark:focus:ring-slate-100'
              } dark:bg-slate-800 dark:text-slate-100`}
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-rose-600 dark:text-rose-400">
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-700 dark:text-slate-200"
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
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-offset-1 focus:ring-1 ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-700'
                  : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:focus:border-slate-100 dark:focus:ring-slate-100'
              } dark:bg-slate-800 dark:text-slate-100`}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-rose-600 dark:text-rose-400">
                {errors.email}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="message"
              className="text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none ring-offset-1 focus:ring-1 ${
                errors.message
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-700'
                  : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:focus:border-slate-100 dark:focus:ring-slate-100'
              } dark:bg-slate-800 dark:text-slate-100`}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && (
              <p id="message-error" className="text-xs text-rose-600 dark:text-rose-400">
                {errors.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-slate-900 px-4 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 dark:border-slate-100 dark:text-slate-100 dark:hover:bg-slate-100 dark:hover:text-slate-900 dark:disabled:border-slate-700 dark:disabled:text-slate-600"
          >
            {submitting ? 'Sending…' : 'Send message'}
          </button>
          {status === 'success' && (
            <p className="text-xs text-emerald-600">
              Thanks! Your message has been sent.
            </p>
          )}
          {status === 'error' && (
            <p className="text-xs text-rose-600">
              Something went wrong. Please check your details or try again
              later.
            </p>
          )}
        </form>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-50">Direct links</p>
          <div className="space-y-3">
            <a
              href={`mailto:${personal.email}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-blue-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500"
            >
              <HiMail className="text-blue-600 dark:text-blue-400" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-slate-500 dark:text-slate-400">Email</p>
                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">{personal.email}</p>
              </div>
            </a>
            <button
              onClick={handleWhatsAppClick}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-green-500 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-green-400 cursor-pointer"
            >
              <HiPhone className="text-green-600 dark:text-green-400" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-slate-500 dark:text-slate-400">WhatsApp</p>
                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">Send Instant Message</p>
              </div>
            </button>
            <a
              href={personal.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-slate-900 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-400"
            >
              <FiGithub className="text-slate-800 dark:text-slate-200" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-slate-500 dark:text-slate-400">GitHub</p>
                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">{personal.github.replace('https://', '')}</p>
              </div>
            </a>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-blue-600 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500"
            >
              <FiLinkedin className="text-blue-600 dark:text-blue-400" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-slate-500 dark:text-slate-400">LinkedIn</p>
                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">{personal.linkedin.replace('https://', '')}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

