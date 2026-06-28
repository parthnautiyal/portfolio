import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'
import { trackEvent } from './analytics.ts'

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(metric)
  }

  // Send to Vercel Analytics in production
  if (import.meta.env.PROD) {
    trackEvent('web_vital', {
      name: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta),
    })
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics) // Cumulative Layout Shift
  onFCP(sendToAnalytics) // First Contentful Paint
  onINP(sendToAnalytics) // Interaction to Next Paint (replaces FID)
  onLCP(sendToAnalytics) // Largest Contentful Paint
  onTTFB(sendToAnalytics) // Time to First Byte
}
