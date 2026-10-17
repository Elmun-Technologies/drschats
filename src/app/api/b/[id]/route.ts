import { NextResponse, type NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";
import { isBotAgent } from "@/lib/journey/model";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/* One counted click per address and banner every 30 minutes; at most 60 banner clicks per address an hour. */
const PER_BANNER = { limit: 1, windowMs: 30 * 60 * 1000 };
const PER_ADDRESS = { limit: 60, windowMs: 60 * 60 * 1000 };

/*
  Banner click counter (admin → Vitrina → Bannerlar, "Bosishlar"). A single
  `update … set clicks = clicks + 1`; answers 204 whatever happens — the
  browser sends a beacon and never reads the reply. Cross-site posts, bot
  user agents and repeats are dropped, so the number stays a count of people.
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
  if (!withinRateLimit("banner-click", `${ip}:${id}`, PER_BANNER)) return done;
  if (!withinRateLimit("banner-click-ip", ip, PER_ADDRESS)) return done;
  try {
    await getDb().update(banners).set({ clicks: sql`${banners.clicks} + 1` }).where(eq(banners.id, id));
  } catch (err) {
    console.error("[merch] banner click failed:", (err as Error).message);
  }
  return done;
}
