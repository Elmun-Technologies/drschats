"use server";

import { headers } from "next/headers";
import { z } from "zod";

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

const subscribeSchema = z.object({
  email: z.string().trim().email().max(160),
  // Honeypot: real people leave it empty, bots fill every field they find.
  company: z.string().max(0).optional(),
});

export type SubscribeResult = { ok: true } | { ok: false; error: "invalid" | "rate_limited" };

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

async function notifyTelegram(email: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📬 Yangi obuna: ${email}`,
    }),
  }).catch(() => {
    // A failed notification must not fail the subscription for the visitor.
  });
}

export async function subscribeToNewsletter(formData: {
  email: string;
  company?: string;
}): Promise<SubscribeResult> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!withinRateLimit(ip)) return { ok: false, error: "rate_limited" };

  const parsed = subscribeSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: "invalid" };

  await notifyTelegram(parsed.data.email);
  return { ok: true };
}
