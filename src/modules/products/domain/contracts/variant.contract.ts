import { z } from "zod";

export const ColorSchema = z.object({
  id: z.string(),
  color: z.string(),
  isActive: z.boolean(),
});
export type ColorDTO = z.infer<typeof ColorSchema>;

export const VariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string().nullable(),
  colorId: z.string().nullable(),
  colorName: z.string().nullable(),
  size: z.string().nullable(),
  price: z.string().nullable(), // numeric → string from pg
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type VariantDTO = z.infer<typeof VariantSchema>;

export const CreateVariantSchema = z.object({
  colorId: z.string().min(1, "ກະລຸນາເລືອກສີ"),
  size: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});
export type CreateVariantDTO = z.infer<typeof CreateVariantSchema>;

export const UpdateVariantSchema = z.object({
  colorId: z.string().optional(),
  size: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});
export type UpdateVariantDTO = z.infer<typeof UpdateVariantSchema>;

export const VariantIdParamSchema = z.object({
  id: z.string().min(1),
  vid: z.string().min(1),
});
