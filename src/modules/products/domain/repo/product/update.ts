import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";
import type { UpdateProductDTO } from "../../contracts/product.contract";

export async function updateProduct(
  id: string,
  input: UpdateProductDTO,
  client: DbTransaction,
) {
  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) set.name = input.name;
  if (input.description !== undefined) set.description = input.description;
  if (input.basePrice !== undefined) set.basePrice = String(input.basePrice);
  if (input.categoryId !== undefined) set.categoryId = input.categoryId;
  if (input.isActive !== undefined) set.isActive = input.isActive;
  if (input.quantity !== undefined) set.quantity = input.quantity;

  const [row] = await client
    .update(schema.products)
    .set(set)
    .where(
      and(eq(schema.products.id, id), isNull(schema.products.deletedAt)),
    )
    .returning();

  return row ?? null;
}
