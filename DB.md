# 🗄️ Database Design — My eCommerce

> **Stack:** PostgreSQL · Drizzle ORM · Bun  
> **Last Updated:** 2026-05-20  
> **v2** — เพิ่ม Coupon, Shipment, Address fields

---

## 📋 สารบัญ

- [Roles & Access](#roles--access)
- [Enums](#enums)
- [ERD Overview](#erd-overview)
- [Tables](#tables)
  - [AUTH](#auth)
  - [BANNER](#banner)
  - [PRODUCT](#product)
  - [VARIANT](#variant)
  - [ADDRESS](#address)
  - [COUPON](#coupon) ⭐ ใหม่
  - [CART](#cart)
  - [ORDER](#order)
  - [SHIPMENT](#shipment) ⭐ ใหม่
  - [TRANSACTION](#transaction)
  - [AUDIT LOG](#audit-log)
- [Relationships Summary](#relationships-summary)
- [Index Summary](#index-summary)
- [Business Rules](#business-rules)

---

## 👥 Roles & Access

| Role          | ขอบเขต                                                            |
| ------------- | ----------------------------------------------------------------- |
| `SUPER_ADMIN` | เข้าถึงทุกอย่าง, จัดการ Admin, ดู Audit Log ทั้งหมด              |
| `ADMIN`       | จัดการ Product, Order, Transaction, Banner, Coupon, Shipment      |
| `USER`        | ลูกค้า (Customer) — ดูสินค้า, สั่งซื้อ, ชำระเงิน, ติดตามพัสดุ   |

---

## 🔤 Enums

### `AdminRole`
| Value         | ความหมาย           |
| ------------- | ------------------ |
| `SUPER_ADMIN` | ผู้ดูแลระบบสูงสุด  |
| `ADMIN`       | ผู้ดูแลระบบทั่วไป  |

### `ColorType`
```
RED · GREEN · BLUE · YELLOW · BLACK · WHITE · GRAY
PURPLE · ORANGE · PINK · BROWN · GOLD · SILVER
```

### `Status` (Transaction)
| Value       | ความหมาย |
| ----------- | -------- |
| `PENDING`   | รอดำเนินการ |
| `COMPLETED` | สำเร็จ   |
| `FAILED`    | ล้มเหลว  |

### `BankType`
| Value  | ความหมาย                    |
| ------ | --------------------------- |
| `BCEL` | ທະນາຄານການຄ້າຕ່າງປະເທດລາວ  |
| `JDB`  | ທະນາຄານຮ່ວມພັດທະນາ          |
| `LDB`  | ທະນາຄານພັດທະນາລາວ           |

### `ShippingType`
| Value                | ความหมาย            |
| -------------------- | ------------------- |
| `RAIDER`             | Raider              |
| `ANOUSITH_EXPRESS`   | ອານຸສິດ ເອັກສເປຣດ   |
| `HOUNGALOUN_EXPRESS` | ຫອງຄຳ ເອັກສເປຣດ     |
| `MIXAY_EXPRESS`      | ມີໄຊ ເອັກສເປຣດ      |
| `UNITEL_EXPRESS`     | ຢູນິເທວ ເອັກສເປຣດ   |

### `PaymentMethod`
| Value | ความหมาย                           |
| ----- | ---------------------------------- |
| `QR`  | โอนผ่าน QR Code + แนบสลิป          |
| `COD` | เก็บเงินปลายทาง (Cash On Delivery) |

### `OrderStatus`
| Value        | ความหมาย                    | สถานะ      |
| ------------ | --------------------------- | ---------- |
| `PENDING`    | รอชำระเงิน                  | 🟡 รอ      |
| `CONFIRMED`  | ยืนยันชำระเงินแล้ว          | 🟢 ยืนยัน  |
| `PROCESSING` | กำลังเตรียมของ               | 🔵 เตรียม  |
| `SHIPPED`    | จัดส่งแล้ว                  | 🚚 ส่ง     |
| `DELIVERED`  | ลูกค้าได้รับสินค้าแล้ว       | ✅ สำเร็จ  |
| `CANCELLED`  | ยกเลิก                      | ❌ ยกเลิก  |
| `REFUNDED`   | คืนเงินแล้ว                 | 💸 คืนเงิน |

### `ShipmentStatus` ⭐
| Value       | ความหมาย                  |
| ----------- | ------------------------- |
| `PREPARING` | กำลังเตรียมพัสดุ           |
| `SHIPPED`   | ส่งออกแล้ว (มี tracking)  |
| `DELIVERED` | ลูกค้าได้รับแล้ว           |

### `CouponType` ⭐ ใหม่
| Value          | ความหมาย                          | ตัวอย่าง              |
| -------------- | --------------------------------- | --------------------- |
| `PERCENTAGE`   | ลดเป็น % จากยอดรวม                | `SALE20` → ลด 20%    |
| `FIXED_AMOUNT` | ลดจำนวนเงินคงที่                  | `OFF50K` → ลด 50,000 ₭ |

---

## 🗺️ ERD Overview

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│    Admin    │──────▶│  AuditLog    │       │   Banner     │
│             │──────▶│  Transactions│       └──────────────┘
└─────────────┘       │  (verifier)  │
                      └──────────────┘

┌──────────────┐    ┌────────────────────────────────────────┐
│   Customer   │───▶│               Order                    │
│              │    │  orderNumber / status / totalAmount    │
│  - addresses │    │  coupon_id(FK) / coupon_code(snapshot) │
│  - cart      │    │  shipping_cost                         │
│  - orders    │    └───────────┬──────────────┬─────────────┘
└──────────────┘                │              │
                                │ 1:N          │ 1:1
                                ▼              ▼
                        ┌──────────────┐  ┌──────────────┐
                        │  OrderItem   │  │  Shipment    │
                        │  (snapshot)  │  │  tracking #  │
                        └──────┬───────┘  └──────────────┘
                               │
              ┌────────────────┴──────────────────┐
              ▼                                   ▼
       ┌─────────────┐                  ┌──────────────────┐
       │   Product   │──── 1:N ────────▶│  ProductVariant  │
       │  qty/rsv    │                  │  (color + size)  │
       │  - images   │                  └────────┬─────────┘
       │  - category │                           │ N:1
       └──────┬──────┘                   ┌───────┴──────┐
              │ N:1                      │    Color     │
              ▼                          └──────────────┘
       ┌─────────────┐
       │  Category   │
       └─────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│     Cart     │───▶│   CartItem   │───▶│ Product/Variant  │
│  (1:1 cust) │    │              │    │                  │
└──────────────┘    └──────────────┘    └──────────────────┘

┌──────────────┐          ┌──────────────┐
│   Address    │◀─────────│   Coupon     │ (ใช้ใน Order)
│  + province  │          │  code/type/  │
│  + district  │          │  value/limit │
│  + village   │          └──────────────┘
│  + recipient │
└──────────────┘
```

---

## 📊 Tables

---

### AUTH

#### `admins`
| Column      | Type      | Constraint      | หมายเหตุ               |
| ----------- | --------- | --------------- | ---------------------- |
| `id`        | UUID      | PK              |                        |
| `email`     | String    | UNIQUE NOT NULL | ใช้ login              |
| `password`  | String    | NOT NULL        | bcrypt hashed          |
| `name`      | String    | NOT NULL        |                        |
| `role`      | AdminRole | DEFAULT `ADMIN` |                        |
| `is_active` | Boolean   | DEFAULT `true`  |                        |
| `created_at`| Timestamp | DEFAULT now()   |                        |
| `updated_at`| Timestamp | auto-update     |                        |
| `deleted_at`| Timestamp | NULLABLE        | soft delete            |

**Relations:** `verifiedTransactions[]`, `auditLogs[]`

---

#### `customers`
| Column        | Type      | Constraint       | หมายเหตุ              |
| ------------- | --------- | ---------------- | --------------------- |
| `id`          | UUID      | PK               |                       |
| `email`       | String    | UNIQUE NOT NULL  |                       |
| `password`    | String    | NULLABLE         | null = Google OAuth   |
| `name`        | String    | NOT NULL         |                       |
| `phone`       | String    | NULLABLE         |                       |
| `supabase_id` | String    | UNIQUE NULLABLE  | Google OAuth          |
| `is_active`   | Boolean   | DEFAULT `true`   |                       |
| `created_at`  | Timestamp | DEFAULT now()    |                       |
| `updated_at`  | Timestamp | auto-update      |                       |
| `deleted_at`  | Timestamp | NULLABLE         | soft delete           |

**Relations:** `addresses[]`, `cart` (1:1), `orders[]`

---

### BANNER

#### `banners`
| Column      | Type      | Constraint     | หมายเหตุ          |
| ----------- | --------- | -------------- | ----------------- |
| `id`        | UUID      | PK             |                   |
| `title`     | String    | NOT NULL       |                   |
| `image_url` | String    | NOT NULL       |                   |
| `link_url`  | String    | NULLABLE       | คลิกแล้วไปไหน    |
| `is_active` | Boolean   | DEFAULT `true` |                   |
| `order`     | Int       | DEFAULT `0`    | ลำดับแสดงผล       |
| `created_at`| Timestamp | DEFAULT now()  |                   |
| `updated_at`| Timestamp | auto-update    |                   |
| `deleted_at`| Timestamp | NULLABLE       | soft delete       |

---

### PRODUCT

#### `categories`
| Column      | Type      | Constraint    | หมายเหตุ    |
| ----------- | --------- | ------------- | ----------- |
| `id`        | UUID      | PK            |             |
| `name`      | String    | NOT NULL      |             |
| `created_at`| Timestamp | DEFAULT now() |             |
| `updated_at`| Timestamp | auto-update   |             |
| `deleted_at`| Timestamp | NULLABLE      | soft delete |

---

#### `products`
| Column         | Type          | Constraint      | หมายเหตุ                          |
| -------------- | ------------- | --------------- | --------------------------------- |
| `id`           | UUID          | PK              |                                   |
| `name`         | String        | NOT NULL        |                                   |
| `description`  | Text          | NULLABLE        | รายละเอียดสินค้า                   |
| `base_price`   | Decimal(10,2) | NOT NULL        | ราคาหลัก                          |
| `category_id`  | UUID          | FK → categories |                                   |
| `is_active`    | Boolean       | DEFAULT `true`  |                                   |
| `quantity`     | Int           | DEFAULT `0`     | stock ทั้งหมด (Product-level)     |
| `reserved_qty` | Int           | DEFAULT `0`     | lock ไว้ใน order pending          |
| `created_at`   | Timestamp     | DEFAULT now()   |                                   |
| `updated_at`   | Timestamp     | auto-update     |                                   |
| `deleted_at`   | Timestamp     | NULLABLE        | soft delete                       |

> 💡 `available stock = quantity - reserved_qty`

---

#### `product_images`
| Column      | Type      | Constraint        | หมายเหตุ         |
| ----------- | --------- | ----------------- | ---------------- |
| `id`        | UUID      | PK                |                  |
| `product_id`| UUID      | FK → products CASCADE |              |
| `url`       | String    | NOT NULL          |                  |
| `order`     | Int       | DEFAULT `0`       | ลำดับแสดงผล      |
| `is_main`   | Boolean   | DEFAULT `false`   | รูปหลัก          |
| `created_at`| Timestamp | DEFAULT now()     |                  |

---

### VARIANT

#### `colors`
| Column      | Type      | Constraint     | หมายเหตุ  |
| ----------- | --------- | -------------- | --------- |
| `id`        | UUID      | PK             |           |
| `color`     | ColorType | NOT NULL       |           |
| `is_active` | Boolean   | DEFAULT `true` |           |
| `created_at`| Timestamp | DEFAULT now()  |           |
| `updated_at`| Timestamp | auto-update    |           |

---

#### `product_variants`
| Column      | Type          | Constraint                     | หมายเหตุ                          |
| ----------- | ------------- | ------------------------------ | --------------------------------- |
| `id`        | UUID          | PK                             |                                   |
| `product_id`| UUID          | FK → products CASCADE          |                                   |
| `sku`       | String        | UNIQUE                         | เช่น `SHIRT-RED-M`                |
| `color_id`  | UUID          | FK → colors                    |                                   |
| `size`      | String        | NULLABLE                       |                                   |
| `price`     | Decimal(10,2) | NULLABLE                       | null = ใช้ base_price             |
| `image_url` | String        | NULLABLE                       | รูปเฉพาะ variant                   |
| `is_active` | Boolean       | DEFAULT `true`                 |                                   |
| `created_at`| Timestamp     | DEFAULT now()                  |                                   |
| `updated_at`| Timestamp     | auto-update                    |                                   |
| `deleted_at`| Timestamp     | NULLABLE                       | soft delete                       |

**Unique:** `(product_id, color_id, size)` — กัน variant ซ้ำ

---

### ADDRESS ⭐ อัปเดต

#### `addresses`
เพิ่มฟิลด์สำหรับ Laos logistics: แขวง, สาขา (เมือง/บ้าน), ชื่อ+เบอร์ผู้รับ

| Column            | Type      | Constraint        | หมายเหตุ                         |
| ----------------- | --------- | ----------------- | -------------------------------- |
| `id`              | UUID      | PK                |                                  |
| `customer_id`     | UUID      | FK → customers CASCADE |                             |
| `label`           | String    | NULLABLE          | "ບ້ານ", "ບ່ອນເຮັດວຽກ"           |
| `recipient_name`  | String    | NOT NULL          | ⭐ ຊື່ຜູ້ຮັບ                     |
| `recipient_phone` | String    | NOT NULL          | ⭐ ເບີໂທຜູ້ຮັບ                   |
| `province`        | String    | NOT NULL          | ⭐ ແຂວງ (เช่น ວຽງຈັນ)            |
| `district`        | String    | NOT NULL          | ⭐ ສາຂາ/ເມືອງ (เช่น ໄຊທານີ)      |
| `village`         | String    | NULLABLE          | ⭐ ບ້ານ (เช่น ໂນນສະຫວ່າງ)        |
| `address`         | String    | NOT NULL          | บ้านเลขที่ / รายละเอียดเพิ่มเติม  |
| `is_default`      | Boolean   | DEFAULT `false`   | ที่อยู่หลัก                       |
| `created_at`      | Timestamp | DEFAULT now()     |                                  |
| `updated_at`      | Timestamp | auto-update       |                                  |
| `deleted_at`      | Timestamp | NULLABLE          | soft delete                      |

> 💡 **ทำไมแยก province/district/village?**  
> ขนส่งใน Laos ต้องการ ແຂວງ + ສາຂາ แยกชัดเจน เพื่อให้ rider/express หาบ้านได้ถูก

---

### COUPON ⭐ ใหม่

#### `coupons`
ระบบ Coupon Code ส่วนลด

| Column          | Type          | Constraint     | หมายเหตุ                              |
| --------------- | ------------- | -------------- | ------------------------------------- |
| `id`            | UUID          | PK             |                                       |
| `code`          | String        | UNIQUE NOT NULL| `SALE20`, `SUMMER50K` — ตัวพิมพ์ใหญ่  |
| `type`          | CouponType    | NOT NULL       | `PERCENTAGE` หรือ `FIXED_AMOUNT`      |
| `value`         | Decimal(10,2) | NOT NULL       | 20 (%) หรือ 50000 (₭)                |
| `min_order_amt` | Decimal(10,2) | NULLABLE       | ยอดซื้อขั้นต่ำที่ใช้ได้               |
| `max_discount`  | Decimal(10,2) | NULLABLE       | จำกัดยอดลดสูงสุด (สำหรับ PERCENTAGE) |
| `usage_limit`   | Int           | NULLABLE       | null = ไม่จำกัด                       |
| `used_count`    | Int           | DEFAULT `0`    | ใช้ไปแล้วกี่ครั้ง                     |
| `is_active`     | Boolean       | DEFAULT `true` |                                       |
| `start_date`    | Timestamp     | NULLABLE       | วันเริ่มใช้งาน                        |
| `end_date`      | Timestamp     | NULLABLE       | วันหมดอายุ                            |
| `created_at`    | Timestamp     | DEFAULT now()  |                                       |
| `updated_at`    | Timestamp     | auto-update    |                                       |
| `deleted_at`    | Timestamp     | NULLABLE       | soft delete                           |

**Relations:** `orders[]` (Coupon ถูกใช้ใน Order ไหนบ้าง)

> 💡 **Coupon validation logic:**
> ```
> 1. code EXISTS และ is_active = true
> 2. now() ระหว่าง start_date ถึง end_date
> 3. used_count < usage_limit (ถ้ามี limit)
> 4. order total >= min_order_amt (ถ้ามี)
> ```

---

### CART

#### `carts`
| Column       | Type      | Constraint             | หมายเหตุ |
| ------------ | --------- | ---------------------- | -------- |
| `id`         | UUID      | PK                     |          |
| `customer_id`| UUID      | UNIQUE FK → customers  | 1:1      |
| `created_at` | Timestamp | DEFAULT now()          |          |
| `updated_at` | Timestamp | auto-update            |          |

#### `cart_items`
| Column              | Type      | Constraint             | หมายเหตุ             |
| ------------------- | --------- | ---------------------- | -------------------- |
| `id`                | UUID      | PK                     |                      |
| `cart_id`           | UUID      | FK → carts CASCADE     |                      |
| `product_id`        | UUID      | FK → products          |                      |
| `product_variant_id`| UUID      | NULLABLE FK → variants |                      |
| `quantity`          | Int       | DEFAULT `1`            |                      |
| `created_at`        | Timestamp | DEFAULT now()          |                      |
| `updated_at`        | Timestamp | auto-update            |                      |

---

### ORDER

#### `orders` ⭐ อัปเดต
| Column                | Type          | Constraint            | หมายเหตุ                           |
| --------------------- | ------------- | --------------------- | ---------------------------------- |
| `id`                  | UUID          | PK                    |                                    |
| `order_number`        | String        | UNIQUE                | `ORD-20260520-0001`               |
| `customer_id`         | UUID          | FK → customers        |                                    |
| `status`              | OrderStatus   | DEFAULT `PENDING`     |                                    |
| `subtotal`            | Decimal(10,2) | NOT NULL              | ⭐ ยอดรวมก่อนหัก discount          |
| `discount`            | Decimal(10,2) | DEFAULT `0`           | ยอดลดจาก coupon                    |
| `shipping_cost`       | Decimal(10,2) | DEFAULT `0`           | ⭐ ค่าขนส่ง                        |
| `total_amount`        | Decimal(10,2) | NOT NULL              | `subtotal - discount + shipping_cost` |
| `coupon_id`           | UUID          | NULLABLE FK → coupons | ⭐ coupon ที่ใช้                   |
| `coupon_code`         | String        | NULLABLE              | ⭐ snapshot code ณ เวลาซื้อ        |
| `shipping_address_id` | UUID          | FK → addresses        |                                    |
| `shipping_name`       | ShippingType  | NOT NULL              | snapshot ขนส่ง                     |
| `note`                | String        | NULLABLE              | ⭐ หมายเหตุจากลูกค้า               |
| `created_at`          | Timestamp     | DEFAULT now()         |                                    |
| `updated_at`          | Timestamp     | auto-update           |                                    |

> 💡 `total_amount = subtotal - discount + shipping_cost`

**Relations:** `customer`, `address`, `coupon`, `items[]`, `transaction` (1:1), `shipment` (1:1)

---

#### `order_items` — snapshot ราคา/ชื่อ ณ เวลาซื้อ
| Column              | Type          | Constraint             | หมายเหตุ                     |
| ------------------- | ------------- | ---------------------- | ---------------------------- |
| `id`                | UUID          | PK                     |                              |
| `order_id`          | UUID          | FK → orders CASCADE    |                              |
| `product_id`        | UUID          | FK → products          |                              |
| `product_variant_id`| UUID          | NULLABLE FK → variants |                              |
| `product_name`      | String        | NOT NULL               | 📸 snapshot ชื่อตอนซื้อ      |
| `product_image`     | String        | NULLABLE               | 📸 snapshot รูปตอนซื้อ       |
| `variant_sku`       | String        | NOT NULL               | 📸 snapshot SKU              |
| `color_name`        | ColorType     | NOT NULL               | 📸 snapshot สี               |
| `size`              | String        | NULLABLE               | 📸 snapshot ไซส์             |
| `quantity`          | Int           | NOT NULL               |                              |
| `unit_price`        | Decimal(10,2) | NOT NULL               | 📸 snapshot ราคาต่อชิ้น      |
| `subtotal`          | Decimal(10,2) | NOT NULL               | `unit_price × quantity`      |
| `created_at`        | Timestamp     | DEFAULT now()          |                              |

---

### SHIPMENT ⭐ ใหม่

#### `shipments`
ข้อมูลการจัดส่งและ tracking พัสดุ (1:1 กับ Order)

| Column            | Type           | Constraint          | หมายเหตุ                           |
| ----------------- | -------------- | ------------------- | ---------------------------------- |
| `id`              | UUID           | PK                  |                                    |
| `order_id`        | UUID           | UNIQUE FK → orders  | 1:1 กับ Order                      |
| `shipping_type`   | ShippingType   | NOT NULL            | snapshot ขนส่ง (ANOUSITH, MIXAY…) |
| `tracking_number` | String         | NULLABLE            | เลข tracking จากขนส่ง              |
| `status`          | ShipmentStatus | DEFAULT `PREPARING` | สถานะพัสดุ                        |
| `shipped_at`      | Timestamp      | NULLABLE            | วันที่ส่งออก                        |
| `delivered_at`    | Timestamp      | NULLABLE            | วันที่ส่งถึง                        |
| `note`            | String         | NULLABLE            | หมายเหตุ (เช่น เหตุล่าช้า)         |
| `created_at`      | Timestamp      | DEFAULT now()       |                                    |
| `updated_at`      | Timestamp      | auto-update         |                                    |

> 💡 เมื่อ Admin กรอก `tracking_number` → status เปลี่ยนเป็น `SHIPPED` อัตโนมัติ  
> เมื่อ status = `DELIVERED` → sync `OrderStatus` เป็น `DELIVERED` ด้วย

---

### TRANSACTION

#### `transactions`
| Column           | Type          | Constraint             | หมายเหตุ                     |
| ---------------- | ------------- | ---------------------- | ---------------------------- |
| `id`             | UUID          | PK                     |                              |
| `transaction_id` | String        | NOT NULL               | ID จากธนาคาร/gateway         |
| `merchant_id`    | String        | NOT NULL               |                              |
| `order_id`       | String        | NOT NULL               | รหัส order จาก merchant      |
| `merchant_name`  | String        | NOT NULL               |                              |
| `amount`         | Float         | NOT NULL               |                              |
| `status`         | Status        | NOT NULL               | PENDING / COMPLETED / FAILED |
| `post_request`   | String        | NOT NULL               | raw request log              |
| `bank_request`   | String        | NOT NULL               | raw bank request             |
| `bank_response`  | String        | NOT NULL               | raw bank response            |
| `bank_type`      | BankType      | NOT NULL               | BCEL / JDB / LDB             |
| `payment_method` | PaymentMethod | DEFAULT `QR`           | QR หรือ COD                  |
| `slip_url`       | String        | NULLABLE               | รูปสลิป (QR เท่านั้น)        |
| `order_ref`      | UUID          | UNIQUE FK → orders     | 1:1 กับ Order                |
| `verified_by`    | UUID          | NULLABLE FK → admins   | Admin ที่ verify             |
| `verified_at`    | Timestamp     | NULLABLE               |                              |
| `created_at`     | Timestamp     | DEFAULT now()          |                              |
| `updated_at`     | Timestamp     | auto-update            |                              |

---

### AUDIT LOG

#### `audit_logs`
| Column      | Type      | Constraint           | หมายเหตุ                    |
| ----------- | --------- | -------------------- | --------------------------- |
| `id`        | UUID      | PK                   |                             |
| `admin_id`  | UUID      | FK → admins CASCADE  |                             |
| `action`    | String    | NOT NULL             | `CREATE`, `UPDATE`, `DELETE`|
| `table_name`| String    | NOT NULL             | ชื่อ table ที่ถูกกระทบ      |
| `record_id` | String    | NOT NULL             | ID ของ record               |
| `old_value` | Json      | NULLABLE             | ค่าก่อนแก้ไข                |
| `new_value` | Json      | NULLABLE             | ค่าหลังแก้ไข                |
| `note`      | String    | NULLABLE             |                             |
| `created_at`| Timestamp | DEFAULT now()        |                             |

---

## 🔗 Relationships Summary

```
Admin           ──< AuditLog          (1:N)
Admin           ──< Transactions      (1:N — verified_by, optional)

Customer        ──< Address           (1:N)
Customer        ──  Cart              (1:1)
Customer        ──< Order             (1:N)

Coupon          ──< Order             (1:N — coupon ใช้ใน order)

Cart            ──< CartItem          (1:N)
CartItem        >── Product           (N:1)
CartItem        >── ProductVariant    (N:1, optional)

Category        ──< Product           (1:N)
Product         ──< ProductImage      (1:N)
Product         ──< ProductVariant    (1:N)

Order           ──< OrderItem         (1:N)
Order           ──  Transactions      (1:1)
Order           ──  Shipment          (1:1) ⭐
Order           >── Address           (N:1)
Order           >── Coupon            (N:1, optional) ⭐

OrderItem       >── Product           (N:1)
OrderItem       >── ProductVariant    (N:1, optional)
```

---

## 📑 Index Summary

| Table              | Index Fields                               | เหตุผล                          |
| ------------------ | ------------------------------------------ | ------------------------------- |
| `admins`           | `email`                                    | login                           |
| `customers`        | `email`                                    | login                           |
| `banners`          | `is_active`, `order`                       | query + sort                    |
| `products`         | `category_id`                              | filter by category              |
| `product_images`   | `product_id`                               | ดึงรูปของสินค้า                  |
| `product_variants` | `product_id`, `color_id`, `sku`            | ค้นหา variant                   |
| `addresses`        | `customer_id`                              | ดึง address ของลูกค้า           |
| `carts`            | `customer_id`                              | ดึงตะกร้า                       |
| `cart_items`       | `cart_id`                                  | ดึง item ในตะกร้า               |
| `coupons`          | `code`, `is_active`, `end_date`            | ⭐ validate coupon              |
| `orders`           | `customer_id`, `order_number`, `status`, `created_at` | query/filter           |
| `order_items`      | `order_id`, `product_id`                   | ดึง item ของ order             |
| `shipments`        | `order_id`, `tracking_number`, `status`    | ⭐ tracking                    |
| `transactions`     | `transaction_id`, `order_ref`, `status`    | ค้นหา transaction              |
| `audit_logs`       | `admin_id`, `table_name`, `created_at`     | filter audit                   |

---

## 📐 Business Rules

### 💰 ราคาสินค้า
- `ProductVariant.price` nullable → null = ใช้ `Product.basePrice`
- `OrderItem.unit_price` = **snapshot** ราคา ณ เวลาซื้อ

### 📦 Stock (Product-level)
```
available_stock = quantity - reserved_qty
```
| Event                    | Action                    |
| ------------------------ | ------------------------- |
| Order created (PENDING)  | `reserved_qty += qty`     |
| Order CANCELLED          | `reserved_qty -= qty`     |
| Order DELIVERED          | `quantity -= qty` + `reserved_qty -= qty` |

### 🏷️ Coupon Validation
```
✅ code exists + is_active = true
✅ now() between start_date and end_date
✅ used_count < usage_limit (ถ้ามี limit)
✅ order subtotal >= min_order_amt (ถ้ามี)

คำนวณ discount:
  PERCENTAGE   → discount = subtotal × (value/100), จำกัดที่ max_discount
  FIXED_AMOUNT → discount = value (ลดตรงๆ)

หลัง Order confirmed → used_count += 1
```

### 🔢 Order Number Format
```
ORD-YYYYMMDD-XXXX   →   ORD-20260520-0001
```
running number เริ่มใหม่ทุกวัน

### 💳 Payment Flow
```
QR:
  PENDING → (ลูกค้าโอน + แนบสลิป) → CONFIRMED → PROCESSING → SHIPPED → DELIVERED

COD:
  PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED (เก็บเงินตอนส่ง)

Cancel:  PENDING / CONFIRMED → CANCELLED
Refund:  DELIVERED → REFUNDED
```

### 🚚 Shipment Flow
```
Order PROCESSING → Shipment สร้าง (status: PREPARING)
Admin กรอก tracking number → status: SHIPPED + Order: SHIPPED
ลูกค้าได้รับ → status: DELIVERED + Order: DELIVERED
```

### 🔐 Soft Delete Tables
`admins` · `customers` · `categories` · `products` · `product_variants` · `addresses` · `coupons`

> ⚠️ Query ทุกครั้งต้อง `WHERE deleted_at IS NULL`

### 📸 Snapshot Fields (OrderItem)
เพราะสินค้าอาจถูกแก้ชื่อ/ราคา/ลบทิ้งหลังจากมีการซื้อไปแล้ว:
- `product_name`, `product_image`, `variant_sku`, `color_name`, `size`, `unit_price`

---

## 📊 Summary — All Tables

| # | Table              | กลุ่ม       | หมายเหตุ          |
|---|--------------------| ----------- | ----------------- |
| 1 | `admins`           | Auth        |                   |
| 2 | `customers`        | Auth        |                   |
| 3 | `banners`          | Marketing   |                   |
| 4 | `categories`       | Product     |                   |
| 5 | `products`         | Product     |                   |
| 6 | `product_images`   | Product     |                   |
| 7 | `colors`           | Variant     |                   |
| 8 | `product_variants` | Variant     |                   |
| 9 | `addresses`        | Customer    | ⭐ อัปเดต fields  |
|10 | `coupons`          | Marketing   | ⭐ ใหม่           |
|11 | `carts`            | Cart        |                   |
|12 | `cart_items`       | Cart        |                   |
|13 | `orders`           | Order       | ⭐ อัปเดต fields  |
|14 | `order_items`      | Order       |                   |
|15 | `shipments`        | Logistics   | ⭐ ใหม่           |
|16 | `transactions`     | Payment     |                   |
|17 | `audit_logs`       | System      |                   |

**รวม 17 Tables**

---

*Built with ❤️ — eCommerce System v2*
