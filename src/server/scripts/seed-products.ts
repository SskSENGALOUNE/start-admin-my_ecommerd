#!/usr/bin/env bun

import { db } from "@/server/platform/db/client";
import { schema } from "@/server/platform/db/client";
import { logger } from "@/server/platform/observability/logger";

const CATEGORIES = [
  "ເສື້ອຜ້າຊາຍ",
  "ເສື້ອຜ້າຍິງ",
  "ເກີບ",
  "ກະເປົາ",
  "ອຸປະກອນເສີມ",
];

const PRODUCTS = [
  { name: "ເສື້ອຍືດຜູ້ຊາຍ Classic", category: 0, price: 120000, qty: 50, imageId: 10 },
  { name: "ເສື້ອເຊີດລາຍທາງ", category: 0, price: 180000, qty: 30, imageId: 20 },
  { name: "ໂສ້ງຢີນຜູ້ຊາຍ Slim Fit", category: 0, price: 350000, qty: 25, imageId: 30 },
  { name: "ເສື້ອຍືດຜູ້ຍິງ Crop Top", category: 1, price: 95000, qty: 60, imageId: 40 },
  { name: "ກະໂປ່ງຍາວລາຍດອກ", category: 1, price: 220000, qty: 40, imageId: 50 },
  { name: "ເສື້ອກັນໜາວ Hoodie", category: 1, price: 280000, qty: 35, imageId: 60 },
  { name: "ເກີບກິລາ Running Pro", category: 2, price: 450000, qty: 20, imageId: 70 },
  { name: "ເກີບຜ້າໃບ Casual", category: 2, price: 320000, qty: 28, imageId: 80 },
  { name: "ກະເປົາເປ້ Backpack 20L", category: 3, price: 380000, qty: 15, imageId: 90 },
  { name: "ໝວກ Cap ລາຍ Embroidery", category: 4, price: 85000, qty: 80, imageId: 100 },
];

const SIZES = ["S", "M", "L", "XL"];

async function seedProducts() {
  try {
    logger.info("Seeding categories...");
    const insertedCategories = await db
      .insert(schema.categories)
      .values(CATEGORIES.map((name) => ({ name })))
      .onConflictDoNothing()
      .returning();

    const allCategories = await db.select().from(schema.categories);
    const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

    logger.info("Seeding colors...");
    const colors = await db.select().from(schema.colors);
    if (colors.length === 0) {
      logger.warn("No colors found — run 'bun run seed:colors' first");
      process.exit(1);
    }
    const blackColor = colors.find((c) => c.color === "BLACK") ?? colors[0];

    logger.info("Seeding 10 products...");
    for (const p of PRODUCTS) {
      const categoryName = CATEGORIES[p.category];
      const categoryId = categoryMap.get(categoryName!) ?? null;

      const [product] = await db
        .insert(schema.products)
        .values({
          name: p.name,
          description: `ສິນຄ້າຄຸນນະພາບດີ — ${p.name}`,
          basePrice: String(p.price),
          categoryId,
          isActive: true,
          quantity: p.qty,
        })
        .returning();

      if (!product) continue;

      await db.insert(schema.productImages).values({
        productId: product.id,
        url: `https://picsum.photos/seed/${p.imageId}/600/600`,
        order: 0,
        isMain: true,
      });

      await db.insert(schema.productVariants).values(
        SIZES.map((size) => ({
          productId: product.id,
          colorId: blackColor!.id,
          size,
          sku: `${product.id.slice(0, 6).toUpperCase()}-${size}`,
          price: null,
          isActive: true,
        })),
      );

      logger.info(`Created: ${p.name}`);
    }

    logger.info("Done! 10 products seeded successfully.");
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
}

seedProducts();
