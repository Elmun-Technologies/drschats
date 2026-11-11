"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { auditLog, auditTarget } from "@/lib/admin/audit";
import { CATALOG_TAG } from "@/lib/catalog/db";
import { adjustStock, saveLowStockDefault, saveReleaseHours } from "@/lib/catalog/stock";
import { afterProductChange, cancelWaitRequest, notifyWaitlist, type DispatchResult } from "@/lib/notify/waitlist";
import type { FormState } from "./catalog";
import { t } from "@/lib/admin/i18n/server";

function refresh() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

function sentNote(r: DispatchResult | null): string {
  if (!r || r.due === 0) return "";
  const parts = [
    r.byChannel.telegram && `Telegram: ${r.byChannel.telegram}`,
    r.byChannel.sms && `SMS: ${r.byChannel.sms}`,
    r.byChannel.operator && `operatorga qoʻngʻiroq roʻyxati: ${r.byChannel.operator}`,
    r.left && `yetkazilmadi: ${r.left}`,
  ].filter(Boolean);
  return ` Kutayotganlarga xabar: ${parts.join(", ")}.`;
}

const adjustSchema = z.object({
  id: z.string().min(1).max(200),
  mode: z.enum(["delta", "set", "untrack"]),
  value: z.coerce.number().int().min(-1_000_000).max(1_000_000).optional(),
  note: z.string().trim().max(300).optional(),
});

/* The products list's "Soni" dialog: ± units, an exact count, or stop tracking. */
export async function adjustStockAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin("catalog");
  const parsed = adjustSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: t("Sonni tekshiring.") };
  const { id, mode, value, note } = parsed.data;
  if (mode !== "untrack" && (value == null || (mode === "delta" && value === 0))) return { error: t("Sonni kiriting.") };
  if (mode === "set" && (value as number) < 0) return { error: t("Son manfiy boʻlmaydi.") };
  const result = await adjustStock(id, mode === "untrack" ? { mode } : { mode, value: value as number }, note || null);
  if (!result) return { error: t("Mahsulot topilmadi.") };
  refresh();
  const sent = await afterProductChange(id, result.before, result.after);
  const now = result.after.stockQty == null ? "kuzatilmaydi" : `${result.after.stockQty} ta`;
  await auditLog(admin, "stock.adjust", auditTarget(form));
  return { ok: `Saqlandi: ${now}.${sentNote(sent)}` };
}

const thresholdSchema = z.object({ lowStockAt: z.coerce.number().int().min(1).max(1000) });

export async function saveLowStockDefaultAction(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin("catalog");
  const parsed = thresholdSchema.safeParse({ lowStockAt: form.get("lowStockAt") });
  if (!parsed.success) return { error: t("1 dan 1000 gacha son kiriting.") };
  await saveLowStockDefault(parsed.data.lowStockAt, me.id);
  refresh();
  return { ok: "Saqlandi." };
}

/* "Hozir xabar yuborish": everyone the product's current state answers (back in stock / cheaper). */
export async function notifyWaitlistNow(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin("waitlist");
  const id = String(form.get("productId") ?? "");
  if (!id) return { error: t("Mahsulot tanlanmagan.") };
  const r = await notifyWaitlist(id);
  revalidatePath("/admin/waitlist");
  if (r.due === 0) return { error: t("Hozir xabar beradigan hech kim yoʻq: mahsulot sotuvda emas yoki narxi kutilgan narxdan tushmagan.") };
  return { ok: `Yuborildi.${sentNote(r)}` };
}

const releaseSchema = z.object({ hours: z.coerce.number().int().min(0).max(168) });

export async function saveReleaseHoursAction(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin("catalog");
  const parsed = releaseSchema.safeParse({ hours: form.get("hours") });
  if (!parsed.success) return { error: t("0 dan 168 gacha son kiriting.") };
  await saveReleaseHours(parsed.data.hours, me.id);
  await auditLog(me, "stock.release_hours", null, { hours: parsed.data.hours });
  return { ok: parsed.data.hours ? `Saqlandi: ${parsed.data.hours} soat.` : "Saqlandi: avtomatik bekor qilish oʻchiq." };
}

export async function cancelWaitRequestAction(form: FormData) {
  await requireAdmin("waitlist");
  const id = Number(form.get("id"));
  if (Number.isInteger(id) && id > 0) await cancelWaitRequest(id);
  revalidatePath("/admin/waitlist");
}
