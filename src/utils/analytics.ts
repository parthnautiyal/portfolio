import { track } from '@vercel/analytics'

declare global {
  interface Window {
    dataLayer: any[]
    gtag?: (...args: any[]) => void
  }
}

// Read GA Measurement ID from env or default to fallback
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-N7G8DPH335'

/**
 * Initialize Google Analytics dynamically at runtime
 */
export function initGA(): void {
  if (typeof window === 'undefined') return
  if (window.gtag) return // Already initialized

  try {
    // Create script element to load GA
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)

    // Configure datalayer and gtag function
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }

    // Initialize
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false // Manual SPA page_view events sent on route shifts
    })
  } catch (err) {
    console.warn('[Analytics] Failed to initialize Google Analytics:', err)
  }
}

/**
 * Track a custom analytics event on both Vercel Analytics and Google Analytics (GA4).
 *
 * @param eventName - Name of the event (e.g. 'link_click', 'resume_download')
 * @param properties - Optional key-value metadata about the event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  // 1. Vercel Analytics
  try {
    track(eventName, properties)
  } catch {
    // Silently fail in environments without Vercel SDK context
  }

  // 2. Google Analytics
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties)
    }
  } catch {
    // Silently fail
  }
}

/** Convenience: track an outbound link click */
export function trackLinkClick(label: string, href?: string): void {
  trackEvent('link_click', {
    label,
    ...(href ? { href } : {}),
  })
}
