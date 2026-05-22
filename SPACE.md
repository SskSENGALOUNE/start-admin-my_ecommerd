# 🗂️ Project Space — My eCommerce

> โครงสร้าง folder และ file ทั้งหมดของระบบ  
> **Stack:** Bun · Elysia · React 19 · TanStack Router · Drizzle ORM  
> **Pattern:** Modular Monolith — แต่ละ Module มี Backend + Frontend อยู่ด้วยกัน

---

## 📋 สารบัญ

- [Module Overview](#module-overview)
- [Full Tree](#full-tree)
- [Module Details](#module-details)
  - [✅ auth](#-auth--มีอยู่แล้ว)
  - [✅ users](#-users--มีอยู่แล้ว)
  - [✅ roles](#-roles--มีอยู่แล้ว)
  - [✅ audit](#-audit--มีอยู่แล้ว)
  - [✅ dashboard](#-dashboard--มีอยู่แล้ว)
  - [🆕 banner](#-banner--ใหม่)
  - [🆕 categories](#-categories--ใหม่)
  - [🆕 products](#-products--ใหม่)
  - [🆕 coupons](#-coupons--ใหม่)
  - [🆕 customers](#-customers--ใหม่)
  - [🆕 orders](#-orders--ใหม่)
  - [🆕 shipments](#-shipments--ใหม่)
  - [🆕 transactions](#-transactions--ใหม่)
- [Platform / Infrastructure](#platform--infrastructure)
- [Shared](#shared)
- [DB Schema Files](#db-schema-files)
- [API Routes Map](#api-routes-map)
- [Frontend Routes Map](#frontend-routes-map)
- [Build Order](#build-order)

---

## 🧩 Module Overview

| Module         | สถานะ | Backend | Frontend | หน้าที่                        |
| -------------- | ----- | ------- | -------- | ------------------------------ |
| `auth`         | ✅    | ✅      | ✅       | Login, Session, Profile        |
| `users`        | ✅    | ✅      | ✅       | Admin User Management          |
| `roles`        | ✅    | ✅      | ✅       | RBAC Roles & Permissions       |
| `audit`        | ✅    | ✅      | ✅       | Activity Log                   |
| `dashboard`    | ✅    | -       | ✅       | Overview & Analytics           |
| `banner`       | 🆕    | 🆕      | 🆕       | Slide Banner จัดการ            |
| `categories`   | ✅    | ✅      | ✅       | หมวดหมู่สินค้า                 |
| `products`     | ✅    | ✅      | ✅       | สินค้า + Variant + รูป         |
| `coupons`      | 🆕    | 🆕      | 🆕       | Coupon Code ส่วนลด             |
| `customers`    | 🆕    | 🆕      | 🆕       | จัดการลูกค้า (Admin side)      |
| `orders`       | 🆕    | 🆕      | 🆕       | คำสั่งซื้อ + สถานะ             |
| `shipments`    | 🆕    | 🆕      | 🆕       | Tracking พัสดุ                 |
| `transactions` | 🆕    | 🆕      | 🆕       | การชำระเงิน + verify slip      |

---

## 🌳 Full Tree

```
src/
│
├── app/                              # Application Shell
│   ├── layout/
│   │   ├── AppSidebar.tsx            # Sidebar navigation
│   │   ├── AuthLayout.tsx            # Layout หน้า Login
│   │   ├── AuthenticatedLayout.tsx   # Layout หลัง Login
│   │   ├── Header.tsx
│   │   ├── NavUser.tsx
│   │   ├── RootLayout.tsx
│   │   ├── TopNav.tsx
│   │   └── data/
│   │       └── sidebar-data.tsx      # ← เพิ่ม menu items ตรงนี้
│   ├── providers/
│   │   ├── QueryClientProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── LayoutProvider.tsx
│   ├── error/
│   │   ├── NotFound.tsx
│   │   ├── Forbidden.tsx
│   │   └── ErrorBoundary.tsx
│   └── router.tsx                    # ← เพิ่ม routes ตรงนี้
│
├── modules/                          # Feature Modules
│   │
│   ├── auth/                         # ✅ EXISTS
│   │   ├── api/
│   │   │   └── index.ts              # register auth routes
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   ├── repo/
│   │   │   └── services/
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts         # better-auth client
│   │       │   └── queries.ts
│   │       ├── model/
│   │       │   └── useAuthState.ts
│   │       ├── pages/
│   │       │   └── LoginPage.tsx
│   │       └── ui/
│   │           ├── SignInForm.tsx
│   │           └── ProfileDropdown.tsx
│   │
│   ├── users/                        # ✅ EXISTS
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   ├── repo/
│   │   │   └── service/
│   │   └── presentation/
│   │       ├── api/
│   │       ├── pages/
│   │       │   ├── UsersPage.tsx
│   │       │   └── UserDetailPage.tsx
│   │       └── ui/
│   │
│   ├── roles/                        # ✅ EXISTS
│   │   ├── api/
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   ├── repo/
│   │   │   ├── scripts/
│   │   │   │   └── sync.ts          # bun run rbac:sync
│   │   │   └── services/
│   │   └── presentation/
│   │
│   ├── audit/                        # ✅ EXISTS
│   │   ├── api/
│   │   ├── domain/
│   │   └── presentation/
│   │       ├── pages/
│   │       │   ├── AuditPage.tsx
│   │       │   └── AuditDetailPage.tsx
│   │       └── ui/
│   │
│   ├── dashboard/                    # ✅ EXISTS
│   │   └── presentation/
│   │       └── pages/
│   │           └── DashboardPage.tsx
│   │
│   ├── upload/                       # ✅ EXISTS
│   │   └── (file upload module)
│   │
│   ├── banner/                       # 🆕 ใหม่
│   │   ├── api/
│   │   │   └── index.ts              # GET /api/banners, POST, PATCH, DELETE
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   │   └── banner.contract.ts
│   │   │   ├── repo/
│   │   │   │   ├── query.ts          # list banners
│   │   │   │   ├── get-by-id.ts
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── delete.ts
│   │   │   └── services/
│   │   │       └── banner.service.ts
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── queries.ts
│   │       ├── pages/
│   │       │   └── BannerPage.tsx    # table + drag-to-reorder
│   │       └── ui/
│   │           ├── BannerTable.tsx
│   │           ├── BannerForm.tsx    # create/edit modal
│   │           └── BannerPreview.tsx
│   │
│   ├── categories/                   # 🆕 ใหม่
│   │   ├── api/
│   │   │   └── index.ts              # GET /api/categories, POST, PATCH, DELETE
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   │   └── category.contract.ts
│   │   │   ├── repo/
│   │   │   │   ├── query.ts
│   │   │   │   ├── get-by-id.ts
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── delete.ts
│   │   │   └── services/
│   │   │       └── category.service.ts
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── queries.ts
│   │       ├── pages/
│   │       │   └── CategoriesPage.tsx
│   │       └── ui/
│   │           ├── CategoryTable.tsx
│   │           └── CategoryForm.tsx
│   │
│   ├── products/                     # 🆕 ใหม่ (ใหญ่สุด)
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   │   ├── product.contract.ts
│   │   │   │   ├── variant.contract.ts
│   │   │   │   └── color.contract.ts
│   │   │   ├── repo/
│   │   │   │   ├── product/
│   │   │   │   │   ├── query.ts
│   │   │   │   │   ├── get-by-id.ts
│   │   │   │   │   ├── create.ts
│   │   │   │   │   ├── update.ts
│   │   │   │   │   └── delete.ts
│   │   │   │   ├── variant/
│   │   │   │   │   ├── create.ts
│   │   │   │   │   ├── update.ts
│   │   │   │   │   └── delete.ts
│   │   │   │   └── color/
│   │   │   │       └── query.ts
│   │   │   └── services/
│   │   │       ├── product.service.ts
│   │   │       └── variant.service.ts
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── queries.ts
│   │       ├── pages/
│   │       │   ├── ProductsPage.tsx       # list + filter
│   │       │   ├── ProductCreatePage.tsx  # form สร้าง
│   │       │   └── ProductDetailPage.tsx  # แก้ไข + จัดการ variant
│   │       └── ui/
│   │           ├── ProductTable.tsx
│   │           ├── ProductForm.tsx
│   │           ├── ProductImageUpload.tsx  # upload หลายรูป + drag sort
│   │           ├── VariantTable.tsx
│   │           ├── VariantForm.tsx         # เพิ่ม/แก้ variant
│   │           ├── ColorBadge.tsx
│   │           └── StockBadge.tsx
│   │
│   ├── coupons/                      # 🆕 ใหม่
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   │   └── coupon.contract.ts
│   │   │   ├── repo/
│   │   │   │   ├── query.ts
│   │   │   │   ├── get-by-id.ts
│   │   │   │   ├── validate.ts         # validate coupon code
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── delete.ts
│   │   │   └── services/
│   │   │       └── coupon.service.ts
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── queries.ts
│   │       ├── pages/
│   │       │   └── CouponsPage.tsx
│   │       └── ui/
│   │           ├── CouponTable.tsx
│   │           ├── CouponForm.tsx
│   │           └── CouponStatusBadge.tsx
│   │
│   ├── customers/                    # 🆕 ใหม่ (Admin จัดการ Customer)
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   │   └── customer.contract.ts
│   │   │   ├── repo/
│   │   │   │   ├── query.ts
│   │   │   │   ├── get-by-id.ts
│   │   │   │   ├── ban.ts
│   │   │   │   └── unban.ts
│   │   │   └── services/
│   │   │       └── customer.service.ts
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── queries.ts
│   │       ├── pages/
│   │       │   ├── CustomersPage.tsx
│   │       │   └── CustomerDetailPage.tsx  # ประวัติ order + ที่อยู่
│   │       └── ui/
│   │           ├── CustomerTable.tsx
│   │           └── CustomerStatusBadge.tsx
│   │
│   ├── orders/                       # 🆕 ใหม่ (หัวใจของระบบ)
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   │   └── order.contract.ts
│   │   │   ├── repo/
│   │   │   │   ├── query.ts
│   │   │   │   ├── get-by-id.ts
│   │   │   │   ├── update-status.ts
│   │   │   │   └── cancel.ts
│   │   │   └── services/
│   │   │       ├── order.service.ts
│   │   │       └── order-number.service.ts  # generate ORD-YYYYMMDD-XXXX
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── queries.ts
│   │       ├── pages/
│   │       │   ├── OrdersPage.tsx          # list + filter by status
│   │       │   └── OrderDetailPage.tsx     # รายละเอียด + verify + timeline
│   │       └── ui/
│   │           ├── OrderTable.tsx
│   │           ├── OrderStatusBadge.tsx
│   │           ├── OrderStatusFlow.tsx     # timeline แสดง flow
│   │           ├── OrderItemsTable.tsx
│   │           └── OrderFilter.tsx         # filter: status, date, customer
│   │
│   ├── shipments/                    # 🆕 ใหม่
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── contracts/
│   │   │   │   └── shipment.contract.ts
│   │   │   ├── repo/
│   │   │   │   ├── get-by-order.ts
│   │   │   │   ├── create.ts
│   │   │   │   └── update-tracking.ts
│   │   │   └── services/
│   │   │       └── shipment.service.ts
│   │   └── presentation/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── queries.ts
│   │       └── ui/                   # UI อยู่ใน OrderDetailPage
│   │           ├── ShipmentCard.tsx       # แสดงสถานะ + tracking
│   │           └── TrackingForm.tsx       # Admin กรอก tracking number
│   │
│   └── transactions/                 # 🆕 ใหม่
│       ├── api/
│       │   └── index.ts
│       ├── domain/
│       │   ├── contracts/
│       │   │   └── transaction.contract.ts
│       │   ├── repo/
│       │   │   ├── query.ts
│       │   │   ├── get-by-order.ts
│       │   │   └── verify.ts           # Admin verify slip
│       │   └── services/
│       │       └── transaction.service.ts
│       └── presentation/
│           ├── api/
│           │   ├── client.ts
│           │   └── queries.ts
│           ├── pages/
│           │   └── TransactionsPage.tsx  # list รายการโอน + verify
│           └── ui/
│               ├── TransactionTable.tsx
│               ├── TransactionStatusBadge.tsx
│               ├── SlipViewer.tsx         # ดูรูปสลิปที่ลูกค้าแนบ
│               └── VerifyDialog.tsx       # Admin กด confirm/reject
│
├── server/                           # Backend Entry Points
│   ├── api/
│   │   └── rest/
│   │       └── index.ts              # ← register ทุก module route ตรงนี้
│   ├── platform/
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   ├── schema/               # ← เพิ่ม schema files ตรงนี้
│   │   │   │   ├── auth.ts           # ✅ users, sessions, accounts
│   │   │   │   ├── rbac.ts           # ✅ roles, permissions
│   │   │   │   ├── audit.ts          # ✅ audit_logs
│   │   │   │   ├── outbox.ts         # ✅ outbox pattern
│   │   │   │   ├── ecommerce.ts      # 🆕 ทุก table ของ ecommerce
│   │   │   │   └── index.ts          # export ทั้งหมด
│   │   │   └── migrations/           # auto-generated by drizzle-kit
│   │   ├── http/
│   │   │   ├── server.ts
│   │   │   ├── context.ts
│   │   │   └── middleware/
│   │   └── observability/
│   │       └── logger.ts
│   ├── scripts/
│   │   ├── seed-admin.ts             # ✅ seed admin user
│   │   └── seed-colors.ts            # 🆕 seed master colors (RED,GREEN,BLUE…)
│   ├── shared/
│   │   ├── contracts/
│   │   └── outbox/
│   ├── utils/
│   │   ├── s3-client.ts              # S3/MinIO
│   │   ├── presign-upload.ts
│   │   └── multipart-upload.ts
│   ├── index.ts
│   ├── main.ts
│   └── worker.ts
│
├── shared/                           # Shared Frontend Utilities
│   ├── ui/
│   │   ├── QueryState.tsx            # loading/error state
│   │   ├── RowActions.tsx            # table row actions
│   │   ├── SimpleSelect.tsx
│   │   ├── InfiniteCombobox.tsx
│   │   ├── PresignedImageUploadTrigger.tsx
│   │   └── AppImage.tsx
│   ├── lib/
│   │   ├── fetcher.ts
│   │   ├── utils.ts
│   │   ├── date-time.ts
│   │   └── upload-image-to-key.ts
│   ├── hooks/
│   │   └── useDisclosure.ts
│   ├── contracts/
│   │   ├── base.ts                   # pagination, filter base types
│   │   └── query-helpers.ts
│   ├── errors.ts
│   └── types.ts
│
└── assets/
    └── Noto_Sans_Lao_Looped/         # Lao fonts
```

---

## 📦 Module Details

---

### ✅ `auth` — มีอยู่แล้ว

**หน้าที่:** Login, Session, Profile

| Layer        | Files                                   |
| ------------ | --------------------------------------- |
| API Routes   | `POST /api/auth/sign-in`, `sign-out`, `session` |
| Presentation | `LoginPage`, `SignInForm`, `ProfileDropdown` |

---

### ✅ `users` — มีอยู่แล้ว

**หน้าที่:** จัดการ Admin User (CRUD, ban/unban)

| Layer        | Files                                           |
| ------------ | ----------------------------------------------- |
| API Routes   | `GET /api/users`, `POST`, `PUT/:id`, `DELETE/:id` |
| Presentation | `UsersPage`, `UserDetailPage`                   |

---

### ✅ `roles` — มีอยู่แล้ว

**หน้าที่:** RBAC — Role & Permission management

---

### ✅ `audit` — มีอยู่แล้ว

**หน้าที่:** บันทึก activity ของ Admin ทุกการกระทำ

---

### ✅ `dashboard` — มีอยู่แล้ว

**หน้าที่:** หน้าแรก Overview  
> 🆕 จะ update ให้แสดง: ยอดขาย, order ใหม่, สินค้าใกล้หมด, transaction รอ verify

---

### 🆕 `banner` — ใหม่

**หน้าที่:** จัดการ Slide Banner หน้าร้าน

**API:**
```
GET    /api/banners          list (+ inactive)
POST   /api/banners          create + upload รูป
PATCH  /api/banners/:id      update
PATCH  /api/banners/:id/order  เปลี่ยนลำดับ
DELETE /api/banners/:id      soft delete
```

**หน้า:**
- `BannerPage` — ตาราง banner + drag-to-reorder + toggle active

---

### 🆕 `categories` — ใหม่

**หน้าที่:** หมวดหมู่สินค้า

**API:**
```
GET    /api/categories       list all
POST   /api/categories       create
PATCH  /api/categories/:id   update
DELETE /api/categories/:id   soft delete
```

**หน้า:**
- `CategoriesPage` — ตาราง + inline edit

---

### 🆕 `products` — ใหม่

**หน้าที่:** จัดการสินค้า + Variant + รูปภาพ + Stock

**API:**
```
GET    /api/products              list + filter (category, status, search)
GET    /api/products/:id          detail + variants + images
POST   /api/products              create
PATCH  /api/products/:id          update
DELETE /api/products/:id          soft delete

POST   /api/products/:id/images   upload รูป
DELETE /api/products/:id/images/:imageId

GET    /api/products/:id/variants        list variants
POST   /api/products/:id/variants        create variant
PATCH  /api/products/:id/variants/:vid   update
DELETE /api/products/:id/variants/:vid   soft delete

GET    /api/colors               list master colors
```

**หน้า:**
- `ProductsPage` — list + filter + search
- `ProductCreatePage` — form สร้างสินค้า + upload รูป
- `ProductDetailPage` — แก้ไข + จัดการ variant ทั้งหมด

---

### 🆕 `coupons` — ใหม่

**หน้าที่:** สร้างและจัดการ Coupon Code

**API:**
```
GET    /api/coupons            list
POST   /api/coupons            create
PATCH  /api/coupons/:id        update
DELETE /api/coupons/:id        soft delete
POST   /api/coupons/validate   validate code (ใช้ตอน checkout)
```

**หน้า:**
- `CouponsPage` — ตาราง + แสดง usage count / limit / วันหมดอายุ

---

### 🆕 `customers` — ใหม่

**หน้าที่:** Admin ดู/จัดการ Customer

**API:**
```
GET    /api/customers            list + search
GET    /api/customers/:id        detail + orders + addresses
POST   /api/customers/:id/ban    ban
POST   /api/customers/:id/unban  unban
```

**หน้า:**
- `CustomersPage` — list + search + status
- `CustomerDetailPage` — profile + ประวัติ order + ที่อยู่ทั้งหมด

---

### 🆕 `orders` — ใหม่

**หน้าที่:** จัดการคำสั่งซื้อ + เปลี่ยนสถานะ

**API:**
```
GET    /api/orders               list + filter (status, date, customer)
GET    /api/orders/:id           detail + items + transaction + shipment
PATCH  /api/orders/:id/status    update status
POST   /api/orders/:id/cancel    cancel order
```

**หน้า:**
- `OrdersPage` — ตาราง + filter tab (PENDING, CONFIRMED, SHIPPED…)
- `OrderDetailPage` — รายละเอียดทุกอย่าง + timeline + actions

---

### 🆕 `shipments` — ใหม่

**หน้าที่:** Admin กรอก Tracking Number + ติดตามพัสดุ

**API:**
```
GET    /api/shipments/:orderId      ดู shipment ของ order
POST   /api/shipments               สร้าง shipment (ตอน PROCESSING)
PATCH  /api/shipments/:id/tracking  กรอก tracking number → SHIPPED
PATCH  /api/shipments/:id/delivered ยืนยันส่งถึง → DELIVERED
```

**UI:** อยู่ใน `OrderDetailPage` ไม่มีหน้าแยก
- `ShipmentCard` — แสดง tracking + สถานะ
- `TrackingForm` — form กรอก tracking number

---

### 🆕 `transactions` — ใหม่

**หน้าที่:** ดูการชำระเงิน + verify สลิป (QR) + จัดการ COD

**API:**
```
GET    /api/transactions              list + filter (status, method, date)
GET    /api/transactions/:id          detail + slip
GET    /api/transactions/order/:orderId
PATCH  /api/transactions/:id/verify   Admin verify → COMPLETED
PATCH  /api/transactions/:id/reject   Admin reject → FAILED
```

**หน้า:**
- `TransactionsPage` — list รอ verify + ประวัติ
- **UI อยู่ใน `OrderDetailPage`** ด้วย:
  - `SlipViewer` — ดูรูปสลิป
  - `VerifyDialog` — confirm/reject พร้อม note

---

## 🏗️ Platform / Infrastructure

```
src/server/platform/
├── db/
│   ├── client.ts              # drizzle + pg pool
│   ├── schema/
│   │   ├── auth.ts            # better-auth tables
│   │   ├── rbac.ts            # roles, permissions
│   │   ├── audit.ts           # audit_logs
│   │   ├── ecommerce.ts       # 🆕 ทุก table ecommerce (17 tables)
│   │   └── index.ts
│   └── migrations/            # drizzle-kit auto-generated
├── http/
│   ├── server.ts              # Elysia app setup
│   ├── context.ts             # request context (db, user, etc.)
│   └── middleware/
│       ├── error.ts
│       ├── logger.ts
│       ├── transaction.ts     # DB transaction per request
│       └── validator-wrapper.ts
└── observability/
    └── logger.ts
```

---

## 🔗 Shared

```
src/shared/
├── ui/
│   ├── QueryState.tsx              # <Loading /> <Error /> wrapper
│   ├── RowActions.tsx              # Edit/Delete dropdown
│   ├── SimpleSelect.tsx
│   ├── InfiniteCombobox.tsx        # infinite scroll select
│   ├── InfiniteMultiCombobox.tsx
│   ├── PresignedImageUploadTrigger.tsx
│   └── AppImage.tsx               # image with fallback
├── lib/
│   ├── fetcher.ts                  # fetch wrapper + error handling
│   ├── utils.ts                    # cn(), format helpers
│   ├── date-time.ts                # date formatting
│   └── upload-image-to-key.ts
├── hooks/
│   └── useDisclosure.ts            # open/close modal state
├── contracts/
│   ├── base.ts                     # PaginatedResponse, SortOrder
│   └── query-helpers.ts
├── errors.ts                       # AppError classes
└── types.ts                        # global types
```

---

## 🗃️ DB Schema Files

```
src/server/platform/db/schema/
├── auth.ts         # users, sessions, accounts, verifications (better-auth)
├── rbac.ts         # roles, permissions, user_roles
├── audit.ts        # audit_logs
├── outbox.ts       # outbox pattern (event sourcing)
├── ecommerce.ts    # 🆕 --- ECOMMERCE TABLES ---
│                   #   admins
│                   #   customers
│                   #   banners
│                   #   categories
│                   #   products
│                   #   product_images
│                   #   colors
│                   #   product_variants
│                   #   addresses
│                   #   coupons          ⭐
│                   #   carts
│                   #   cart_items
│                   #   orders
│                   #   order_items
│                   #   shipments        ⭐
│                   #   transactions
│                   #   audit_logs (ecommerce version)
└── index.ts        # export * from all schemas
```

---

## 🌐 API Routes Map

```
/api/
├── auth/           ✅  better-auth routes
│
├── users/          ✅  Admin users
├── rbac/           ✅  Roles & permissions
├── audit/          ✅  Audit logs
│
├── banners/        🆕  Banner management
├── categories/     🆕  Product categories
├── products/       🆕  Products + Variants + Images
│   └── :id/
│       ├── images/
│       └── variants/
├── colors/         🆕  Master color list
├── coupons/        🆕  Coupon codes
│   └── validate
│
├── customers/      🆕  Customer management
│
├── orders/         🆕  Order management
├── shipments/      🆕  Shipment tracking
├── transactions/   🆕  Payment & verification
│
└── health          ✅  Health check
```

---

## 🖥️ Frontend Routes Map

```
/
└── auth/
    └── login                     ✅ LoginPage

/app/
├── dashboard                     ✅ DashboardPage
│
├── users/                        ✅
│   ├── (index)                   UsersPage
│   └── :id                       UserDetailPage
│
├── roles/                        ✅
│
├── audit/                        ✅
│   ├── (index)                   AuditPage
│   └── :id                       AuditDetailPage
│
├── banners/                      🆕
│   └── (index)                   BannerPage
│
├── categories/                   🆕
│   └── (index)                   CategoriesPage
│
├── products/                     🆕
│   ├── (index)                   ProductsPage
│   ├── create                    ProductCreatePage
│   └── :id                       ProductDetailPage
│
├── coupons/                      🆕
│   └── (index)                   CouponsPage
│
├── customers/                    🆕
│   ├── (index)                   CustomersPage
│   └── :id                       CustomerDetailPage
│
├── orders/                       🆕
│   ├── (index)                   OrdersPage (tabs by status)
│   └── :id                       OrderDetailPage
│                                  ├── OrderItems
│                                  ├── TransactionCard + SlipViewer
│                                  └── ShipmentCard + TrackingForm
│
└── transactions/                 🆕
    └── (index)                   TransactionsPage
```

---

## 🏗️ Build Order

สร้าง Module ตามลำดับนี้ (dependency-based):

```
Phase 1 — Foundation
─────────────────────
① DB Schema (ecommerce.ts)     ← ทุก table ใน 1 file
② db:generate + db:migrate
③ seed-colors.ts               ← master colors

Phase 2 — Catalog
─────────────────────
④ categories                   ← ไม่มี dependency
⑤ products                     ← depends: categories, colors
   └── colors (sub-feature)

Phase 3 — Marketing
─────────────────────
⑥ banner
⑦ coupons

Phase 4 — Customer & Cart
─────────────────────
⑧ customers                    ← Admin read-only view
⑨ (cart — สำหรับ customer UI ในอนาคต)

Phase 5 — Commerce
─────────────────────
⑩ orders                       ← depends: customers, products, coupons
⑪ shipments                    ← depends: orders
⑫ transactions                 ← depends: orders

Phase 6 — Dashboard Update
─────────────────────
⑬ dashboard                    ← เพิ่ม stats: ยอดขาย, order, stock
```

---

## 📏 Convention

### File Naming
```
PascalCase   → React components (.tsx)
camelCase    → functions, hooks, utils (.ts)
kebab-case   → (ไม่ใช้ใน project นี้)
```

### Module Pattern (ทุก Module ใช้เหมือนกัน)
```
domain/contracts/   → Zod schema + TypeScript types
domain/repo/        → Database queries (1 function = 1 file)
domain/services/    → Business logic (validation, calculation)
api/index.ts        → HTTP routes (Elysia router)
presentation/api/   → Frontend API client + React Query hooks
presentation/pages/ → React pages (lazy loaded)
presentation/ui/    → UI components ของ module นี้
```

### API Response Format
```ts
// Success
{ data: T, meta?: PaginationMeta }

// Error
{ message: string, code?: string }
```

---

*🗂️ SPACE.md — eCommerce System*  
*อัปเดตทุกครั้งที่เพิ่ม Module ใหม่*
