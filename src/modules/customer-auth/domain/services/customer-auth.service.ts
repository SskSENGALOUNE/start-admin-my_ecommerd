import { SignJWT, jwtVerify } from "jose";
import type { CustomerSession } from "../contracts/customer-auth.contract";

const COOKIE_NAME = "customer_session";
const EXPIRES_IN_DAYS = 7;

function getSecret() {
  const secret = process.env.CUSTOMER_AUTH_SECRET;
  if (!secret) throw new Error("CUSTOMER_AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return Bun.password.hash(plain, { algorithm: "bcrypt", cost: 10 });
}

export async function verifyPassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return Bun.password.verify(plain, hashed);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export async function signCustomerToken(
  payload: CustomerSession,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN_DAYS}d`)
    .sign(getSecret());
}

export async function verifyCustomerToken(
  token: string,
): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as CustomerSession;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export const CUSTOMER_COOKIE = COOKIE_NAME;
export const CUSTOMER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * EXPIRES_IN_DAYS,
};
