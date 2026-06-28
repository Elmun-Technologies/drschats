import type { Product } from "@/lib/shopflow/types";
import type { CartLine } from "@/lib/cart/pricing";

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
  reason: string;
}

const REASONS = [
  "Ajoyib kombinatsiya",
  "Ko'p tanlanadigan juft",
  "Salomatlik uchun ideal",
  "Ularni birga oling",
  "Premium tanlov",
];

function pickReason(i: number): string {
  return REASONS[i % REASONS.length];
}

/**
 * Build a 3-step upsell ladder calibrated to the current cart.
 *
 * Step 1 — 10% off, price ∈ [30%–90% of cart subtotal]
 * Step 2 — 15% off, different category from step 1
 * Step 3 — FREE if price ≤ saved₁+saved₂, otherwise 20% off cheapest product
 *
 * Returns [] if fewer than 2 eligible products are available.
 */
export function buildUpsellLadder(
  cartLines: CartLine[],
  allProducts: Product[],
): UpsellStep[] {
  if (cartLines.length === 0) return [];

  const cartSubtotal = cartLines.reduce((s, l) => s + l.price * l.quantity, 0);
  const cartIds = new Set(cartLines.map((l) => l.productId));
  const eligible = allProducts.filter((p) => !cartIds.has(p.id) && p.inStock);

  if (eligible.length < 2) return [];

  const steps: UpsellStep[] = [];
  let cumulativeSavings = 0;
  const usedIds = new Set<string>();

  // ── Step 1: 10% off, price in [cartTotal×0.3, cartTotal×0.9] ──
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

  const step1Discount = 10;
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
    reason: pickReason(0),
  });

  // ── Step 2: 15% off, different category ──
  const step2Pool = eligible
    .filter(
      (p) => !usedIds.has(p.id) && p.categorySlug !== step1Product.categorySlug,
    )
    .sort((a, b) => b.rating - a.rating);

  const step2Product =
    step2Pool[0] ??
    eligible.filter((p) => !usedIds.has(p.id)).sort((a, b) => b.rating - a.rating)[0];

  if (!step2Product) return steps;

  const step2Discount = 15;
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
    reason: pickReason(1),
  });

  // ── Step 3: FREE gift if price ≤ cumulativeSavings, else 20% off cheapest ──
  const remaining = eligible.filter((p) => !usedIds.has(p.id));
  if (remaining.length === 0) return steps;

  const freeCandidate = remaining
    .filter((p) => p.price <= cumulativeSavings)
    .sort((a, b) => b.price - a.price)[0]; // pick the most expensive that's still "free"

  if (freeCandidate) {
    steps.push({
      product: freeCandidate,
      discountPercent: 100,
      discountedPrice: 0,
      savedAmount: freeCandidate.price,
      cumulativeSavings: cumulativeSavings + freeCandidate.price,
      stepType: "free_gift",
      reason: pickReason(2),
    });
  } else {
    // No product is truly free — pick cheapest with 20% off, frame as "nearly free"
    const cheapest = remaining.sort((a, b) => a.price - b.price)[0];
    const step3Discount = 20;
    const step3Price = Math.round(cheapest.price * (1 - step3Discount / 100));
    const step3Saved = cheapest.price - step3Price;
    steps.push({
      product: cheapest,
      discountPercent: step3Discount,
      discountedPrice: step3Price,
      savedAmount: step3Saved,
      cumulativeSavings: cumulativeSavings + step3Saved,
      stepType: "standard",
      reason: pickReason(2),
    });
  }

  return steps;
}
