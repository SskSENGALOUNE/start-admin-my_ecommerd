import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function deleteMyAddress(
  id: string,
  customerId: string,
  client: DbTransaction,
) {
  const [deleted] = await client
    .update(schema.addresses)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(schema.addresses.id, id),
        eq(schema.addresses.customerId, customerId),
        isNull(schema.addresses.deletedAt),
      ),
    )
    .returning({ id: schema.addresses.id });

  return deleted ?? null;
}
