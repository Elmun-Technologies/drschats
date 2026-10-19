import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { miniAppProfile } from "@/lib/telegram/profile";

/*
  The Mini App asks who it is: a verified initData string in, the linked name
  and phone out. No session, no cookie — the signature is the credential.
  Closed when the club bot token is not configured, like the bot API itself.
*/
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.TELEGRAM_CLUB_BOT_TOKEN) {
    return Response.json({ error: "not_configured" }, { status: 404 });
  }
  if (!withinRateLimit("miniapp-profile", clientIp(req.headers), { limit: 30, windowMs: 60_000 })) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const initData = typeof body === "object" && body && "initData" in body ? (body as { initData?: unknown }).initData : undefined;
  const profile = await miniAppProfile(typeof initData === "string" ? initData.slice(0, 4096) : undefined);
  if (!profile) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(profile, { headers: { "Cache-Control": "no-store" } });
}
