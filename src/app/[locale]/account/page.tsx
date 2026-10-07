import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { isApiConfigured } from "@/lib/api/client";
import { accountAreaAvailable } from "@/lib/config/demo";
import { AccountView } from "@/components/account/AccountView";

export const dynamic = "force-dynamic";

/*
  The account area exists only when it has something true to show: either the
  real API, or the demo cabinet switched on deliberately for a preview.

  Without this the route stayed reachable with neither, and rendered a sign-in
  form whose mock fallback accepts any phone number and any code and then shows
  somebody else's orders — see src/lib/config/demo.ts. TopBar already hides the
  link in that state, so the only way in was to guess the URL, and what you
  found there was a shop pretending to work.

  notFound() rather than a redirect: /account is not a page that moved, it is a
  page that does not currently exist, and a 404 says that while a redirect to
  the homepage quietly implies the shop has no cabinet at all.
*/
function assertAccountAreaExists() {
  if (!accountAreaAvailable(isApiConfigured())) notFound();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return {
    ...buildPageMetadata({
      locale,
      path: "/account",
      title: `${t("title")} — ${SITE_NAME}`,
      description: t("subtitle"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  assertAccountAreaExists();

  return <AccountView />;
}
