import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";
import type { UpdateBannerDTO } from "../contracts/banner.contract";

export async function updateBanner(
  id: string,
  input: UpdateBannerDTO,
  client: DbTransaction,
) {
  const [row] = await client
    .update(schema.banners)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.banners.id, id), isNull(schema.banners.deletedAt)))
    .returning();
  return row ?? null;
}
