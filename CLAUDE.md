# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full eCommerce platform for **Laos market** — includes both an **Admin Panel** and a **Customer-facing Storefront**. UI text and error messages are in **Lao language** (`ພາສາລາວ`).

---

## Dev Commands

```bash
bun dev                  # start dev server (hot reload) — serves both frontend + backend
bun start                # production start (NODE_ENV=production)
bun run build            # build frontend only
bun run build:all        # build frontend + compile backend binaries

bun run db:generate      # generate drizzle migration files from schema changes
bun run db:migrate       # run pending migrations
bun run db:push          # push schema without migration file (dev only)
bun run db:studio        # open Drizzle Studio GUI

bun run seed:colors      # seed master color enum rows to DB (run once after first migration)
bun run rbac:sync        # sync roles & permissions definitions to DB

bun run worker           # start background outbox worker (port 3001)

bun run lint             # biome check
bun run format           # biome format
```

---

## Architecture — Modular Monolith

Backend (Elysia) and Frontend (React) co-exist in the same module folder. All API routes are prefixed `/api`.

```
src/
├── app/           # Application shell — layouts, router, providers
├── modules/       # All feature modules (backend + frontend together)
├── server/        # Entry points, platform infra (db, http, worker)
├── shared/        # Shared frontend utilities
└── assets/        # Fonts (Noto Sans Lao Looped)
```

### Uniform Module Structure

```
modules/<name>/
├── api/index.ts              # Elysia router — HTTP routes
├── domain/
│   ├── contracts/            # Zod schemas + TypeScript types
│   ├── repo/                 # DB queries — 1 function = 1 file
│   └── services/             # Business logic
└── presentation/
    ├── api/
    │   ├── client.ts         # fetch wrapper (uses shared fetcher)
    │   └── queries.ts        # TanStack Query hooks
    ├── pages/                # React pages (lazy loaded via LazyPage)
    └── ui/                   # Module-scoped UI components
```

---

## Modules

### Admin Panel (`/app/*`) — requires better-auth session

| Module         | Status | Notes |
| -------------- | ------ | ----- |
| `auth`         | ✅     | Admin login, session, profile. Uses `better-auth`. |
| `users`        | ✅     | Admin CRUD + ban/unban |
| `roles`        | ✅     | RBAC roles & permissions |
| `audit`        | ✅     | Activity log |
| `dashboard`    | ✅     | Overview stats |
| `upload`       | ✅     | S3/MinIO presigned upload |
| `categories`   | ✅     | Product categories |
| `products`     | ✅     | Products + Variants + Images + Stock |
| `customers`    | ✅     | Admin view of customer accounts |
| `orders`       | ✅     | Order management + status transitions |
| `shipments`    | ✅     | Tracking number management (no standalone page — UI inside `OrderDetailPage`) |
| `banner`       | 🆕     | Slide banner management |
| `coupons`      | 🆕     | Coupon code management |
| `transactions` | 🆕     | Payment verification + slip review |

### Customer Storefront (public routes) — uses Supabase JWT

| Module          | Routes | Notes |
| --------------- | ------ | ----- |
| `customer-auth` | `/customer/login`, `/customer/register`, `/customer/auth/callback` | JWT-based; Supabase for OAuth |
| `shop`          | `/shop`, `/shop/$id` | Product browsing |
| `cart`          | `/cart` | Shopping cart |
| `checkout`      | `/checkout`, `/checkout/success` | Checkout flow |
| `payment`       | `/payment/qr` | OnePay QR payment (Lao payment provider) |

---

## Authentication — Dual System

Two separate auth systems run in parallel:

- **Admin auth** — `better-auth` library; session cookie; handled by `src/modules/auth/domain/better-auth.ts`
- **Customer auth** — Custom JWT (`CUSTOMER_AUTH_SECRET`) + Supabase for Google/Facebook OAuth; handled by `src/modules/customer-auth/`

Permission guard on frontend: `<RequirePermissions all={[...]} any={[...]}>` wraps every protected admin route in `router.tsx`.

---

## Key Patterns

### Registering a New Module

1. **Backend route** → add `.use(yourRoutes)` in `src/server/api/rest/index.ts`
2. **Frontend route** → add `createRoute(...)` in `src/app/router.tsx`, add to `routeTree`
3. **Sidebar item** → add entry in `src/app/layout/data/sidebar-data.tsx`

### API Response Format

```ts
// Success
{ data: T, meta?: PaginationMeta }

// Error
{ message: string, code?: string }
```

### Frontend API Calls

All fetch calls go through `src/shared/lib/fetcher.ts` which handles:
- Cookie credentials (`include`)
- 401 → shows Lao-language confirm dialog, redirects to `/auth/login`
- 4xx/5xx → `toast.error(...)` in Lao

