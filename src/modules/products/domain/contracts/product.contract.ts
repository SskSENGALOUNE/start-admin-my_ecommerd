import { z } from "zod";

// ─── Product ──────────────────────────────────────────────────────────────────

export const ProductImageSchema = z.object({
  id: z.string(),
  productId: z.string(),
  url: z.string(),
  order: z.number(),
  isMain: z.boolean(),
  createdAt: z.coerce.date(),
});
export type ProductImageDTO = z.infer<typeof ProductImageSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  basePrice: z.string(), // numeric comes back as string from pg
  categoryId: z.string().nullable(),
  categoryName: z.string().nullable(),
  isActive: z.boolean(),
  quantity: z.number(),
  reservedQty: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  images: z.array(ProductImageSchema).default([]),
});
export type ProductDTO = z.infer<typeof ProductSchema>;

export const CreateProductSchema = z.object({
  name: z.string().min(1, "ກະລຸນາໃສ່ຊື່ສິນຄ້າ"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "ລາຄາຕ້ອງ >= 0"),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  imageKeys: z.array(z.string()).default([]), // S3 keys จาก presigned upload
});
export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  basePrice: z.number().min(0).optional(),
  categoryId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
});
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;

export const ProductIdParamSchema = z.object({ id: z.string().min(1) });

export const ProductQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});
export type ProductQueryDTO = z.infer<typeof ProductQuerySchema>;
