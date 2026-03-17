import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(metric)
  }

  // Send to analytics service in production
  if (import.meta.env.PROD) {
    // Example: Send to Google Analytics, Plausible, or custom analytics
    // navigator.sendBeacon('/analytics', JSON.stringify(metric))

    // Or send to console for now
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
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
