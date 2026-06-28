import { track } from '@vercel/analytics'

/**
 * Track a custom analytics event.
 * Wraps Vercel Analytics `track()` with a typed interface.
 *
 * @param eventName - Name of the event (e.g. 'link_click', 'resume_download')
 * @param properties - Optional key-value metadata about the event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  try {
    track(eventName, properties)
  } catch {
    // Silently fail — analytics should never break the app
  }
}

/** Convenience: track an outbound link click */
export function trackLinkClick(label: string, href?: string): void {
  trackEvent('link_click', {
    label,
    ...(href ? { href } : {}),
  })
}
