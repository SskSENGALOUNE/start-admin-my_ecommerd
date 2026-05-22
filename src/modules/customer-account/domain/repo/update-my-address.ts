import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";
import type { AddressUpsertDTO } from "../contracts/customer-account.contract";

export async function updateMyAddress(
  id: string,
  customerId: string,
  input: AddressUpsertDTO,
  client: DbTransaction,
) {
  const [existing] = await client
    .select({ id: schema.addresses.id, customerId: schema.addresses.customerId })
    .from(schema.addresses)
    .where(and(eq(schema.addresses.id, id), isNull(schema.addresses.deletedAt)))
    .limit(1);

  if (!existing || existing.customerId !== customerId) return null;

  if (input.isDefault) {
    await client
      .update(schema.addresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(
        and(
          eq(schema.addresses.customerId, customerId),
          isNull(schema.addresses.deletedAt),
        ),
      );
  }

  const [updated] = await client
    .update(schema.addresses)
    .set({
      label: input.label ?? null,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      province: input.province,
      district: input.district,
      village: input.village ?? null,
      address: input.address,
      isDefault: input.isDefault ?? false,
      updatedAt: new Date(),
    })
    .where(eq(schema.addresses.id, id))
    .returning();

  return updated ?? null;
}
