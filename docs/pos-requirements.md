# POS System — ร้านข้าวสาร

## Tech Stack
- **Frontend**: SolidJS v2 + PandaCSS (existing project)
- **Data**: IndexedDB via Dexie.js (idb wrapper)
- **Multi-branch** — browser-based, 1 DB หลายสาขา ไม่ต้องมี backend

---

## Entities

### Branches (สาขา)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| name | string | เช่น สาขาหลัก, สาขาบางนา |
| address | string | ที่อยู่สาขา |
| phone | string | เบอร์โทรสาขา |

### Categories (ประเภทสินค้า)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| name | string | เช่น ข้าวหอมมะลิ, ข้าวเหนียว, ข้าวกล้อง |
| description | string | optional |
| branchId | number | FK → Branches |

### Products (สินค้า)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| name | string | ชื่อสินค้า |
| categoryId | number | FK → Categories |
| unit | string | หน่วย: กิโล, ถุง 1kg, ถุง 5kg, กระสอบ |
| price | number | ราคาขายต่อหน่วย |
| cost | number | ต้นทุนต่อหน่วย |
| stock | number | คงเหลือ |
| barcode | string | optional |
| active | boolean | soft delete |
| lowStockThreshold | number | จำนวนเตือนเมื่อสต็อกต่ำ |
| branchId | number | FK → Branches |

### Customers (ลูกค้า)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| name | string | |
| phone | string | |
| address | string | optional |
| branchId | number | FK → Branches |

### Sales (ใบเสร็จ)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| date | Date | |
| items | SaleItem[] | รายการสินค้า |
| subtotal | number | |
| discount | number | |
| couponCode | string | รหัสคูปองที่ใช้ (ถ้ามี) |
| total | number | |
| paymentMethod | enum | cash, bank_transfer, promptpay, card, credit |
| customerId | number | nullable — เฉพาะเงินเชื่อ |
| note | string | optional |
| branchId | number | FK → Branches |

### SaleItem (รายการในใบเสร็จ)
| Field | Type |
|-------|------|
| productId | number |
| productName | string |
| quantity | number |
| unitPrice | number |
| total | number |

### Expenses (รายจ่าย)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| date | Date | |
| category | string | ค่าเช่า, ค่าน้ำไฟ, ค่าขนส่ง, เงินเดือน, ฯลฯ |
| description | string | |
| amount | number | |
| paymentMethod | enum | cash, bank_transfer, promptpay |
| note | string | optional |
| branchId | number | FK → Branches |

### StockMovements (ประวัติสต็อก)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| productId | number | FK → Products |
| productName | string | |
| type | enum | in (เพิ่ม), out (ลด) |
| quantity | number | |
| stockBefore | number | |
| stockAfter | number | |
| note | string | |
| date | Date | |
| branchId | number | FK → Branches |

### Coupons (คูปองส่วนลด)
| Field | Type | Notes |
|-------|------|-------|
| id | number (auto) | |
| code | string | รหัสคูปอง เช่น SALE10 |
| type | enum | percentage (%), fixed (จำนวนเงิน) |
| value | number | ลด % หรือจำนวนเงิน |
| minPurchase | number | ยอดซื้อขั้นต่ำ |
| usageLimit | number | จำกัดการใช้ (0 = ไม่จำกัด) |
| usedCount | number | จำนวนครั้งที่ใช้แล้ว |
| active | boolean | เปิด/ปิดการใช้งาน |
| branchId | number | FK → Branches |

---

## Payment Methods

| Method | Flow |
|--------|------|
| **Cash** | รับเงิน → คำนวณเงินทอน |
| **Bank Transfer** | เลือกธนาคารที่โอน → บันทึก |
| **PromptPay** | แสดง QR code หรือเลขพร้อมเพย์ |
| **Credit/Debit Card** | บันทึกยอด |
| **Credit (เงินเชื่อ)** | เลือกลูกค้า → เพิ่มยอดค้างชำระ |

---

## Reports

| Report | Output | Frequency |
|--------|--------|-----------|
| รายงานขายรายวัน | จำนวนบิล, ยอดขาย, วิธีชำระ | daily |
| รายงานขายรายเดือน | สรุปยอดขายตามประเภทสินค้า, top products | monthly |
| รายงานขายรายปี | เปรียบเทียบแต่ละเดือน | yearly |
| รายงานแยกตามประเภทข้าว | ยอดขาย/กำไรแยกตามหมวด | on demand |
| รายงานลูกหนี้ | ยอดค้างชำระแยกตามลูกค้า | on demand |
| งบกำไรขาดทุน | รายได้ - ต้นทุน - ค่าใช้จ่าย | monthly |

---

## Phases

### Phase 1 — Core POS
- Product CRUD + Category CRUD
- POS transaction screen
- Cash payment (รับเงิน → เงินทอน)
- Sales history list
- Dexie.js integration

### Phase 2 — Additional Payments + Customers
- Bank Transfer / PromptPay / Card payment methods
- Customer CRUD
- Credit payment + debt tracking
- Customer debt report

### Phase 3 — Stock Management
- Stock adjustment (เพิ่ม/ลดสต็อก)
- Low-stock threshold & warning
- Stock movement log

### Phase 4 — Reports
- Daily sales report
- Monthly/Yearly reports
- Sales by category
- Top selling products
- Export to CSV

### Phase 5 — Accounting ✅
- Expense CRUD + categories
- Profit & Loss statement
- Dashboard overview (today sales, pending debts, low stock)

### Phase 6 — Extra Features ✅
- Dark mode toggle (button in nav bar, saves to localStorage)
- Content-Security-Policy meta tag
- GitHub Actions CI (lint + test on push)
- Print receipt after sale (80mm thermal printer format)
- Barcode scan input (scans barcode or searches by name)
- Card payment method

### Phase 7 — Multi-Branch ✅
- Branches CRUD (สร้างสาขาหลักอัตโนมัติ)
- branchId field ในทุก Entity
- DB version 3 migration + data upgrade
- Branch selector dropdown ใน nav bar
- ทุกหน้าถูกกรองตามสาขาที่เลือก

### Phase 8 — Coupons & Seed Data ✅
- Coupon CRUD (code, type %/fixed, value, min purchase, usage limit)
- Apply coupon on POS checkout with validation (active, branch, usage, min purchase)
- Coupon discount stacks with manual discount
- Coupon usage count increments on checkout
- Auto-seed categories (6), products (27), customers (6) on first run
