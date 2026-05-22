import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq } from "drizzle-orm";

export async function addProductImage(
  productId: string,
  input: { url: string; order: number; isMain: boolean },
  client: DbTransaction,
) {
  const [row] = await client
    .insert(schema.productImages)
    .values({ productId, ...input })
    .returning();
  return row!;
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  client: DbTransaction,
) {
  const [row] = await client
    .delete(schema.productImages)
    .where(
      and(
        eq(schema.productImages.id, imageId),
        eq(schema.productImages.productId, productId),
      ),
    )
    .returning();
  return row ?? null;
}

export async function setMainImage(
  productId: string,
  imageId: string,
  client: DbTransaction,
) {
  // Reset all
  await client
    .update(schema.productImages)
    .set({ isMain: false })
    .where(eq(schema.productImages.productId, productId));
  // Set new main
  const [row] = await client
    .update(schema.productImages)
    .set({ isMain: true })
    .where(
      and(
        eq(schema.productImages.id, imageId),
        eq(schema.productImages.productId, productId),
      ),
    )
    .returning();
  return row ?? null;
}
