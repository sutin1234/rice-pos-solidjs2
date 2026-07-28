import Dexie, { type EntityTable } from 'dexie'

export interface Category {
  id?: number
  name: string
  description: string
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
}

export interface Customer {
  id?: number
  name: string
  phone: string
  address: string
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
  total: number
  paymentMethod: PaymentMethod
  customerId?: number
  note: string
}

export interface Expense {
  id?: number
  date: Date
  category: string
  description: string
  amount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'promptpay'
  note: string
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
}

const db = new Dexie('RiceShopPOS') as Dexie & {
  categories: EntityTable<Category, 'id'>
  products: EntityTable<Product, 'id'>
  sales: EntityTable<Sale, 'id'>
  customers: EntityTable<Customer, 'id'>
  expenses: EntityTable<Expense, 'id'>
  stockMovements: EntityTable<StockMovement, 'id'>
}

db.version(1).stores({
  categories: '++id, name',
  products: '++id, name, categoryId, active',
  sales: '++id, date, paymentMethod',
  customers: '++id, name, phone',
  expenses: '++id, date, category',
})

db.version(2).stores({
  categories: '++id, name',
  products: '++id, name, categoryId, active',
  sales: '++id, date, paymentMethod',
  customers: '++id, name, phone',
  expenses: '++id, date, category',
  stockMovements: '++id, productId, date, type',
})

export { db }
