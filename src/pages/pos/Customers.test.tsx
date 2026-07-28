import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { Customers } from './Customers'

describe('Customers', () => {
  it('renders empty list', async () => {
    render(() => <Customers />)
    expect(screen.getByText('ลูกค้า')).toBeInTheDocument()
  })

  it('adds a customer', async () => {
    render(() => <Customers />)
    const nameInput = screen.getByPlaceholderText('ชื่อลูกค้า')
    const phoneInput = screen.getByPlaceholderText('เบอร์โทร')
    const addBtn = screen.getByRole('button', { name: /เพิ่ม/ })

    await fireEvent.input(nameInput, { target: { value: 'สมชาย' } })
    await fireEvent.input(phoneInput, { target: { value: '0812345678' } })
    await fireEvent.click(addBtn)

    await waitFor(() => {
      expect(screen.getByText('สมชาย')).toBeInTheDocument()
    })
    expect(screen.getByText('0812345678')).toBeInTheDocument()
  })
})
