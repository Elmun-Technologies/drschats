import type { Product } from "@/lib/shopflow/types";
import type { CartLine } from "@/lib/cart/pricing";
import { DEFAULT_LADDER, type LadderRules } from "@/lib/commerce/settings";

export interface UpsellStep {
  product: Product;
  /** Actual discount percent shown to user (10, 15, 20…) */
  discountPercent: number;
  /** Price user pays */
  discountedPrice: number;
  /** Amount saved on this single step */
  savedAmount: number;
  /** Accumulated savings including all prior accepted steps */
  cumulativeSavings: number;
  /** 'free_gift' means price ≤ cumulative savings → frame as FREE */
  stepType: "standard" | "free_gift";
}

/**
 * Build a 3-step upsell ladder calibrated to the current cart.
 *
 * Step 1 — p₁ off (default 10%), price ∈ [30%–90% of cart subtotal]
 * Step 2 — p₂ off (15%), different category from step 1
 * Step 3 — FREE if allowed and price ≤ saved₁+saved₂, otherwise p₃ (20%) off the cheapest product
 *
 * The percents and the switches are the admin's commerce rules; the checkout
 * action accepts exactly the percents built here (`ladderPercentsAccepted`).
 * Returns [] if the ladder is switched off or fewer than 2 eligible products are available.
 */
export function buildUpsellLadder(
  cartLines: CartLine[],
  allProducts: Product[],
  rules: LadderRules = DEFAULT_LADDER,
): UpsellStep[] {
  if (!rules.enabled || cartLines.length === 0) return [];
  const [p1, p2, p3] = rules.percents;

  const cartSubtotal = cartLines.reduce((s, l) => s + l.price * l.quantity, 0);
  const cartIds = new Set(cartLines.map((l) => l.productId));
  const eligible = allProducts.filter((p) => !cartIds.has(p.id) && p.inStock);

  if (eligible.length < 2) return [];

  const steps: UpsellStep[] = [];
  let cumulativeSavings = 0;
  const usedIds = new Set<string>();

  // ── Step 1: p₁ off, price in [cartTotal×0.3, cartTotal×0.9] ──
  const step1Range = eligible.filter(
    (p) =>
      p.price >= cartSubtotal * 0.3 &&
      p.price <= cartSubtotal * 0.9,
  );
  // Fall back to anything if range is empty
  const step1Pool = step1Range.length > 0 ? step1Range : eligible;
  // Pick highest-rated to maximise conversion
  const step1Product = step1Pool.sort((a, b) => b.rating - a.rating)[0];

  if (!step1Product) return [];

  const step1Discount = p1;
  const step1Price = Math.round(step1Product.price * (1 - step1Discount / 100));
  const step1Saved = step1Product.price - step1Price;
  cumulativeSavings += step1Saved;
  usedIds.add(step1Product.id);

  steps.push({
    product: step1Product,
    discountPercent: step1Discount,
    discountedPrice: step1Price,
    savedAmount: step1Saved,
    cumulativeSavings,
    stepType: "standard",
  });

  // ── Step 2: p₂ off, different category ──
  const step2Pool = eligible
    .filter(
      (p) => !usedIds.has(p.id) && p.categorySlug !== step1Product.categorySlug,
    )
    .sort((a, b) => b.rating - a.rating);

  const step2Product =
    step2Pool[0] ??
    eligible.filter((p) => !usedIds.has(p.id)).sort((a, b) => b.rating - a.rating)[0];

  if (!step2Product) return steps;

  const step2Discount = p2;
  const step2Price = Math.round(step2Product.price * (1 - step2Discount / 100));
  const step2Saved = step2Product.price - step2Price;
  cumulativeSavings += step2Saved;
  usedIds.add(step2Product.id);

  steps.push({
    product: step2Product,
    discountPercent: step2Discount,
    discountedPrice: step2Price,
    savedAmount: step2Saved,
    cumulativeSavings,
    stepType: "standard",
  });

  // ── Step 3: FREE gift if price ≤ cumulativeSavings, else p₃ off cheapest ──
  const remaining = eligible.filter((p) => !usedIds.has(p.id));
  if (remaining.length === 0) return steps;

  const freeCandidate = rules.freeGift
    ? remaining.filter((p) => p.price <= cumulativeSavings).sort((a, b) => b.price - a.price)[0] // the dearest that is still "free"
    : undefined;

  if (freeCandidate) {
    steps.push({
      product: freeCandidate,
      discountPercent: 100,
      discountedPrice: 0,
      savedAmount: freeCandidate.price,
      cumulativeSavings: cumulativeSavings + freeCandidate.price,
      stepType: "free_gift",
    });
  } else {
    // No product is truly free (or gifts are off) — pick cheapest at p₃ off, frame as "nearly free"
    const cheapest = remaining.sort((a, b) => a.price - b.price)[0];
    const step3Discount = p3;
    const step3Price = Math.round(cheapest.price * (1 - step3Discount / 100));
    const step3Saved = cheapest.price - step3Price;
    steps.push({
      product: cheapest,
      discountPercent: step3Discount,
      discountedPrice: step3Price,
      savedAmount: step3Saved,
      cumulativeSavings: cumulativeSavings + step3Saved,
      stepType: "standard",
    });
  }

  return steps;
}
