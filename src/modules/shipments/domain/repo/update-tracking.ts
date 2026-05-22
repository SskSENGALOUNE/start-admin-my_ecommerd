import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";
import type { UpdateTrackingDTO } from "../contracts/shipment.contract";

/**
 * Admin enters tracking number → shipment SHIPPED, order SHIPPED.
 */
export async function updateTracking(
  id: string,
  input: UpdateTrackingDTO,
  client: DbTransaction,
) {
  const [shipment] = await client
    .select()
    .from(schema.shipments)
    .where(eq(schema.shipments.id, id))
    .limit(1);

  if (!shipment) throw new Error("ບໍ່ພົບ Shipment");
  if (shipment.status !== "PREPARING") {
    throw new Error("Shipment ຕ້ອງຢູ່ໃນສະຖານະ PREPARING ຈຶ່ງຈະອັບເດດ Tracking ໄດ້");
  }

  const now = new Date();

  // Update shipment → SHIPPED
  const [updated] = await client
    .update(schema.shipments)
    .set({
      trackingNumber: input.trackingNumber,
      status: "SHIPPED",
      shippedAt: now,
      note: input.note ?? shipment.note,
      updatedAt: now,
    })
    .where(eq(schema.shipments.id, id))
    .returning();

  // Sync order → SHIPPED
  await client
    .update(schema.orders)
    .set({ status: "SHIPPED", updatedAt: now })
    .where(eq(schema.orders.id, shipment.orderId));

  return updated!;
}
