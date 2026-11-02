import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { catalogDegraded, workerHealth, type WorkerHealth } from "@/lib/ops/health";

export const dynamic = "force-dynamic";

/*
  For an uptime monitor, not for Fly's routing check. The storefront keeps
  serving the built-in catalogue when Postgres is down, so "/uz" answers 200
  either way and a dead database went unnoticed; this answers 503 instead.
  Fly keeps checking "/uz" on purpose: pulling every machine out of rotation
  because the database blinked would turn a degraded shop into no shop.

  The body: up/down, `degraded` when this machine recently served the
  built-in catalogue, and the background worker's numbers (last tick, queue
  lag, failures in the last hour, operator pings that did not arrive).
  Counts only — no versions, hosts, phone numbers or error text.
  The status stays 200 for a stale worker or failures: those are alerts
  (lib/ops/alerts.ts), not a reason for a monitor to page as "site down".
*/
async function databaseUp(): Promise<boolean> {
  try {
    await Promise.race([
      getDb().execute(sql`select 1`),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const database = isDbConfigured ? ((await databaseUp()) ? "up" : "down") : "off";
  const ok = database !== "down";
  let worker: WorkerHealth | null = null;
  if (database === "up") {
    worker = await Promise.race([
      workerHealth().catch(() => null),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
  }
  const degraded = database === "down" || catalogDegraded() || worker?.state === "stale";
  return Response.json(
    { ok, database, degraded, worker },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
