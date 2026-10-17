"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import { saveCommerceSection } from "@/lib/commerce/server";
import { isCommerceSection, parseCommerceSection } from "@/lib/commerce/form";
import type { FormState } from "./catalog";

/*
  One card of /admin/commerce: save its section, or put it back to the
  defaults ("Standartga qaytarish"). Either way the storefront's cached
  settings are revalidated, so the cart, the PDP and the checkout action use
  the new rules on the next request.
*/
export async function saveCommerceSettings(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const section = form.get("section");
  if (!isCommerceSection(section)) return { error: "Boʻlim topilmadi." };
  const label = admin.name?.trim() || admin.email;

  if (form.get("intent") === "reset") {
    await saveCommerceSection(section, null, { id: admin.id, label });
  } else {
    const fields = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
    const parsed = parseCommerceSection(section, fields);
    if (!parsed.ok) return { error: parsed.error };
    await saveCommerceSection(section, parsed.value, { id: admin.id, label });
  }

  revalidateTag(SITE_SETTINGS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/commerce");
  return { ok: form.get("intent") === "reset" ? "Standart qiymatlar tiklandi." : "Saqlandi. Saytda va savatda darhol amal qiladi." };
}
