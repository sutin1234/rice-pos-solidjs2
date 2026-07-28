import { describe, it, expect } from 'vitest'
import { routes } from './index'

describe('routes', () => {
  it('defines all expected routes', () => {
    const paths = routes.map((r) => r.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/about')
    expect(paths).toContain('/pos')
    expect(paths).toContain('/pos/products')
    expect(paths).toContain('/pos/categories')
    expect(paths).toContain('/pos/sales')
    expect(paths).toContain('/pos/customers')
    expect(paths).toContain('/pos/debts')
    expect(paths).toContain('/pos/stock-adjust')
    expect(paths).toContain('/not-found')
  })

  it('has correct number of routes', () => {
    expect(routes).toHaveLength(11)
  })

  it('each route has path and component', () => {
    for (const route of routes) {
      expect(route.path).toBeDefined()
      expect(typeof route.path).toBe('string')
      expect(route.component).toBeDefined()
    }
  })
})