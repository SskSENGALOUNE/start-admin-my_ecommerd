import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import type { CreateProductDTO } from "../../contracts/product.contract";

export async function createProduct(
  input: CreateProductDTO,
  client: DbTransaction,
) {
  const [product] = await client
    .insert(schema.products)
    .values({
      name: input.name,
      description: input.description ?? null,
      basePrice: String(input.basePrice),
      categoryId: input.categoryId ?? null,
      isActive: input.isActive,
      quantity: input.quantity,
    })
    .returning();

  if (!product) throw new Error("Failed to create product");

  // Insert images
  if (input.imageKeys && input.imageKeys.length > 0) {
    await client.insert(schema.productImages).values(
      input.imageKeys.map((key, idx) => ({
        productId: product.id,
        url: key,
        order: idx,
        isMain: idx === 0,
      })),
    );
  }

  return product;
}
