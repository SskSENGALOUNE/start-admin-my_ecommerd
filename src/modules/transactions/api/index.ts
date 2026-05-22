import { Elysia } from "elysia";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { serverContext } from "@/server/platform/http/context";
import { getTransactionById } from "../domain/repo/get-by-id";
import { listTransactions } from "../domain/repo/list";
import {
  TransactionIdParamSchema,
  TransactionQuerySchema,
} from "../domain/contracts/transaction.contract";

export const transactionsRoutes = new Elysia({ prefix: "/transactions" })
  .use(serverContext)

  .get(
    "/",
    async ({ db, query }) => {
      return await listTransactions(query, db);
    },
    {
      beforeHandle: requirePermission("transactions:read"),
      query: TransactionQuerySchema,
    },
  )

  .get(
    "/:id",
    async ({ db, params, status }) => {
      const row = await getTransactionById(params.id, db);
      if (!row) return status(404, { message: "ບໍ່ພົບລາຍການໂອນເງິນ" });
      return row;
    },
    {
      beforeHandle: requirePermission("transactions:read"),
      params: TransactionIdParamSchema,
    },
  );
