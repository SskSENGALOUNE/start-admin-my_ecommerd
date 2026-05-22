import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";
import { getOrCreateCart } from "./get-cart";

export async function updateCartItem(
  customerId: string,
  itemId: string,
  quantity: number,
  client: DbTransaction,
) {
  const cart = await getOrCreateCart(customerId, client);

  const [item] = await client
    .select()
    .from(schema.cartItems)
    .where(eq(schema.cartItems.id, itemId))
    .limit(1);

  if (!item || item.cartId !== cart.id) {
    throw new Error("ບໍ່ພົບລາຍການໃນກະຕ່າ");
  }

  await client
    .update(schema.cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(schema.cartItems.id, itemId));

  return getOrCreateCart(customerId, client);
}
