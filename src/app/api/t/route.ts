import { NextResponse, type NextRequest } from "next/server";
import { isDbConfigured } from "@/lib/db/client";
import { batchSchema, newVisitorId, recordBatch, visitorIdFrom, VISITOR_COOKIE } from "@/lib/journey/collect";
import { isBotAgent } from "@/lib/journey/model";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const LIMIT = { limit: 240, windowMs: 10 * 60 * 1000 };
const YEAR = 60 * 60 * 24 * 365;

/*
  First-party journey collector. Answers 204 whatever happens: the browser
  sends with sendBeacon and nothing on the page waits for or reads the reply.
*/
export async function POST(req: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  if (!isDbConfigured) return done;
  const userAgent = req.headers.get("user-agent") ?? "";
  if (isBotAgent(userAgent)) return done;
  if (!withinRateLimit("journey", clientIp(req.headers), LIMIT)) return done;

  const text = await req.text().catch(() => "");
  if (!text || text.length > 24_000) return done;
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return done;
  }
  const parsed = batchSchema.safeParse(json);
  if (!parsed.success) return done;

  const existing = visitorIdFrom(req.cookies.get(VISITOR_COOKIE)?.value);
  const visitorId = existing ?? newVisitorId();
  try {
    await recordBatch(visitorId, parsed.data, { userAgent, host: req.nextUrl.hostname });
  } catch (err) {
    console.error("[journey] batch failed:", (err as Error).message);
    return done;
  }
  if (!existing) {
    done.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: YEAR,
    });
  }
  return done;
}
