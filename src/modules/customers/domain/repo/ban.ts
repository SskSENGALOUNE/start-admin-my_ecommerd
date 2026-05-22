import { schema } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { eq } from "drizzle-orm";

export async function banCustomer(id: string, client: DbTransaction) {
  const [row] = await client
    .update(schema.customers)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(schema.customers.id, id))
    .returning();
  return row ?? null;
}
