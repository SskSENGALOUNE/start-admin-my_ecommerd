import { Elysia } from "elysia";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { schema } from "@/server/platform/db/client";
import { serverContext } from "@/server/platform/http/context";
import {
  LoginSchema,
  RegisterSchema,
} from "../domain/contracts/customer-auth.contract";
import {
  CUSTOMER_COOKIE,
  hashPassword,
  signCustomerToken,
  verifyCustomerToken,
  verifyPassword,
} from "../domain/services/customer-auth.service";

const GoogleCallbackSchema = z.object({
  access_token: z.string().min(1),
});

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setSessionCookie(set: { headers: Record<string, string> }, token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  set.headers["Set-Cookie"] =
    `${CUSTOMER_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearSessionCookie(set: { headers: Record<string, string> }) {
  set.headers["Set-Cookie"] =
    `${CUSTOMER_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CUSTOMER_COOKIE}=`));
  return match ? match.slice(CUSTOMER_COOKIE.length + 1) : null;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export const customerAuthRoutes = new Elysia({ prefix: "/customer-auth" })
  .use(serverContext)

  // POST /customer-auth/register
  .post(
    "/register",
    async ({ db, body, set, status }) => {
      const [existing] = await db
        .select({ id: schema.customers.id })
        .from(schema.customers)
        .where(
          and(
            eq(schema.customers.email, body.email.toLowerCase()),
            isNull(schema.customers.deletedAt),
          ),
        )
        .limit(1);

      if (existing) {
        return status(409, { message: "ອີເມວນີ້ຖືກໃຊ້ແລ້ວ" });
      }

      const hashed = await hashPassword(body.password);

      const [customer] = await db
        .insert(schema.customers)
        .values({
          email: body.email.toLowerCase(),
          password: hashed,
          name: body.name,
          phone: body.phone ?? null,
          isActive: true,
        })
        .returning({
          id: schema.customers.id,
          email: schema.customers.email,
          name: schema.customers.name,
          phone: schema.customers.phone,
          isActive: schema.customers.isActive,
        });

      if (!customer) return status(500, { message: "ສ້າງບັນຊີລົ້ມເຫຼວ" });

      const token = await signCustomerToken({ ...customer, hasPassword: true });
      setSessionCookie(set, token);

      return { customer };
    },
    { body: RegisterSchema },
  )

  // POST /customer-auth/login
  .post(
    "/login",
    async ({ db, body, set, status }) => {
      const [customer] = await db
        .select()
        .from(schema.customers)
        .where(
          and(
            eq(schema.customers.email, body.email.toLowerCase()),
            isNull(schema.customers.deletedAt),
          ),
        )
        .limit(1);

      if (!customer || !customer.password) {
        return status(401, { message: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" });
      }

      if (!customer.isActive) {
        return status(403, { message: "ບັນຊີນີ້ຖືກລະງັບ ກະລຸນາຕິດຕໍ່ Admin" });
      }

      const valid = await verifyPassword(body.password, customer.password);
      if (!valid) {
        return status(401, { message: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" });
      }

      const session = {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone ?? null,
        isActive: customer.isActive,
        hasPassword: true,
      };

      const token = await signCustomerToken(session);
      setSessionCookie(set, token);

      return { customer: session };
    },
    { body: LoginSchema },
  )

  // POST /customer-auth/logout
  .post("/logout", ({ set }) => {
    clearSessionCookie(set);
    return { ok: true };
  })

  // GET /customer-auth/me
  .get("/me", async ({ request, status }) => {
    const token = getTokenFromRequest(request);
    if (!token) return status(401, { message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ" });

    const session = await verifyCustomerToken(token);
    if (!session) return status(401, { message: "Session ໝົດອາຍຸ" });

    return { customer: session };
  })

  // POST /customer-auth/google
  // Frontend ส่ง Supabase access_token มา → verify กับ Supabase → sync customer → set cookie
  .post(
    "/google",
    async ({ body, set, status, db }) => {
      // ── 1. Get user info from Supabase using the access_token ──────────────
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        return status(500, { message: "Supabase config missing" });
      }

      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${body.access_token}`,
          apikey: serviceRoleKey,
        },
      });

      if (!userRes.ok) {
        return status(401, { message: "Google token ບໍ່ຖືກຕ້ອງ" });
      }

      const supabaseUser = (await userRes.json()) as {
        id: string;
        email: string;
        user_metadata?: { full_name?: string; name?: string; avatar_url?: string };
      };

      const email = supabaseUser.email?.toLowerCase();
      if (!email) return status(400, { message: "ບໍ່ສາມາດດຶງ email ຈາກ Google" });

      const name =
        supabaseUser.user_metadata?.full_name ??
        supabaseUser.user_metadata?.name ??
        email.split("@")[0];

      // ── 2. Find or create customer in our DB ───────────────────────────────
      let [customer] = await db
        .select({
          id: schema.customers.id,
          email: schema.customers.email,
          name: schema.customers.name,
          phone: schema.customers.phone,
          isActive: schema.customers.isActive,
        })
        .from(schema.customers)
        .where(
          and(
            eq(schema.customers.email, email),
            isNull(schema.customers.deletedAt),
          ),
        )
        .limit(1);

      if (!customer) {
        // New customer — create with supabaseId, no password needed
        const [created] = await db
          .insert(schema.customers)
          .values({
            email,
            name,
            supabaseId: supabaseUser.id,
            isActive: true,
          })
          .returning({
            id: schema.customers.id,
            email: schema.customers.email,
            name: schema.customers.name,
            phone: schema.customers.phone,
            isActive: schema.customers.isActive,
          });

        if (!created) return status(500, { message: "ສ້າງບັນຊີລົ້ມເຫຼວ" });
        customer = created;
      } else if (!customer.isActive) {
        return status(403, { message: "ບັນຊີນີ້ຖືກລະງັບ" });
      }

      // ── 3. Sign our JWT + set cookie ───────────────────────────────────────
      const token = await signCustomerToken({
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone ?? null,
        isActive: customer.isActive,
        hasPassword: false,
      });

      setSessionCookie(set, token);
      return { customer };
    },
    { body: GoogleCallbackSchema },
  );
