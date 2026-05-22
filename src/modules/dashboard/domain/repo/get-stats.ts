import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, gte, isNull, lte, sql } from "drizzle-orm";

function getDayRange(daysAgo = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  const start = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
  return { start, end };
}

export async function getDashboardStats(client: DbTransaction) {
  const today = getDayRange(0);
  const yesterday = getDayRange(1);

  // ── Today stats ──────────────────────────────────────────────────────────────
  const [todayOrders] = await client
    .select({
      count: sql<number>`cast(count(*) as int)`,
      revenue: sql<number>`coalesce(sum(${schema.orders.totalAmount}), 0)::int`,
    })
    .from(schema.orders)
    .where(
      and(
        gte(schema.orders.createdAt, today.start),
        lte(schema.orders.createdAt, today.end),
      ),
    );

  const [yesterdayOrders] = await client
    .select({
      count: sql<number>`cast(count(*) as int)`,
      revenue: sql<string>`coalesce(sum(${schema.orders.totalAmount}), 0)::text`,
    })
    .from(schema.orders)
    .where(
      and(
        gte(schema.orders.createdAt, yesterday.start),
        lte(schema.orders.createdAt, yesterday.end),
      ),
    );

  // ── Pending orders (รอดำเนินการ) ─────────────────────────────────────────────
  const [pendingRow] = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.orders)
    .where(sql`${schema.orders.status} IN ('PENDING', 'CONFIRMED')`);

  // ── New customers today ───────────────────────────────────────────────────────
  const [todayCustomers] = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.customers)
    .where(
      and(
        gte(schema.customers.createdAt, today.start),
        lte(schema.customers.createdAt, today.end),
        isNull(schema.customers.deletedAt),
      ),
    );

  const [yesterdayCustomers] = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.customers)
    .where(
      and(
        gte(schema.customers.createdAt, yesterday.start),
        lte(schema.customers.createdAt, yesterday.end),
        isNull(schema.customers.deletedAt),
      ),
    );

  // ── Revenue last 7 days (for chart) ──────────────────────────────────────────
  const sevenDaysAgo = getDayRange(6);
  const revenueByDay = await client
    .select({
      date: sql<string>`to_char(${schema.orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<string>`coalesce(sum(${schema.orders.totalAmount}), 0)::text`,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(schema.orders)
    .where(gte(schema.orders.createdAt, sevenDaysAgo.start))
    .groupBy(sql`to_char(${schema.orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${schema.orders.createdAt}, 'YYYY-MM-DD')`);

  // ── Order status breakdown ────────────────────────────────────────────────────
  const statusBreakdown = await client
    .select({
      status: schema.orders.status,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(schema.orders)
    .groupBy(schema.orders.status);

  // ── Recent orders ─────────────────────────────────────────────────────────────
  const recentOrders = await client
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      customerName: schema.customers.name,
      status: schema.orders.status,
      totalAmount: schema.orders.totalAmount,
      createdAt: schema.orders.createdAt,
    })
    .from(schema.orders)
    .leftJoin(
      schema.customers,
      sql`${schema.orders.customerId} = ${schema.customers.id}`,
    )
    .orderBy(desc(schema.orders.createdAt))
    .limit(8);

  // ── Low stock products ────────────────────────────────────────────────────────
  const lowStockProducts = await client
    .select({
      id: schema.products.id,
      name: schema.products.name,
      quantity: schema.products.quantity,
      reservedQty: schema.products.reservedQty,
    })
    .from(schema.products)
    .where(
      and(
        isNull(schema.products.deletedAt),
        sql`(${schema.products.quantity} - ${schema.products.reservedQty}) <= 5`,
      ),
    )
    .orderBy(
      sql`(${schema.products.quantity} - ${schema.products.reservedQty}) asc`,
    )
    .limit(5);

  return {
    today: {
      orderCount: todayOrders?.count ?? 0,
      revenue: todayOrders?.revenue ?? "0",
      newCustomers: todayCustomers?.count ?? 0,
    },
    yesterday: {
      orderCount: yesterdayOrders?.count ?? 0,
      revenue: yesterdayOrders?.revenue ?? "0",
      newCustomers: yesterdayCustomers?.count ?? 0,
    },
    pendingOrders: pendingRow?.count ?? 0,
    revenueByDay,
    statusBreakdown,
    recentOrders,
    lowStockProducts,
  };
}
