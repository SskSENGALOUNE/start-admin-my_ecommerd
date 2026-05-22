import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";
import { getOrCreateCart } from "./get-cart";

export async function removeCartItem(
  customerId: string,
  itemId: string,
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

  await client.delete(schema.cartItems).where(eq(schema.cartItems.id, itemId));
  return getOrCreateCart(customerId, client);
}

export async function clearCart(customerId: string, client: DbTransaction) {
  const cart = await getOrCreateCart(customerId, client);
  await client
    .delete(schema.cartItems)
    .where(eq(schema.cartItems.cartId, cart.id));
  return getOrCreateCart(customerId, client);
}
