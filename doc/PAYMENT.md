# Payment & Bank Integration Guide — PTL Master Mind

> **วัตถุประสงค์**: Document นี้อธิบาย architecture, flow, และ pattern ของระบบ payment ทั้งหมด
> เพื่อให้ AI agent หรือ developer implement feature ใหม่ได้ถูกต้องทันที โดยไม่ต้องงม codebase

---

## สารบัญ

1. [Overview — ระบบ Payment ปัจจุบัน](#1-overview)
2. [Payment Provider: BCEL OnePay](#2-bcel-onepay)
3. [Real-time Notification: PubNub](#3-pubnub)
4. [EMV QR Code Standard](#4-emv-qr-code)
5. [Payment Flow แบบ Step-by-Step](#5-payment-flow)
6. [Architecture & Files Map](#6-architecture--files-map)
7. [Environment Variables](#7-environment-variables)
8. [Database Schema (Payment)](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [Status State Machine](#10-payment-status-state-machine)
11. [TODO / ที่ยังไม่ได้ implement](#11-todo--งานที่ยังค้างอยู่)
12. [Pattern สำหรับเพิ่ม Payment Provider ใหม่](#12-pattern-เพิ่ม-provider-ใหม่)
13. [ข้อควรระวัง (Gotchas)](#13-ข้อควรระวัง)

---

## 1. Overview

ระบบใช้ **BCEL OnePay** เป็น payment gateway หลักของลาว  
วิธีชำระเงิน: **QR Code แบบ EMV** (สแกนด้วย BCEL One mobile app)  
การแจ้งผล payment: **PubNub** (real-time push — ไม่ใช่ polling / webhook)

```
Student App          Backend (NestJS)            BCEL OnePay              PubNub
    │                       │                         │                      │
    │── POST /checkout ──▶  │                         │                      │
    │                       │── build EMV QR ──────▶  │                      │
    │                       │── subscribe channel ──────────────────────────▶│
    │◀─ { qrCode, ref } ──  │                         │                      │
    │                       │                         │                      │
    │  (student scans QR)   │                         │                      │
    │──────────────────────────────────────────────▶  │                      │
    │                       │                         │── publish msg ──────▶│
    │                       │◀─────────────────────────────────────────────  │
    │                       │── confirmPayment() ─────│                      │
    │                       │── activateSubscription  │                      │
    │                       │── createEnrollment      │                      │
    │◀─ (polling status) ─  │                         │                      │
```

---

## 2. BCEL OnePay

### คืออะไร
**BCEL OnePay** คือ payment gateway ของธนาคาร BCEL (Banque pour le Commerce Extérieur Lao) — ธนาคารรัฐของลาว  
รองรับการชำระเงินผ่าน QR Code มาตรฐาน EMV บน mobile banking app

### การ integrate (วิธีที่ OnePay ทำงาน)
OnePay **ไม่ต้องการ HTTP call เพื่อลงทะเบียน transaction** ก่อน  
ขั้นตอนคือ:

1. **Backend สร้าง QR string** ตามมาตรฐาน EMV โดยใส่ merchant credentials + transaction ref
2. **Backend subscribe PubNub channel** ด้วย channel name ที่ derive จาก transaction ref
3. **User scan QR** ด้วย BCEL One app → ธนาคารดำเนินการ
4. **OnePay publish ไปยัง PubNub channel** นั้นเมื่อ payment สำเร็จ

### Merchant Credentials

| Field | Env Var | ตัวอย่าง | ความหมาย |
|-------|---------|---------|---------|
| MCID | `ONEPAY_MCID` | `858500001234` | Merchant ID จาก BCEL |
| Shop Code | `ONEPAY_SHOPCODE` | `SHOP01` | รหัสสาขา/ร้าน |
| MCC | `ONEPAY_MCC` | `5411` (default) | Merchant Category Code (ISO 18245) |
| Terminal ID | `ONEPAY_TERMINAL_ID` | `T001` (default) | รหัส terminal |

### QR Channel Name Convention
```
Production: uuid-{MCID}-{txnRef}
Dev mode:   dev-{txnRef}
```
ดูที่: `src/infrastructure/payment/onepay/onepay.client.ts` → `getChannelId()`

---

## 3. PubNub

### บทบาท
PubNub ทำหน้าที่เป็น **real-time message bus** — OnePay จะ publish message มาเมื่อ payment สำเร็จ  
Backend subscribe channel และ process ทันที

### PubNub Message Format (จาก OnePay)
```json
{
  "uuid": "MM-439011-A1B2C3D4",
  "ticket": "NQ81B8CYODO2",
  "amount": 500000,
  "name": "ສົມສັກ ເສັງກະລຸນ",
  "phone": "2055123456"
}
```

| Field | ความหมาย |
|-------|---------|
| `uuid` | txnRef ของเรา (ค่าที่เราส่งไปใน QR field 62.05) |
| `ticket` | Bank's transaction ID (ใช้เก็บใน `bankTransId`) |
| `amount` | จำนวนเงินที่จ่าย (KIP) |
| `name` | ชื่อผู้โอน |
| `phone` | เบอร์โทรผู้โอน |

### PubNub Subscribe Key
```env
ONEPAY_PUBNUB_SUBSCRIBE_KEY=sub-c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```
> ⚠️ **Note**: เราใช้แค่ Subscribe Key (อ่านอย่างเดียว) — OnePay เป็นคนส่ง (publish)

### การ Re-subscribe หลัง Server Restart
`PubNubPaymentSubscriber.onApplicationBootstrap()` จะ query payment ที่ยังเป็น PENDING  
และ re-subscribe ทุก channel อัตโนมัติ (ป้องกัน payment หาย)

ดูที่: `src/infrastructure/payment/pubnub/pubnub-payment.subscriber.ts`

### PubNub Last Token (Catch-up)
เมื่อได้รับ message จะ save `timetoken` ลง DB ก่อนประมวลผล  
หาก server crash กลางคัน → restart → subscribe ต่อจาก token นั้น (ไม่พลาด message)

---

## 4. EMV QR Code

### มาตรฐาน
ใช้ **EMVCo QR Code Specification for Payment Systems** (MPM — Merchant Presented Mode)  
Format: TLV string (Tag-Length-Value) พร้อม CRC16-CCITT checksum

### Structure ของ QR ที่สร้าง

```
00 02  01          → Payload Format Indicator
01 02  11          → Point of Initiation (static QR = 11, dynamic = 12)
33 XX  ...         → Merchant Account Info (OnePay specific)
   00  BCEL        → Acquirer name
   01  ONEPAY      → Service
   02  {MCID}      → Merchant ID
   05  CLOSEWHENDONE
52 04  {MCC}       → Merchant Category Code
53 03  418         → Transaction Currency (418 = LAK)
54 XX  {amount}    → Transaction Amount
58 02  LA          → Country Code
60 03  VTE         → Merchant City (Province)
62 XX  ...         → Additional Data
   01  {invoiceId}     → Invoice/Subscription ID (field 62.01)
   05  {txnRef}        → Transaction Ref (field 62.05) ← ใช้ match กับ PubNub
   07  T001            → Terminal ID (field 62.07)
63 04  {CRC16}     → CRC checksum
```

### txnRef Format
```
MM-{courseId_last6}-{uuid_8chars}
ตัวอย่าง: MM-439011-A1B2C3D4
```

### Code Location
- Builder: `src/infrastructure/payment/onepay/onepay-qr.builder.ts`
- Service wrapper: `src/infrastructure/payment/qr-payment.service.ts`
- QR TTL: **2 นาที** (ค่า default ใน `QrPaymentService`)

---

## 5. Payment Flow

### 5.1 Happy Path — ซื้อ Course ครั้งแรก

```
1. POST /v1/payment/checkout { courseId }
   ├── CheckoutCommand → CheckoutHandler
   ├── ตรวจ course ว่า WORKING และ ไม่เคย subscribe
   ├── createPendingSubscription()
   ├── generateQrPayment(price, courseId, subscriptionId)
   │   └── OnepayQrBuilder.build() → EMV QR string
   ├── getChannelId() → PubNub channel name
   ├── paymentRepository.createPayment()
   ├── pubnubSubscriber.subscribe(channelId)
   └── return { ref, qrCode, amount, currency, expiredAt, ttlSeconds }

2. Student scans QR (ฝั่ง client แสดง QR image จาก string ด้วย library เช่น qrcode)

3. OnePay → PubNub: publish { uuid, ticket, amount, name, phone }
   └── PubNubPaymentSubscriber.handleMessage()
       ├── payments.saveLastToken(bankRef, timetoken)  ← persist ก่อนเลย
       └── commandBus.execute(PaymentCallbackCommand)
           └── PaymentCallbackHandler
               ├── paymentRepository.confirmPayment()   → status = SUCCESS
               ├── subscriptionRepository.activate()    → status = ACTIVE
               └── enrollmentRepository.createEnrollment()

4. Client polling GET /v1/payment/status/:ref
   └── response: { status: 'SUCCESS', amount, currency, paidAt }
```

### 5.2 QR หมดอายุ — Regenerate

```
POST /v1/payment/checkout (เรียกซ้ำ)
  ├── พบ subscription PENDING + payment EXPIRED
  ├── generateQrPayment() ใหม่
  ├── paymentRepository.replaceExpiredQr()
  └── subscribe channel ใหม่
```

### 5.3 Admin Manual Confirm (Fallback)

```
POST /v1/payment/admin/confirm/:paymentId
  └── ManualConfirmHandler
      ├── ใช้ใน case ที่ PubNub ไม่ทำงาน
      └── Flow เดียวกับ PaymentCallbackHandler
```

### 5.4 Refund Flow (⚠️ ยังไม่ complete)

```
POST /v1/payment/admin/refund/:paymentId
  └── RefundHandler
      ├── ตรวจ payment.status === 'SUCCESS'
      ├── onepayClient.requestRefund()  ← ⚠️ THROWS NotImplementedException ตอนนี้
      └── paymentRepository.applyRefund() (3-row atomic transaction)
          ├── payment.status = 'REFUND_PENDING'
          ├── subscription.status = 'CANCELLED'
          └── enrollment.status = 'REFUNDED'
```

---

## 6. Architecture & Files Map

```
src/
├── infrastructure/payment/
│   ├── onepay/
│   │   ├── onepay-qr.builder.ts      ← สร้าง EMV QR string
│   │   ├── onepay.client.ts          ← getChannelId(), requestRefund() (TODO)
│   │   └── onepay.config.ts          ← อ่าน env vars, validate on startup
│   ├── pubnub/
│   │   └── pubnub-payment.subscriber.ts  ← subscribe/unsubscribe, handleMessage
│   └── qr-payment.service.ts         ← facade: generateQrPayment()
│
├── application/payment/
│   ├── commands/
│   │   ├── checkout.command.ts
│   │   ├── checkout.handler.ts       ← main checkout logic
│   │   ├── payment-callback.command.ts
│   │   ├── payment-callback.handler.ts  ← confirm + activate + enroll
│   │   ├── manual-confirm.command.ts
│   │   ├── manual-confirm.handler.ts
│   │   ├── refund.command.ts
│   │   └── refund.handler.ts
│   ├── queries/
│   │   ├── get-payment-status.query.ts / handler.ts  ← client polling
│   │   ├── get-payment-detail.query.ts / handler.ts
│   │   ├── list-payments.query.ts / handler.ts        ← admin list
│   │   ├── get-payment-stats.query.ts / handler.ts
│   │   └── get-teacher-payouts-trend.query.ts / handler.ts
│   └── payment-application.module.ts
│
├── domain/payment/
│   └── payment.repository.ts         ← IPaymentRepository interface + types
│
├── infrastructure/prisma/repositories/
│   └── payment.repository.impl.ts    ← Prisma implementation
│
└── presentation/payment/
    ├── student-payment.controller.ts  ← POST /checkout, GET /status/:ref
    ├── admin-payment.controller.ts    ← admin endpoints
    └── payment.module.ts
```

### DI Token
```typescript
import { PAYMENT_REPOSITORY } from 'src/domain/payment/payment.repository';
// inject: @Inject(PAYMENT_REPOSITORY) private readonly paymentRepo: IPaymentRepository
```

---

## 7. Environment Variables

```env
# ── OnePay ──────────────────────────────────────────────
ONEPAY_ENABLED=true                    # false = dev mode (QR ยังสร้างได้ แต่ไม่ real)
ONEPAY_MCID=858500001234               # Merchant ID จาก BCEL (required ถ้า enabled)
ONEPAY_SHOPCODE=SHOP01                 # Shop Code (required ถ้า enabled)
ONEPAY_MCC=5411                        # Merchant Category Code (default: 5411 = Grocery)
ONEPAY_TERMINAL_ID=T001                # Terminal ID (default: T001)
ONEPAY_PUBNUB_SUBSCRIBE_KEY=sub-c-xxx  # PubNub Subscribe Key (required ถ้า enabled)

# ── Testing ──────────────────────────────────────────────
PAYMENT_TEST_AMOUNT=1                  # override จำนวนเงิน QR (เช่น 1 KIP สำหรับ test)
```

### Dev Mode (ONEPAY_ENABLED=false)
- QR สร้างได้ปกติ แต่ใช้ placeholder MCID/SHOPCODE
- PubNub subscriber ไม่ start
- Channel name prefix ด้วย `dev-`
- ใช้ `/admin/confirm/:id` เพื่อ simulate payment ที่สำเร็จ

---

## 8. Database Schema

### Payment Model (Prisma)
```prisma
model Payment {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  subscriptionId  String    @db.ObjectId
  userId          String    @db.ObjectId
  amount          Float
  currency        String    @default("LAK")
  method          String    @default("QR_CODE")
  status          String    @default("PENDING")
  // QR fields
  bankRef         String?   // txnRef ที่เราสร้าง: MM-XXXXXX-YYYYYYYY
  qrCode          String?   // EMV QR string (ยาวมาก)
  qrExpiredAt     DateTime?
  // Payment confirmation
  bankTransId     String?   // ticket จาก OnePay (เช่น NQ81B8CYODO2)
  bankResponse    Json?     // raw PubNub message
  paidAt          DateTime?
  // PubNub tracking
  pubnubChannelId String?
  pubnubLastToken String?   // timetoken สำหรับ catch-up replay
  // Refund
  refundedAt      DateTime?
  refundReason    String?
  refundedById    String?   @db.ObjectId
  refundResponse  Json?
  // Relations
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id])
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
}
```

### Payment Status Values

| Status | ความหมาย |
|--------|---------|
| `PENDING` | QR สร้างแล้ว รอ scan |
| `EXPIRED` | QR หมดอายุก่อน scan |
| `SUCCESS` | จ่ายแล้ว confirmed |
| `REFUND_PENDING` | Admin เริ่มขอ refund (OnePay ยังไม่ confirm) |
| `REFUNDED` | Refund สำเร็จ (เมื่อ OnePay refund API พร้อม) |

---

## 9. API Endpoints

### Student Endpoints

#### `POST /v1/payment/checkout`
สร้าง QR Code สำหรับซื้อ course

**Request:**
```json
{ "courseId": "507f1f77bcf86cd799439011" }
```

**Response 201:**
```json
{
  "ref": "MM-439011-A1B2C3D4",
  "qrCode": "00020101021133...6304ABCD",
  "amount": 500000,
  "currency": "LAK",
  "expiredAt": "2026-05-21T10:10:00.000Z",
  "ttlSeconds": 120
}
```

**Guards:** `JwtAuthGuard`, `RolesGuard(STUDENT)`

---

#### `GET /v1/payment/status/:ref`
Client polling เพื่อรู้ผลการชำระเงิน

**Response 200:**
```json
{
  "status": "SUCCESS",
  "amount": 500000,
  "currency": "LAK",
  "paidAt": "2026-05-21T10:05:00.000Z"
}
```

**Guards:** `JwtAuthGuard`, `RolesGuard(STUDENT)`

---

### Admin Endpoints (ดูใน `admin-payment.controller.ts`)

| Method | Path | ความหมาย |
|--------|------|---------|
| GET | `/v1/payment/admin/list` | รายการ payments ทั้งหมด (paginated + filter) |
| GET | `/v1/payment/admin/stats` | สถิติ revenue, refund, pending |
| GET | `/v1/payment/admin/:id` | รายละเอียด payment |
| POST | `/v1/payment/admin/confirm/:id` | Manual confirm (dev/fallback) |
| POST | `/v1/payment/admin/refund/:id` | Refund (⚠️ NotImplemented) |

---

## 10. Payment Status State Machine

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
         checkout() ▼                                         │ checkout() again
         ┌─────────────┐                           ┌──────────┴──────┐
         │   PENDING   │──── QR expired ──────────▶│    EXPIRED      │
         └──────┬──────┘                           └─────────────────┘
                │
          PubNub message
          / manual confirm
                │
                ▼
         ┌─────────────┐
         │   SUCCESS   │──── admin refund ──▶ REFUND_PENDING ──▶ REFUNDED
         └─────────────┘
```

---

## 11. TODO / งานที่ยังค้างอยู่

### 🔴 Priority 1: OnePay Refund API

**File:** `src/infrastructure/payment/onepay/onepay.client.ts` → `requestRefund()`

ปัจจุบัน throw `NotImplementedException`

**งานที่ต้องทำ:**
1. ติดต่อ BCEL เพื่อขอ Refund API documentation
2. Implement `requestRefund()` ตาม contract ที่ได้รับ
3. ลบ `NotImplementedException` ออก
4. เพิ่ม integration test

**Pattern ที่ควรเป็น:**
```typescript
async requestRefund(input: { bankRef: string; amount: number }): Promise<{ ok: true; raw: Record<string, unknown> }> {
  // POST to OnePay refund endpoint
  const response = await axios.post(`${this.config.refundEndpoint}/refund`, {
    merchantId: this.config.mcid,
    transactionRef: input.bankRef,
    amount: input.amount,
    // ... other required fields
  }, {
    headers: { Authorization: `Bearer ${this.config.apiKey}` }
  });

  if (!response.data.success) {
    throw new BadRequestException(`OnePay refund failed: ${response.data.message}`);
  }

  return { ok: true, raw: response.data };
}
```

**Env vars ที่ต้องเพิ่ม:**
```env
ONEPAY_REFUND_ENDPOINT=https://api.onepay.la/v1
ONEPAY_API_KEY=xxx   # หรือ HMAC secret แล้วแต่ BCEL กำหนด
```

---

### 🟡 Priority 2: QR Expiry Cleanup Job

Payment ที่ EXPIRED ใน DB ยังไม่ถูก mark อัตโนมัติ  
Interface มี `markExpired()` แล้ว แต่ยังไม่มี cron job เรียก

**งานที่ต้องทำ:**
```typescript
// สร้าง src/infrastructure/payment/payment-expiry.scheduler.ts
@Cron('*/5 * * * *') // ทุก 5 นาที
async markExpiredPayments() {
  const expired = await this.paymentRepository.findExpiredPending();
  for (const p of expired) {
    await this.paymentRepository.markExpired(p.id);
  }
}
```

---

### 🟡 Priority 3: Payment Webhook (Fallback)

ถ้า PubNub ล่ม — ไม่มี fallback HTTP webhook จาก OnePay ปัจจุบัน  
ควรเพิ่ม `POST /v1/payment/webhook/onepay` เป็น HTTP callback option

---

### 🟢 Priority 4: Support Payment Methods อื่น

ดูส่วน [Pattern เพิ่ม Provider ใหม่](#12-pattern-เพิ่ม-provider-ใหม่) ด้านล่าง

---

## 12. Pattern เพิ่ม Provider ใหม่

### ตัวอย่าง: เพิ่ม BCEL Direct Transfer (Bank Transfer)

#### Step 1: สร้าง Provider Config
```typescript
// src/infrastructure/payment/bcel/bcel-transfer.config.ts
@Injectable()
export class BcelTransferConfig {
  readonly accountNumber: string;
  readonly accountName: string;
  constructor() {
    this.accountNumber = process.env.BCEL_ACCOUNT_NUMBER ?? '';
    this.accountName = process.env.BCEL_ACCOUNT_NAME ?? '';
  }
}
```

#### Step 2: สร้าง Provider Service
```typescript
// src/infrastructure/payment/bcel/bcel-transfer.service.ts
@Injectable()
export class BcelTransferService {
  generateTransferInfo(amount: number, ref: string): TransferInfo {
    return {
      bankName: 'BCEL',
      accountNumber: this.config.accountNumber,
      accountName: this.config.accountName,
      amount,
      ref,
      description: `PTL-${ref}`,
    };
  }
}
```

#### Step 3: เพิ่ม method ใน `CheckoutCommand` / `CheckoutHandler`
```typescript
// เพิ่ม paymentMethod?: 'QR_CODE' | 'BANK_TRANSFER' ใน CheckoutCommand
```

#### Step 4: Admin Manual Confirm ยังใช้ได้เหมือนเดิม
(Bank Transfer ต้องให้ Admin verify slip แล้ว confirm เอง)

#### Step 5: เพิ่ม method ใน `PaymentRecord.method`
```
QR_CODE | BANK_TRANSFER | CREDIT_CARD
```

---

## 13. ข้อควรระวัง

### ⚠️ Race Condition — Duplicate PubNub Message
`PaymentCallbackHandler` เช็ค `payment.status === 'SUCCESS'` ก่อนทำอะไร  
ถ้าเป็น SUCCESS แล้ว → return early (idempotent)  
อย่าลบการเช็คนี้ออก

### ⚠️ QR Amount Override
`PAYMENT_TEST_AMOUNT` ใน env จะ **override ราคาจริง** ของ course ทุก QR  
ต้องไม่ set ค่านี้ใน production

### ⚠️ PubNub Channel Collision
`dev-{txnRef}` (dev mode) vs `uuid-{MCID}-{txnRef}` (prod)  
Dev prefix ป้องกัน collision กับ merchant จริงบน shared PubNub keyset

### ⚠️ saveLastToken ต้อง run ก่อน commandBus.execute
ลำดับใน `handleMessage()` สำคัญมาก:
```typescript
await this.payments.saveLastToken(bankRef, event.timetoken);  // FIRST
await this.commandBus.execute(new PaymentCallbackCommand(...)); // SECOND
```
ถ้า crash ระหว่าง execute → restart → replay จาก token ได้

### ⚠️ Refund ต้องเรียก OnePay ก่อน DB เสมอ
`RefundHandler` เรียก `onepayClient.requestRefund()` ก่อน แล้วค่อย `applyRefund()` กับ DB  
ป้องกันกรณี DB อัพเดตแล้วแต่ bank ไม่คืนเงิน

### ⚠️ Currency คือ LAK (KIP) เสมอ
ตัวเลขเป็น integer ไม่มีทศนิยม (KIP ไม่มี satang)  
ISO 4217 numeric = `418`

### ⚠️ EMV CRC ต้อง 4 hex chars
`crc16()` ใน `onepay-qr.builder.ts` padStart 4 ด้วยเหตุผลนี้  
Reference implementation ของ ANTS ขาด pad นี้ → QR ผิดประมาณ 1/16 ครั้ง

---

## Quick Reference

```typescript
// สร้าง QR payment
const result = await this.qrPaymentService.generateQrPayment(
  amount,      // number (LAK)
  courseId,    // string (MongoDB ObjectId)
  invoiceId,   // string? (subscriptionId)
);
// result: { bankRef, qrCode, expiredAt, ttlSeconds }

// Subscribe PubNub channel
const channelId = this.onepayClient.getChannelId({ uuid: bankRef });
this.pubnubSubscriber.subscribe(channelId);

// Confirm payment (in PubNub callback)
await this.paymentRepository.confirmPayment(id, bankTransId, rawMsg);
await this.subscriptionRepository.activate(subscriptionId);
await this.enrollmentRepository.createEnrollmentFromPayment(userId, courseId);
```

---

*Last updated: 2026-05-21*  
*Maintainer: SskSENGALOUNE*  
*Ticket references: MM-18-onepay-refund, BE-MM-30*
