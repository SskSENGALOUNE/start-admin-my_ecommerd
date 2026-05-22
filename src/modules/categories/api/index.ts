import { Elysia } from "elysia";
import { z } from "zod";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { OffsetPageQuerySchema } from "@/shared/contracts/base";
import { createCategory } from "../domain/repo/create";
import { softDeleteCategory } from "../domain/repo/delete";
import { getCategoryById } from "../domain/repo/get-by-id";
import { listCategories } from "../domain/repo/query";
import { updateCategory } from "../domain/repo/update";

const IdParam = z.object({ id: z.string().min(1) });
const CategoryBody = z.object({ name: z.string().min(1) });

export const categoriesRoutes = new Elysia({ prefix: "/categories" })
  .use(serverContext)
  // GET /categories
  .get(
    "/",
    async ({ db, query }) => {
      return await listCategories(query, db);
    },
    {
      beforeHandle: requirePermission("categories:read"),
      query: OffsetPageQuerySchema,
    },
  )
  // GET /categories/:id
  .get(
    "/:id",
    async ({ db, params, status }) => {
      const row = await getCategoryById(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບໝວດໝູ່" });
      return row;
    },
    {
      beforeHandle: requirePermission("categories:read"),
      params: IdParam,
    },
  )
  // POST /categories
  .post(
    "/",
    async ({ db, body, status }) => {
      try {
        const row = await createCategory({ name: body.name }, db);
        return status(201, row);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { message });
      }
    },
    {
      beforeHandle: requirePermission("categories:create"),
      body: CategoryBody,
    },
  )
  // PATCH /categories/:id
  .patch(
    "/:id",
    async ({ db, params, body, status }) => {
      try {
        const row = await updateCategory(params.id, { name: body.name }, db);
        if (!row) return status(404, { message: "ບໍ່ພົບໝວດໝູ່" });
        return row;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { message });
      }
    },
    {
      beforeHandle: requirePermission("categories:update"),
      params: IdParam,
      body: CategoryBody,
    },
  )
  // DELETE /categories/:id
  .delete(
    "/:id",
    async ({ db, params, status }) => {
      try {
        const row = await softDeleteCategory(params.id, db);
        if (!row) return status(404, { message: "ບໍ່ພົບໝວດໝູ່" });
        return row;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return status(500, { message });
      }
    },
    {
      beforeHandle: requirePermission("categories:delete"),
      params: IdParam,
    },
  );
