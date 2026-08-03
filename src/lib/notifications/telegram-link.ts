/*
  Telegram as a marketing channel.

  In this market Telegram is where people actually read messages, so it earns
  its place next to email. Reaching someone there needs their chat id, and the
  only way to get one is for them to open a conversation with the bot — which
  is why this is a link out rather than a switch that starts sending.

  The bot itself is an operator task (see docs/MARKETING.md). Until
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME names one, the channel is not offered at
  all: an unchecked box promising messages that can never arrive is worse than
  no box.
*/

export function telegramBotUsername(): string | null {
  const raw = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();
  if (!raw) return null;
  return raw.replace(/^@/, "");
}

/**
 * Deep link that opens the bot and sends `/start`.
 *
 * `payload` is echoed back to the bot by Telegram, which is how a chat gets
 * tied to an account without asking anyone to type an id. It has to survive a
 * URL and Telegram's own 64-character limit, so anything longer is dropped
 * rather than truncated into something that will not match.
 */
export function telegramConnectUrl(payload?: string): string | null {
  const username = telegramBotUsername();
  if (!username) return null;
  const safe = payload && /^[\w-]{1,64}$/.test(payload) ? `?start=${payload}` : "";
  return `https://t.me/${username}${safe}`;
}
