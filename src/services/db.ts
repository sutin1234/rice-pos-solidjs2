import Dexie, { type EntityTable } from 'dexie'

export interface Branch {
  id?: number
  name: string
  address: string
  phone: string
}

export interface Coupon {
  id?: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  usageLimit: number
  usedCount: number
  active: number
  branchId: number
}

export interface Category {
  id?: number
  name: string
  description: string
  branchId: number
}

export interface Product {
  id?: number
  name: string
  categoryId: number
  unit: string
  price: number
  cost: number
  stock: number
  barcode: string
  active: number
  lowStockThreshold: number
  branchId: number
}

export interface Customer {
  id?: number
  name: string
  phone: string
  address: string
  branchId: number
}

export interface SaleItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'promptpay' | 'card' | 'credit'

export interface Sale {
  id?: number
  date: Date
  items: SaleItem[]
  subtotal: number
  discount: number
  couponCode: string
  total: number
  paymentMethod: PaymentMethod
  customerId?: number
  note: string
  branchId: number
}

export interface Expense {
  id?: number
  date: Date
  category: string
  description: string
  amount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'promptpay'
  note: string
  branchId: number
}

export interface StockMovement {
  id?: number
  productId: number
  productName: string
  type: 'in' | 'out'
  quantity: number
  stockBefore: number
  stockAfter: number
  note: string
  date: Date
  branchId: number
}

const db = new Dexie('RiceShopPOS') as Dexie & {
  categories: EntityTable<Category, 'id'>
  products: EntityTable<Product, 'id'>
  sales: EntityTable<Sale, 'id'>
  customers: EntityTable<Customer, 'id'>
  expenses: EntityTable<Expense, 'id'>
  stockMovements: EntityTable<StockMovement, 'id'>
  branches: EntityTable<Branch, 'id'>
  coupons: EntityTable<Coupon, 'id'>
}

db.version(1).stores({
  categories: '++id, name',
  products: '++id, name, categoryId, active',
  sales: '++id, date, paymentMethod',
  customers: '++id, name, phone',
})

db.version(2).stores({
  categories: '++id, name',
  products: '++id, name, categoryId, active',
  sales: '++id, date, paymentMethod',
  customers: '++id, name, phone',
  expenses: '++id, date, category',
  stockMovements: '++id, productId, date, type',
})

db.version(3).stores({
  branches: '++id, name',
  categories: '++id, name, branchId',
  products: '++id, name, categoryId, active, branchId',
  sales: '++id, date, paymentMethod, branchId',
  customers: '++id, name, phone, branchId',
  expenses: '++id, date, category, branchId',
  stockMovements: '++id, productId, date, type, branchId',
})

db.version(3).upgrade(async (tx) => {
  const defaultBranchId = 1
  const tableNames = ['categories', 'products', 'sales', 'customers', 'expenses', 'stockMovements'] as const
  for (const name of tableNames) {
    const table = tx.table(name)
    await table.toCollection().modify((obj: any) => {
      if (obj.branchId === undefined) {
        obj.branchId = defaultBranchId
      }
    })
  }
  await tx.table('branches').add({ name: 'สาขาหลัก', address: '', phone: '' })
})

db.version(4).stores({
  coupons: '++id, code, active, branchId',
})

db.version(4).upgrade(async (tx) => {
  await tx.table('sales').toCollection().modify((obj: any) => {
    if (obj.couponCode === undefined) {
      obj.couponCode = ''
    }
  })
})

export { db }