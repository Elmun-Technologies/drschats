import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { ProfileView } from "@/components/profile/ProfileView";

/*
  Per-visitor and noindex, like /account and /wishlist. Unlike /account this
  page has no API precondition — the profile it edits lives in the browser.
*/
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return {
    ...buildPageMetadata({
      locale,
      path: "/profile",
      title: `${t("title")} — ${SITE_NAME}`,
      description: t("subtitle"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProfileView />;
}
