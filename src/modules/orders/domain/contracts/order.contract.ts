import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const OrderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentMethodSchema = z.enum(["QR", "COD"]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const ShippingTypeSchema = z.enum([
  "RAIDER",
  "ANOUSITH_EXPRESS",
  "HOUNGALOUN_EXPRESS",
  "MIXAY_EXPRESS",
  "UNITEL_EXPRESS",
]);
export type ShippingType = z.infer<typeof ShippingTypeSchema>;

// ─── Order Item DTO ───────────────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string().nullable(),
  productVariantId: z.string().nullable(),
  productName: z.string(),
  productImage: z.string().nullable(),
  variantSku: z.string().nullable(),
  colorName: z.string().nullable(),
  size: z.string().nullable(),
  quantity: z.number(),
  unitPrice: z.string(),
  subtotal: z.string(),
  createdAt: z.coerce.date(),
});
export type OrderItemDTO = z.infer<typeof OrderItemSchema>;

// ─── Shipment (inside order detail) ──────────────────────────────────────────

export const OrderShipmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  shippingType: z.string(),
  trackingNumber: z.string().nullable(),
  status: z.enum(["PREPARING", "SHIPPED", "DELIVERED"]),
  shippedAt: z.coerce.date().nullable(),
  deliveredAt: z.coerce.date().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type OrderShipmentDTO = z.infer<typeof OrderShipmentSchema>;

// ─── Transaction (inside order detail) ───────────────────────────────────────

export const OrderTransactionSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  amount: z.string(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
  paymentMethod: z.enum(["QR", "COD"]),
  bankType: z.string().nullable(), // null for COD
  slipUrl: z.string().nullable(),
  verifiedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
export type OrderTransactionDTO = z.infer<typeof OrderTransactionSchema>;

// ─── Order DTO ────────────────────────────────────────────────────────────────

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  customerPhone: z.string().nullable(),
  status: OrderStatusSchema,
  subtotal: z.string(),
  discount: z.string(),
  shippingCost: z.string(),
  totalAmount: z.string(),
  couponCode: z.string().nullable(),
  shippingName: ShippingTypeSchema,
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type OrderDTO = z.infer<typeof OrderSchema>;

// ─── Order Detail DTO (with related data) ────────────────────────────────────

export const OrderDetailSchema = OrderSchema.extend({
  items: z.array(OrderItemSchema),
  shipment: OrderShipmentSchema.nullable(),
  transaction: OrderTransactionSchema.nullable(),
  // Snapshot address
  shippingAddressId: z.string().nullable(),
});
export type OrderDetailDTO = z.infer<typeof OrderDetailSchema>;

// ─── List Query ───────────────────────────────────────────────────────────────

export const OrderQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: OrderStatusSchema.optional(),
  search: z.string().optional(), // order number or customer name
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export type OrderQueryDTO = z.infer<typeof OrderQuerySchema>;

// ─── Update Status ────────────────────────────────────────────────────────────

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "REFUNDED"]),
});
export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>;

export const OrderIdParamSchema = z.object({ id: z.string().min(1) });
export type OrderIdParamDTO = z.infer<typeof OrderIdParamSchema>;
