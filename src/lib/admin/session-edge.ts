/*
  The middleware half of the admin session's idle timeout (lib/admin/session.ts).

  Edge-safe: Web Crypto only, no node:crypto and no database. On a page load
  with a valid session cookie whose `seen` is older than REFRESH_AFTER_MS, the
  token is re-signed with `seen = now`, so the 12-hour idle window slides
  while the admin works. The same HMAC-SHA256 over the same payload as the
  server, so either side can read what the other wrote.

  Only signature, expiry and idle time are checked here; the user row and the
  session epoch are still checked on the server for every request.
*/

export const SESSION_IDLE_MS = 12 * 3_600_000;
const REFRESH_AFTER_MS = 5 * 60_000;
const SESSION_DAYS = 7;

function secret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") return null;
  return "dev-only-admin-session-secret-not-for-production";
}

function base64url(bytes: ArrayBuffer): string {
  let text = "";
  for (const byte of new Uint8Array(bytes)) text += String.fromCharCode(byte);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(payload: string): unknown {
  const padded = payload.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((payload.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function encode(body: unknown): string {
  return base64url(new TextEncoder().encode(JSON.stringify(body)).buffer as ArrayBuffer);
}

async function sign(payload: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(payload)));
}

/** A fresher token for this cookie, or null when it needs none (or is not a valid session). */
export async function refreshedSessionToken(token: string | undefined, now = Date.now()): Promise<string | null> {
  const key = secret();
  if (!token || !key) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  if ((await sign(payload, key)) !== mac) return null;
  let body: { uid?: unknown; ep?: unknown; exp?: unknown; k?: unknown; seen?: unknown };
  try {
    body = decode(payload) as typeof body;
  } catch {
    return null;
  }
  if (body.k !== undefined || typeof body.exp !== "number" || body.exp <= now) return null;
  const seen = typeof body.seen === "number" ? body.seen : body.exp - SESSION_DAYS * 864e5;
  if (now - seen > SESSION_IDLE_MS || now - seen < REFRESH_AFTER_MS) return null;
  const next = encode({ uid: body.uid, ep: body.ep ?? 0, exp: body.exp, seen: now });
  return `${next}.${await sign(next, key)}`;
}
