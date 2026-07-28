import { createSignal, For, Show } from 'solid-js'
import { css } from '@styled-system/css'
import { db, type Product, type Category, type Customer, type PaymentMethod } from '@/services/db'

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

  async function load() {
    setProducts(await db.products.where('active').equals(1).toArray())
    setCategories(await db.categories.toArray())
    setCustomers(await db.customers.toArray())
  }
  load()

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

    await db.sales.add({
      date: new Date(),
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
    })
    for (const item of cart()) {
      await db.products.update(item.product.id!, {
        stock: item.product.stock - item.quantity,
      })
    }
    setCart([])
    setDiscount(0)
    setReceived(0)
    setNote('')
    setMethod('cash')
    setCustomerId(0)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
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
              p: '10px', mb: '12px', borderRadius: '6px',
              bg: 'green.100', color: 'green.700', fontSize: '14px', fontWeight: '600',
              textAlign: 'center',
            })}>
              บันทึกการขายสำเร็จ!
            </div>
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
