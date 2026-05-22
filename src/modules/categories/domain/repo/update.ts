import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function updateCategory(
  id: string,
  input: { name: string },
  client: DbTransaction,
) {
  const [row] = await client
    .update(schema.categories)
    .set({ name: input.name, updatedAt: new Date() })
    .where(and(eq(schema.categories.id, id), isNull(schema.categories.deletedAt)))
    .returning();
  return row ?? null;
}
