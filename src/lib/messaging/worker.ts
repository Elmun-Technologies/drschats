import { ensureDefaultFlows, runFlows, type FlowRunResult } from "@/lib/flows/engine";
import { drainOutboxFor, stopDraining, type DrainResult } from "./outbox";
import { isOperatorChannelConfigured } from "@/lib/notifications/operator";
import { retryOperatorPings } from "@/lib/orders/notify";
import { releaseUnpaidOrders } from "@/lib/orders/release";
import { runAlerts } from "@/lib/ops/alerts";
import { refreshOnClockEvents } from "@/lib/ops/clock-events";
import { runRetention } from "@/lib/ops/retention";
import { writeOps } from "@/lib/ops/state";
import { WORKER_TICK_KEY } from "@/lib/ops/health";
import { expirePoints } from "@/lib/loyalty/server";
import { notifyStartedDeals } from "@/lib/merch/deal-notify";
import { sweepBotCarts } from "@/lib/bot/abandoned";
import { submitDueClickFiscal } from "@/lib/payments/click-fiscal-server";

/*
  The message worker. Runs inside the Next.js server process (started from
  instrumentation.ts) — the site is one always-on Fly machine, so an
  in-process timer is the simplest thing that works, with no extra service.
  POST /api/cron/messages runs the same tick for an external cron or by hand.

  Every minute: drain the outbox (due SMS, Telegram hand-offs to bot_jobs) in
  parallel batches for up to DRAIN_BUDGET_MS, refresh pages whose deal or
  sale window just opened or closed, write the heartbeat /api/health reads.
  Every 5 minutes: flows — enroll and advance; retry operator pings Telegram
  did not take; cancel unpaid online orders past their time (stock comes
  back); operator alerts. Every hour: cashback expiry rows, retention.

  It must never take the server down: every tick is wrapped, errors are
  logged (without phone numbers or texts) and the next tick tries again.
  Concurrency is handled in the database (advisory xact locks, SKIP LOCKED,
  unique dedupe keys), so a second machine or an overlapping cron call is
  harmless.

  MESSAGE_WORKER=off disables the timer (the cron endpoint still works).
*/

const TICK_MS = 60_000;
/* Most of the minute: the next tick must not start while this one still sends. */
const DRAIN_BUDGET_MS = 40_000;
const FLOWS_EVERY_MS = 5 * 60_000;
/* Cashback expiry is evaluated lazily on every read; this only writes the 'expire' rows. */
const EXPIRE_EVERY_MS = 60 * 60_000;

type Holder = { __govitaMessageWorker?: NodeJS.Timeout };
const holder = globalThis as unknown as Holder;

export interface TickResult {
  flows: FlowRunResult | null;
  outbox: DrainResult | null;
  /** Deals that started since the last tick and bot carts enrolled while flows ran. */
  deals?: { started: number; notified: number };
  carts?: { candidates: number; enrolled: number };
  busy?: boolean;
}

let running = false;
let lastFlows = 0;
let lastExpire = 0;

/** One background job; a failure is logged and never stops the rest of the tick. */
async function job<T>(name: string, run: () => Promise<T>): Promise<T | undefined> {
  try {
    return await run();
  } catch (err) {
    console.error(`[worker] ${name} failed:`, (err as Error).message);
    return undefined;
  }
}

export async function runMessagingTick(options: { now?: Date; flows?: boolean } = {}): Promise<TickResult> {
  if (running) return { flows: null, outbox: null, busy: true };
  running = true;
  const now = options.now ?? new Date();
  try {
    let flows: FlowRunResult | null = null;
    let deals: TickResult["deals"];
    let carts: TickResult["carts"];
    if (options.flows ?? Date.now() - lastFlows >= FLOWS_EVERY_MS) {
      lastFlows = Date.now();
      // A deal opening is a clock event, not a write: this is what tells the
      // "narxi tushsa xabar bering" customers about it, exactly once.
      deals = await notifyStartedDeals(now).catch((err: Error) => {
        console.error("[deals] sweep failed:", err.message);
        return undefined;
      });
      // Bot carts deliberately join the same abandoned-cart flow as the site.
      carts = await sweepBotCarts(now).catch((err: Error) => {
        console.error("[bot-carts] sweep failed:", err.message);
        return undefined;
      });
      flows = await runFlows(now);
      if (await isOperatorChannelConfigured().catch(() => false)) await job("operator pings", retryOperatorPings);
      await job("unpaid orders", releaseUnpaidOrders);
      await job("click fiscal receipts", submitDueClickFiscal);
      await job("alerts", runAlerts);
    }
    if (options.flows || Date.now() - lastExpire >= EXPIRE_EVERY_MS) {
      lastExpire = Date.now();
      await expirePoints(now).catch((err: Error) => console.error("[loyalty] expiry job failed:", err.message));
      await job("retention", runRetention);
    }
    await job("clock events", () => refreshOnClockEvents(options.now ?? new Date()));
    // Messages the flows just queued go out in the same tick.
    const outbox = options.now ? await drainOutboxFor(0, () => options.now!) : await drainOutboxFor(DRAIN_BUDGET_MS);
    await job("heartbeat", () => writeOps(WORKER_TICK_KEY, { at: new Date().toISOString() }));
    return { flows, outbox, deals, carts };
  } finally {
    running = false;
  }
}

function log(result: TickResult) {
  const f = result.flows;
  const o = result.outbox;
  const parts: string[] = [];
  if (f && (f.enrolled || f.queued || f.converted || f.exited)) parts.push(`flows +${f.enrolled} enrolled, ${f.queued} queued, ${f.converted} converted, ${f.exited} exited`);
  if (o && (o.sent || o.failed || o.retried || o.skipped || o.deferred)) parts.push(`outbox ${o.sent} sent, ${o.retried} retry, ${o.failed} failed, ${o.skipped} skipped, ${o.deferred} deferred`);
  if (result.deals?.started) parts.push(`deals ${result.deals.started} started, ${result.deals.notified} notified`);
  if (result.carts?.enrolled) parts.push(`bot carts ${result.carts.enrolled} enrolled`);
  if (parts.length) console.log(`[messages] ${parts.join(" · ")}`);
}

export function startMessageWorker(): void {
  if (process.env.MESSAGE_WORKER === "off" || holder.__govitaMessageWorker) return;
  const tick = () => {
    runMessagingTick()
      .then(log)
      .catch((err: Error) => console.error("[messages] tick failed:", err.message));
  };
  const timer = setInterval(tick, TICK_MS);
  timer.unref?.();
  holder.__govitaMessageWorker = timer;
  ensureDefaultFlows()
    .then((n) => { if (n) console.log(`[flows] ${n} playbook flows created (inactive)`); })
    .catch((err: Error) => console.error("[flows] seed skipped:", err.message));
  setTimeout(tick, 20_000).unref?.();
  // Next closes the server on these and then exits; the batch in hand stops after its current message.
  const stop = () => {
    clearInterval(timer);
    stopDraining();
  };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  console.log("[messages] worker started (every 60s, flows every 5 min)");
}
