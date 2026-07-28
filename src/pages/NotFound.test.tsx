import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { NotFound } from './NotFound'

describe('NotFound', () => {
  it('renders the NotFound component', () => {
    render(() => <NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })
})
