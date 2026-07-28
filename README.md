# ระบบขายหน้าร้าน (POS) — ร้านขายของชำ

ระบบจัดการหน้าร้านสำหรับร้านขายของชำ ขนมขบเคี้ยว และวัตถุดิบ ทำงานใน browser มีฟีเจอร์ครบตั้งแต่ขายหน้าร้าน, จัดการสต็อก, ลูกหนี้, ไปจนถึงรายงาน

## เริ่มต้นใช้งาน

```bash
pnpm install        # ติดตั้ง dependencies
pnpm prepare        # สร้าง styled-system (ต้องรันก่อน dev/build)
pnpm dev            # เปิด dev server ที่ http://localhost:5173
```

## ฟีเจอร์หลัก

| ฟีเจอร์ | เส้นทาง |
|---------|---------|
| ขายหน้าร้าน (POS) | `/pos` |
| จัดการสินค้า | `/pos/products` |
| จัดการประเภทสินค้า | `/pos/categories` |
| ประวัติการขาย | `/pos/sales` |
| ลูกค้า | `/pos/customers` |
| ลูกหนี้คงค้าง | `/pos/debts` |
| ปรับสต็อก | `/pos/stock-adjust` |
| รายงาน (รายวัน/เดือน/ปี/หมวดหมู่/สินค้าขายดี) | `/pos/reports` |
| รายจ่าย (CRUD) | `/pos/expenses` |
| งบกำไรขาดทุน | `/pos/profit-loss` |
| หน้าหลัก Dashboard | `/pos/dashboard` |

## สคริปต์

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `pnpm dev` | เปิด dev server |
| `pnpm build` | build เพื่อ production (`tsc -b && vite build`) |
| `pnpm test` | รัน tests (Vitest) |
| `pnpm test:watch` | รัน tests แบบ watch |
| `pnpm lint` | ตรวจสอบ code quality (ESLint) |
| `pnpm format` | จัดรูปแบบโค้ด (Prettier) |
| `pnpm prepare` | สร้าง styled-system (หลังติดตั้ง dependencies) |
| `pnpm clean` | ลบ `dist/` และ `styled-system/` |

## เทคโนโลยี

- [SolidJS](https://solidjs.com) — UI framework
- [TypeScript](https://typescriptlang.org) — ภาษา
- [PandaCSS](https://panda-css.com) — styling (`css()` API)
- [Dexie.js](https://dexie.org) — IndexedDB สำหรับเก็บข้อมูลใน browser
- [Vitest](https://vitest.dev) — testing

## โครงสร้างโปรเจค

```
src/
├── App.tsx              # Root component + ErrorBoundary
├── index.tsx            # Entry point
├── components/          # UI components
│   └── ui/              # Reusable components
├── layouts/             # Layouts (MainLayout)
├── pages/               # Page components
│   └── pos/             # POS-related pages
├── routes/              # Route definitions
├── services/            # API layer + Dexie DB
├── stores/              # Global state (signals)
├── types/               # TypeScript types
└── test/                # Test setup
```

## หมายเหตุ

- ข้อมูลทั้งหมดเก็บใน **IndexedDB** ใน browser ไม่ต้องมี server
- ใช้ `fake-indexeddb` ใน test environment
- รองรับ dark mode ผ่าน semantic tokens
