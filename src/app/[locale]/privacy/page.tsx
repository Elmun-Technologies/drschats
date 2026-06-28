import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

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
    <div className="pb-24 pt-10">
      <Container size="narrow">
        <Reveal>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-3 text-sm text-faint">{t("effective")}</p>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-6 text-base leading-relaxed text-muted">{t("intro")}</p>
        </Reveal>

        <div className="mt-12 space-y-10">
          {sections.map((section, i) => (
            <Reveal key={i} index={i + 3}>
              <div className="rounded-2xl border border-line bg-surface p-6">
                <h2 className="font-display text-lg font-bold text-fg">{section.heading}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{section.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal index={sections.length + 3}>
          <p className="mt-12 text-xs text-faint">
            © 2026 Dr. Schatz Store · Alimkhanov Pharm Group
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
