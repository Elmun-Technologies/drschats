"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditLog } from "@/lib/admin/audit";
import { anonymiseCustomer } from "@/lib/admin/anonymise";
import { redactPhone } from "@/lib/privacy";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { getCustomerDetails } from "@/lib/admin/customers";
import { adminCustomerNotes } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import type { FormState } from "./catalog";
import { t } from "@/lib/admin/i18n/server";

const noteSchema = z.object({
  phone9: z.string().regex(/^\d{9}$/, "Mijoz identifikatori notoʻgʻri."),
  note: z.string().trim().min(2, "Izoh kamida 2 belgidan iborat boʻlsin.").max(2000, "Izoh 2000 belgidan oshmasin."),
});

export async function addCustomerNote(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin("customers");
  const parsed = noteSchema.safeParse({ phone9: form.get("phone9"), note: form.get("note") });
  if (!parsed.success) return { error: t(parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring.") };

  const customer = await getCustomerDetails(parsed.data.phone9);
  if (!customer) return { error: t("Mijoz topilmadi.") };

  await getDb().insert(adminCustomerNotes).values({
    phone9: parsed.data.phone9,
    adminUserId: admin.id,
    note: parsed.data.note,
  });
  revalidatePath(`/admin/customers/${parsed.data.phone9}`);
  revalidatePath("/admin/customers");
  return { ok: t("Izoh saqlandi.") };
}

const ANONYMISE_CONFIRM = "OʻCHIRISH";
const anonymiseSchema = z.object({
  phone9: z.string().regex(/^\d{9}$/, "Mijoz identifikatori notoʻgʻri."),
  confirm: z.string().trim(),
});

/*
  The customer's right to erasure (lib/admin/anonymise.ts). Owner only — it
  cannot be undone — and confirmed by typing the word, not by one click.
  The audit row names the number only redacted.
*/
export async function anonymiseCustomerAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin("users");
  const parsed = anonymiseSchema.safeParse({ phone9: form.get("phone9"), confirm: form.get("confirm") ?? "" });
  if (!parsed.success) return { error: t(parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring.") };
  if (parsed.data.confirm.toUpperCase().replace(/[ʻ'`’]/g, "ʻ") !== ANONYMISE_CONFIRM) return { error: t("Tasdiqlash uchun «{word}» deb yozing.", { word: ANONYMISE_CONFIRM }) };
  try {
    const removed = await anonymiseCustomer(parsed.data.phone9);
    await auditLog(admin, "customer.anonymise", redactPhone(parsed.data.phone9), removed);
  } catch (err) {
    console.error("[admin] anonymise failed:", (err as Error).message);
    return { error: t("Oʻchirib boʻlmadi. Qayta urinib koʻring.") };
  }
  revalidatePath("/admin/customers");
  redirect("/admin/customers?anonymised=1");
}
