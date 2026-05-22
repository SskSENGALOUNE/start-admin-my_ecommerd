import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function getBannerById(id: string, client: DbTransaction) {
  const [row] = await client
    .select()
    .from(schema.banners)
    .where(and(eq(schema.banners.id, id), isNull(schema.banners.deletedAt)))
    .limit(1);
  return row ?? null;
}