### RBAC in API Routes

Use `permissions` array from `serverContext` (injected via `context.ts`):
```ts
// Check in route handler
if (!permissions.includes("products:write")) throw new Error("Forbidden")
```

### Soft Delete

Tables with soft delete: `customers`, `categories`, `products`, `product_variants`, `addresses`, `coupons`, `banners`. Always filter `WHERE deleted_at IS NULL` in queries.

### Stock Accounting

`available_stock = quantity - reserved_qty`
- Order PENDING → `reserved_qty += qty`
- Order CANCELLED → `reserved_qty -= qty`  
- Order DELIVERED → `quantity -= qty`

### Order Items Snapshot

`order_items` stores `productName`, `productImage`, `variantSku`, `colorName`, `unitPrice` at purchase time — these are never updated even if the product changes.

### Order Number Format

`ORD-YYYYMMDD-XXXX` — running number resets daily.

### Variant Price Fallback

`product_variants.price` is nullable → `null` means use `products.base_price`.

---

## Database

PostgreSQL + Drizzle ORM. Schema files:

```
src/server/platform/db/schema/
├── auth.ts         # better-auth tables (users, sessions, accounts)
├── rbac.ts         # roles, permissions, user_roles
├── audit.ts        # audit_logs
├── outbox.ts       # transactional outbox pattern
├── ecommerce.ts    # all ecommerce tables (17 tables)
└── index.ts        # re-exports everything
```

All table primary keys are `nanoid()` strings (not sequential integers).

---

## Real-time & Background Jobs

- **PubNub** — listens for OnePay QR payment callbacks. Subscriber starts on server boot in `server.ts`. Env: `ONEPAY_PUBNUB_SUBSCRIBE_KEY`.
- **Outbox Worker** — `src/server/worker.ts` runs on port 3001 (`bun run worker`). Processes the transactional outbox for reliable event delivery.

---

## Environment Variables

```bash
# Core
DATABASE_URL=
CORS_ORIGIN=

# Admin auth
BETTER_AUTH_SECRET=
BETTER_AUTH_BASE_URL=

# Customer auth
CUSTOMER_AUTH_SECRET=        # JWT signing secret for customer tokens

# Storage (S3/MinIO)
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=

# Supabase (customer OAuth)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# OnePay Lao QR payment (optional — comment out to disable)
# ONEPAY_ENABLED=true
# ONEPAY_MCID=
# ONEPAY_SHOPCODE=
# ONEPAY_PUBNUB_SUBSCRIBE_KEY=
```

---

## Business Flows

### Payment / Order Status

```
QR:  PENDING → (customer uploads slip) → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
COD: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
Cancel: PENDING | CONFIRMED → CANCELLED
Refund: DELIVERED → REFUNDED
```

### Shipment Flow

```
Order PROCESSING → Shipment created (PREPARING)
Admin enters tracking → SHIPPED  (syncs order to SHIPPED)
Customer receives → DELIVERED   (syncs order to DELIVERED)
```

### Coupon Validation Logic

```
1. code exists AND is_active = true
2. now() between start_date and end_date
3. used_count < usage_limit (if set)
4. subtotal >= min_order_amt (if set)

PERCENTAGE   → discount = subtotal × (value/100), capped at max_discount
FIXED_AMOUNT → discount = value
```

---

## Domain Enums

| Enum | Values |
| ---- | ------ |
| `orderStatus` | `PENDING` `CONFIRMED` `PROCESSING` `SHIPPED` `DELIVERED` `CANCELLED` `REFUNDED` |
| `shipmentStatus` | `PREPARING` `SHIPPED` `DELIVERED` |
| `transactionStatus` | `PENDING` `COMPLETED` `FAILED` |
| `paymentMethod` | `QR` `COD` |
| `shippingType` | `RAIDER` `ANOUSITH_EXPRESS` `HOUNGALOUN_EXPRESS` `MIXAY_EXPRESS` `UNITEL_EXPRESS` |
| `bankType` | `BCEL` `JDB` `LDB` |
| `colorType` | `RED` `GREEN` `BLUE` `YELLOW` `BLACK` `WHITE` `GRAY` `PURPLE` `ORANGE` `PINK` `BROWN` `GOLD` `SILVER` |

---

## Conventions

- **File naming:** `PascalCase` for React components (`.tsx`), `camelCase` for everything else (`.ts`)
- **RBAC roles:** `SUPER_ADMIN` (all access including audit), `ADMIN` (products, orders, transactions, banners, coupons, shipments)
- **New module build order:** DB schema → repo → service → API route → frontend client/queries → pages/UI → register routes + sidebar

> When a module is complete, update its status in both `CLAUDE.md` and `SPACE.md`.
