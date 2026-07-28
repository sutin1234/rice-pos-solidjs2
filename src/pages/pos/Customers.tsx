import { createSignal, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Customer } from '@/services/db'
import { currentBranchId } from '@/stores/branch'

export function Customers() {
  const [editing, setEditing] = createSignal<Customer | null>(null)
  const [name, setName] = createSignal('')
  const [phone, setPhone] = createSignal('')
  const [address, setAddress] = createSignal('')
  const [list, setList] = createSignal<Customer[]>([])

  async function load() {
    setList(await db.customers.where('branchId').equals(currentBranchId()).toArray())
  }
  load()

  function resetForm() {
    setEditing(null)
    setName('')
    setPhone('')
    setAddress('')
  }

  async function save() {
    const data = { name: name(), phone: phone(), address: address(), branchId: currentBranchId() }
    if (editing()) {
      await db.customers.update(editing()!.id!, data)
    } else {
      await db.customers.add(data)
    }
    resetForm()
    load()
  }

  async function remove(id: number) {
    await db.customers.delete(id)
    load()
  }

  function edit(c: Customer) {
    setEditing(c)
    setName(c.name)
    setPhone(c.phone)
    setAddress(c.address)
  }

  return (
    <div class={css({ p: '24px', maxW: '800px', mx: 'auto' })}>
      <h1>ลูกค้า</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); save() }}
        class={css({ display: 'flex', gap: '8px', mb: '24px', flexWrap: 'wrap' })}
      >
        <input
          placeholder="ชื่อลูกค้า"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          required
          class={inputStyle()}
        />
        <input
          placeholder="เบอร์โทร"
          value={phone()}
          onInput={(e) => setPhone(e.currentTarget.value)}
          class={inputStyle()}
        />
        <input
          placeholder="ที่อยู่ (optional)"
          value={address()}
          onInput={(e) => setAddress(e.currentTarget.value)}
          class={inputStyle()}
        />
        <button type="submit" class={btnStyle(true)}>
          {editing() ? 'แก้ไข' : 'เพิ่ม'}
        </button>
        <Show when={editing()}>
          <button type="button" onClick={resetForm} class={btnStyle(false)}>ยกเลิก</button>
        </Show>
      </form>

      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>เบอร์โทร</th>
            <th>ที่อยู่</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <For each={list()}>
            {(c) => (
              <tr>
                <td>{c.name}</td>
                <td>{c.phone || '-'}</td>
                <td class={css({ fontSize: '13px', color: 'text' })}>{c.address || '-'}</td>
                <td>
                  <button onClick={() => edit(c)} class={btnStyle(true)}>แก้ไข</button>
                  <button onClick={() => remove(c.id!)} class={btnStyle(false)}>ลบ</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

const inputStyle = () => css({
  px: '12px', py: '8px', borderRadius: '6px',
  border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
  fontSize: '14px', flexGrow: 1, minW: '180px',
})

const btnStyle = (primary: boolean) => css({
  px: '16px', py: '8px', borderRadius: '6px', cursor: 'pointer',
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
