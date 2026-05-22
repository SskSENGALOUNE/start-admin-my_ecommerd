import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq, sql } from "drizzle-orm";

/**
 * Cancel an order — only allowed when status is PENDING or CONFIRMED.
 * Also releases reserved stock for all items.
 */
export async function cancelOrder(id: string, client: DbTransaction) {
  const [order] = await client
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);

  if (!order) return null;

  if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
    throw new Error("ສາມາດຍົກເລີກໄດ້ສະເພາະ PENDING ຫຼື CONFIRMED ເທົ່ານັ້ນ");
  }

  // Release reserved stock for each item
  const items = await client
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));

  for (const item of items) {
    if (item.productId) {
      // Decrement reservedQty (floor at 0 to avoid negative values)
      await client
        .update(schema.products)
        .set({
          reservedQty: sql`GREATEST(${schema.products.reservedQty} - ${item.quantity}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, item.productId));
    }
  }

  const [updated] = await client
    .update(schema.orders)
    .set({ status: "CANCELLED", updatedAt: new Date() })
    .where(eq(schema.orders.id, id))
    .returning();

  return updated ?? null;
}
