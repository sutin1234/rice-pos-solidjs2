import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { MainLayout } from './MainLayout'

vi.mock('@solidjs/router', () => ({
  useNavigate: () => vi.fn(),
  useHref: () => (fn: () => string) => () => fn(),
  useLocation: () => ({ pathname: '/' }),
}))

describe('MainLayout', () => {
  it('renders nav links', () => {
    render(() => (
      <MainLayout>
        {{ children: <div>page content</div> } as any}
      </MainLayout>
    ))
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('POS')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(() => (
      <MainLayout>
        {{ children: <div>page content</div> } as any}
      </MainLayout>
    ))
    expect(screen.getByText('page content')).toBeInTheDocument()
  })

  it('renders all nav items', () => {
    render(() => (
      <MainLayout>
        {{ children: <div /> } as any}
      </MainLayout>
    ))
    expect(screen.getByText('สินค้า')).toBeInTheDocument()
    expect(screen.getByText('ประเภท')).toBeInTheDocument()
    expect(screen.getByText('ประวัติขาย')).toBeInTheDocument()
    expect(screen.getByText('ลูกค้า')).toBeInTheDocument()
    expect(screen.getByText('ลูกหนี้')).toBeInTheDocument()
    expect(screen.getByText('สต็อก')).toBeInTheDocument()
  })
})