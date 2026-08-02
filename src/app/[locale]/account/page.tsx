import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { isApiConfigured } from "@/lib/api/client";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { AccountView } from "@/components/account/AccountView";

/*
  Rendered per request, not prerendered.

  Statically generating this page turns `notFound()` into a soft 404: the body
  says "not found" while the response says 200, which search engines treat as a
  real page. Nothing is lost by dropping the static variant — the content is
  per-visitor, noindex, and drawn entirely on the client.
*/
export const dynamic = "force-dynamic";

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

  // Without an API there is no account to show, and a page offering a sign-in
  // that cannot succeed is worse than no page at all. The header hides its
  // link under the same condition, so this is a backstop for a typed URL.
  if (!isApiConfigured()) notFound();

  return <AccountView />;
}
