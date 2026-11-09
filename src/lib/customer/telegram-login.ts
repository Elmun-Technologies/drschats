import "server-only";

import { randomBytes } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { telegramLinks, telegramLogins } from "@/lib/db/schema";
import { loyaltySecret } from "@/lib/loyalty/otp";
import { verifyInitData } from "@/lib/bot/webapp";
import {
  LOGIN_TOKEN_RE,
  SESSION_TTL_MS,
  hashSecret,
  maskPhone,
  sessionSecret,
  signSession,
  type CustomerSession,
} from "./session";

/*
  «Telegram orqali kirish»: the site creates a pending request and opens the
  club bot with t.me/<bot>?start=login_<token>. The bot shows the customer
  who is asking (masked phone, browser) and two buttons; «Tasdiqlash» marks
  the request confirmed for that chat. The browser, polling with its own
  nonce cookie, then claims it once and gets a session cookie.

  The phone is the one the chat proved by sharing its own contact
  (telegram_links), never one typed on the site.
*/

export const LOGIN_TTL_MS = 10 * 60 * 1000;

type Locale = "uz" | "ru";

const token = () => randomBytes(24).toString("base64url");

export async function createLogin(input: { locale: Locale; device: string; now?: Date }) {
  const now = input.now ?? new Date();
  const t = token();
  const nonce = token();
  const [row] = await getDb()
    .insert(telegramLogins)
    .values({
      tokenHash: hashSecret(t),
      browserHash: hashSecret(nonce),
      locale: input.locale,
      device: input.device || null,
      expiresAt: new Date(now.getTime() + LOGIN_TTL_MS),
    })
    .returning({ id: telegramLogins.id });
  return { id: row.id, token: t, cookie: `${row.id}.${nonce}`, expiresAt: now.getTime() + LOGIN_TTL_MS };
}

async function pending(rawToken: string) {
  if (!LOGIN_TOKEN_RE.test(rawToken)) return null;
  const [row] = await getDb().select().from(telegramLogins).where(eq(telegramLogins.tokenHash, hashSecret(rawToken))).limit(1);
  return row ?? null;
}

export type OpenResult =
  | { state: "confirm"; phone: string; device: string; locale: Locale }
  | { state: "need_contact"; locale: Locale }
  | { state: "expired" | "done" | "not_found" };

/** What the bot shows when the customer arrives with login_<token>. */
export async function openLogin(rawToken: string, chatId: number, now = new Date()): Promise<OpenResult> {
  const row = await pending(rawToken);
  if (!row) return { state: "not_found" };
  if (row.status !== "pending") return { state: row.status === "denied" ? "expired" : "done" };
  if (row.expiresAt.getTime() <= now.getTime()) return { state: "expired" };
  const [link] = await getDb().select().from(telegramLinks).where(eq(telegramLinks.chatId, chatId)).limit(1);
  if (!link) return { state: "need_contact", locale: row.locale };
  return { state: "confirm", phone: maskPhone(link.phone), device: row.device ?? "", locale: row.locale };
}

export type ConfirmResult = { ok: true; locale: Locale } | { ok: false; error: "not_found" | "expired" | "need_contact" };

export async function confirmLogin(rawToken: string, chatId: number, now = new Date()): Promise<ConfirmResult> {
  const row = await pending(rawToken);
  if (!row) return { ok: false, error: "not_found" };
  const [link] = await getDb().select().from(telegramLinks).where(eq(telegramLinks.chatId, chatId)).limit(1);
  if (!link) return { ok: false, error: "need_contact" };
  const updated = await getDb()
    .update(telegramLogins)
    .set({ status: "confirmed", chatId, confirmedAt: now })
    .where(and(eq(telegramLogins.id, row.id), eq(telegramLogins.status, "pending"), gt(telegramLogins.expiresAt, now)))
    .returning({ id: telegramLogins.id });
  return updated.length ? { ok: true, locale: row.locale } : { ok: false, error: "expired" };
}

export async function denyLogin(rawToken: string, now = new Date()): Promise<boolean> {
  const row = await pending(rawToken);
  if (!row) return false;
  const updated = await getDb()
    .update(telegramLogins)
    .set({ status: "denied" })
    .where(and(eq(telegramLogins.id, row.id), eq(telegramLogins.status, "pending")))
    .returning({ id: telegramLogins.id });
  return updated.length > 0;
}

export type ClaimResult =
  | { status: "done"; session: CustomerSession; cookie: string }
  | { status: "pending" | "denied" | "expired" | "none" };

function parseBrowserCookie(raw: string | undefined): { id: number; nonce: string } | null {
  const m = /^(\d{1,15})\.([A-Za-z0-9_-]{24,48})$/.exec(raw ?? "");
  return m ? { id: Number(m[1]), nonce: m[2] } : null;
}

/** The browser's poll: once confirmed, the request is used up and a session is issued. */
export async function claimLogin(browserCookie: string | undefined, now = new Date()): Promise<ClaimResult> {
  const c = parseBrowserCookie(browserCookie);
  if (!c) return { status: "none" };
  const db = getDb();
  const [row] = await db
    .select()
    .from(telegramLogins)
    .where(and(eq(telegramLogins.id, c.id), eq(telegramLogins.browserHash, hashSecret(c.nonce))))
    .limit(1);
  if (!row) return { status: "none" };
  if (row.status === "denied") return { status: "denied" };
  if (row.status === "used") return { status: "none" };
  if (row.status === "pending") return { status: row.expiresAt.getTime() <= now.getTime() ? "expired" : "pending" };
  const [used] = await db
    .update(telegramLogins)
    .set({ status: "used", usedAt: now })
    .where(and(eq(telegramLogins.id, row.id), eq(telegramLogins.status, "confirmed"), sql`${telegramLogins.expiresAt} > ${now.toISOString()}::timestamptz`))
    .returning({ chatId: telegramLogins.chatId });
  if (!used?.chatId) return { status: "expired" };
  return issueFor(used.chatId, now);
}

async function issueFor(chatId: number, now: Date): Promise<ClaimResult> {
  const [link] = await getDb().select().from(telegramLinks).where(eq(telegramLinks.chatId, chatId)).limit(1);
  if (!link) return { status: "expired" };
  const session: CustomerSession = {
    c: chatId,
    p: link.phone.slice(-9),
    n: (link.name ?? "").split(/\s+/)[0]?.slice(0, 40) ?? "",
    e: now.getTime() + SESSION_TTL_MS,
  };
  return { status: "done", session, cookie: signSession(session, sessionSecret(loyaltySecret())) };
}

/** Inside the Mini App Telegram has already signed who the user is; a linked chat signs in at once. */
export async function claimMiniApp(initData: string | undefined, now = new Date()): Promise<ClaimResult | { status: "need_contact" }> {
  const user = verifyInitData(initData, undefined, now.getTime());
  if (!user) return { status: "none" };
  const result = await issueFor(user.id, now);
  return result.status === "done" ? result : { status: "need_contact" };
}
