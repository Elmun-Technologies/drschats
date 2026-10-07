"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { isOperatorChannelConfigured, notifyOperator } from "@/lib/notifications/operator";
import { redactPhone } from "@/lib/privacy";

/*
  "Tell me when it is back."

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
});

export type RestockResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rate_limited" | "unavailable" };

/**
 * Record a restock request with the people who can act on it.
 *
 * This used to be a console.log and an unconditional `ok`. The form beside it
 * tells the customer "we will let you know when it arrives", so a version that
 * stored nothing was not a stub — it was a promise the shop could not keep,
 * made to a person who had just handed over their phone number to trust it.
 *
 * Delivery goes to the same Telegram channel the orders go to
 * (`src/lib/notifications/operator.ts`), because that is where this business
 * already watches for things it has to act on. There is deliberately no
 * second queue and no new table: a request nobody reads is the same as a
 * request nobody receives.
 *
 * When no channel is configured the answer is `unavailable`, not `ok` — the
 * form then says so instead of thanking the customer for nothing.
 */
export async function notifyRestock(
  productId: string,
  productName: string,
  phone: string,
): Promise<RestockResult> {
  const parsed = restockSchema.safeParse({ productId, productName, phone });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const hdrs = await headers();
  if (!withinRateLimit("restock", clientIp(hdrs), RATE)) {
    return { ok: false, error: "rate_limited" };
  }

  if (!isOperatorChannelConfigured()) {
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
    `🔔 *Mahsulot kutilmoqda*`,
    `📦 ${parsed.data.productName}`,
    `🆔 \`${parsed.data.productId}\``,
    `📞 ${parsed.data.phone}`,
  ].join("\n");

  await notifyOperator(text, { markdown: true });
  return { ok: true };
}
