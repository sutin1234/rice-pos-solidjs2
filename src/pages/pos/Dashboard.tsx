import { createSignal, createMemo, For, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { css } from '@styled-system/css'
import { db, type Sale, type Customer, type Product } from '@/services/db'
import { currentBranchId, setBranches } from '@/stores/branch'

export function Dashboard() {
  const navigate = useNavigate()
  const [sales, setSales] = createSignal<Sale[]>([])
  const [customers, setCustomers] = createSignal<Customer[]>([])
  const [products, setProducts] = createSignal<Product[]>([])

  async function load() {
    const branchId = currentBranchId()
    setSales(await db.sales.where('branchId').equals(branchId).toArray())
    setCustomers(await db.customers.where('branchId').equals(branchId).toArray())
    setProducts(await db.products.where({ active: 1, branchId }).toArray())
    const allBranches = await db.branches.toArray()
    setBranches(allBranches.map((b) => ({ id: b.id!, name: b.name })))
  }
  load()

  const todaySales = createMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return sales().filter((s) => new Date(s.date).toISOString().slice(0, 10) === today)
  })

  const todayRevenue = createMemo(() => todaySales().reduce((s, x) => s + x.total, 0))
  const todayCount = createMemo(() => todaySales().length)

  const pendingDebts = createMemo(() => {
    const creditSales = sales().filter((s) => s.paymentMethod === 'credit' && s.customerId)
    const map = new Map<number, { name: string; total: number }>()
    for (const s of creditSales) {
      if (!s.customerId) continue
      const existing = map.get(s.customerId) || { name: '', total: 0 }
      const customer = customers().find((c) => c.id === s.customerId)
      existing.name = customer?.name || `#${s.customerId}`
      existing.total += s.total
      map.set(s.customerId, existing)
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  })

  const totalDebt = createMemo(() => pendingDebts().reduce((s, x) => s + x.total, 0))

  const lowStockProducts = createMemo(() =>
    products().filter((p) => p.lowStockThreshold > 0 && p.stock <= p.lowStockThreshold),
  )

  const lowStockCount = createMemo(() => lowStockProducts().length)

  return (
    <div class={css({ p: '24px', maxW: '900px', mx: 'auto' })}>
      <h1 class={css({ mb: '20px' })}>หน้าหลัก</h1>

      <div class={css({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', mb: '24px' })}>
        <Card
          title="ขายวันนี้"
          value={`${todayRevenue().toLocaleString()} บาท`}
          subtitle={`${todayCount()} บิล`}
          color="accent"
        />
        <Card
          title="ลูกหนี้คงค้าง"
          value={`${totalDebt().toLocaleString()} บาท`}
          subtitle={`${pendingDebts().length} ราย`}
          color={totalDebt() > 0 ? 'red.500' : 'text'}
        />
        <Card
          title="สินค้าใกล้หมด"
          value={`${lowStockCount()} รายการ`}
          subtitle={lowStockCount() > 0 ? 'ต้องสั่งซื้อเพิ่ม' : 'ปกติ'}
          color={lowStockCount() > 0 ? 'orange.500' : 'green.600'}
        />
      </div>

      <div class={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', mb: '24px' })}>
        <div class={css({ p: '16px', borderRadius: '8px', border: '1px solid token(colors.border)' })}>
          <h2 class={css({ fontSize: '16px', mb: '12px' })}>ขายวันนี้</h2>
          <Show when={todaySales().length === 0}>
            <p class={css({ color: 'text', fontSize: '14px' })}>ยังไม่มีรายการขายวันนี้</p>
          </Show>
          <For each={todaySales().slice(0, 10)}>
            {(s) => (
              <div class={css({ display: 'flex', justifyContent: 'space-between', py: '6px', fontSize: '14px', borderBottom: '1px solid token(colors.border)' })}>
                <span>{s.items.map((i) => i.productName).join(', ')}</span>
                <span class={css({ fontWeight: '600' })}>{s.total.toLocaleString()}</span>
              </div>
            )}
          </For>
        </div>

        <div class={css({ p: '16px', borderRadius: '8px', border: '1px solid token(colors.border)' })}>
          <h2 class={css({ fontSize: '16px', mb: '12px' })}>สินค้าใกล้หมด</h2>
          <Show when={lowStockProducts().length === 0}>
            <p class={css({ color: 'text', fontSize: '14px' })}>สต็อกปกติ</p>
          </Show>
          <For each={lowStockProducts().slice(0, 10)}>
            {(p) => (
              <div class={css({ display: 'flex', justifyContent: 'space-between', py: '6px', fontSize: '14px', borderBottom: '1px solid token(colors.border)' })}>
                <span>{p.name}</span>
                <span class={css({ fontWeight: '600', color: 'red.500' })}>
                  {p.stock} / {p.lowStockThreshold}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class={css({ display: 'flex', gap: '12px', justifyContent: 'center' })}>
        <button onClick={() => navigate('/pos/expenses')} class={navBtn()}>จัดการรายจ่าย</button>
        <button onClick={() => navigate('/pos/profit-loss')} class={navBtn()}>ดูกำไรขาดทุน</button>
      </div>
    </div>
  )
}

function Card(props: { title: string; value: string; subtitle: string; color: string }) {
  return (
    <div class={css({
      p: '20px', borderRadius: '10px', border: '1px solid token(colors.border)',
      bg: 'bg',
    })}>
      <div class={css({ fontSize: '14px', color: 'text', mb: '8px' })}>{props.title}</div>
      <div class={css({ fontSize: '24px', fontWeight: '700', color: props.color, mb: '4px' })}>
        {props.value}
      </div>
      <div class={css({ fontSize: '13px', color: 'text' })}>{props.subtitle}</div>
    </div>
  )
}

const navBtn = () => css({
  px: '20px', py: '10px', borderRadius: '8px', cursor: 'pointer',
  border: '1px solid token(colors.border)',
  bg: 'accent', color: 'white', fontSize: '14px', fontWeight: '600',
  _hover: { opacity: 0.85 },
})