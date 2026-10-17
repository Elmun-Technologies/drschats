import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/config/site";
import { verifyStopToken } from "@/lib/messaging/tokens";

/*
  The opt-out link at the end of every marketing SMS: /s/<token>. Opening it
  changes nothing — link previews and SMS apps fetch URLs on their own — it
  leads to the localized page where one press records the opt-out.
*/

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = verifyStopToken(token);
  const target = payload ? `${SITE_URL}/${payload.locale}/stop/${token}` : `${SITE_URL}/uz`;
  const response = NextResponse.redirect(target, 302);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
