import { z } from "zod";
import { normalizeUzPhone } from "@/lib/phone";

/*
  A customer review as written on the product page. Pure: the form and the
  server action validate with the same schema. The phone is never shown — it
  lets the team call back about a review and marks a review «Xaridor» when it
  belongs to a delivered order of that product.
*/
export const reviewInputSchema = z.object({
  slug: z.string().trim().min(1).max(160),
  rating: z.coerce.number().int().min(1).max(5),
  author: z.string().trim().min(2).max(60),
  text: z.string().trim().min(10).max(2000),
  phone: z
    .string()
    .max(20)
    .refine((v) => normalizeUzPhone(v) !== null)
    .transform((v) => normalizeUzPhone(v) as string),
  locale: z.enum(["uz", "ru"]),
});

export type ReviewInput = z.input<typeof reviewInputSchema>;

export interface ApprovedReview {
  author: string;
  rating: number;
  text: string;
  /** ISO date the review was written. */
  date: string;
  verified: boolean;
}

export interface ReviewSummary {
  rating: number;
  count: number;
  /** Newest first, at most REVIEWS_SHOWN. */
  items: ApprovedReview[];
}

export const REVIEWS_SHOWN = 30;

/** Average of approved ratings, one decimal — what the stars and Product JSON-LD show. */
export function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}
