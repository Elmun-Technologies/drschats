import type { OrderAdjustment, Promotion } from "@/lib/shopflow/types";
import { computeTotals, promotionApplies, type CartLine } from "@/lib/cart/pricing";

/*
  Promo codes and the first-order discount — the rules, with no I/O.

  The same functions price the cart preview (via a server action) and the
  order inside the redemption transaction (lib/promo/server.ts), so what the
  cart shows is what the order gets, unless the code changed in between.

  Stacking, in one place:
  - A promo code counts only lines without an offer of their own (upsell,
    programme, gift) and without a subscription — the principle behind
    `promotionApplies`. Site promotions (percent off, 2+1) on a line are
    taken off first: the code discounts what the line still costs.
  - One code per order.
  - The first-order discount and a code do not stack: the larger applies. On a
    tie the first-order discount wins, so a personal code is not spent for
    nothing and stays for the next order.
  - Order-level discounts never take free shipping away: the threshold is
    measured before them (lib/cart/pricing.ts computes shipping).
*/

export type PromoKind = "percent" | "fixed";

export interface PromoDefinition {
  code: string;
  kind: PromoKind;
  value: number;
  minSubtotal: number | null;
  maxUses: number | null;
  uses: number;
  perPhoneLimit: number;
  /** A personal code: only this phone (last 9 digits) may redeem it. */
  phone9: string | null;
  productSlugs: string[] | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
}

export type PromoLine = Pick<CartLine, "slug" | "price" | "quantity" | "upsellDiscountPercent" | "subscription">;

export type PromoRejection =
  | { reason: "invalid_format" | "not_found" | "inactive" | "not_started" | "expired" | "exhausted" | "already_used" | "wrong_phone" | "not_applicable" }
  | { reason: "min_subtotal"; minSubtotal: number; remaining: number };

export type PromoReason = PromoRejection["reason"];

export type PromoCheck =
  | { ok: true; code: string; discount: number; eligibleSubtotal: number }
  | ({ ok: false } & PromoRejection);

const CODE_RE = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

/** What a customer typed, as stored: upper case, no spaces, any dash a hyphen. Null if it cannot be a code. */
export function normalizePromoCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw
    .normalize("NFKC")
    .replace(/[‐-―−]/g, "-")
    .replace(/\s+/g, "")
    .toUpperCase();
  return CODE_RE.test(code) ? code : null;
}

/** The last nine digits of a phone number — how the shop matches one customer across formats. */
export function phone9Of(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "").slice(-9);
  return digits.length === 9 ? digits : null;
}

/** A line the order-level discounts may count: no offer of its own, no subscription. */
export function discountableLine(l: PromoLine): boolean {
  return !l.upsellDiscountPercent && !l.subscription;
}

/** What a line still costs after the site promotions that apply to it (percent off, 2+1). */
export function lineAfterPromotions(l: PromoLine, promotions: Promotion[]): number {
  const gross = l.price * l.quantity;
  let off = 0;
  for (const promo of promotions) {
    if (!promotionApplies(promo, l)) continue;
    if (promo.type === "percent_off" && promo.percent) off += Math.round((gross * promo.percent) / 100);
    if (promo.type === "buy_x_get_y") off += Math.floor(l.quantity / 3) * l.price;
  }
  return Math.max(0, gross - off);
}

/** The base an order-level discount is a share of: discountable lines (in scope), after promotions. */
export function eligibleSubtotal(lines: PromoLine[], promotions: Promotion[], productSlugs: string[] | null = null): number {
  return lines
    .filter((l) => discountableLine(l) && (!productSlugs || productSlugs.length === 0 || productSlugs.includes(l.slug)))
    .reduce((sum, l) => sum + lineAfterPromotions(l, promotions), 0);
}

/** The basket after every line offer and promotion, before shipping — what `min_subtotal` is measured against. */
export function subtotalAfterOffers(lines: PromoLine[], promotions: Promotion[]): number {
  const t = computeTotals(
    lines.map((l, i) => ({ ...l, lineId: String(i), productId: String(i), name: "", image: "" })),
    promotions,
    { pickup: true },
  );
  return Math.max(0, t.subtotal - t.discount);
}

export interface PromoContext {
  lines: PromoLine[];
  promotions: Promotion[];
  /** The ordering phone's last nine digits; checks that need it are skipped until it is known. */
  phone9?: string | null;
  /** Redemptions of this code by `phone9` so far. */
  phoneUses?: number;
  now?: Date;
}

