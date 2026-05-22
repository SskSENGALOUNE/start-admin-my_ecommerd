import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, desc, eq, isNull } from "drizzle-orm";

export async function listMyAddresses(
  customerId: string,
  client: DbTransaction,
) {
  return client
    .select()
    .from(schema.addresses)
    .where(
      and(
        eq(schema.addresses.customerId, customerId),
        isNull(schema.addresses.deletedAt),
      ),
    )
    .orderBy(desc(schema.addresses.isDefault), schema.addresses.createdAt);
}
