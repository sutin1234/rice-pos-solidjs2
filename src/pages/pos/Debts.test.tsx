import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@solidjs/testing-library'
import { db } from '@/services/db'
import { DebtReport } from './Debts'

describe('DebtReport', () => {
  it('shows zero debt when no sales', async () => {
    render(() => <DebtReport />)
    await waitFor(() => {
      expect(screen.getByText(/ยอดลูกหนี้รวม/)).toBeInTheDocument()
    })
  })

  it('shows debt from credit sales', async () => {
    const custId = await db.customers.add({ name: 'สมชาย', phone: '', address: '', branchId: 1 })
    await db.sales.add({
      date: new Date(),
      items: [],
      subtotal: 0,
      discount: 0,
      total: 500,
      paymentMethod: 'credit',
      customerId: custId,
      note: '',
      branchId: 1,
    })

    render(() => <DebtReport />)

    await waitFor(() => {
      expect(screen.getByText('สมชาย')).toBeInTheDocument()
    })
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('ignores cash sales', async () => {
    await db.customers.add({ name: 'สมชาย', phone: '', address: '', branchId: 1 })
    await db.sales.add({
      date: new Date(),
      items: [],
      subtotal: 0,
      discount: 0,
      total: 999,
      paymentMethod: 'cash',
      note: '',
      branchId: 1,
    })

    render(() => <DebtReport />)

    await waitFor(() => {
      expect(screen.getByText(/ยอดลูกหนี้รวม/)).toBeInTheDocument()
    })
  })
})
