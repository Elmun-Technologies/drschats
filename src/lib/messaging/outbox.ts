import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { botJobs, type BotJobPayload, type MessageChannel, type MessagePromo } from "@/lib/db/schema";
import { SITE_HOST, SITE_URL } from "@/lib/config/site";
import { getClubConfig } from "@/lib/bot/store";
import { escapeHtml } from "@/lib/bot/messages";
import { issuePromoCode } from "@/lib/promo/server";
import { prepareSmsText } from "@/lib/sms/segments";
import { resolveSmsProvider, type ResolvedSms } from "@/lib/sms";
import { MAX_SEND_ATTEMPTS, retryDelayMinutes } from "@/lib/flows/schedule";
import type { StepChannel } from "@/lib/flows/types";
import { isOptedOut } from "./optout";
import { isQuietHours, nextSendWindow } from "./quiet-hours";
import { finalizeText, formatExpiry, withOptOut, type MessageLocale } from "./template";
import { botJobKey } from "./keys";
import { clickToken, stopToken } from "./tokens";

/*
  The message outbox — every marketing SMS and Telegram message, from flows
  and from manual campaigns, is a row in outbound_messages first.

  Why one table for both channels: quiet hours, opt-out, the personal promo
  code, the short click link and the attribution all apply to a message
  regardless of how it travels. Telegram delivery itself stays with the club
  bot — at send time the row is handed to bot_jobs (the bot's outbox, which
  it polls and delivers) and keeps the bot_job_id, so "delivered" for
  Telegram is read from there. SMS goes straight to the gateway from here.

  Exactly-once, as far as a gateway allows it:
  - dedupe_key is unique, so queueing the same flow step or campaign
    recipient twice is a no-op;
  - a worker claims rows (pending → sending, claimed_at) inside a short
    transaction holding pg_try_advisory_xact_lock and FOR UPDATE SKIP LOCKED,
    then sends outside it;
  - a row left in 'sending' by a crash is marked failed, never resent — the
    gateway may already have delivered it.
*/

type Db = ReturnType<typeof getDb>;
type Exec = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];
type Row = Record<string, unknown>;

const OUTBOX_LOCK = 7_340_010;
const CLAIM_TIMEOUT = sql`interval '10 minutes'`;

export interface QueueMessage {
  channel: MessageChannel;
  phone9: string | null;
  chatId?: number | null;
  locale: MessageLocale;
  text: string;
  link?: string | null;
  promo?: MessagePromo | null;
  flowId?: string | null;
  flowStep?: number | null;
  enrollmentId?: number | null;
  campaignId?: number | null;
  dedupeKey: string;
  scheduledAt?: Date;
  /** Recorded as skipped (with this reason) instead of being sent — visible in the log. */
  skip?: string;
}

/** Inserts one message; returns its id, or null when the dedupe key was already queued. */
export async function queueMessage(exec: Exec, m: QueueMessage): Promise<number | null> {
  const rows = (await exec.execute(sql`
    insert into outbound_messages
      (channel, phone9, chat_id, locale, text, link, promo, flow_id, flow_step, enrollment_id, campaign_id, dedupe_key, scheduled_at, status, error)
    values (${m.channel}, ${m.phone9}, ${m.chatId ?? null}, ${m.locale}, ${m.text.slice(0, 2000)}, ${m.link || null},
            ${m.promo ? JSON.stringify(m.promo) : null}::jsonb, ${m.flowId ?? null}, ${m.flowStep ?? null}, ${m.enrollmentId ?? null},
            ${m.campaignId ?? null}, ${m.dedupeKey}, ${(m.scheduledAt ?? new Date()).toISOString()}::timestamptz,
            ${m.skip ? "skipped" : "pending"}, ${m.skip ?? null})
    on conflict (dedupe_key) do nothing
    returning id`)) as unknown as { id: string | number }[];
  return rows[0] ? Number(rows[0].id) : null;
}

export type Reach =
  | { channel: "telegram"; chatId: number; phone9: string }
  | { channel: "sms"; phone9: string }
  | { channel: null; reason: string };

