import { Elysia } from "elysia";
import { requireAuth } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { getDashboardStats } from "../domain/repo/get-stats";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .use(serverContext)
  .get(
    "/stats",
    async ({ db }) => getDashboardStats(db),
    { beforeHandle: requireAuth },
  );
