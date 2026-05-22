import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function softDeleteBanner(id: string, client: DbTransaction) {
  const [row] = await client
    .update(schema.banners)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.banners.id, id), isNull(schema.banners.deletedAt)))
    .returning();
  return row ?? null;
}