/** Validate a code against a cart and price it. `def` null means no such code. */
export function evaluatePromo(def: PromoDefinition | null, ctx: PromoContext): PromoCheck {
  if (!def) return { ok: false, reason: "not_found" };
  const now = (ctx.now ?? new Date()).getTime();
  if (!def.active) return { ok: false, reason: "inactive" };
  if (def.startsAt && def.startsAt.getTime() > now) return { ok: false, reason: "not_started" };
  if (def.endsAt && def.endsAt.getTime() <= now) return { ok: false, reason: "expired" };
  if (def.maxUses != null && def.uses >= def.maxUses) return { ok: false, reason: "exhausted" };
  if (ctx.phone9) {
    if (def.phone9 && def.phone9 !== ctx.phone9) return { ok: false, reason: "wrong_phone" };
    if ((ctx.phoneUses ?? 0) >= def.perPhoneLimit) return { ok: false, reason: "already_used" };
  }
  if (def.minSubtotal) {
    const basket = subtotalAfterOffers(ctx.lines, ctx.promotions);
    if (basket < def.minSubtotal) {
      return { ok: false, reason: "min_subtotal", minSubtotal: def.minSubtotal, remaining: def.minSubtotal - basket };
    }
  }
  const base = eligibleSubtotal(ctx.lines, ctx.promotions, def.productSlugs);
  const discount = promoDiscount(def, base);
  if (base <= 0 || discount <= 0) return { ok: false, reason: "not_applicable" };
  return { ok: true, code: def.code, discount, eligibleSubtotal: base };
}

/** Percent of the eligible base, or a fixed sum capped to it. */
export function promoDiscount(def: Pick<PromoDefinition, "kind" | "value">, base: number): number {
  if (base <= 0) return 0;
  if (def.kind === "percent") return Math.min(base, Math.round((base * Math.min(100, def.value)) / 100));
  return Math.min(base, def.value);
}

/** The first-order discount on this basket: `percent` of every discountable line, after promotions. */
export function firstOrderDiscount(lines: PromoLine[], promotions: Promotion[], percent: number): number {
  if (percent <= 0) return 0;
  return Math.round((eligibleSubtotal(lines, promotions) * Math.min(90, percent)) / 100);
}

export interface FirstOrderSetting {
  enabled: boolean;
  percent: number;
}

/**
 * The one order-level discount this order gets. `promo` is a validated code
 * (or null), `firstOrder` the first-order discount when the phone has no
 * earlier order (or null). The larger wins; a tie goes to the first order.
 */
export function chooseAdjustment(
  promo: { code: string; discount: number } | null,
  firstOrder: { percent: number; amount: number } | null,
): OrderAdjustment | null {
  const fo = firstOrder && firstOrder.amount > 0 ? firstOrder : null;
  const pc = promo && promo.discount > 0 ? promo : null;
  if (pc && (!fo || pc.discount > fo.amount)) return { kind: "promo", code: pc.code, amount: pc.discount };
  if (fo) return { kind: "first_order", percent: fo.percent, amount: fo.amount };
  return null;
}

/** Totals with an order-level discount folded in. Shipping is left as the cart computed it. */
export function applyAdjustment<T extends { subtotal: number; discount: number; shipping: number; total: number }>(
  totals: T,
  adjustment: OrderAdjustment | null,
): T & { adjustments?: OrderAdjustment[] } {
  if (!adjustment || adjustment.amount <= 0) return totals;
  const goods = Math.max(0, totals.total - totals.shipping);
  const amount = Math.min(adjustment.amount, goods);
  const applied = { ...adjustment, amount };
  return {
    ...totals,
    discount: totals.discount + amount,
    total: totals.total - amount,
    adjustments: [applied],
  };
}

/**
 * How the storefront may describe the first-order discount:
 * - `auto` — orders are in our database, the discount is applied at checkout;
 * - `operator` — no database: the operator applies it on confirmation;
 * - `off` — switched off in the admin panel; nothing is promised.
 */
export type FirstOrderOffer = { mode: "auto" | "operator" | "off"; percent: number };

/** Readable codes: no 0/O, 1/I/L — they are read out over the phone and typed from an SMS. */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** `GV-7K3P9Q`. `randomInt(n)` returns an integer in [0, n); the server passes a crypto source. */
export function generatePromoCode(randomInt: (n: number) => number, prefix = "GV", length = 6): string {
  let body = "";
  for (let i = 0; i < length; i++) body += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return prefix ? `${prefix}-${body}` : body;
}
