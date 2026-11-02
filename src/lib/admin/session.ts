import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { adminUsers, type AdminRole } from "@/lib/db/schema";
import { ADMIN_PATH_HEADER, PENDING_2FA_COOKIE, SESSION_COOKIE } from "@/lib/admin/cookie";
import { can, isAdminRole, permissionForPath, type Permission } from "@/lib/admin/roles";

/*
  Stateless admin session: a signed cookie carrying the user id, the user's
  session epoch and the expiry. Every request still loads the user row, so
  deleting an admin ends their session at once, and bumping the epoch
  (password change, "log out everywhere") ends every cookie issued before.

  The cookie is scoped to /admin, httpOnly, SameSite=Strict (an admin action
  is never the target of a cross-site link) and Secure outside development.
*/
export { SESSION_COOKIE };
/** Absolute lifetime of a sign-in. */
const SESSION_DAYS = 7;
/**
 * Idle timeout: a session not used for 12 hours ends. The token carries the
 * last time it was refreshed (`seen`); the middleware re-signs it on page
 * loads (lib/admin/session-edge.ts), so an admin who keeps working stays
 * signed in until SESSION_DAYS, and a cookie left on a shared computer dies
 * overnight.
 */
export const SESSION_IDLE_MS = 12 * 3_600_000;

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
  const payload = Buffer.from(JSON.stringify({ uid: userId, ep: epoch, exp: now + SESSION_DAYS * 864e5, seen: now })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

type TokenBody = { uid: number; ep?: number; exp: number; k?: string; seen?: number };

function readToken(token: string | undefined, now: number): TokenBody | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString()) as TokenBody;
    return Number.isInteger(body.uid) && Number.isInteger(body.ep ?? 0) && body.exp > now ? body : null;
  } catch {
    return null;
  }
}

export function readSessionToken(token: string | undefined, now = Date.now()): { uid: number; epoch: number } | null {
  const body = readToken(token, now);
  // A half-finished sign-in (password checked, code not yet) is never a session.
  if (!body || body.k !== undefined) return null;
  // Tokens from before the idle timeout carry no `seen`: they count from when they were issued.
  const seen = typeof body.seen === "number" ? body.seen : body.exp - SESSION_DAYS * 864e5;
  if (now - seen > SESSION_IDLE_MS) return null;
  // Cookies issued before epochs existed carry none; they belong to epoch 0.
  return { uid: body.uid, epoch: body.ep ?? 0 };
}

/* ---------- second step of sign-in ---------- */

const PENDING_MINUTES = 5;

export function createPendingToken(userId: number, epoch: number, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, ep: epoch, exp: now + PENDING_MINUTES * 60_000, k: "2fa" })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readPendingToken(token: string | undefined, now = Date.now()): { uid: number; epoch: number } | null {
  const body = readToken(token, now);
  return body && body.k === "2fa" ? { uid: body.uid, epoch: body.ep ?? 0 } : null;
}

export async function setPendingCookie(userId: number, epoch: number) {
  (await cookies()).set(PENDING_2FA_COOKIE, createPendingToken(userId, epoch), {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    path: "/admin",
    maxAge: PENDING_MINUTES * 60,
  });
}

export async function clearPendingCookie() {
  (await cookies()).delete({ name: PENDING_2FA_COOKIE, path: "/admin" });
}

export async function setSessionCookie(userId: number, epoch: number) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(userId, epoch), {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_IDLE_MS / 1000,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  twoFactor: boolean;
}

export async function currentAdmin(): Promise<AdminUser | null> {
  if (!isDbConfigured) return null;
  const session = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const [user] = await getDb()
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, epoch: adminUsers.sessionEpoch, role: adminUsers.role, totpEnabledAt: adminUsers.totpEnabledAt })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.uid))
    .limit(1);
  if (!user || user.epoch !== session.epoch) return null;
  return { id: user.id, email: user.email, name: user.name, role: isAdminRole(user.role) ? user.role : "operator", twoFactor: Boolean(user.totpEnabledAt) };
}

/** The admin URL this request is for, as the middleware saw it (it overwrites any client value). */
async function requestPath(): Promise<string | null> {
  try {
    return (await headers()).get(ADMIN_PATH_HEADER);
  } catch {
    return null;
  }
}

/**
 * Every admin page and every admin server action starts here.
 *
 * A page passes nothing: its permission is read from its path
 * (lib/admin/roles.ts). An action names its permission, because an action
 * can be posted to any admin URL. With no permission and no known path the
 * check falls back to the owner's — closed, not open.
 */
export async function requireAdmin(permission?: Permission): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  const path = await requestPath();
  const needed = permission ?? (path ? permissionForPath(path) : "users");
  if (!can(user.role, needed)) redirect("/admin?denied=1");
  // The owner can require two-factor sign-in for everyone; until then only the security page opens.
  if (!user.twoFactor && !path?.startsWith("/admin/security") && (await twoFactorRequired())) redirect("/admin/security?enrol=1");
  return user;
}

export async function twoFactorRequired(): Promise<boolean> {
  try {
    const { readPublicSettings } = await import("@/lib/integrations/site-settings");
    return (await readPublicSettings())["admin.require2fa"] === "on";
  } catch {
    return false;
  }
}
