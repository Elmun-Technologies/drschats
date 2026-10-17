import "server-only";

import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { orders, visitorEvents, visitors, VISITOR_EVENT_TYPES, type CartSnapshotItem, type Touch } from "@/lib/db/schema";
import { STAGE_ORDER, deviceOf, furthestStage, safePath, touchOf } from "./model";

export const VISITOR_COOKIE = "gv_vid";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const eventSchema = z.object({
  type: z.enum(VISITOR_EVENT_TYPES).exclude(["purchase"]),
  path: z.string().max(600).optional(),
  slug: z.string().max(120).regex(/^[a-z0-9-]+$/).optional(),
  value: z.number().int().min(0).max(1_000_000_000).optional(),
  term: z.string().max(100).optional(),
});

export const batchSchema = z.object({
  sid: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  locale: z.enum(["uz", "ru"]).optional(),
  entry: z.object({ landing: z.string().max(2000), referrer: z.string().max(2000) }).optional(),
  events: z.array(eventSchema).max(25).default([]),
  cart: z
    .object({
      value: z.number().int().min(0).max(1_000_000_000),
      items: z
        .array(z.object({ slug: z.string().max(120), name: z.string().max(200), quantity: z.number().int().min(0).max(999), price: z.number().int().min(0).max(1_000_000_000) }))
        .max(50),
    })
    .optional(),
});

export type JourneyBatch = z.infer<typeof batchSchema>;

export function visitorIdFrom(cookie: string | undefined): string | null {
  return cookie && UUID_RE.test(cookie) ? cookie.toLowerCase() : null;
}

export function newVisitorId(): string {
  return randomUUID();
}

const stageArray = sql.raw(`ARRAY[${STAGE_ORDER.map((s) => `'${s}'`).join(",")}]::text[]`);

/** Stores one batch from the browser: the visitor row is upserted, then its events appended. */
export async function recordBatch(visitorId: string, batch: JourneyBatch, context: { userAgent: string; host: string }) {
  const db = getDb();
  const now = new Date();
  const touch: Touch | null = batch.entry ? touchOf(batch.entry.landing, batch.entry.referrer, context.host) : null;
  const stage = furthestStage("visit", batch.events);
  const pageViews = batch.events.filter((e) => e.type === "page_view").length;
  const cartItems: CartSnapshotItem[] | undefined = batch.cart?.items.filter((i) => i.quantity > 0);

  await db
    .insert(visitors)
    .values({
      id: visitorId,
      firstSeenAt: now,
      lastSeenAt: now,
      sessions: 1,
      lastSession: batch.sid,
      pageViews,
      locale: batch.locale ?? null,
      device: deviceOf(context.userAgent),
      firstTouch: touch ?? (batch.entry ? { landing: safePath(batch.entry.landing) } : null),
      lastTouch: touch,
      stage,
      cartValue: batch.cart?.value ?? 0,
      cartItems: cartItems ?? [],
      cartAt: batch.cart ? now : null,
    })
    .onConflictDoUpdate({
      target: visitors.id,
      set: {
        lastSeenAt: now,
        sessions: sql`${visitors.sessions} + case when ${visitors.lastSession} is distinct from ${batch.sid} then 1 else 0 end`,
        lastSession: batch.sid,
        pageViews: sql`${visitors.pageViews} + ${pageViews}`,
        locale: batch.locale ? batch.locale : sql`${visitors.locale}`,
        device: deviceOf(context.userAgent),
        firstTouch: sql`coalesce(${visitors.firstTouch}, excluded.first_touch)`,
        // A new session with a source moves the last touch; repeats of the same session's entry do not.
        lastTouch: touch ? sql`case when ${visitors.lastSession} is distinct from ${batch.sid} or ${visitors.lastTouch} is null then excluded.last_touch else ${visitors.lastTouch} end` : sql`${visitors.lastTouch}`,
        stage: sql`case when array_position(${stageArray}, excluded.stage) > array_position(${stageArray}, ${visitors.stage}) then excluded.stage else ${visitors.stage} end`,
        ...(batch.cart
          ? { cartValue: batch.cart.value, cartItems: cartItems ?? [], cartAt: now }
          : {}),
      },
    });

  if (batch.events.length === 0) return;
  await db.insert(visitorEvents).values(
    batch.events.map((event) => ({
      visitorId,
      sessionId: batch.sid,
      type: event.type,
      path: event.path ? safePath(event.path) : null,
      productSlug: event.slug ?? null,
      value: event.value ?? null,
      meta: event.term ? { term: event.term } : null,
      createdAt: now,
    })),
  );

  // Raw events older than ~13 months are dropped; the visitor row keeps the summary.
  if (Math.random() < 0.002) {
    await db.execute(sql`delete from visitor_events where created_at < now() - interval '400 days'`);
  }
}

/**
 * The order is the moment an anonymous visitor gets a name. Links the order to
 * the browser that placed it and records the purchase server-side, so it is
 * counted even when the browser never sends its own event.
 */
export async function linkOrderToVisitor(
  visitorId: string | null,
  order: { number: string; total: number; phone: string; name: string; items: { slug: string }[] },
): Promise<void> {
  if (!visitorId) return;
  const phone9 = order.phone.replace(/\D/g, "").slice(-9);
  const now = new Date();
  try {
    const db = getDb();
    await db
      .insert(visitors)
      .values({ id: visitorId, stage: "customer", phone9: phone9.length === 9 ? phone9 : null, name: order.name.slice(0, 120), ordersCount: 1, lastOrderAt: now })
      .onConflictDoUpdate({
        target: visitors.id,
        set: {
          stage: "customer",
          phone9: phone9.length === 9 ? phone9 : sql`${visitors.phone9}`,
          name: order.name.slice(0, 120),
          ordersCount: sql`${visitors.ordersCount} + 1`,
          lastOrderAt: now,
          lastSeenAt: now,
          cartValue: 0,
          cartItems: [],
          cartAt: null,
        },
      });
    await db.insert(visitorEvents).values({
      visitorId,
      sessionId: "server",
      type: "purchase",
      path: "/checkout",
      value: order.total,
      meta: { order: order.number, items: order.items.map((i) => i.slug).slice(0, 50) },
    });
    await db.update(orders).set({ visitorId }).where(sql`${orders.number} = ${order.number}`);
  } catch (err) {
    console.error("[journey] order link failed:", (err as Error).message);
  }
}
