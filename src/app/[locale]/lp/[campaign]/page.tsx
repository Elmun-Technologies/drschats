import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { BestSellers } from "@/components/home/BestSellers";
import { TrustRibbon } from "@/components/home/TrustRibbon";
import { Marquee } from "@/components/animation/Marquee";

// Ad landing pages are not indexed (avoid duplicate content); they exist for
// paid context-ad traffic. UTM params are captured on the order for attribution.
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("cta.title"), robots: { index: false, follow: true } };
}

export default async function CampaignLanding({
  params,
}: {
  params: Promise<{ locale: Locale; campaign: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [bestsellers, t] = await Promise.all([
    shopflow.getProducts({ locale, sort: "popular", pageSize: 4, assortment: "core" }),
    getTranslations("home"),
  ]);

  return (
    <>
      <section className="relative flex items-center overflow-hidden bg-tile">
        <Container>
          <div className="mx-auto max-w-3xl py-14 text-center lg:py-20">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong/30 bg-bg px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {t("cta.title")}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-2">{t("cta.subtitle")}</p>
            <Link href="/products" className={buttonVariants("dark", "lg") + " mt-10"}>
              {t("cta.button")}
            </Link>
          </div>
        </Container>
      </section>
      <Marquee text={t("marquee")} />
      <BestSellers products={bestsellers.items} />
      <TrustRibbon />
    </>
  );
}
