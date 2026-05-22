import { Elysia } from "elysia";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { createShipment } from "../domain/repo/create";
import { getShipmentByOrderId } from "../domain/repo/get-by-order";
import { markDelivered } from "../domain/repo/mark-delivered";
import { updateTracking } from "../domain/repo/update-tracking";
import {
  CreateShipmentSchema,
  OrderIdParamSchema,
  ShipmentIdParamSchema,
  UpdateTrackingSchema,
} from "../domain/contracts/shipment.contract";

export const shipmentsRoutes = new Elysia({ prefix: "/shipments" })
  .use(serverContext)

  // GET /shipments/order/:orderId — get shipment for an order
  .get(
    "/order/:orderId",
    async ({ db, params, status }) => {
      const row = await getShipmentByOrderId(params.orderId, db);
      if (!row) return status(404, { message: "ບໍ່ພົບ Shipment" });
      return row;
    },
    {
      beforeHandle: requirePermission("shipments:read"),
      params: OrderIdParamSchema,
    },
  )

  // POST /shipments — create shipment (order must be PROCESSING)
  .post(
    "/",
    async ({ db, body, status }) => {
      try {
        const shipment = await createShipment(body, db);
        return status(201, shipment);
      } catch (e) {
        return status(400, {
          message: e instanceof Error ? e.message : String(e),
        });
      }
    },
    {
      beforeHandle: requirePermission("shipments:update"),
      body: CreateShipmentSchema,
    },
  )

  // PATCH /shipments/:id/tracking — enter tracking number → SHIPPED
  .patch(
    "/:id/tracking",
    async ({ db, params, body, status }) => {
      try {
        const row = await updateTracking(params.id, body, db);
        return row;
      } catch (e) {
        return status(400, {
          message: e instanceof Error ? e.message : String(e),
        });
      }
    },
    {
      beforeHandle: requirePermission("shipments:update"),
      params: ShipmentIdParamSchema,
      body: UpdateTrackingSchema,
    },
  )

  // PATCH /shipments/:id/delivered — confirm delivery → DELIVERED
  .patch(
    "/:id/delivered",
    async ({ db, params, status }) => {
      try {
        const row = await markDelivered(params.id, db);
        return row;
      } catch (e) {
        return status(400, {
          message: e instanceof Error ? e.message : String(e),
        });
      }
    },
    {
      beforeHandle: requirePermission("shipments:update"),
      params: ShipmentIdParamSchema,
    },
  );
