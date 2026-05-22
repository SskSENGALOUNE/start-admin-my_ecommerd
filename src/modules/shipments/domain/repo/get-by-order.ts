import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function getShipmentByOrderId(orderId: string, client: DbTransaction) {
  const [row] = await client
    .select()
    .from(schema.shipments)
    .where(eq(schema.shipments.orderId, orderId))
    .limit(1);

  return row ?? null;
}
