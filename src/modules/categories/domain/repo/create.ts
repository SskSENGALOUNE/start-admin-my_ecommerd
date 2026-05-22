import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";

export async function createCategory(
  input: { name: string },
  client: DbTransaction,
) {
  const [row] = await client
    .insert(schema.categories)
    .values({ name: input.name })
    .returning();
  return row!;
}
