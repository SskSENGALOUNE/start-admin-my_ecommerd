import { Elysia } from "elysia";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { cancelOrder } from "../domain/repo/cancel";
import { getOrderById } from "../domain/repo/get-by-id";
import { listOrders } from "../domain/repo/query";
import { updateOrderStatus } from "../domain/repo/update-status";
import {
  OrderIdParamSchema,
  OrderQuerySchema,
  UpdateOrderStatusSchema,
} from "../domain/contracts/order.contract";

export const ordersRoutes = new Elysia({ prefix: "/orders" })
  .use(serverContext)

  // GET /orders — list with filters
  .get(
    "/",
    async ({ db, query }) => {
      return await listOrders(query, db);
    },
    {
      beforeHandle: requirePermission("orders:read"),
      query: OrderQuerySchema,
    },
  )

  // GET /orders/:id — detail with items, shipment, transaction
  .get(
    "/:id",
    async ({ db, params, status }) => {
      const row = await getOrderById(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບຄຳສັ່ງຊື້" });
      return row;
    },
    {
      beforeHandle: requirePermission("orders:read"),
      params: OrderIdParamSchema,
    },
  )

  // PATCH /orders/:id/status — update order status
  .patch(
    "/:id/status",
    async ({ db, params, body, status }) => {
      try {
        const row = await updateOrderStatus(params.id, body.status, db);
        if (!row) return status(404, { message: "ບໍ່ພົບຄຳສັ່ງຊື້" });
        return row;
      } catch (e) {
        return status(400, {
          message: e instanceof Error ? e.message : String(e),
        });
      }
    },
    {
      beforeHandle: requirePermission("orders:update"),
      params: OrderIdParamSchema,
      body: UpdateOrderStatusSchema,
    },
  )

  // POST /orders/:id/cancel — cancel order
  .post(
    "/:id/cancel",
    async ({ db, params, status }) => {
      try {
        const row = await cancelOrder(params.id, db);
        if (!row) return status(404, { message: "ບໍ່ພົບຄຳສັ່ງຊື້" });
        return row;
      } catch (e) {
        return status(400, {
          message: e instanceof Error ? e.message : String(e),
        });
      }
    },
    {
      beforeHandle: requirePermission("orders:update"),
      params: OrderIdParamSchema,
    },
  );
