"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { MENU_BUTTONS, clubConfigSchema } from "@/lib/bot/config";
import { escapeHtml } from "@/lib/bot/messages";
import { answerTicket, broadcast, closeTicket, retryJob, saveClubConfig } from "@/lib/bot/store";
import type { FormState } from "./catalog";

export async function saveClub(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = Object.fromEntries(form);
  const menu = Object.fromEntries(MENU_BUTTONS.map((k) => [k, form.get(`menu.${k}`) === "on"]));
  const parsed = clubConfigSchema.safeParse({
    ...raw,
    enabled: form.get("enabled") === "on",
    greeting: { uz: raw.greetingUz ?? "", ru: raw.greetingRu ?? "" },
    menu,
  });
  if (!parsed.success) return { error: "Maydonlarni tekshiring: doʻkon manzili https:// bilan boshlansin." };
  await saveClubConfig(parsed.data);
  revalidatePath("/admin/bot");
  return { ok: "Saqlandi. Bot yangi sozlamani keyingi soʻrovda oladi." };
}

const replySchema = z.object({ id: z.coerce.number().int().positive(), reply: z.string().trim().min(1).max(3000) });

export async function replyTicket(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = replySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Javob matnini yozing (3000 belgigacha)." };
  if (!(await answerTicket(parsed.data.id, parsed.data.reply))) return { error: "Murojaat topilmadi." };
  revalidatePath("/admin/bot/tickets");
  return { ok: "Javob navbatga qoʻyildi — bot bir necha soniyada yuboradi." };
}

export async function closeTicketAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (Number.isInteger(id) && id > 0) await closeTicket(id);
  revalidatePath("/admin/bot/tickets");
}

export async function retryJobAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (Number.isInteger(id) && id > 0) await retryJob(id);
  revalidatePath("/admin/bot/outbox");
}

const broadcastSchema = z.object({ text: z.string().trim().min(1).max(1000), confirm: z.literal("on") });

export async function broadcastAction(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = broadcastSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Matnni yozing va yuborishni tasdiqlang." };
  const queued = await broadcast(randomUUID(), { text: escapeHtml(parsed.data.text) });
  revalidatePath("/admin/bot");
  return { ok: `${queued} ta aʼzoga navbatga qoʻyildi.` };
}
