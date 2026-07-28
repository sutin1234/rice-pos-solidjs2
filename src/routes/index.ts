import { lazy } from 'solid-js'
import { defineRoutes } from '@solidjs/router'

const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })))
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))
const Categories = lazy(() => import('@/pages/pos/Categories').then((m) => ({ default: m.Categories })))
const Products = lazy(() => import('@/pages/pos/Products').then((m) => ({ default: m.Products })))
const POS = lazy(() => import('@/pages/pos/Sales').then((m) => ({ default: m.POS })))
const SalesHistory = lazy(() => import('@/pages/pos/SalesHistory').then((m) => ({ default: m.SalesHistory })))
const CustomersPage = lazy(() => import('@/pages/pos/Customers').then((m) => ({ default: m.Customers })))
const DebtReport = lazy(() => import('@/pages/pos/Debts').then((m) => ({ default: m.DebtReport })))
const StockAdjustment = lazy(() => import('@/pages/pos/StockAdjustment').then((m) => ({ default: m.StockAdjustment })))
const ReportsPage = lazy(() => import('@/pages/pos/Reports').then((m) => ({ default: m.Reports })))

export const routes = defineRoutes([
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/pos', component: POS },
  { path: '/pos/products', component: Products },
  { path: '/pos/categories', component: Categories },
  { path: '/pos/sales', component: SalesHistory },
  { path: '/pos/customers', component: CustomersPage },
  { path: '/pos/debts', component: DebtReport },
  { path: '/pos/stock-adjust', component: StockAdjustment },
  { path: '/pos/reports', component: ReportsPage },
  { path: '/not-found', component: NotFound },
] as const)
