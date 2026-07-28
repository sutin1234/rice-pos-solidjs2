import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { Hero } from './Hero'

describe('Hero', () => {
  it('renders the hero container', () => {
    const { container } = render(() => <Hero />)
    expect(container.querySelector('.hero')).toBeInTheDocument()
  })

  it('renders the Solid logo image', () => {
    render(() => <Hero />)
    const solidLogo = screen.getByRole('img', { name: 'Solid logo' })
    expect(solidLogo).toBeInTheDocument()
  })

  it('renders the Vite logo image', () => {
    render(() => <Hero />)
    const viteLogo = screen.getByRole('img', { name: 'Vite logo' })
    expect(viteLogo).toBeInTheDocument()
  })
})
