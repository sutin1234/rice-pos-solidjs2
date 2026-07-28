import { css } from '@styled-system/css'

export function NotFound() {
  return (
    <section class={css({ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', flexGrow: 1, justifyContent: 'center' })}>
      <h1>404</h1>
      <p>Page not found</p>
    </section>
  )
}
