import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, itemListLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { PageHero } from "@/components/page/PageHero";
import { StarRating } from "@/components/ui/StarRating";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 3600;

interface Review {
  name: string;
  city: string;
  rating: number;
  product: string;
  text: string;
  date: string;
  initial: string;
}

const AVATAR_TONES = [
  "bg-accent-soft text-accent-strong",
  "bg-blue-soft text-blue",
  "bg-gold/15 text-gold",
  "bg-[#6366f1]/10 text-[#6366f1]",
  "bg-rose-500/10 text-rose-500",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviewsPage" });
  return buildPageMetadata({
    locale,
    path: "/reviews",
    title: `${t("title")} — Alimkhanov`,
    description: t("subtitle"),
  });
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reviewsPage");

  const items = t.raw("items") as Review[];
  const stats = t.raw("stats") as { value: string; label: string }[];
  const distribution = t.raw("distribution") as number[];

  return (
    <div className="pb-24">
      <JsonLd data={itemListLd(t("title"), items.map((r) => ({ name: `${r.name} — ${r.product}`, description: r.text })))} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/reviews` }])} />

      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="pt-12">
        {/* Rating summary hero */}
        <Reveal>
          <div className="grid gap-8 rounded-3xl border border-line bg-surface p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-14">
            <div className="flex flex-col items-center justify-center text-center lg:border-r lg:border-line lg:pr-14">
              <div className="font-display text-6xl font-extrabold leading-none text-accent-strong sm:text-7xl">
                {t("average")}
              </div>
              <div className="mt-4">
                <StarRating rating={Number(t("average"))} className="justify-center" />
              </div>
              <p className="mt-3 max-w-[16rem] text-sm text-muted">{t("totalLabel")}</p>
            </div>

            <div className="flex flex-col justify-center gap-2.5">
              {distribution.map((pct, i) => {
                const star = 5 - i;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="flex w-12 shrink-0 items-center gap-1 text-sm font-medium text-muted">
                      {star}
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-gold" aria-hidden>
                        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z" />
                      </svg>
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm tabular-nums text-faint">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Review cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <Reveal key={`${r.name}-${i}`} index={i % 3} as="article">
              <div className="flex h-full flex-col rounded-2xl border border-line bg-ink p-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                    aria-hidden
                  >
                    {r.initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-fg">{r.name}</p>
                    <p className="truncate text-sm text-faint">{r.city}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StarRating rating={r.rating} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-strong">
                    <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current" aria-hidden>
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z" />
                    </svg>
                    {t("verifiedBadge")}
                  </span>
                </div>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent-strong">{r.product}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{r.text}</p>
                <p className="mt-4 border-t border-line pt-3 text-xs text-faint">{r.date}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Trust band */}
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} index={i}>
              <div className="rounded-2xl border border-line bg-ink p-6 text-center">
                <div className="font-display text-3xl font-extrabold text-accent-strong sm:text-4xl">{s.value}</div>
                <div className="mt-2 text-sm font-medium text-muted">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal>
          <div className="mt-16 rounded-3xl border border-accent/20 bg-accent-soft px-7 py-10 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl font-display text-2xl font-extrabold text-accent-strong sm:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-accent-strong/80">{t("ctaText")}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/products" className={buttonVariants("primary", "lg")}>{t("ctaShop")}</Link>
              <Link href="/contact" className={buttonVariants("secondary", "lg")}>{t("ctaWrite")}</Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
