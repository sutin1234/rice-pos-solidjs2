import { createSignal, For } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type PaymentMethod, type Sale } from '@/services/db'

const methodLabel: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  bank_transfer: 'โอน',
  promptpay: 'พร้อมเพย์',
  card: 'บัตร',
  credit: 'เงินเชื่อ',
}

export function SalesHistory() {
  const [sales, setSales] = createSignal<Sale[]>([])

  async function load() {
    setSales(await db.sales.orderBy('date').reverse().toArray())
  }
  load()

  return (
    <div class={css({ p: '24px', maxW: '900px', mx: 'auto' })}>
      <div class={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' })}>
        <h1>ประวัติการขาย</h1>
        <button onClick={() => load()} class={css({
          px: '14px', py: '8px', borderRadius: '6px', cursor: 'pointer',
          border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
          fontSize: '14px', _hover: { bg: 'code-bg' },
        })}>
          รีเฟรช
        </button>
      </div>

      <table class={tableStyle()}>
        <thead>
          <tr>
            <th>#</th>
            <th>วันที่</th>
            <th>รายการ</th>
            <th>ชำระ</th>
            <th>ส่วนลด</th>
            <th>รวม</th>
          </tr>
        </thead>
        <tbody>
          <For each={sales()}>
            {(sale) => (
              <tr>
                <td>{sale.id}</td>
                <td>{new Date(sale.date).toLocaleString('th-TH')}</td>
                <td class={css({ fontSize: '13px' })}>
                  <For each={sale.items}>
                    {(item) => (
                      <div>
                        {item.productName} × {item.quantity} = {item.total.toLocaleString()}
                      </div>
                    )}
                  </For>
                </td>
                <td>{methodLabel[sale.paymentMethod as PaymentMethod]}</td>
                <td>{sale.discount > 0 ? sale.discount.toLocaleString() : '-'}</td>
                <td class={css({ fontWeight: '600' })}>{sale.total.toLocaleString()}</td>
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
