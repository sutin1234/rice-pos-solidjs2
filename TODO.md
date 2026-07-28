# Todo

## Completed

- [x] Scaffold directory tree (components/, hooks/, layouts/, pages/, etc.)
- [x] Install TypeScript 7 + configure build (`tsc -b` passes)
- [x] Set up Vitest + jsdom + `@solidjs/testing-library` (Counter test passing)
- [x] Configure PandaCSS with theme tokens + dark mode semantic tokens
- [x] Wire `@solidjs/router` with lazy-loaded Home / About / NotFound
- [x] Create `MainLayout` with nav + outlet
- [x] Extract `useCounter` hook + global `counterStore`
- [x] Create typed API service layer (`GET/POST/PUT/DELETE`)
- [x] Add shared types (`ApiResponse`, `PaginatedResponse`) + env types
- [x] Add utility functions (`cn`, `clamp`, `formatCount`)
- [x] Set up ESLint (`eslint-plugin-solid`) + Prettier
- [x] Generate `styled-system/` via `panda codegen`
- [x] Scan for frontend security issues (CSP missing noted)
- [x] Add ErrorBoundary using `createErrorBoundary`
- [x] Create AGENTS.md with project conventions
- [x] Design POS requirements & phases (`docs/pos-requirements.md`)
- [x] Unit tests — utils (cn, clamp, formatCount), api (mock fetch), useCounter (component), ErrorBoundary, Counter (existing)

## Phase 1 — Core POS ✅

- [x] Install Dexie.js (`pnpm add dexie`)
- [x] Create IndexedDB schema + database class (`src/services/db.ts`)
- [x] Category CRUD page (`/pos/categories`)
- [x] Product CRUD page (`/pos/products`)
- [x] POS transaction screen — product grid → cart → รับเงิน → เงินทอน (`/pos`)
- [x] Cash payment + stock deduction
- [x] Sales history list (`/pos/sales`)
- [x] POS routes + nav links

## Phase 2 — Additional Payments + Customers ✅

- [x] Customer CRUD page (`/pos/customers`)
- [x] Payment method selector on POS — เงินสด, โอน, พร้อมเพย์, บัตร, เงินเชื่อ
- [x] Credit flow — select customer, record debt
- [x] Customer debt report page (`/pos/debts`)

## Phase 3 — Stock Management ✅

- [x] Stock adjustment UI (เพิ่ม/ลด)
- [x] Low-stock threshold per product + warning badge
- [x] Stock movement log

## Phase 4 — Reports ✅

- [x] Daily sales report
- [x] Monthly/Yearly sales report
- [x] Sales by category report
- [x] Top selling products
- [x] Export report to CSV

## Phase 5 — Accounting

- [ ] Expense CRUD + categories
- [ ] Profit & Loss statement
- [ ] Dashboard overview (today sales, pending debts, low stock)

## General

- [ ] Add dark mode toggle
- [ ] Add Content-Security-Policy meta tag to `index.html`
- [x] Write tests for components (23 test files, 87 tests — all passing)
- [ ] Add GitHub Actions CI workflow
