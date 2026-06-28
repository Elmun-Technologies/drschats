import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildPageMetadata({ locale, path: "/about", title: `${t("title")} — Alimkhanov`, description: t("lead") });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const values = ["quality", "trust", "care"] as const;

  return (
    <div className="pt-10">
      <Container size="narrow">
        <Reveal>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">{t("title")}</h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-6 text-xl text-muted">{t("lead")}</p>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-6 text-muted">{t("body")}</p>
        </Reveal>
      </Container>

      <Container>
        <div className="mb-32 mt-20 grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v} index={i}>
              <div className="h-full rounded-2xl border border-line bg-surface p-8">
                <h3 className="font-display text-xl font-semibold text-accent">{t(`values.${v}.title`)}</h3>
                <p className="mt-3 text-muted">{t(`values.${v}.description`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
