import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia (jsdom doesn't implement it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.scrollTo (jsdom doesn't implement it)
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Suppress noisy console.error in tests (React error boundary outputs)
// Re-enable per test via vi.spyOn if needed
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React internal error boundary stack traces in test output
    const message = String(args[0] ?? '')
    if (
      message.includes('The above error occurred') ||
      message.includes('Error caught by boundary') ||
      message.includes('act(') ||
      message.includes('Warning:')
    ) {
      return
    }
    originalConsoleError(...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
})
