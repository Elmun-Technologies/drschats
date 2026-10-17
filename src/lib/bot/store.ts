import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  botConfig,
  botJobs,
  botMembers,
  botOrderEvents,
  botTickets,
  orders,
  telegramLinks,
  type BotJobPayload,
  type OrderStatus,
  TICKET_CATEGORIES,
} from "@/lib/db/schema";
import { notifyOperator } from "@/lib/notifications/operator";
import { redactPhone } from "@/lib/privacy";
import { DEFAULT_CLUB, readClubConfig, type ClubConfig } from "./config";
import { orderStatusMessage, statusLabel, ticketReplyMessage } from "./messages";
import { normalizeUzPhone, phoneTail } from "./phone";

/*
  The club bot's data. The bot itself is stateless: everything it shows a
  customer is read here through /api/bot, and everything the site wants to
  tell a customer is queued in bot_jobs for the bot to deliver.
*/

type Locale = "uz" | "ru";
/** A job that keeps failing stops after this many deliveries. */
const MAX_ATTEMPTS = 8;
const LEASE = sql`interval '3 minutes'`;

const phoneTailSql = sql`right(regexp_replace(${orders.customer} ->> 'phone', '\\D', '', 'g'), 9)`;

// ── Settings ──────────────────────────────────────────────────────────────

export async function getClubConfig(): Promise<ClubConfig> {
  const [row] = await getDb().select().from(botConfig).where(eq(botConfig.id, 1)).limit(1);
  return row ? readClubConfig(row.data) : DEFAULT_CLUB;
}

export async function saveClubConfig(config: ClubConfig): Promise<void> {
  await getDb()
    .insert(botConfig)
    .values({ id: 1, data: config })
    .onConflictDoUpdate({ target: botConfig.id, set: { data: config, updatedAt: new Date() } });
}

// ── Members and links ─────────────────────────────────────────────────────

export async function startMember(chatId: number, locale: Locale, source?: string): Promise<void> {
  await getDb()
    .insert(botMembers)
    .values({ chatId, locale, source })
    .onConflictDoUpdate({
      target: botMembers.chatId,
      // A returning member is reachable again; the first source is kept.
      set: { locale, blockedAt: null, source: sql`coalesce(${botMembers.source}, excluded.source)` },
    });
}

export async function memberLocale(chatId: number): Promise<Locale | null> {
  const [m] = await getDb().select({ locale: botMembers.locale }).from(botMembers).where(eq(botMembers.chatId, chatId)).limit(1);
  return m?.locale ?? null;
}

export type LinkResult = { ok: true; phone: string } | { ok: false; error: "invalid_phone" | "identity_conflict" };

/**
 * Binds a chat to the phone number it shared. Telegram only lets a user share
 * their own contact through the button, and the bot checks contact.user_id,
 * so the link proves ownership. A phone already bound to another chat (or a
 * chat to another phone) is left alone and handed to the operator.
 */
export async function linkContact(input: { chatId: number; phone: string; name?: string; username?: string }): Promise<LinkResult> {
  const phone = normalizeUzPhone(input.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };
  const db = getDb();
  const existing = await db
    .select()
    .from(telegramLinks)
    .where(or(eq(telegramLinks.phone, phone), eq(telegramLinks.chatId, input.chatId)));
  if (existing.some((l) => l.phone !== phone || l.chatId !== input.chatId)) {
    await createTicket(input.chatId, "club-conflict", `Raqam ${redactPhone(phone)} boshqa Telegram hisobiga bogʻlangan. Tekshirish kerak.`);
    return { ok: false, error: "identity_conflict" };
  }
  await db
    .insert(telegramLinks)
    .values({ chatId: input.chatId, phone, name: input.name || null, username: input.username || null })
    .onConflictDoUpdate({ target: telegramLinks.chatId, set: { name: input.name || null, username: input.username || null } });
  return { ok: true, phone };
}

export async function linkOf(chatId: number) {
  const [link] = await getDb().select().from(telegramLinks).where(eq(telegramLinks.chatId, chatId)).limit(1);
  return link ?? null;
}

