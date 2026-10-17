import { CODE_ALPHABET } from "@/lib/promo/rules";

/*
  Referral codes — the rules, with no I/O.

  A customer with a delivered order gets a stable code, GV + 6 readable
  characters (no dash: promo codes are GV-XXXXXX, so the two never collide).
  A friend types it in the cart's promo field; it gives `friendPercent` off
  their FIRST order (a phone with no earlier order that was not cancelled),
  and the referrer is rewarded when that order is delivered.

  Anti-abuse, all checked here:
  - not your own code (same phone);
  - first order only, and one live referral per referred phone;
  - rewards per referrer per month are capped (the friend still gets the
    discount; the referral is recorded as "capped").
*/

export const REFERRAL_CODE_RE = /^GV[A-Z2-9]{6}$/;

export function isReferralCode(code: string | null | undefined): boolean {
  return Boolean(code && REFERRAL_CODE_RE.test(code) && [...code.slice(2)].every((c) => CODE_ALPHABET.includes(c)));
}

/** `randomInt(n)` → integer in [0, n); the server passes crypto.randomInt. */
export function generateReferralCode(randomInt: (n: number) => number): string {
  let body = "";
  for (let i = 0; i < 6; i++) body += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `GV${body}`;
}

export type ReferralRejection = "off" | "not_found" | "self" | "not_first" | "already_referred" | "needs_phone";

export interface ReferralContext {
  enabled: boolean;
  /** The code's owner (phone9), or null when no such code. */
  ownerPhone9: string | null;
  /** The ordering phone; checks that need it wait until it is known. */
  phone9: string | null;
  /** Non-cancelled orders already placed from `phone9`. */
  previousOrders: number;
  /** A live (not cancelled) referral already recorded for `phone9`. */
  alreadyReferred: boolean;
}

export type ReferralCheck = { ok: true } | { ok: false; reason: ReferralRejection };

export function evaluateReferral(ctx: ReferralContext): ReferralCheck {
  if (!ctx.enabled) return { ok: false, reason: "off" };
  if (!ctx.ownerPhone9) return { ok: false, reason: "not_found" };
  if (!ctx.phone9) return { ok: false, reason: "needs_phone" };
  if (ctx.phone9 === ctx.ownerPhone9) return { ok: false, reason: "self" };
  if (ctx.previousOrders > 0) return { ok: false, reason: "not_first" };
  if (ctx.alreadyReferred) return { ok: false, reason: "already_referred" };
  return { ok: true };
}

/** Whether another reward fits under the monthly cap. */
export function rewardAllowed(rewardedThisMonth: number, monthlyCap: number): boolean {
  return rewardedThisMonth < monthlyCap;
}

/** First instant of the calendar month in Tashkent (UTC+5) that contains `now`. */
export function tashkentMonthStart(now: Date): Date {
  const local = new Date(now.getTime() + 5 * 3_600_000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - 5 * 3_600_000);
}

/** The share link a customer sends: `?ref=` pre-fills the cart's promo field. */
export function referralLink(siteUrl: string, locale: "uz" | "ru", code: string): string {
  return `${siteUrl.replace(/\/$/, "")}/${locale}?ref=${encodeURIComponent(code)}`;
}
