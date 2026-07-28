import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('db.customers', () => {
  it('adds and reads a customer', async () => {
    const id = await db.customers.add({ name: 'สมชาย', phone: '0812345678', address: '' })
    const c = await db.customers.get(id)
    expect(c?.name).toBe('สมชาย')
  })

  it('updates a customer', async () => {
    const id = await db.customers.add({ name: 'สมชาย', phone: '', address: '' })
    await db.customers.update(id, { phone: '0899999999' })
    const c = await db.customers.get(id)
    expect(c?.phone).toBe('0899999999')
  })

  it('deletes a customer', async () => {
    const id = await db.customers.add({ name: 'สมชาย', phone: '', address: '' })
    await db.customers.delete(id)
    const c = await db.customers.get(id)
    expect(c).toBeUndefined()
  })
})

describe('db.products', () => {
  it('filters by active', async () => {
    await db.products.add({ name: 'ข้าวหอมมะลิ', categoryId: 1, unit: 'กิโล', price: 50, cost: 40, stock: 100, barcode: '', active: 1, lowStockThreshold: 0 })
    await db.products.add({ name: 'ข้าวเก่า', categoryId: 1, unit: 'กิโล', price: 30, cost: 25, stock: 0, barcode: '', active: 0, lowStockThreshold: 0 })
    const active = await db.products.where('active').equals(1).toArray()
    expect(active).toHaveLength(1)
    expect(active[0].name).toBe('ข้าวหอมมะลิ')
  })
})

describe('db.sales', () => {
  it('adds a cash sale', async () => {
    const id = await db.sales.add({
      date: new Date(),
      items: [{ productId: 1, productName: 'ข้าวหอมมะลิ', quantity: 2, unitPrice: 50, total: 100 }],
      subtotal: 100,
      discount: 0,
      total: 100,
      paymentMethod: 'cash',
      note: '',
    })
    const sale = await db.sales.get(id)
    expect(sale?.paymentMethod).toBe('cash')
    expect(sale?.items).toHaveLength(1)
  })

  it('adds a credit sale with customer', async () => {
    const custId = await db.customers.add({ name: 'สมชาย', phone: '', address: '' })
    const id = await db.sales.add({
      date: new Date(),
      items: [{ productId: 1, productName: 'ข้าวหอมมะลิ', quantity: 1, unitPrice: 50, total: 50 }],
      subtotal: 50,
      discount: 0,
      total: 50,
      paymentMethod: 'credit',
      customerId: custId,
      note: 'ไว้จ่ายทีหลัง',
    })
    const sale = await db.sales.get(id)
    expect(sale?.paymentMethod).toBe('credit')
    expect(sale?.customerId).toBe(custId)
  })

  it('queries credit sales', async () => {
    await db.customers.add({ name: 'ลูกหนี้', phone: '', address: '' })
    await db.sales.add({ date: new Date(), items: [], subtotal: 0, discount: 0, total: 200, paymentMethod: 'credit', customerId: 1, note: '' })
    await db.sales.add({ date: new Date(), items: [], subtotal: 0, discount: 0, total: 100, paymentMethod: 'cash', note: '' })
    const creditSales = await db.sales.where('paymentMethod').equals('credit').toArray()
    expect(creditSales).toHaveLength(1)
    expect(creditSales[0].total).toBe(200)
  })
})
