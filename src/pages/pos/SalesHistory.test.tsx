import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@solidjs/testing-library'
import { db } from '@/services/db'
import { SalesHistory } from './SalesHistory'

describe('SalesHistory', () => {
  it('renders empty list', async () => {
    render(() => <SalesHistory />)
    await waitFor(() => {
      expect(screen.getByText('ประวัติการขาย')).toBeInTheDocument()
    })
  })

  it('shows cash sales', async () => {
    await db.sales.add({
      date: new Date('2026-01-15'),
      items: [{ productId: 1, productName: 'ข้าวหอมมะลิ', quantity: 2, unitPrice: 50, total: 100 }],
      subtotal: 100, discount: 0, total: 100,
      paymentMethod: 'cash', note: '',
    })
    render(() => <SalesHistory />)
    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิ × 2 = 100')).toBeInTheDocument()
    })
    expect(screen.getByText('เงินสด')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('shows credit sales', async () => {
    await db.customers.add({ name: 'สมชาย', phone: '', address: '' })
    await db.sales.add({
      date: new Date('2026-02-20'),
      items: [{ productId: 2, productName: 'ข้าวเหนียว', quantity: 1, unitPrice: 40, total: 40 }],
      subtotal: 40, discount: 5, total: 35,
      paymentMethod: 'credit', customerId: 1, note: '',
    })
    render(() => <SalesHistory />)
    await waitFor(() => {
      expect(screen.getByText('ข้าวเหนียว × 1 = 40')).toBeInTheDocument()
    })
    expect(screen.getByText('เงินเชื่อ')).toBeInTheDocument()
  })

  it('shows discount', async () => {
    await db.sales.add({
      date: new Date(),
      items: [{ productId: 1, productName: 'ข้าวหอมมะลิ', quantity: 10, unitPrice: 50, total: 500 }],
      subtotal: 500, discount: 50, total: 450,
      paymentMethod: 'cash', note: '',
    })
    render(() => <SalesHistory />)
    await waitFor(() => {
      const cells = screen.getAllByText('50')
      expect(cells.length).toBeGreaterThanOrEqual(1)
    })
  })
})
