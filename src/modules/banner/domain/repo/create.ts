import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { CreateBannerDTO } from "../contracts/banner.contract";

export async function createBanner(
  input: CreateBannerDTO,
  client: DbTransaction,
) {
  const [row] = await client
    .insert(schema.banners)
    .values({
      title: input.title,
      imageUrl: input.imageUrl,
      linkUrl: input.linkUrl ?? null,
      isActive: input.isActive ?? true,
      order: input.order ?? 0,
    })
    .returning();
  return row!;
}
