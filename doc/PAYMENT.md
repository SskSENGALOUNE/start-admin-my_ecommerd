# OnePay Integration Guide (Lao QR Payment)

> **สำหรับ Project:** PTL Master Mind Backend  
> **Payment Provider:** OnePay (ผ่าน BCEL / PromptPay Lao)  
> **สถาปัตยกรรม:** QR Code (EMV) + PubNub callback (ไม่มี HTTP webhook)

---

## ภาพรวม Flow การชำระเงิน

```
Student → POST /v1/payment/checkout
            └─ สร้าง QR Code (EMV)
            └─ Subscribe PubNub channel

ลูกค้า scan QR → ธนาคาร / OnePay app
            └─ OnePay ส่ง message ผ่าน PubNub

Backend รับ PubNub message
            └─ PaymentCallbackHandler
            └─ Confirm payment + enroll student
```

---

## 1. ขอ Credentials จาก OnePay

ติดต่อ OnePay Laos เพื่อขอข้อมูลต่อไปนี้:

| Parameter | คำอธิบาย | ตัวอย่าง |
|-----------|----------|---------|
| `MCID` | Merchant ID — ใช้สร้าง QR | `mch5c2f0404102fb` |
| `SHOPCODE` | Shop/Branch code | `12345678` |
| `MCC` | Merchant Category Code (ISO 18245) | `5411` (Grocery) |
| `TERMINAL_ID` | Terminal ID (ถ้าไม่มี ใช้ `T001`) | `T001` |
| **PubNub Subscribe Key** | Key สำหรับรับ payment notification | `sub-c-xxxx-xxxx` |

> **หมายเหตุ:** OnePay ใช้ **PubNub** เป็น message broker — **ไม่มี HTTP webhook**  
> Backend ต้อง subscribe PubNub channel เพื่อรับการแจ้งเตือนการชำระเงิน

---

## 2. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env`:

```env
# OnePay (Lao QR payment provider)
ONEPAY_ENABLED=true
ONEPAY_MCID=<your_merchant_id>
ONEPAY_SHOPCODE=<your_shop_code>
ONEPAY_MCC=5411
ONEPAY_TERMINAL_ID=T001
ONEPAY_PUBNUB_SUBSCRIBE_KEY=<your_pubnub_subscribe_key>

# ทดสอบด้วยจำนวนเงิน 1 KIP (ลบออกใน production)
PAYMENT_TEST_AMOUNT=1
```

**ค่า required เมื่อ `ONEPAY_ENABLED=true`:**
- `ONEPAY_MCID` — ห้ามว่าง
- `ONEPAY_SHOPCODE` — ห้ามว่าง  
- `ONEPAY_PUBNUB_SUBSCRIBE_KEY` — ห้ามว่าง

> ถ้า missing ค่าใดค่าหนึ่ง app จะ **throw error ตอน startup** และไม่ start

---

## 3. การทำงานของ QR Code (EMV Format)

QR ที่สร้างขึ้นเป็น **EMV QR Code** standard ตาม BCEL/OnePay spec:

```
Field 00: Payload Format Indicator = "01"
Field 01: Point of Initiation       = "11" (static)
Field 33: Merchant Account Info (BCEL/ONEPAY)
  ├─ 00: "BCEL"
  ├─ 01: "ONEPAY"
  ├─ 02: <MCID>
  └─ 05: "CLOSEWHENDONE"
Field 52: MCC (Merchant Category Code)
Field 53: Currency Code (418 = LAK)
Field 54: Amount
Field 58: Country Code = "LA"
Field 60: Province = "VTE"
Field 62: Additional Data
  ├─ 01: invoiceId (subscriptionId)
  ├─ 05: txnRef (bank reference เช่น MM-439011-A1B2C3D4)
  ├─ 07: terminalId
  └─ 08: description
Field 63: CRC-16/CCITT (4 hex chars)
```

**txnRef format:** `MM-{last6ofCourseId}-{8randomChars}` เช่น `MM-439011-A1B2C3D4`

---

## 4. Flow PubNub (รับ Callback)

### 4.1 ทำงานอย่างไร

1. ตอน checkout — backend subscribe PubNub channel `uuid-{MCID}-{uuid}`
2. ลูกค้าจ่ายเงินสำเร็จ — OnePay ส่ง message เข้า channel นั้น
3. Backend รับ message → `PaymentCallbackHandler` → confirm payment + enroll

### 4.2 รูปแบบ Message จาก OnePay

```json
{
  "uuid": "MM-439011-A1B2C3D4",
  "ticket": "NQ81B8CYODO2",
  "amount": 1,
  "name": "ຊື່ຜູ້ຈ່າຍ",
  "phone": "020xxxxxxxx"
}
```

