import { z } from "zod";

/*
  Loyalty rules — cashback points, the referral programme, birthday
  greetings — as one JSON value in site_settings (`loyalty.rules`, managed on
  /admin/loyalty). Pure: the cart (client), the order transaction and the
  admin form read the same parse.

  Everything is off by default. A stored value that does not parse falls back
  field by field, never to "on".
*/

export const LOYALTY_RULES_KEY = "loyalty.rules";

export interface ReferralRules {
  enabled: boolean;
  /** The friend's discount on their first order, % of the discountable basket. */
  friendPercent: number;
  /** What the referrer gets when the friend's order is delivered. Points only while cashback is on. */
  reward: "points" | "promo";
  rewardPoints: number;
  rewardPercent: number;
  /** Rewards per referrer per calendar month (Tashkent). */
  monthlyCap: number;
}

export interface BirthdayRules {
  /** The opt-in on /profile and in the cart. Sending is the flow's switch in /admin/flows. */
  enabled: boolean;
  /** How many days before the birthday the flow starts. */
  daysBefore: number;
}

export interface LoyaltyRules {
  enabled: boolean;
  earnPercent: number;
  /** Paid goods (after discounts and points, without shipping) needed to earn. */
  minOrder: number;
  /** The share of an order (goods after discounts) points may pay. */
  maxSharePercent: number;
  /** 0 — points never expire. */
  expiryDays: number;
  referral: ReferralRules;
  birthday: BirthdayRules;
}

export const DEFAULT_LOYALTY_RULES: LoyaltyRules = {
  enabled: false,
  earnPercent: 3,
  minOrder: 0,
  maxSharePercent: 30,
  expiryDays: 180,
  referral: { enabled: false, friendPercent: 10, reward: "points", rewardPoints: 20_000, rewardPercent: 10, monthlyCap: 10 },
  birthday: { enabled: false, daysBefore: 3 },
};

const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

function field<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export const RULE_LIMITS = {
  earnPercent: [1, 20],
  minOrder: [0, 10_000_000],
  maxSharePercent: [1, 100],
  expiryDays: [0, 1095],
  friendPercent: [1, 50],
  rewardPoints: [1_000, 1_000_000],
  rewardPercent: [1, 50],
  monthlyCap: [1, 100],
  daysBefore: [0, 30],
} as const;

/** Any stored value → complete rules; each field falls back to its default on its own. */
export function coerceLoyaltyRules(raw: unknown): LoyaltyRules {
  const v = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const r = (v.referral && typeof v.referral === "object" ? v.referral : {}) as Record<string, unknown>;
  const b = (v.birthday && typeof v.birthday === "object" ? v.birthday : {}) as Record<string, unknown>;
  const d = DEFAULT_LOYALTY_RULES;
  const L = RULE_LIMITS;
  return {
    enabled: v.enabled === true,
    earnPercent: field(int(...L.earnPercent), v.earnPercent, d.earnPercent),
    minOrder: field(int(...L.minOrder), v.minOrder, d.minOrder),
    maxSharePercent: field(int(...L.maxSharePercent), v.maxSharePercent, d.maxSharePercent),
    expiryDays: field(int(...L.expiryDays), v.expiryDays, d.expiryDays),
    referral: {
      enabled: r.enabled === true,
      friendPercent: field(int(...L.friendPercent), r.friendPercent, d.referral.friendPercent),
      reward: r.reward === "promo" ? "promo" : "points",
      rewardPoints: field(int(...L.rewardPoints), r.rewardPoints, d.referral.rewardPoints),
      rewardPercent: field(int(...L.rewardPercent), r.rewardPercent, d.referral.rewardPercent),
      monthlyCap: field(int(...L.monthlyCap), r.monthlyCap, d.referral.monthlyCap),
    },
    birthday: {
      enabled: b.enabled === true,
      daysBefore: field(int(...L.daysBefore), b.daysBefore, d.birthday.daysBefore),
    },
  };
}

export function parseLoyaltyRules(raw: string | null | undefined): LoyaltyRules {
  if (!raw) return DEFAULT_LOYALTY_RULES;
  try {
    return coerceLoyaltyRules(JSON.parse(raw));
  } catch {
    return DEFAULT_LOYALTY_RULES;
  }
}

/** The referrer's reward in force: points need cashback switched on, otherwise a personal code. */
export function referralRewardKind(rules: LoyaltyRules): "points" | "promo" {
  return rules.enabled && rules.referral.reward === "points" ? "points" : "promo";
}

/** What an order pays for goods: the total without shipping (after every discount and the points). */
export function paidGoods(totals: { total: number; shipping: number }): number {
  return Math.max(0, totals.total - totals.shipping);
}

/** Points an order earns at delivery under these rules (0 below the minimum or when off). */
export function earnFor(totals: { total: number; shipping: number }, rules: Pick<LoyaltyRules, "enabled" | "earnPercent" | "minOrder">): number {
  if (!rules.enabled) return 0;
  const base = paidGoods(totals);
  if (base <= 0 || base < rules.minOrder) return 0;
  return Math.floor((base * rules.earnPercent) / 100);
}

/**
 * The most points this order may take: the balance, the share cap of the
 * goods after every discount (shipping is never paid with points), and the
 * cap the redemption token was issued for. Whole soʻm, never negative.
 */
export function maxRedeemable({
  balance,
  goods,
  maxSharePercent,
  cap = Number.POSITIVE_INFINITY,
}: {
  balance: number;
  goods: number;
  maxSharePercent: number;
  cap?: number;
}): number {
  if (balance <= 0 || goods <= 0) return 0;
  const share = Math.floor((goods * Math.min(100, Math.max(0, maxSharePercent))) / 100);
  return Math.max(0, Math.floor(Math.min(balance, share, cap)));
}

/** End of a new lot: `expiryDays` from `now`, or none. */
export function lotExpiry(now: Date, expiryDays: number): Date | null {
  return expiryDays > 0 ? new Date(now.getTime() + expiryDays * 86_400_000) : null;
}

/** What the storefront may know about the programme (passed to client components). */
export interface PublicLoyalty {
  enabled: boolean;
  earnPercent: number;
  minOrder: number;
  maxSharePercent: number;
  /** SMS is configured, so points can be spent (a code proves the phone). */
  redeemable: boolean;
  referral: { enabled: boolean; friendPercent: number };
  birthday: { enabled: boolean };
}

export const LOYALTY_OFF: PublicLoyalty = {
  enabled: false,
  earnPercent: 0,
  minOrder: 0,
  maxSharePercent: 0,
  redeemable: false,
  referral: { enabled: false, friendPercent: 0 },
  birthday: { enabled: false },
};
