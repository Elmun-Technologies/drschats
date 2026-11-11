"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { clientIp } from "@/lib/rate-limit";
import { hitRateLimit, rateLimitReached, resetRateLimit } from "@/lib/rate-limit-store";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/admin/password";
import { cookies } from "next/headers";
import { clearPendingCookie, clearSessionCookie, readPendingToken, readSessionToken, requireAdmin, setPendingCookie, setSessionCookie } from "@/lib/admin/session";
import { ADMIN_TABLE_LOCK } from "@/lib/admin/accounts";
import { PENDING_2FA_COOKIE, SESSION_COOKIE } from "@/lib/admin/cookie";
import { hashRecoveryCode, normalizeRecoveryCode, verifyTotp } from "@/lib/admin/totp";
import { openTotpSecret } from "@/lib/admin/totp-store";
import { auditLog } from "@/lib/admin/audit";
import { initAdminLocale, t } from "@/lib/admin/i18n/server";

export type AuthState = { error?: string } | undefined;

const LOGIN_RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

/* Same answer for an unknown email and a wrong password: no account enumeration. */
/* Sign-in runs before requireAdmin, so each action reads the language cookie itself (initAdminLocale). */
const badLogin = () => t("Email yoki parol notoʻgʻri.");
const tooMany = () => t("Urinishlar juda koʻp. 10 daqiqadan keyin qayta urining.");

/*
  Failed passwords, counted in Postgres (lib/rate-limit-store.ts), so a
  deploy or a second machine does not reset them. Only failures count.

  The lock is keyed on (IP, email): five wrong passwords from one address
  lock that address out of that account. Keyed on the email alone, anyone who
  knew an admin's email could keep them locked out from anywhere. Across
  addresses the account only slows down (EMAIL_SLOW) — a correct password
  still gets in.
*/
const FAIL_SCOPE = "admin-login-fail";
const EMAIL_SLOW = { limit: 20, windowMs: 60 * 60 * 1000 };
const SLOW_DOWN_MS = 2000;

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  await initAdminLocale();
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(form.get("password") ?? "").slice(0, 200);
  const ip = clientIp(await headers());
  if (!email || !password) return { error: badLogin() };
  const pair = `${ip}|${email}`;
  if (!(await hitRateLimit("admin-login-ip", ip, { limit: 20, windowMs: LOGIN_RATE.windowMs })) || (await rateLimitReached(FAIL_SCOPE, pair, LOGIN_RATE))) {
    return { error: tooMany() };
  }
  if (await rateLimitReached("admin-login-email", email, EMAIL_SLOW)) await new Promise((resolve) => setTimeout(resolve, SLOW_DOWN_MS));

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  // Hash even when the user is missing so both paths take the same time.
  const ok = user ? await verifyPassword(password, user.passwordHash) : (await hashPassword(password), false);
  if (!user || !ok) {
    await hitRateLimit(FAIL_SCOPE, pair, LOGIN_RATE);
    await hitRateLimit("admin-login-email", email, EMAIL_SLOW);
    return { error: badLogin() };
  }
  await resetRateLimit(FAIL_SCOPE, pair);

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

const CODE_FAIL_SCOPE = "admin-2fa-fail";

/*
  The second step: a code from the authenticator app, or one of the recovery
  codes (each works once). Five wrong codes end the half-finished sign-in.
*/
export async function verifySecondFactor(_: AuthState, form: FormData): Promise<AuthState> {
  await initAdminLocale();
  const pending = readPendingToken((await cookies()).get(PENDING_2FA_COOKIE)?.value);
  if (!pending) return { error: t("Kirish muddati tugadi. Email va parolni qayta kiriting.") };
  const ip = clientIp(await headers());
  if (!(await hitRateLimit("admin-2fa-ip", ip, { limit: 20, windowMs: LOGIN_RATE.windowMs }))) return { error: tooMany() };
  const now = Date.now();
  if (await rateLimitReached(CODE_FAIL_SCOPE, String(pending.uid), LOGIN_RATE)) {
    await clearPendingCookie();
    return { error: tooMany() };
  }

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, pending.uid)).limit(1);
  if (!user || user.sessionEpoch !== pending.epoch || !user.totpEnabledAt || !user.totpSecret) {
    await clearPendingCookie();
    return { error: t("Kirish muddati tugadi. Email va parolni qayta kiriting.") };
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
    await hitRateLimit(CODE_FAIL_SCOPE, String(user.id), LOGIN_RATE);
    return { error: t("Kod notoʻgʻri yoki eskirgan.") };
  }
  await resetRateLimit(CODE_FAIL_SCOPE, String(user.id));
  await clearPendingCookie();
  await setSessionCookie(user.id, user.sessionEpoch);
  await auditLog({ id: user.id, email: user.email }, via === "recovery" ? "login.recovery_code" : "login", null, via === "recovery" ? { left: (user.recoveryCodes?.length ?? 1) - 1 } : null);
  redirect("/admin");
}

/*
  Signing out ends the session on the server too: the epoch goes up, so a
  copy of this cookie (a shared computer, a stolen one) stops working at once
  instead of living out its lifetime. It also signs out this admin's other
  devices — the price of a stateless cookie.
*/
export async function logout() {
  const session = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (session) {
    await getDb()
      .update(adminUsers)
      .set({ sessionEpoch: sql`${adminUsers.sessionEpoch} + 1` })
      .where(and(eq(adminUsers.id, session.uid), eq(adminUsers.sessionEpoch, session.epoch)))
      .catch((err: Error) => console.error("[admin] logout: session epoch not bumped:", err.message));
  }
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
  await initAdminLocale();
  const ip = clientIp(await headers());
  if (!(await hitRateLimit("admin-setup", ip, LOGIN_RATE))) return { error: t("Urinishlar juda koʻp.") };
  const parsed = setupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: t("Maydonlarni tekshiring: parol kamida {n} belgi.", { n: MIN_PASSWORD_LENGTH }) };
  if (!tokenMatches(parsed.data.token)) return { error: t("Sozlash kaliti notoʻgʻri.") };

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
  if (!user) return { error: t("Administrator allaqachon yaratilgan.") };
  await setSessionCookie(user.id, user.epoch);
  redirect("/admin");
}
