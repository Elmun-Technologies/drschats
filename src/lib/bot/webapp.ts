import { createHmac, timingSafeEqual } from "node:crypto";

/*
  Telegram Mini App sign-in. Telegram opens the shop with `initData` — the
  user's id and name, signed with a key derived from the bot token. Checking
  the signature on the server is what makes the id trustworthy; anything the
  browser says about itself otherwise is not.
  https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
*/

export interface WebAppUser {
  id: number;
  firstName?: string;
  username?: string;
  languageCode?: string;
}

/** Signed data older than this is refused — a leaked string stops working. */
export const INIT_DATA_MAX_AGE_S = 24 * 60 * 60;

export function verifyInitData(
  raw: string | undefined,
  botToken = process.env.TELEGRAM_CLUB_BOT_TOKEN,
  now = Date.now(),
): WebAppUser | null {
  if (!raw || !botToken || raw.length > 4096) return null;
  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  if (!hash || !/^[0-9a-f]{64}$/.test(hash)) return null;
  params.delete("hash");

  const checkString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(checkString).digest();
  if (!timingSafeEqual(expected, Buffer.from(hash, "hex"))) return null;

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || now / 1000 - authDate > INIT_DATA_MAX_AGE_S) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "null");
    if (!user || !Number.isSafeInteger(user.id) || user.id <= 0) return null;
    return { id: user.id, firstName: user.first_name, username: user.username, languageCode: user.language_code };
  } catch {
    return null;
  }
}
