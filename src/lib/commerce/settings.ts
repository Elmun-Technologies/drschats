import { COMMERCE } from "@/lib/config/commerce";
import type { Locale } from "@/lib/i18n/routing";

/*
  The commerce rules the team manages on /admin/commerce ("Savdo qoidalari").

  Pure and client-safe: types, defaults, parsing and validation. The server
  reads the stored value (lib/commerce/server.ts) and hands the result to
  client components through `CommerceProvider`; nothing here touches the
  database.

  Defaults are the code constants (lib/config/commerce.ts, the upsell ladder's
  10/15/20, the popup queue's 30/3/7 days…), so a site without a saved row —
  or with a broken one — behaves exactly as before the admin screen existed.
  Every number is clamped to a range on parse: a hand-edited row can never
  produce a negative fee or a 90% ladder step.
*/

export const COMMERCE_SETTINGS_KEY = "commerce.rules";

export type LocalizedText = { uz: string; ru: string };

export const POPUP_IDS = ["welcome", "exit", "quiz"] as const;
export type PopupId = (typeof POPUP_IDS)[number];

export interface PopupRule {
  enabled: boolean;
  /** Seconds before the popup may ask for the screen (welcome: on a page; exit: arming; quiz: after the Nth page). */
  delaySeconds: number;
  /** Days before a dismissed popup may return. */
  cooldownDays: number;
  /** Optional overrides; empty = the i18n default. */
  title: LocalizedText;
  body: LocalizedText;
}

export interface SectionMeta {
  by: string;
  at: string;
}

export interface CommerceSettings {
  delivery: {
    /** Free courier delivery from this basket total (after discounts). 0 — always free. */
    freeShippingOver: number;
    /** Flat courier fee below the threshold. */
    courierFee: number;
    /** The regions' delivery window ("1–3 kun"); empty = the i18n default. */
    regionsNote: LocalizedText;
    /** Same-day cut-off, Tashkent time, "HH:MM"; empty — no timer. */
    cutoff: string;
  };
  ladder: {
    enabled: boolean;
    /** Step 1, step 2, and step 3 when no product is cheap enough to be free. Strictly ascending. */
    percents: [number, number, number];
    /** Step 3 may be a free gift worth no more than steps 1–2 saved. */
    freeGift: boolean;
  };
  subscription: {
    firstPercent: number;
    recurringPercent: number;
  };
  cart: {
    /** Show "close the gap to free shipping" products when at most this much is missing. 0 — off. */
    gapWindow: number;
  };
  popups: Record<PopupId, PopupRule>;
}

export type CommerceSection = keyof CommerceSettings;
export const COMMERCE_SECTIONS: CommerceSection[] = ["delivery", "ladder", "subscription", "cart", "popups"];

/** What is stored: the settings plus who changed each section, when. */
export interface StoredCommerceSettings {
  settings: CommerceSettings;
  meta: Partial<Record<CommerceSection, SectionMeta>>;
}

/** The ladder percents the shop may offer. The server derives what it accepts from the saved choice. */
export const LADDER_PERCENT_CHOICES = [5, 10, 12, 15, 20, 25, 30] as const;

export const LIMITS = {
  freeShippingOver: { min: 0, max: 10_000_000 },
  courierFee: { min: 0, max: 500_000 },
  subscriptionPercent: { min: 0, max: 50 },
  gapWindow: { min: 0, max: 1_000_000 },
  delaySeconds: { min: 0, max: 600 },
  cooldownDays: { min: 0, max: 365 },
  text: 300,
} as const;

const EMPTY_TEXT: LocalizedText = { uz: "", ru: "" };

/** The cut-off from the deploy env (NEXT_PUBLIC_DELIVERY_CUTOFF) — the default until an admin saves one. */
export function envCutoff(): string {
  return normalizeCutoff(process.env.NEXT_PUBLIC_DELIVERY_CUTOFF ?? "") ?? "";
}

const popup = (delaySeconds: number, cooldownDays: number): PopupRule => ({
  enabled: true,
  delaySeconds,
  cooldownDays,
  title: EMPTY_TEXT,
  body: EMPTY_TEXT,
});

export function defaultCommerceSettings(): CommerceSettings {
  return {
    delivery: {
      freeShippingOver: COMMERCE.freeShippingOver,
      courierFee: COMMERCE.shippingFee,
      regionsNote: EMPTY_TEXT,
      cutoff: envCutoff(),
    },
    ladder: { enabled: true, percents: [10, 15, 20], freeGift: true },
    subscription: {
      firstPercent: COMMERCE.discounts.subscriptionFirstPercent,
      recurringPercent: COMMERCE.discounts.subscriptionRecurringPercent,
    },
    cart: { gapWindow: 150_000 },
    popups: { welcome: popup(20, 30), exit: popup(4, 3), quiz: popup(4, 7) },
  };
}

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettings = defaultCommerceSettings();

