import { createSignal, createMemo, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Sale, type PaymentMethod } from '@/services/db'

type Tab = 'daily' | 'monthly' | 'yearly' | 'category' | 'top'

const methodLabel: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  bank_transfer: 'โอน',
  promptpay: 'พร้อมเพย์',
  card: 'บัตร',
  credit: 'เงินเชื่อ',
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

function csvEscape(val: string | number) {
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF'
  const csv = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function Reports() {
  const [tab, setTab] = createSignal<Tab>('daily')
  const [sales, setSales] = createSignal<Sale[]>([])
  const [dailyDate, setDailyDate] = createSignal(toDateInput(new Date()))
  const [monthStr, setMonthStr] = createSignal(new Date().toISOString().slice(0, 7))
  const [yearStr, setYearStr] = createSignal(String(new Date().getFullYear()))

  async function load() {
    setSales(await db.sales.orderBy('date').reverse().toArray())
  }
  load()

  const dailySales = createMemo(() => {
    const d = dailyDate()
    return sales().filter((s) => toDateInput(new Date(s.date)).startsWith(d))
  })

  const dailySummary = createMemo(() => {
    const items = dailySales()
    const total = items.reduce((s, x) => s + x.total, 0)
    const subtotal = items.reduce((s, x) => s + x.subtotal, 0)
    const discount = items.reduce((s, x) => s + x.discount, 0)
    const methodBreakdown = {} as Record<string, number>
    for (const s of items) {
      const lbl = methodLabel[s.paymentMethod as PaymentMethod] || s.paymentMethod
      methodBreakdown[lbl] = (methodBreakdown[lbl] || 0) + s.total
    }
    return { count: items.length, subtotal, discount, total, methodBreakdown }
  })

  const monthlySales = createMemo(() => {
    const m = monthStr()
    return sales().filter((s) => toDateInput(new Date(s.date)).startsWith(m))
  })

  const monthlySummary = createMemo(() => {
    const items = monthlySales()
    const total = items.reduce((s, x) => s + x.total, 0)
    const cost = items.reduce((s, x) => {
      return s + x.items.reduce((sum, i) => sum + i.quantity * (i.unitPrice * 0.8), 0)
    }, 0)
    return { count: items.length, total, profit: total - cost }
  })

  const yearlySales = createMemo(() => {
    const y = yearStr()
    const filtered = sales().filter((s) => toDateInput(new Date(s.date)).startsWith(y))
    const byMonth: Record<string, { count: number; total: number }> = {}
    for (const s of filtered) {
      const month = toDateInput(new Date(s.date)).slice(0, 7)
      if (!byMonth[month]) byMonth[month] = { count: 0, total: 0 }
      byMonth[month].count++
      byMonth[month].total += s.total
    }
    return Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]))
  })

  const categorySales = createMemo(async () => {
    const allSales = sales()
    const cats = await db.categories.toArray()
    const catMap = new Map(cats.map((c) => [c.id!, c.name]))
    const byCat: Record<string, { qty: number; total: number }> = {}
    for (const s of allSales) {
      for (const item of s.items) {
        const catName = 'ไม่ระบุ'
        if (!byCat[catName]) byCat[catName] = { qty: 0, total: 0 }
        byCat[catName].qty += item.quantity
        byCat[catName].total += item.total
      }
    }
    return Object.entries(byCat).sort((a, b) => b[1].total - a[1].total)
  })

  const topProducts = createMemo(() => {
    const qtyMap = new Map<string, { name: string; qty: number; total: number }>()
    for (const s of sales()) {
      for (const item of s.items) {
        const key = String(item.productId)
        const existing = qtyMap.get(key)
        if (existing) {
          existing.qty += item.quantity
          existing.total += item.total
        } else {
          qtyMap.set(key, { name: item.productName, qty: item.quantity, total: item.total })
        }
      }
    }
    return [...qtyMap.entries()]
      .map(([, v]) => v)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 20)
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'daily', label: 'รายวัน' },
    { key: 'monthly', label: 'รายเดือน' },
    { key: 'yearly', label: 'รายปี' },
    { key: 'category', label: 'แยกประเภท' },
    { key: 'top', label: 'สินค้าขายดี' },
  ]

  async function exportDaily() {
    const items = dailySales()
    const rows = items.map((s) => [
      new Date(s.date).toLocaleString('th-TH'),
      String(s.id ?? ''),
      String(s.subtotal),
      String(s.discount),
      String(s.total),
      methodLabel[s.paymentMethod as PaymentMethod],
      s.note,
    ])
    downloadCsv(`รายวัน-${dailyDate()}.csv`,
      ['วันที่', 'เลขที่', 'รวม', 'ส่วนลด', 'สุทธิ', 'ชำระ', 'หมายเหตุ'],
      rows,
    )
  }

  async function exportMonthly() {
    const items = monthlySales()
    const rows = items.map((s) => [
      new Date(s.date).toLocaleString('th-TH'),
      String(s.id ?? ''),
      String(s.subtotal),
      String(s.discount),
      String(s.total),
      methodLabel[s.paymentMethod as PaymentMethod],
      s.note,
    ])
    downloadCsv(`รายเดือน-${monthStr()}.csv`,
      ['วันที่', 'เลขที่', 'รวม', 'ส่วนลด', 'สุทธิ', 'ชำระ', 'หมายเหตุ'],
      rows,
    )
  }

  async function exportCategory() {
    const data = await categorySales()
    const rows = data.map(([cat, vals]) => [
      cat,
      String(vals.qty),
      String(vals.total),
    ])
    downloadCsv(`แยกประเภท-${yearStr()}.csv`,
      ['ประเภท', 'จำนวน', 'ยอดรวม'],
      rows,
    )
  }

  async function exportTop() {
    const data = topProducts()
    const rows = data.map((p) => [
      p.name,
      String(p.qty),
      String(p.total),
    ])
    downloadCsv(`สินค้าขายดี-${yearStr()}.csv`,
      ['สินค้า', 'จำนวน', 'ยอดรวม'],
      rows,
    )
  }

  return (
    <div class={css({ p: '24px', maxW: '1000px', mx: 'auto' })}>
      <h1 class={css({ mb: '16px' })}>รายงาน</h1>

      <div class={css({ display: 'flex', gap: '4px', mb: '20px', flexWrap: 'wrap' })}>
        <For each={tabs}>
          {(t) => (
            <button
              onClick={() => setTab(t.key)}
              class={css({
                px: '14px', py: '8px', borderRadius: '6px', cursor: 'pointer',
                border: '1px solid token(colors.border)',
                bg: tab() === t.key ? 'accent' : 'bg',
                color: tab() === t.key ? 'white' : 'text',
                fontSize: '14px', fontWeight: tab() === t.key ? '600' : '400',
                _hover: { opacity: 0.85 },
              })}
            >
              {t.label}
            </button>
          )}
        </For>
      </div>

      <Show when={tab() === 'daily'}>
        <div class={css({ mb: '16px', display: 'flex', gap: '8px', alignItems: 'center' })}>
          <label class={css({ fontSize: '14px' })}>วันที่</label>
          <input
            type="date"
            value={dailyDate()}
            onInput={(e) => setDailyDate(e.currentTarget.value)}
            class={inputStyle()}
          />
          <button onClick={exportDaily} class={btnStyle(true)}>
            Export CSV
          </button>
        </div>

        <div class={css({ p: '12px 16px', mb: '16px', borderRadius: '8px', bg: 'code-bg', border: '1px solid token(colors.border)', fontSize: '14px' })}>
          <div>จำนวนบิล: <strong>{dailySummary().count}</strong></div>
          <div>รวมก่อนลด: <strong>{dailySummary().subtotal.toLocaleString()}</strong></div>
          <div>ส่วนลด: <strong>{dailySummary().discount.toLocaleString()}</strong></div>
          <div>ยอดขายรวม: <strong>{dailySummary().total.toLocaleString()} บาท</strong></div>
          <div class={css({ mt: '8px' })}>
            แยกตามชำระ:
            <For each={Object.entries(dailySummary().methodBreakdown)}>
              {([method, amount]) => (
                <div class={css({ ml: '12px', fontSize: '13px' })}>
                  {method}: {amount.toLocaleString()} บาท
                </div>
              )}
            </For>
          </div>
        </div>

        <table class={tableStyle()}>
          <thead>
            <tr>
              <th>เวลา</th>
              <th>#</th>
              <th>สินค้า</th>
              <th>รวม</th>
              <th>ส่วนลด</th>
              <th>สุทธิ</th>
              <th>ชำระ</th>
            </tr>
          </thead>
          <tbody>
            <For each={dailySales()}>
              {(s) => (
                <tr>
                  <td>{new Date(s.date).toLocaleTimeString('th-TH')}</td>
                  <td>{s.id}</td>
                  <td class={css({ fontSize: '13px' })}>
                    <For each={s.items}>{(item) => <div>{item.productName} ×{item.quantity}</div>}</For>
                  </td>
                  <td>{s.subtotal.toLocaleString()}</td>
                  <td>{s.discount > 0 ? s.discount.toLocaleString() : '-'}</td>
                  <td class={css({ fontWeight: '600' })}>{s.total.toLocaleString()}</td>
                  <td>{methodLabel[s.paymentMethod as PaymentMethod]}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      <Show when={tab() === 'monthly'}>
        <div class={css({ mb: '16px', display: 'flex', gap: '8px', alignItems: 'center' })}>
          <label class={css({ fontSize: '14px' })}>เดือน</label>
          <input
            type="month"
            value={monthStr()}
            onInput={(e) => setMonthStr(e.currentTarget.value)}
            class={inputStyle()}
          />
          <button onClick={exportMonthly} class={btnStyle(true)}>
            Export CSV
          </button>
        </div>

        <div class={css({ p: '12px 16px', mb: '16px', borderRadius: '8px', bg: 'code-bg', border: '1px solid token(colors.border)', fontSize: '14px' })}>
          <div>จำนวนบิล: <strong>{monthlySummary().count}</strong></div>
          <div>ยอดขาย: <strong>{monthlySummary().total.toLocaleString()} บาท</strong></div>
          <div>กำไร (ประมาณ): <strong>{monthlySummary().profit.toLocaleString()} บาท</strong></div>
        </div>

        <table class={tableStyle()}>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>#</th>
              <th>สินค้า</th>
              <th>รวม</th>
              <th>ส่วนลด</th>
              <th>สุทธิ</th>
              <th>ชำระ</th>
            </tr>
          </thead>
          <tbody>
            <For each={monthlySales()}>
              {(s) => (
                <tr>
                  <td>{new Date(s.date).toLocaleDateString('th-TH')}</td>
                  <td>{s.id}</td>
                  <td class={css({ fontSize: '13px' })}>
                    <For each={s.items}>{(item) => <div>{item.productName} ×{item.quantity}</div>}</For>
                  </td>
                  <td>{s.subtotal.toLocaleString()}</td>
                  <td>{s.discount > 0 ? s.discount.toLocaleString() : '-'}</td>
                  <td class={css({ fontWeight: '600' })}>{s.total.toLocaleString()}</td>
                  <td>{methodLabel[s.paymentMethod as PaymentMethod]}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      <Show when={tab() === 'yearly'}>
        <div class={css({ mb: '16px', display: 'flex', gap: '8px', alignItems: 'center' })}>
          <label class={css({ fontSize: '14px' })}>ปี</label>
          <input
            type="number"
            value={yearStr()}
            onInput={(e) => setYearStr(e.currentTarget.value)}
            class={inputStyle()}
            min={2020}
            max={2099}
          />
        </div>

        <table class={tableStyle()}>
          <thead>
            <tr>
              <th>เดือน</th>
              <th>จำนวนบิล</th>
              <th>ยอดขาย</th>
            </tr>
          </thead>
          <tbody>
            <For each={yearlySales()}>
              {([month, data]) => (
                <tr>
                  <td>{month}</td>
                  <td>{data.count}</td>
                  <td class={css({ fontWeight: '600' })}>{data.total.toLocaleString()}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      <Show when={tab() === 'category'}>
        <div class={css({ mb: '16px', display: 'flex', gap: '8px', alignItems: 'center' })}>
          <button onClick={exportCategory} class={btnStyle(true)}>
            Export CSV
          </button>
        </div>

        <table class={tableStyle()}>
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>จำนวน</th>
              <th>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            <For each={categorySales()}>
              {([cat, vals]) => (
                <tr>
                  <td>{cat}</td>
                  <td>{vals.qty}</td>
                  <td class={css({ fontWeight: '600' })}>{vals.total.toLocaleString()}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      <Show when={tab() === 'top'}>
        <div class={css({ mb: '16px', display: 'flex', gap: '8px', alignItems: 'center' })}>
          <button onClick={exportTop} class={btnStyle(true)}>
            Export CSV
          </button>
        </div>

        <table class={tableStyle()}>
          <thead>
            <tr>
              <th>#</th>
              <th>สินค้า</th>
              <th>จำนวนที่ขาย</th>
              <th>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            <For each={topProducts()}>
              {(p, i) => (
                <tr>
                  <td>{i() + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.qty}</td>
                  <td class={css({ fontWeight: '600' })}>{p.total.toLocaleString()}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  )
}

const inputStyle = () => css({
  px: '12px', py: '8px', borderRadius: '6px',
  border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
  fontSize: '14px', flexGrow: 1, minW: '150px',
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