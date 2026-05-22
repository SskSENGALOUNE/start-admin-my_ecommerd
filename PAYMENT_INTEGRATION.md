# Payment Integration Guide — Bank Response Flow

ຄູ່ມືການຕໍ່ລະບົບຮັບ Response ຈາກ Bank (BCEL OnePay) ສຳລັບ eCommerce project

---

## 1. ພາບລວມ — ສຸດທ້າຍຕ້ອງການຫຍັງ?

```
Customer ສັ່ງຊື້
    ↓  POST /api/checkout
Backend ສ້າງ Order + Transaction (PENDING) + QR String (EMV)
    ↓  return { orderId, qrString, channelId, ... }
Frontend ໂຊ PaymentQrPage — ສະແກນ QR ດ້ວຍ BCEL One
    ↓
Bank (OnePay) ຂ່ຽວ PubNub channel
    ↓  message: { uuid: txnRef, ticket: bankTransId, amount, name, phone }
Backend (pubnub.subscriber.ts) ຮັບ message
    ↓  transactions.status → COMPLETED, orders.status → CONFIRMED
Frontend (polling + PubNub listener) ຮູ້ວ່າ isPaid = true
    ↓  redirect → /checkout/success
```

---

## 2. ສ່ວນທີ່ **Build ແລ້ວ** ✅

### 2.1 Backend — PubNub Subscriber
**File:** `src/modules/payment/domain/services/pubnub.subscriber.ts`

| Function | ໜ້າທີ່ |
|---|---|
| `startPubNubListener()` | ເລີ່ມ global listener (call once at server boot) |
| `subscribeChannel(txnRef)` | Subscribe channel ໃໝ່ ເມື່ອ Order ສ້າງ |
| `resubscribePendingTransactions()` | Re-subscribe PENDING txns ເມື່ອ server restart |
| `handlePaymentConfirmed(msg)` | ອັບເດດ DB — transactions → COMPLETED, orders → CONFIRMED |

**Bank message format ທີ່ຮັບ:**
```ts
interface OnepayMessage {
  uuid: string;   // = txnRef (ตัวที่เราส่งไปใน QR field 62.05)
  ticket: string; // = bank's transaction ID (stored as bankRequest)
  amount: number; // จำนวนเงินที่ลูกค้าโอน
  name: string;   // ชื่อผู้โอน
  phone: string;  // เบอร์ผู้โอน
}
```

**PubNub channel naming:**
```
Production:  uuid-{ONEPAY_MCID}-{txnRef}
Dev mode:    dev-{txnRef}
```

---

### 2.2 Backend — Payment API Routes
**File:** `src/modules/payment/api/index.ts`

| Method | Endpoint | ໃຊ້ສຳລັບ |
|---|---|---|
| `GET` | `/api/payment/pubkey` | Frontend ດຶງ subscribe key ສຳລັບ PubNub |
| `GET` | `/api/payment/status/:orderId` | Frontend poll ສະຖານະ — return `{ isPaid, orderStatus, paymentStatus }` |
| `POST` | `/api/payment/refresh-qr/:orderId` | ສ້າງ QR ໃໝ່ ເມື່ອ QR ໝົດອາຍຸ |
| `POST` | `/api/payment/admin/confirm/:orderId` | Admin manual confirm (fallback) |

---

### 2.3 Frontend — PaymentQrPage
**File:** `src/modules/payment/presentation/pages/PaymentQrPage.tsx`

- ສະແດງ QR Code (EMV string → react-qr-code)
- Countdown timer 2 ນາທີ
- **Dual confirmation:** PubNub listener + polling ທຸກ 3 ວິ (fallback)
- ເມື່ອ `isPaid = true` → redirect `/checkout/success`

---

### 2.4 Database Schema
**File:** `src/server/platform/db/schema/ecommerce.ts`

