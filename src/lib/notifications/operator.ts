/*
  Messages to the shop, not to the customer.

  The Telegram group is where this business already watches its orders, so
  every server-side event worth a human's attention lands there. Failures are
  swallowed on purpose: a notification that does not arrive must never be the
  reason an order, a subscription or a sign-up fails.
*/

import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";

const API = "https://api.telegram.org";
const TIMEOUT_MS = 4000;

export async function isOperatorChannelConfigured(): Promise<boolean> {
  const { operatorBotToken, operatorChatId } = await getRuntimeIntegrationSettings();
  return Boolean(operatorBotToken && operatorChatId);
}

const ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends to the operator group. Resolves to whether Telegram accepted the message; never throws.
 *
 * A new order is announced only here, so one dropped packet or a Telegram 5xx
 * used to lose it silently. Network errors, 429 and 5xx are retried (three
 * attempts, Telegram's retry_after honoured up to 3 s); a 4xx is final — the
 * same request would be refused again.
 */
export async function notifyOperator(text: string, options?: { markdown?: boolean }): Promise<boolean> {
  const { operatorBotToken: token, operatorChatId: chatId } = await getRuntimeIntegrationSettings();
  if (!token || !chatId) return false;
  // Telegram refuses a message over 4096 characters — a 50-line order can be one.
  for (const part of splitForTelegram(text)) {
    if (!(await sendOnce(token, chatId, part, options))) return false;
  }
  return true;
}

const TELEGRAM_LIMIT = 4000;

/** Splits at line breaks into parts Telegram accepts; a single over-long line is cut. */
export function splitForTelegram(text: string, limit = TELEGRAM_LIMIT): string[] {
  if (text.length <= limit) return [text];
  const parts: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    for (let i = 0; i < line.length || i === 0; i += limit) {
      const piece = line.slice(i, i + limit);
      if (current && current.length + 1 + piece.length > limit) {
        parts.push(current);
        current = piece;
      } else {
        current = current ? `${current}\n${piece}` : piece;
      }
      if (line.length === 0) break;
    }
  }
  if (current) parts.push(current);
  return parts;
}

async function sendOnce(token: string, chatId: string, text: string, options?: { markdown?: boolean }): Promise<boolean> {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    let wait = 400 * attempt;
    try {
      const res = await fetch(`${API}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...(options?.markdown ? { parse_mode: "Markdown" } : {}),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) return true;
      if (res.status !== 429 && res.status < 500) {
        console.error(`[operator] Telegram refused the message: HTTP ${res.status}`);
        return false;
      }
      const retryAfter = Number((await res.json().catch(() => null))?.parameters?.retry_after);
      if (Number.isFinite(retryAfter) && retryAfter > 0) wait = Math.min(retryAfter * 1000, 3000);
      console.error(`[operator] Telegram HTTP ${res.status}, attempt ${attempt}/${ATTEMPTS}`);
    } catch (err) {
      // See the note above: never surfaced to the customer.
      console.error(`[operator] Telegram unreachable, attempt ${attempt}/${ATTEMPTS}:`, err instanceof Error ? err.name : "error");
    }
    if (attempt < ATTEMPTS) await sleep(wait);
  }
  return false;
}

/**
 * A message to one customer's own Telegram chat.
 *
 * Requires their chat id, which only exists once they have started a
 * conversation with the bot (see src/lib/notifications/telegram-link.ts).
 */
export async function notifyCustomer(chatId: string, text: string): Promise<boolean> {
  const { operatorBotToken: token } = await getRuntimeIntegrationSettings();
  if (!token || !chatId) return false;

  try {
    const response = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}
