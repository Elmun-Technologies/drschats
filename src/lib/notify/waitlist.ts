import { and, eq, gt, inArray, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { deals, products, restockRequests, type WaitChannel, type WaitKind } from "@/lib/db/schema";
import { dealPrice } from "@/lib/catalog/deals";
import { normalizeUzPhone } from "@/lib/bot/phone";
import { siteOrigin } from "@/lib/email/config";
import { dueRequests, phone9Of } from "@/lib/catalog/stock-rules";
import { customerChannels, linkedChat, operatorNotifier } from "./channels";
import { enqueueRestockMessage } from "@/lib/flows/restock";
import { waitlistUrl } from "./messages";
import type { WaitMessage } from "./types";

/*
  "Tell me when it is back" / "when it is cheaper", stored and acted on.

  A request is a row (restock_requests). When the product comes back in stock
  or its price falls below what the customer saw, every due request is
  claimed, offered to the customer channels in order (Telegram, then SMS once
  it exists) and whatever none of them accepted goes to the operator as a
  call list. A row is marked notified with the channel that took it; a row
  no channel took goes back to waiting.
*/

/*
  The price the shop sells at right now — what the storefront shows and the
  checkout charges: an expired sale is back at its old price and a running
  deal of the day applies (lib/catalog/deals.ts). The bare column is only the
  base price, so a "back in stock, 265 950 soʻm" text during a −20% deal
  quoted a price nobody pays.
*/
async function sellingPrice(p: { slug: string; price: number; oldPrice: number | null; saleEndsAt: Date | null }): Promise<number> {
  const now = new Date();
  const running = await getDb()
    .select()
    .from(deals)
    .where(and(eq(deals.productSlug, p.slug), lte(deals.startsAt, now), gt(deals.endsAt, now)))
    .catch(() => []);
  return dealPrice(
    { slug: p.slug, price: p.price, oldPrice: p.oldPrice ?? undefined, saleEndsAt: p.saleEndsAt?.toISOString() },
    running.map((d) => ({ id: d.id, productSlug: d.productSlug, percent: d.percent, price: d.price, startsAt: d.startsAt.toISOString(), endsAt: d.endsAt.toISOString() })),
    now.getTime(),
  ).price;
}

export interface NewWaitRequest {
  productId: string;
  phone: string;
  locale: "uz" | "ru";
  kind: WaitKind;
}

/** Stores (or refreshes) a waiting request. Null when the product is not in the database (a search query, the built-in catalogue). */
export async function createWaitRequest(input: NewWaitRequest): Promise<{ id: number; linked: boolean } | null> {
  const phone9 = phone9Of(input.phone);
  if (!phone9) return null;
  const db = getDb();
  const [product] = await db
    .select({ id: products.id, slug: products.slug, price: products.price, oldPrice: products.oldPrice, saleEndsAt: products.saleEndsAt })
    .from(products)
    .where(eq(products.id, input.productId))
    .limit(1);
  if (!product) return null;
  const phone = normalizeUzPhone(input.phone) ?? input.phone.replace(/\D/g, "");
  const chatId = await linkedChat(phone9).catch(() => null);
  const target = input.kind === "price_drop" ? await sellingPrice(product) : null;
  const rows = (await db.execute(sql`
    insert into restock_requests (product_id, product_slug, phone9, phone, locale, kind, target_price, telegram_chat_id)
    values (${product.id}, ${product.slug}, ${phone9}, ${phone}, ${input.locale}, ${input.kind}, ${target}, ${chatId})
    on conflict (product_id, phone9, kind) where status = 'waiting'
    do update set locale = excluded.locale,
                  telegram_chat_id = coalesce(excluded.telegram_chat_id, restock_requests.telegram_chat_id),
                  target_price = excluded.target_price
    returning id`)) as unknown as { id: string | number }[];
  return { id: Number(rows[0].id), linked: chatId != null };
}

export interface DispatchResult {
  due: number;
  byChannel: Partial<Record<WaitChannel, number>>;
  /** Due but no channel accepted (operator channel not configured either). */
  left: number;
}

const EMPTY: DispatchResult = { due: 0, byChannel: {}, left: 0 };

/**
 * Notifies everyone the product's current state answers. Safe to call any
 * time and twice: rows are claimed with a conditional update, and Telegram
 * jobs carry the request id as their dedupe key.
 */
export async function notifyWaitlist(productId: string): Promise<DispatchResult> {
  const db = getDb();
  const [product] = await db
    .select({
      id: products.id,
      slug: products.slug,
      price: products.price,
      oldPrice: products.oldPrice,
      saleEndsAt: products.saleEndsAt,
      inStock: products.inStock,
      kind: products.kind,
      content: products.content,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product || product.kind === "unlisted") return EMPTY;
  const price = await sellingPrice(product);

  const waiting = await db
    .select()
    .from(restockRequests)
    .where(and(eq(restockRequests.productId, productId), eq(restockRequests.status, "waiting")));
  const due = dueRequests(waiting, { inStock: product.inStock, price });
  if (due.length === 0) return EMPTY;

  const claimed = await db
    .update(restockRequests)
    .set({ status: "notified", notifiedAt: new Date() })
    .where(and(inArray(restockRequests.id, due.map((r) => r.id)), eq(restockRequests.status, "waiting")))
    .returning();
  if (claimed.length === 0) return EMPTY;

  const origin = siteOrigin();
  const messages: WaitMessage[] = claimed.map((r) => ({
    requestId: r.id,
    kind: r.kind,
    locale: r.locale === "ru" ? "ru" : "uz",
    phone: r.phone,
    phone9: r.phone9,
    slug: product.slug,
    chatId: r.telegramChatId,
    productName: product.content.name[r.locale === "ru" ? "ru" : "uz"] || product.content.name.uz,
    price,
    before: r.targetPrice,
    url: waitlistUrl(origin, r.locale === "ru" ? "ru" : "uz", product.slug, r.kind, "telegram"),
  }));

  const via = new Map<number, WaitChannel>();

  /*
    "Omborga keldi" goes through the restock flow first: it respects quiet
    hours, opt-out and the outbox, and it is the one flow an admin can edit.
    When the flow is switched off (or has no steps) the direct channels below
    are exactly what shipped before — nothing changes for a deployment that
    never turns it on.
  */
  for (const m of messages) {
    if (m.kind !== "restock") continue;
    try {
      const handled = await enqueueRestockMessage({
        phone: m.phone,
        productSlug: m.slug,
        productName: m.productName,
        locale: m.locale,
        restockId: String(m.requestId),
      });
      if (handled) via.set(m.requestId, "flow");
    } catch (err) {
      console.error("[notify] restock flow failed:", (err as Error).message);
    }
  }

  const channels = customerChannels();
  for (const m of messages) {
    if (via.has(m.requestId)) continue;
    for (const channel of channels) {
      const outcome = await channel.send(m);
      if (outcome.ok) {
        via.set(m.requestId, channel.channel);
        break;
      }
    }
  }

  const leftovers = messages.filter((m) => !via.has(m.requestId));
  for (const kind of ["restock", "price_drop"] as const) {
    const group = leftovers.filter((m) => m.kind === kind);
    if (group.length > 0 && (await operatorNotifier.sendAll(group)).ok) {
      for (const m of group) via.set(m.requestId, "operator");
    }
  }

  const byChannel: DispatchResult["byChannel"] = {};
  for (const [id, channel] of via) {
    byChannel[channel] = (byChannel[channel] ?? 0) + 1;
    await db.update(restockRequests).set({ notifiedVia: channel }).where(eq(restockRequests.id, id));
  }
  const unsent = claimed.filter((r) => !via.has(r.id)).map((r) => r.id);
  if (unsent.length > 0) {
    // Nobody was told: back to waiting — unless the customer asked again meanwhile (that row waits instead).
    await db.execute(sql`
      update restock_requests r set status = 'waiting', notified_at = null
      where r.id in (${sql.join(unsent.map((id) => sql`${id}`), sql`, `)})
        and not exists (
          select 1 from restock_requests o
          where o.product_id = r.product_id and o.phone9 = r.phone9 and o.kind = r.kind and o.status = 'waiting' and o.id <> r.id)`);
  }
  return { due: claimed.length, byChannel, left: unsent.length };
}

/**
 * The hook every stock or price change calls: back in stock or cheaper →
 * the waitlist hears about it. Never throws; the change itself has happened.
 */
export async function afterProductChange(
  productId: string,
  before: { inStock: boolean; price: number },
  after: { inStock: boolean; price: number },
): Promise<DispatchResult | null> {
  const backInStock = !before.inStock && after.inStock;
  const cheaper = after.inStock && after.price < before.price;
  if (!backInStock && !cheaper) return null;
  try {
    return await notifyWaitlist(productId);
  } catch (err) {
    console.error("[notify] waitlist dispatch failed:", (err as Error).message);
    return null;
  }
}

export async function cancelWaitRequest(id: number): Promise<void> {
  await getDb()
    .update(restockRequests)
    .set({ status: "cancelled" })
    .where(and(eq(restockRequests.id, id), eq(restockRequests.status, "waiting")));
}
