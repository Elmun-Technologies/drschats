/*
  Messages to the shop, not to the customer.

  The Telegram group is where this business already watches its orders, so
  every server-side event worth a human's attention lands there. Failures are
  swallowed on purpose: a notification that does not arrive must never be the
  reason an order, a subscription or a sign-up fails.
*/

const API = "https://api.telegram.org";
const TIMEOUT_MS = 5000;

export function isOperatorChannelConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function notifyOperator(text: string, options?: { markdown?: boolean }): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(options?.markdown ? { parse_mode: "Markdown" } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    // See the note above: never surfaced to the customer.
  }
}

/**
 * A message to one customer's own Telegram chat.
 *
 * Requires their chat id, which only exists once they have started a
 * conversation with the bot (see src/lib/notifications/telegram-link.ts).
 */
export async function notifyCustomer(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
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
