/**
 * analytics.ts
 *
 * Provides a composable analytics system based on the Dependency Inversion
 * and Single Responsibility principles.
 *
 * Instead of calling Vercel and GA directly, callers go through an
 * AnalyticsService that delegates to registered AnalyticsProvider
 * implementations. Providers are independently swappable and testable.
 */

import { track } from '@vercel/analytics'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shared event payload accepted by all providers. */
export type EventProperties = Record<string, string | number | boolean>

/**
 * Interface every analytics provider must satisfy.
 * Satisfies: Interface Segregation – each method is purposeful.
 * Satisfies: Dependency Inversion – callers depend on this abstraction.
 */
export interface AnalyticsProvider {
  /** Called once at app start to initialise the provider. */
  init(): void
  /** Fires a named event with optional metadata. */
  trackEvent(name: string, properties?: EventProperties): void
}

// ---------------------------------------------------------------------------
// Concrete Providers
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Read GA Measurement ID from env or fall back to the production value. */
const GA_MEASUREMENT_ID =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID
    ? import.meta.env.VITE_GA_MEASUREMENT_ID
    : 'G-N7G8DPH335'

/**
 * Google Analytics 4 provider.
 * Single Responsibility: only knows how to talk to GA.
 */
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  private readonly measurementId: string

  constructor(measurementId: string = GA_MEASUREMENT_ID) {
    this.measurementId = measurementId
  }

  init(): void {
    if (typeof window === 'undefined') return
    if (window.gtag) return // already initialised

    try {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      window.gtag = function (...args: unknown[]) {
        window.dataLayer.push(args)
      }

      window.gtag('js', new Date())
      window.gtag('config', this.measurementId, {
        send_page_view: false, // SPA: manual page_view events sent on route changes
      })
    } catch (err) {
      console.warn('[Analytics][GA] Initialisation failed:', err)
    }
  }

  trackEvent(name: string, properties?: EventProperties): void {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', name, properties)
      }
    } catch {
      // Silently fail – analytics must never break the app
    }
  }
}

/**
 * Vercel Analytics provider.
 * Single Responsibility: only knows how to talk to Vercel's edge analytics.
 */
export class VercelAnalyticsProvider implements AnalyticsProvider {
  init(): void {
    // Vercel Analytics is initialised via <Analytics /> component in the tree;
    // nothing to do here.
  }

  trackEvent(name: string, properties?: EventProperties): void {
    try {
      track(name, properties)
    } catch {
      // Silently fail in environments without Vercel SDK context
    }
  }
}

// ---------------------------------------------------------------------------
// Analytics Service (Orchestrator)
// ---------------------------------------------------------------------------

/**
 * AnalyticsService composes multiple providers and exposes a clean public API.
 * Open-Closed: new providers can be added without modifying this class.
 * Dependency Inversion: depends on the AnalyticsProvider interface, not
 * concrete implementations.
 */
export class AnalyticsService {
  private providers: AnalyticsProvider[]

  constructor(providers: AnalyticsProvider[]) {
    this.providers = providers
  }

  /** Initialise all registered providers. */
  init(): void {
    this.providers.forEach((p) => p.init())
  }

  /** Fire a named event across all providers. */
  trackEvent(name: string, properties?: EventProperties): void {
    this.providers.forEach((p) => p.trackEvent(name, properties))
  }

  /** Convenience helper: track an outbound link click. */
  trackLinkClick(label: string, href?: string): void {
    this.trackEvent('link_click', {
      label,
      ...(href ? { href } : {}),
    })
  }
}

// ---------------------------------------------------------------------------
// Default singleton – app-wide analytics instance
// ---------------------------------------------------------------------------

const defaultService = new AnalyticsService([
  new VercelAnalyticsProvider(),
  new GoogleAnalyticsProvider(),
])

/**
 * Initialise Google Analytics (called once in main.tsx).
 */
export function initGA(): void {
  defaultService.init()
}

/**
 * Track a custom analytics event on both Vercel Analytics and GA4.
 *
 * @param eventName  Name of the event (e.g. 'link_click', 'resume_download')
 * @param properties Optional key-value metadata about the event
 */
export function trackEvent(
  eventName: string,
  properties?: EventProperties,
): void {
  defaultService.trackEvent(eventName, properties)
}

/** Convenience: track an outbound link click. */
export function trackLinkClick(label: string, href?: string): void {
  defaultService.trackLinkClick(label, href)
}
