import { createSignal, createMemo, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Sale, type Expense } from '@/services/db'

export function ProfitLoss() {
  const [sales, setSales] = createSignal<Sale[]>([])
  const [expenses, setExpenses] = createSignal<Expense[]>([])
  const [monthStr, setMonthStr] = createSignal(new Date().toISOString().slice(0, 7))

  async function load() {
    setSales(await db.sales.toArray())
    setExpenses(await db.expenses.toArray())
  }
  load()

  const filteredSales = createMemo(() => {
    const m = monthStr()
    return sales().filter((s) => new Date(s.date).toISOString().slice(0, 7) === m)
  })

  const filteredExpenses = createMemo(() => {
    const m = monthStr()
    return expenses().filter((e) => new Date(e.date).toISOString().slice(0, 7) === m)
  })

  const revenue = createMemo(() => filteredSales().reduce((s, x) => s + x.total, 0))
  const totalExpenses = createMemo(() => filteredExpenses().reduce((s, x) => s + x.amount, 0))
  const cogs = createMemo(() => {
    let total = 0
    for (const sale of filteredSales()) {
      for (const item of sale.items) {
        total += item.quantity * (item.unitPrice * 0.8)
      }
    }
    return total
  })
  const grossProfit = createMemo(() => revenue() - cogs())
  const netProfit = createMemo(() => grossProfit() - totalExpenses())

  const expenseByCategory = createMemo(() => {
    const map = new Map<string, number>()
    for (const e of filteredExpenses()) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  })

  return (
    <div class={css({ p: '24px', maxW: '800px', mx: 'auto' })}>
      <h1 class={css({ mb: '16px' })}>กำไรขาดทุน</h1>

      <div class={css({ mb: '16px', display: 'flex', gap: '8px', alignItems: 'center' })}>
        <label class={css({ fontSize: '14px' })}>เดือน</label>
        <input
          type="month"
          value={monthStr()}
          onInput={(e) => setMonthStr(e.currentTarget.value)}
          class={inputStyle()}
        />
      </div>

      <div class={css({ p: '16px', borderRadius: '8px', bg: 'code-bg', border: '1px solid token(colors.border)', fontSize: '14px', mb: '16px' })}>
        <div class={css({ display: 'flex', justifyContent: 'space-between', mb: '8px' })}>
          <span>รายได้ (ยอดขาย)</span>
          <span class={css({ fontWeight: '600' })}>{revenue().toLocaleString()} บาท</span>
        </div>
        <div class={css({ display: 'flex', justifyContent: 'space-between', mb: '8px', color: 'red.500' })}>
          <span>ต้นทุนขาย (COGS)</span>
          <span class={css({ fontWeight: '600' })}>-{cogs().toLocaleString()} บาท</span>
        </div>
        <div class={css({ display: 'flex', justifyContent: 'space-between', mb: '8px', pb: '8px', borderBottom: '1px solid token(colors.border)' })}>
          <span>กำไรขั้นต้น</span>
          <span class={css({ fontWeight: '600', color: grossProfit() >= 0 ? 'green.600' : 'red.500' })}>
            {grossProfit().toLocaleString()} บาท
          </span>
        </div>
        <div class={css({ display: 'flex', justifyContent: 'space-between', mb: '8px', color: 'red.500' })}>
          <span>ค่าใช้จ่าย</span>
          <span class={css({ fontWeight: '600' })}>-{totalExpenses().toLocaleString()} บาท</span>
        </div>
        <div class={css({ display: 'flex', justifyContent: 'space-between', pt: '8px', borderTop: '2px solid', borderColor: netProfit() >= 0 ? 'green.600' : 'red.500', fontSize: '16px' })}>
          <span class={css({ fontWeight: '700' })}>กำไรสุทธิ</span>
          <span class={css({ fontWeight: '700', color: netProfit() >= 0 ? 'green.600' : 'red.500' })}>
            {netProfit().toLocaleString()} บาท
          </span>
        </div>
      </div>

      <h2 class={css({ fontSize: '16px', mb: '8px' })}>รายละเอียดค่าใช้จ่าย</h2>
      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>ประเภท</th>
            <th>จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          <For each={expenseByCategory()}>
            {([cat, amount]) => (
              <tr>
                <td>{cat}</td>
                <td class={css({ fontWeight: '600', color: 'red.500' })}>{amount.toLocaleString()}</td>
              </tr>
            )}
          </For>
          <Show when={expenseByCategory().length === 0}>
            <tr><td colSpan={2}>ไม่มีค่าใช้จ่ายในเดือนนี้</td></tr>
          </Show>
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

const tableStyle = () => css({
  width: '100%', borderCollapse: 'collapse',
  '& th, & td': {
    textAlign: 'left', p: '10px 12px', borderBottom: '1px solid token(colors.border)',
    fontSize: '14px',
  },
  '& th': { fontWeight: '600', color: 'text-h' },
})