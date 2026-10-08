import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { InfoShell } from "@/components/info/InfoShell";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return buildPageMetadata({ locale, path: "/privacy", title: t("title"), description: t("intro") });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const sections = t.raw("sections") as { heading: string; body: string }[];

  return (
    <InfoShell crumb={t("title")}>
      <header className="flex flex-col gap-2 lg:gap-3">
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{t("title")}</h1>
        <p className="text-sm text-muted">{t("effective")}</p>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("intro")}</p>
      </header>
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2 rounded-[20px] border border-line p-5 lg:p-6">
            <h2 className="text-lg font-bold">{section.heading}</h2>
            <p className="whitespace-pre-line text-[15px] leading-6 text-ink-2">{section.body}</p>
          </section>
        ))}
      </div>
    </InfoShell>
  );
}
