import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";

/*
  Stateless admin session: a signed cookie carrying the user id and expiry.
  Every request still loads the user row, so deleting an admin ends their
  session at once without a sessions table.

  The cookie is scoped to /admin, httpOnly, SameSite=Strict (an admin action
  is never the target of a cross-site link) and Secure outside development.
*/
export const SESSION_COOKIE = "govita_admin";
const SESSION_DAYS = 7;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be set (at least 32 characters) to use the admin panel");
  }
  return "dev-only-admin-session-secret-not-for-production";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: number, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: now + SESSION_DAYS * 864e5 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined, now = Date.now()): number | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: number; exp: number };
    return Number.isInteger(uid) && exp > now ? uid : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

export async function currentAdmin(): Promise<AdminUser | null> {
  if (!isDbConfigured) return null;
  const uid = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (uid == null) return null;
  const [user] = await getDb()
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name })
    .from(adminUsers)
    .where(eq(adminUsers.id, uid))
    .limit(1);
  return user ?? null;
}

/** Every admin page and every admin server action starts here. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
