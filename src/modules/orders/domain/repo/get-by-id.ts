import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function getOrderById(id: string, client: DbTransaction) {
  const [row] = await client
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
      shippingAddressId: schema.orders.shippingAddressId,
      note: schema.orders.note,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
    })
    .from(schema.orders)
    .leftJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.id, id))
    .limit(1);

  if (!row) return null;

  // Order items
  const items = await client
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id))
    .orderBy(schema.orderItems.createdAt);

  // Shipment
  const [shipment] = await client
    .select()
    .from(schema.shipments)
    .where(eq(schema.shipments.orderId, id))
    .limit(1);

  // Transaction
  const [transaction] = await client
    .select({
      id: schema.transactions.id,
      transactionId: schema.transactions.transactionId,
      amount: schema.transactions.amount,
      status: schema.transactions.status,
      paymentMethod: schema.transactions.paymentMethod,
      bankType: schema.transactions.bankType,
      slipUrl: schema.transactions.slipUrl,
      verifiedAt: schema.transactions.verifiedAt,
      createdAt: schema.transactions.createdAt,
    })
    .from(schema.transactions)
    .where(eq(schema.transactions.orderRef, id))
    .limit(1);

  return {
    ...row,
    items,
    shipment: shipment ?? null,
    transaction: transaction ?? null,
  };
}
