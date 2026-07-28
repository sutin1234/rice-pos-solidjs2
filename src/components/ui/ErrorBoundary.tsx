import { createErrorBoundary } from 'solid-js'
import type { Accessor, Element } from 'solid-js'
import { css } from '@styled-system/css'

interface ErrorBoundaryProps {
  children: Element
  fallback?: (error: Accessor<unknown>, reset: () => void) => Element
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const result = createErrorBoundary(
    () => props.children,
    props.fallback ??
      ((err, reset) => (
        <div
          role="alert"
          class={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            p: '32px',
            color: 'red.500',
          })}
        >
          <h2>Something went wrong</h2>
          <p
            class={css({
              fontFamily: 'mono',
              fontSize: '14px',
              color: 'text',
              maxW: '600px',
              textAlign: 'center',
            })}
          >
            {String(err() instanceof Error ? (err() as Error).message : err())}
          </p>
          <button
            type="button"
            onClick={reset}
            class={css({
              mt: '8px',
              px: '16px',
              py: '8px',
              borderRadius: '6px',
              border: '1px solid token(colors.border)',
              bg: 'bg',
              color: 'text',
              cursor: 'pointer',
              _hover: { bg: 'accent-bg' },
            })}
          >
            Try Again
          </button>
        </div>
      )),
  )
  return <>{result()}</>
}

export function withErrorBoundary(
  Component: () => Element,
  fallback?: (error: Accessor<unknown>, reset: () => void) => Element,
) {
  return () => (
    <ErrorBoundary fallback={fallback}>
      <Component />
    </ErrorBoundary>
  )
}
