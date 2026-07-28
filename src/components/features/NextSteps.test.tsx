import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { NextSteps } from './NextSteps'

describe('NextSteps', () => {
  it('renders Documentation heading', () => {
    render(() => <NextSteps />)
    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  it('renders Connect with us heading', () => {
    render(() => <NextSteps />)
    expect(screen.getByText('Connect with us')).toBeInTheDocument()
  })

  it('renders links to vite.dev and solidjs.com', () => {
    render(() => <NextSteps />)
    const viteLink = screen.getByRole('link', { name: /explore vite/i })
    const solidLink = screen.getByRole('link', { name: /learn more/i })
    expect(viteLink).toHaveAttribute('href', 'https://vite.dev/')
    expect(solidLink).toHaveAttribute('href', 'https://solidjs.com/')
  })

  it('renders GitHub, Discord, X.com, and Bluesky links', () => {
    render(() => <NextSteps />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    const discordLink = screen.getByRole('link', { name: /discord/i })
    const xLink = screen.getByRole('link', { name: /x\.com/i })
    const blueskyLink = screen.getByRole('link', { name: /bluesky/i })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/vitejs/vite')
    expect(discordLink).toHaveAttribute('href', 'https://chat.vite.dev/')
    expect(xLink).toHaveAttribute('href', 'https://x.com/vite_js')
    expect(blueskyLink).toHaveAttribute('href', 'https://bsky.app/profile/vite.dev')
  })
})