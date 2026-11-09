"use server";

import { cookies, headers } from "next/headers";
import QRCode from "qrcode";
import { z } from "zod";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { clientIp } from "@/lib/rate-limit";
import { hitRateLimit } from "@/lib/rate-limit-store";
import { TELEGRAM_LOGIN_ON, botDeepLink } from "@/lib/config/telegram-login";
import { claimLogin, claimMiniApp, createLogin, LOGIN_TTL_MS, type ClaimResult } from "@/lib/customer/telegram-login";
import { CUSTOMER_COOKIE, LOGIN_COOKIE, describeDevice } from "@/lib/customer/session";
import { NAME_COOKIE, SESSION_COOKIE_OPTIONS, currentCustomer } from "@/lib/customer/current";

/*
  «Telegram orqali kirish» from the browser's side (lib/customer/telegram-login.ts).
  Start: a pending request, its nonce in an httpOnly cookie, the bot link back.
  Poll: every 2 s while the page waits; the confirmed request becomes a session.
*/

const START_RATE = { limit: 12, windowMs: 10 * 60_000 };
const POLL_RATE = { limit: 400, windowMs: 10 * 60_000 };

const enabled = () => TELEGRAM_LOGIN_ON && ORDERS_IN_DB;

export type StartLoginResult = { ok: true; url: string; qr: string | null; expiresAt: number } | { ok: false; error: "off" | "rate_limited" | "failed" };

export async function startTelegramLogin(input: { locale: "uz" | "ru" }): Promise<StartLoginResult> {
  if (!enabled()) return { ok: false, error: "off" };
  const h = await headers();
  if (!(await hitRateLimit("tg-login-start", clientIp(h), START_RATE))) return { ok: false, error: "rate_limited" };
  try {
    const login = await createLogin({ locale: input.locale === "ru" ? "ru" : "uz", device: describeDevice(h.get("user-agent")) });
    (await cookies()).set(LOGIN_COOKIE, login.cookie, { ...SESSION_COOKIE_OPTIONS, maxAge: Math.floor(LOGIN_TTL_MS / 1000) });
    const url = botDeepLink(`login_${login.token}`);
    // For a desktop visitor: scan with the phone where Telegram is.
    const qr = await QRCode.toDataURL(url, { margin: 1, width: 200, errorCorrectionLevel: "M" }).catch(() => null);
    return { ok: true, url, qr, expiresAt: login.expiresAt };
  } catch (err) {
    console.error("[tg-login] start failed:", (err as Error).message);
    return { ok: false, error: "failed" };
  }
}

export type PollLoginResult = { status: "done"; name: string } | { status: "pending" | "denied" | "expired" | "none" | "need_contact" | "rate_limited" };

async function finish(result: ClaimResult | { status: "need_contact" }): Promise<PollLoginResult> {
  if (result.status !== "done") return { status: result.status };
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, result.cookie, SESSION_COOKIE_OPTIONS);
  jar.set(NAME_COOKIE, encodeURIComponent(result.session.n || "✓"), { ...SESSION_COOKIE_OPTIONS, httpOnly: false });
  jar.delete(LOGIN_COOKIE);
  return { status: "done", name: result.session.n };
}

export async function pollTelegramLogin(): Promise<PollLoginResult> {
  if (!enabled()) return { status: "none" };
  if (!(await hitRateLimit("tg-login-poll", clientIp(await headers()), POLL_RATE))) return { status: "rate_limited" };
  try {
    return await finish(await claimLogin((await cookies()).get(LOGIN_COOKIE)?.value));
  } catch (err) {
    console.error("[tg-login] poll failed:", (err as Error).message);
    return { status: "pending" };
  }
}

const initDataSchema = z.string().min(10).max(4096);

/** Inside the Mini App: Telegram's signed launch data is the sign-in. */
export async function signInWithMiniApp(initData: string): Promise<PollLoginResult> {
  if (!enabled()) return { status: "none" };
  const parsed = initDataSchema.safeParse(initData);
  if (!parsed.success) return { status: "none" };
  if (!(await hitRateLimit("tg-login-start", clientIp(await headers()), START_RATE))) return { status: "rate_limited" };
  try {
    return await finish(await claimMiniApp(parsed.data));
  } catch (err) {
    console.error("[tg-login] mini app sign-in failed:", (err as Error).message);
    return { status: "none" };
  }
}

export async function signOutCustomer(): Promise<{ ok: true }> {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
  jar.delete(NAME_COOKIE);
  jar.delete(LOGIN_COOKIE);
  return { ok: true };
}

/** For the checkout form: the signed-in customer's name and phone, to prefill. */
export async function signedInContact(): Promise<{ name: string; phone: string } | null> {
  if (!enabled()) return null;
  try {
    const c = await currentCustomer();
    return c ? { name: c.name, phone: c.phone } : null;
  } catch {
    return null;
  }
}
