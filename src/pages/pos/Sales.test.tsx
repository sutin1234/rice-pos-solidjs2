import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { db } from '@/services/db'
import { POS } from './Sales'

describe('POS', () => {
  it('renders empty state', async () => {
    render(() => <POS />)
    await waitFor(() => {
      expect(screen.getByText('ตะกร้า')).toBeInTheDocument()
    })
    expect(screen.getByText('ยังไม่มีสินค้า')).toBeInTheDocument()
  })

  it('adds product to cart', async () => {
    const catId = await db.categories.add({ name: 'ข้าวสาร', description: '' })
    await db.products.add({
      name: 'ข้าวกข', categoryId: catId, unit: 'กิโล',
      price: 50, cost: 40, stock: 100, barcode: '', active: 1, lowStockThreshold: 0,
    })
    render(() => <POS />)

    await fireEvent.click(await screen.findByText('ข้าวกข'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })
  })

  it('updates quantity in cart', async () => {
    const catId = await db.categories.add({ name: 'ข้าวนึ่ง', description: '' })
    await db.products.add({
      name: 'ข้าวนึ่งบรรจุ', categoryId: catId, unit: 'กิโล',
      price: 40, cost: 30, stock: 50, barcode: '', active: 1, lowStockThreshold: 0,
    })
    render(() => <POS />)

    await fireEvent.click(await screen.findByText('ข้าวนึ่งบรรจุ'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })

    await fireEvent.input(screen.getByDisplayValue('1'), { target: { value: '3' } })

    await waitFor(() => {
      expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    })
  })

  it('removes item when qty set to 0', async () => {
    const catId = await db.categories.add({ name: 'ข้าวแดง', description: '' })
    await db.products.add({
      name: 'ข้าวแดงกล้อง', categoryId: catId, unit: 'กิโล',
      price: 55, cost: 42, stock: 20, barcode: '', active: 1, lowStockThreshold: 0,
    })
    render(() => <POS />)

    await fireEvent.click(await screen.findByText('ข้าวแดงกล้อง'))
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })

    await fireEvent.input(screen.getByDisplayValue('1'), { target: { value: '0' } })

    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีสินค้า')).toBeInTheDocument()
    })
  })

  it('checkouts cash sale and deducts stock', async () => {
    const catId = await db.categories.add({ name: 'ข้าวสารเงินสด', description: '' })
    await db.products.add({
      name: 'ข้าวสด', categoryId: catId, unit: 'กิโล',
      price: 50, cost: 40, stock: 100, barcode: '', lowStockThreshold: 0, active: 1,
    })
    render(() => <POS />)

    await fireEvent.click(await screen.findByText('ข้าวสด'))
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })

    await fireEvent.input(screen.getByPlaceholderText('รับเงิน'), { target: { value: '200' } })
    await fireEvent.click(screen.getByRole('button', { name: /บันทึกการขาย/ }))

    await waitFor(() => {
      expect(screen.getByText('บันทึกการขายสำเร็จ!')).toBeInTheDocument()
    })

    const updated = await db.products.get(await db.products.toArray().then(a => a[a.length - 1].id!))
    expect(updated?.stock).toBe(99)
  })

  it('checkout button disabled until enough received', async () => {
    const catId = await db.categories.add({ name: 'ข้าวแพง', description: '' })
    await db.products.add({
      name: 'ข้าวแพงมาก', categoryId: catId, unit: 'กิโล',
      price: 100, cost: 80, stock: 10, barcode: '', active: 1, lowStockThreshold: 0,
    })
    render(() => <POS />)

    await fireEvent.click(await screen.findByText('ข้าวแพงมาก'))
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })

    const checkoutBtn = screen.getByRole('button', { name: /บันทึกการขาย/ })
    expect((checkoutBtn as HTMLButtonElement).disabled).toBe(true)

    await fireEvent.input(screen.getByPlaceholderText('รับเงิน'), { target: { value: '100' } })
    expect((checkoutBtn as HTMLButtonElement).disabled).toBe(false)
  })

  it('credit sale with customer selector', async () => {
    const catId = await db.categories.add({ name: 'ข้าวเชื่อ', description: '' })
    await db.products.add({
      name: 'ข้าวเชื่อใจ', categoryId: catId, unit: 'กิโล',
      price: 50, cost: 40, stock: 20, barcode: '', active: 1, lowStockThreshold: 0,
    })
    await db.customers.add({ name: 'สมชาย', phone: '0812345678', address: '' })
    render(() => <POS />)

    await fireEvent.click(await screen.findByText('ข้าวเชื่อใจ'))
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByRole('button', { name: 'เงินเชื่อ' }))

    await waitFor(() => {
      expect(screen.getByText('ลูกค้า (เงินเชื่อ)')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('สมชาย (0812345678)')).toBeInTheDocument()
    })

    await fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /บันทึกการขาย/ })
      expect((btn as HTMLButtonElement).disabled).toBe(false)
    })

    await fireEvent.click(screen.getByRole('button', { name: /บันทึกการขาย/ }))

    await waitFor(() => {
      expect(screen.getByText('บันทึกการขายสำเร็จ!')).toBeInTheDocument()
    })

    const sales = await db.sales.toArray()
    expect(sales.length).toBeGreaterThanOrEqual(1)
    const sale = sales[sales.length - 1]
    expect(sale.paymentMethod).toBe('credit')
    expect(sale.customerId).toBe(1)
  })
})
