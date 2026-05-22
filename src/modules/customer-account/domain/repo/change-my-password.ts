import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
} from "@/modules/customer-auth/domain/services/customer-auth.service";
import type { ChangePasswordDTO } from "../contracts/customer-account.contract";

export async function changeMyPassword(
  customerId: string,
  input: ChangePasswordDTO,
  client: DbTransaction,
) {
  const [customer] = await client
    .select({
      id: schema.customers.id,
      password: schema.customers.password,
    })
    .from(schema.customers)
    .where(eq(schema.customers.id, customerId))
    .limit(1);

  if (!customer) throw new Error("ບໍ່ພົບຂໍ້ມູນລູກຄ້າ");

  if (!customer.password) {
    throw new Error("ບັນຊີ OAuth ບໍ່ສາມາດປ່ຽນລະຫັດຜ່ານໄດ້");
  }

  const valid = await verifyPassword(input.currentPassword, customer.password);
  if (!valid) throw new Error("ລະຫັດຜ່ານປັດຈຸບັນບໍ່ຖືກຕ້ອງ");

  const hashed = await hashPassword(input.newPassword);

  await client
    .update(schema.customers)
    .set({ password: hashed, updatedAt: new Date() })
    .where(eq(schema.customers.id, customerId));

  return { ok: true };
}
