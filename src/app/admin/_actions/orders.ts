"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { ORDER_STATUSES, orders } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { auditLog } from "@/lib/admin/audit";
import { notifyCustomerOfOrder } from "@/lib/sms/transactional-server";
import { syncOrderStock } from "@/lib/catalog/order-stock";
import { afterOrderStatus } from "@/lib/loyalty/order-status";
import type { FormState } from "./catalog";

const statusSchema = z.object({
  number: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  adminNote: z.string().max(2000).optional(),
});

export async function updateOrder(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin("orders");
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
  // The customer hears about a new status (Telegram, else SMS), not about a note edit.
  if (before.status !== parsed.data.status) await notifyCustomerOfOrder(parsed.data.number, parsed.data.status, loyaltyLines);
  await auditLog(admin, "order.update", parsed.data.number, { from: before.status, to: parsed.data.status, note: Boolean(parsed.data.adminNote?.trim()) });
  revalidatePath("/admin/orders");
  return { ok: "Saqlandi." };
}

const quickSchema = z.object({ number: z.string().min(1).max(20), status: z.enum(ORDER_STATUSES) });

/* One-click status change from the order page; the customer hears about it in Telegram. */
export async function setOrderStatus(form: FormData) {
  const admin = await requireAdmin("orders");
  const parsed = quickSchema.safeParse({ number: form.get("number"), status: form.get("status") });
  if (!parsed.success) return;
  const db = getDb();
  const [before] = await db.select({ status: orders.status }).from(orders).where(eq(orders.number, parsed.data.number)).limit(1);
  if (!before || before.status === parsed.data.status) return;
  await db.update(orders).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(orders.number, parsed.data.number));
  await syncOrderStock(parsed.data.number, before.status, parsed.data.status);
  const loyaltyLines = await afterOrderStatus(parsed.data.number, before.status, parsed.data.status);
  await notifyCustomerOfOrder(parsed.data.number, parsed.data.status, loyaltyLines);
  await auditLog(admin, "order.status", parsed.data.number, { from: before.status, to: parsed.data.status });
  revalidatePath(`/admin/orders/${parsed.data.number}`);
  revalidatePath("/admin/orders");
}
