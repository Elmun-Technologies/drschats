import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { telegramLinks } from "@/lib/db/schema";
import { enqueue, getClubConfig } from "@/lib/bot/store";
import { escapeHtml } from "@/lib/bot/messages";
import { notifyOperator } from "@/lib/notifications/operator";
import { OPEN_PRODUCT, operatorCallList, waitlistText } from "./messages";
import type { FallbackNotifier, Notifier, Outcome, WaitMessage } from "./types";

/** The Telegram chat linked to this phone in the club bot, if any. */
export async function linkedChat(phone9: string): Promise<number | null> {
  const [link] = await getDb()
    .select({ chatId: telegramLinks.chatId })
    .from(telegramLinks)
    .where(sql`right(${telegramLinks.phone}, 9) = ${phone9}`)
    .limit(1);
  return link?.chatId ?? null;
}

/*
  Telegram: through the club bot's outbox (bot_jobs), like order statuses.
  The dedupe key is the request id, so a second dispatch of the same request
  never queues a second message. Accepted = queued; the bot delivers it.
*/
export const telegramNotifier: Notifier = {
  channel: "telegram",
  async send(m: WaitMessage): Promise<Outcome> {
    try {
      if (!(await getClubConfig()).enabled) return { ok: false, reason: "not_configured" };
      const chatId = m.chatId ?? (await linkedChat(m.phone9));
      if (!chatId) return { ok: false, reason: "no_recipient" };
      await enqueue(
        chatId,
        { text: escapeHtml(waitlistText(m)), buttons: [[{ text: OPEN_PRODUCT[m.locale], url: m.url }]] },
        { kind: m.kind === "price_drop" ? "price_drop" : "restock", dedupeKey: `restock:${m.requestId}` },
      );
      return { ok: true };
    } catch (err) {
      console.error("[notify] telegram enqueue failed:", (err as Error).message);
      return { ok: false, reason: "failed" };
    }
  },
};

/*
  SMS — the next phase. The provider (Eskiz / Play Mobile) plugs in here:
  read its credentials, send `waitlistText(m)` with an `utm_source=sms` link
  to `m.phone`, answer { ok: true } when the provider accepts. Until then it
  declines, and the request falls through to the operator.
*/
export const smsNotifier: Notifier = {
  channel: "sms",
  async send(): Promise<Outcome> {
    return { ok: false, reason: "not_configured" };
  },
};

/** The operator group: one message per product and kind listing who to call. */
export const operatorNotifier: FallbackNotifier = {
  channel: "operator",
  async sendAll(messages: WaitMessage[]): Promise<Outcome> {
    if (messages.length === 0) return { ok: true };
    const delivered = await notifyOperator(operatorCallList(messages));
    return delivered ? { ok: true } : { ok: false, reason: "not_configured" };
  },
};

/** Customer channels, in the order they are tried. */
export function customerChannels(): Notifier[] {
  return [telegramNotifier, smsNotifier];
}
