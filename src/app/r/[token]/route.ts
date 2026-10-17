import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { SITE_URL } from "@/lib/config/site";
import { verifyClickToken } from "@/lib/messaging/tokens";
import { siteTarget, attributionKey } from "@/lib/messaging/outbox";

/*
  Short click link from an SMS / Telegram message: /r/<id36>-<sig>.
  Counts the click on the message row and redirects to the page with UTM
  tags (utm_campaign = flow-<id> | campaign-<id>), which the site's
  attribution stores and the order carries — that is how /admin/flows and
  /admin/campaigns count orders and revenue. Link previews (Telegram,
  WhatsApp, crawlers) are redirected but not counted.
*/

export const dynamic = "force-dynamic";

const PREVIEW_BOTS = /bot|crawler|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|vkshare|skype/i;

function redirect(url: string) {
  const response = NextResponse.redirect(url, 302);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = verifyClickToken(token);
  if (!id || !isDbConfigured) return redirect(`${SITE_URL}/uz`);

  const counts = !PREVIEW_BOTS.test(request.headers.get("user-agent") ?? "");
  try {
    const rows = (await getDb().execute(
      counts
        ? sql`update outbound_messages set clicks = clicks + 1, clicked_at = coalesce(clicked_at, now())
              where id = ${id} returning link, locale, channel, flow_id, flow_step, campaign_id`
        : sql`select link, locale, channel, flow_id, flow_step, campaign_id from outbound_messages where id = ${id}`,
    )) as unknown as { link: string | null; locale: string; channel: string; flow_id: string | null; flow_step: number | null; campaign_id: string | number | null }[];
    const row = rows[0];
    if (!row) return redirect(`${SITE_URL}/uz`);
    const locale = row.locale === "ru" ? "ru" : "uz";
    const url = new URL(siteTarget(row.link || "/", locale));
    const key = attributionKey({ flowId: row.flow_id, campaignId: row.campaign_id == null ? null : Number(row.campaign_id) });
    url.searchParams.set("utm_source", row.channel);
    // A message from neither (the waitlist's SMS) keeps the medium and campaign its own link carries.
    if (key) {
      url.searchParams.set("utm_medium", row.flow_id ? "flow" : "campaign");
      url.searchParams.set("utm_campaign", key);
    }
    if (row.flow_step != null) url.searchParams.set("utm_content", `step-${Number(row.flow_step) + 1}`);
    return redirect(url.toString());
  } catch (err) {
    console.error("[messages] click not recorded:", (err as Error).message);
    return redirect(`${SITE_URL}/uz`);
  }
}
