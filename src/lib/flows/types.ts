import { z } from "zod";

/*
  Automations ("flows"): what starts one, what each step sends. Pure — the
  admin editor (client) and the engine (server) read the same schema.
*/

export const FLOW_TRIGGERS = [
  "cart_abandoned",
  "checkout_dropped",
  "first_order_delivered",
  "course_ending",
  "lapsed",
  "restock",
  "birthday",
] as const;
export type FlowTrigger = (typeof FLOW_TRIGGERS)[number];

export const TRIGGER_INFO: Record<FlowTrigger, { title: string; anchor: string; ready: boolean }> = {
  cart_abandoned: { title: "Savat tashlab ketildi", anchor: "savatga oxirgi qoʻshilgan vaqtdan", ready: true },
  checkout_dropped: { title: "Rasmiylashtirishda toʻxtadi", anchor: "buyurtma formasini ochgan vaqtdan", ready: true },
  first_order_delivered: { title: "Birinchi buyurtma yetkazildi", anchor: "yetkazilgan kundan", ready: true },
  course_ending: { title: "Kurs tugayapti", anchor: "oxirgi buyurtmadan", ready: true },
  lapsed: { title: "Uzoq vaqt xarid yoʻq", anchor: "oxirgi buyurtmadan", ready: true },
  /*
    Not wired: "back in stock" messages are sent by the waitlist
    (lib/notify/waitlist.ts — Telegram, then SMS through the outbox, then the
    operator's call list), which never calls enqueueRestockMessage(). An
    active restock flow enrolled nobody, so it cannot be switched on.
  */
  restock: { title: "Mahsulot omborga keldi", anchor: "mahsulot kelgan vaqtdan", ready: false },
  birthday: { title: "Tugʻilgan kun", anchor: "tugʻilgan kundan N kun oldin (Sodiqlik sozlamasi)", ready: true },
};

export const STEP_CHANNELS = ["telegram_then_sms", "telegram", "sms"] as const;
export type StepChannel = (typeof STEP_CHANNELS)[number];

export const CHANNEL_LABELS: Record<StepChannel, string> = {
  telegram_then_sms: "Telegram, boʻlmasa SMS",
  telegram: "Faqat Telegram",
  sms: "Faqat SMS",
};

const MAX_DELAY_MINUTES = 365 * 24 * 60;

export const promoSchema = z.object({
  kind: z.enum(["percent", "fixed"]),
  value: z.number().int().positive(),
  ttlHours: z.number().int().min(1).max(24 * 90),
  minSubtotal: z.number().int().min(0).nullable().optional(),
}).refine((p) => p.kind !== "percent" || p.value <= 90, { message: "Foiz 1–90 boʻlsin" });

export const stepSchema = z.object({
  delayMinutes: z.number().int().min(0).max(MAX_DELAY_MINUTES),
  channel: z.enum(STEP_CHANNELS),
  text: z.object({
    uz: z.string().trim().min(5, "Matn (uz) kamida 5 belgi").max(1000),
    ru: z.string().trim().min(5, "Matn (ru) kamida 5 belgi").max(1000),
  }),
  /** Site path without the locale ("/cart"); empty — the page the trigger knows (a product for restock). */
  link: z.string().trim().max(200).regex(/^$|^\/[A-Za-z0-9\-_/?=&.%]*$/, "Havola / bilan boshlansin (masalan /cart)").default(""),
  promo: promoSchema.nullable().default(null),
});
export type FlowStep = z.infer<typeof stepSchema>;
export type StepPromo = z.infer<typeof promoSchema>;

export const stepsSchema = z.array(stepSchema).min(1, "Kamida bitta qadam boʻlsin").max(8, "8 tadan ortiq qadam boʻlmasin");

/** Steps as stored; an unreadable row yields no steps (the flow then does nothing) instead of throwing in the worker. */
export function parseSteps(raw: unknown): FlowStep[] {
  const parsed = stepsSchema.safeParse(raw);
  return parsed.success ? [...parsed.data].sort((a, b) => a.delayMinutes - b.delayMinutes) : [];
}

export function isFlowTrigger(value: string): value is FlowTrigger {
  return (FLOW_TRIGGERS as readonly string[]).includes(value);
}

export function formatDelay(minutes: number): string {
  if (minutes === 0) return "darhol";
  if (minutes % 1440 === 0) return `${minutes / 1440} kun`;
  if (minutes % 60 === 0) return `${minutes / 60} soat`;
  return `${minutes} daqiqa`;
}
