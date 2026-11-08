import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/*
  The website customer's session after signing in through the club bot
  (telegram-login.ts) or inside the Mini App. A signed cookie, not a table:
  it names the Telegram chat and the phone that chat proved by sharing its
  own contact. Every read that shows personal data checks the link is still
  the same (telegram_links), so an unlinked or re-linked chat loses access
  without a session store.
*/

export const CUSTOMER_COOKIE = "gv_customer";
/** The browser's half of a pending sign-in (id.nonce), httpOnly, 10 minutes. */
export const LOGIN_COOKIE = "gv_tgl";
export const SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1000;

export interface CustomerSession {
  /** Telegram chat (= user) id. */
  c: number;
  /** The linked phone's last nine digits. */
  p: string;
  /** First name, for the header. */
  n: string;
  /** Expiry, ms. */
  e: number;
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(`govita:customer-session:v1:${body}`).digest("base64url");
}

function equal(a: string, b: string): boolean {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function signSession(session: CustomerSession, secret: string): string {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function readSession(raw: string | null | undefined, secret: string, now = Date.now()): CustomerSession | null {
  if (!raw || raw.length > 600) return null;
  const [body, sig, extra] = raw.split(".");
  if (!body || !sig || extra !== undefined) return null;
  if (!equal(sign(body, secret), sig)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CustomerSession;
    if (!Number.isSafeInteger(s.c) || s.c <= 0) return null;
    if (typeof s.p !== "string" || !/^[0-9]{9}$/.test(s.p)) return null;
    if (typeof s.n !== "string" || s.n.length > 80) return null;
    if (!Number.isFinite(s.e) || s.e <= now) return null;
    return s;
  } catch {
    return null;
  }
}

/** The session key, kept apart from the loyalty token key by its own label. */
export function sessionSecret(loyaltyKey: string): string {
  return createHmac("sha256", loyaltyKey).update("govita:customer-session-key:v1").digest("base64url");
}

export function hashSecret(value: string): string {
  return createHash("sha256").update(`govita:tg-login:${value}`).digest("hex");
}

/** A deep-link payload Telegram accepts: [A-Za-z0-9_-], ≤ 64 with the prefix. */
export const LOGIN_TOKEN_RE = /^[A-Za-z0-9_-]{24,48}$/;

/** "+998 90 *** ** 12" — what the bot shows before the customer confirms. */
export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "").slice(-9);
  if (d.length !== 9) return "";
  return `+998 ${d.slice(0, 2)} *** ** ${d.slice(7)}`;
}

/** A short, harmless description of the browser asking to sign in. */
export function describeDevice(userAgent: string | null | undefined): string {
  const ua = userAgent ?? "";
  const os = /iPhone|iPad/.test(ua)
    ? "iPhone"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "Mac"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  const browser = /YaBrowser/.test(ua)
    ? "Yandex"
    : /Edg\//.test(ua)
      ? "Edge"
      : /OPR\/|Opera/.test(ua)
        ? "Opera"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "";
  return [browser, os].filter(Boolean).join(", ").slice(0, 60);
}
