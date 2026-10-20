import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { flows as flowsTable } from "@/lib/db/schema";
import { queueMessage, reachContext, resolveReach, type ReachContext } from "@/lib/messaging/outbox";
import { cartSummary, firstName, formatSum, renderTemplate, type MessageLocale, type TemplateVars } from "@/lib/messaging/template";
import { flowMessageKey } from "@/lib/messaging/keys";
import { DEFAULT_FLOWS } from "./defaults";
import { readLoyaltyRules } from "@/lib/loyalty/settings";
import { enrollmentWindow, pickStep } from "./schedule";
import { candidateQuery, conversionQuery, type TriggerOptions } from "./triggers";
import { isFlowTrigger, parseSteps, type FlowStep, type FlowTrigger } from "./types";

/*
  The flow engine, run by the message worker every few minutes:
  1. enroll — each active flow's trigger query, INSERT … ON CONFLICT DO NOTHING;
  2. advance — each due enrollment: converted (an order since the anchor)?
     opted out everywhere? cart emptied? — otherwise queue the due step's
     message in the outbox and schedule the next step.

  All of it runs in one transaction holding pg_try_advisory_xact_lock, so two
  processes (the in-process timer and the cron endpoint, or two machines)
  never advance the same enrollment twice; due rows are additionally taken
  FOR UPDATE SKIP LOCKED. Messages are only queued here — sending, the
  promo code and quiet hours belong to the outbox.
*/

type Db = ReturnType<typeof getDb>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Row = Record<string, unknown>;

const FLOWS_LOCK = 7_340_011;
const ADVANCE_BATCH = 200;

export interface FlowRunResult {
  locked: boolean;
  enrolled: number;
  queued: number;
  converted: number;
  exited: number;
  done: number;
}

/** Creates the playbook flows once (inactive). Safe on every boot. */
export async function ensureDefaultFlows(): Promise<number> {
  const rows = await getDb()
    .insert(flowsTable)
    .values(DEFAULT_FLOWS.map((f) => ({ id: f.id, name: f.name, trigger: f.trigger, active: false, steps: f.steps })))
    .onConflictDoNothing()
    .returning({ id: flowsTable.id });
  return rows.length;
}

interface CartItem { name?: string; quantity?: number }

function localeOf(value: unknown): MessageLocale {
  return value === "ru" ? "ru" : "uz";
}

/** Values known when the step is queued; {kod}, {muddat}, {havola} wait for the send. */
export function contextVars(context: Row, locale: MessageLocale): TemplateVars {
  const items = Array.isArray(context.cartItems) ? (context.cartItems as CartItem[]).filter((i) => typeof i?.name === "string") as { name: string }[] : [];
  const vars: TemplateVars = { ism: firstName(context.name as string | null, locale), savat: cartSummary(items, locale) };
  if (typeof context.cartValue === "number" && context.cartValue > 0) vars.summa = formatSum(context.cartValue, locale);
  if (typeof context.productName === "string") vars.mahsulot = context.productName;
  return vars;
}

async function enroll(tx: Tx, flow: { id: string; trigger: FlowTrigger }, steps: FlowStep[], now: Date, options: TriggerOptions = {}): Promise<number> {
  const query = candidateQuery(flow.trigger, enrollmentWindow(flow.trigger, steps[0].delayMinutes, now), options);
  if (!query) return 0;
  const rows = (await tx.execute(sql`
    insert into flow_enrollments (flow_id, subject, cycle, context, anchor_at, step, next_at)
    select ${flow.id}, c.subject, c.cycle, c.context, c.anchor,
           0, c.anchor + make_interval(mins => ${steps[0].delayMinutes})
    from (${query}) c
    where not exists (
      select 1 from flow_enrollments e where e.flow_id = ${flow.id} and e.subject = c.subject and e.status = 'active'
    )
      and not exists (select 1 from marketing_optouts x where x.phone9 = c.subject and x.channel = 'all')
    on conflict (flow_id, subject, cycle) do nothing
    returning id`)) as unknown as unknown[];
  return rows.length;
}

/** Puts one customer into a flow from outside the trigger queries (restock). */
export async function enrollSubject(input: {
  flowId: string;
  subject: string;
  cycle: string;
  context: Row;
  anchor?: Date;
}): Promise<"enrolled" | "duplicate" | "inactive"> {
  const db = getDb();
  const [flow] = (await db.execute(sql`select steps, active from flows where id = ${input.flowId}`)) as unknown as { steps: unknown; active: boolean }[];
  const steps = flow ? parseSteps(flow.steps) : [];
  if (!flow?.active || steps.length === 0) return "inactive";
  const anchor = input.anchor ?? new Date();
  const rows = (await db.execute(sql`
    insert into flow_enrollments (flow_id, subject, cycle, context, anchor_at, step, next_at)
    values (${input.flowId}, ${input.subject}, ${input.cycle}, ${JSON.stringify(input.context)}::jsonb, ${anchor.toISOString()}::timestamptz,
            0, ${new Date(anchor.getTime() + steps[0].delayMinutes * 60_000).toISOString()}::timestamptz)
    on conflict (flow_id, subject, cycle) do nothing
    returning id`)) as unknown as unknown[];
  return rows.length > 0 ? "enrolled" : "duplicate";
}

async function close(tx: Tx, id: number, status: "converted" | "exited" | "done", extra: { reason?: string; orderId?: number } = {}) {
  await tx.execute(sql`
    update flow_enrollments set status = ${status}, next_at = null, finished_at = now(),
      exit_reason = ${extra.reason ?? null}, converted_order_id = ${extra.orderId ?? null}
    where id = ${id}`);
}

