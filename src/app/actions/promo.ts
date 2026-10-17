"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { ORDERS_IN_DB, shopflow } from "@/lib/shopflow";
import { clientIp, rateLimitSpent, withinRateLimit } from "@/lib/rate-limit";
import { quoteDiscounts, type FirstOrderState } from "@/lib/promo/server";
import type { PromoLine, PromoReason } from "@/lib/promo/rules";
import type { OrderAdjustment } from "@/lib/shopflow/types";
import { isIntervalDays } from "@/lib/subscription/plans";

/*
  The cart's live discount preview: the entered promo code and the automatic
  first-order discount, priced from the catalogue (never the browser's prices).
  Advisory only — the order action validates and redeems the code again,
  atomically, when the order is placed.

  Two budgets. Every check counts against the looser one. Guessing codes
  shows up as codes that do not exist, so only those misses count against
  the tighter one — a code the customer already applied is asked again on
  every cart edit and every phone keystroke, and counting those used to
  spend the budget in a few minutes of normal use: the code then silently
  stopped applying while the cart still showed it.
*/
const MISS_RATE = { limit: 15, windowMs: 10 * 60 * 1000 };
const CHECK_RATE = { limit: 60, windowMs: 10 * 60 * 1000 };
const GUESS_REASONS = new Set<PromoReason>(["not_found", "invalid_format"]);

const inputSchema = z.object({
  code: z.string().trim().max(40).optional(),
  phone: z.string().trim().max(20).optional(),
  locale: z.enum(["ru", "uz"]),
  items: z
    .array(
      z.object({
        slug: z.string().max(160),
        quantity: z.number().int().positive().max(99),
        upsellDiscountPercent: z.number().int().min(1).max(100).optional(),
        subscription: z.object({ intervalDays: z.number().int().refine(isIntervalDays) }).optional(),
      }),
    )
    .min(1)
    .max(50),
});

export type CartPromoInput = z.input<typeof inputSchema>;

export type CartPromoQuote =
  | {
      ok: true;
      promo: null | { ok: true; code: string; amount: number } | { ok: false; code?: string; reason: PromoReason; remaining?: number; minSubtotal?: number };
      firstOrder: { state: FirstOrderState; percent: number; amount: number };
      applied: OrderAdjustment | null;
    }
  | { ok: false; error: "unavailable" | "rate_limited" | "invalid" };

export async function checkCartPromo(input: CartPromoInput): Promise<CartPromoQuote> {
  if (!ORDERS_IN_DB) return { ok: false, error: "unavailable" };
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { code, phone, locale, items } = parsed.data;

  const ip = clientIp(await headers());
  if (!withinRateLimit("promo-check", ip, CHECK_RATE) || (code && rateLimitSpent("promo-miss", ip, MISS_RATE))) {
    return { ok: false, error: "rate_limited" };
  }

  try {
    const slugs = [...new Set(items.map((i) => i.slug))];
    const [products, promotions] = await Promise.all([
      Promise.all(slugs.map((slug) => shopflow.getProduct(slug, locale))),
      shopflow.getPromotions(locale).catch(() => []),
    ]);
    const price = new Map(products.filter((p) => p !== null).map((p) => [p!.slug, p!.price]));
    const lines: PromoLine[] = items
      .filter((i) => price.has(i.slug))
      .map((i) => ({ slug: i.slug, price: price.get(i.slug)!, quantity: i.quantity, upsellDiscountPercent: i.upsellDiscountPercent, subscription: i.subscription }));

    const quote = await quoteDiscounts({ lines, promotions, code: code || null, phone: phone || null });
    if (quote.promo && !quote.promo.ok && GUESS_REASONS.has(quote.promo.reason)) withinRateLimit("promo-miss", ip, MISS_RATE);
    const promo = !quote.promo
      ? null
      : quote.promo.ok
        ? { ok: true as const, code: quote.promo.code, amount: quote.promo.discount }
        : {
            ok: false as const,
            code: quote.promo.code,
            reason: quote.promo.reason,
            ...(quote.promo.reason === "min_subtotal" ? { remaining: quote.promo.remaining, minSubtotal: quote.promo.minSubtotal } : {}),
          };
    return { ok: true, promo, firstOrder: quote.firstOrder, applied: quote.applied };
  } catch (err) {
    console.error("[promo] check failed:", (err as Error).message);
    return { ok: false, error: "invalid" };
  }
}