export interface ReachContext {
  smsAvailable: boolean;
  clubEnabled: boolean;
}

export async function reachContext(): Promise<ReachContext> {
  const [sms, club] = await Promise.all([resolveSmsProvider().catch(() => null), getClubConfig().catch(() => null)]);
  return { smsAvailable: Boolean(sms?.provider), clubEnabled: Boolean(club?.enabled) };
}

/** How a customer can be reached on a step's channel: Telegram when linked and not blocked, SMS otherwise. */
export async function resolveReach(exec: Exec, phone9: string, want: StepChannel, ctx: ReachContext): Promise<Reach> {
  if (want !== "sms" && ctx.clubEnabled && !(await isOptedOut(exec, phone9, "telegram"))) {
    const rows = (await exec.execute(sql`
      select l.chat_id from telegram_links l
      left join bot_members m on m.chat_id = l.chat_id
      where right(l.phone, 9) = ${phone9} and m.blocked_at is null
      limit 1`)) as unknown as { chat_id: string | number }[];
    if (rows[0]) return { channel: "telegram", chatId: Number(rows[0].chat_id), phone9 };
  }
  if (want === "telegram") return { channel: null, reason: "no_telegram" };
  if (!ctx.smsAvailable) return { channel: null, reason: "sms_not_configured" };
  if (await isOptedOut(exec, phone9, "sms")) return { channel: null, reason: "opted_out" };
  return { channel: "sms", phone9 };
}

/** The attribution key a message's links and codes carry: flow-<id> or campaign-<id>. */
export function attributionKey(row: { flowId?: string | null; campaignId?: number | null }): string | null {
  if (row.flowId) return `flow-${row.flowId}`;
  if (row.campaignId) return `campaign-${row.campaignId}`;
  return null;
}

/** SMS shows the bare host (characters cost money, phones link it anyway); Telegram gets the full URL. */
export function shortLink(messageId: number, full = false): string {
  return `${full ? SITE_URL : SITE_HOST}/r/${clickToken(messageId)}`;
}

export function stopLink(phone9: string, channel: MessageChannel, locale: MessageLocale, full = false): string {
  return `${full ? SITE_URL : SITE_HOST}/s/${stopToken({ phone9, channel, locale })}`;
}

interface Claimed {
  id: number;
  channel: MessageChannel;
  phone9: string | null;
  chatId: number | null;
  locale: MessageLocale;
  text: string;
  link: string | null;
  promo: MessagePromo | null;
  promoCode: string | null;
  flowId: string | null;
  flowStep: number | null;
  campaignId: number | null;
  attempts: number;
}

function claimedOf(r: Row): Claimed {
  return {
    id: Number(r.id),
    channel: r.channel as MessageChannel,
    phone9: (r.phone9 as string) ?? null,
    chatId: r.chat_id == null ? null : Number(r.chat_id),
    locale: r.locale === "ru" ? "ru" : "uz",
    text: String(r.text),
    link: (r.link as string) ?? null,
    promo: (r.promo as MessagePromo) ?? null,
    promoCode: (r.promo_code as string) ?? null,
    flowId: (r.flow_id as string) ?? null,
    flowStep: r.flow_step == null ? null : Number(r.flow_step),
    campaignId: r.campaign_id == null ? null : Number(r.campaign_id),
    attempts: Number(r.attempts ?? 0),
  };
}

export interface DrainResult {
  locked: boolean;
  deferred: number;
  sent: number;
  failed: number;
  skipped: number;
  retried: number;
}

type Outcome =
  | { status: "sent"; text: string; providerRef?: string | null; botJobId?: number | null }
  | { status: "skipped"; error: string }
  | { status: "retry" | "failed"; error: string };

