import 'fake-indexeddb/auto'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { db } from '@/services/db'
import { Products } from './Products'

afterEach(async () => {
  await db.categories.clear()
  await db.products.clear()
})

describe('Products', () => {
  it('renders empty list', async () => {
    render(() => <Products />)
    await waitFor(() => {
      expect(screen.getByText('สินค้า')).toBeInTheDocument()
    })
  })

  it('adds a product with category name', async () => {
    await db.categories.add({ name: 'ข้าวสาร', description: '' })
    render(() => <Products />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('ชื่อสินค้า')).toBeInTheDocument()
    })

    await fireEvent.input(screen.getByPlaceholderText('ชื่อสินค้า'), { target: { value: 'ข้าวหอมมะลิ' } })
    await fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } })
    await fireEvent.input(screen.getByPlaceholderText('ราคาขาย'), { target: { value: '50' } })
    await fireEvent.input(screen.getByPlaceholderText('ต้นทุน'), { target: { value: '40' } })
    await fireEvent.input(screen.getByPlaceholderText('สต็อก'), { target: { value: '100' } })
    await fireEvent.input(screen.getByPlaceholderText('ขั้นต่ำ'), { target: { value: '10' } })
    await fireEvent.click(screen.getByRole('button', { name: /เพิ่ม/ }))

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิ')).toBeInTheDocument()
    })

    expect(screen.getByText('ข้าวสาร')).toBeInTheDocument()
  })

  it('deletes a product', async () => {
    await db.categories.add({ name: 'ข้าวถุง', description: '' })
    render(() => <Products />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('ชื่อสินค้า')).toBeInTheDocument()
    })

    await fireEvent.input(screen.getByPlaceholderText('ชื่อสินค้า'), { target: { value: 'ข้าวไรซ์เบอร์รี่' } })
    await fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } })
    await fireEvent.input(screen.getByPlaceholderText('ราคาขาย'), { target: { value: '60' } })
    await fireEvent.input(screen.getByPlaceholderText('ต้นทุน'), { target: { value: '45' } })
    await fireEvent.input(screen.getByPlaceholderText('สต็อก'), { target: { value: '30' } })
    await fireEvent.input(screen.getByPlaceholderText('ขั้นต่ำ'), { target: { value: '5' } })
    await fireEvent.click(screen.getByRole('button', { name: /เพิ่ม/ }))

    await waitFor(() => {
      expect(screen.getByText('ข้าวไรซ์เบอร์รี่')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByRole('button', { name: /ลบ/ }))
    await waitFor(() => {
      expect(screen.queryByText('ข้าวไรซ์เบอร์รี่')).not.toBeInTheDocument()
    })
  })
})
