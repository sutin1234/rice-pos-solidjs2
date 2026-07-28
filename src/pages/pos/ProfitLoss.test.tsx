import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { ProfitLoss } from '@/pages/pos/ProfitLoss'
import { db } from '@/services/db'

beforeEach(async () => {
  await db.sales.clear()
  await db.expenses.clear()
})

describe('ProfitLoss', () => {
  it('shows zero state', async () => {
    render(() => <ProfitLoss />)
    await screen.findByText('กำไรขาดทุน')
    const zeroes = screen.getAllByText('0 บาท')
    expect(zeroes.length).toBeGreaterThanOrEqual(1)
  })

  it('shows revenue from sales', async () => {
    const now = new Date()
    await db.sales.add({
      date: now,
      items: [{ productId: 1, productName: 'ข้าวสาร', quantity: 2, unitPrice: 100 }],
      total: 200,
      paymentMethod: 'cash',
      customerId: undefined,
    })
    await db.sales.add({
      date: now,
      items: [{ productId: 2, productName: 'น้ำตาล', quantity: 1, unitPrice: 50 }],
      total: 50,
      paymentMethod: 'cash',
      customerId: undefined,
    })

    render(() => <ProfitLoss />)
    expect(await screen.findByText('250 บาท')).toBeTruthy()
  })
})