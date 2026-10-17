import { NextResponse, type NextRequest } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { isLiveDeployment } from "@/lib/config/live";
import { matchesSecret } from "@/lib/security/safe-equal";

/*
  One tick of the message worker (flows + outbox) on demand. The worker
  already runs every minute inside the server (instrumentation.ts); this is
  for an external cron, a second runtime, or "send now" while debugging.
  Shut without CRON_SECRET, like /api/cron/marketing.
*/

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(request: NextRequest): boolean {
  return matchesSecret(request.headers.get("authorization"), process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined);
}

async function run(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isDbConfigured) return NextResponse.json({ ok: true, skipped: "no database" });
  try {
    const { runMessagingTick } = await import("@/lib/messaging/worker");
    // ?at=<ISO> pretends it is another moment (quiet hours, a step's due time) — off a live deployment only.
    const at = isLiveDeployment() ? null : request.nextUrl.searchParams.get("at");
    const now = at && !Number.isNaN(Date.parse(at)) ? new Date(at) : undefined;
    const result = await runMessagingTick({ flows: true, now });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[messages] cron tick failed:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "tick failed" }, { status: 500 });
  }
}

export const POST = run;
export const GET = run;
