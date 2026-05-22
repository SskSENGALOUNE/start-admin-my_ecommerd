import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { CreateVariantDTO } from "../../contracts/variant.contract";

export async function createVariant(
  productId: string,
  input: CreateVariantDTO,
  client: DbTransaction,
) {
  const [row] = await client
    .insert(schema.productVariants)
    .values({
      productId,
      colorId: input.colorId,
      size: input.size ?? null,
      sku: input.sku ?? null,
      price: input.price != null ? String(input.price) : null,
      imageUrl: input.imageUrl ?? null,
      isActive: input.isActive,
    })
    .returning();
  return row!;
}
