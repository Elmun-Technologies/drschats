import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/*
  For an uptime monitor, not for Fly's routing check. The storefront keeps
  serving the built-in catalogue when Postgres is down, so "/uz" answers 200
  either way and a dead database went unnoticed; this answers 503 instead.
  Fly keeps checking "/uz" on purpose: pulling every machine out of rotation
  because the database blinked would turn a degraded shop into no shop.
  The body says only up or down — no versions, hosts or error text.
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
  return Response.json({ ok, database }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
