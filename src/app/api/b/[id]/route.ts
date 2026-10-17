import { NextResponse, type NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";
import { isBotAgent } from "@/lib/journey/model";
import { visitorIdFrom, VISITOR_COOKIE } from "@/lib/journey/collect";
import { AB_COOKIE, AB_COOKIE_RE, tashkentDay } from "@/lib/merch/ab";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/* One counted click per address and banner every 30 minutes; at most 60 banner clicks per address an hour. */
const PER_BANNER = { limit: 1, windowMs: 30 * 60 * 1000 };
const PER_ADDRESS = { limit: 60, windowMs: 60 * 60 * 1000 };
/* Exposure beacons: the page sends one per session; this only stops a loop. */
const VIEWS_PER_ADDRESS = { limit: 120, windowMs: 60 * 60 * 1000 };

/*
  Banner click counter (admin → Vitrina → Bannerlar, "Bosishlar") and, for
  banners in an A/B test, the exposure log (`?kind=view`). Answers 204
  whatever happens — the browser sends a beacon and never reads the reply.
  Cross-site posts and bot user agents are dropped.

  An exposure is one row per visitor (gv_ab cookie) × banner × Tashkent day;
  a click marks that row (`clicked_at`), so the test's CTR is "visitor-days
  that clicked / visitor-days that saw", independent of how often a page
  was reloaded. The journey visitor id (gv_vid) is kept on the row when the
  browser has one, which is how orders are joined to a variant.
*/
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const done = new NextResponse(null, { status: 204 });
  if (!isDbConfigured) return done;
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) return done;
  if (isBotAgent(req.headers.get("user-agent") ?? "")) return done;
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return done;
  const ip = clientIp(req.headers);
  const view = req.nextUrl.searchParams.get("kind") === "view";
  const abId = req.cookies.get(AB_COOKIE)?.value;
  const visitorId = visitorIdFrom(req.cookies.get(VISITOR_COOKIE)?.value);
  const day = tashkentDay(new Date());

  try {
    if (view) {
      if (!abId || !AB_COOKIE_RE.test(abId) || !withinRateLimit("banner-view-ip", ip, VIEWS_PER_ADDRESS)) return done;
      await getDb().execute(sql`
        insert into banner_exposures (banner_id, ab_id, day, visitor_id)
        select b.id, ${abId}, ${day}::date, ${visitorId}::uuid from banners b where b.id = ${id} and b.experiment is not null
        on conflict (banner_id, ab_id, day) do update set visitor_id = coalesce(banner_exposures.visitor_id, excluded.visitor_id)`);
      return done;
    }
    if (!withinRateLimit("banner-click", `${ip}:${id}`, PER_BANNER)) return done;
    if (!withinRateLimit("banner-click-ip", ip, PER_ADDRESS)) return done;
    await getDb().update(banners).set({ clicks: sql`${banners.clicks} + 1` }).where(eq(banners.id, id));
    if (abId && AB_COOKIE_RE.test(abId)) {
      await getDb().execute(sql`
        insert into banner_exposures (banner_id, ab_id, day, visitor_id, clicked_at)
        select b.id, ${abId}, ${day}::date, ${visitorId}::uuid, now() from banners b where b.id = ${id} and b.experiment is not null
        on conflict (banner_id, ab_id, day) do update
          set clicked_at = coalesce(banner_exposures.clicked_at, excluded.clicked_at),
              visitor_id = coalesce(banner_exposures.visitor_id, excluded.visitor_id)`);
    }
  } catch (err) {
    console.error("[merch] banner beacon failed:", (err as Error).message);
  }
  return done;
}
