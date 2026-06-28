import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, itemListLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.news" });
  return buildPageMetadata({ locale, path: "/news", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.news");
  const items = t.raw("items") as { title: string; text: string; meta: string }[];

  const [featured, ...rest] = items;

  return (
    <div className="pb-24">
      <JsonLd data={itemListLd(t("title"), items.map((i) => ({ name: i.title, description: i.text })))} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/news` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="mt-12">
        {/* Featured article */}
        {featured && (
          <Reveal>
            <div className="mb-10 flex flex-col overflow-hidden rounded-3xl border border-line bg-ink sm:flex-row">
              <div className="flex aspect-video shrink-0 items-center justify-center bg-accent-soft sm:aspect-auto sm:w-64">
                <svg viewBox="0 0 24 24" className="h-16 w-16 text-accent/40" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 20V14H7v6M7 4v4h8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col justify-center p-8">
                <span className="mb-3 w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
                  {featured.meta}
                </span>
                <h2 className="font-display text-2xl font-bold text-fg">{featured.title}</h2>
                <p className="mt-3 text-muted">{featured.text}</p>
              </div>
            </div>
          </Reveal>
        )}

        {/* Rest of news */}
        {rest.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((item, i) => (
              <Reveal key={item.title} index={i}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/40">
                  <span className="mb-3 w-fit rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-faint">
                    {item.meta}
                  </span>
                  <h3 className="font-display text-lg font-bold text-fg">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
