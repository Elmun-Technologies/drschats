import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "loyalty" });
  return buildPageMetadata({ locale, path: "/loyalty", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("loyalty");

  const tiers = [
    {
      label: "Standard",
      discount: "5%",
      threshold: "0",
      color: "border-line bg-surface",
      badge: "text-fg",
    },
    {
      label: "Silver",
      discount: "10%",
      threshold: "500 000",
      color: "border-accent/40 bg-accent-soft",
      badge: "text-accent-strong",
    },
    {
      label: "Gold",
      discount: "15%",
      threshold: "1 500 000",
      color: "border-gold/40 bg-gold/10",
      badge: "text-gold",
    },
  ];

  const points = [t("pointsNew"), t("pointsStandard"), t("pointsPromo")];

  return (
    <div className="pb-32 pt-10">
      <Container>
        {/* Hero */}
        <Reveal>
          <header className="max-w-2xl">
            <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-strong">
              {t("subtitle")}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{t("title")}</h1>
          </header>
        </Reveal>

        {/* Tier ladder */}
        <Reveal className="mt-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((tier, i) => (
              <div key={tier.label} className={`relative overflow-hidden rounded-2xl border p-6 ${tier.color}`}>
                {i === 2 && (
                  <div className="absolute right-4 top-4">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
                <span className={`text-xs font-bold uppercase tracking-widest ${tier.badge}`}>{tier.label}</span>
                <p className="mt-2 font-display text-3xl font-extrabold text-fg">{tier.discount}</p>
                <p className="mt-1 text-xs text-muted">chegirma</p>
                {tier.threshold !== "0" && (
                  <p className="mt-4 text-xs text-muted">
                    {tier.threshold} {`so'mdan`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Two program cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-accent/30 bg-accent-soft p-8">
              <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">15%</span>
              <h2 className="mt-4 font-display text-2xl font-bold">{t("privilegedTitle")}</h2>
              <p className="mt-3 flex-1 text-muted">{t("privilegedDesc")}</p>
              <p className="mt-4 rounded-xl border border-accent/20 bg-ink/40 p-4 text-sm text-muted">{t("privilegedClub")}</p>
            </div>
          </Reveal>

          <Reveal index={1}>
            <div className="flex h-full flex-col rounded-3xl border border-gold/30 bg-gold/10 p-8">
              <span className="w-fit rounded-full bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold">B2B</span>
              <h2 className="mt-4 font-display text-2xl font-bold">{t("consultantTitle")}</h2>
              <p className="mt-3 flex-1 text-muted">{t("consultantDesc")}</p>
              <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-fg">{t("consultantLegal")}</p>
            </div>
          </Reveal>
        </div>

        {/* Points system */}
        <section className="mt-16">
          <Reveal>
            <h2 className="font-display text-2xl font-bold">{t("pointsTitle")}</h2>
            <p className="mt-2 max-w-2xl text-muted">{t("pointsDesc")}</p>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {points.map((p, i) => (
              <Reveal key={p} index={i}>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-strong">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-fg">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <Link href="/contact" className={buttonVariants("primary", "lg")}>
            {t("cta")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
