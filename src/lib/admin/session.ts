import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";

/*
  Stateless admin session: a signed cookie carrying the user id, the user's
  session epoch and the expiry. Every request still loads the user row, so
  deleting an admin ends their session at once, and bumping the epoch
  (password change, "log out everywhere") ends every cookie issued before.

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

export function createSessionToken(userId: number, epoch = 0, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, ep: epoch, exp: now + SESSION_DAYS * 864e5 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined, now = Date.now()): { uid: number; epoch: number } | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { uid, ep, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: number; ep?: number; exp: number };
    // Cookies issued before epochs existed carry none; they belong to epoch 0.
    const epoch = ep ?? 0;
    return Number.isInteger(uid) && Number.isInteger(epoch) && exp > now ? { uid, epoch } : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number, epoch: number) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(userId, epoch), {
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
  const session = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const [user] = await getDb()
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, epoch: adminUsers.sessionEpoch })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.uid))
    .limit(1);
  if (!user || user.epoch !== session.epoch) return null;
  return { id: user.id, email: user.email, name: user.name };
}

/** Every admin page and every admin server action starts here. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
