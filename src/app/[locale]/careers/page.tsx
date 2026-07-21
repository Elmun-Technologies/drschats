import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { PageHero } from "@/components/page/PageHero";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 3600;

type Benefit = { title: string; text: string };
type Value = { title: string; text: string };
type Position = { title: string; dept: string; type: string; location: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  return buildPageMetadata({ locale, path: "/careers", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

const BENEFIT_ICONS = [
  "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
];

const BENEFIT_TILES = [
  { bg: "bg-accent-soft", text: "text-accent-strong" },
  { bg: "bg-gold/10", text: "text-gold" },
  { bg: "bg-accent-soft", text: "text-accent-strong" },
  { bg: "bg-gold/10", text: "text-gold" },
  { bg: "bg-accent-soft", text: "text-accent-strong" },
  { bg: "bg-gold/10", text: "text-gold" },
];

const VALUE_ICONS = [
  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  "M13 10V3L4 14h7v7l9-11h-7z",
  "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
];

const VALUE_COLORS = [
  { bg: "bg-accent-soft", text: "text-accent-strong", border: "border-accent/20" },
  { bg: "bg-[#6366f1]/10", text: "text-[#6366f1]", border: "border-[#6366f1]/20" },
  { bg: "bg-gold/10", text: "text-gold", border: "border-gold/20" },
  { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
];

export default async function CareersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const benefits = t.raw("benefits") as Benefit[];
  const values = t.raw("values") as Value[];
  const positions = t.raw("positions") as Position[];

  return (
    <div className="pb-24">
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/careers` }])} />
      <JsonLd data={itemListLd(t("title"), positions.map((p) => ({ name: p.title, description: p.dept })))} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="pt-10">
        {/* Intro */}
        <Reveal>
          <p className="max-w-3xl text-lg leading-relaxed text-muted">{t("intro")}</p>
        </Reveal>

        {/* Benefits */}
        <Reveal>
          <h2 className="mt-16 font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("benefitsTitle")}</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const tile = BENEFIT_TILES[i % BENEFIT_TILES.length];
            return (
              <Reveal key={b.title} index={i}>
                <div className="h-full rounded-2xl border border-line bg-surface p-6">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tile.bg} ${tile.text}`}>
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={BENEFIT_ICONS[i % BENEFIT_ICONS.length]} />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{b.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Culture / values */}
        <Reveal>
          <h2 className="mt-20 font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("valuesTitle")}</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {values.map((v, i) => {
            const c = VALUE_COLORS[i % VALUE_COLORS.length];
            return (
              <Reveal key={v.title} index={i}>
                <div className={`h-full rounded-2xl border ${c.border} bg-ink p-7`}>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={VALUE_ICONS[i % VALUE_ICONS.length]} />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Open positions */}
        <Reveal>
          <h2 className="mt-20 font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("positionsTitle")}</h2>
        </Reveal>
        <div className="mt-8 space-y-4">
          {positions.map((p, i) => (
            <Reveal key={p.title} index={i}>
              <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm font-medium text-accent-strong">{p.dept}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink px-3 py-1 text-xs font-semibold text-fg">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {p.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink px-3 py-1 text-xs font-semibold text-muted">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <circle cx="12" cy="11" r="3" />
                      </svg>
                      {p.location}
                    </span>
                  </div>
                </div>
                <Link href="/contact" className={`${buttonVariants("primary", "sm")} shrink-0 self-start sm:self-auto`}>
                  {t("apply")}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Closing CTA */}
        <Reveal>
          <div className="mt-16 overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft p-8 sm:p-10">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-accent-strong sm:text-3xl">{t("ctaTitle")}</h2>
              <p className="mt-3 text-base leading-relaxed text-accent-strong/80">{t("ctaText")}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/contact" className={buttonVariants("primary", "lg")}>
                  {t("ctaButton")}
                </Link>
                <a
                  href="https://t.me/alimkhanov_pharm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants("secondary", "lg")}
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
