import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, sql } from "drizzle-orm";

/** Get or create cart + enrich items with product info */
export async function getOrCreateCart(customerId: string, client: DbTransaction) {
  // Get or create the cart row
  let [cart] = await client
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.customerId, customerId))
    .limit(1);

  if (!cart) {
    [cart] = await client
      .insert(schema.carts)
      .values({ customerId })
      .returning();
  }

  if (!cart) throw new Error("ສ້າງກະຕ່າລົ້ມເຫຼວ");

  // Get items enriched with product + variant info
  const items = await client
    .select({
      id: schema.cartItems.id,
      cartId: schema.cartItems.cartId,
      productId: schema.cartItems.productId,
      productVariantId: schema.cartItems.productVariantId,
      quantity: schema.cartItems.quantity,
      // Product info
      productName: schema.products.name,
      productImage: sql<string | null>`(
        SELECT url FROM product_images
        WHERE product_id = ${schema.products.id} AND is_main = true
        LIMIT 1
      )`,
      basePrice: schema.products.basePrice,
      // Variant info
      variantSku: schema.productVariants.sku,
      variantPrice: schema.productVariants.price,
      colorName: schema.colors.color,
      size: schema.productVariants.size,
    })
    .from(schema.cartItems)
    .leftJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
    .leftJoin(schema.productVariants, eq(schema.cartItems.productVariantId, schema.productVariants.id))
    .leftJoin(schema.colors, eq(schema.productVariants.colorId, schema.colors.id))
    .where(and(eq(schema.cartItems.cartId, cart.id)));

  const enriched = items.map((item) => {
    const unitPrice = item.variantPrice ?? item.basePrice ?? "0";
    const subtotal = String(Number(unitPrice) * item.quantity);
    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      productVariantId: item.productVariantId,
      productName: item.productName ?? "ບໍ່ພົບສິນຄ້າ",
      productImage: item.productImage ?? null,
      variantSku: item.variantSku ?? null,
      colorName: item.colorName ?? null,
      size: item.size ?? null,
      unitPrice,
      quantity: item.quantity,
      subtotal,
    };
  });

  const totalItems = enriched.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = enriched.reduce((s, i) => s + Number(i.subtotal), 0).toString();

  return {
    id: cart.id,
    customerId: cart.customerId,
    items: enriched,
    totalItems,
    totalAmount,
  };
}
