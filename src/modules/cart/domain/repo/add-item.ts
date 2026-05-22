import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";
import type { AddCartItemDTO } from "../contracts/cart.contract";
import { getOrCreateCart } from "./get-cart";

export async function addCartItem(
  customerId: string,
  input: AddCartItemDTO,
  client: DbTransaction,
) {
  // Validate product exists + active + has stock
  const [product] = await client
    .select({
      id: schema.products.id,
      quantity: schema.products.quantity,
      reservedQty: schema.products.reservedQty,
      isActive: schema.products.isActive,
    })
    .from(schema.products)
    .where(
      and(
        eq(schema.products.id, input.productId),
        isNull(schema.products.deletedAt),
        eq(schema.products.isActive, true),
      ),
    )
    .limit(1);

  if (!product) throw new Error("ບໍ່ພົບສິນຄ້າ");

  const available = product.quantity - product.reservedQty;
  if (available < input.quantity) {
    throw new Error(`ສະຕ໋ອກບໍ່ພໍ — ເຫຼືອ ${available} ຊິ້ນ`);
  }

  // Get or create cart
  const cart = await getOrCreateCart(customerId, client);

  // Check if same item already in cart → increment quantity
  const [existing] = await client
    .select()
    .from(schema.cartItems)
    .where(
      and(
        eq(schema.cartItems.cartId, cart.id),
        eq(schema.cartItems.productId, input.productId),
        input.productVariantId
          ? eq(schema.cartItems.productVariantId, input.productVariantId)
          : isNull(schema.cartItems.productVariantId),
      ),
    )
    .limit(1);

  if (existing) {
    const newQty = existing.quantity + input.quantity;
    if (newQty > available) throw new Error(`ສະຕ໋ອກບໍ່ພໍ — ເຫຼືອ ${available} ຊິ້ນ`);
    await client
      .update(schema.cartItems)
      .set({ quantity: newQty, updatedAt: new Date() })
      .where(eq(schema.cartItems.id, existing.id));
  } else {
    await client.insert(schema.cartItems).values({
      cartId: cart.id,
      productId: input.productId,
      productVariantId: input.productVariantId ?? null,
      quantity: input.quantity,
    });
  }

  return getOrCreateCart(customerId, client);
}