```ts
transactions: {
  id, transactionId, merchantId, merchantName,
  amount, status,          // PENDING | COMPLETED | FAILED
  paymentMethod,           // QR | COD
  bankType,                // BCEL | JDB | LDB (nullable — COD ບໍ່ມີ)
  bankRequest,             // ticket ຈາກ OnePay (bank's txn ID)
  bankResponse,            // raw JSON message ຈາກ PubNub
  slipUrl,                 // 🆕 ລູກຄ້າ upload slip (nullable)
  orderRef,                // FK → orders.id
  verifiedBy,              // FK → admin user.id (nullable)
  verifiedAt,              // ເວລາ admin verify (nullable)
  ...
}
```

---

## 3. ສ່ວນທີ່ **ຍັງຕ້ອງ Build** 🆕

### 3.1 Customer Slip Upload — ❌ ບໍ່ຈຳເປັນ (Skip MVP)

PubNub auto-confirm ທຳງານຢ່າງ complete ຢູ່ແລ້ວ — ເມື່ອ customer scan QR ສຳເລັດ, bank publish message ມາ PubNub ທັນທີ, frontend ຮູ້ຜ່ານ listener + polling.

Slip upload ຈະຈຳເປັນກໍຕໍ່ເມື່ອ PubNub ລົ້ມ ຫຼື channel ຜິດ ຊຶ່ງເກີດໜ້ອຍຫຼາຍ. ສຳລັບ fallback ນີ້ admin ໃຊ້ **manual confirm endpoint** ທີ່ມີຢູ່ແລ້ວໄດ້ເລີຍ (Section 7 ດ້ານລຸ່ມ). DB field `slipUrl` ໄວ້ reserve ສຳລັບ phase ຕໍ່ໄປ.

---

### 3.2 Admin Transactions Page 🆕
**Module:** `src/modules/transactions/`

Routes backend ມີແລ້ວ:
- `GET /api/transactions` — list (pagination + filter by status/method)
- `GET /api/transactions/:id` — detail (bankResponse, slipUrl, order info)

**ຕ້ອງ Build:**

#### 3.2.1 Frontend Admin List Page
**File ໃໝ່:** `src/modules/transactions/presentation/pages/TransactionListPage.tsx`

ຄ້ຳຊ້ຳ pattern ຈາກ OrderListPage:
```
Table columns: orderNumber | amount | paymentMethod | status | verifiedAt | slipUrl(icon) | actions
Filter bar: status (PENDING/COMPLETED/FAILED) | paymentMethod (QR/COD)
Action: "ຢືນຢັນ" button → call POST /api/payment/admin/confirm/:orderId
```

#### 3.2.2 Slip Preview
- ຖ້າ `slipUrl != null` → ສະແດງ thumbnail (click to expand full image)
- ຖ້າ `bankResponse` ມີຂໍ້ມູນ → ສະແດງ badge "PubNub ຢືນຢັນແລ້ວ"
- ຖ້າ PubNub ຢືນຢັນ → status ຈະ COMPLETED ໂດຍອັດຕະໂນມັດ (ບໍ່ຕ້ອງ admin confirm)

---

### 3.3 QR Refresh Button (ສຳຄັນ)

**ເປັນຫຍັງ:** QR ໝົດອາຍຸ 2 ນາທີ — ຕ້ອງໃຫ້ customer ສ້າງໃໝ່ໂດຍບໍ່ຕ້ອງ checkout ໃໝ່ທັງໝົດ.

Endpoint ມີແລ້ວ: `POST /api/payment/refresh-qr/:orderId`

**Frontend — ໃນ PaymentQrPage ເມື່ອ `isExpired = true`:**
```tsx
// ແທນ redirect ໄປ /checkout
// ສ້າງ QR ໃໝ່ ຈາກ orderId ທີ່ມີຢູ່ແລ້ວ
const newQr = await paymentApi.refreshQr(orderId)
setQrString(newQr.qrString)
setTimeLeft(QR_EXPIRE_SECS)
setIsExpired(false)
```

---

