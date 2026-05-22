import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq, sql } from "drizzle-orm";

/**
 * Admin confirms delivery → shipment DELIVERED, order DELIVERED.
 *
 * Stock side-effect (per CLAUDE.md):
 *   DELIVERED → quantity -= qty, reservedQty -= qty
 *
 * NOTE: We handle stock here directly (not via updateOrderStatus)
 * to avoid double-deduction — shipment path owns the DELIVERED transition.
 */
export async function markDelivered(id: string, client: DbTransaction) {
  const [shipment] = await client
    .select()
    .from(schema.shipments)
    .where(eq(schema.shipments.id, id))
    .limit(1);

  if (!shipment) throw new Error("ບໍ່ພົບ Shipment");
  if (shipment.status !== "SHIPPED") {
    throw new Error("Shipment ຕ້ອງຢູ່ໃນສະຖານະ SHIPPED ກ່ອນຢືນຢັນການຮັບ");
  }

  const now = new Date();

  // Deduct actual stock for each order item
  const items = await client
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, shipment.orderId));

  for (const item of items) {
    if (item.productId) {
      await client
        .update(schema.products)
        .set({
          quantity: sql`GREATEST(${schema.products.quantity} - ${item.quantity}, 0)`,
          reservedQty: sql`GREATEST(${schema.products.reservedQty} - ${item.quantity}, 0)`,
          updatedAt: now,
        })
        .where(eq(schema.products.id, item.productId));
    }
  }

  // Update shipment
  const [updated] = await client
    .update(schema.shipments)
    .set({ status: "DELIVERED", deliveredAt: now, updatedAt: now })
    .where(eq(schema.shipments.id, id))
    .returning();

  // Sync order → DELIVERED (stock already handled above, skip double-deduction)
  await client
    .update(schema.orders)
    .set({ status: "DELIVERED", updatedAt: now })
    .where(eq(schema.orders.id, shipment.orderId));

  return updated!;
}
