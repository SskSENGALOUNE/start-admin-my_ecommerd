import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";
import type { UpdateVariantDTO } from "../../contracts/variant.contract";

export async function updateVariant(
  productId: string,
  variantId: string,
  input: UpdateVariantDTO,
  client: DbTransaction,
) {
  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (input.colorId !== undefined) set.colorId = input.colorId;
  if (input.size !== undefined) set.size = input.size;
  if (input.sku !== undefined) set.sku = input.sku;
  if (input.price !== undefined)
    set.price = input.price != null ? String(input.price) : null;
  if (input.imageUrl !== undefined) set.imageUrl = input.imageUrl;
  if (input.isActive !== undefined) set.isActive = input.isActive;

  const [row] = await client
    .update(schema.productVariants)
    .set(set)
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
