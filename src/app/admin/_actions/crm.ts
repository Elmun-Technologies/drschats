"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { getCustomerDetails } from "@/lib/admin/customers";
import { adminCustomerNotes } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import type { FormState } from "./catalog";

const noteSchema = z.object({
  phone9: z.string().regex(/^\d{9}$/, "Mijoz identifikatori notoʻgʻri."),
  note: z.string().trim().min(2, "Izoh kamida 2 belgidan iborat boʻlsin.").max(2000, "Izoh 2000 belgidan oshmasin."),
});

export async function addCustomerNote(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = noteSchema.safeParse({ phone9: form.get("phone9"), note: form.get("note") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring." };

  const customer = await getCustomerDetails(parsed.data.phone9);
  if (!customer) return { error: "Mijoz topilmadi." };

  await getDb().insert(adminCustomerNotes).values({
    phone9: parsed.data.phone9,
    adminUserId: admin.id,
    note: parsed.data.note,
  });
  revalidatePath(`/admin/customers/${parsed.data.phone9}`);
  revalidatePath("/admin/customers");
  return { ok: "Izoh saqlandi." };
}
