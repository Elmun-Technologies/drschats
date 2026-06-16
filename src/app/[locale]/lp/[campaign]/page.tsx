import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { BestSellers } from "@/components/home/BestSellers";
import { TrustStats } from "@/components/home/TrustStats";
import { Marquee } from "@/components/animation/Marquee";

// Ad landing pages are not indexed (avoid duplicate content); they exist for
// paid context-ad traffic. UTM params are captured on the order for attribution.
export const metadata: Metadata = { robots: { index: false, follow: true } };
export const dynamicParams = true;

export default async function CampaignLanding({
  params,
}: {
  params: Promise<{ locale: Locale; campaign: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [bestsellers, t] = await Promise.all([
    shopflow.getProducts({ locale, sort: "popular", pageSize: 4 }),
    getTranslations("home"),
  ]);

  return (
    <>
      <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(31,209,123,0.18),transparent_60%)]" />
        <Container>
          <div className="mx-auto max-w-3xl py-24 text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              {t("cta.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{t("cta.subtitle")}</p>
            <Link href="/products" className={buttonVariants("primary", "lg") + " mt-10"}>
              {t("cta.button")}
            </Link>
          </div>
        </Container>
      </section>
      <Marquee text={t("marquee")} />
      <BestSellers products={bestsellers.items} />
      <TrustStats />
    </>
  );
}
