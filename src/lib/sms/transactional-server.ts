import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, siteSettings } from "@/lib/db/schema";
import { SITE_HOST } from "@/lib/config/site";
import { BRAND } from "@/lib/brand";
import { queueMessage } from "@/lib/messaging/outbox";
import { orderTrackToken } from "@/lib/messaging/tokens";
import { announceOrderStatus } from "@/lib/bot/store";
import type { OrderStatus } from "@/lib/db/schema";
import {
  TRANSACTIONAL_SMS_KEY,
  TRANSACTIONAL_SMS_OFF,
  isOrderSmsEvent,
  orderSmsText,
  parseTransactionalSms,
  smsHasLink,
  smsWanted,
  type TransactionalSmsSettings,
} from "./transactional";

/** Uncached: read once per status change, and the admin screen must see its own save. */
export async function readTransactionalSms(): Promise<TransactionalSmsSettings> {
  try {
    const [row] = await getDb().select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, TRANSACTIONAL_SMS_KEY)).limit(1);
    return parseTransactionalSms(row?.value);
  } catch {
    return TRANSACTIONAL_SMS_OFF;
  }
}

export async function saveTransactionalSms(settings: TransactionalSmsSettings, adminUserId: number): Promise<void> {
  const value = JSON.stringify(settings);
  await getDb()
    .insert(siteSettings)
    .values({ key: TRANSACTIONAL_SMS_KEY, value, updatedBy: adminUserId })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: adminUserId, updatedAt: new Date() } });
}

/** Queues the order SMS for this status, when it is switched on. Returns whether one was queued. */
export async function queueOrderSms(orderNumber: string, status: string): Promise<boolean> {
  if (!isOrderSmsEvent(status)) return false;
  if (!smsWanted(status, await readTransactionalSms())) return false;
  const db = getDb();
  const [o] = await db
    .select({ customer: orders.customer, locale: orders.locale })
    .from(orders)
    .where(eq(orders.number, orderNumber))
    .limit(1);
  const digits = o?.customer.phone.replace(/\D/g, "") ?? "";
  if (!o || digits.length < 9) return false;
  const locale = o.locale === "ru" ? "ru" : "uz";
  const id = await queueMessage(db, {
    kind: "transactional",
    channel: "sms",
    phone9: digits.slice(-9),
    locale,
    text: orderSmsText(status, { number: orderNumber, phone: BRAND.contact.phone }, locale),
    // Without https:// — phones link "www.govita.uz/…" anyway, and it saves an SMS part.
    link: smsHasLink(status) ? `${SITE_HOST}/${locale}/track/${orderTrackToken(orderNumber)}` : null,
    // One SMS per order and status, however many times an operator clicks.
    dedupeKey: `order-sms:${orderNumber}:${status}`,
  });
  return id !== null;
}

/*
  The one way a customer hears about their order: Telegram when they are in
  the club (no cost, richer message), otherwise an SMS — never both. Every
  status change goes through here: the checkout receipt and both admin paths.
*/
export async function notifyCustomerOfOrder(
  orderNumber: string,
  status: OrderStatus,
  extra?: { uz: string; ru: string } | null,
): Promise<void> {
  const viaTelegram = await announceOrderStatus(orderNumber, status, extra);
  if (viaTelegram) return;
  await queueOrderSms(orderNumber, status).catch((err: Error) => console.error(`[sms] order ${orderNumber} ${status} not queued:`, err.message));
}
