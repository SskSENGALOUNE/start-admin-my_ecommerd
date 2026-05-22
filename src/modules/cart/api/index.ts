import { Elysia } from "elysia";
import { serverContext } from "@/server/platform/http/context";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/modules/customer-auth/domain/services/customer-auth.service";
import { addCartItem } from "../domain/repo/add-item";
import { getOrCreateCart } from "../domain/repo/get-cart";
import { removeCartItem, clearCart } from "../domain/repo/remove-item";
import { updateCartItem } from "../domain/repo/update-item";
import {
  AddCartItemSchema,
  CartItemIdParam,
  UpdateCartItemSchema,
} from "../domain/contracts/cart.contract";

/** Read token from cookie header string */
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

export const cartRoutes = new Elysia({ prefix: "/cart" })
  .use(serverContext)

  // GET /cart
  .get("/", async ({ request, status }) => {
    const session = await getCustomerSession(request);
    if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
    const { db } = await import("@/server/platform/db/client");
    return getOrCreateCart(session.id, db);
  })

  // POST /cart/items
  .post(
    "/items",
    async ({ request, body, status }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      try {
        const { db } = await import("@/server/platform/db/client");
        return await addCartItem(session.id, body, db);
      } catch (e) {
        return status(400, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    { body: AddCartItemSchema },
  )

  // PATCH /cart/items/:itemId
  .patch(
    "/items/:itemId",
    async ({ request, params, body, status }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      try {
        const { db } = await import("@/server/platform/db/client");
        return await updateCartItem(session.id, params.itemId, body.quantity, db);
      } catch (e) {
        return status(400, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    { params: CartItemIdParam, body: UpdateCartItemSchema },
  )

  // DELETE /cart/items/:itemId
  .delete(
    "/items/:itemId",
    async ({ request, params, status }) => {
      const session = await getCustomerSession(request);
      if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
      try {
        const { db } = await import("@/server/platform/db/client");
        return await removeCartItem(session.id, params.itemId, db);
      } catch (e) {
        return status(400, { message: e instanceof Error ? e.message : String(e) });
      }
    },
    { params: CartItemIdParam },
  )

  // DELETE /cart
  .delete("/", async ({ request, status }) => {
    const session = await getCustomerSession(request);
    if (!session) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
    const { db } = await import("@/server/platform/db/client");
    return clearCart(session.id, db);
  });
