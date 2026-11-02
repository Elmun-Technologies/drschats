"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { auditLog } from "@/lib/admin/audit";
import { moderateReview } from "@/lib/reviews/server";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { advanceSubscription, cancelSubscription } from "@/lib/subscription/server";

const moderateSchema = z.object({ id: z.coerce.number().int().positive(), status: z.enum(["approved", "rejected", "pending"]) });

/* Approve / reject a customer review. Approved ones feed the product's rating and appear on its page. */
export async function moderateReviewAction(form: FormData) {
  const admin = await requireAdmin("marketing");
  const parsed = moderateSchema.safeParse({ id: form.get("id"), status: form.get("status") });
  if (!parsed.success) return;
  const slug = await moderateReview(parsed.data.id, parsed.data.status, admin.email);
  await auditLog(admin, `review.${parsed.data.status}`, String(parsed.data.id));
  revalidateTag(CATALOG_TAG);
  if (slug) {
    revalidatePath(`/uz/product/${slug}`);
    revalidatePath(`/ru/product/${slug}`);
  }
  revalidatePath("/admin/reviews");
}

const subscriptionSchema = z.object({ id: z.coerce.number().int().positive(), op: z.enum(["advance", "cancel"]) });

/* «Yetkazildi» moves the next due date one interval on; «Bekor qilish» ends the subscription. */
export async function subscriptionAction(form: FormData) {
  const admin = await requireAdmin("orders");
  const parsed = subscriptionSchema.safeParse({ id: form.get("id"), op: form.get("op") });
  if (!parsed.success) return;
  if (parsed.data.op === "advance") await advanceSubscription(parsed.data.id);
  else await cancelSubscription(parsed.data.id);
  await auditLog(admin, `subscription.${parsed.data.op}`, String(parsed.data.id));
  revalidatePath("/admin/subscriptions");
}
