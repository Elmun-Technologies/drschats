"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { isOperatorChannelConfigured, notifyOperator } from "@/lib/notifications/operator";
import { redactPhone } from "@/lib/privacy";
import { isDbConfigured } from "@/lib/db/client";
import { createWaitRequest } from "@/lib/notify/waitlist";

/*
  "Tell me when it is back" — and "tell me when it is cheaper".

  A generous limit, because this is a customer asking for something rather than
  trying to buy it, and one person can legitimately be waiting on three
  products. Still a limit: the form is public, takes a phone number, and every
  submission lands in a Telegram group a human reads.
*/
const RATE = { limit: 20, windowMs: 60 * 60 * 1000 };

const restockSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  productName: z.string().trim().min(1).max(200),
  phone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    // Digits, spaces and the leading + of an international number. Anything
    // else is not a phone number and should not reach a human's Telegram.
    .regex(/^\+?[\d\s()-]+$/, "invalid_phone"),
  kind: z.enum(["restock", "price_drop"]),
  locale: z.enum(["uz", "ru"]),
});

export type RestockResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rate_limited" | "unavailable" };

/**
 * Record a restock (or price-drop) request with the people who can act on it.
 *
 * This used to be a console.log and an unconditional `ok`. The form beside it
 * tells the customer "we will let you know", so a version that stored nothing
 * was not a stub — it was a promise the shop could not keep.
 *
 * With the database the request is a row (restock_requests): when the product
 * is back in stock or cheaper, the customer is told automatically through the
 * club bot when their phone is linked there, otherwise the operator gets a
 * call list (lib/notify/waitlist.ts). The operator's Telegram still hears
 * about every request, as before.
 *
 * Without a stored row (no database, or a search that matched no product) the
 * operator channel is the only record, so when it is not configured the
 * answer is `unavailable`, not `ok` — the form then says so instead of
 * thanking the customer for nothing.
 */
export async function notifyRestock(
  productId: string,
  productName: string,
  phone: string,
  kind: "restock" | "price_drop" = "restock",
  locale: "uz" | "ru" = "uz",
): Promise<RestockResult> {
  const parsed = restockSchema.safeParse({ productId, productName, phone, kind, locale });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const hdrs = await headers();
  if (!withinRateLimit("restock", clientIp(hdrs), RATE)) {
    return { ok: false, error: "rate_limited" };
  }

  let stored: Awaited<ReturnType<typeof createWaitRequest>> = null;
  if (isDbConfigured) {
    try {
      stored = await createWaitRequest({
        productId: parsed.data.productId,
        phone: parsed.data.phone,
        locale: parsed.data.locale,
        kind: parsed.data.kind,
      });
    } catch (err) {
      console.error(
        `[restock-notify] not stored: ${(err as Error).message} productId=${parsed.data.productId} phone=${redactPhone(parsed.data.phone)}`,
      );
    }
  }

  if (!(await isOperatorChannelConfigured())) {
    if (stored) return { ok: true };
    /*
      Logged without the number: the fact that requests are being dropped is
      what an operator needs to see, and the contact details of everyone who
      made one are not. See src/lib/privacy.ts.
    */
    console.warn(
      `[restock-notify] dropped: no operator channel configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID). productId=${parsed.data.productId} phone=${redactPhone(parsed.data.phone)}`,
    );
    return { ok: false, error: "unavailable" };
  }

  const text = [
    parsed.data.kind === "price_drop" ? "📉 Narxi tushishini kutmoqda" : "🔔 Mahsulot kutilmoqda",
    `📦 ${parsed.data.productName}`,
    `🆔 ${parsed.data.productId}`,
    `📞 ${parsed.data.phone}`,
    stored
      ? `✅ Saqlandi · ${stored.linked ? "Telegram klubga bogʻlangan — avtomatik xabar boradi" : "vaqti kelganda qoʻngʻiroq roʻyxati keladi"} · /admin/waitlist`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Plain text (a product name with "_" would break Markdown). With a stored
  // row the request is kept even if this alert does not arrive.
  const delivered = await notifyOperator(text);
  return delivered || stored ? { ok: true } : { ok: false, error: "unavailable" };
}