async function finish(m: Claimed, outcome: Outcome, now: Date): Promise<keyof Omit<DrainResult, "locked" | "deferred">> {
  const db = getDb();
  if (outcome.status === "sent") {
    await db.execute(sql`
      update outbound_messages set status = 'sent', text = ${outcome.text.slice(0, 2000)}, sent_at = now(), error = null,
        provider_ref = ${outcome.providerRef ?? null}, bot_job_id = ${outcome.botJobId ?? null}
      where id = ${m.id} and status = 'sending'`);
    return "sent";
  }
  if (outcome.status === "skipped") {
    await db.execute(sql`update outbound_messages set status = 'skipped', error = ${outcome.error} where id = ${m.id} and status = 'sending'`);
    return "skipped";
  }
  const final = outcome.status === "failed" || m.attempts >= MAX_SEND_ATTEMPTS;
  const retryAt = new Date(now.getTime() + retryDelayMinutes(m.attempts) * 60_000);
  await db.execute(sql`
    update outbound_messages set
      status = ${final ? "failed" : "pending"}, error = ${outcome.error.slice(0, 300)},
      scheduled_at = ${final ? sql`scheduled_at` : sql`${retryAt.toISOString()}::timestamptz`}
    where id = ${m.id} and status = 'sending'`);
  return final ? "failed" : "retried";
}

async function ensurePromo(m: Claimed): Promise<{ code: string; endsAt: Date | null } | null> {
  if (!m.promo || !m.phone9) return null;
  const db = getDb();
  if (m.promoCode) {
    const rows = (await db.execute(sql`select ends_at from promo_codes where code = ${m.promoCode}`)) as unknown as { ends_at: string | null }[];
    return { code: m.promoCode, endsAt: rows[0]?.ends_at ? new Date(rows[0].ends_at) : null };
  }
  const key = attributionKey(m);
  const code = await issuePromoCode({
    kind: m.promo.kind,
    value: m.promo.value,
    phone: m.phone9,
    ttlHours: m.promo.ttlHours,
    minSubtotal: m.promo.minSubtotal ?? null,
    source: m.flowId ? "flow" : "campaign",
    campaignId: key,
    note: m.flowId ? `Avtomatik: ${m.flowId}, ${(m.flowStep ?? 0) + 1}-qadam` : `Kampaniya #${m.campaignId}`,
  });
  // Stored before sending: a retry reuses this code instead of issuing a second one.
  await db.execute(sql`update outbound_messages set promo_code = ${code} where id = ${m.id}`);
  const endsAt = m.promo.ttlHours > 0 ? new Date(Date.now() + m.promo.ttlHours * 3_600_000) : null;
  return { code, endsAt };
}

async function deliver(m: Claimed, sms: ResolvedSms | null, clubEnabled: boolean): Promise<Outcome> {
  const db = getDb();
  if (await isOptedOut(db, m.phone9, m.channel)) return { status: "skipped", error: "opted_out" };
  if (m.channel === "sms" && (!sms?.provider || !m.phone9)) return { status: "skipped", error: "sms_not_configured" };
  if (m.channel === "telegram") {
    if (!clubEnabled) return { status: "skipped", error: "club_disabled" };
    if (!m.chatId) return { status: "skipped", error: "no_telegram" };
    const blocked = (await db.execute(sql`select 1 from bot_members where chat_id = ${m.chatId} and blocked_at is not null`)) as unknown as unknown[];
    if (blocked.length > 0) return { status: "skipped", error: "bot_blocked" };
  }

  let promo: Awaited<ReturnType<typeof ensurePromo>>;
  try {
    promo = await ensurePromo(m);
  } catch (err) {
    return { status: "retry", error: `promo: ${(err as Error).message}` };
  }
  if (m.promo && !promo) return { status: "skipped", error: "promo_needs_phone" };

  const linkTarget = m.link ? shortLink(m.id, m.channel === "telegram") : "";
  const vars = {
    kod: promo?.code ?? "",
    muddat: promo?.endsAt ? formatExpiry(promo.endsAt) : "",
    havola: linkTarget,
  };
  const body = finalizeText(m.text, vars);

  if (m.channel === "sms") {
    const text = prepareSmsText(withOptOut(body, "sms", stopLink(m.phone9!, "sms", m.locale), m.locale), { transliterate: sms!.transliterate });
    const result = await sms!.provider!.send(`+998${m.phone9}`, text);
    if (result.ok) return { status: "sent", text, providerRef: result.id };
    return { status: result.retryable ? "retry" : "failed", error: result.error };
  }

  const buttons: NonNullable<BotJobPayload["buttons"]> = [];
  if (linkTarget) buttons.push([{ text: m.locale === "ru" ? "Открыть" : "Ochish", url: linkTarget }]);
  if (m.phone9) buttons.push([{ text: m.locale === "ru" ? "🔕 Отключить такие сообщения" : "🔕 Bunday xabarlarni oʻchirish", url: stopLink(m.phone9, "telegram", m.locale, true) }]);
  const payload: BotJobPayload = { text: escapeHtml(body), ...(buttons.length ? { buttons } : {}) };
  const dedupeKey = botJobKey(m);
  const inserted = await db
    .insert(botJobs)
    .values({ chatId: m.chatId!, payload, kind: m.campaignId ? "campaign" : "flow", dedupeKey })
    .onConflictDoNothing({ target: botJobs.dedupeKey })
    .returning({ id: botJobs.id });
  let botJobId: number | null = inserted[0]?.id ?? null;
  if (!botJobId) {
    const rows = (await db.execute(sql`select id from bot_jobs where dedupe_key = ${dedupeKey}`)) as unknown as { id: string | number }[];
    botJobId = rows[0] ? Number(rows[0].id) : null;
  }
  return { status: "sent", text: body, botJobId };
}

