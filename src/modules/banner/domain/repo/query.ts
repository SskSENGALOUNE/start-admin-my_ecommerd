import { schema } from "@/server/platform/db/client";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import type { DbTransaction } from "@/shared/types";
import { asc, isNull, sql } from "drizzle-orm";

export async function listBanners(
  query: OffsetPageQueryDTO,
  client: DbTransaction,
) {
  const where = isNull(schema.banners.deletedAt);

  const countRows = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.banners)
    .where(where);
  const count = countRows[0]?.count ?? 0;

  const rows = await client
    .select()
    .from(schema.banners)
    .where(where)
    .orderBy(asc(schema.banners.order), asc(schema.banners.createdAt))
    .limit(query.limit)
    .offset(query.offset);

  return {
    data: rows,
    meta: { total: count, limit: query.limit, offset: query.offset },
  };
}
