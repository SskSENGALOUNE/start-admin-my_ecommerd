import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";

export async function softDeleteVariant(
  productId: string,
  variantId: string,
  client: DbTransaction,
) {
  const [row] = await client
    .update(schema.productVariants)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(schema.productVariants.id, variantId),
        eq(schema.productVariants.productId, productId),
        isNull(schema.productVariants.deletedAt),
      ),
    )
    .returning();
  return row ?? null;
}
