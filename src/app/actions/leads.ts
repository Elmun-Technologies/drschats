"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { isOperatorChannelConfigured, notifyOperator } from "@/lib/notifications/operator";
import { redactPhone } from "@/lib/privacy";
import { REGION_KEYS } from "@/lib/checkout/regions";

/*
  The two public forms on the information pages: a partner application
  (/partners) and a message to the shop (/contact).

  Both land in the operator's Telegram group, the same place orders and
  restock requests go, and both answer `unavailable` when that channel is not
  configured — the form then gives the phone number instead of thanking the
  visitor for a message nobody will read. Sent as plain text, not Markdown:
  a stray "_" or "*" in what a visitor typed would otherwise make Telegram
  reject the whole message.
*/
const RATE = { limit: 5, windowMs: 10 * 60 * 1000 };

const phone = z
  .string()
  .trim()
  .min(9)
  .max(20)
  .regex(/^\+?[\d\s()-]+$/);

const partnerSchema = z.object({
  company: z.string().trim().min(2).max(160),
  kind: z.enum(["pharmacy", "distribution", "corporate"]),
  contact: z.string().trim().min(2).max(120),
  phone,
  region: z.enum(REGION_KEYS),
  branches: z.string().trim().max(10).regex(/^\d*$/).optional(),
  note: z.string().trim().max(1000).optional(),
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone,
  message: z.string().trim().min(5).max(2000),
});

export type PartnerLead = z.input<typeof partnerSchema>;
export type ContactMessage = z.input<typeof contactSchema>;
export type LeadResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" | "unavailable" };

async function deliver(scope: string, phoneNumber: string, lines: string[]): Promise<LeadResult> {
  const hdrs = await headers();
  if (!withinRateLimit(scope, clientIp(hdrs), RATE)) return { ok: false, error: "rate_limited" };

  if (!isOperatorChannelConfigured()) {
    console.warn(`[${scope}] dropped: no operator channel configured. phone=${redactPhone(phoneNumber)}`);
    return { ok: false, error: "unavailable" };
  }

  // The Telegram message is the only copy of the lead: if it did not arrive,
  // say so, so the form offers the phone number instead of a false "sent".
  const delivered = await notifyOperator(lines.join("\n"));
  return delivered ? { ok: true } : { ok: false, error: "unavailable" };
}

export async function submitPartnerLead(input: PartnerLead, regionLabel: string): Promise<LeadResult> {
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const d = parsed.data;
  return deliver("partner-lead", d.phone, [
    "🤝 Hamkorlik arizasi",
    `🏢 ${d.company}`,
    `🧭 ${d.kind}`,
    `👤 ${d.contact}`,
    `📞 ${d.phone}`,
    `📍 ${regionLabel.slice(0, 60) || d.region}`,
    ...(d.branches ? [`🏬 Filiallar: ${d.branches}`] : []),
    ...(d.note ? [`💬 ${d.note}`] : []),
  ]);
}

export async function submitContactMessage(input: ContactMessage): Promise<LeadResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const d = parsed.data;
  return deliver("contact-message", d.phone, ["✉️ Saytdan xabar", `👤 ${d.name}`, `📞 ${d.phone}`, `💬 ${d.message}`]);
}
