import { z } from "zod";

export const ShipmentStatusSchema = z.enum(["PREPARING", "SHIPPED", "DELIVERED"]);
export type ShipmentStatus = z.infer<typeof ShipmentStatusSchema>;

export const ShippingTypeSchema = z.enum([
  "RAIDER",
  "ANOUSITH_EXPRESS",
  "HOUNGALOUN_EXPRESS",
  "MIXAY_EXPRESS",
  "UNITEL_EXPRESS",
]);
export type ShippingType = z.infer<typeof ShippingTypeSchema>;

export const ShipmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  shippingType: ShippingTypeSchema,
  trackingNumber: z.string().nullable(),
  status: ShipmentStatusSchema,
  shippedAt: z.coerce.date().nullable(),
  deliveredAt: z.coerce.date().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ShipmentDTO = z.infer<typeof ShipmentSchema>;

// ─── Create Shipment ──────────────────────────────────────────────────────────
export const CreateShipmentSchema = z.object({
  orderId: z.string().min(1),
  shippingType: ShippingTypeSchema,
  note: z.string().optional(),
});
export type CreateShipmentDTO = z.infer<typeof CreateShipmentSchema>;

// ─── Update Tracking ──────────────────────────────────────────────────────────
export const UpdateTrackingSchema = z.object({
  trackingNumber: z.string().min(1, "ກະລຸນາໃສ່ເລກ Tracking"),
  note: z.string().optional(),
});
export type UpdateTrackingDTO = z.infer<typeof UpdateTrackingSchema>;

// ─── Params ───────────────────────────────────────────────────────────────────
export const ShipmentIdParamSchema = z.object({ id: z.string().min(1) });
export const OrderIdParamSchema = z.object({ orderId: z.string().min(1) });
