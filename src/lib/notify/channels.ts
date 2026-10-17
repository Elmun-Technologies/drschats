import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { telegramLinks } from "@/lib/db/schema";
import { enqueue, getClubConfig } from "@/lib/bot/store";
import { escapeHtml } from "@/lib/bot/messages";
import { notifyOperator } from "@/lib/notifications/operator";
import { queueMessage } from "@/lib/messaging/outbox";
import { isOptedOut } from "@/lib/messaging/optout";
import { resolveSmsProvider } from "@/lib/sms";
import { OPEN_PRODUCT, operatorCallList, waitlistSmsText, waitlistText } from "./messages";
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
  SMS: through the marketing outbox (lib/messaging), so quiet hours, opt-out
  and the STOP line apply as to every other SMS. Declines when no gateway is
  configured, and the request falls through to the operator. It declines a
  phone that turned SMS off too: the outbox would only skip that message,
  the request would read "notified" and nobody would call — the operator's
  call list gets the customer instead. The request id is the dedupe key, so
  a second dispatch never sends a second SMS.
*/
export const smsNotifier: Notifier = {
  channel: "sms",
  async send(m: WaitMessage): Promise<Outcome> {
    try {
      const { provider } = await resolveSmsProvider();
      if (!provider) return { ok: false, reason: "not_configured" };
      if (m.phone9.length !== 9) return { ok: false, reason: "no_recipient" };
      if (await isOptedOut(getDb(), m.phone9, "sms")) return { ok: false, reason: "no_recipient" };
      // The short /r/ link sets utm_source itself; the path keeps medium and campaign.
      const target = new URL(m.url);
      target.searchParams.delete("utm_source");
      await queueMessage(getDb(), {
        channel: "sms",
        phone9: m.phone9,
        locale: m.locale,
        text: waitlistSmsText(m),
        link: `${target.pathname}${target.search}`,
        dedupeKey: `waitlist:${m.requestId}`,
      });
      return { ok: true };
    } catch (err) {
      console.error("[waitlist] sms queue failed:", (err as Error).message);
      return { ok: false, reason: "failed" };
    }
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
