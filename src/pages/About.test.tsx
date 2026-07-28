import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { About } from './About'

describe('About', () => {
  it('renders the About component', () => {
    render(() => <About />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Built with SolidJS + PandaCSS + Vitest')).toBeInTheDocument()
  })
})
