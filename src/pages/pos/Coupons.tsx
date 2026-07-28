import { createSignal, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Coupon } from '@/services/db'
import { currentBranchId } from '@/stores/branch'

export function Coupons() {
  const [editing, setEditing] = createSignal<Coupon | null>(null)
  const [code, setCode] = createSignal('')
  const [type, setType] = createSignal<'percentage' | 'fixed'>('percentage')
  const [value, setValue] = createSignal(0)
  const [minPurchase, setMinPurchase] = createSignal(0)
  const [usageLimit, setUsageLimit] = createSignal(0)
  const [list, setList] = createSignal<Coupon[]>([])

  async function load() {
    setList(await db.coupons.where('branchId').equals(currentBranchId()).toArray())
  }
  load()

  function resetForm() {
    setEditing(null)
    setCode('')
    setType('percentage')
    setValue(0)
    setMinPurchase(0)
    setUsageLimit(0)
  }

  async function save() {
    const data: Coupon = {
      code: code(),
      type: type(),
      value: value(),
      minPurchase: minPurchase(),
      usageLimit: usageLimit(),
      usedCount: editing()?.usedCount || 0,
      active: 1,
      branchId: currentBranchId(),
    }
    if (editing()) {
      await db.coupons.update(editing()!.id!, data)
    } else {
      await db.coupons.add(data)
    }
    resetForm()
    load()
  }

  async function remove(id: number) {
    await db.coupons.delete(id)
    load()
  }

  function edit(c: Coupon) {
    setEditing(c)
    setCode(c.code)
    setType(c.type)
    setValue(c.value)
    setMinPurchase(c.minPurchase)
    setUsageLimit(c.usageLimit)
  }

  return (
    <div class={css({ p: '24px', maxW: '800px', mx: 'auto' })}>
      <h1 class={css({ mb: '16px' })}>คูปองส่วนลด</h1>

      <form onSubmit={(e) => { e.preventDefault(); save() }}
        class={css({ display: 'flex', gap: '8px', mb: '24px', flexWrap: 'wrap' })}
      >
        <input placeholder="โค้ด" value={code()} onInput={(e) => setCode(e.currentTarget.value)} required class={s()} />
        <select value={type()} onChange={(e) => setType(e.currentTarget.value as 'percentage' | 'fixed')} class={s()}>
          <option value="percentage">เปอร์เซ็นต์</option>
          <option value="fixed">จำนวนเงิน</option>
        </select>
        <input type="number" placeholder={type() === 'percentage' ? 'ส่วนลด %' : 'ส่วนลด บาท'} value={value() || ''} onInput={(e) => setValue(Number(e.currentTarget.value))} required class={ss()} />
        <input type="number" placeholder="ยอดซื้อขั้นต่ำ" value={minPurchase() || ''} onInput={(e) => setMinPurchase(Number(e.currentTarget.value))} class={ss()} />
        <input type="number" placeholder="จำกัดการใช้" value={usageLimit() || ''} onInput={(e) => setUsageLimit(Number(e.currentTarget.value))} class={ss()} />
        <button type="submit" class={btn(true)}>{editing() ? 'แก้ไข' : 'เพิ่ม'}</button>
        <Show when={editing()}><button type="button" onClick={resetForm} class={btn(false)}>ยกเลิก</button></Show>
      </form>

      <table class={t()}>
        <thead>
          <tr>
            <th>โค้ด</th>
            <th>ประเภท</th>
            <th>มูลค่า</th>
            <th>ยอดขั้นต่ำ</th>
            <th>ใช้แล้ว/จำกัด</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <For each={list()}>
            {(c) => (
              <tr>
                <td class={css({ fontWeight: '600' })}>{c.code}</td>
                <td>{c.type === 'percentage' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}</td>
                <td>{c.type === 'percentage' ? `${c.value}%` : `${c.value.toLocaleString()} บาท`}</td>
                <td>{c.minPurchase.toLocaleString()}</td>
                <td>{c.usedCount}/{c.usageLimit || 'ไม่จำกัด'}</td>
                <td><span class={c.active ? css({ color: 'green.600' }) : css({ color: 'red.500' })}>{c.active ? 'เปิด' : 'ปิด'}</span></td>
                <td>
                  <button onClick={() => edit(c)} class={btn(true)}>แก้ไข</button>
                  <button onClick={() => remove(c.id!)} class={btn(false)}>ลบ</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

const s = () => css({
  px: '10px', py: '8px', borderRadius: '6px', border: '1px solid token(colors.border)',
  bg: 'bg', color: 'text', fontSize: '14px', minW: '100px',
})
const ss = () => css({
  px: '8px', py: '8px', borderRadius: '6px', border: '1px solid token(colors.border)',
  bg: 'bg', color: 'text', fontSize: '14px', width: '110px',
})
const btn = (p: boolean) => css({
  px: '14px', py: '8px', borderRadius: '6px', cursor: 'pointer',
  border: '1px solid token(colors.border)',
  bg: p ? 'accent' : 'bg', color: p ? 'white' : 'text',
  fontSize: '14px', _hover: { opacity: 0.85 },
})
const t = () => css({
  width: '100%', borderCollapse: 'collapse',
  '& th, & td': { textAlign: 'left', p: '10px 12px', borderBottom: '1px solid token(colors.border)', fontSize: '14px' },
  '& th': { fontWeight: '600', color: 'text-h' },
})