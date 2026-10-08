import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { getAllProducts } from "@/lib/shop/all-products";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, itemListLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { productCutout } from "@/lib/content/product-cutouts";
import { getBrandInfos } from "@/lib/content/brand-info";
import { buttonVariants } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { staticPageMetadata } from "@/lib/seo/page-meta";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "brands", "/brands");
}

/* Design: BrandsV3 — brand tiles with their pack shots, filtered by country. */
export default async function BrandsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { locale } = await params;
  const { country } = await searchParams;
  setRequestLocale(locale);

  const [t, tb, tp, tv, listing] = await Promise.all([
    getTranslations("pages.brands"),
    getTranslations("shop.brands"),
    getTranslations("product"),
    getTranslations("product.v3"),
    getAllProducts({ locale, sort: "popular" }),
  ]);
  const brands = await getBrandInfos(locale, listing.items);
  const countries = [...new Set(brands.map((b) => b.country).filter((c): c is string => Boolean(c)))];
  const shown = country ? brands.filter((b) => b.country === country) : brands;

  return (
    <div className="wrap flex flex-col gap-6 pb-9 pt-1 lg:gap-8 lg:pb-[72px] lg:pt-5">
      <JsonLd data={itemListLd(t("title"), brands.map((b) => ({ name: b.name, description: b.text ?? undefined })))} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/brands` }])} />
      <div className="flex flex-col gap-2 lg:gap-3.5">
        <nav aria-label={tp("breadcrumbHome")} className="hidden gap-2 text-sm text-muted lg:flex">
          <Link href="/" className="hover:text-ink">{tp("breadcrumbHome")}</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{t("crumb")}</span>
        </nav>
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{t("title")}</h1>
        <p className="max-w-[780px] text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("subtitle")}</p>
      </div>

      {countries.length > 1 && (
        <nav aria-label={tb("all")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          <Chip href="/brands" active={!country}>{tb("all")}</Chip>
          {countries.map((c) => (
            <Chip key={c} href={`/brands?country=${encodeURIComponent(c)}`} active={country === c}>
              {c}
            </Chip>
          ))}
        </nav>
      )}

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {shown.map((b) => {
          const shots = b.products.map((p) => productCutout(p.slug)).filter((s): s is string => Boolean(s)).slice(0, 2);
          const body = (
            <>
              {b.country && <span className="relative z-[1] text-sm font-semibold text-ink-2">{b.country}</span>}
              <span className="relative z-[1] text-[28px] font-bold leading-[34px] tracking-[-0.02em] lg:text-[34px] lg:leading-[38px]">{b.name}</span>
              {b.text && <span className="relative z-[1] max-w-[230px] text-[15px] leading-[22px] text-[#2E3236] lg:text-base lg:leading-[23px]">{b.text}</span>}
              {shots.length > 0 && (
                <span aria-hidden className="absolute bottom-[18px] right-5 flex items-end">
                  {shots.map((src, i) => (
                    <span key={src} className={i > 0 ? "relative -ml-[26px] h-[104px] w-[104px] lg:h-[120px] lg:w-[120px]" : "relative h-[104px] w-[104px] lg:h-[120px] lg:w-[120px]"}>
                      <Image src={src} alt="" fill sizes="120px" className="object-contain" />
                    </span>
                  ))}
                </span>
              )}
            </>
          );
          return b.products.length > 0 ? (
            <Link
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="relative flex min-h-[240px] flex-col gap-2 overflow-hidden rounded-[28px] bg-tile p-6 transition-colors hover:bg-tile-hover lg:min-h-[300px] lg:p-7"
            >
              {body}
              <span aria-hidden className="relative z-[1] mt-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </Link>
          ) : (
            <div key={b.slug} className="relative flex min-h-[240px] flex-col gap-2 overflow-hidden rounded-[28px] bg-tile p-6 lg:min-h-[300px] lg:p-7">
              {body}
            </div>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-line p-5 lg:px-8 lg:py-7">
        <div className="flex max-w-[760px] flex-col gap-1.5">
          <h2 className="text-xl font-bold">{tv("docsTitle")}</h2>
          <p className="text-base leading-6 text-ink-2">{tb("docsText")}</p>
        </div>
        <Link href="/licenses" className={buttonVariants("primary")}>
          {tb("docsCta")}
        </Link>
      </div>
    </div>
  );
}
