"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { MERCH_TAG } from "@/lib/merch/store";
import { EXPERIMENT_RE } from "@/lib/merch/ab";

const winnerSchema = z.object({ experiment: z.string().regex(EXPERIMENT_RE), variant: z.enum(["A", "B"]) });

/**
 * «Gʻolibni qoldirish»: the other variant is switched off. The winner stays
 * on, now alone in its slot, so every visitor sees it; the results stay on
 * record (the rows and their exposures are kept).
 */
export async function keepWinner(form: FormData) {
  await requireAdmin();
  const parsed = winnerSchema.safeParse({ experiment: form.get("experiment"), variant: form.get("variant") });
  if (!parsed.success) return;
  const { experiment, variant } = parsed.data;
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(banners).set({ active: true, updatedAt: new Date() }).where(and(eq(banners.experiment, experiment), eq(banners.variant, variant)));
    await tx.update(banners).set({ active: false, updatedAt: new Date() }).where(and(eq(banners.experiment, experiment), ne(banners.variant, variant)));
  });
  revalidateTag(MERCH_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/storefront", "layout");
}
