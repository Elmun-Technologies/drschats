"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/admin/password";
import { clearSessionCookie, requireAdmin, setSessionCookie } from "@/lib/admin/session";
import { ADMIN_TABLE_LOCK } from "@/lib/admin/accounts";

export type AuthState = { error?: string } | undefined;

const LOGIN_RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

/* Same answer for an unknown email and a wrong password: no account enumeration. */
const BAD_LOGIN = "Email yoki parol notoʻgʻri.";
const TOO_MANY = "Urinishlar juda koʻp. 10 daqiqadan keyin qayta urining.";

/*
  Failed passwords per email. Only failures count: counting every attempt
  let anyone who knew an admin's email keep them locked out with five junk
  logins every ten minutes.
*/
const failures = new Map<string, { count: number; resetAt: number }>();

function emailLocked(email: string, now = Date.now()): boolean {
  const entry = failures.get(email);
  return Boolean(entry && entry.resetAt > now && entry.count >= LOGIN_RATE.limit);
}

function recordFailure(email: string, now = Date.now()) {
  const entry = failures.get(email);
  if (!entry || entry.resetAt <= now) failures.set(email, { count: 1, resetAt: now + LOGIN_RATE.windowMs });
  else entry.count += 1;
  if (failures.size > 5000) for (const [key, value] of failures) if (value.resetAt <= now) failures.delete(key);
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(form.get("password") ?? "").slice(0, 200);
  const ip = clientIp(await headers());
  if (!withinRateLimit("admin-login-ip", ip, { limit: 20, windowMs: LOGIN_RATE.windowMs }) || emailLocked(email)) {
    return { error: TOO_MANY };
  }
  if (!email || !password) return { error: BAD_LOGIN };

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  // Hash even when the user is missing so both paths take the same time.
  const ok = user ? await verifyPassword(password, user.passwordHash) : (await hashPassword(password), false);
  if (!user || !ok) {
    recordFailure(email);
    return { error: BAD_LOGIN };
  }
  failures.delete(email);

  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await setSessionCookie(user.id, user.sessionEpoch);
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/** Ends every session of the signed-in admin, on every device. */
export async function logoutEverywhere() {
  const admin = await requireAdmin();
  await getDb().update(adminUsers).set({ sessionEpoch: sql`${adminUsers.sessionEpoch} + 1` }).where(eq(adminUsers.id, admin.id));
  await clearSessionCookie();
  redirect("/admin/login");
}

const setupSchema = z.object({
  token: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(200),
});

function tokenMatches(given: string): boolean {
  const expected = process.env.ADMIN_SETUP_TOKEN?.trim();
  if (!expected || expected.length < 16) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/*
  First-run only: creates the first admin when the table is empty and the
  caller knows ADMIN_SETUP_TOKEN (set in the deploy's env). Once an admin
  exists the route and the action both refuse — further admins are added from
  inside the panel.
*/
export async function setupFirstAdmin(_: AuthState, form: FormData): Promise<AuthState> {
  const ip = clientIp(await headers());
  if (!withinRateLimit("admin-setup", ip, LOGIN_RATE)) return { error: "Urinishlar juda koʻp." };
  const parsed = setupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: `Maydonlarni tekshiring: parol kamida ${MIN_PASSWORD_LENGTH} belgi.` };
  if (!tokenMatches(parsed.data.token)) return { error: "Sozlash kaliti notoʻgʻri." };

  const passwordHash = await hashPassword(parsed.data.password);
  // Count and insert under one lock: two simultaneous setups must not both see "no admins".
  const user = await getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${ADMIN_TABLE_LOCK})`);
    const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(adminUsers);
    if (n > 0) return null;
    const [row] = await tx
      .insert(adminUsers)
      .values({ email: parsed.data.email, name: parsed.data.name, passwordHash })
      .returning({ id: adminUsers.id, epoch: adminUsers.sessionEpoch });
    return row;
  });
  if (!user) return { error: "Administrator allaqachon yaratilgan." };
  await setSessionCookie(user.id, user.epoch);
  redirect("/admin");
}
