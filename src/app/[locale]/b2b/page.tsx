import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export const revalidate = 3600;

const PHONE = "+998 71 200 00 00";
const PHONE_HREF = "tel:+998712000000";
const TELEGRAM = "https://t.me/alimkhanov_pharm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "b2b" });
  return buildPageMetadata({
    locale,
    path: "/b2b",
    title: `${t("title")} — Alimkhanov`,
    description: t("subtitle"),
  });
}

const BENEFIT_ICONS = [
  "M3 3v18h18M8 15l3-4 3 2 4-6", // volume pricing / chart
  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", // certified
  "M9 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H3m10 11h4l3-4V9a2 2 0 00-2-2h-3", // logistics / truck
  "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", // manager / person
  "M13 10V3L4 14h7v7l9-11h-7z", // marketing / spark
  "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2m4-10h8a2 2 0 012 2v6a2 2 0 01-2 2h-8a2 2 0 01-2-2v-6a2 2 0 012-2zm5 5a1 1 0 11-2 0 1 1 0 012 0z", // flexible payment / wallet
];

const AUDIENCE_ICONS = [
  "M12 8v8m-4-4h8M4 21V7a2 2 0 012-2h12a2 2 0 012 2v14M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4", // pharmacy
  "M19 14l-7 7-7-7a4.5 4.5 0 016.36-6.36L12 8.5l.64-.86A4.5 4.5 0 0119 14z", // clinic / heart
  "M6.5 6.5l11 11m-8-14l3 3m-6 6l3 3m8-11l-3 3m6 6l-3 3M3 12h2m14 0h2", // gym / dumbbell
  "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z", // shop / cart
];

export default async function B2BPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("b2b");

  const benefits = t.raw("benefits") as { title: string; text: string }[];
  const tiers = t.raw("tiers") as { volume: string; discount: string; note: string }[];
  const audience = t.raw("audience") as { label: string }[];
  const steps = t.raw("steps") as string[];

  const tierAccents = [
    { card: "border-line bg-surface", badge: "text-fg", value: "text-fg" },
    { card: "border-accent/40 bg-accent-soft", badge: "text-accent-strong", value: "text-accent-strong" },
    { card: "border-gold/40 bg-gold/10", badge: "text-gold", value: "text-gold" },
  ];

  return (
    <div className="pb-28">
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/b2b` }])} />
      <JsonLd data={itemListLd(t("benefitsTitle"), benefits.map((b) => ({ name: b.title, description: b.text })))} />

      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="mt-14">
        {/* Hero value band */}
        <Reveal>
          <section className="overflow-hidden rounded-3xl border border-accent/30 bg-accent-soft p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
                  {t("eyebrow")}
                </span>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg">{t("intro")}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/contact" className={buttonVariants("primary", "lg")}>
                    {t("ctaPrimary")}
                  </Link>
                  <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className={buttonVariants("secondary", "lg")}>
                    {t("ctaSecondary")}
                  </a>
                </div>
              </div>

              <div className="grid gap-3">
                {tiers.map((tier, i) => (
                  <div
                    key={tier.volume}
                    className={`flex items-center justify-between rounded-2xl border bg-ink/50 px-5 py-4 ${
                      i === tiers.length - 1 ? "border-gold/40" : "border-line"
                    }`}
                  >
                    <span className="text-sm font-medium text-muted">{tier.volume}</span>
                    <span
                      className={`font-display text-2xl font-extrabold ${
                        i === tiers.length - 1 ? "text-gold" : "text-accent-strong"
                      }`}
                    >
                      −{tier.discount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Benefits */}
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("benefitsTitle")}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <Reveal key={b.title} index={i}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6">
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
                      i % 2 === 0 ? "bg-accent-soft text-accent" : "bg-gold/15 text-gold"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d={BENEFIT_ICONS[i] ?? ""} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold text-fg">{b.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Volume tiers */}
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("tiersTitle")}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {tiers.map((tier, i) => {
              const a = tierAccents[i] ?? tierAccents[0];
              const isTop = i === tiers.length - 1;
              return (
                <Reveal key={tier.volume} index={i}>
                  <div className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 ${a.card}`}>
                    {isTop && (
                      <div className="absolute right-4 top-4">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    )}
                    <span className={`text-xs font-bold uppercase tracking-widest ${a.badge}`}>{tier.volume}</span>
                    <p className={`mt-3 font-display text-4xl font-extrabold ${a.value}`}>−{tier.discount}</p>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{tier.note}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Audience */}
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("audienceTitle")}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audience.map((item, i) => (
              <Reveal key={item.label} index={i}>
                <div className="flex h-full flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d={AUDIENCE_ICONS[i] ?? ""} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-fg">{item.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How to start */}
        <Reveal className="mt-20">
          <div className="rounded-3xl border border-line bg-ink p-8 sm:p-10">
            <h2 className="mb-10 font-display text-2xl font-bold sm:text-3xl">{t("stepsTitle")}</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-display text-lg font-extrabold text-ink">
                    {i + 1}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Closing CTA */}
        <Reveal className="mt-20">
          <section className="overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-8 text-center sm:p-14">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">{t("ctaText")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className={buttonVariants("gold", "lg")}>
                {t("ctaButton")}
              </Link>
              <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className={buttonVariants("secondary", "lg")}>
                Telegram
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <a href={PHONE_HREF} className="font-semibold text-fg hover:text-accent-strong">
                {PHONE}
              </a>
              <span className="text-faint">•</span>
              <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="hover:text-accent-strong">
                @alimkhanov_pharm
              </a>
            </div>
          </section>
        </Reveal>
      </Container>
    </div>
  );
}
