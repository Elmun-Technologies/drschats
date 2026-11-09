import { accountAreaAvailable } from "./demo";

/*
  Website sign-in through the club bot. The bot's username is a build-time
  value (it is already needed for the Mini App framing rule), so the header,
  the footer and the tab bar can decide on the client whether the cabinet
  link exists — the same rule the /account route reads, so the link never
  leads to a 404.
*/

/** The club bot's username without "@", or "" when the bot is not configured. */
export const CLUB_BOT_USERNAME = (process.env.NEXT_PUBLIC_TELEGRAM_CLUB_BOT ?? "").trim().replace(/^@/, "");

export const TELEGRAM_LOGIN_ON = /^[A-Za-z0-9_]{5,32}$/.test(CLUB_BOT_USERNAME);

/** Whether /account has anything to show: the API cabinet, the demo, or the Telegram cabinet. */
export function cabinetAvailable(isApiConfigured: boolean): boolean {
  return accountAreaAvailable(isApiConfigured) || TELEGRAM_LOGIN_ON;
}

export function botDeepLink(payload?: string): string {
  return `https://t.me/${CLUB_BOT_USERNAME}${payload ? `?start=${payload}` : ""}`;
}

/** Fired on window when the Telegram session starts or ends without a reload. */
export const SESSION_EVENT = "govita:session";