## 4. Flow Diagram — Admin Transactions (Slip Review)

```
Customer ຈ່າຍ QR
    │
    ├── PubNub ສຳເລັດ ──→ transaction.status = COMPLETED (auto)
    │                      order.status = CONFIRMED (auto)
    │
    └── PubNub ລົ້ມເຫຼວ
            │
            ├── Customer ອັບໂຫຼດ Slip
            │       ↓  POST /api/payment/upload-slip/:orderId
            │       ↓  transaction.slipUrl = "https://..."
            │
            └── Admin ເຫັນ slip ໃນ TransactionListPage
                    ↓  ກວດ slip ຕົວຕົນ
                    ↓  ກົດ "ຢືນຢັນ" → POST /api/payment/admin/confirm/:orderId
                    ↓  transaction.status = COMPLETED
                    ↓  order.status = CONFIRMED
                    ↓  verifiedBy = adminId, verifiedAt = now
```

---

## 5. ຂັ້ນຕອນ Build ຕາມລຳດັບ

```
Step 1: Customer Slip Upload
  - POST /api/payment/upload-slip/:orderId  (backend)
  - Upload UI ໃນ PaymentQrPage              (frontend)

Step 2: QR Refresh
  - ຕໍ່ paymentApi.refreshQr()              (frontend client)
  - "ສ້າງ QR ໃໝ່" button ໃນ expired state  (frontend UI)

Step 3: Admin Transactions Page
  - TransactionListPage.tsx                 (frontend)
  - register route + sidebar entry          (router.tsx + sidebar-data.tsx)
  - Slip preview modal                      (UI)
  - "ຢືນຢັນ" / "ປະຕິເສດ" actions           (UI + API call)
```

---

## 6. Environment Variables ທີ່ຕ້ອງ Set

```bash
# PubNub (ຮັບ callback ຈາກ bank — ສຳຄັນທີ່ສຸດ)
ONEPAY_PUBNUB_SUBSCRIBE_KEY=sub-c-xxxxxxxx-...

# OnePay merchant credentials
ONEPAY_ENABLED=true
ONEPAY_MCID=mchXXXXXXXXX
ONEPAY_SHOPCODE=XXXXXXXX

# QR settings
ONEPAY_MCC=5411
ONEPAY_TERMINAL_ID=T001

# Dev testing: override all QR amounts to 1 KIP
PAYMENT_TEST_AMOUNT=1
```

---

## 7. Testing ໂດຍບໍ່ຕ້ອງ Bank ຈິງ

ໃຊ້ admin manual confirm endpoint:

```bash
# 1. ສ້າງ order ຈາກ checkout
# 2. Copy orderId ຈາກ URL ຂອງ PaymentQrPage
# 3. Call:
curl -X POST /api/payment/admin/confirm/<orderId> \
  -H "Cookie: <admin-session-cookie>"

# Frontend ຈະ detect isPaid = true ໃນ poll ຮອບຕໍ່ໄປ (3 ວິ)
# ແລ້ວ redirect ໄປ /checkout/success
```

---

## 8. Key Files Reference

| File | ໜ້າທີ່ |
|---|---|
| `src/modules/payment/domain/services/pubnub.subscriber.ts` | Bank callback handler |
| `src/modules/payment/domain/services/onepay.service.ts` | QR generation + channel ID |
| `src/modules/payment/domain/services/emv-qr.builder.ts` | EMV TLV QR builder |
| `src/modules/payment/api/index.ts` | Payment API routes |
| `src/modules/payment/presentation/api/client.ts` | Frontend payment API client |
| `src/modules/payment/presentation/pages/PaymentQrPage.tsx` | QR scan UI + PubNub + polling |
| `src/modules/transactions/api/index.ts` | Admin transactions routes |
| `src/modules/transactions/domain/repo/list.ts` | DB query — list transactions |
| `src/server/platform/db/schema/ecommerce.ts:444` | transactions table schema |
