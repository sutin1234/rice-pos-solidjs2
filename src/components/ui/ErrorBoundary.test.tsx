import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { ErrorBoundary } from './ErrorBoundary'

function Throws() {
  throw new Error('test error')
  return undefined as unknown as Element
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(() => (
      <ErrorBoundary>
        <span>content</span>
      </ErrorBoundary>
    ))
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('shows fallback on error with retry', async () => {
    const fallback = vi.fn((_err, reset) => (
      <div>
        <span>fallback</span>
        <button onClick={reset}>retry</button>
      </div>
    ))

    render(() => (
      <ErrorBoundary fallback={fallback}>
        <Throws />
      </ErrorBoundary>
    ))

    expect(screen.getByText('fallback')).toBeInTheDocument()
  })
})
