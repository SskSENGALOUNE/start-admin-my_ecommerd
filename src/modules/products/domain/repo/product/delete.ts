import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function softDeleteProduct(id: string, client: DbTransaction) {
  const [row] = await client
    .update(schema.products)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(schema.products.id, id), isNull(schema.products.deletedAt)),
    )
    .returning();
  return row ?? null;
}
