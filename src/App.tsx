import { createRouter, browserHistory } from '@solidjs/router'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { MainLayout } from '@/layouts/MainLayout'
import { routes } from '@/routes'

const Router = createRouter({
  routes,
  history: browserHistory(),
})

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        {(props) => <MainLayout>{props}</MainLayout>}
      </Router>
    </ErrorBoundary>
  )
}
