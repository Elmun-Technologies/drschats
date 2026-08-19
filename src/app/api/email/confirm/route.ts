import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/routing";
import { siteOrigin } from "@/lib/email/config";
import { verifyToken } from "@/lib/email/token";
import { sendCampaign } from "@/lib/email/send";
import { recordSubscriber } from "@/lib/marketing/api";
import { notifyOperator } from "@/lib/notifications/operator";

/*
  The second half of double opt-in.

  Clicked from a mail client, so there is no session, no CSRF token and no
  guarantee about which browser opens it — everything this route needs is in
  the signature. It ends on a page rather than a JSON body, because the person
  who clicked is a human waiting to be told it worked.
*/

export const dynamic = "force-dynamic";

function localeFrom(request: NextRequest): Locale {
  const value = request.nextUrl.searchParams.get("locale");
  return isLocale(value) ? value : defaultLocale;
}

function redirect(locale: Locale, status: string) {
  return NextResponse.redirect(`${siteOrigin()}/${locale}/email/preferences?status=${status}`);
}

export async function GET(request: NextRequest) {
  const locale = localeFrom(request);
  const verified = verifyToken(request.nextUrl.searchParams.get("token"), "opt-in");

  // An expired link is a different problem from a forged one — the first needs
  // a new email, the second needs nothing — so the page is told which it was.
  if (!verified) return redirect(locale, "invalid");

  await recordSubscriber({ email: verified.email, status: "confirmed", locale });

  await sendCampaign({
    to: verified.email,
    locale,
    campaign: { type: "welcome", quizUrl: `${siteOrigin()}/${locale}/quiz` },
  });

  await notifyOperator(`✅ Obuna tasdiqlandi: ${verified.email}`);

  return redirect(locale, "confirmed");
}
