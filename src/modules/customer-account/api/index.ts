import { Elysia } from "elysia";
import { serverContext } from "@/server/platform/http/context";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/modules/customer-auth/domain/services/customer-auth.service";
import { listMyOrders } from "../domain/repo/list-my-orders";
import { getMyOrder } from "../domain/repo/get-my-order";
import { updateMyProfile } from "../domain/repo/update-my-profile";
import { changeMyPassword } from "../domain/repo/change-my-password";
import { listMyAddresses } from "../domain/repo/list-my-addresses";
import { createMyAddress } from "../domain/repo/create-my-address";
import { updateMyAddress } from "../domain/repo/update-my-address";
import { deleteMyAddress } from "../domain/repo/delete-my-address";
import { setDefaultAddress } from "../domain/repo/set-default-address";
import { cancelOrder } from "@/modules/orders/domain/repo/cancel";
import {
  MyOrderQuerySchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  AddressUpsertSchema,
} from "../domain/contracts/customer-account.contract";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CUSTOMER_COOKIE}=`));
  return match ? match.slice(CUSTOMER_COOKIE.length + 1) : null;
}

async function getCustomerSession(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyCustomerToken(token);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const customerAccountRoutes = new Elysia({ prefix: "/customer-account" })
  .use(serverContext)

  // ── Orders ─────────────────────────────────────────────────────────────────

  // GET /customer-account/orders
  .get(
    "/orders",
    async ({ request, query, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      return listMyOrders(session.id, query, db);
    },
    { query: MyOrderQuerySchema },
  )

  // GET /customer-account/orders/:id
  .get(
    "/orders/:id",
    async ({ request, params, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      const order = await getMyOrder(params.id, session.id, db);
      if (!order) return status(404, { message: "ບໍ່ພົບຄຳສັ່ງຊື້" });
      return order;
    },
  )

  // POST /customer-account/orders/:id/cancel
  .post(
    "/orders/:id/cancel",
    async ({ request, params, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });

      // Verify ownership before cancelling
      const order = await getMyOrder(params.id, session.id, db);
      if (!order) return status(404, { message: "ບໍ່ພົບຄຳສັ່ງຊື້" });

      try {
        const updated = await cancelOrder(params.id, db);
        return updated;
      } catch (e) {
        return status(400, { message: e instanceof Error ? e.message : String(e) });
      }
    },
  )

  // ── Profile ────────────────────────────────────────────────────────────────

  // PATCH /customer-account/profile
  .patch(
    "/profile",
    async ({ request, body, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      const updated = await updateMyProfile(session.id, body, db);
      if (!updated) return status(404, { message: "ບໍ່ພົບຂໍ້ມູນລູກຄ້າ" });
      return updated;
    },
    { body: UpdateProfileSchema },
  )

  // PATCH /customer-account/password
  .patch(
    "/password",
    async ({ request, body, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      try {
        return await changeMyPassword(session.id, body, db);
      } catch (e) {
        return status(400, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    { body: ChangePasswordSchema },
  )

  // ── Addresses ──────────────────────────────────────────────────────────────

  // GET /customer-account/addresses
  .get("/addresses", async ({ request, status, db }) => {
    const session = await getCustomerSession(request);
    if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
    return listMyAddresses(session.id, db);
  })

  // POST /customer-account/addresses
  .post(
    "/addresses",
    async ({ request, body, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      const existing = await listMyAddresses(session.id, db);
      if (existing.length > 0)
        return status(400, { message: "ມີທີ່ຢູ່ຈັດສົ່ງແລ້ວ — ກະລຸນາແກ້ໄຂທີ່ຢູ່ທີ່ມີຢູ່" });
      const created = await createMyAddress(session.id, body, db);
      if (!created) return status(500, { message: "ສ້າງທີ່ຢູ່ລົ້ມເຫຼວ" });
      return created;
    },
    { body: AddressUpsertSchema },
  )

  // PATCH /customer-account/addresses/:id
  .patch(
    "/addresses/:id",
    async ({ request, params, body, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      const updated = await updateMyAddress(params.id, session.id, body, db);
      if (!updated) return status(404, { message: "ບໍ່ພົບທີ່ຢູ່" });
      return updated;
    },
    { body: AddressUpsertSchema },
  )

  // DELETE /customer-account/addresses/:id
  .delete(
    "/addresses/:id",
    async ({ request, params, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      const deleted = await deleteMyAddress(params.id, session.id, db);
      if (!deleted) return status(404, { message: "ບໍ່ພົບທີ່ຢູ່" });
      return { ok: true };
    },
  )

  // PATCH /customer-account/addresses/:id/default
  .patch(
    "/addresses/:id/default",
    async ({ request, params, status, db }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      const updated = await setDefaultAddress(params.id, session.id, db);
      if (!updated) return status(404, { message: "ບໍ່ພົບທີ່ຢູ່" });
      return updated;
    },
  );
