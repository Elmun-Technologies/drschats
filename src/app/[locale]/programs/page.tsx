import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { loadProgramIndex, getProgramImage } from "@/lib/content/program-loader";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { JsonLd, itemListLd } from "@/lib/seo/jsonld";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Disclaimer } from "@/components/legal/Disclaimer";
import Image from "next/image";

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
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(({ program, products, pricing }, i) => (
                <Reveal key={program.slug} index={Math.min(i, 6)} as="li" className="h-full">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="group relative flex h-[460px] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-brand-deep transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-deep/20"
                  >
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={getProgramImage(program.slug)}
                        alt={program.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-brand-deep/20 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between p-6">
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="rounded-full bg-gold/20 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold">
                          {t("duration", { days: program.durationDays })}
                        </span>
                        {program.discountPercent > 0 && (
                          <span className="rounded-full bg-blue px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                            −{program.discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <h2 className="font-display text-2xl font-bold text-white transition-colors group-hover:text-gold drop-shadow-md">
                          {program.name}
                        </h2>
                        <p className="mt-2 text-sm font-medium text-white/90 drop-shadow-sm">{program.headline}</p>
                        
                        {products.length > 0 && (
                          <div className="mt-5 border-t border-white/20 pt-4">
                            <p className="text-[11px] uppercase tracking-widest font-bold text-white/50">
                              {t("includes", { count: products.length, days: program.durationDays })}
                            </p>
                            <div className="mt-2 flex flex-wrap items-baseline gap-2">
                              <span className="font-display text-xl font-bold text-white group-hover:text-gold transition-colors">
                                {formatMoney(pricing.total, locale)}
                              </span>
                              {pricing.saved > 0 && (
                                <span className="text-sm font-medium text-white/40 line-through">
                                  {formatMoney(pricing.subtotal, locale)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
