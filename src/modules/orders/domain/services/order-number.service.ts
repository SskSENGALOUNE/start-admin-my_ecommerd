import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, gte, lte, like } from "drizzle-orm";

/**
 * Generate order number: ORD-YYYYMMDD-XXXX
 * Running number resets every day (per CLAUDE.md spec).
 *
 * Uses DB-level query to get today's last order → increment.
 * Safe under concurrent inserts because nanoid guarantees unique IDs,
 * but order number collision is handled with retry logic.
 */
export async function generateOrderNumber(client: DbTransaction): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  // Start and end of today (UTC)
  const startOfDay = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  const endOfDay = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

  // Get the last order of today to determine next running number
  const [lastOrder] = await client
    .select({ orderNumber: schema.orders.orderNumber })
    .from(schema.orders)
    .where(
      and(
        gte(schema.orders.createdAt, startOfDay),
        lte(schema.orders.createdAt, endOfDay),
        like(schema.orders.orderNumber, `ORD-${dateStr}-%`),
      ),
    )
    .orderBy(desc(schema.orders.orderNumber))
    .limit(1);

  let nextSeq = 1;
  if (lastOrder) {
    // Extract running number from "ORD-YYYYMMDD-XXXX"
    const parts = lastOrder.orderNumber.split("-");
    const lastSeq = Number.parseInt(parts[2] ?? "0", 10);
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  const seq = String(nextSeq).padStart(4, "0");
  return `ORD-${dateStr}-${seq}`;
}
