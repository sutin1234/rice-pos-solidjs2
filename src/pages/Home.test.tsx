import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { Home } from './Home'

describe('Home', () => {
  it('renders the "Get started" heading', () => {
    render(() => <Home />)
    expect(screen.getByRole('heading', { name: 'Get started' })).toBeInTheDocument()
  })

  it('renders the Counter button with count text', () => {
    render(() => <Home />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveTextContent(/Count is/)
  })

  it('renders the Hero image with Solid logo alt text', () => {
    render(() => <Home />)
    expect(screen.getByAltText('Solid logo')).toBeInTheDocument()
  })

  it('renders the NextSteps Documentation heading', () => {
    render(() => <Home />)
    expect(screen.getByRole('heading', { name: 'Documentation' })).toBeInTheDocument()
  })
})
