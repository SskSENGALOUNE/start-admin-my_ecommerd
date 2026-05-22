import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "../services/customer-auth.service";
import type { CustomerSession } from "../contracts/customer-auth.contract";

type CustomerGuardCtx = {
  cookie: Record<string, { value?: string } | undefined>;
  status: (code: number, body?: unknown) => unknown;
  customerSession?: CustomerSession | null;
};

/**
 * Elysia beforeHandle — ตรวจสอบ customer JWT cookie
 * ถ้า valid → ใส่ customerSession ใน context (ต้อง derive ก่อนใช้งาน)
 * ถ้า invalid → 401
 */
export async function requireCustomer(ctx: CustomerGuardCtx) {
  const token = ctx.cookie[CUSTOMER_COOKIE]?.value;
  if (!token) {
    return ctx.status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });
  }
  const session = await verifyCustomerToken(token);
  if (!session) {
    return ctx.status(401, { message: "Session ໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່" });
  }
  // attach to ctx so handlers can use it
  (ctx as { customerSession: CustomerSession }).customerSession = session;
}
