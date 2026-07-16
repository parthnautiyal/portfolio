/**
 * analytics.test.ts
 *
 * Unit tests for the analytics module.
 * Verifies that AnalyticsService delegates events to all providers,
 * that each concrete provider behaves correctly, and that the public
 * convenience functions (trackEvent, trackLinkClick, initGA) work.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  AnalyticsService,
  GoogleAnalyticsProvider,
  VercelAnalyticsProvider,
} from '../analytics'
import type { AnalyticsProvider, EventProperties } from '../analytics'

// ---------------------------------------------------------------------------
// Helpers / Factories
// ---------------------------------------------------------------------------

/** Creates a mock AnalyticsProvider with jest spy functions. */
function makeMockProvider(): AnalyticsProvider {
  return {
    init: vi.fn(),
    trackEvent: vi.fn(),
  }
}

// ---------------------------------------------------------------------------
// AnalyticsService tests
// ---------------------------------------------------------------------------

describe('AnalyticsService', () => {
  it('calls init() on every registered provider', () => {
    const p1 = makeMockProvider()
    const p2 = makeMockProvider()
    const service = new AnalyticsService([p1, p2])

    service.init()

    expect(p1.init).toHaveBeenCalledOnce()
    expect(p2.init).toHaveBeenCalledOnce()
  })

  it('calls trackEvent() on every registered provider with the correct args', () => {
    const p1 = makeMockProvider()
    const p2 = makeMockProvider()
    const service = new AnalyticsService([p1, p2])
    const props: EventProperties = { page: '/home', status: true }

    service.trackEvent('page_view', props)

    expect(p1.trackEvent).toHaveBeenCalledWith('page_view', props)
    expect(p2.trackEvent).toHaveBeenCalledWith('page_view', props)
  })

  it('calls trackEvent() with undefined properties when none supplied', () => {
    const p1 = makeMockProvider()
    const service = new AnalyticsService([p1])

    service.trackEvent('click')

    expect(p1.trackEvent).toHaveBeenCalledWith('click', undefined)
  })

  it('still works with zero providers (no errors thrown)', () => {
    const service = new AnalyticsService([])
    expect(() => service.trackEvent('test')).not.toThrow()
  })

  describe('trackLinkClick', () => {
    it('fires link_click event with label and href', () => {
      const p1 = makeMockProvider()
      const service = new AnalyticsService([p1])

      service.trackLinkClick('GitHub', 'https://github.com')

      expect(p1.trackEvent).toHaveBeenCalledWith('link_click', {
        label: 'GitHub',
        href: 'https://github.com',
      })
    })

    it('fires link_click event with only label when href is omitted', () => {
      const p1 = makeMockProvider()
      const service = new AnalyticsService([p1])

      service.trackLinkClick('Resume')

      expect(p1.trackEvent).toHaveBeenCalledWith('link_click', { label: 'Resume' })
    })
  })
})

// ---------------------------------------------------------------------------
// GoogleAnalyticsProvider tests
// ---------------------------------------------------------------------------

describe('GoogleAnalyticsProvider', () => {
  let originalGtag: Window['gtag']
  let originalDataLayer: Window['dataLayer']

  beforeEach(() => {
    originalGtag = window.gtag
    originalDataLayer = window.dataLayer
    // Clean up GA state between tests
    delete (window as Partial<Window>).gtag
    window.dataLayer = []
  })

  afterEach(() => {
    window.gtag = originalGtag
    window.dataLayer = originalDataLayer
  })

  it('appends a script tag to document.head on first init()', () => {
    const provider = new GoogleAnalyticsProvider('G-TEST123')
    const initialScriptCount = document.head.querySelectorAll('script').length

    provider.init()

    const scripts = document.head.querySelectorAll('script')
    expect(scripts.length).toBeGreaterThan(initialScriptCount)
    expect(scripts[scripts.length - 1].src).toContain('googletagmanager.com/gtag/js')
  })

  it('does not append a second script if already initialised', () => {
    window.gtag = vi.fn()
    const provider = new GoogleAnalyticsProvider('G-TEST123')
    const before = document.head.querySelectorAll('script').length

    provider.init()

    expect(document.head.querySelectorAll('script').length).toBe(before)
  })

  it('pushes an event to dataLayer via gtag on trackEvent()', () => {
    const gtagSpy = vi.fn()
    window.gtag = gtagSpy
    const provider = new GoogleAnalyticsProvider('G-TEST123')

    provider.trackEvent('resume_download', { format: 'pdf' })

    expect(gtagSpy).toHaveBeenCalledWith('event', 'resume_download', { format: 'pdf' })
  })

  it('does not throw when gtag is absent', () => {
    const provider = new GoogleAnalyticsProvider('G-TEST123')
    // gtag is deleted in beforeEach
    expect(() => provider.trackEvent('test')).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// VercelAnalyticsProvider tests
// ---------------------------------------------------------------------------

describe('VercelAnalyticsProvider', () => {
  it('init() does not throw', () => {
    const provider = new VercelAnalyticsProvider()
    expect(() => provider.init()).not.toThrow()
  })

  it('trackEvent() does not throw (track may silently fail outside Vercel runtime)', () => {
    const provider = new VercelAnalyticsProvider()
    expect(() => provider.trackEvent('test_event', { key: 'val' })).not.toThrow()
  })
})
