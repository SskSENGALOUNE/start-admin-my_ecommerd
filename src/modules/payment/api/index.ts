import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/modules/customer-auth/domain/services/customer-auth.service";
import { requirePermission } from "@/modules/roles/domain/http/middleware";
import { schema } from "@/server/platform/db/client";
import { serverContext } from "@/server/platform/http/context";

function getCustomerToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CUSTOMER_COOKIE}=`));
  return match ? match.slice(CUSTOMER_COOKIE.length + 1) : null;
}

const OrderIdParam = z.object({ orderId: z.string().min(1) });

export const paymentRoutes = new Elysia({ prefix: "/payment" })
  .use(serverContext)

  // ─── GET /payment/status/:orderId ─────────────────────────────────────────
  // Customer polls this to know if QR payment went through
  .get(
    "/status/:orderId",
    async ({ request, params, status }) => {
      const token = getCustomerToken(request);
      if (!token) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });

      const session = await verifyCustomerToken(token);
      if (!session) return status(401, { message: "Session ໝົດອາຍຸ" });

      const { db } = await import("@/server/platform/db/client");

      const [order] = await db
        .select({ id: schema.orders.id, status: schema.orders.status })
        .from(schema.orders)
        .where(eq(schema.orders.id, params.orderId))
        .limit(1);

      if (!order) return status(404, { message: "ບໍ່ພົບ Order" });

      const [txn] = await db
        .select({
          status: schema.transactions.status,
          paymentMethod: schema.transactions.paymentMethod,
          verifiedAt: schema.transactions.verifiedAt,
        })
        .from(schema.transactions)
        .where(eq(schema.transactions.orderRef, params.orderId))
        .limit(1);

      return {
        orderId: order.id,
        orderStatus: order.status,
        paymentStatus: txn?.status ?? "PENDING",
        paymentMethod: txn?.paymentMethod ?? null,
        verifiedAt: txn?.verifiedAt ?? null,
        isPaid: txn?.status === "COMPLETED",
      };
    },
    { params: OrderIdParam },
  )

  // ─── POST /payment/admin/confirm/:orderId ─────────────────────────────────
  // Admin manual confirm (for dev/fallback when PubNub doesn't fire)
  // 🧪 DEV TESTING: ใช้ endpoint นี้เพื่อ simulate QR payment สำเร็จ
  //    curl -X POST /api/payment/admin/confirm/<orderId>  (ต้อง login เป็น admin ก่อน)
  .post(
    "/admin/confirm/:orderId",
    async ({ db, params, status }) => {
      const [txn] = await db
        .select({
          id: schema.transactions.id,
          status: schema.transactions.status,
        })
        .from(schema.transactions)
        .where(eq(schema.transactions.orderRef, params.orderId))
        .limit(1);

      if (!txn) return status(404, { message: "ບໍ່ພົບ Transaction" });
      if (txn.status === "COMPLETED") {
        return status(400, { message: "ຊຳລະແລ້ວ" });
      }

      await db.transaction(async (tx) => {
        await tx
          .update(schema.transactions)
          .set({
            status: "COMPLETED",
            bankRequest: "MANUAL_CONFIRM",
            bankResponse: JSON.stringify({
              confirmedBy: "admin",
              at: new Date(),
            }),
            verifiedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(schema.transactions.id, txn.id));

        await tx
          .update(schema.orders)
          .set({ status: "CONFIRMED", updatedAt: new Date() })
          .where(eq(schema.orders.id, params.orderId));
      });

      return { ok: true, message: "ຢືນຢັນການຊຳລະສຳເລັດ" };
    },
    {
      beforeHandle: requirePermission("orders:update"),
      params: OrderIdParam,
    },
  );
