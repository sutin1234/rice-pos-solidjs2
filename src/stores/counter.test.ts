import { describe, it, expect, beforeEach } from 'vitest'
import { flush } from 'solid-js'
import { counterStore } from './counter'

beforeEach(() => {
  counterStore.reset()
  flush()
})

describe('counterStore', () => {
  it('count starts at 0', () => {
    expect(counterStore.count).toBe(0)
  })

  it('increment increases count by 1', () => {
    counterStore.increment()
    flush()
    expect(counterStore.count).toBe(1)
  })

  it('decrement decreases count by 1', () => {
    counterStore.decrement()
    flush()
    expect(counterStore.count).toBe(-1)
  })

  it('reset sets count back to 0', () => {
    counterStore.increment()
    counterStore.increment()
    flush()
    expect(counterStore.count).toBe(2)

    counterStore.reset()
    flush()
    expect(counterStore.count).toBe(0)
  })

  it('handles multiple increments and decrements', () => {
    counterStore.increment()
    counterStore.increment()
    counterStore.increment()
    flush()
    expect(counterStore.count).toBe(3)

    counterStore.decrement()
    flush()
    expect(counterStore.count).toBe(2)

    counterStore.decrement()
    counterStore.decrement()
    flush()
    expect(counterStore.count).toBe(0)

    counterStore.increment()
    counterStore.increment()
    counterStore.increment()
    flush()
    expect(counterStore.count).toBe(3)
  })
})
