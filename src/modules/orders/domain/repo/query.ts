import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import type { OrderQueryDTO } from "../contracts/order.contract";

export async function listOrders(query: OrderQueryDTO, client: DbTransaction) {
  const conditions = [];

  if (query.status) {
    conditions.push(eq(schema.orders.status, query.status));
  }

  if (query.search) {
    conditions.push(
      or(
        ilike(schema.orders.orderNumber, `%${query.search}%`),
        ilike(schema.customers.name, `%${query.search}%`),
        ilike(schema.customers.email, `%${query.search}%`),
      ),
    );
  }

  if (query.dateFrom) {
    conditions.push(gte(schema.orders.createdAt, query.dateFrom));
  }
  if (query.dateTo) {
    conditions.push(lte(schema.orders.createdAt, query.dateTo));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const countRows = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.orders)
    .leftJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(where);

  const count = countRows[0]?.count ?? 0;

  const rows = await client
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      customerId: schema.orders.customerId,
      customerName: schema.customers.name,
      customerEmail: schema.customers.email,
      customerPhone: schema.customers.phone,
      status: schema.orders.status,
      subtotal: schema.orders.subtotal,
      discount: schema.orders.discount,
      shippingCost: schema.orders.shippingCost,
      totalAmount: schema.orders.totalAmount,
      couponCode: schema.orders.couponCode,
      shippingName: schema.orders.shippingName,
      note: schema.orders.note,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
    })
    .from(schema.orders)
    .leftJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(where)
    .orderBy(desc(schema.orders.createdAt))
    .limit(query.limit)
    .offset(query.offset);

  return {
    data: rows,
    meta: { total: count, limit: query.limit, offset: query.offset },
  };
}
