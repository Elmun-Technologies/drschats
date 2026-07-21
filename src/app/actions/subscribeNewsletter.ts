"use server";

import { headers } from "next/headers";
import { z } from "zod";

// Simple in-memory rate limiter: 10 attempts per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const emailSchema = z.string().email();

async function notifyTelegram(email: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = `📧 Yangi obuna / new subscriber: ${email}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => {});
}

export async function subscribeNewsletter(
  email: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return { ok: false, message: "Too many requests. Please try again later." };
    }

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      return { ok: false, message: "Invalid email." };
    }

    await notifyTelegram(parsed.data);
    return { ok: true };
  } catch (err) {
    console.error("[newsletter] subscribeNewsletter failed", err);
    return { ok: false, message: "Could not subscribe. Please try again." };
  }
}
