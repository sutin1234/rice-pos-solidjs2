import { createSignal, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Product, type Category, type Customer, type PaymentMethod } from '@/services/db'
import { currentBranchId } from '@/stores/branch'

interface CartItem {
  product: Product
  quantity: number
  total: number
}

const methods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'เงินสด' },
  { value: 'bank_transfer', label: 'โอน' },
  { value: 'promptpay', label: 'พร้อมเพย์' },
  { value: 'card', label: 'บัตร' },
  { value: 'credit', label: 'เงินเชื่อ' },
]

export function POS() {
  const [products, setProducts] = createSignal<Product[]>([])
  const [categories, setCategories] = createSignal<Category[]>([])
  const [customers, setCustomers] = createSignal<Customer[]>([])
  const [cart, setCart] = createSignal<CartItem[]>([])
  const [discount, setDiscount] = createSignal(0)
  const [received, setReceived] = createSignal(0)
  const [note, setNote] = createSignal('')
  const [method, setMethod] = createSignal<PaymentMethod>('cash')
  const [customerId, setCustomerId] = createSignal(0)
  const [success, setSuccess] = createSignal(false)
  const [barcode, setBarcode] = createSignal('')
  const [lastSaleJson, setLastSaleJson] = createSignal('')

  async function load() {
    setProducts(await db.products.where({ active: 1, branchId: currentBranchId() }).toArray())
    setCategories(await db.categories.toArray())
    setCustomers(await db.customers.where('branchId').equals(currentBranchId()).toArray())
  }
  load()

  function handleBarcodeInput(value: string) {
    setBarcode(value)
    if (!value.trim()) return
    const product = products().find(
      (p) => p.barcode === value.trim() || p.name.toLowerCase().includes(value.trim().toLowerCase()),
    )
    if (product) {
      addToCart(product)
      setBarcode('')
    }
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.product.price }
            : item,
        )
      }
      return [...prev, { product, quantity: 1, total: product.price }]
    })
  }

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId))
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: qty, total: qty * item.product.price }
          : item,
      ),
    )
  }

  const subtotal = () => cart().reduce((sum, item) => sum + item.total, 0)
  const total = () => Math.max(0, subtotal() - discount())
  const change = () => Math.max(0, received() - total())

  const needsPayment = () => method() === 'cash'
  const needsCustomer = () => method() === 'credit'

  async function checkout() {
    if (cart().length === 0) return
    if (needsCustomer() && !customerId()) return
    if (needsPayment() && received() < total()) return

    const sale = {
      date: new Date(),
      branchId: currentBranchId(),
      items: cart().map((item) => ({
        productId: item.product.id!,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        total: item.total,
      })),
      subtotal: subtotal(),
      discount: discount(),
      total: total(),
      paymentMethod: method(),
      customerId: needsCustomer() ? customerId() : undefined,
      note: note(),
    }
    await db.sales.add(sale)
    for (const item of cart()) {
      await db.products.update(item.product.id!, {
        stock: item.product.stock - item.quantity,
      })
    }

    setLastSaleJson(JSON.stringify({ ...sale, id: Date.now() }))
    setCart([])
    setDiscount(0)
    setReceived(0)
    setNote('')
    setMethod('cash')
    setCustomerId(0)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 5000)
  }

  function printReceipt() {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '-9999px'
    iframe.style.top = '0'
    iframe.style.width = '80mm'
    iframe.style.height = '100%'
    iframe.style.border = 'none'

    document.body.appendChild(iframe)

    const saleData = lastSaleJson() ? JSON.parse(lastSaleJson()) : null
    if (!saleData) return

    const itemsHtml = saleData.items
      .map(
        (item: any) =>
          `<tr><td>${item.productName} × ${item.quantity}</td><td style="text-align:right">${item.total.toLocaleString()}</td></tr>`,
      )
      .join('')

    iframe.contentWindow?.document.write(`
      <html><head><style>
        @page { margin: 0; size: 80mm auto; }
        body { font-family: 'Sarabun', sans-serif; font-size: 12px; padding: 10px; color: #000; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 4px 0; }
        .h { text-align: center; margin-bottom: 8px; }
        .h h2 { margin: 0; font-size: 16px; }
        .h p { margin: 2px 0; font-size: 11px; color: #555; }
        .sep { border-top: 1px dashed #000; margin: 6px 0; }
        .ttl { font-weight: bold; font-size: 14px; }
        .ft { text-align: center; margin-top: 8px; font-size: 10px; color: #888; }
      </style></head><body>
        <div class="h">
          <h2>ร้านข้าวสาร</h2>
          <p>${new Date(saleData.date).toLocaleString('th-TH')}</p>
          <p>ชำระ: ${methods.find((m) => m.value === saleData.paymentMethod)?.label || saleData.paymentMethod}</p>
        </div>
        <div class="sep"></div>
        <table>${itemsHtml}</table>
        <div class="sep"></div>
        <table>
          <tr><td>รวม</td><td style="text-align:right">${saleData.subtotal.toLocaleString()}</td></tr>
          ${saleData.discount ? `<tr><td>ส่วนลด</td><td style="text-align:right">-${saleData.discount.toLocaleString()}</td></tr>` : ''}
          <tr class="ttl"><td>สุทธิ</td><td style="text-align:right">${saleData.total.toLocaleString()}</td></tr>
        </table>
        <div class="ft">ขอบคุณที่ใช้บริการ</div>
      </body></html>
    `)

    iframe.contentWindow?.document.close()
    setTimeout(() => {
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 500)
    }, 300)
  }

  const groupedProducts = () => {
    const cats = categories()
    const prods = products()
    return cats
      .map((cat) => ({
        category: cat,
        products: prods.filter((p) => p.categoryId === cat.id),
      }))
      .filter((g) => g.products.length > 0)
  }

  const canCheckout = () => {
    if (cart().length === 0) return false
    if (needsCustomer() && !customerId()) return false
    if (needsPayment() && received() < total()) return false
    return true
  }

  const currentMethodLabel = () => methods.find((m) => m.value === method())?.label ?? ''

  return (
    <div class={css({ display: 'flex', height: 'calc(100vh - 60px)' })}>
      <div class={css({ flex: 1, overflow: 'auto', p: '16px' })}>
        <div class={css({ mb: '12px', display: 'flex', gap: '8px' })}>
          <input
            placeholder="สแกนบาร์โค้ด หรือค้นหาสินค้า..."
            value={barcode()}
            onInput={(e) => handleBarcodeInput(e.currentTarget.value)}
            class={css({
              flex: 1, px: '12px', py: '10px', borderRadius: '8px',
              border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
              fontSize: '15px',
              _focus: { borderColor: 'accent-border', outline: 'none' },
            })}
          />
        </div>
        <h2 class={css({ mb: '12px', fontSize: '20px' })}>สินค้า</h2>
        <For each={groupedProducts()}>
          {(group) => (
            <div class={css({ mb: '20px' })}>
              <h3 class={css({ fontSize: '14px', color: 'text', mb: '8px', fontWeight: '600' })}>
                {group.category.name}
              </h3>
              <div class={css({ display: 'flex', flexWrap: 'wrap', gap: '8px' })}>
                <For each={group.products}>
                  {(product) => (
                    <button
                      onClick={() => addToCart(product)}
                      class={css({
                        p: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                        border: '1px solid token(colors.border)', bg: 'bg',
                        textAlign: 'left', minW: '120px',
                        _hover: { borderColor: 'accent-border' },
                      })}
                    >
                      <div class={css({ fontWeight: '600', fontSize: '14px', color: 'text-h' })}>
                        {product.name}
                      </div>
                      <div class={css({ fontSize: '13px', color: 'accent', mt: '4px' })}>
                        {product.price.toLocaleString()} บาท
                      </div>
                      <div class={css({ fontSize: '11px', color: 'text' })}>
                        คงเหลือ: {product.stock} {product.unit}
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>

      <div class={css({
        width: '400px', borderLeft: '1px solid token(colors.border)',
        display: 'flex', flexDirection: 'column', bg: 'code-bg',
      })}>
        <div class={css({ flex: 1, overflow: 'auto', p: '16px' })}>
          <h2 class={css({ fontSize: '20px', mb: '12px' })}>ตะกร้า</h2>
          <Show when={cart().length === 0}>
            <p class={css({ color: 'text', fontSize: '14px' })}>ยังไม่มีสินค้า</p>
          </Show>
          <For each={cart()}>
            {(item) => (
              <div class={css({
                display: 'flex', alignItems: 'center', gap: '8px',
                p: '8px', mb: '6px', borderRadius: '6px', bg: 'bg',
                border: '1px solid token(colors.border)',
              })}>
                <div class={css({ flex: 1 })}>
                  <div class={css({ fontSize: '14px', fontWeight: '500' })}>{item.product.name}</div>
                  <div class={css({ fontSize: '12px', color: 'text' })}>
                    {item.product.price.toLocaleString()} × {item.quantity}
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onInput={(e) => updateQty(item.product.id!, Number(e.currentTarget.value))}
                  class={css({
                    width: '50px', textAlign: 'center', px: '4px', py: '4px',
                    borderRadius: '4px', border: '1px solid token(colors.border)',
                    fontSize: '14px', bg: 'bg', color: 'text',
                  })}
                />
                <div class={css({ fontSize: '14px', fontWeight: '600', minW: '60px', textAlign: 'right' })}>
                  {item.total.toLocaleString()}
                </div>
              </div>
            )}
          </For>
        </div>

        <div class={css({ p: '16px', borderTop: '1px solid token(colors.border)', bg: 'bg' })}>
          <Show when={success()}>
            <div class={css({
              p: '10px', mb: '8px', borderRadius: '6px',
              bg: 'green.100', color: 'green.700', fontSize: '14px', fontWeight: '600',
              textAlign: 'center',
            })}>
              บันทึกการขายสำเร็จ!
            </div>
            <button
              onClick={printReceipt}
              class={css({
                width: '100%', mb: '10px', py: '10px', borderRadius: '6px', cursor: 'pointer',
                border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
                fontSize: '14px', fontWeight: '600',
                _hover: { bg: 'code-bg' },
              })}
            >
              🖨️ พิมพ์บิล
            </button>
          </Show>

          <div class={css({ mb: '12px' })}>
            <label class={css({ fontSize: '13px', color: 'text', mb: '4px', display: 'block' })}>
              วิธีการชำระ
            </label>
            <div class={css({ display: 'flex', gap: '6px', flexWrap: 'wrap' })}>
              <For each={methods}>
                {(m) => (
                  <button
                    type="button"
                    onClick={() => { setMethod(m.value); setReceived(0) }}
                    class={css({
                      px: '10px', py: '6px', borderRadius: '6px', cursor: 'pointer',
                      border: '1px solid token(colors.border)',
                      bg: method() === m.value ? 'accent' : 'bg',
                      color: method() === m.value ? 'white' : 'text',
                      fontSize: '13px',
                      _hover: { opacity: 0.85 },
                    })}
                  >
                    {m.label}
                  </button>
                )}
              </For>
            </div>
          </div>

          <Show when={needsCustomer()}>
            <div class={css({ mb: '12px' })}>
              <label class={css({ fontSize: '13px', color: 'text', mb: '4px', display: 'block' })}>
                ลูกค้า (เงินเชื่อ)
              </label>
              <select
                value={customerId()}
                onChange={(e) => setCustomerId(Number(e.currentTarget.value))}
                class={css({
                  width: '100%', px: '10px', py: '8px', borderRadius: '6px',
                  border: '1px solid token(colors.border)', bg: 'bg', color: 'text',
                  fontSize: '14px', boxSizing: 'border-box',
                })}
              >
                <option value={0} disabled>เลือกลูกค้า</option>
                <For each={customers()}>
                  {(c) => <option value={c.id!}>{c.name} ({c.phone})</option>}
                </For>
              </select>
            </div>
          </Show>

          <div class={css({ display: 'flex', justifyContent: 'space-between', mb: '8px', fontSize: '14px' })}>
            <span>รวม</span><span>{subtotal().toLocaleString()}</span>
          </div>
          <div class={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '8px', fontSize: '14px' })}>
            <span>ส่วนลด</span>
            <input
              type="number"
              min={0}
              value={discount() || ''}
              onInput={(e) => setDiscount(Number(e.currentTarget.value))}
              class={css({
                width: '80px', textAlign: 'right', px: '6px', py: '4px',
                borderRadius: '4px', border: '1px solid token(colors.border)',
                fontSize: '14px', bg: 'bg', color: 'text',
              })}
            />
          </div>
          <div class={css({ display: 'flex', justifyContent: 'space-between', mb: '12px', fontSize: '18px', fontWeight: '700' })}>
            <span>สุทธิ</span><span>{total().toLocaleString()}</span>
          </div>

          <Show when={needsPayment()}>
            <div class={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px', fontSize: '14px' })}>
              <span>รับเงิน</span>
              <input
                type="number"
                min={0}
                placeholder="รับเงิน"
                value={received() || ''}
                onInput={(e) => setReceived(Number(e.currentTarget.value))}
                class={css({
                  width: '100px', textAlign: 'right', px: '6px', py: '4px',
                  borderRadius: '4px', border: '1px solid token(colors.border)',
                  fontSize: '14px', bg: 'bg', color: 'text',
                })}
              />
            </div>
            <Show when={received() >= total()}>
              <div class={css({ display: 'flex', justifyContent: 'space-between', mb: '12px', fontSize: '14px', color: 'green.600' })}>
                <span>เงินทอน</span><span>{change().toLocaleString()}</span>
              </div>
            </Show>
          </Show>

          <input
            placeholder="หมายเหตุ (optional)"
            value={note()}
            onInput={(e) => setNote(e.currentTarget.value)}
            class={css({
              width: '100%', mb: '12px', px: '10px', py: '8px',
              borderRadius: '6px', border: '1px solid token(colors.border)',
              fontSize: '14px', bg: 'bg', color: 'text', boxSizing: 'border-box',
            })}
          />

          <button
            onClick={checkout}
            disabled={!canCheckout()}
            class={css({
              width: '100%', py: '12px', borderRadius: '8px', cursor: 'pointer',
              border: 'none', bg: 'accent', color: 'white',
              fontSize: '16px', fontWeight: '600',
              _disabled: { opacity: 0.4, cursor: 'not-allowed' },
              _hover: { opacity: 0.9 },
            })}
          >
            บันทึกการขาย ({currentMethodLabel()})
          </button>
        </div>
      </div>
    </div>
  )
}