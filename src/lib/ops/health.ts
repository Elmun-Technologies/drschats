import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { catalogFallbackState } from "@/lib/catalog/db";
import { readOps } from "./state";

/*
  What /api/health and the operator alert read about the background work.
  Counts only — never a phone, a text or an error message.
*/

export const WORKER_TICK_KEY = "worker.lastTick";
/** The worker ticks every minute; three missed ticks is "stale". */
export const WORKER_STALE_MS = 3 * 60_000;

export interface WorkerHealth {
  /** off: MESSAGE_WORKER=off or never ran; ok; stale: no tick for WORKER_STALE_MS. */
  state: "ok" | "stale" | "off";
  lastTickAgoSec: number | null;
  /** Messages that failed for good in the last hour. */
  failed1h: number;
  /** Messages due for more than 10 minutes and still not sent — the queue is behind. */
  overdue: number;
  /** Seconds the oldest due message has waited. */
  lagSec: number;
  /** Operator pings Telegram did not take in the last day. */
  unsentOperatorPings: number;
}

export async function workerHealth(now = Date.now()): Promise<WorkerHealth> {
  const db = getDb();
  const [tick, counts] = await Promise.all([
    readOps<{ at: string }>(WORKER_TICK_KEY).catch(() => null),
    db.execute(sql`
      select
        (select count(*)::int from outbound_messages where status = 'failed' and created_at > now() - interval '1 hour') as failed1h,
        (select count(*)::int from outbound_messages where status = 'pending' and scheduled_at < now() - interval '10 minutes') as overdue,
        (select coalesce(extract(epoch from now() - min(scheduled_at)), 0)::int from outbound_messages where status = 'pending' and scheduled_at <= now()) as lag,
        (select count(*)::int from orders where operator_notified_at is null and created_at > now() - interval '24 hours' and created_at < now() - interval '2 minutes') as unsent`),
  ]);
  const row = (counts as unknown as { failed1h: number; overdue: number; lag: number; unsent: number }[])[0];
  const ago = tick ? Math.max(0, Math.round((now - tick.updatedAt.getTime()) / 1000)) : null;
  const state = ago === null ? "off" : ago * 1000 > WORKER_STALE_MS ? "stale" : "ok";
  return {
    state,
    lastTickAgoSec: ago,
    failed1h: Number(row?.failed1h ?? 0),
    overdue: Number(row?.overdue ?? 0),
    lagSec: Number(row?.lag ?? 0),
    unsentOperatorPings: Number(row?.unsent ?? 0),
  };
}

/** The storefront served the built-in catalogue instead of the database in the last 10 minutes (this machine). */
export function catalogDegraded(now = Date.now()): boolean {
  const state = catalogFallbackState();
  return state.circuitOpen || (state.lastAt !== null && now - state.lastAt < 10 * 60_000 && state.reason === "error");
}