async function exitReason(tx: Tx, trigger: string, subject: string, context: Row): Promise<string | null> {
  const optedOut = (await tx.execute(sql`
    select count(distinct channel) filter (where channel in ('sms', 'telegram')) as n, bool_or(channel = 'all') as all_
    from marketing_optouts where phone9 = ${subject}`)) as unknown as { n: string; all_: boolean | null }[];
  if (optedOut[0]?.all_ || Number(optedOut[0]?.n ?? 0) >= 2) return "opted_out";
  if ((trigger === "cart_abandoned" || trigger === "checkout_dropped") && typeof context.visitorId === "string") {
    const rows = (await tx.execute(sql`select cart_value from visitors where id = ${context.visitorId}::uuid`)) as unknown as { cart_value: number }[];
    if (!rows[0] || Number(rows[0].cart_value) <= 0) return "cart_emptied";
  }
  return null;
}

async function advance(tx: Tx, e: Row, now: Date, reach: ReachContext, result: FlowRunResult): Promise<void> {
  const id = Number(e.id);
  const subject = String(e.subject);
  const context = (e.context as Row) ?? {};
  const anchor = new Date(e.anchor_at as string);
  const steps = parseSteps(e.steps);
  const trigger = String(e.trigger);

  const visitorId = typeof context.visitorId === "string" ? context.visitorId : null;
  const [order] =
    trigger === "birthday" ? [] : ((await tx.execute(conversionQuery(subject, anchor, visitorId))) as unknown as { id: string | number }[]);
  if (order) {
    await close(tx, id, "converted", { orderId: Number(order.id) });
    result.converted += 1;
    return;
  }
  const reason = steps.length === 0 ? "no_steps" : await exitReason(tx, trigger, subject, context);
  if (reason) {
    await close(tx, id, "exited", { reason });
    result.exited += 1;
    return;
  }

  const pick = pickStep(steps, anchor, Number(e.step), now);
  if (pick.send !== null) {
    const step = steps[pick.send];
    const locale = localeOf(context.locale);
    const text = renderTemplate(step.text[locale], contextVars(context, locale));
    const link = step.link || (typeof context.link === "string" ? context.link : "") || "/";
    const target = await resolveReach(tx, subject, step.channel, reach);
    const queued = await queueMessage(tx, {
      channel: target.channel ?? (step.channel === "sms" ? "sms" : "telegram"),
      phone9: subject,
      chatId: target.channel === "telegram" ? target.chatId : null,
      locale,
      text,
      link,
      promo: step.promo,
      flowId: String(e.flow_id),
      flowStep: pick.send,
      enrollmentId: id,
      dedupeKey: flowMessageKey(String(e.flow_id), id, pick.send),
      skip: target.channel === null ? target.reason : undefined,
    });
    if (queued && target.channel !== null) result.queued += 1;
  }
  if (pick.next) {
    await tx.execute(sql`update flow_enrollments set step = ${pick.next.step}, next_at = ${pick.next.at.toISOString()}::timestamptz where id = ${id}`);
  } else {
    await tx.execute(sql`update flow_enrollments set step = ${steps.length} where id = ${id}`);
    await close(tx, id, "done");
    result.done += 1;
  }
}

export async function runFlows(now = new Date()): Promise<FlowRunResult> {
  const result: FlowRunResult = { locked: false, enrolled: 0, queued: 0, converted: 0, exited: 0, done: 0 };
  const reach = await reachContext();
  const options: TriggerOptions = { birthdayDaysBefore: (await readLoyaltyRules().catch(() => null))?.birthday.daysBefore };
  await getDb().transaction(async (tx) => {
    const lock = (await tx.execute(sql`select pg_try_advisory_xact_lock(${FLOWS_LOCK}) as ok`)) as unknown as { ok: boolean }[];
    if (!lock[0]?.ok) return;
    result.locked = true;

    const active = (await tx.execute(sql`select id, trigger, steps from flows where active`)) as unknown as Row[];
    for (const flow of active) {
      const trigger = String(flow.trigger);
      const steps = parseSteps(flow.steps);
      if (!isFlowTrigger(trigger) || steps.length === 0) continue;
      result.enrolled += await enroll(tx, { id: String(flow.id), trigger }, steps, now, options);
    }

    // Customers who came back are marked at once, not only when their next step falls due.
    const converted = (await tx.execute(sql`
      update flow_enrollments e set status = 'converted', next_at = null, finished_at = now(), converted_order_id = c.order_id
      from (
        select a.id, (
          select o.id from orders o
          where date_trunc('milliseconds', o.created_at) > date_trunc('milliseconds', a.anchor_at)
            and (right(regexp_replace(o.customer->>'phone', '\\D', '', 'g'), 9) = a.subject
                 or (a.context ? 'visitorId' and o.visitor_id::text = a.context->>'visitorId'))
          order by o.created_at limit 1
        ) as order_id
        from flow_enrollments a
        -- A birthday greeting is sent even if the customer ordered in the days before it.
        where a.status = 'active' and not exists (select 1 from flows f where f.id = a.flow_id and f.trigger = 'birthday')
      ) c
      where c.id = e.id and c.order_id is not null
      returning e.id`)) as unknown as unknown[];
    result.converted += converted.length;

    const due = (await tx.execute(sql`
      select e.*, f.steps, f.trigger from flow_enrollments e
      join flows f on f.id = e.flow_id
      where e.status = 'active' and f.active and e.next_at <= ${now.toISOString()}::timestamptz
      order by e.next_at
      limit ${ADVANCE_BATCH}
      for update of e skip locked`)) as unknown as Row[];
    for (const e of due) await advance(tx, e, now, reach, result);
  });
  return result;
}
