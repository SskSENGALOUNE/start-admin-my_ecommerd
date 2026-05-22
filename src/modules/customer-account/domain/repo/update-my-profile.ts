import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";
import type { UpdateProfileDTO } from "../contracts/customer-account.contract";

export async function updateMyProfile(
  customerId: string,
  input: UpdateProfileDTO,
  client: DbTransaction,
) {
  const [updated] = await client
    .update(schema.customers)
    .set({
      name: input.name,
      phone: input.phone ?? null,
      updatedAt: new Date(),
    })
    .where(eq(schema.customers.id, customerId))
    .returning({
      id: schema.customers.id,
      email: schema.customers.email,
      name: schema.customers.name,
      phone: schema.customers.phone,
      isActive: schema.customers.isActive,
    });

  return updated ?? null;
}
