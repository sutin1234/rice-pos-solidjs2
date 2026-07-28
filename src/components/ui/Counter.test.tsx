import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { Counter } from './Counter'

describe('Counter', () => {
  it('renders with initial count 0', () => {
    render(() => <Counter />)
    expect(screen.getByRole('button')).toHaveTextContent('Count is 0')
  })

  it('increments on click', async () => {
    render(() => <Counter />)
    const btn = screen.getByRole('button')
    await fireEvent.click(btn)
    expect(btn).toHaveTextContent('Count is 1')
    await fireEvent.click(btn)
    expect(btn).toHaveTextContent('Count is 2')
  })
})