/** "9:5" → null, "09:30" → "09:30", "9:30" → "09:30", "" → "". Null when it is not a time. */
export function normalizeCutoff(raw: string): string | null {
  const text = raw.trim();
  if (text === "") return "";
  const m = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function int(v: unknown, fallback: number, { min, max }: { min: number; max: number }): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

function text(v: unknown, fallback: LocalizedText): LocalizedText {
  if (!isObj(v)) return fallback;
  const pick = (x: unknown) => (typeof x === "string" ? x.trim().slice(0, LIMITS.text) : "");
  return { uz: pick(v.uz), ru: pick(v.ru) };
}

/** Three ascending percents from the safe set, or the fallback. */
export function validLadderPercents(v: unknown): v is [number, number, number] {
  if (!Array.isArray(v) || v.length !== 3) return false;
  const allowed = LADDER_PERCENT_CHOICES as readonly number[];
  return v.every((p) => allowed.includes(p)) && v[0] < v[1] && v[1] < v[2];
}

function parsePopup(v: unknown, fallback: PopupRule): PopupRule {
  if (!isObj(v)) return fallback;
  return {
    enabled: bool(v.enabled, fallback.enabled),
    delaySeconds: int(v.delaySeconds, fallback.delaySeconds, LIMITS.delaySeconds),
    cooldownDays: int(v.cooldownDays, fallback.cooldownDays, LIMITS.cooldownDays),
    title: text(v.title, fallback.title),
    body: text(v.body, fallback.body),
  };
}

/** Any value → valid settings. Each field that is missing or out of range falls back to its default on its own. */
export function coerceCommerceSettings(raw: unknown, defaults: CommerceSettings = defaultCommerceSettings()): CommerceSettings {
  const v = isObj(raw) ? raw : {};
  const d = isObj(v.delivery) ? v.delivery : {};
  const l = isObj(v.ladder) ? v.ladder : {};
  const s = isObj(v.subscription) ? v.subscription : {};
  const c = isObj(v.cart) ? v.cart : {};
  const p = isObj(v.popups) ? v.popups : {};

  const cutoff = typeof d.cutoff === "string" ? normalizeCutoff(d.cutoff) : null;
  const first = int(s.firstPercent, defaults.subscription.firstPercent, LIMITS.subscriptionPercent);
  const recurring = int(s.recurringPercent, defaults.subscription.recurringPercent, LIMITS.subscriptionPercent);
  // A later delivery is never dearer than the first one: the recurring price is the point of subscribing.
  const subscription = recurring >= first ? { firstPercent: first, recurringPercent: recurring } : defaults.subscription;

  return {
    delivery: {
      freeShippingOver: int(d.freeShippingOver, defaults.delivery.freeShippingOver, LIMITS.freeShippingOver),
      courierFee: int(d.courierFee, defaults.delivery.courierFee, LIMITS.courierFee),
      regionsNote: text(d.regionsNote, defaults.delivery.regionsNote),
      cutoff: cutoff ?? defaults.delivery.cutoff,
    },
    ladder: {
      enabled: bool(l.enabled, defaults.ladder.enabled),
      percents: validLadderPercents(l.percents) ? [...l.percents] : defaults.ladder.percents,
      freeGift: bool(l.freeGift, defaults.ladder.freeGift),
    },
    subscription,
    cart: { gapWindow: int(c.gapWindow, defaults.cart.gapWindow, LIMITS.gapWindow) },
    popups: {
      welcome: parsePopup(p.welcome, defaults.popups.welcome),
      exit: parsePopup(p.exit, defaults.popups.exit),
      quiz: parsePopup(p.quiz, defaults.popups.quiz),
    },
  };
}

function parseMeta(raw: unknown): StoredCommerceSettings["meta"] {
  if (!isObj(raw)) return {};
  const meta: StoredCommerceSettings["meta"] = {};
  for (const section of COMMERCE_SECTIONS) {
    const m = raw[section];
    if (isObj(m) && typeof m.by === "string" && typeof m.at === "string") meta[section] = { by: m.by.slice(0, 120), at: m.at.slice(0, 40) };
  }
  return meta;
}

/** The site_settings value → settings + audit meta. Bad JSON or no row → defaults. */
export function parseStoredCommerceSettings(raw: string | null | undefined): StoredCommerceSettings {
  if (!raw) return { settings: defaultCommerceSettings(), meta: {} };
  try {
    const v = JSON.parse(raw) as unknown;
    if (!isObj(v)) return { settings: defaultCommerceSettings(), meta: {} };
    return { settings: coerceCommerceSettings(v.settings), meta: parseMeta(v.meta) };
  } catch {
    return { settings: defaultCommerceSettings(), meta: {} };
  }
}

export function parseCommerceSettings(raw: string | null | undefined): CommerceSettings {
  return parseStoredCommerceSettings(raw).settings;
}

/* ── Derived rules: the pure functions take these, never the whole settings object. ── */

export interface PricingRules {
  freeShippingOver: number;
  shippingFee: number;
  subscriptionFirstPercent: number;
  subscriptionRecurringPercent: number;
}

export function pricingRulesOf(s: CommerceSettings): PricingRules {
  return {
    freeShippingOver: s.delivery.freeShippingOver,
    shippingFee: s.delivery.courierFee,
    subscriptionFirstPercent: s.subscription.firstPercent,
    subscriptionRecurringPercent: s.subscription.recurringPercent,
  };
}

export const DEFAULT_PRICING: PricingRules = pricingRulesOf(DEFAULT_COMMERCE_SETTINGS);

export type LadderRules = CommerceSettings["ladder"];
export const DEFAULT_LADDER: LadderRules = DEFAULT_COMMERCE_SETTINGS.ladder;

/** The ladder percents the server accepts — derived from the same settings the cart builds the ladder from. */
export function ladderPercentsAccepted(ladder: LadderRules): Set<number> {
  if (!ladder.enabled) return new Set();
  const set = new Set<number>(ladder.percents);
  if (ladder.freeGift) set.add(100);
  return set;
}

/** An override when the admin wrote one, otherwise the i18n default. */
export function localizedOr(value: LocalizedText, locale: Locale | string, fallback: string): string {
  const own = locale === "ru" ? value.ru : value.uz;
  return own.trim() ? own : fallback;
}
