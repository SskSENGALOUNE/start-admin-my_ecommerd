import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, ilike, isNull, sql } from "drizzle-orm";
import type { ProductQueryDTO } from "../../contracts/product.contract";

export async function listProducts(
  query: ProductQueryDTO,
  client: DbTransaction,
) {
  const conditions = [isNull(schema.products.deletedAt)];

  if (query.search) {
    conditions.push(ilike(schema.products.name, `%${query.search}%`));
  }
  if (query.categoryId) {
    conditions.push(eq(schema.products.categoryId, query.categoryId));
  }
  if (query.isActive !== undefined) {
    conditions.push(eq(schema.products.isActive, query.isActive));
  }

  const where = and(...conditions);

  const countRows = await client
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(schema.products)
    .where(where);
  const total = countRows[0]?.count ?? 0;

  const rows = await client
    .select({
      id: schema.products.id,
      name: schema.products.name,
      description: schema.products.description,
      basePrice: schema.products.basePrice,
      categoryId: schema.products.categoryId,
      categoryName: schema.categories.name,
      isActive: schema.products.isActive,
      quantity: schema.products.quantity,
      reservedQty: schema.products.reservedQty,
      createdAt: schema.products.createdAt,
      updatedAt: schema.products.updatedAt,
      deletedAt: schema.products.deletedAt,
    })
    .from(schema.products)
    .leftJoin(
      schema.categories,
      eq(schema.products.categoryId, schema.categories.id),
    )
    .where(where)
    .orderBy(schema.products.createdAt)
    .limit(query.limit)
    .offset(query.offset);

  // Attach main image for each product
  const productIds = rows.map((r) => r.id);
  const images =
    productIds.length > 0
      ? await client
          .select()
          .from(schema.productImages)
          .where(
            and(
              sql`${schema.productImages.productId} = ANY(${sql.raw(`ARRAY[${productIds.map((id) => `'${id}'`).join(",")}]`)})`,
              eq(schema.productImages.isMain, true),
            ),
          )
      : [];

  const imageMap = new Map(images.map((img) => [img.productId, img]));

  return {
    data: rows.map((r) => ({
      ...r,
      mainImage: imageMap.get(r.id) ?? null,
      images: [],
    })),
    meta: { total, limit: query.limit, offset: query.offset },
  };
}
