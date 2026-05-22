import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export async function getCustomerById(id: string, client: DbTransaction) {
  const [customer] = await client
    .select()
    .from(schema.customers)
    .where(and(eq(schema.customers.id, id), isNull(schema.customers.deletedAt)))
    .limit(1);

  if (!customer) return null;

  // Order history
  const orders = await client
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      status: schema.orders.status,
      totalAmount: schema.orders.totalAmount,
      createdAt: schema.orders.createdAt,
    })
    .from(schema.orders)
    .where(eq(schema.orders.customerId, id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(10);

  // Addresses
  const addresses = await client
    .select()
    .from(schema.addresses)
    .where(
      and(
        eq(schema.addresses.customerId, id),
        isNull(schema.addresses.deletedAt),
      ),
    )
    .orderBy(schema.addresses.isDefault);

  // Aggregate stats
  const [stats] = await client
    .select({
      totalOrders: sql<number>`cast(count(*) as int)`,
      totalSpent: sql<string>`coalesce(sum(${schema.orders.totalAmount}), 0)::text`,
    })
    .from(schema.orders)
    .where(eq(schema.orders.customerId, id));

  return {
    ...customer,
    totalOrders: stats?.totalOrders ?? 0,
    totalSpent: stats?.totalSpent ?? "0",
    orders,
    addresses,
  };
}
