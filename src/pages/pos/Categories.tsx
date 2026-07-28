import { createSignal, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Category } from '@/services/db'

export function Categories() {
  const [editing, setEditing] = createSignal<Category | null>(null)
  const [name, setName] = createSignal('')
  const [description, setDescription] = createSignal('')
  const [categories, setCategories] = createSignal<Category[]>([])

  async function load() {
    setCategories(await db.categories.toArray())
  }
  load()

  function resetForm() {
    setEditing(null)
    setName('')
    setDescription('')
  }

  async function save() {
    const data = { name: name(), description: description() }
    if (editing()) {
      await db.categories.update(editing()!.id!, data)
    } else {
      await db.categories.add(data)
    }
    resetForm()
    load()
  }

  async function remove(id: number) {
    await db.categories.delete(id)
    load()
  }

  function edit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
    setDescription(cat.description)
  }

  return (
    <div class={css({ p: '24px', maxW: '800px', mx: 'auto' })}>
      <h1>ประเภทสินค้า</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); save() }}
        class={css({ display: 'flex', gap: '8px', mb: '24px', flexWrap: 'wrap' })}
      >
        <input
          placeholder="ชื่อประเภท"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          required
          class={inputStyle()}
        />
        <input
          placeholder="รายละเอียด (optional)"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          class={inputStyle()}
        />
        <button type="submit" class={btnStyle(true)}>
          {editing() ? 'แก้ไข' : 'เพิ่ม'}
        </button>
        <Show when={editing()}>
          <button type="button" onClick={resetForm} class={btnStyle(false)}>
            ยกเลิก
          </button>
        </Show>
      </form>

      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>รายละเอียด</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <For each={categories()}>
            {(cat) => (
              <tr>
                <td>{cat.name}</td>
                <td class={css({ color: 'text', fontSize: '14px' })}>{cat.description}</td>
                <td>
                  <button onClick={() => edit(cat)} class={btnStyle(true)}>แก้ไข</button>
                  <button onClick={() => remove(cat.id!)} class={btnStyle(false)}>ลบ</button>
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
  fontSize: '14px', flexGrow: 1, minW: '200px',
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
