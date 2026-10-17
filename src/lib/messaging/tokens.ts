import { createHmac, timingSafeEqual } from "node:crypto";

/*
  The two links every marketing message carries, both short enough for an SMS
  and both signed, so nobody can walk the ids.

  /r/<id36>-<sig>   click link. Records the click on outbound_messages and
                    redirects with UTM tags. The id is the message row.
  /s/<token>        opt-out. The token carries the phone, channel and locale
                    itself — no table lookup, so it keeps working forever
                    (the same idea as lib/email/token.ts, packed into 15
                    characters instead of a JSON payload).

  Stop token layout (11 bytes → 15 base64url chars):
    sig[6] = HMAC(key, "stop" ‖ plain)[0..6]
    plain[5] = phone9 as uint32 BE ‖ flags (bit0 telegram, bit1 ru)
    token = sig ‖ (plain XOR HMAC(key, "mask" ‖ sig)[0..5])
  The mask keeps the phone out of the URL in clear: the link is forwarded,
  screenshotted and logged by proxies more often than anyone expects.

  Key: MESSAGE_LINK_SECRET, else EMAIL_TOKEN_SECRET, else ADMIN_SESSION_SECRET
  (always set where the database is). Changing it breaks every link already
  sent — set MESSAGE_LINK_SECRET once and leave it.
*/

function secret(): string {
  const value = process.env.MESSAGE_LINK_SECRET || process.env.EMAIL_TOKEN_SECRET || process.env.ADMIN_SESSION_SECRET || "";
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("MESSAGE_LINK_SECRET (or ADMIN_SESSION_SECRET) must be set");
  return "dev-only-message-link-secret";
}

function hmac(label: string, data: Buffer | string): Buffer {
  return createHmac("sha256", secret()).update(`govita:message-link:v1:${label}:`).update(data).digest();
}

const b64 = (buf: Buffer) => buf.toString("base64url");

export function clickToken(messageId: number): string {
  const id = messageId.toString(36);
  return `${id}-${b64(hmac("click", id).subarray(0, 6))}`;
}

export function verifyClickToken(token: string): number | null {
  const match = /^([0-9a-z]{1,12})-([A-Za-z0-9_-]{8})$/.exec(token);
  if (!match) return null;
  const expected = Buffer.from(b64(hmac("click", match[1]).subarray(0, 6)));
  const given = Buffer.from(match[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const id = parseInt(match[1], 36);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export type StopChannel = "sms" | "telegram";
export interface StopPayload {
  phone9: string;
  channel: StopChannel;
  locale: "uz" | "ru";
}

export function stopToken({ phone9, channel, locale }: StopPayload): string {
  if (!/^\d{9}$/.test(phone9)) throw new Error("stopToken: phone9 must be 9 digits");
  const plain = Buffer.alloc(5);
  plain.writeUInt32BE(Number(phone9), 0);
  plain[4] = (channel === "telegram" ? 1 : 0) | (locale === "ru" ? 2 : 0);
  const sig = hmac("stop", plain).subarray(0, 6);
  const mask = hmac("mask", sig);
  const hidden = Buffer.from(plain.map((byte, i) => byte ^ mask[i]));
  return b64(Buffer.concat([sig, hidden]));
}

export function verifyStopToken(token: string | null | undefined): StopPayload | null {
  if (!token || !/^[A-Za-z0-9_-]{15}$/.test(token)) return null;
  const raw = Buffer.from(token, "base64url");
  if (raw.length !== 11) return null;
  const sig = raw.subarray(0, 6);
  const mask = hmac("mask", sig);
  const plain = Buffer.from(raw.subarray(6).map((byte, i) => byte ^ mask[i]));
  const expected = hmac("stop", plain).subarray(0, 6);
  if (!timingSafeEqual(expected, sig)) return null;
  const phone = plain.readUInt32BE(0);
  if (phone > 999_999_999 || plain[4] > 3) return null;
  return {
    phone9: String(phone).padStart(9, "0"),
    channel: plain[4] & 1 ? "telegram" : "sms",
    locale: plain[4] & 2 ? "ru" : "uz",
  };
}
