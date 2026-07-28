import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { Dashboard } from '@/pages/pos/Dashboard'
import { db } from '@/services/db'

vi.mock('@solidjs/router', () => ({
  useNavigate: () => vi.fn(),
}))

beforeEach(async () => {
  await db.sales.clear()
  await db.products.clear()
  await db.customers.clear()
})

describe('Dashboard', () => {
  it('shows empty state', async () => {
    render(() => <Dashboard />)
    expect(await screen.findByText('หน้าหลัก')).toBeTruthy()
  })

  it('shows today sales', async () => {
    const now = new Date()
    await db.sales.add({
      date: now,
      items: [{ productId: 1, productName: 'ข้าวสาร', quantity: 1, unitPrice: 100 }],
      total: 100,
      paymentMethod: 'cash',
      customerId: undefined,
      branchId: 1,
    })

    render(() => <Dashboard />)
    expect(await screen.findByText('100 บาท')).toBeTruthy()
  })

  it('shows pending debts', async () => {
    const customerId = await db.customers.add({ name: 'สมชาย', phone: '0812345678', branchId: 1 })
    await db.sales.add({
      date: new Date(),
      items: [{ productId: 1, productName: 'ข้าวสาร', quantity: 1, unitPrice: 200 }],
      total: 200,
      paymentMethod: 'credit',
      customerId,
      branchId: 1,
    })

    render(() => <Dashboard />)
    const debtCards = await screen.findAllByText('200 บาท')
    expect(debtCards.length).toBeGreaterThanOrEqual(1)
  })

  it('shows low stock warning', async () => {
    await db.products.add({
      name: 'ข้าวหอมมะลิ', categoryId: 1, unit: 'ถุง',
      stock: 2, lowStockThreshold: 5, price: 100, costPrice: 80, active: 1,
      barcode: '', image: '', branchId: 1,
    })

    render(() => <Dashboard />)
    expect(await screen.findByText('2 / 5')).toBeTruthy()
  })

  it('shows navigation buttons', async () => {
    render(() => <Dashboard />)
    expect(await screen.findByText('จัดการรายจ่าย')).toBeTruthy()
    expect(screen.getByText('ดูกำไรขาดทุน')).toBeTruthy()
  })
})