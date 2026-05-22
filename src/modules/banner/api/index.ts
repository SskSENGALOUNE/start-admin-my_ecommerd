import { Elysia } from "elysia";
import { z } from "zod";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import { createBanner } from "../domain/repo/create";
import { softDeleteBanner } from "../domain/repo/delete";
import { getBannerById } from "../domain/repo/get-by-id";
import { listBanners } from "../domain/repo/query";
import { updateBanner } from "../domain/repo/update";

const IdParam = z.object({ id: z.string().min(1) });

const CreateBannerBody = z.object({
  title: z.string().min(1),
  imageUrl: z.string().min(1),
  linkUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

const UpdateBannerBody = z.object({
  title: z.string().min(1).optional(),
  imageUrl: z.string().min(1).optional(),
  linkUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const bannersRoutes = new Elysia({ prefix: "/banners" })
  .use(serverContext)
  // GET /banners
  .get(
    "/",
    async ({ db, query }) => {
      return await listBanners(query, db);
    },
    {
      beforeHandle: requirePermission("banners:read"),
      query: OffsetPageQuerySchema,
    },
  )
  // GET /banners/:id
  .get(
    "/:id",
    async ({ db, params, status }) => {
      const row = await getBannerById(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບ Banner" });
      return row;
    },
    {
      beforeHandle: requirePermission("banners:read"),
      params: IdParam,
    },
  )
  // POST /banners
  .post(
    "/",
    async ({ db, body, status }) => {
      try {
        const row = await createBanner(body, db);
        return status(201, row);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { message });
      }
    },
    {
      beforeHandle: requirePermission("banners:create"),
      body: CreateBannerBody,
    },
  )
  // PATCH /banners/:id
  .patch(
    "/:id",
    async ({ db, params, body, status }) => {
      try {
        const row = await updateBanner(params.id, body, db);
        if (!row) return status(404, { message: "ບໍ່ພົບ Banner" });
        return row;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { message });
      }
    },
    {
      beforeHandle: requirePermission("banners:update"),
      params: IdParam,
      body: UpdateBannerBody,
    },
  )
  // DELETE /banners/:id
  .delete(
    "/:id",
    async ({ db, params, status }) => {
      try {
        const row = await softDeleteBanner(params.id, db);
        if (!row) return status(404, { message: "ບໍ່ພົບ Banner" });
        return row;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { message });
      }
    },
    {
      beforeHandle: requirePermission("banners:delete"),
      params: IdParam,
    },
  );
