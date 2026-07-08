/**
 * ErrorBoundary.test.tsx
 *
 * Unit tests for the ErrorBoundary component.
 * Verifies that:
 *  - Children render normally when no error is thrown
 *  - The error recovery UI is displayed when a child throws
 *  - Refresh and Go Home buttons are present in the recovery UI
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A component that throws unconditionally, used to trigger the boundary. */
function BombComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test explosion 💥')
  }
  return <p>Normal child content</p>
}

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Normal child content')).toBeInTheDocument()
  })

  it('renders the error recovery UI when a child component throws', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
  })

  it('displays a user-friendly error message', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/please try refreshing the page/i)).toBeInTheDocument()
  })

  it('renders a "Refresh Page" button in the recovery UI', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument()
  })

  it('renders a "Go Home" button in the recovery UI', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
  })

  it('does not show the recovery UI when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.queryByRole('heading', { name: /something went wrong/i })).not.toBeInTheDocument()
  })

  it('can wrap multiple children and renders them all when healthy', () => {
    render(
      <ErrorBoundary>
        <span>First</span>
        <span>Second</span>
      </ErrorBoundary>,
    )

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
