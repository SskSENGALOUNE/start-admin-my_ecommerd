import { z } from "zod";

export const CartItemSchema = z.object({
  id: z.string(),
  cartId: z.string(),
  productId: z.string().nullable(),
  productVariantId: z.string().nullable(),
  // Denormalized for display
  productName: z.string(),
  productImage: z.string().nullable(),
  variantSku: z.string().nullable(),
  colorName: z.string().nullable(),
  size: z.string().nullable(),
  unitPrice: z.string(), // effective price
  quantity: z.number(),
  subtotal: z.string(),
});
export type CartItemDTO = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(CartItemSchema),
  totalItems: z.number(),
  totalAmount: z.string(),
});
export type CartDTO = z.infer<typeof CartSchema>;

// ─── API input ────────────────────────────────────────────────────────────────
export const AddCartItemSchema = z.object({
  productId: z.string().min(1),
  productVariantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});
export type AddCartItemDTO = z.infer<typeof AddCartItemSchema>;

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});
export type UpdateCartItemDTO = z.infer<typeof UpdateCartItemSchema>;

export const CartItemIdParam = z.object({ itemId: z.string().min(1) });
