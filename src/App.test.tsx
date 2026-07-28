import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import App from './App'

vi.mock('@solidjs/router', () => ({
  createRouter: () => {
    return function MockRouter(props: { children: (props: any) => any }) {
      return <>{props.children({ children: <div>route content</div> })}</>
    }
  },
  browserHistory: () => ({}),
}))

vi.mock('@/components/ui/ErrorBoundary', () => ({
  ErrorBoundary: (props: { children: any }) => <>{props.children}</>,
}))

vi.mock('@/layouts/MainLayout', () => ({
  MainLayout: (props: { children: any }) => <>{props.children.children}</>,
}))

vi.mock('@/routes', () => ({
  routes: [],
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(() => <App />)
    expect(screen.getByText('route content')).toBeInTheDocument()
  })
})