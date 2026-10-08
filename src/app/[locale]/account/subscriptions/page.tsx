import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { assertAccountAreaExists } from "@/lib/account/gate";
import { SubscriptionsView } from "@/components/account/MySubscriptions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "subscription.manage" });
  return {
    ...buildPageMetadata({ locale, path: "/account/subscriptions", title: `${t("title")} — ${SITE_NAME}`, description: t("title") }),
    robots: { index: false, follow: false },
  };
}

export default async function SubscriptionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  assertAccountAreaExists();
  return <SubscriptionsView />;
}
