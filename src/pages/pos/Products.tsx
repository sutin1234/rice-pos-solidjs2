import { createSignal, createMemo, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Product, type Category } from '@/services/db'
import { currentBranchId } from '@/stores/branch'

const UNITS = ['กิโล', 'ถุง 1kg', 'ถุง 5kg', 'กระสอบ']

export function Products() {
  const [editing, setEditing] = createSignal<Product | null>(null)
  const [name, setName] = createSignal('')
  const [categoryId, setCategoryId] = createSignal(0)
  const [unit, setUnit] = createSignal(UNITS[0])
  const [price, setPrice] = createSignal(0)
  const [cost, setCost] = createSignal(0)
  const [stock, setStock] = createSignal(0)
  const [lowStockThreshold, setLowStockThreshold] = createSignal(0)
  const [barcode, setBarcode] = createSignal('')
  const [products, setProducts] = createSignal<Product[]>([])
  const [categories, setCategories] = createSignal<Category[]>([])

  async function load() {
    setProducts(await db.products.where({ active: 1, branchId: currentBranchId() }).toArray())
    setCategories(await db.categories.toArray())
  }
  load()

  const catMap = createMemo(() => {
    const m = new Map<number, string>()
    for (const c of categories()) m.set(c.id!, c.name)
    return m
  })

  function resetForm() {
    setEditing(null)
    setName('')
    setCategoryId(0)
    setUnit(UNITS[0])
    setPrice(0)
    setCost(0)
    setStock(0)
    setLowStockThreshold(0)
    setBarcode('')
  }

  async function save() {
    const data = {
      name: name(),
      categoryId: categoryId(),
      unit: unit(),
      price: price(),
      cost: cost(),
      stock: stock(),
      lowStockThreshold: lowStockThreshold(),
      barcode: barcode(),
      active: 1,
      branchId: currentBranchId(),
    }
    if (editing()) {
      await db.products.update(editing()!.id!, data)
    } else {
      await db.products.add(data)
    }
    resetForm()
    load()
  }

  async function remove(id: number) {
    await db.products.update(id, { active: 0 })
    load()
  }

  function edit(p: Product) {
    setEditing(p)
    setName(p.name)
    setCategoryId(p.categoryId)
    setUnit(p.unit)
    setPrice(p.price)
    setCost(p.cost)
    setStock(p.stock)
    setLowStockThreshold(p.lowStockThreshold)
    setBarcode(p.barcode)
  }

  return (
    <div class={css({ p: '24px', maxW: '900px', mx: 'auto' })}>
      <h1>สินค้า</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); save() }}
        class={css({ display: 'flex', gap: '8px', mb: '24px', flexWrap: 'wrap' })}
      >
        <input placeholder="ชื่อสินค้า" value={name()} onInput={(e) => setName(e.currentTarget.value)} required class={inputStyle()} />
        <select value={categoryId()} onChange={(e) => setCategoryId(Number(e.currentTarget.value))} required class={inputStyle()}>
          <option value={0} disabled>เลือกประเภท</option>
          <For each={categories()}>{(c) => <option value={c.id!}>{c.name}</option>}</For>
        </select>
        <select value={unit()} onChange={(e) => setUnit(e.currentTarget.value)} class={inputStyle()}>
          <For each={UNITS}>{(u) => <option value={u}>{u}</option>}</For>
        </select>
        <input type="number" placeholder="ราคาขาย" value={price() || ''} onInput={(e) => setPrice(Number(e.currentTarget.value))} required class={smInput()} />
        <input type="number" placeholder="ต้นทุน" value={cost() || ''} onInput={(e) => setCost(Number(e.currentTarget.value))} required class={smInput()} />
        <input type="number" placeholder="สต็อก" value={stock() || ''} onInput={(e) => setStock(Number(e.currentTarget.value))} required class={smInput()} />
        <input type="number" placeholder="ขั้นต่ำ" value={lowStockThreshold() || ''} onInput={(e) => setLowStockThreshold(Number(e.currentTarget.value))} class={smInput()} />
        <input placeholder="Barcode" value={barcode()} onInput={(e) => setBarcode(e.currentTarget.value)} class={inputStyle()} />
        <button type="submit" class={btnStyle(true)}>{editing() ? 'แก้ไข' : 'เพิ่ม'}</button>
        <Show when={editing()}>
          <button type="button" onClick={resetForm} class={btnStyle(false)}>ยกเลิก</button>
        </Show>
      </form>

      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>ประเภท</th>
            <th>หน่วย</th>
            <th>ราคา</th>
            <th>ต้นทุน</th>
            <th>สต็อก</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <For each={products()}>
            {(p) => (
              <tr>
                <td>{p.name}</td>
                <td>{catMap().get(p.categoryId) ?? '-'}</td>
                <td>{p.unit}</td>
                <td>{p.price.toLocaleString()}</td>
                <td>{p.cost.toLocaleString()}</td>
                <td>
                  {p.stock}
                  <Show when={p.lowStockThreshold > 0 && p.stock <= p.lowStockThreshold}>
                    <span class={css({ ml: '4px', px: '6px', py: '2px', borderRadius: '4px', bg: 'red.100', color: 'red.600', fontSize: '11px', fontWeight: '600' })}>
                      ต่ำ
                    </span>
                  </Show>
                </td>
                <td>
                  <button onClick={() => edit(p)} class={btnStyle(true)}>แก้ไข</button>
                  <button onClick={() => remove(p.id!)} class={btnStyle(false)}>ลบ</button>
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
  fontSize: '14px', flexGrow: 1, minW: '150px',
})

const smInput = () => css({
  px: '8px', py: '8px', borderRadius: '6px',
  border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
  fontSize: '14px', width: '100px',
})

const btnStyle = (primary: boolean) => css({
  px: '12px', py: '8px', borderRadius: '6px', cursor: 'pointer',
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
