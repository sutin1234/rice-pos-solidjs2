import { createSignal, createMemo, For } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type PaymentMethod, type Customer, type Sale } from '@/services/db'

export function DebtReport() {
  const [customers, setCustomers] = createSignal<Customer[]>([])
  const [sales, setSales] = createSignal<Sale[]>([])

  async function load() {
    setCustomers(await db.customers.toArray())
    setSales(await db.sales.where('paymentMethod').equals('credit' as PaymentMethod).toArray())
  }
  load()

  const debts = createMemo(() => {
    const map = new Map<number, { name: string; total: number; count: number }>()
    for (const c of customers()) {
      if (c.id) map.set(c.id, { name: c.name, total: 0, count: 0 })
    }
    for (const s of sales()) {
      if (!s.customerId) continue
      const entry = map.get(s.customerId)
      if (entry) {
        entry.total += s.total
        entry.count++
      }
    }
    return [...map.entries()]
      .filter(([, v]) => v.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
  })

  const grandTotal = createMemo(() => debts().reduce((s, [, v]) => s + v.total, 0))

  return (
    <div class={css({ p: '24px', maxW: '800px', mx: 'auto' })}>
      <div class={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' })}>
        <h1>รายงานลูกหนี้</h1>
        <button onClick={() => load()} class={css({
          px: '14px', py: '8px', borderRadius: '6px', cursor: 'pointer',
          border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
          fontSize: '14px', _hover: { bg: 'code-bg' },
        })}>
          รีเฟรช
        </button>
      </div>

      <div class={css({
        p: '12px 16px', mb: '16px', borderRadius: '8px',
        bg: 'code-bg', border: '1px solid token(colors.border)',
        fontSize: '14px',
      })}>
        ยอดลูกหนี้รวม: <strong>{grandTotal().toLocaleString()} บาท</strong>
        ({debts().length} ราย)
      </div>

      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อลูกค้า</th>
            <th>จำนวนบิล</th>
            <th>ยอดค้าง</th>
          </tr>
        </thead>
        <tbody>
          <For each={debts()}>
            {([, entry], i) => (
              <tr>
                <td>{i() + 1}</td>
                <td>{entry.name}</td>
                <td>{entry.count}</td>
                <td class={css({ fontWeight: '600', color: 'red.500' })}>
                  {entry.total.toLocaleString()}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

const tableStyle = () => css({
  width: '100%', borderCollapse: 'collapse',
  '& th, & td': {
    textAlign: 'left', p: '10px 12px', borderBottom: '1px solid token(colors.border)',
    fontSize: '14px',
  },
  '& th': { fontWeight: '600', color: 'text-h' },
})
