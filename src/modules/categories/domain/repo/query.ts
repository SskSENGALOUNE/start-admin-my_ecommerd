import { schema } from "@/server/platform/db/client";
import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import type { DbTransaction } from "@/shared/types";
import { isNull, sql } from "drizzle-orm";

export async function listCategories(
  query: OffsetPageQueryDTO,
  client: DbTransaction,
) {
  const where = isNull(schema.categories.deletedAt);

  const countRows = await client
    .select({
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(schema.categories)
    .where(where);
  const count = countRows[0]?.count ?? 0;

  const rows = await client
    .select()
    .from(schema.categories)
    .where(where)
    .orderBy(schema.categories.createdAt)
    .limit(query.limit)
    .offset(query.offset);

  return {
    data: rows,
    meta: { total: count, limit: query.limit, offset: query.offset },
  };
}
