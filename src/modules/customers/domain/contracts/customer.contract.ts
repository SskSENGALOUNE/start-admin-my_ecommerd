import { z } from "zod";

export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});
export type CustomerDTO = z.infer<typeof CustomerSchema>;

// ─── Detail (with counts) ─────────────────────────────────────────────────────
export const CustomerDetailSchema = CustomerSchema.extend({
  totalOrders: z.number(),
  totalSpent: z.string(),
});
export type CustomerDetailDTO = z.infer<typeof CustomerDetailSchema>;

// ─── Address ──────────────────────────────────────────────────────────────────
export const CustomerAddressSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  label: z.string().nullable(),
  recipientName: z.string(),
  recipientPhone: z.string(),
  province: z.string(),
  district: z.string(),
  village: z.string().nullable(),
  address: z.string(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
});
export type CustomerAddressDTO = z.infer<typeof CustomerAddressSchema>;

// ─── Order Summary (in customer detail) ──────────────────────────────────────
export const CustomerOrderSummarySchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: z.string(),
  totalAmount: z.string(),
  createdAt: z.coerce.date(),
});
export type CustomerOrderSummaryDTO = z.infer<typeof CustomerOrderSummarySchema>;

// ─── List Query ───────────────────────────────────────────────────────────────
export const CustomerQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
export type CustomerQueryDTO = z.infer<typeof CustomerQuerySchema>;

export const CustomerIdParamSchema = z.object({ id: z.string().min(1) });
