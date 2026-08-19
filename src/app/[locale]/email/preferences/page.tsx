import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import {
  EmailPreferencesView,
  type PreferenceStatus,
} from "@/components/email/EmailPreferencesView";

export const dynamic = "force-dynamic";

const STATUSES: PreferenceStatus[] = [
  "confirmed",
  "unsubscribed",
  "verified",
  "verify-pending",
  "invalid",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailPreferences" });
  return {
    ...buildPageMetadata({
      locale,
      path: "/email/preferences",
      title: `${t("title")} — ${SITE_NAME}`,
      description: t("manage.description"),
    }),
    // Carries a signed token in the query string; nothing here should ever be
    // indexed, cached by a crawler or shared.
    robots: { index: false, follow: false },
  };
}

export default async function EmailPreferencesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ status?: string; token?: string; email?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const status = STATUSES.find((s) => s === query.status) ?? null;

  return <EmailPreferencesView status={status} token={query.token} email={query.email} />;
}
