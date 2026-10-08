"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/admin/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/admin/session";

export type AuthState = { error?: string } | undefined;

const LOGIN_RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

/* Same answer for an unknown email and a wrong password: no account enumeration. */
const BAD_LOGIN = "Email yoki parol notoʻgʻri.";

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = clientIp(await headers());
  if (!withinRateLimit("admin-login-ip", ip, LOGIN_RATE) || !withinRateLimit("admin-login-email", email, LOGIN_RATE)) {
    return { error: "Urinishlar juda koʻp. 10 daqiqadan keyin qayta urining." };
  }
  if (!email || !password) return { error: BAD_LOGIN };

  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  // Hash even when the user is missing so both paths take the same time.
  const ok = user ? await verifyPassword(password, user.passwordHash) : (await hashPassword(password), false);
  if (!user || !ok) return { error: BAD_LOGIN };

  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await setSessionCookie(user.id);
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function adminCount(): Promise<number> {
  const [row] = await getDb().select({ n: count() }).from(adminUsers);
  return row?.n ?? 0;
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
  if ((await adminCount()) > 0) return { error: "Administrator allaqachon yaratilgan." };

  const [user] = await getDb()
    .insert(adminUsers)
    .values({ email: parsed.data.email, name: parsed.data.name, passwordHash: await hashPassword(parsed.data.password) })
    .returning({ id: adminUsers.id });
  await setSessionCookie(user.id);
  redirect("/admin");
}
