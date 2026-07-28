import 'fake-indexeddb/auto'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { db } from '@/services/db'
import { StockAdjustment } from './StockAdjustment'

afterEach(async () => {
  await db.products.clear()
  await db.stockMovements.clear()
})

describe('StockAdjustment', () => {
  it('renders heading', async () => {
    render(() => <StockAdjustment />)
    await waitFor(() => {
      expect(screen.getByText('ปรับสต็อก')).toBeInTheDocument()
    })
  })

  it('adds stock (in)', async () => {
    const pid = await db.products.add({
      name: 'ข้าวหอมมะลิ', categoryId: 1, unit: 'กิโล',
      price: 50, cost: 40, stock: 100, barcode: '', active: 1, lowStockThreshold: 0,
    })
    render(() => <StockAdjustment />)

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิ (คงเหลือ 100)')).toBeInTheDocument()
    })

    await fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: String(pid) } })
    await fireEvent.input(screen.getByPlaceholderText('จำนวน'), { target: { value: '20' } })
    await fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }))

    await waitFor(async () => {
      const updated = await db.products.get(pid)
      expect(updated?.stock).toBe(120)
    })
  })

  it('reduces stock (out)', async () => {
    const pid = await db.products.add({
      name: 'ข้าวเหนียว', categoryId: 1, unit: 'กิโล',
      price: 40, cost: 30, stock: 50, barcode: '', active: 1, lowStockThreshold: 0,
    })
    render(() => <StockAdjustment />)

    await waitFor(() => {
      expect(screen.getByText('ข้าวเหนียว (คงเหลือ 50)')).toBeInTheDocument()
    })

    await fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: String(pid) } })
    await fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'out' } })
    await fireEvent.input(screen.getByPlaceholderText('จำนวน'), { target: { value: '10' } })
    await fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }))

    await waitFor(async () => {
      const updated = await db.products.get(pid)
      expect(updated?.stock).toBe(40)
    })
  })

  it('shows movement history after adjustment', async () => {
    const pid = await db.products.add({
      name: 'ข้าวกล้อง', categoryId: 1, unit: 'กิโล',
      price: 60, cost: 45, stock: 30, barcode: '', active: 1, lowStockThreshold: 0,
    })
    render(() => <StockAdjustment />)

    await waitFor(() => {
      expect(screen.getByText('ข้าวกล้อง (คงเหลือ 30)')).toBeInTheDocument()
    })

    await fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: String(pid) } })
    await fireEvent.input(screen.getByPlaceholderText('จำนวน'), { target: { value: '15' } })
    await fireEvent.click(screen.getByRole('button', { name: /บันทึก/ }))

    await waitFor(() => {
      expect(screen.getByText('เพิ่ม')).toBeInTheDocument()
    })
  })
})