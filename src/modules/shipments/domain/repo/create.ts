import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";
import type { CreateShipmentDTO } from "../contracts/shipment.contract";

/**
 * Create a shipment for an order.
 * Order must be in PROCESSING status.
 * Shipment starts at PREPARING status.
 */
export async function createShipment(
  input: CreateShipmentDTO,
  client: DbTransaction,
) {
  // Validate order exists and is PROCESSING
  const [order] = await client
    .select({ id: schema.orders.id, status: schema.orders.status })
    .from(schema.orders)
    .where(eq(schema.orders.id, input.orderId))
    .limit(1);

  if (!order) throw new Error("ບໍ່ພົບຄຳສັ່ງຊື້");
  if (order.status !== "PROCESSING") {
    throw new Error("ສ້າງ Shipment ໄດ້ສະເພາະ Order ທີ່ສະຖານະ PROCESSING");
  }

  // Check no existing shipment
  const [existing] = await client
    .select({ id: schema.shipments.id })
    .from(schema.shipments)
    .where(eq(schema.shipments.orderId, input.orderId))
    .limit(1);

  if (existing) throw new Error("Order ນີ້ມີ Shipment ຢູ່ແລ້ວ");

  const [shipment] = await client
    .insert(schema.shipments)
    .values({
      orderId: input.orderId,
      shippingType: input.shippingType,
      status: "PREPARING",
      note: input.note ?? null,
    })
    .returning();

  return shipment!;
}
