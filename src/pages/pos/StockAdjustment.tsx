import { createSignal, For } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Product, type StockMovement } from '@/services/db'
import { currentBranchId } from '@/stores/branch'

export function StockAdjustment() {
  const [products, setProducts] = createSignal<Product[]>([])
  const [movements, setMovements] = createSignal<StockMovement[]>([])
  const [selectedId, setSelectedId] = createSignal(0)
  const [type, setType] = createSignal<'in' | 'out'>('in')
  const [quantity, setQuantity] = createSignal(0)
  const [note, setNote] = createSignal('')

  async function load() {
    setProducts(await db.products.where({ active: 1, branchId: currentBranchId() }).toArray())
    setMovements(await db.stockMovements.orderBy('date').reverse().limit(50).toArray())
  }
  load()

  async function adjust() {
    const qty = quantity()
    if (!selectedId() || qty <= 0) return

    const product = products().find((p) => p.id === selectedId())
    if (!product) return

    const stockBefore = product.stock
    const stockAfter = type() === 'in' ? stockBefore + qty : stockBefore - qty
    if (stockAfter < 0) return

    await db.products.update(selectedId(), { stock: stockAfter })
    await db.stockMovements.add({
      productId: selectedId(),
      productName: product.name,
      type: type(),
      quantity: qty,
      stockBefore,
      stockAfter,
      note: note(),
      date: new Date(),
      branchId: currentBranchId(),
    })

    setQuantity(0)
    setNote('')
    load()
  }

  return (
    <div class={css({ p: '24px', maxW: '900px', mx: 'auto' })}>
      <h1>ปรับสต็อก</h1>

      <div class={css({ display: 'flex', gap: '8px', mb: '24px', flexWrap: 'wrap', alignItems: 'flex-end' })}>
        <select
          value={selectedId()}
          onChange={(e) => setSelectedId(Number(e.currentTarget.value))}
          class={inputStyle()}
        >
          <option value={0} disabled>เลือกสินค้า</option>
          <For each={products()}>
            {(p) => (
              <option value={p.id!}>
                {p.name} (คงเหลือ {p.stock})
              </option>
            )}
          </For>
        </select>

        <select value={type()} onChange={(e) => setType(e.currentTarget.value as 'in' | 'out')} class={inputStyle()}>
          <option value="in">เพิ่มสต็อก</option>
          <option value="out">ลดสต็อก</option>
        </select>

        <input
          type="number"
          min={1}
          placeholder="จำนวน"
          value={quantity() || ''}
          onInput={(e) => setQuantity(Number(e.currentTarget.value))}
          class={smInput()}
        />

        <input
          placeholder="หมายเหตุ (optional)"
          value={note()}
          onInput={(e) => setNote(e.currentTarget.value)}
          class={inputStyle()}
        />

        <button
          onClick={adjust}
          disabled={!selectedId() || quantity() <= 0}
          class={btnStyle(true)}
        >
          บันทึก
        </button>
      </div>

      <h2 class={css({ fontSize: '16px', mb: '12px' })}>ประวัติการปรับสต็อก (ล่าสุด 50 รายการ)</h2>

      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>สินค้า</th>
            <th>ประเภท</th>
            <th>จำนวน</th>
            <th>ก่อน</th>
            <th>หลัง</th>
            <th>หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          <For each={movements()}>
            {(m) => (
              <tr>
                <td>{new Date(m.date).toLocaleString('th-TH')}</td>
                <td>{m.productName}</td>
                <td>
                  <span class={css({ color: m.type === 'in' ? 'green.600' : 'red.500', fontWeight: '600' })}>
                    {m.type === 'in' ? 'เพิ่ม' : 'ลด'}
                  </span>
                </td>
                <td>{m.quantity}</td>
                <td>{m.stockBefore}</td>
                <td>{m.stockAfter}</td>
                <td class={css({ fontSize: '13px', color: 'text' })}>{m.note || '-'}</td>
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
  px: '16px', py: '8px', borderRadius: '6px', cursor: 'pointer',
  border: '1px solid token(colors.border)',
  bg: primary ? 'accent' : 'bg',
  color: primary ? 'white' : 'text',
  fontSize: '14px',
  _hover: { opacity: 0.85 },
  _disabled: { opacity: 0.4, cursor: 'not-allowed' },
})

const tableStyle = () => css({
  width: '100%', borderCollapse: 'collapse',
  '& th, & td': {
    textAlign: 'left', p: '10px 12px', borderBottom: '1px solid token(colors.border)',
    fontSize: '14px',
  },
  '& th': { fontWeight: '600', color: 'text-h' },
})