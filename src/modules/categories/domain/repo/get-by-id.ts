import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function getCategoryById(id: string, client: DbTransaction) {
  const [row] = await client
    .select()
    .from(schema.categories)
    .where(and(eq(schema.categories.id, id), isNull(schema.categories.deletedAt)))
    .limit(1);
  return row ?? null;
}
