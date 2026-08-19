import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/routing";
import { siteOrigin } from "@/lib/email/config";
import { verifyToken } from "@/lib/email/token";
import { recordSubscriber } from "@/lib/marketing/api";
import { notifyOperator } from "@/lib/notifications/operator";

/*
  Unsubscribing, both ways it is asked for.

  GET is the link at the bottom of the email. POST is what Gmail and Yahoo send
  when the reader presses their own "unsubscribe" button — the One-Click
  protocol from RFC 8058, which the List-Unsubscribe-Post header on every
  marketing message advertises. Honouring it is not optional for a sender who
  wants to keep reaching those inboxes.

  Neither path asks a question first. An unsubscribe that needs a confirmation
  click is a complaint being manufactured.
*/

export const dynamic = "force-dynamic";

function localeFrom(request: NextRequest): Locale {
  const value = request.nextUrl.searchParams.get("locale");
  return isLocale(value) ? value : defaultLocale;
}

async function unsubscribe(email: string, locale: Locale) {
  await recordSubscriber({ email, status: "unsubscribed", locale });
  await notifyOperator(`🚫 Obunadan chiqdi: ${email}`);
}

export async function GET(request: NextRequest) {
  const locale = localeFrom(request);
  const verified = verifyToken(request.nextUrl.searchParams.get("token"), "unsubscribe");
  if (!verified) {
    return NextResponse.redirect(`${siteOrigin()}/${locale}/email/preferences?status=invalid`);
  }

  await unsubscribe(verified.email, locale);
  return NextResponse.redirect(
    `${siteOrigin()}/${locale}/email/preferences?status=unsubscribed&email=${encodeURIComponent(verified.email)}`,
  );
}

export async function POST(request: NextRequest) {
  const verified = verifyToken(request.nextUrl.searchParams.get("token"), "unsubscribe");
  if (!verified) return new NextResponse("Invalid token", { status: 400 });

  await unsubscribe(verified.email, localeFrom(request));
  // The mail client shows its own confirmation; the body is never displayed.
  return new NextResponse("Unsubscribed", { status: 200 });
}
