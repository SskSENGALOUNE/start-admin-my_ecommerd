import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, ilike, isNull, eq, or, sql } from "drizzle-orm";
import type { CustomerQueryDTO } from "../contracts/customer.contract";

export async function listCustomers(
  query: CustomerQueryDTO,
  client: DbTransaction,
) {
  const conditions = [isNull(schema.customers.deletedAt)];

  if (query.search) {
    conditions.push(
      or(
        ilike(schema.customers.name, `%${query.search}%`),
        ilike(schema.customers.email, `%${query.search}%`),
        ilike(schema.customers.phone, `%${query.search}%`),
      ),
    );
  }

  if (query.isActive !== undefined) {
    conditions.push(eq(schema.customers.isActive, query.isActive));
  }

  const where = and(...conditions);

  const countRows = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.customers)
    .where(where);
  const count = countRows[0]?.count ?? 0;

  const rows = await client
    .select()
    .from(schema.customers)
    .where(where)
    .orderBy(desc(schema.customers.createdAt))
    .limit(query.limit)
    .offset(query.offset);

  return {
    data: rows,
    meta: { total: count, limit: query.limit, offset: query.offset },
  };
}
