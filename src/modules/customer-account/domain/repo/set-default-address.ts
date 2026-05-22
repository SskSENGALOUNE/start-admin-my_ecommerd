import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function setDefaultAddress(
  id: string,
  customerId: string,
  client: DbTransaction,
) {
  const [existing] = await client
    .select({ id: schema.addresses.id, customerId: schema.addresses.customerId })
    .from(schema.addresses)
    .where(and(eq(schema.addresses.id, id), isNull(schema.addresses.deletedAt)))
    .limit(1);

  if (!existing || existing.customerId !== customerId) return null;

  // Clear all defaults for this customer
  await client
    .update(schema.addresses)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(
      and(
        eq(schema.addresses.customerId, customerId),
        isNull(schema.addresses.deletedAt),
      ),
    );

  const [updated] = await client
    .update(schema.addresses)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(eq(schema.addresses.id, id))
    .returning();

  return updated ?? null;
}
