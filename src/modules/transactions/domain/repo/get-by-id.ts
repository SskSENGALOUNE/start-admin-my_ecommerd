import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function getTransactionById(id: string, client: DbTransaction) {
  const [row] = await client
    .select({
      id: schema.transactions.id,
      transactionId: schema.transactions.transactionId,
      merchantId: schema.transactions.merchantId,
      merchantName: schema.transactions.merchantName,
      amount: schema.transactions.amount,
      status: schema.transactions.status,
      paymentMethod: schema.transactions.paymentMethod,
      bankType: schema.transactions.bankType,
      slipUrl: schema.transactions.slipUrl,
      postRequest: schema.transactions.postRequest,
      bankRequest: schema.transactions.bankRequest,
      bankResponse: schema.transactions.bankResponse,
      orderRef: schema.transactions.orderRef,
      orderNumber: schema.orders.orderNumber,
      customerName: schema.customers.name,
      verifiedBy: schema.transactions.verifiedBy,
      verifiedAt: schema.transactions.verifiedAt,
      createdAt: schema.transactions.createdAt,
      updatedAt: schema.transactions.updatedAt,
    })
    .from(schema.transactions)
    .leftJoin(schema.orders, eq(schema.transactions.orderRef, schema.orders.id))
    .leftJoin(
      schema.customers,
      eq(schema.orders.customerId, schema.customers.id),
    )
    .where(eq(schema.transactions.id, id))
    .limit(1);

  return row ?? null;
}
