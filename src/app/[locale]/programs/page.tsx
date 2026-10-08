import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { loadProgramIndex } from "@/lib/content/program-loader";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { JsonLd, itemListLd } from "@/lib/seo/jsonld";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { DiscountBadge } from "@/components/ui/Price";

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
      <div className="wrap flex flex-col gap-8 pb-10 pt-4 lg:gap-10 lg:pb-20 lg:pt-8">
          <header className="flex flex-col gap-3">
            <span className="text-[15px] font-semibold text-ink-2">{t("plural")}</span>
            <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{t("indexTitle")}</h1>
            <p className="max-w-[760px] text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("indexSubtitle")}</p>
          </header>

          {entries.length === 0 ? (
            <p className="rounded-[20px] bg-tile px-6 py-8 text-center text-ink-2">{t("empty")}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {entries.map(({ program, products, pricing }) => (
                <li key={program.slug} className="h-full">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-[20px] bg-tile p-5 transition-colors hover:bg-tile-hover lg:p-6"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-7 items-center rounded-pill bg-bg px-2.5 text-[13px] font-semibold">
                        {t("duration", { days: program.durationDays })}
                      </span>
                      {program.discountPercent > 0 && <DiscountBadge percent={program.discountPercent} />}
                    </span>
                    <span className="text-xl font-bold leading-7 group-hover:underline">{program.name}</span>
                    <span className="text-[15px] leading-[22px] text-ink-2">{program.headline}</span>
                    {products.length > 0 && (
                      <span className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
                        <span className="text-sm text-muted">{t("includes", { count: products.length, days: program.durationDays })}</span>
                        <span className="flex flex-wrap items-baseline gap-2">
                          <span className="text-xl font-bold">{formatMoney(pricing.total, locale)}</span>
                          {pricing.saved > 0 && (
                            <span className="text-[15px] text-muted line-through">{formatMoney(pricing.subtotal, locale)}</span>
                          )}
                        </span>
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Disclaimer variant="product" />
      </div>
    </>
  );
}
