import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { and, eq, isNull } from "drizzle-orm";
import type { AddressUpsertDTO } from "../contracts/customer-account.contract";

export async function createMyAddress(
  customerId: string,
  input: AddressUpsertDTO,
  client: DbTransaction,
) {
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

  const [created] = await client
    .insert(schema.addresses)
    .values({
      customerId,
      label: input.label ?? null,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      province: input.province,
      district: input.district,
      village: input.village ?? null,
      address: input.address,
      isDefault: input.isDefault ?? false,
    })
    .returning();

  return created ?? null;
}
