import { createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Expense } from '@/services/db'

const EXPENSE_CATEGORIES = ['ค่าเช่า', 'ค่าน้ำไฟ', 'ค่าขนส่ง', 'เงินเดือน', 'วัตถุดิบ', 'ค่าบำรุงรักษา', 'อื่นๆ']
const PAYMENT_METHODS = ['cash', 'bank_transfer', 'promptpay'] as const

export function Expenses() {
  const [editing, setEditing] = createSignal<Expense | null>(null)
  const [date, setDate] = createSignal(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = createSignal(EXPENSE_CATEGORIES[0])
  const [description, setDescription] = createSignal('')
  const [amount, setAmount] = createSignal(0)
  const [paymentMethod, setPaymentMethod] = createSignal<'cash' | 'bank_transfer' | 'promptpay'>('cash')
  const [note, setNote] = createSignal('')
  const [list, setList] = createSignal<Expense[]>([])

  async function load() {
    const all = await db.expenses.toArray()
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setList(all)
  }
  load()

  function resetForm() {
    setEditing(null)
    setDate(new Date().toISOString().slice(0, 10))
    setCategory(EXPENSE_CATEGORIES[0])
    setDescription('')
    setAmount(0)
    setPaymentMethod('cash')
    setNote('')
  }

  async function save() {
    const data = {
      date: new Date(date()),
      category: category(),
      description: description(),
      amount: amount(),
      paymentMethod: paymentMethod() as 'cash' | 'bank_transfer' | 'promptpay',
      note: note(),
    }
    if (editing()) {
      await db.expenses.update(editing()!.id!, data)
    } else {
      await db.expenses.add(data)
    }
    resetForm()
    load()
  }

  async function remove(id: number) {
    await db.expenses.delete(id)
    load()
  }

  function edit(e: Expense) {
    setEditing(e)
    setDate(new Date(e.date).toISOString().slice(0, 10))
    setCategory(e.category)
    setDescription(e.description)
    setAmount(e.amount)
    setPaymentMethod(e.paymentMethod)
    setNote(e.note)
  }

  return (
    <div class={css({ p: '24px', maxW: '900px', mx: 'auto' })}>
      <h1>รายจ่าย</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); save() }}
        class={css({ display: 'flex', gap: '8px', mb: '24px', flexWrap: 'wrap' })}
      >
        <input type="date" value={date()} onInput={(e) => setDate(e.currentTarget.value)} required class={inputStyle()} />
        <select value={category()} onChange={(e) => setCategory(e.currentTarget.value)} class={inputStyle()}>
          <For each={EXPENSE_CATEGORIES}>{(c) => <option value={c}>{c}</option>}</For>
        </select>
        <input placeholder="รายละเอียด" value={description()} onInput={(e) => setDescription(e.currentTarget.value)} required class={inputStyle()} />
        <input type="number" placeholder="จำนวนเงิน" value={amount() || ''} onInput={(e) => setAmount(Number(e.currentTarget.value))} required class={smInput()} />
        <select value={paymentMethod()} onChange={(e) => setPaymentMethod(e.currentTarget.value as 'cash' | 'bank_transfer' | 'promptpay')} class={inputStyle()}>
          <option value="cash">เงินสด</option>
          <option value="bank_transfer">โอน</option>
          <option value="promptpay">พร้อมเพย์</option>
        </select>
        <input placeholder="หมายเหตุ (optional)" value={note()} onInput={(e) => setNote(e.currentTarget.value)} class={inputStyle()} />
        <button type="submit" class={btnStyle(true)}>{editing() ? 'แก้ไข' : 'เพิ่ม'}</button>
        <Show when={editing()}>
          <button type="button" onClick={resetForm} class={btnStyle(false)}>ยกเลิก</button>
        </Show>
      </form>

      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ประเภท</th>
            <th>รายละเอียด</th>
            <th>จำนวนเงิน</th>
            <th>ชำระ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <For each={list()}>
            {(e) => (
              <tr>
                <td>{new Date(e.date).toLocaleDateString('th-TH')}</td>
                <td>{e.category}</td>
                <td>{e.description}</td>
                <td class={css({ fontWeight: '600', color: 'red.500' })}>{e.amount.toLocaleString()}</td>
                <td>{methodLabel(e.paymentMethod)}</td>
                <td>
                  <button onClick={() => edit(e)} class={btnStyle(true)}>แก้ไข</button>
                  <button onClick={() => remove(e.id!)} class={btnStyle(false)}>ลบ</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

function methodLabel(m: string) {
  const map: Record<string, string> = { cash: 'เงินสด', bank_transfer: 'โอน', promptpay: 'พร้อมเพย์' }
  return map[m] || m
}

const inputStyle = () => css({
  px: '12px', py: '8px', borderRadius: '6px',
  border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
  fontSize: '14px', flexGrow: 1, minW: '140px',
})

const smInput = () => css({
  px: '8px', py: '8px', borderRadius: '6px',
  border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
  fontSize: '14px', width: '120px',
})

const btnStyle = (primary: boolean) => css({
  px: '14px', py: '8px', borderRadius: '6px', cursor: 'pointer',
  border: '1px solid token(colors.border)',
  bg: primary ? 'accent' : 'bg',
  color: primary ? 'white' : 'text',
  fontSize: '14px',
  _hover: { opacity: 0.85 },
})

const tableStyle = () => css({
  width: '100%', borderCollapse: 'collapse',
  '& th, & td': {
    textAlign: 'left', p: '10px 12px', borderBottom: '1px solid token(colors.border)',
    fontSize: '14px',
  },
  '& th': { fontWeight: '600', color: 'text-h' },
})