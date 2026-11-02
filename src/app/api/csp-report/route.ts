import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { parseCspReport } from "@/lib/security/csp-report";

export const dynamic = "force-dynamic";

/*
  Where browsers send Content-Security-Policy violations (report-uri and
  report-to in lib/security/csp.ts). Collected so the report-only policy can
  be judged on real traffic before CSP_MODE=enforce (docs/DEPLOY-FLY.md).

  An unauthenticated POST from every visitor, so it is cheap and bounded:
  - a small body only (8 KB), read as text;
  - per address 20 reports a minute, and at most WRITES_PER_MINUTE rows
    written per machine — past that, reports are counted as dropped, which
    is enough to know there is a flood;
  - stored as a daily count per (directive, blocked origin) — no page URL,
    no sample, no IP (lib/security/csp-report.ts);
  - always 204, so a client learns nothing.
*/
const MAX_BODY = 8 * 1024;
const PER_IP = { limit: 20, windowMs: 60_000 };
const WRITES_PER_MINUTE = 300;

let windowStart = 0;
let writes = 0;

function writeAllowed(now = Date.now()): boolean {
  if (now - windowStart > 60_000) {
    windowStart = now;
    writes = 0;
  }
  writes += 1;
  return writes <= WRITES_PER_MINUTE;
}

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!isDbConfigured) return done();
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return done();
  if (!withinRateLimit("csp-report", clientIp(request.headers), PER_IP)) return done();
  const text = (await request.text().catch(() => "")).slice(0, MAX_BODY);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return done();
  }
  const violations = parseCspReport(body);
  if (violations.length === 0) return done();
  // Over the budget only the first report of the minute is written, as a "dropped" marker.
  const allowed = writeAllowed();
  if (!allowed && writes !== WRITES_PER_MINUTE + 1) return done();
  try {
    for (const v of allowed ? violations : [{ directive: "dropped", blocked: "rate-limit" }]) {
      await getDb().execute(sql`
        insert into csp_reports (day, directive, blocked, count, last_at)
        values ((now() at time zone 'Asia/Tashkent')::date, ${v.directive}, ${v.blocked}, 1, now())
        on conflict (day, directive, blocked) do update set count = csp_reports.count + 1, last_at = now()`);
    }
  } catch (err) {
    console.error("[csp-report] not stored:", (err as Error).message);
  }
  return done();
}
