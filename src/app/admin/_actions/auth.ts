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
import { cookies } from "next/headers";
import { clearPendingCookie, clearSessionCookie, readPendingToken, requireAdmin, setPendingCookie, setSessionCookie } from "@/lib/admin/session";
import { ADMIN_TABLE_LOCK } from "@/lib/admin/accounts";
import { PENDING_2FA_COOKIE } from "@/lib/admin/cookie";
import { hashRecoveryCode, normalizeRecoveryCode, verifyTotp } from "@/lib/admin/totp";
import { openTotpSecret } from "@/lib/admin/totp-store";
import { auditLog } from "@/lib/admin/audit";

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

  // Two-factor sign-in: the password only opens the second step, for five minutes.
  if (user.totpEnabledAt && user.totpSecret) {
    await setPendingCookie(user.id, user.sessionEpoch);
    redirect("/admin/login/verify");
  }
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await setSessionCookie(user.id, user.sessionEpoch);
  await auditLog({ id: user.id, email: user.email }, "login");
  redirect("/admin");
}

const codeFailures = new Map<number, { count: number; resetAt: number }>();

/*
  The second step: a code from the authenticator app, or one of the recovery
  codes (each works once). Five wrong codes end the half-finished sign-in.
*/
export async function verifySecondFactor(_: AuthState, form: FormData): Promise<AuthState> {
  const pending = readPendingToken((await cookies()).get(PENDING_2FA_COOKIE)?.value);
  if (!pending) return { error: "Kirish muddati tugadi. Email va parolni qayta kiriting." };
  const ip = clientIp(await headers());
  if (!withinRateLimit("admin-2fa-ip", ip, { limit: 20, windowMs: LOGIN_RATE.windowMs })) return { error: TOO_MANY };
  const now = Date.now();
  const fails = codeFailures.get(pending.uid);
  if (fails && fails.resetAt > now && fails.count >= LOGIN_RATE.limit) {
    await clearPendingCookie();
    return { error: TOO_MANY };
  }

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, pending.uid)).limit(1);
  if (!user || user.sessionEpoch !== pending.epoch || !user.totpEnabledAt || !user.totpSecret) {
    await clearPendingCookie();
    return { error: "Kirish muddati tugadi. Email va parolni qayta kiriting." };
  }

  const code = String(form.get("code") ?? "").trim().slice(0, 40);
  let accepted = false;
  let via: "totp" | "recovery" = "totp";
  if (/^\d[\d\s]{5,7}$/.test(code)) {
    const secret = openTotpSecret(user.totpSecret, user.id);
    const step = secret ? verifyTotp(secret, code, { now, lastStep: user.totpLastStep }) : null;
    if (step !== null) {
      // Conditional: two requests with the same code cannot both pass.
      const updated = await db.execute(sql`
        update admin_users set totp_last_step = ${step}, last_login_at = now()
        where id = ${user.id} and (totp_last_step is null or totp_last_step < ${step}) returning id`);
      accepted = (updated as unknown as unknown[]).length > 0;
    }
  } else if (normalizeRecoveryCode(code)) {
    via = "recovery";
    const hash = hashRecoveryCode(code);
    const updated = await db.execute(sql`
      update admin_users set recovery_codes = array_remove(recovery_codes, ${hash}), last_login_at = now()
      where id = ${user.id} and ${hash} = any(recovery_codes) returning id`);
    accepted = (updated as unknown as unknown[]).length > 0;
  }

  if (!accepted) {
    const entry = codeFailures.get(user.id);
    if (!entry || entry.resetAt <= now) codeFailures.set(user.id, { count: 1, resetAt: now + LOGIN_RATE.windowMs });
    else entry.count += 1;
    return { error: "Kod notoʻgʻri yoki eskirgan." };
  }
  codeFailures.delete(user.id);
  await clearPendingCookie();
  await setSessionCookie(user.id, user.sessionEpoch);
  await auditLog({ id: user.id, email: user.email }, via === "recovery" ? "login.recovery_code" : "login", null, via === "recovery" ? { left: (user.recoveryCodes?.length ?? 1) - 1 } : null);
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  await clearPendingCookie();
  redirect("/admin/login");
}

/** Ends every session of the signed-in admin, on every device. */
export async function logoutEverywhere() {
  const admin = await requireAdmin("dashboard");
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
      .values({ email: parsed.data.email, name: parsed.data.name, passwordHash, role: "owner" })
      .returning({ id: adminUsers.id, epoch: adminUsers.sessionEpoch });
    return row;
  });
  if (!user) return { error: "Administrator allaqachon yaratilgan." };
  await setSessionCookie(user.id, user.epoch);
  redirect("/admin");
}
