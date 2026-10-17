"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { ORDER_STATUSES, adminUsers, orders } from "@/lib/db/schema";
import { requireAdmin, setSessionCookie } from "@/lib/admin/session";
import { ADMIN_TABLE_LOCK } from "@/lib/admin/accounts";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/admin/password";
import { announceOrderStatus } from "@/lib/bot/store";
import { syncOrderStock } from "@/lib/catalog/order-stock";
import { afterOrderStatus } from "@/lib/loyalty/order-status";
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
  const db = getDb();
  const [before] = await db.select({ status: orders.status }).from(orders).where(eq(orders.number, parsed.data.number)).limit(1);
  if (!before) return { error: "Buyurtma topilmadi." };
  await db
    .update(orders)
    .set({ status: parsed.data.status, adminNote: parsed.data.adminNote?.trim() || null, updatedAt: new Date() })
    .where(eq(orders.number, parsed.data.number));
  await syncOrderStock(parsed.data.number, before.status, parsed.data.status);
  const loyaltyLines = await afterOrderStatus(parsed.data.number, before.status, parsed.data.status);
  // The customer hears about a new status in Telegram, not about a note edit.
  if (before.status !== parsed.data.status) await announceOrderStatus(parsed.data.number, parsed.data.status, loyaltyLines);
  revalidatePath("/admin/orders");
  return { ok: "Saqlandi." };
}

const quickSchema = z.object({ number: z.string().min(1).max(20), status: z.enum(ORDER_STATUSES) });

/* One-click status change from the order page; the customer hears about it in Telegram. */
export async function setOrderStatus(form: FormData) {
  await requireAdmin();
  const parsed = quickSchema.safeParse({ number: form.get("number"), status: form.get("status") });
  if (!parsed.success) return;
  const db = getDb();
  const [before] = await db.select({ status: orders.status }).from(orders).where(eq(orders.number, parsed.data.number)).limit(1);
  if (!before || before.status === parsed.data.status) return;
  await db.update(orders).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(orders.number, parsed.data.number));
  await syncOrderStock(parsed.data.number, before.status, parsed.data.status);
  const loyaltyLines = await afterOrderStatus(parsed.data.number, before.status, parsed.data.status);
  await announceOrderStatus(parsed.data.number, parsed.data.status, loyaltyLines);
  revalidatePath(`/admin/orders/${parsed.data.number}`);
  revalidatePath("/admin/orders");
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
  // Never yourself, and never the last one — two admins removing each other at once must not leave none.
  if (Number.isInteger(id) && id !== me.id) {
    await getDb().transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${ADMIN_TABLE_LOCK})`);
      const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(adminUsers);
      if (n > 1) await tx.delete(adminUsers).where(eq(adminUsers.id, id));
    });
  }
  revalidatePath("/admin/users");
}

const passwordSchema = z.object({
  current: z.string().min(1, "Joriy parolni kiriting.").max(200),
  next: z.string().min(MIN_PASSWORD_LENGTH, `Yangi parol kamida ${MIN_PASSWORD_LENGTH} belgi boʻlsin.`).max(200),
});

/* Changing the password signs out every other session of this admin. */
export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const parsed = passwordSchema.safeParse({ current: form.get("current"), next: form.get("next") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, me.id)).limit(1);
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) return { error: "Joriy parol notoʻgʻri." };
  const [updated] = await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(parsed.data.next), sessionEpoch: sql`${adminUsers.sessionEpoch} + 1` })
    .where(eq(adminUsers.id, me.id))
    .returning({ epoch: adminUsers.sessionEpoch });
  await setSessionCookie(me.id, updated.epoch);
  return { ok: "Parol almashtirildi. Boshqa qurilmalardagi sessiyalar yopildi." };
}
