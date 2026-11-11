"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { flows } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { stepsSchema } from "@/lib/flows/types";
import { saveTransactionalSms } from "@/lib/sms/transactional-server";
import type { FormState } from "./catalog";
import { t } from "@/lib/admin/i18n/server";

const saveSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,39}$/),
  name: z.string().trim().min(2, "Nomini yozing.").max(120),
  steps: z.string().max(40_000),
});

export async function saveFlow(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin("marketing");
  const parsed = saveSchema.safeParse({ id: form.get("id"), name: form.get("name"), steps: form.get("steps") });
  if (!parsed.success) return { error: t(parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring.") };
  let raw: unknown;
  try {
    raw = JSON.parse(parsed.data.steps);
  } catch {
    return { error: t("Qadamlarni oʻqib boʻlmadi.") };
  }
  const steps = stepsSchema.safeParse(raw);
  if (!steps.success) {
    const issue = steps.error.issues[0];
    const message = t(issue?.message ?? "qadamlarni tekshiring");
    return { error: typeof issue?.path[0] === "number" ? t("{n}-qadam: {error}", { n: issue.path[0] + 1, error: message }) : message };
  }
  const sorted = [...steps.data].sort((a, b) => a.delayMinutes - b.delayMinutes);
  const updated = await getDb()
    .update(flows)
    .set({ name: parsed.data.name, steps: sorted, updatedAt: new Date() })
    .where(eq(flows.id, parsed.data.id))
    .returning({ id: flows.id });
  if (updated.length === 0) return { error: t("Avtomatlashtirish topilmadi.") };
  revalidatePath("/admin/flows");
  revalidatePath(`/admin/flows/${parsed.data.id}`);
  return { ok: t("Saqlandi. Yangi matn va muddatlar keyingi qadamlardan amal qiladi.") };
}

export async function toggleFlow(form: FormData): Promise<void> {
  await requireAdmin("marketing");
  const id = String(form.get("id") ?? "");
  if (id) await getDb().update(flows).set({ active: sql`not ${flows.active}`, updatedAt: new Date() }).where(eq(flows.id, id));
  revalidatePath("/admin/flows");
  revalidatePath(`/admin/flows/${id}`);
}

/** Runs one worker tick now (flows + outbox) instead of waiting for the next minute. */
export async function runMessagingNow(_: FormState, _form: FormData): Promise<FormState> {
  await requireAdmin("marketing");
  try {
    const { runMessagingTick } = await import("@/lib/messaging/worker");
    const result = await runMessagingTick({ flows: true });
    if (result.busy) return { ok: t("Ishchi hozir band — bir daqiqadan keyin natija shu yerda koʻrinadi.") };
    const f = result.flows;
    const o = result.outbox;
    revalidatePath("/admin/flows");
    revalidatePath("/admin/messages");
    const counts = { enrolled: f?.enrolled ?? 0, queued: f?.queued ?? 0, sent: o?.sent ?? 0, deferred: o?.deferred ?? 0 };
    return {
      ok: o?.deferred
        ? t("Bajarildi: {enrolled} ta yangi ishtirokchi, {queued} ta xabar navbatga, {sent} ta yuborildi, {deferred} tasi tungi vaqt sabab 09:00 ga qoldirildi.", counts)
        : t("Bajarildi: {enrolled} ta yangi ishtirokchi, {queued} ta xabar navbatga, {sent} ta yuborildi.", counts),
    };
  } catch (err) {
    console.error("[messages] manual tick failed:", (err as Error).message);
    return { error: t("Ishga tushirib boʻlmadi. Server logini tekshiring.") };
  }
}

/* Order SMS (lib/sms/transactional.ts): two switches, nothing else is editable — the texts are Eskiz-moderated templates. */
export async function saveOrderSmsSettings(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin("marketing");
  await saveTransactionalSms({ orderPlaced: form.get("orderPlaced") === "on", statusChanged: form.get("statusChanged") === "on" }, admin.id);
  revalidatePath("/admin/flows");
  return { ok: t("Saqlandi.") };
}
