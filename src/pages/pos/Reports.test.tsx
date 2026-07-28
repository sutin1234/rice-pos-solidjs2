import 'fake-indexeddb/auto'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { db } from '@/services/db'
import { Reports } from './Reports'

afterEach(async () => {
  await db.sales.clear()
})

describe('Reports', () => {
  it('renders heading and tabs', async () => {
    render(() => <Reports />)
    await waitFor(() => {
      expect(screen.getByText('รายงาน')).toBeInTheDocument()
    })
    expect(screen.getByText('รายวัน')).toBeInTheDocument()
    expect(screen.getByText('รายเดือน')).toBeInTheDocument()
    expect(screen.getByText('รายปี')).toBeInTheDocument()
    expect(screen.getByText('แยกประเภท')).toBeInTheDocument()
    expect(screen.getByText('สินค้าขายดี')).toBeInTheDocument()
  })

  it('shows daily report with sales data', async () => {
    await db.sales.add({
      date: new Date(),
      items: [{ productId: 1, productName: 'ข้าวหอมมะลิ', quantity: 2, unitPrice: 50, total: 100 }],
      subtotal: 100, discount: 0, total: 100,
      paymentMethod: 'cash', note: '',
    })
    render(() => <Reports />)

    await waitFor(() => {
      expect(screen.getByText('รายงาน')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('เงินสด')).toBeInTheDocument()
    })
    expect(screen.getByText(/ข้าวหอมมะลิ/)).toBeInTheDocument()
  })

  it('shows monthly report', async () => {
    await db.sales.add({
      date: new Date(),
      items: [{ productId: 1, productName: 'ข้าวเหนียว', quantity: 1, unitPrice: 40, total: 40 }],
      subtotal: 40, discount: 0, total: 40,
      paymentMethod: 'cash', note: '',
    })
    render(() => <Reports />)

    await fireEvent.click(screen.getByText('รายเดือน'))

    await waitFor(() => {
      expect(screen.getByText(/ข้าวเหนียว/)).toBeInTheDocument()
    })
  })

  it('shows top products', async () => {
    await db.sales.add({
      date: new Date(),
      items: [
        { productId: 1, productName: 'ข้าวหอมมะลิ', quantity: 5, unitPrice: 50, total: 250 },
        { productId: 2, productName: 'ข้าวเหนียว', quantity: 3, unitPrice: 40, total: 120 },
      ],
      subtotal: 370, discount: 0, total: 370,
      paymentMethod: 'cash', note: '',
    })
    render(() => <Reports />)

    await fireEvent.click(screen.getByText('สินค้าขายดี'))

    await waitFor(() => {
      expect(screen.getByText(/ข้าวหอมมะลิ/)).toBeInTheDocument()
    })
    expect(screen.getByText(/ข้าวเหนียว/)).toBeInTheDocument()
  })

  it('switches tabs', async () => {
    render(() => <Reports />)

    await waitFor(() => {
      expect(screen.getByText('รายงาน')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByText('รายปี'))
    expect(screen.getByText('เดือน')).toBeInTheDocument()

    await fireEvent.click(screen.getByText('แยกประเภท'))
    await waitFor(() => {
      expect(screen.getByText('ประเภท')).toBeInTheDocument()
    })
  })
})