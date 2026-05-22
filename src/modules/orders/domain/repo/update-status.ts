import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq, sql } from "drizzle-orm";
import type { OrderStatus } from "../contracts/order.contract";

/**
 * Update order status with stock side-effects:
 *
 * PENDING → CONFIRMED  : reservedQty += qty  (reserve stock)
 * Any    → DELIVERED   : quantity -= qty, reservedQty -= qty  (consume stock)
 *                        ⚠️ If called via Shipment.markDelivered(), pass skipStockOnDelivered=true
 *                           to avoid double-deduction (shipment path handles stock itself)
 * Any    → CANCELLED   : use cancelOrder() instead
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  client: DbTransaction,
  { skipStockOnDelivered = false }: { skipStockOnDelivered?: boolean } = {},
) {
  // Get current order first
  const [order] = await client
    .select({ id: schema.orders.id, status: schema.orders.status })
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);

  if (!order) return null;

  // ── Side-effects on stock ────────────────────────────────────────────────────

  // PENDING → CONFIRMED: reserve stock
  if (order.status === "PENDING" && status === "CONFIRMED") {
    const items = await client
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));

    for (const item of items) {
      if (item.productId) {
        await client
          .update(schema.products)
          .set({
            reservedQty: sql`${schema.products.reservedQty} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(schema.products.id, item.productId));
      }
    }
  }

  // → DELIVERED: deduct actual stock + release reserved
  // (skip when called from Shipment.markDelivered to avoid double-deduction)
  if (status === "DELIVERED" && !skipStockOnDelivered) {
    const items = await client
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));

    for (const item of items) {
      if (item.productId) {
        await client
          .update(schema.products)
          .set({
            quantity: sql`GREATEST(${schema.products.quantity} - ${item.quantity}, 0)`,
            reservedQty: sql`GREATEST(${schema.products.reservedQty} - ${item.quantity}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(schema.products.id, item.productId));
      }
    }
  }

  // ── Update order status ──────────────────────────────────────────────────────
  const [row] = await client
    .update(schema.orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.orders.id, id))
    .returning();

  return row ?? null;
}
