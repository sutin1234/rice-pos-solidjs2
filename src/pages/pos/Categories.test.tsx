import 'fake-indexeddb/auto'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library'
import { db } from '@/services/db'
import { Categories } from './Categories'

afterEach(async () => {
  await db.categories.clear()
})

describe('Categories', () => {
  it('renders empty list', async () => {
    render(() => <Categories />)
    await waitFor(() => {
      expect(screen.getByText('ประเภทสินค้า')).toBeInTheDocument()
    })
  })

  it('adds a category', async () => {
    render(() => <Categories />)
    await fireEvent.input(screen.getByPlaceholderText('ชื่อประเภท'), { target: { value: 'ข้าวหอมมะลิ' } })
    await fireEvent.click(screen.getByRole('button', { name: /เพิ่ม/ }))
    await waitFor(() => {
      expect(screen.getByText('ข้าวหอมมะลิ')).toBeInTheDocument()
    })
  })

  it('edits a category', async () => {
    render(() => <Categories />)
    await fireEvent.input(screen.getByPlaceholderText('ชื่อประเภท'), { target: { value: 'ข้าวนุ่ม' } })
    await fireEvent.click(screen.getByRole('button', { name: /เพิ่ม/ }))
    await waitFor(() => {
      expect(screen.getByText('ข้าวนุ่ม')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByRole('button', { name: /แก้ไข/ }))
    await fireEvent.input(screen.getByPlaceholderText('ชื่อประเภท'), { target: { value: 'ข้าวหอม' } })
    const formBtns = screen.getAllByRole('button', { name: /แก้ไข/ })
    await fireEvent.click(formBtns[0])

    await waitFor(() => {
      expect(screen.getByText('ข้าวหอม')).toBeInTheDocument()
    })
  })

  it('deletes a category', async () => {
    render(() => <Categories />)
    await fireEvent.input(screen.getByPlaceholderText('ชื่อประเภท'), { target: { value: 'ข้าวกล้อง' } })
    await fireEvent.click(screen.getByRole('button', { name: /เพิ่ม/ }))
    await waitFor(() => {
      expect(screen.getByText('ข้าวกล้อง')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByRole('button', { name: /ลบ/ }))
    await waitFor(() => {
      expect(screen.queryByText('ข้าวกล้อง')).not.toBeInTheDocument()
    })
  })
})
