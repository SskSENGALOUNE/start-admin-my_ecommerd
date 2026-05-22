import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, eq, sql } from "drizzle-orm";
import type { MyOrderQueryDTO } from "../contracts/customer-account.contract";

export async function listMyOrders(
  customerId: string,
  query: MyOrderQueryDTO,
  client: DbTransaction,
) {
  const conditions = [eq(schema.orders.customerId, customerId)];

  if (query.status) {
    conditions.push(eq(schema.orders.status, query.status));
  }

  const where = and(...conditions);

  const countRows = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.orders)
    .where(where);

  const count = countRows[0]?.count ?? 0;

  const rows = await client
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      status: schema.orders.status,
      subtotal: schema.orders.subtotal,
      discount: schema.orders.discount,
      shippingCost: schema.orders.shippingCost,
      totalAmount: schema.orders.totalAmount,
      shippingName: schema.orders.shippingName,
      createdAt: schema.orders.createdAt,
    })
    .from(schema.orders)
    .where(where)
    .orderBy(desc(schema.orders.createdAt))
    .limit(query.limit)
    .offset(query.offset);

  return {
    data: rows,
    meta: { total: count, limit: query.limit, offset: query.offset },
  };
}
