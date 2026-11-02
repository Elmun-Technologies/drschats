"use server";

import { headers } from "next/headers";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { isDbConfigured } from "@/lib/db/client";
import { reviewInputSchema, type ReviewInput } from "@/lib/reviews/rules";
import { insertReview, pendingFrom } from "@/lib/reviews/server";
import { shopflow } from "@/lib/shopflow";
import { notifyOperator } from "@/lib/notifications/operator";

/*
  A review from the product page. It is stored as pending and appears on the
  site only after an admin approves it (/admin/reviews), so the limit here
  is about spam reaching the moderation queue, not about what is published.
*/
const RATE = { limit: 5, windowMs: 60 * 60 * 1000 };

export type ReviewResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" | "unavailable" | "duplicate" };

export async function submitReview(input: ReviewInput): Promise<ReviewResult> {
  if (!isDbConfigured) return { ok: false, error: "unavailable" };
  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  if (!withinRateLimit("review", clientIp(await headers()), RATE)) return { ok: false, error: "rate_limited" };
  const review = parsed.data;
  try {
    const product = await shopflow.getProduct(review.slug, review.locale);
    if (!product) return { ok: false, error: "invalid" };
    if ((await pendingFrom(review.slug, review.phone)) > 0) return { ok: false, error: "duplicate" };
    await insertReview(review);
    // A heads-up for the team; the queue itself is /admin/reviews. No phone in the message.
    await notifyOperator(`⭐ Yangi sharh (${review.rating}/5) — ${product.name}\nTasdiqlash: /admin/reviews`).catch(() => false);
    return { ok: true };
  } catch (err) {
    console.error("[reviews] submit failed:", (err as Error).message);
    return { ok: false, error: "unavailable" };
  }
}