| Field | ความหมาย |
|-------|---------|
| `uuid` | txnRef ที่เราส่งไปใน QR (= bankRef ในระบบ) |
| `ticket` | Bank Transaction ID จาก OnePay |
| `amount` | จำนวนเงินที่จ่าย (KIP) |
| `name` | ชื่อผู้จ่าย |
| `phone` | เบอร์ผู้จ่าย |

### 4.3 Channel Naming

| Mode | Channel Format |
|------|---------------|
| Production | `uuid-{MCID}-{uuid}` |
| Dev (`ONEPAY_ENABLED=false`) | `dev-{uuid}` |

---

## 5. การทดสอบจริง (Real / Production Mode)

### 5.1 เตรียม .env ให้พร้อม

```env
ONEPAY_ENABLED=true
ONEPAY_MCID=mch5c2f0404102fb          # ← Merchant ID จาก OnePay
ONEPAY_SHOPCODE=12345678               # ← Shop Code จาก OnePay
ONEPAY_MCC=5411
ONEPAY_TERMINAL_ID=T001
ONEPAY_PUBNUB_SUBSCRIBE_KEY=sub-c-91489692-fa26-11e9-be22-ea7c5aada356

# ใช้ 1 KIP ตอนทดสอบ ป้องกันจ่ายเงินจริงเยอะ
PAYMENT_TEST_AMOUNT=1
```

> **ลบ `PAYMENT_TEST_AMOUNT`** ออกเมื่อ go live จริง เพื่อใช้ราคา course จริง

---

### 5.2 รัน Server และตรวจสอบ Log

```bash
pnpm dev
```

Log ที่ต้องเห็นตอน startup ก่อน test:
```
[OnepayConfig] OnePay enabled with MCID=mch5c2f0404102fb  ✅
[PubNubPaymentSubscriber] Re-subscribing to X pending OnePay channels  ✅
[PubNubPaymentSubscriber] PubNub network up  ✅
```

ถ้าไม่เห็น `PubNub network up` → **หยุดก่อน** แก้ Subscribe Key ให้ถูกก่อนทดสอบต่อ

---

### 5.3 สร้าง Student Account และ Login

1. **Register student** (ถ้ายังไม่มี):
```bash
POST /v1/auth/register
{
  "email": "test.student@example.com",
  "password": "Test1234!",
  "firstName": "Test",
  "lastName": "Student",
  "role": "STUDENT"
}
```

2. **Login เพื่อเอา Token:**
```bash
POST /v1/auth/login
{
  "email": "test.student@example.com",
  "password": "Test1234!"
}
```
เก็บ `accessToken` ไว้ใช้ในขั้นต่อไป

---

### 5.4 Checkout — สร้าง QR จริง

```bash
POST /v1/payment/checkout
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "courseId": "<courseId_ที่มีสถานะ_WORKING>" }
```

**Response ที่ได้:**
```json
{
  "ref": "MM-439011-A1B2C3D4",
  "qrCode": "00020101021133...",
  "amount": 1,
  "currency": "LAK",
  "expiredAt": "2026-05-08T10:10:00.000Z",
  "ttlSeconds": 120
}
```

Log ที่ต้องเห็น:
```
[PubNubPaymentSubscriber] Subscribed to OnePay channel uuid-mch5c2f0404102fb-MM-439011-A1B2C3D4
```

---

### 5.5 แสดง QR Code และ Scan จ่ายเงิน

นำ `qrCode` string ไป render เป็น QR Image — ใช้ tools ต่อไปนี้:

