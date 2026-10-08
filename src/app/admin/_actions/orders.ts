"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { ORDER_STATUSES, adminUsers, orders } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/admin/password";
import type { FormState } from "./catalog";

const statusSchema = z.object({
  number: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  adminNote: z.string().max(2000).optional(),
});

export async function updateOrder(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = statusSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Holatni tanlang." };
  await getDb()
    .update(orders)
    .set({ status: parsed.data.status, adminNote: parsed.data.adminNote?.trim() || null, updatedAt: new Date() })
    .where(eq(orders.number, parsed.data.number));
  revalidatePath("/admin/orders");
  return { ok: "Saqlandi." };
}

const adminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(200),
});

export async function addAdmin(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = adminSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: `Maydonlarni tekshiring: parol kamida ${MIN_PASSWORD_LENGTH} belgi.` };
  const db = getDb();
  const [exists] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (exists) return { error: "Bu email bilan administrator bor." };
  await db.insert(adminUsers).values({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) });
  revalidatePath("/admin/users");
  return { ok: "Administrator qoʻshildi." };
}

export async function removeAdmin(form: FormData) {
  const me = await requireAdmin();
  const id = Number(form.get("id"));
  // Never yourself: the panel must always keep at least the person using it.
  if (Number.isInteger(id) && id !== me.id) await getDb().delete(adminUsers).where(eq(adminUsers.id, id));
  revalidatePath("/admin/users");
}
