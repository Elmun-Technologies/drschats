import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, organizationLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { PageHero } from "@/components/page/PageHero";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return buildPageMetadata({ locale, path: "/about", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

const VALUE_ICONS = [
  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
];

const VALUE_COLORS = [
  { bg: "bg-accent-soft", text: "text-accent-strong", border: "border-accent/20" },
  { bg: "bg-[#6366f1]/10", text: "text-[#6366f1]", border: "border-[#6366f1]/20" },
  { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
];

const CERTS = ["cGMP", "ISO 22000", "Halal", "IFOS"];

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");
  const stats = t.raw("stats") as { value: string; label: string }[];
  const values = t.raw("values") as { title: string; text: string }[];

  return (
    <div className="pb-24">
      <JsonLd data={organizationLd()} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/about` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="pt-10">
        {/* Intro text */}
        <Reveal>
          <p className="max-w-3xl text-lg leading-relaxed text-muted">{t("intro")}</p>
        </Reveal>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} index={i}>
              <div className="rounded-2xl border border-line bg-ink p-6 text-center">
                <div className="font-display text-3xl font-extrabold text-accent-strong sm:text-4xl">{s.value}</div>
                <div className="mt-2 text-sm font-medium text-muted">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mission banner */}
        <Reveal index={4}>
          <div className="mt-6 rounded-2xl border border-accent/20 bg-accent-soft px-6 py-5">
            <p className="text-sm font-medium leading-relaxed text-accent-strong">{t("mission")}</p>
          </div>
        </Reveal>

        {/* Values */}
        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {values.map((v, i) => {
            const c = VALUE_COLORS[i % VALUE_COLORS.length];
            return (
              <Reveal key={v.title} index={i}>
                <div className={`rounded-2xl border ${c.border} bg-ink p-7`}>
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

        {/* Certifications strip */}
        <Reveal index={5}>
          <div className="mt-14 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-5">
            <span className="mr-2 text-xs font-semibold uppercase tracking-widest text-faint">
              {locale === "ru" ? "Сертификаты" : "Sertifikatlar"}
            </span>
            {CERTS.map((c) => (
              <span key={c} className="rounded-full border border-line bg-ink px-4 py-1.5 text-sm font-semibold text-fg">
                {c}
              </span>
            ))}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
