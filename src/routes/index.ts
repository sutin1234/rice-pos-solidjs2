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
const DashboardPage = lazy(() => import('@/pages/pos/Dashboard').then((m) => ({ default: m.Dashboard })))
const ExpensesPage = lazy(() => import('@/pages/pos/Expenses').then((m) => ({ default: m.Expenses })))
const ProfitLossPage = lazy(() => import('@/pages/pos/ProfitLoss').then((m) => ({ default: m.ProfitLoss })))
const CouponsPage = lazy(() => import('@/pages/pos/Coupons').then((m) => ({ default: m.Coupons })))

export const routes = defineRoutes([
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/pos', component: POS },
  { path: '/pos/dashboard', component: DashboardPage },
  { path: '/pos/expenses', component: ExpensesPage },
  { path: '/pos/profit-loss', component: ProfitLossPage },
  { path: '/pos/coupons', component: CouponsPage },
  { path: '/pos/products', component: Products },
  { path: '/pos/categories', component: Categories },
  { path: '/pos/sales', component: SalesHistory },
  { path: '/pos/customers', component: CustomersPage },
  { path: '/pos/debts', component: DebtReport },
  { path: '/pos/stock-adjust', component: StockAdjustment },
  { path: '/pos/reports', component: ReportsPage },
  { path: '/not-found', component: NotFound },
] as const)
