import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function listVariants(productId: string, client: DbTransaction) {
  return client
    .select({
      id: schema.productVariants.id,
      productId: schema.productVariants.productId,
      sku: schema.productVariants.sku,
      colorId: schema.productVariants.colorId,
      colorName: schema.colors.color,
      size: schema.productVariants.size,
      price: schema.productVariants.price,
      imageUrl: schema.productVariants.imageUrl,
      isActive: schema.productVariants.isActive,
      createdAt: schema.productVariants.createdAt,
      updatedAt: schema.productVariants.updatedAt,
    })
    .from(schema.productVariants)
    .leftJoin(
      schema.colors,
      eq(schema.productVariants.colorId, schema.colors.id),
    )
    .where(
      and(
        eq(schema.productVariants.productId, productId),
        isNull(schema.productVariants.deletedAt),
      ),
    )
    .orderBy(schema.productVariants.createdAt);
}
