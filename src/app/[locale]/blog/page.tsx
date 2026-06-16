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
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildPageMetadata({ locale, path: "/blog", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  return (
    <div className="pt-32">
      <Container size="narrow">
        <Reveal>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">{t("title")}</h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-6 text-xl text-muted">{t("subtitle")}</p>
        </Reveal>
        <Reveal index={2}>
          <div className="my-32 rounded-2xl border border-dashed border-line bg-surface p-16 text-center text-muted">
            {t("comingSoon")}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
