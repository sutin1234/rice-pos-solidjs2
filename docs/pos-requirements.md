# POS System — ร้านข้าวสาร

## Tech Stack
- **Frontend**: SolidJS v2 + PandaCSS (existing project)
- **Data**: IndexedDB via Dexie.js (idb wrapper)
- **Single machine, single branch** — no backend needed

---

## Entities

### Categories (ประเภทสินค้า)
| Field | Type | Notes |
|-------|------|-------|
| id | string (auto) | |
| name | string | เช่น ข้าวหอมมะลิ, ข้าวเหนียว, ข้าวกล้อง |
| description | string | optional |

### Products (สินค้า)
| Field | Type | Notes |
|-------|------|-------|
| id | string (auto) | |
| name | string | ชื่อสินค้า |
| categoryId | string | FK → Categories |
| unit | string | หน่วย: กิโล, ถุง 1kg, ถุง 5kg, กระสอบ |
| price | number | ราคาขายต่อหน่วย |
| cost | number | ต้นทุนต่อหน่วย (สำหรับคำนวณกำไร) |
| stock | number | คงเหลือ |
| barcode | string | optional |
| active | boolean | soft delete |

### Customers (ลูกค้า)
| Field | Type | Notes |
|-------|------|-------|
| id | string (auto) | |
| name | string | |
| phone | string | |
| address | string | optional |

### Sales (ใบเสร็จ)
| Field | Type | Notes |
|-------|------|-------|
| id | string (auto) | |
| date | Date | |
| items | SaleItem[] | รายการสินค้า |
| subtotal | number | |
| discount | number | |
| total | number | |
| paymentMethod | enum | cash, bank_transfer, promptpay, card, credit |
| customerId | string | nullable — เฉพาะเงินเชื่อ |
| note | string | optional |

### SaleItem (รายการในใบเสร็จ)
| Field | Type |
|-------|------|
| productId | string |
| productName | string |
| quantity | number |
| unitPrice | number |
| total | number |

### Expenses (รายจ่าย)
| Field | Type | Notes |
|-------|------|-------|
| id | string (auto) | |
| date | Date | |
| category | string | ค่าเช่า, ค่าน้ำไฟ, ค่าขนส่ง, เงินเดือน, ฯลฯ |
| description | string | |
| amount | number | |
| paymentMethod | enum | cash, bank_transfer, promptpay |
| note | string | optional |

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
