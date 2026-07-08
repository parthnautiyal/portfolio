import { useState, useRef } from 'react'
import { personal } from '../content/personal.ts'
import { HiMail, HiPhone } from 'react-icons/hi'
import { FiGithub, FiLinkedin, FiPaperclip, FiX, FiUploadCloud } from 'react-icons/fi'

type FormState = {
  name: string
  email: string
  message: string
}

type FormErrors = {
  name?: string
  email?: string
  message?: string
  attachment?: string
}

type Attachment = {
  file: File
  base64: string
}

const initialState: FormState = {
  name: '',
  email: '',
  message: '',
}

const MAX_FILE_BYTES = 3 * 1024 * 1024  // 3 MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]
const ACCEPTED_EXT = '.pdf,.doc,.docx,.jpg,.jpeg,.png'

const readAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // strip "data:...;base64," prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileSelect = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, attachment: 'Only PDF, DOC, DOCX, JPG, or PNG allowed.' }))
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors(prev => ({ ...prev, attachment: `File too large — max 3 MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB).` }))
      return
    }
    setErrors(prev => ({ ...prev, attachment: undefined }))
    const base64 = await readAsBase64(file)
    setAttachment({ file, base64 })
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await handleFileSelect(file)
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
      const body: Record<string, unknown> = { ...form }
      if (attachment) {
        body.attachment = {
          name: attachment.file.name,
          mimeType: attachment.file.type,
          data: attachment.base64,
        }
      }
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      setStatus('success')
      setForm(initialState)
      setAttachment(null)
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
    `w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all duration-300 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm text-[var(--color-text)] placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
      hasError
        ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20'
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

          {/* Attachment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <FiPaperclip size={12} />
              Attachment <span className="normal-case font-normal text-slate-400">(optional · PDF, DOC, DOCX, JPG, PNG · max 3 MB)</span>
            </label>

            {attachment ? (
              <div className="flex items-center gap-3 glass-panel rounded-xl px-4 py-3">
                <FiPaperclip className="text-blue-500 shrink-0" size={14} />
                <span className="text-xs text-[var(--color-text)] truncate flex-1">{attachment.file.name}</span>
                <span className="text-[0.65rem] text-slate-400 shrink-0">
                  {(attachment.file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="p-1 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label="Remove attachment"
                >
                  <FiX size={13} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-all duration-300 bg-white/10 dark:bg-slate-900/10 ${
                  dragActive
                    ? 'border-blue-500 dark:border-sky-450 bg-blue-500/5 dark:bg-sky-400/5 scale-[1.01]'
                    : 'border-slate-200/70 dark:border-slate-800/70 hover:border-blue-550/50 dark:hover:border-sky-400/50 hover:bg-slate-100/30 dark:hover:bg-slate-900/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXT}
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) await handleFileSelect(file)
                  }}
                />
                <FiUploadCloud className="text-slate-400 shrink-0" size={16} />
                <span className="text-xs text-slate-500">
                  {dragActive ? 'Drop file here…' : 'Drag & drop or click to attach a file'}
                </span>
              </div>
            )}

            {errors.attachment && (
              <p className="text-xs text-rose-500">{errors.attachment}</p>
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

        <div className="space-y-4 text-xs select-none">
          {/* Mock API & Server Gateway Status Dashboard */}
          <div className="glass-card p-5 space-y-4 border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-2">
              <span className="text-[0.62rem] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">Endpoint Cockpit</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.55rem] font-mono text-emerald-500 uppercase font-black">Operational</span>
              </div>
            </div>
            <div className="space-y-2.5 text-[0.65rem] font-mono text-slate-500 dark:text-slate-450">
              <div className="flex justify-between items-center">
                <span>SMTP Mail Router</span>
                <span className="text-emerald-500 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center">
                <span>API Gateway (Vercel)</span>
                <span className="text-emerald-500 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">200 OK</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Dev Node (Parth)</span>
                <span className="text-blue-500 font-bold px-1.5 py-0.5 rounded bg-blue-500/10">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="font-bold text-[var(--color-text-bright)] px-1 uppercase text-[0.6rem] tracking-wider text-slate-500 dark:text-slate-400">Direct Links</p>
            <a
              href={`mailto:${personal.email}`}
              className="flex items-center gap-3 glass-panel rounded-xl p-3.5 transition-all duration-300 border border-slate-200/60 dark:border-slate-850 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <HiMail className="text-blue-500 dark:text-sky-400 shrink-0" size={18} />
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-[0.65rem] text-[var(--color-text-muted)] font-bold">Email</p>
                <p className="truncate text-xs font-semibold text-[var(--color-text-bright)]">{personal.email}</p>
              </div>
            </a>

            <button
              onClick={handleWhatsAppClick}
              type="button"
              className="flex w-full items-center gap-3 glass-panel rounded-xl p-3.5 text-left transition-all duration-300 border border-slate-200/60 dark:border-slate-855 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-0.5 hover:scale-[1.01] cursor-pointer"
            >
              <HiPhone className="text-green-500 dark:text-green-400 shrink-0" size={18} />
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.65rem] text-[var(--color-text-muted)] font-bold">WhatsApp</p>
                <p className="truncate text-xs font-semibold text-[var(--color-text-bright)]">Send Instant Message</p>
              </div>
            </button>

            <a
              href={personal.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 glass-panel rounded-xl p-3.5 transition-all duration-300 border border-slate-200/60 dark:border-slate-860 hover:border-slate-400/50 hover:shadow-lg hover:shadow-slate-400/5 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <FiGithub className="text-[var(--color-text-bright)] shrink-0" size={18} />
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-[0.65rem] text-[var(--color-text-muted)] font-bold">GitHub</p>
                <p className="truncate text-xs font-semibold text-[var(--color-text-bright)]">{personal.github.replace('https://', '')}</p>
              </div>
            </a>

            <a
              href={personal.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 glass-panel rounded-xl p-3.5 transition-all duration-300 border border-slate-200/60 dark:border-slate-865 hover:border-sky-600/50 hover:shadow-lg hover:shadow-sky-500/5 hover:-translate-y-0.5 hover:scale-[1.01]"
            >
              <FiLinkedin className="text-blue-500 dark:text-blue-400 shrink-0" size={18} />
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-[0.65rem] text-[var(--color-text-muted)] font-bold">LinkedIn</p>
                <p className="truncate text-xs font-semibold text-[var(--color-text-bright)]">{personal.linkedin.replace('https://', '')}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
