import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { Expenses } from '@/pages/pos/Expenses'
import { db } from '@/services/db'

beforeEach(async () => {
  await db.expenses.clear()
})

describe('Expenses', () => {
  it('shows empty state', async () => {
    render(() => <Expenses />)
    expect(await screen.findByText('รายจ่าย')).toBeTruthy()
  })

  it('renders pre-existing expenses', async () => {
    await db.expenses.add({
      date: new Date(),
      category: 'ค่าเช่า',
      description: 'ออฟฟิศ',
      amount: 5000,
      paymentMethod: 'cash',
      note: '',
    })

    render(() => <Expenses />)
    expect(await screen.findByText('ออฟฟิศ')).toBeTruthy()
  })

  it('deletes an expense', async () => {
    await db.expenses.add({
      date: new Date(),
      category: 'วัตถุดิบ',
      description: 'ซื้อผัก',
      amount: 200,
      paymentMethod: 'cash',
      note: '',
    })

    render(() => <Expenses />)
    expect(await screen.findByText('ซื้อผัก')).toBeTruthy()

    fireEvent.click(screen.getByText('ลบ'))
    await new Promise((r) => setTimeout(r, 150))
    expect(screen.queryByText('ซื้อผัก')).toBeNull()
  })

  it('pre-fills form on edit click', async () => {
    await db.expenses.add({
      date: new Date(),
      category: 'ค่าเช่า',
      description: 'ค่าเช่าเก่า',
      amount: 3000,
      paymentMethod: 'bank_transfer',
      note: '',
    })

    render(() => <Expenses />)
    expect(await screen.findByText('ค่าเช่าเก่า')).toBeTruthy()

    fireEvent.click(screen.getByText('แก้ไข'))
    const descInput = await screen.findByPlaceholderText('รายละเอียด')
    expect(descInput).toHaveValue('ค่าเช่าเก่า')
    const amountInput = screen.getByPlaceholderText('จำนวนเงิน') as HTMLInputElement
    expect(amountInput).toHaveValue(3000)
  })
})