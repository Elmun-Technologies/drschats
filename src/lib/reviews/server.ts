import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { ReviewStatus } from "@/lib/db/schema";
import { REVIEWS_SHOWN, averageRating, type ReviewSummary } from "./rules";

/*
  Reviews (0017). Written on the product page as `pending`; shown — and
  counted into the product's rating — only once an admin approves them in
  /admin/reviews. Nothing here invents a rating: a product with no approved
  review has none.
*/

type Row = Record<string, unknown>;

export async function insertReview(input: { slug: string; rating: number; author: string; text: string; phone: string; locale: "uz" | "ru" }): Promise<number> {
  const phone9 = input.phone.replace(/\D/g, "").slice(-9);
  const db = getDb();
  // «Xaridor»: this phone has a delivered order containing this product.
  const [bought] = (await db.execute(sql`
    select 1 from orders
    where status = 'delivered'
      and right(regexp_replace(customer->>'phone', '\\D', '', 'g'), 9) = ${phone9}
      and items @> ${JSON.stringify([{ slug: input.slug }])}::jsonb
    limit 1`)) as unknown as Row[];
  const [row] = (await db.execute(sql`
    insert into reviews (product_slug, rating, author, text, phone9, verified, locale)
    values (${input.slug}, ${input.rating}, ${input.author}, ${input.text}, ${phone9}, ${Boolean(bought)}, ${input.locale})
    returning id`)) as unknown as { id: string | number }[];
  return Number(row.id);
}

/** Pending reviews from this phone for this product — one waiting review is enough. */
export async function pendingFrom(slug: string, phone: string): Promise<number> {
  const phone9 = phone.replace(/\D/g, "").slice(-9);
  const [row] = (await getDb().execute(sql`
    select count(*) as n from reviews where product_slug = ${slug} and phone9 = ${phone9} and status = 'pending'`)) as unknown as { n: string }[];
  return Number(row?.n ?? 0);
}

/** Approved reviews per product slug, for the catalogue read (cached with it). */
export async function approvedReviewSummaries(): Promise<Map<string, ReviewSummary>> {
  const rows = (await getDb().execute(sql`
    select product_slug, rating, author, text, verified, created_at
    from reviews where status = 'approved'
    order by created_at desc`)) as unknown as Row[];
  const bySlug = new Map<string, { ratings: number[]; items: ReviewSummary["items"] }>();
  for (const r of rows) {
    const slug = String(r.product_slug);
    const entry = bySlug.get(slug) ?? { ratings: [], items: [] };
    entry.ratings.push(Number(r.rating));
    if (entry.items.length < REVIEWS_SHOWN) {
      entry.items.push({
        author: String(r.author),
        rating: Number(r.rating),
        text: String(r.text),
        date: new Date(r.created_at as string).toISOString().slice(0, 10),
        verified: Boolean(r.verified),
      });
    }
    bySlug.set(slug, entry);
  }
  return new Map([...bySlug].map(([slug, e]) => [slug, { rating: averageRating(e.ratings), count: e.ratings.length, items: e.items }]));
}

export interface AdminReview {
  id: number;
  productSlug: string;
  rating: number;
  author: string;
  text: string;
  phone9: string | null;
  verified: boolean;
  locale: string;
  status: ReviewStatus;
  moderatedBy: string | null;
  createdAt: Date;
}

export async function listReviews(status: ReviewStatus | "all"): Promise<AdminReview[]> {
  const rows = (await getDb().execute(sql`
    select * from reviews ${status === "all" ? sql`` : sql`where status = ${status}`}
    order by created_at desc limit 300`)) as unknown as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    productSlug: String(r.product_slug),
    rating: Number(r.rating),
    author: String(r.author),
    text: String(r.text),
    phone9: (r.phone9 as string) ?? null,
    verified: Boolean(r.verified),
    locale: String(r.locale),
    status: r.status as ReviewStatus,
    moderatedBy: (r.moderated_by as string) ?? null,
    createdAt: new Date(r.created_at as string),
  }));
}

export async function reviewCounts(): Promise<Record<ReviewStatus, number>> {
  const rows = (await getDb().execute(sql`select status, count(*) as n from reviews group by status`)) as unknown as { status: ReviewStatus; n: string }[];
  const out: Record<ReviewStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const r of rows) out[r.status] = Number(r.n);
  return out;
}

/** Returns the product slug, so the caller can refresh that page. */
export async function moderateReview(id: number, status: ReviewStatus, by: string): Promise<string | null> {
  const [row] = (await getDb().execute(sql`
    update reviews set status = ${status}, moderated_by = ${by}, moderated_at = now()
    where id = ${id} returning product_slug`)) as unknown as { product_slug: string }[];
  return row?.product_slug ?? null;
}
