"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { flows } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { stepsSchema } from "@/lib/flows/types";
import type { FormState } from "./catalog";

const saveSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,39}$/),
  name: z.string().trim().min(2, "Nomini yozing.").max(120),
  steps: z.string().max(40_000),
});

export async function saveFlow(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = saveSchema.safeParse({ id: form.get("id"), name: form.get("name"), steps: form.get("steps") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };
  let raw: unknown;
  try {
    raw = JSON.parse(parsed.data.steps);
  } catch {
    return { error: "Qadamlarni oʻqib boʻlmadi." };
  }
  const steps = stepsSchema.safeParse(raw);
  if (!steps.success) {
    const issue = steps.error.issues[0];
    const where = typeof issue?.path[0] === "number" ? `${issue.path[0] + 1}-qadam: ` : "";
    return { error: `${where}${issue?.message ?? "qadamlarni tekshiring"}` };
  }
  const sorted = [...steps.data].sort((a, b) => a.delayMinutes - b.delayMinutes);
  const updated = await getDb()
    .update(flows)
    .set({ name: parsed.data.name, steps: sorted, updatedAt: new Date() })
    .where(eq(flows.id, parsed.data.id))
    .returning({ id: flows.id });
  if (updated.length === 0) return { error: "Avtomatlashtirish topilmadi." };
  revalidatePath("/admin/flows");
  revalidatePath(`/admin/flows/${parsed.data.id}`);
  return { ok: "Saqlandi. Yangi matn va muddatlar keyingi qadamlardan amal qiladi." };
}

export async function toggleFlow(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (id) await getDb().update(flows).set({ active: sql`not ${flows.active}`, updatedAt: new Date() }).where(eq(flows.id, id));
  revalidatePath("/admin/flows");
  revalidatePath(`/admin/flows/${id}`);
}

/** Runs one worker tick now (flows + outbox) instead of waiting for the next minute. */
export async function runMessagingNow(_: FormState, _form: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const { runMessagingTick } = await import("@/lib/messaging/worker");
    const result = await runMessagingTick({ flows: true });
    if (result.busy) return { ok: "Ishchi hozir band — bir daqiqadan keyin natija shu yerda koʻrinadi." };
    const f = result.flows;
    const o = result.outbox;
    revalidatePath("/admin/flows");
    revalidatePath("/admin/messages");
    return {
      ok: `Bajarildi: ${f?.enrolled ?? 0} ta yangi ishtirokchi, ${f?.queued ?? 0} ta xabar navbatga, ${o?.sent ?? 0} ta yuborildi${o?.deferred ? `, ${o.deferred} tasi tungi vaqt sabab 09:00 ga qoldirildi` : ""}.`,
    };
  } catch (err) {
    console.error("[messages] manual tick failed:", (err as Error).message);
    return { error: "Ishga tushirib boʻlmadi. Server logini tekshiring." };
  }
}
