import { Elysia } from "elysia";
import { z } from "zod";
import { and, eq, ilike, isNull, sql } from "drizzle-orm";
import { schema } from "@/server/platform/db/client";
import { serverContext } from "@/server/platform/http/context";
import { listVariants } from "@/modules/products/domain/repo/variant/list";

const ProductQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(60).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  categoryId: z.string().optional(),
});

const IdParam = z.object({ id: z.string().min(1) });

export const shopRoutes = new Elysia({ prefix: "/shop" })
  .use(serverContext)

  // GET /shop/banners — public active banners
  .get("/banners", async ({ db }) => {
    const rows = await db
      .select({
        id: schema.banners.id,
        title: schema.banners.title,
        imageUrl: schema.banners.imageUrl,
        linkUrl: schema.banners.linkUrl,
        order: schema.banners.order,
      })
      .from(schema.banners)
      .where(
        and(
          isNull(schema.banners.deletedAt),
          sql`${schema.banners.isActive} = true`,
        ),
      )
      .orderBy(schema.banners.order);
    return { data: rows };
  })

  // GET /shop/categories — public category list
  .get("/categories", async ({ db }) => {
    const rows = await db
      .select({ id: schema.categories.id, name: schema.categories.name })
      .from(schema.categories)
      .where(isNull(schema.categories.deletedAt))
      .orderBy(schema.categories.name);
    return { data: rows };
  })

  // GET /shop/products — public product list (active only)
  .get(
    "/products",
    async ({ db, query }) => {
      const conditions = [
        isNull(schema.products.deletedAt),
        sql`${schema.products.isActive} = true`,
      ];

      if (query.search) {
        conditions.push(ilike(schema.products.name, `%${query.search}%`));
      }
      if (query.categoryId) {
        conditions.push(eq(schema.products.categoryId, query.categoryId));
      }

      const where = and(...conditions);

      const countResult = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.products)
        .where(where);
      const count = countResult[0]?.count ?? 0;

      const rows = await db
        .select({
          id: schema.products.id,
          name: schema.products.name,
          basePrice: schema.products.basePrice,
          categoryId: schema.products.categoryId,
          categoryName: schema.categories.name,
          quantity: schema.products.quantity,
          reservedQty: schema.products.reservedQty,
          // Main image only
          mainImage: sql<string | null>`(
            SELECT url FROM product_images
            WHERE product_id = ${schema.products.id}
              AND is_main = true
            LIMIT 1
          )`,
        })
        .from(schema.products)
        .leftJoin(
          schema.categories,
          eq(schema.products.categoryId, schema.categories.id),
        )
        .where(where)
        .orderBy(schema.products.createdAt)
        .limit(query.limit)
        .offset(query.offset);

      return {
        data: rows.map((r) => ({
          ...r,
          availableStock: r.quantity - r.reservedQty,
        })),
        meta: { total: count ?? 0, limit: query.limit, offset: query.offset },
      };
    },
    { query: ProductQuerySchema },
  )

  // GET /shop/products/:id — public product detail + variants
  .get(
    "/products/:id",
    async ({ db, params, status }) => {
      const [product] = await db
        .select({
          id: schema.products.id,
          name: schema.products.name,
          description: schema.products.description,
          basePrice: schema.products.basePrice,
          categoryId: schema.products.categoryId,
          categoryName: schema.categories.name,
          quantity: schema.products.quantity,
          reservedQty: schema.products.reservedQty,
          isActive: schema.products.isActive,
        })
        .from(schema.products)
        .leftJoin(
          schema.categories,
          eq(schema.products.categoryId, schema.categories.id),
        )
        .where(
          and(
            eq(schema.products.id, params.id),
            isNull(schema.products.deletedAt),
            sql`${schema.products.isActive} = true`,
          ),
        )
        .limit(1);

      if (!product) return status(404, { message: "ບໍ່ພົບສິນຄ້າ" });

      const images = await db
        .select()
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, params.id))
        .orderBy(schema.productImages.order);

      const variants = await listVariants(params.id, db);

      return {
        ...product,
        availableStock: product.quantity - product.reservedQty,
        images,
        variants: variants.filter((v) => v.isActive),
      };
    },
    { params: IdParam },
  );