// ── Orders as the customer sees them ──────────────────────────────────────

/** Orders placed from this chat (Mini App) or with its linked phone number. */
function customerOrders(chatId: number, phone: string | null) {
  const byChat = eq(orders.telegramChatId, chatId);
  return phone ? or(byChat, sql`${phoneTailSql} = ${phoneTail(phone)}`)! : byChat;
}

type OrderRow = typeof orders.$inferSelect;

function orderOut(o: OrderRow, locale: Locale) {
  return {
    code: o.number,
    status: o.status,
    stage: statusLabel(o.status, locale),
    createdAt: o.createdAt,
    total: o.total,
    shipping: o.totals.shipping,
    delivery: { region: o.delivery.region, address: o.delivery.address ?? "", method: o.delivery.method },
    items: o.items.map((i) => ({ productId: i.productId, slug: i.slug, name: i.name, qty: i.quantity, unitPrice: i.unitPrice })),
  };
}

export async function ordersFor(chatId: number, limit: number, locale: Locale) {
  const link = await linkOf(chatId);
  const rows = await getDb()
    .select()
    .from(orders)
    .where(customerOrders(chatId, link?.phone ?? null))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  return rows.map((o) => orderOut(o, locale));
}

export async function orderFor(chatId: number, number: string, locale: Locale) {
  const link = await linkOf(chatId);
  const [o] = await getDb()
    .select()
    .from(orders)
    .where(and(eq(orders.number, number), customerOrders(chatId, link?.phone ?? null)))
    .limit(1);
  if (!o) return null;
  const events = await getDb()
    .select()
    .from(botOrderEvents)
    .where(eq(botOrderEvents.orderId, o.id))
    .orderBy(botOrderEvents.createdAt);
  return { ...orderOut(o, locale), timeline: events.map((e) => ({ stage: statusLabel(e.status, locale), at: e.createdAt })) };
}

// ── Tickets ───────────────────────────────────────────────────────────────

export async function createTicket(
  chatId: number,
  category: (typeof TICKET_CATEGORIES)[number],
  text: string,
): Promise<{ id: number }> {
  const [row] = await getDb().insert(botTickets).values({ chatId, category, text }).returning({ id: botTickets.id });
  // Plain text, like every operator message: a customer's "_" or "*" must not break it.
  await notifyOperator(`💬 Klub botidan murojaat #${row.id}\n\n${text.slice(0, 500)}\n\nJavob: /admin/bot/tickets`);
  return row;
}

export async function answerTicket(id: number, reply: string): Promise<boolean> {
  const db = getDb();
  const [ticket] = await db.select().from(botTickets).where(eq(botTickets.id, id)).limit(1);
  if (!ticket) return false;
  const locale = (await memberLocale(ticket.chatId)) ?? "uz";
  // One reply per ticket: a double submit enqueues the same job once.
  await enqueue(ticket.chatId, ticketReplyMessage(reply, locale), { kind: "support", dedupeKey: `ticket-reply:${id}` });
  await db.update(botTickets).set({ status: "answered", reply, answeredAt: new Date() }).where(eq(botTickets.id, id));
  return true;
}

export async function closeTicket(id: number): Promise<void> {
  await getDb().update(botTickets).set({ status: "closed" }).where(eq(botTickets.id, id));
}

// ── Outbox ────────────────────────────────────────────────────────────────

export async function enqueue(
  chatId: number,
  payload: BotJobPayload,
  options: { kind: string; dedupeKey: string },
): Promise<void> {
  await getDb()
    .insert(botJobs)
    .values({ chatId, payload, kind: options.kind, dedupeKey: options.dedupeKey })
    .onConflictDoNothing({ target: botJobs.dedupeKey });
}

export interface ClaimedJob {
  id: number;
  chatId: number;
  kind: string;
  payload: BotJobPayload;
  leaseToken: string;
}

/**
 * Leases up to `limit` due jobs to the bot. SKIP LOCKED lets two bot
 * processes claim side by side without taking the same job; an expired lease
 * (the bot died mid-send) makes the job claimable again.
 */
