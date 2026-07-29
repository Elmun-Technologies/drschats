import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { loadProgramIndex } from "@/lib/content/program-loader";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { JsonLd, itemListLd } from "@/lib/seo/jsonld";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Disclaimer } from "@/components/legal/Disclaimer";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "programs" });
  return buildPageMetadata({
    locale,
    path: "/programs",
    title: `${t("indexTitle")} — ${SITE_NAME}`,
    description: t("indexSubtitle"),
  });
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, entries] = await Promise.all([
    getTranslations("programs"),
    loadProgramIndex(locale),
  ]);

  return (
    <>
      <JsonLd
        data={itemListLd(
          t("indexTitle"),
          entries.map(({ program }) => ({ name: program.name, description: program.headline })),
        )}
      />
      <div className="pt-10 pb-6">
        <Container>
          <header className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">
              {t("plural")}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              {t("indexTitle")}
            </h1>
            <p className="mt-4 text-lg text-muted">{t("indexSubtitle")}</p>
          </header>

          {entries.length === 0 ? (
            <p className="py-24 text-center text-muted">{t("empty")}</p>
          ) : (
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(({ program, products, pricing }, i) => (
                <Reveal key={program.slug} index={Math.min(i, 6)} as="li" className="h-full">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-ink p-6 transition-all hover:-translate-y-0.5 hover:border-accent"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-strong">
                        {t("duration", { days: program.durationDays })}
                      </span>
                      {program.discountPercent > 0 && (
                        <span className="rounded-full bg-blue px-2.5 py-1 text-[11px] font-bold text-white">
                          −{program.discountPercent}%
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 font-display text-xl font-bold text-fg group-hover:text-accent-strong">
                      {program.name}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-accent-strong">{program.headline}</p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">{program.intro}</p>

                    {products.length > 0 && (
                      <div className="mt-5 border-t border-line pt-4">
                        <p className="text-xs text-faint">
                          {t("includes", { count: products.length, days: program.durationDays })}
                        </p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-2">
                          <span className="font-display text-lg font-bold text-accent-strong">
                            {formatMoney(pricing.total, locale)}
                          </span>
                          {pricing.saved > 0 && (
                            <span className="text-sm text-faint line-through">
                              {formatMoney(pricing.subtotal, locale)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}

          <div className="mt-16">
            <Disclaimer variant="product" />
          </div>
        </Container>
      </div>
    </>
  );
}