**Option A — Online (เร็วสุด):**  
เปิด [https://www.qr-code-generator.com/](https://www.qr-code-generator.com/) → เลือก "Text/URL" → วาง `qrCode` string

**Option B — ใช้ Library ใน Frontend:**
```js
// npm install qrcode
import QRCode from 'qrcode'
const dataUrl = await QRCode.toDataURL(qrCodeString)
// แสดงใน <img src={dataUrl} />
```

**Option C — curl + Terminal (สำหรับ dev):**
```bash
# ติดตั้ง qrencode
brew install qrencode

# render QR ใน terminal
qrencode -t ANSIUTF8 "00020101021133..."
```

จากนั้น **Scan ด้วย BCEL One App** หรือ **OnePay App** แล้วจ่าย 1 KIP

---

### 5.6 ตรวจสอบว่า Payment สำเร็จ

**วิธี 1 — ดู Log** (เร็วสุด):
```
[PubNubPaymentSubscriber] PubNub RAW message channel=uuid-... msg={"uuid":"MM-439011-A1B2C3D4","ticket":"NQ81B8CYODO2",...}
[PaymentCallbackHandler] Payment confirmed bankRef=MM-439011-A1B2C3D4
```

**วิธี 2 — Polling API:**
```bash
GET /v1/payment/status/MM-439011-A1B2C3D4
Authorization: Bearer <accessToken>
```

Response เมื่อสำเร็จ:
```json
{
  "status": "SUCCESS",
  "amount": 1,
  "currency": "LAK",
  "paidAt": "2026-05-08T10:05:00.000Z"
}
```

---

### 5.7 ปัญหาที่พบบ่อยตอนทดสอบจริง

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| Scan QR แล้ว error ใน App | MCID/SHOPCODE ผิด | ขอ credentials ใหม่จาก OnePay |
| Scan ได้ แต่ backend ไม่รับ callback | PubNub Key ผิด | ตรวจสอบ `ONEPAY_PUBNUB_SUBSCRIBE_KEY` |
| QR หมดอายุก่อน scan | TTL 2 นาที | checkout ใหม่ และ scan ทันที |
| `status` ยังเป็น `PENDING` | PubNub message ยังไม่มา | รอ 5-10 วิ แล้ว polling อีกครั้ง |
| Course not found | courseId ผิด หรือ course ไม่ได้ status `WORKING` | ใช้ courseId ที่ถูกต้อง |

### 5.2 ทดสอบ PubNub Callback (Simulate)

สามารถ simulate payment สำเร็จได้โดยส่ง message ตรงเข้า PubNub channel ผ่าน PubNub Debug Console:

1. เปิด [PubNub Debug Console](https://www.pubnub.com/docs/console/)
2. ใส่ Subscribe Key: `sub-c-91489692-fa26-11e9-be22-ea7c5aada356`
3. ใส่ Publish Key (ขอจาก OnePay)
4. Channel: `uuid-{MCID}-{txnRef}` หรือ `dev-{txnRef}` (dev mode)
5. ส่ง message:
```json
{
  "uuid": "MM-439011-A1B2C3D4",
  "ticket": "TEST-TICKET-001",
  "amount": 1,
  "name": "Test User",
  "phone": "02012345678"
}
```

---

## 6. สาเหตุที่ Bank ไม่ Response กลับมา (Checklist)

ถ้า PubNub callback ไม่มาหรือ bank ไม่ response ให้ตรวจสอบตามลำดับ:

### ❌ ปัญหาที่พบบ่อย

| ปัญหา | วิธีตรวจสอบ | วิธีแก้ |
|-------|------------|--------|
| `ONEPAY_ENABLED=false` | ดู log: `"OnePay disabled"` | ตั้ง `ONEPAY_ENABLED=true` |
| MCID/SHOPCODE ผิด | ดู QR ที่ generate ออกมา | ขอ credentials ใหม่จาก OnePay |
| PubNub Subscribe Key ผิด | ดู log: `"PubNub network down"` | ตรวจสอบ key กับ OnePay |
| QR หมดอายุ | TTL = 2 นาที | generate QR ใหม่ |
| Amount = 0 | ดู QR string | ตั้ง `PAYMENT_TEST_AMOUNT=1` หรือใส่ราคา course |
| Channel subscribe ผิด | ดู log: `"Subscribed to OnePay channel"` | ตรวจสอบ channel naming |
| CRC ผิดใน QR | scan QR ด้วย app อื่น | ตรวจสอบ `OnepayQrBuilder` |

### ✅ Log ที่ควรเห็นเมื่อทำงานปกติ

```
[OnepayConfig] OnePay enabled with MCID=mch5c2f0404102fb
[PubNubPaymentSubscriber] Re-subscribing to X pending OnePay channels
[PubNubPaymentSubscriber] Subscribed to OnePay channel uuid-mch5c2f0404102fb-MM-439011-A1B2C3D4
[PubNubPaymentSubscriber] PubNub network up
[PubNubPaymentSubscriber] PubNub RAW message channel=... msg={"uuid":"MM-...","ticket":"..."}
[PaymentCallbackHandler] Payment confirmed bankRef=MM-439011-A1B2C3D4
```

---

## 7. API Endpoints สรุป

| Method | Endpoint | Role | คำอธิบาย |
|--------|----------|------|---------|
| `POST` | `/v1/payment/checkout` | STUDENT | สร้าง QR Code + subscribe PubNub |
| `GET` | `/v1/payment/status/:ref` | STUDENT | ตรวจสอบสถานะการชำระเงิน (polling) |

---

## 8. ติดต่อ OnePay

สำหรับขอ credentials หรือแก้ปัญหา:
- **OnePay Laos**: ติดต่อทีม technical support ของ OnePay/BCEL โดยตรง
- ข้อมูลที่ต้องเตรียม: ชื่อ merchant, ประเภทธุรกิจ, callback method (PubNub)
- ขอ document เพิ่มเติม: EMV QR spec, PubNub channel naming convention, test credentials
