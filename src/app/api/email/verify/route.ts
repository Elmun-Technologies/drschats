import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/routing";
import { siteOrigin } from "@/lib/email/config";
import { verifyToken } from "@/lib/email/token";
import { markAccountEmailVerified } from "@/lib/marketing/api";

/*
  Account email verification, clicked from the registration message.

  The link proves two things at once: that the address exists, and that the
  person who typed it can read it. Only then does the backend attach the
  address to the account — until the click it is a claim, not a contact.
*/

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const verified = verifyToken(request.nextUrl.searchParams.get("token"), "verify-account");
  if (!verified?.subject) {
    return NextResponse.redirect(`${siteOrigin()}/${locale}/email/preferences?status=invalid`);
  }

  const result = await markAccountEmailVerified({
    userId: verified.subject,
    email: verified.email,
  });

  // A null result means the accounts API is not configured or refused. The
  // address is still proven, but nothing stored it, and saying "verified"
  // would be a claim the system cannot back up.
  const status = result === null ? "verify-pending" : "verified";
  return NextResponse.redirect(`${siteOrigin()}/${locale}/email/preferences?status=${status}`);
}
