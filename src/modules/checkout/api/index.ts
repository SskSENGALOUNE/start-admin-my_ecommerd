import { and, eq, isNull, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { getOrCreateCart } from "@/modules/cart/domain/repo/get-cart";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/modules/customer-auth/domain/services/customer-auth.service";
import { generateOrderNumber } from "@/modules/orders/domain/services/order-number.service";
import { generateQr } from "@/modules/payment/domain/services/onepay.service";
import { subscribeChannel } from "@/modules/payment/domain/services/pubnub.subscriber";
import { schema } from "@/server/platform/db/client";
import { serverContext } from "@/server/platform/http/context";
import type { DbTransaction } from "@/shared/types";
import {
  PlaceOrderSchema,
  ValidateCouponSchema,
} from "../domain/contracts/checkout.contract";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Flat-rate shipping cost in LAK */
const SHIPPING_COST = 25000;

// ─── Auth helper ──────────────────────────────────────────────────────────────

function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CUSTOMER_COOKIE}=`));
  return match ? match.slice(CUSTOMER_COOKIE.length + 1) : null;
}

// ─── Coupon helpers ───────────────────────────────────────────────────────────

type CouponRow = typeof schema.coupons.$inferSelect;

/**
 * Validate a coupon code against the DB and a given subtotal.
 * Returns the coupon row if valid, or throws an Error with a Lao message.
 */
async function validateCoupon(
  code: string,
  subtotal: number,
  client: DbTransaction,
): Promise<CouponRow> {
  const [coupon] = await client
    .select()
    .from(schema.coupons)
    .where(
      and(
        eq(schema.coupons.code, code.toUpperCase().trim()),
        eq(schema.coupons.isActive, true),
        isNull(schema.coupons.deletedAt),
      ),
    )
    .limit(1);

  if (!coupon) throw new Error("Coupon Code ບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ມີຢູ່ໃນລະບົບ");

  // Date range check
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    throw new Error("Coupon ຍັງບໍ່ຮອດວັນເລີ່ມໃຊ້");
  }
  if (coupon.endDate && now > coupon.endDate) {
    throw new Error("Coupon ໝົດອາຍຸແລ້ວ");
  }

  // Usage limit check
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon ຖືກໃຊ້ຄົບຈຳນວນແລ້ວ");
  }

  // Minimum order amount check
  if (coupon.minOrderAmt !== null && subtotal < Number(coupon.minOrderAmt)) {
    throw new Error(
      `ຕ້ອງຊື້ຂັ້ນຕ່ຳ ${Number(coupon.minOrderAmt).toLocaleString("lo-LA")} ກີບ ເພື່ອໃຊ້ Coupon ນີ້`,
    );
  }

  return coupon;
}

/**
 * Calculate actual LAK discount from a validated coupon.
 * PERCENTAGE: subtotal × (value/100), capped at maxDiscount if set.
 * FIXED_AMOUNT: value, capped at subtotal (can't discount more than total).
 */
function calcDiscount(coupon: CouponRow, subtotal: number): number {
  if (coupon.type === "PERCENTAGE") {
    const raw = subtotal * (Number(coupon.value) / 100);
    const capped = coupon.maxDiscount
      ? Math.min(raw, Number(coupon.maxDiscount))
      : raw;
    return Math.floor(capped); // LAK is integer
  }
  // FIXED_AMOUNT
  return Math.min(Math.floor(Number(coupon.value)), subtotal);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export const checkoutRoutes = new Elysia({ prefix: "/checkout" })
  .use(serverContext)

  // ── POST /checkout/validate-coupon ─────────────────────────────────────────
  // Validate coupon before placing order — returns discount amount for UI preview
  .post(
    "/validate-coupon",
    async ({ request, body, status, db }) => {
      const token = getTokenFromRequest(request);
      if (!token) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      const session = await verifyCustomerToken(token);
      if (!session) return status(401, { message: "Session ໝົດອາຍຸ" });

      try {
        const coupon = await validateCoupon(body.code, body.subtotal, db);
        const discount = calcDiscount(coupon, body.subtotal);

        return {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount,
        };
      } catch (err) {
        return status(400, {
          message: err instanceof Error ? err.message : "Coupon ບໍ່ຖືກຕ້ອງ",
        });
      }
    },
    { body: ValidateCouponSchema },
  )

  // ── POST /checkout ──────────────────────────────────────────────────────────
  // Place order from cart
  .post(
    "/",
    async ({ request, body, status, db }) => {
      // ── 1. Auth ────────────────────────────────────────────────────────────
      const token = getTokenFromRequest(request);
      if (!token) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });

      const session = await verifyCustomerToken(token);
      if (!session) return status(401, { message: "Session ໝົດອາຍຸ" });

      // ── 2. Validate cart ───────────────────────────────────────────────────
      const cart = await getOrCreateCart(session.id, db);
      if (cart.items.length === 0) {
        return status(400, { message: "ກະຕ່າຍັງວ່າງ — ກະລຸນາເລືອກສິນຄ້າກ່ອນ" });
      }

      // ── 3. Calculate subtotal ──────────────────────────────────────────────
      const subtotal = Number(cart.totalAmount);

      // ── 4. DB transaction ──────────────────────────────────────────────────
      const result = await db.transaction(async (tx) => {
        // 4a. Coupon validation (inside tx for consistency)
        let discount = 0;
        let couponId: string | null = null;
        let couponCode: string | null = null;

        if (body.couponCode) {
          let coupon: CouponRow;
          try {
            coupon = await validateCoupon(body.couponCode, subtotal, tx);
          } catch (err) {
            throw new Error(
              err instanceof Error ? err.message : "Coupon ບໍ່ຖືກຕ້ອງ",
            );
          }

          discount = calcDiscount(coupon, subtotal);
          couponId = coupon.id;
          couponCode = coupon.code;

          // Increment used count atomically
          await tx
            .update(schema.coupons)
            .set({
              usedCount: sql`used_count + 1`,
              updatedAt: new Date(),
            })
            .where(eq(schema.coupons.id, coupon.id));
        }

        const totalAmount = subtotal + SHIPPING_COST - discount;

        // 4b. Create shipping address
        const [address] = await tx
          .insert(schema.addresses)
          .values({
            customerId: session.id,
            recipientName: body.recipientName,
            recipientPhone: body.recipientPhone,
            province: body.province,
            district: body.district,
            village: body.village ?? null,
            address: body.address,
            isDefault: false,
          })
          .returning({ id: schema.addresses.id });

        if (!address) throw new Error("ສ້າງທີ່ຢູ່ລົ້ມເຫຼວ");

        // 4c. Generate order number
        const orderNumber = await generateOrderNumber(tx);

        // 4d. Create order
        const [order] = await tx
          .insert(schema.orders)
          .values({
            orderNumber,
            customerId: session.id,
            status: "PENDING",
            subtotal: String(subtotal),
            discount: String(discount),
            shippingCost: String(SHIPPING_COST),
            totalAmount: String(totalAmount),
            couponId: couponId ?? null,
            couponCode: couponCode ?? null,
            shippingAddressId: address.id,
            shippingName: body.shippingName,
            note: body.note ?? null,
          })
          .returning({
            id: schema.orders.id,
            orderNumber: schema.orders.orderNumber,
            totalAmount: schema.orders.totalAmount,
            discount: schema.orders.discount,
          });

        if (!order) throw new Error("ສ້າງ Order ລົ້ມເຫຼວ");

        // 4e. Insert order_items (price + name snapshot) + reserve stock
        for (const item of cart.items) {
          await tx.insert(schema.orderItems).values({
            orderId: order.id,
            productId: item.productId,
            productVariantId: item.productVariantId ?? null,
            productName: item.productName,
            productImage: item.productImage ?? null,
            variantSku: item.variantSku,
            colorName: item.colorName as
              | (typeof schema.colors.$inferSelect)["color"]
              | null,
            size: item.size ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          });

          if (item.productId) {
            await tx
              .update(schema.products)
              .set({
                reservedQty: sql`reserved_qty + ${item.quantity}`,
                updatedAt: new Date(),
              })
              .where(eq(schema.products.id, item.productId));
          }
        }

        // 4f. Create transaction record
        let txnRef: string;
        let qrString: string | null = null;
        let channelId: string | null = null;

        if (body.paymentMethod === "QR") {
          const qr = generateQr(totalAmount, order.id);
          txnRef = qr.txnRef;
          qrString = qr.qrString;
          channelId = qr.channelId;
        } else {
          txnRef = `COD-${orderNumber}`;
        }

        await tx.insert(schema.transactions).values({
          transactionId: txnRef,
          merchantId: "LAOSHOP",
          merchantName: "LaoShop",
          amount: String(totalAmount),
          status: "PENDING",
          bankType: body.paymentMethod === "QR" ? "BCEL" : null,
          paymentMethod: body.paymentMethod,
          orderRef: order.id,
        });

        // 4g. Clear cart
        await tx
          .delete(schema.cartItems)
          .where(eq(schema.cartItems.cartId, cart.id));

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          discount: order.discount,
          paymentMethod: body.paymentMethod,
          qrString: qrString ?? null,
          txnRef: body.paymentMethod === "QR" ? txnRef : null,
          channelId: channelId ?? null,
        };
      });

      // ── 5. Subscribe PubNub AFTER DB commit ────────────────────────────────
      if (body.paymentMethod === "QR" && result.txnRef) {
        subscribeChannel(result.txnRef);
      }

      return {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        discount: result.discount,
        paymentMethod: result.paymentMethod,
        qrString: result.qrString,
      };
    },
    { body: PlaceOrderSchema },
  );
