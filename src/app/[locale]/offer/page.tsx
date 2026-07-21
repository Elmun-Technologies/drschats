import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offer" });
  return buildPageMetadata({ locale, path: "/offer", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function OfferPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("offer");
  const sections = t.raw("sections") as { heading: string; body: string }[];

  return (
    <div className="pb-24 pt-10">
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/offer` }])} />
      <Container size="narrow">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">{t("eyebrow")}</p>
        </Reveal>
        <Reveal index={1}>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-3 text-base leading-relaxed text-muted">{t("subtitle")}</p>
        </Reveal>
        <Reveal index={3}>
          <p className="mt-4 text-sm text-faint">{t("effective")}</p>
        </Reveal>
        <Reveal index={4}>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted">{t("intro")}</p>
        </Reveal>

        <div className="mt-12 space-y-8">
          {sections.map((section, i) => (
            <Reveal key={i} index={i + 5}>
              <div className="rounded-2xl border border-line bg-surface p-6">
                <h2 className="font-display text-lg font-bold text-fg">
                  {i + 1}. {section.heading}
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{section.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal index={sections.length + 5}>
          <div className="mt-12 rounded-2xl border border-line-strong bg-surface-2 p-6">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{t("requisitesNote")}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/requisites" className={buttonVariants("secondary", "md")}>
                {t("requisitesCta")}
              </Link>
              <Link href="/contact" className={buttonVariants("primary", "md")}>
                {t("supportCta")}
              </Link>
            </div>
            <p className="mt-4 text-xs text-faint">{t("supportNote")}</p>
          </div>
        </Reveal>

        <Reveal index={sections.length + 6}>
          <p className="mt-10 text-xs text-faint">© 2026 Dr. Schatz Store · Alimkhanov Pharm Group</p>
        </Reveal>
      </Container>
    </div>
  );
}
