import { css } from '@styled-system/css'

export function About() {
  return (
    <section class={css({ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', flexGrow: 1, justifyContent: 'center' })}>
      <h1>About</h1>
      <p>Built with SolidJS + PandaCSS + Vitest</p>
    </section>
  )
}