/**
 * Sends what is due. Safe to call from several places at once (the
 * in-process timer, the cron endpoint, a second machine): only one claims at
 * a time, and each row is claimed once.
 */
export async function drainOutbox(now = new Date(), limit = 30): Promise<DrainResult> {
  const result: DrainResult = { locked: false, deferred: 0, sent: 0, failed: 0, skipped: 0, retried: 0 };
  const db = getDb();
  const claimed = await db.transaction(async (tx) => {
    const lock = (await tx.execute(sql`select pg_try_advisory_xact_lock(${OUTBOX_LOCK}) as ok`)) as unknown as { ok: boolean }[];
    if (!lock[0]?.ok) return null;
    await tx.execute(sql`
      update outbound_messages set status = 'failed', error = 'interrupted: may have been sent, not retried'
      where status = 'sending' and claimed_at < now() - ${CLAIM_TIMEOUT}`);
    if (isQuietHours(now)) {
      const rows = (await tx.execute(sql`
        update outbound_messages set scheduled_at = ${nextSendWindow(now).toISOString()}::timestamptz
        where status = 'pending' and scheduled_at <= ${now.toISOString()}::timestamptz
        returning id`)) as unknown as unknown[];
      result.deferred = rows.length;
      return [];
    }
    const rows = (await tx.execute(sql`
      with due as (
        select id from outbound_messages
        where status = 'pending' and scheduled_at <= ${now.toISOString()}::timestamptz
        order by scheduled_at, id
        limit ${limit}
        for update skip locked
      )
      update outbound_messages m set status = 'sending', attempts = m.attempts + 1, claimed_at = now()
      from due where m.id = due.id
      returning m.*`)) as unknown as Row[];
    return rows.map(claimedOf);
  });
  if (claimed === null) return result;
  result.locked = true;
  if (claimed.length === 0) return result;

  const needsSms = claimed.some((m) => m.channel === "sms");
  const sms = needsSms ? await resolveSmsProvider().catch(() => null) : null;
  const clubEnabled = claimed.some((m) => m.channel === "telegram") ? Boolean((await getClubConfig().catch(() => null))?.enabled) : false;

  for (const m of claimed) {
    let outcome: Outcome;
    try {
      outcome = await deliver(m, sms, clubEnabled);
    } catch (err) {
      outcome = { status: "retry", error: (err as Error).message || "error" };
    }
    try {
      result[await finish(m, outcome, now)] += 1;
    } catch (err) {
      console.error(`[messages] status update failed for #${m.id}:`, (err as Error).message);
    }
  }
  return result;
}

/** The site's URL for a path in a locale, for the click redirect. */
export function siteTarget(path: string, locale: MessageLocale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const localized = /^\/(uz|ru)(\/|$)/.test(clean) ? clean : `/${locale}${clean === "/" ? "" : clean}`;
  return `${SITE_URL}${localized}`;
}