export async function claimJobs(limit: number): Promise<ClaimedJob[]> {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`
      update bot_jobs set status = 'failed', lease_token = null, leased_until = null
      where status = 'leased' and leased_until <= now() and attempts >= ${MAX_ATTEMPTS}`);
    await tx.execute(sql`
      update bot_jobs set status = 'blocked', lease_token = null, leased_until = null
      where status in ('pending', 'leased')
        and chat_id in (select chat_id from bot_members where blocked_at is not null)`);
    const rows = await tx.execute(sql`
      with due as (
        select id from bot_jobs
        where due_at <= now() and attempts < ${MAX_ATTEMPTS}
          and (status = 'pending' or (status = 'leased' and leased_until <= now()))
        order by id
        limit ${limit}
        for update skip locked
      )
      update bot_jobs j
      set status = 'leased',
          lease_token = replace(gen_random_uuid()::text, '-', ''),
          leased_until = now() + ${LEASE},
          attempts = j.attempts + 1
      from due where j.id = due.id
      returning j.id, j.chat_id, j.kind, j.payload, j.lease_token`);
    return (rows as unknown as { id: string | number; chat_id: string | number; kind: string; payload: BotJobPayload; lease_token: string }[]).map((r) => ({
      id: Number(r.id),
      chatId: Number(r.chat_id),
      kind: r.kind,
      payload: r.payload,
      leaseToken: r.lease_token,
    }));
  });
}

export type Receipt = { result: "sent" } | { result: "retry"; retryAfter: number } | { result: "blocked" };

/** The bot reports a delivery. False when the lease is unknown or has expired. */
export async function receipt(id: number, leaseToken: string, r: Receipt): Promise<boolean> {
  const db = getDb();
  const status =
    r.result === "sent"
      ? sql`'sent'`
      : r.result === "blocked"
        ? sql`'blocked'`
        : sql`case when attempts >= ${MAX_ATTEMPTS} then 'failed' else 'pending' end`;
  const rows = await db.execute(sql`
    update bot_jobs set
      status = ${status},
      lease_token = null,
      leased_until = null,
      sent_at = ${r.result === "sent" ? sql`now()` : sql`sent_at`},
      due_at = ${r.result === "retry" ? sql`now() + make_interval(secs => ${r.retryAfter})` : sql`due_at`}
    where id = ${id} and status = 'leased' and lease_token = ${leaseToken} and leased_until > now()
    returning chat_id`);
  const row = (rows as unknown as { chat_id: string | number }[])[0];
  if (!row) return false;
  if (r.result === "blocked") {
    await db
      .insert(botMembers)
      .values({ chatId: Number(row.chat_id), blockedAt: new Date() })
      .onConflictDoUpdate({ target: botMembers.chatId, set: { blockedAt: new Date() } });
  }
  return true;
}

// ── Order status → customer ───────────────────────────────────────────────

/**
 * Records a status the order reached and tells the customer in Telegram when
 * they can be reached there: the order came from the Mini App, or its phone
 * is linked to a chat. Never throws — the order change itself has happened.
 */
export async function announceOrderStatus(
  orderNumber: string,
  status: OrderStatus,
  /** Lines appended to the status text (HTML, already escaped) — points, the referral code. */
  extra?: { uz: string; ru: string } | null,
): Promise<void> {
  try {
    const db = getDb();
    const [o] = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1);
    if (!o) return;
    await db.insert(botOrderEvents).values({ orderId: o.id, status });

    let chatId = o.telegramChatId;
    if (!chatId) {
      const tail = phoneTail(o.customer.phone);
      const [link] = tail.length === 9
        ? await db.select().from(telegramLinks).where(sql`right(${telegramLinks.phone}, 9) = ${tail}`).limit(1)
        : [];
      chatId = link?.chatId ?? null;
    }
    if (!chatId || !(await getClubConfig()).enabled) return;

    const locale = (await memberLocale(chatId)) ?? (o.locale === "ru" ? "ru" : "uz");
    const message = orderStatusMessage(status, { number: orderNumber, total: o.total }, locale);
    if (extra?.[locale]) message.text = `${message.text}\n\n${extra[locale]}`;
    await enqueue(chatId, message, {
      kind: "order_status",
      dedupeKey: `order:${o.id}:${status}`,
    });
  } catch (err) {
    console.error("[bot] order status not queued:", (err as Error).message);
  }
}

