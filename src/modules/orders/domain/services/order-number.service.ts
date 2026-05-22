import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { desc, like } from "drizzle-orm";

/**
 * Generate order number: ORD-YYYYMMDD-XXXX
 * Running number resets every day (per CLAUDE.md spec).
 *
 * Queries by LIKE pattern only (not timestamp range) to avoid UTC vs local-timezone mismatch.
 */
export async function generateOrderNumber(client: DbTransaction): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  const [lastOrder] = await client
    .select({ orderNumber: schema.orders.orderNumber })
    .from(schema.orders)
    .where(like(schema.orders.orderNumber, `ORD-${dateStr}-%`))
    .orderBy(desc(schema.orders.orderNumber))
    .limit(1);

  let nextSeq = 1;
  if (lastOrder) {
    const parts = lastOrder.orderNumber.split("-");
    const lastSeq = Number.parseInt(parts[2] ?? "0", 10);
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  const seq = String(nextSeq).padStart(4, "0");
  return `ORD-${dateStr}-${seq}`;
}
