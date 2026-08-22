import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { LoyaltyJourney } from "@/components/loyalty/LoyaltyJourney";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "loyalty" });
  return buildPageMetadata({ locale, path: "/loyalty", title: `${t("title")} — Go Vita`, description: t("subtitle") });
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
      tone: "border-line bg-ink",
      badge: "text-fg",
    },
    {
      label: "Silver",
      discount: "10%",
      threshold: "500 000",
      tone: "border-gold/25 bg-gold-soft/45",
      badge: "text-gold-ink",
    },
    {
      label: "Gold",
      discount: "15%",
      threshold: "1 500 000",
      tone: "border-gold/50 bg-gold-soft",
      badge: "text-gold-ink",
    },
  ];

  const journey = [
    {
      title: t("journeyRegisterTitle"),
      description: t("journeyRegisterText"),
      icon: "profile" as const,
    },
    {
      title: t("journeyBuyTitle"),
      description: t("journeyBuyText"),
      icon: "product" as const,
    },
    {
      title: t("journeyRewardsTitle"),
      description: t("journeyRewardsText"),
      icon: "rewards" as const,
    },
  ];

  const points = [t("pointsNew"), t("pointsStandard"), t("pointsPromo")];

  return (
    <div className="pb-24 sm:pb-32">
      <LoyaltyJourney
        title={t("journeyTitle")}
        subtitle={t("journeySubtitle")}
        cta={t("join")}
        steps={journey}
      />

      <Container>
        {/* Discount levels retain the programme detail but use the same warm,
            editorial geometry as the registration path above. */}
        <section aria-labelledby="loyalty-benefits-title" className="border-t border-line pt-16 sm:pt-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold-ink">Go Vita club</p>
              <h2 id="loyalty-benefits-title" className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("benefitsTitle")}
              </h2>
              <p className="mt-4 text-muted">{t("benefitsDesc")}</p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {tiers.map((tier, index) => (
              <Reveal key={tier.label} index={index} className="h-full">
                <article className={`relative flex h-full min-h-56 flex-col overflow-hidden rounded-t-[4.5rem] rounded-b-2xl border p-7 pt-10 ${tier.tone}`}>
                  <span className={`text-xs font-extrabold uppercase tracking-[0.18em] ${tier.badge}`}>{tier.label}</span>
                  <p className="mt-5 font-display text-5xl font-extrabold tracking-tight text-fg">{tier.discount}</p>
                  <p className="mt-1 text-sm text-muted">{t("discount")}</p>
                  <div className="mt-auto border-t border-line/70 pt-4 text-sm text-muted">
                    {tier.threshold === "0" ? t("tierStart") : t("fromAmount", { amount: tier.threshold })}
                  </div>
                  {index === 2 && (
                    <svg viewBox="0 0 24 24" aria-hidden className="absolute right-7 top-7 h-7 w-7 text-gold" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Programme options */}
        <section aria-labelledby="loyalty-options-title" className="mt-16 sm:mt-24">
          <Reveal>
            <h2 id="loyalty-options-title" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("title")}
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Reveal className="h-full">
              <article className="relative flex h-full flex-col overflow-hidden rounded-t-[5rem] rounded-b-3xl border border-gold/25 bg-gold-soft/45 p-8 sm:p-10">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border-[18px] border-gold/15" />
                <span className="relative w-fit rounded-md bg-gold px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.13em] text-brand-deep">15%</span>
                <h3 className="relative mt-6 font-display text-2xl font-extrabold">{t("privilegedTitle")}</h3>
                <p className="relative mt-3 flex-1 leading-relaxed text-muted">{t("privilegedDesc")}</p>
                <p className="relative mt-6 rounded-xl border border-gold/25 bg-ink/70 p-4 text-sm leading-relaxed text-muted">{t("privilegedClub")}</p>
              </article>
            </Reveal>

            <Reveal index={1} className="h-full">
              <article className="relative flex h-full flex-col overflow-hidden rounded-t-[5rem] rounded-b-3xl border border-line bg-surface p-8 sm:p-10">
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-[16px] border-gold/15" />
                <span className="relative w-fit rounded-md border border-gold/35 bg-ink px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.13em] text-gold-ink">B2B</span>
                <h3 className="relative mt-6 font-display text-2xl font-extrabold">{t("consultantTitle")}</h3>
                <p className="relative mt-3 flex-1 leading-relaxed text-muted">{t("consultantDesc")}</p>
                <p className="relative mt-6 rounded-xl border border-line bg-ink/70 p-4 text-sm leading-relaxed text-muted">{t("consultantLegal")}</p>
              </article>
            </Reveal>
          </div>
        </section>

        {/* Points system */}
        <section aria-labelledby="loyalty-points-title" className="mt-16 rounded-t-[5rem] border border-line bg-surface px-6 py-12 sm:mt-24 sm:px-10 sm:py-14">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold-ink">Go Vita club</p>
              <h2 id="loyalty-points-title" className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("pointsTitle")}</h2>
              <p className="mt-3 leading-relaxed text-muted">{t("pointsDesc")}</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {points.map((point, index) => (
              <Reveal key={point} index={index} className="h-full">
                <div className="flex h-full items-start gap-4 rounded-2xl border border-line/80 bg-ink p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft font-display text-lg font-extrabold text-gold-ink">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm font-semibold leading-relaxed text-fg">{point}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <div className="mt-10 flex justify-center">
            <Link href="/account" className={buttonVariants("gold", "lg")}>
              {t("join")}
            </Link>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