/** The verified Mini App chat an order was placed from. */
export async function attachOrderChat(orderNumber: string, chatId: number): Promise<void> {
  await getDb()
    .update(orders)
    .set({ telegramChatId: chatId })
    .where(and(eq(orders.number, orderNumber), isNull(orders.telegramChatId)));
}

/**
 * A club message to every member who has not blocked the bot. They pressed
 * /start, which is their consent to hear from the club; the bot delivers about
 * one message a second, so a large club takes minutes, not seconds.
 */
export async function broadcast(id: string, payload: BotJobPayload): Promise<number> {
  const rows = await getDb().execute(sql`
    insert into bot_jobs (dedupe_key, chat_id, kind, payload)
    select ${"broadcast:" + id + ":"} || chat_id, chat_id, 'broadcast', ${JSON.stringify(payload)}::jsonb
    from bot_members where blocked_at is null
    on conflict (dedupe_key) do nothing
    returning id`);
  return (rows as unknown as unknown[]).length;
}

// ── Admin views ───────────────────────────────────────────────────────────

export async function clubOverview() {
  const rows = await getDb().execute(sql`
    select
      (select count(*) from bot_members) as members,
      (select count(*) from bot_members where blocked_at is not null) as blocked,
      (select count(*) from telegram_links) as linked,
      (select count(*) from bot_tickets where status = 'open') as open_tickets,
      (select count(*) from bot_jobs where status in ('pending', 'leased')) as pending_jobs,
      (select count(*) from bot_jobs where status = 'failed') as failed_jobs,
      (select count(*) from orders where telegram_chat_id is not null) as mini_app_orders`);
  const r = (rows as unknown as Record<string, string | number>[])[0] ?? {};
  return {
    members: Number(r.members ?? 0),
    blocked: Number(r.blocked ?? 0),
    linked: Number(r.linked ?? 0),
    openTickets: Number(r.open_tickets ?? 0),
    pendingJobs: Number(r.pending_jobs ?? 0),
    failedJobs: Number(r.failed_jobs ?? 0),
    miniAppOrders: Number(r.mini_app_orders ?? 0),
  };
}

export async function listTickets(status: "open" | "all", limit = 100) {
  const db = getDb();
  const rows = await db
    .select({ t: botTickets, phone: telegramLinks.phone, name: telegramLinks.name, username: telegramLinks.username })
    .from(botTickets)
    .leftJoin(telegramLinks, eq(telegramLinks.chatId, botTickets.chatId))
    .where(status === "open" ? eq(botTickets.status, "open") : undefined)
    .orderBy(desc(botTickets.createdAt))
    .limit(limit);
  return rows;
}

export async function listMembers(limit = 200) {
  return getDb()
    .select({ m: botMembers, phone: telegramLinks.phone, name: telegramLinks.name, username: telegramLinks.username, linkedAt: telegramLinks.linkedAt })
    .from(botMembers)
    .leftJoin(telegramLinks, eq(telegramLinks.chatId, botMembers.chatId))
    .orderBy(desc(botMembers.createdAt))
    .limit(limit);
}

export async function listJobs(limit = 100) {
  return getDb().select().from(botJobs).orderBy(desc(botJobs.id)).limit(limit);
}

/**
 * Sends a failed or blocked message again. Clears the member's blocked mark:
 * if they still block the bot, the next delivery sets it again.
 */
export async function retryJob(id: number): Promise<boolean> {
  const rows = await getDb()
    .update(botJobs)
    .set({ status: "pending", attempts: 0, dueAt: new Date(), leaseToken: null, leasedUntil: null })
    .where(and(eq(botJobs.id, id), inArray(botJobs.status, ["failed", "blocked"])))
    .returning({ chatId: botJobs.chatId });
  if (!rows[0]) return false;
  await getDb().update(botMembers).set({ blockedAt: null }).where(eq(botMembers.chatId, rows[0].chatId));
  return true;
}
