"use server";

import { headers } from "next/headers";
import { shopflow } from "@/lib/shopflow";
import { orderRequestSchema } from "@/lib/shopflow/schemas";
import type { OrderRequest, OrderResult } from "@/lib/shopflow/types";

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

async function notifyTelegram(order: OrderRequest, orderId: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const items = order.items.map((i) => `  • ${i.name} × ${i.quantity}`).join("\n");
  const text = [
    `🛒 *Yangi buyurtma #${orderId}*`,
    `👤 ${order.customer.name} — ${order.customer.phone}`,
    `📍 ${order.delivery.region}, ${order.delivery.address}`,
    `🚚 ${order.delivery.method}`,
    `\n${items}`,
    `\n💰 Jami: ${order.totals.total.toLocaleString()} so'm`,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  }).catch(() => {});
}

export async function submitOrder(payload: OrderRequest): Promise<OrderResult> {
  // Rate limiting
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }

  const parsed = orderRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "Invalid order payload." };
  }
  try {
    const result = await shopflow.createOrder(parsed.data as OrderRequest);
    if (result.ok && result.orderId) {
      notifyTelegram(parsed.data as OrderRequest, result.orderId);
    }
    return result;
  } catch (err) {
    console.error("[checkout] createOrder failed", err);
    return { ok: false, message: "Could not submit order. Please try again." };
  }
}
