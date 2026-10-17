import { ensureDefaultFlows, runFlows, type FlowRunResult } from "@/lib/flows/engine";
import { drainOutbox, type DrainResult } from "./outbox";

/*
  The message worker. Runs inside the Next.js server process (started from
  instrumentation.ts) — the site is one always-on Fly machine, so an
  in-process timer is the simplest thing that works, with no extra service.
  POST /api/cron/messages runs the same tick for an external cron or by hand.

  Every minute: drain the outbox (due SMS, Telegram hand-offs to bot_jobs).
  Every 5 minutes: flows — enroll and advance.

  It must never take the server down: every tick is wrapped, errors are
  logged (without phone numbers or texts) and the next tick tries again.
  Concurrency is handled in the database (advisory xact locks, SKIP LOCKED,
  unique dedupe keys), so a second machine or an overlapping cron call is
  harmless.

  MESSAGE_WORKER=off disables the timer (the cron endpoint still works).
*/

const TICK_MS = 60_000;
const FLOWS_EVERY_MS = 5 * 60_000;

type Holder = { __govitaMessageWorker?: NodeJS.Timeout };
const holder = globalThis as unknown as Holder;

export interface TickResult {
  flows: FlowRunResult | null;
  outbox: DrainResult | null;
  busy?: boolean;
}

let running = false;
let lastFlows = 0;

export async function runMessagingTick(options: { now?: Date; flows?: boolean } = {}): Promise<TickResult> {
  if (running) return { flows: null, outbox: null, busy: true };
  running = true;
  const now = options.now ?? new Date();
  try {
    let flows: FlowRunResult | null = null;
    if (options.flows ?? Date.now() - lastFlows >= FLOWS_EVERY_MS) {
      lastFlows = Date.now();
      flows = await runFlows(now);
    }
    // Messages the flows just queued go out in the same tick.
    const outbox = await drainOutbox(options.now ?? new Date());
    return { flows, outbox };
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
  console.log("[messages] worker started (every 60s, flows every 5 min)");
}
