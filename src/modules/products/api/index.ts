import { Elysia } from "elysia";
import { z } from "zod";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { listColors } from "../domain/repo/color/query";
import { addProductImage, deleteProductImage } from "../domain/repo/product/image";
import { createProduct } from "../domain/repo/product/create";
import { softDeleteProduct } from "../domain/repo/product/delete";
import { getProductById } from "../domain/repo/product/get-by-id";
import { listProducts } from "../domain/repo/product/query";
import { updateProduct } from "../domain/repo/product/update";
import { createVariant } from "../domain/repo/variant/create";
import { softDeleteVariant } from "../domain/repo/variant/delete";
import { listVariants } from "../domain/repo/variant/list";
import { updateVariant } from "../domain/repo/variant/update";
import {
  CreateProductSchema,
  ProductIdParamSchema,
  ProductQuerySchema,
  UpdateProductSchema,
} from "../domain/contracts/product.contract";
import {
  CreateVariantSchema,
  UpdateVariantSchema,
  VariantIdParamSchema,
} from "../domain/contracts/variant.contract";

const ImageBody = z.object({ url: z.string().min(1) });
const ImageIdParam = z.object({ id: z.string(), imageId: z.string() });

export const productsRoutes = new Elysia()
  .use(serverContext)
  // ── Colors ──────────────────────────────────────────────────────────────────
  .get(
    "/colors",
    async ({ db }) => listColors(db),
    { beforeHandle: requirePermission("products:read") },
  )
  // ── Products ─────────────────────────────────────────────────────────────────
  .get(
    "/products",
    async ({ db, query }) => listProducts(query, db),
    {
      beforeHandle: requirePermission("products:read"),
      query: ProductQuerySchema,
    },
  )
  .get(
    "/products/:id",
    async ({ db, params, status }) => {
      const row = await getProductById(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບສິນຄ້າ" });
      return row;
    },
    {
      beforeHandle: requirePermission("products:read"),
      params: ProductIdParamSchema,
    },
  )
  .post(
    "/products",
    async ({ db, body, status }) => {
      try {
        const product = await createProduct(body, db);
        return status(201, product);
      } catch (e) {
        return status(500, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    {
      beforeHandle: requirePermission("products:create"),
      body: CreateProductSchema,
    },
  )
  .patch(
    "/products/:id",
    async ({ db, params, body, status }) => {
      try {
        const row = await updateProduct(params.id, body, db);
        if (!row) return status(404, { message: "ບໍ່ພົບສິນຄ້າ" });
        return row;
      } catch (e) {
        return status(500, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    {
      beforeHandle: requirePermission("products:update"),
      params: ProductIdParamSchema,
      body: UpdateProductSchema,
    },
  )
  .delete(
    "/products/:id",
    async ({ db, params, status }) => {
      try {
        const row = await softDeleteProduct(params.id, db);
        if (!row) return status(404, { message: "ບໍ່ພົບສິນຄ້າ" });
        return row;
      } catch (e) {
        return status(500, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    {
      beforeHandle: requirePermission("products:delete"),
      params: ProductIdParamSchema,
    },
  )
  // ── Product Images ───────────────────────────────────────────────────────────
  .post(
    "/products/:id/images",
    async ({ db, params, body, status }) => {
      try {
        // Get current max order
        const product = await getProductById(params.id, db);
        if (!product) return status(404, { message: "ບໍ່ພົບສິນຄ້າ" });
        const maxOrder = product.images.length;
        const isMain = product.images.length === 0;
        const row = await addProductImage(
          params.id,
          { url: body.url, order: maxOrder, isMain },
          db,
        );
        return status(201, row);
      } catch (e) {
        return status(500, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    {
      beforeHandle: requirePermission("products:update"),
      params: ProductIdParamSchema,
      body: ImageBody,
    },
  )
  .delete(
    "/products/:id/images/:imageId",
    async ({ db, params, status }) => {
      try {
        const row = await deleteProductImage(params.id, params.imageId, db);
        if (!row) return status(404, { message: "ບໍ່ພົບຮູບ" });
        return row;
      } catch (e) {
        return status(500, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    {
      beforeHandle: requirePermission("products:update"),
      params: ImageIdParam,
    },
  )
  // ── Variants ─────────────────────────────────────────────────────────────────
  .get(
    "/products/:id/variants",
    async ({ db, params }) => listVariants(params.id, db),
    {
      beforeHandle: requirePermission("products:read"),
      params: ProductIdParamSchema,
    },
  )
  .post(
    "/products/:id/variants",
    async ({ db, params, body, status }) => {
      try {
        const row = await createVariant(params.id, body, db);
        return status(201, row);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("uq_variant")) {
          return status(409, { message: "Variant ສີ+ໄຊທີ່ເລືອກມີຢູ່ແລ້ວ" });
        }
        return status(500, { message: msg });
      }
    },
    {
      beforeHandle: requirePermission("products:update"),
      params: ProductIdParamSchema,
      body: CreateVariantSchema,
    },
  )
  .patch(
    "/products/:id/variants/:vid",
    async ({ db, params, body, status }) => {
      try {
        const row = await updateVariant(params.id, params.vid, body, db);
        if (!row) return status(404, { message: "ບໍ່ພົບ Variant" });
        return row;
      } catch (e) {
        return status(500, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    {
      beforeHandle: requirePermission("products:update"),
      params: VariantIdParamSchema,
      body: UpdateVariantSchema,
    },
  )
  .delete(
    "/products/:id/variants/:vid",
    async ({ db, params, status }) => {
      try {
        const row = await softDeleteVariant(params.id, params.vid, db);
        if (!row) return status(404, { message: "ບໍ່ພົບ Variant" });
        return row;
      } catch (e) {
        return status(500, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    {
      beforeHandle: requirePermission("products:delete"),
      params: VariantIdParamSchema,
    },
  );
