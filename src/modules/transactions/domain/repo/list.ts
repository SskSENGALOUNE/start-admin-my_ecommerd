import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, eq, sql } from "drizzle-orm";
import type { TransactionQuery } from "../contracts/transaction.contract";

export async function listTransactions(
  query: TransactionQuery,
  client: DbTransaction,
) {
  const conditions = [];

  if (query.status) {
    conditions.push(eq(schema.transactions.status, query.status));
  }

  if (query.paymentMethod) {
    conditions.push(
      eq(schema.transactions.paymentMethod, query.paymentMethod),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const countRows = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.transactions)
    .where(where);

  const count = countRows[0]?.count ?? 0;

  const rows = await client
    .select({
      id: schema.transactions.id,
      transactionId: schema.transactions.transactionId,
      amount: schema.transactions.amount,
      status: schema.transactions.status,
      paymentMethod: schema.transactions.paymentMethod,
      bankType: schema.transactions.bankType,
      slipUrl: schema.transactions.slipUrl,
      orderRef: schema.transactions.orderRef,
      orderNumber: schema.orders.orderNumber,
      customerName: schema.customers.name,
      verifiedAt: schema.transactions.verifiedAt,
      createdAt: schema.transactions.createdAt,
    })
    .from(schema.transactions)
    .leftJoin(schema.orders, eq(schema.transactions.orderRef, schema.orders.id))
    .leftJoin(
      schema.customers,
      eq(schema.orders.customerId, schema.customers.id),
    )
    .where(where)
    .orderBy(desc(schema.transactions.createdAt))
    .limit(query.limit)
    .offset(query.offset);

  return {
    data: rows,
    meta: { total: count, limit: query.limit, offset: query.offset },
  };
}
