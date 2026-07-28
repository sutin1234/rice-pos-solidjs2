import { describe, it, expect } from 'vitest'
import { cn, clamp, formatCount } from './index'

describe('cn', () => {
  it('joins truthy classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })
})

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe('formatCount', () => {
  it('formats number with locale separators', () => {
    expect(formatCount(1000)).toBe('1,000')
  })

  it('handles zero', () => {
    expect(formatCount(0)).toBe('0')
  })
})
