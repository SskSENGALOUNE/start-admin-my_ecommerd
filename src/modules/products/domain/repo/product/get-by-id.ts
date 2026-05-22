import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function getProductById(id: string, client: DbTransaction) {
  const [row] = await client
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
    .where(
      and(
        eq(schema.products.id, id),
        isNull(schema.products.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return null;

  const images = await client
    .select()
    .from(schema.productImages)
    .where(eq(schema.productImages.productId, id))
    .orderBy(schema.productImages.order);

  return { ...row, images };
}
