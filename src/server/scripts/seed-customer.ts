#!/usr/bin/env bun

import { db } from "@/server/platform/db/client";
import { schema } from "@/server/platform/db/client";
import { logger } from "@/server/platform/observability/logger";
import { hashPassword } from "@/modules/customer-auth/domain/services/customer-auth.service";
import { and, eq, isNull } from "drizzle-orm";

const TEST_CUSTOMER = {
  email: "test@customer.com",
  password: "123456",
  name: "ລູກຄ້າທົດສອບ",
  phone: "2055512345",
};

async function seedCustomer() {
  try {
    const [existing] = await db
      .select({ id: schema.customers.id })
      .from(schema.customers)
      .where(
        and(
          eq(schema.customers.email, TEST_CUSTOMER.email),
          isNull(schema.customers.deletedAt),
        ),
      )
      .limit(1);

    if (existing) {
      logger.info(`Customer already exists: ${TEST_CUSTOMER.email}`);
      process.exit(0);
    }

    const hashed = await hashPassword(TEST_CUSTOMER.password);

    const [customer] = await db
      .insert(schema.customers)
      .values({
        email: TEST_CUSTOMER.email,
        password: hashed,
        name: TEST_CUSTOMER.name,
        phone: TEST_CUSTOMER.phone,
        isActive: true,
      })
      .returning({ id: schema.customers.id });

    logger.info(`Customer created: ${TEST_CUSTOMER.email} / ${TEST_CUSTOMER.password} (id: ${customer?.id})`);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
}

seedCustomer();
