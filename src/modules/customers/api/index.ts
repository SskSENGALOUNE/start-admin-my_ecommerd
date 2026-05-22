import { Elysia } from "elysia";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { banCustomer } from "../domain/repo/ban";
import { getCustomerById } from "../domain/repo/get-by-id";
import { listCustomers } from "../domain/repo/query";
import { unbanCustomer } from "../domain/repo/unban";
import {
  CustomerIdParamSchema,
  CustomerQuerySchema,
} from "../domain/contracts/customer.contract";

export const customersRoutes = new Elysia({ prefix: "/customers" })
  .use(serverContext)

  // GET /customers — list with search + filter
  .get(
    "/",
    async ({ db, query }) => listCustomers(query, db),
    {
      beforeHandle: requirePermission("customers:read"),
      query: CustomerQuerySchema,
    },
  )

  // GET /customers/:id — detail + orders + addresses
  .get(
    "/:id",
    async ({ db, params, status }) => {
      const row = await getCustomerById(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບລູກຄ້າ" });
      return row;
    },
    {
      beforeHandle: requirePermission("customers:read"),
      params: CustomerIdParamSchema,
    },
  )

  // POST /customers/:id/ban
  .post(
    "/:id/ban",
    async ({ db, params, status }) => {
      const row = await banCustomer(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບລູກຄ້າ" });
      return row;
    },
    {
      beforeHandle: requirePermission("customers:update"),
      params: CustomerIdParamSchema,
    },
  )

  // POST /customers/:id/unban
  .post(
    "/:id/unban",
    async ({ db, params, status }) => {
      const row = await unbanCustomer(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບລູກຄ້າ" });
      return row;
    },
    {
      beforeHandle: requirePermission("customers:update"),
      params: CustomerIdParamSchema,
    },
  );
