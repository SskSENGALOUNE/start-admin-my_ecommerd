import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function getMyOrder(
  id: string,
  customerId: string,
  client: DbTransaction,
) {
  const [row] = await client
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      customerId: schema.orders.customerId,
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
    .where(eq(schema.orders.id, id))
    .limit(1);

  if (!row) return null;

  // Ownership check
  if (row.customerId !== customerId) return null;

  const items = await client
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id))
    .orderBy(schema.orderItems.createdAt);

  const [shipment] = await client
    .select()
    .from(schema.shipments)
    .where(eq(schema.shipments.orderId, id))
    .limit(1);

  const [transaction] = await client
    .select({
      id: schema.transactions.id,
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

  // Fetch shipping address — intentionally no deletedAt filter (historical snapshot)
  const [shippingAddress] = row.shippingAddressId
    ? await client
        .select()
        .from(schema.addresses)
        .where(eq(schema.addresses.id, row.shippingAddressId))
        .limit(1)
    : [];

  return {
    ...row,
    items,
    shipment: shipment ?? null,
    transaction: transaction ?? null,
    shippingAddress: shippingAddress ?? null,
  };
}
