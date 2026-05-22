#!/usr/bin/env bun
/**
 * Seed master colors table
 * Usage: bun run src/server/scripts/seed-colors.ts
 */

import { db } from "@/server/platform/db/client";
import { colors } from "@/server/platform/db/schema/ecommerce";
import { logger } from "@/server/platform/observability/logger";

const COLOR_LIST = [
  "RED",
  "GREEN",
  "BLUE",
  "YELLOW",
  "BLACK",
  "WHITE",
  "GRAY",
  "PURPLE",
  "ORANGE",
  "PINK",
  "BROWN",
  "GOLD",
  "SILVER",
] as const;

async function seedColors() {
  try {
    logger.info("Seeding master colors...");

    for (const color of COLOR_LIST) {
      await db
        .insert(colors)
        .values({ color, isActive: true })
        .onConflictDoNothing();
    }

    logger.info(`✅ Seeded ${COLOR_LIST.length} colors`);
  } catch (error) {
    logger.error("Seed colors failed:", error);
    process.exit(1);
  }
}

seedColors();
