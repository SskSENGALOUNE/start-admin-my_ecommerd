import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function listColors(client: DbTransaction) {
  return client
    .select()
    .from(schema.colors)
    .where(eq(schema.colors.isActive, true))
    .orderBy(schema.colors.color);
}
