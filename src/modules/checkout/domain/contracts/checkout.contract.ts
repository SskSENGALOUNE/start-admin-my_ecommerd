import { z } from "zod";

// ─── Enums (re-declared to avoid circular deps) ───────────────────────────────

export const ShippingTypeSchema = z.enum([
  "RAIDER",
  "ANOUSITH_EXPRESS",
  "HOUNGALOUN_EXPRESS",
  "MIXAY_EXPRESS",
  "UNITEL_EXPRESS",
]);
export type ShippingType = z.infer<typeof ShippingTypeSchema>;

export const PaymentMethodSchema = z.enum(["QR", "COD"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// ─── Validate Coupon ──────────────────────────────────────────────────────────

export const ValidateCouponSchema = z.object({
  code: z.string().min(1, "ກະລຸນາປ້ອນ Coupon Code"),
  subtotal: z.number().positive("ຍອດຊື້ຕ້ອງຫຼາຍກວ່າ 0"),
});
export type ValidateCouponDTO = z.infer<typeof ValidateCouponSchema>;

export const ValidateCouponResponseSchema = z.object({
  code: z.string(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.string(),
  discount: z.number(), // actual LAK discount for the given subtotal
});
export type ValidateCouponResponse = z.infer<typeof ValidateCouponResponseSchema>;

// ─── Place Order ──────────────────────────────────────────────────────────────

export const PlaceOrderSchema = z.object({
  // Shipping address
  recipientName: z.string().min(1, "ກະລຸນາປ້ອນຊື່ຜູ້ຮັບ"),
  recipientPhone: z.string().min(1, "ກະລຸນາປ້ອນເບີໂທ"),
  province: z.string().min(1, "ກະລຸນາເລືອກແຂວງ"),
  district: z.string().min(1, "ກະລຸນາປ້ອນເມືອງ"),
  village: z.string().optional(),
  address: z.string().min(1, "ກະລຸນາປ້ອນທີ່ຢູ່ລະອຽດ"),
  // Shipping provider
  shippingName: ShippingTypeSchema,
  // Payment method
  paymentMethod: PaymentMethodSchema,
  // Optional coupon
  couponCode: z.string().optional(),
  // Optional note
  note: z.string().optional(),
});
export type PlaceOrderDTO = z.infer<typeof PlaceOrderSchema>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const PlaceOrderResponseSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  totalAmount: z.string(),
  discount: z.string(),
  paymentMethod: PaymentMethodSchema,
  /** EMV QR string — only present for QR payment. Pass to react-qr-code to render. */
  qrString: z.string().nullable(),
  /** PubNub channel ID — only present for QR payment. Used for real-time confirmation. */
  channelId: z.string().nullable(),
});
export type PlaceOrderResponse = z.infer<typeof PlaceOrderResponseSchema>;
