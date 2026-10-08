import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { getAllProducts } from "@/lib/shop/all-products";
import { COMMERCE } from "@/lib/config/commerce";
import { SITE_URL } from "@/lib/seo/metadata";
import { listingMetadata } from "@/lib/seo/page-meta";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { brandBySlug } from "@/lib/content/product-brands";
import { getBrandInfos } from "@/lib/content/brand-info";
import { productCutout } from "@/lib/content/product-cutouts";
import { PRODUCT_UNITS, type DoseUnit } from "@/lib/content/product-units";
import { Chip } from "@/components/ui/Chip";
import { ProductGrid } from "@/components/home/HomeBlocks";

export const revalidate = 300;

type Params = Promise<{ locale: Locale; slug: string }>;

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Promise<{ form?: string }> }): Promise<Metadata> {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  const brand = brandBySlug(slug);
  if (!brand) return {};
  const [t, listing] = await Promise.all([
    getTranslations({ locale, namespace: "shop.brands" }),
    getAllProducts({ locale, sort: "popular" }),
  ]);
  const info = (await getBrandInfos(locale, listing.items)).find((b) => b.slug === slug);
  return listingMetadata({
    locale,
    kind: "brand",
    name: brand.name,
    path: `/brands/${slug}`,
    products: info?.products ?? [],
    fallbackDescription: t("products", { brand: brand.name }),
    filtered: Object.keys(query).length > 0,
  });
}

/*
  Design: BrandV3. The figures in the hero are the catalogue's own — how many
  of the brand's products are listed and the Tashkent delivery promise from
  COMMERCE. Form chips appear only for forms the catalogue knows.
*/
export default async function BrandPage({ params, searchParams }: { params: Params; searchParams: Promise<{ form?: string }> }) {
  const { locale, slug } = await params;
  const { form } = await searchParams;
  setRequestLocale(locale);
  if (!brandBySlug(slug)) notFound();

  const [t, tb, tp, ts, listing] = await Promise.all([
    getTranslations("pages.brands"),
    getTranslations("shop.brands"),
    getTranslations("product"),
    getTranslations("shop.v3"),
    getAllProducts({ locale, sort: "popular" }),
  ]);
  const brand = (await getBrandInfos(locale, listing.items)).find((b) => b.slug === slug);
  if (!brand || brand.products.length === 0) notFound();

  const products = [...brand.products].sort((a, b) => Number(!productCutout(a.slug)) - Number(!productCutout(b.slug)));
  const forms = new Map<DoseUnit, number>();
  for (const p of products) {
    const unit = PRODUCT_UNITS[p.slug]?.unit;
    if (unit) forms.set(unit, (forms.get(unit) ?? 0) + 1);
  }
  const activeForm = form === "tablet" || form === "capsule" ? form : null;
  const shown = activeForm ? products.filter((p) => PRODUCT_UNITS[p.slug]?.unit === activeForm) : products;
  const shots = products.map((p) => productCutout(p.slug)).filter((s): s is string => Boolean(s)).slice(0, 3);

  const facts = [
    { title: tb("originTitle"), text: tb("originText") },
    { title: tb("docsFactTitle"), text: tb("docsFactText") },
    { title: tb("importTitle"), text: tb("importText", { brand: brand.name }) },
  ];

  return (
    <div className="wrap flex flex-col gap-6 pb-9 pt-1 lg:gap-9 lg:pb-[72px] lg:pt-5">
      <JsonLd
        data={breadcrumbLd([
          { name: t("crumb"), url: `${SITE_URL}/${locale}/brands` },
          { name: brand.name, url: `${SITE_URL}/${locale}/brands/${slug}` },
        ])}
      />
      <nav aria-label={tp("breadcrumbHome")} className="hidden gap-2 text-sm text-muted lg:flex">
        <Link href="/" className="hover:text-ink">{tp("breadcrumbHome")}</Link>
        <span aria-hidden>/</span>
        <Link href="/brands" className="hover:text-ink">{t("crumb")}</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{brand.name}</span>
      </nav>

      <section className="grid items-center gap-6 rounded-[28px] bg-dark-panel px-6 py-8 text-white lg:-mt-4 lg:grid-cols-2 lg:rounded-[32px] lg:px-14 lg:py-12">
        <div className="flex flex-col gap-3 lg:gap-4">
          {brand.country && (
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-on-dark-2 lg:text-sm">
              {tb("eyebrow", { country: brand.country })}
            </span>
          )}
          <h1 className="text-[40px] font-bold leading-[44px] tracking-[-0.03em] lg:text-[64px] lg:leading-[66px]">{brand.name}</h1>
          {brand.text && <p className="max-w-[480px] text-base leading-6 text-on-dark-2 lg:text-lg lg:leading-[27px]">{brand.text}</p>}
          <div className="mt-2 flex gap-8">
            <span className="flex flex-col">
              <span className="text-[28px] font-bold lg:text-[32px]">{products.length}</span>
              <span className="text-sm text-on-dark-2">{tb("inCatalog")}</span>
            </span>
            <span className="flex flex-col">
              <span className="text-[28px] font-bold lg:text-[32px]">{tb("hours", { hours: COMMERCE.delivery.tashkent.hours })}</span>
              <span className="text-sm text-on-dark-2">{tb("delivery")}</span>
            </span>
          </div>
        </div>
        {shots.length > 0 && (
          <div aria-hidden className="hidden items-end justify-center lg:flex">
            {shots.map((src, i) => (
              <span
                key={src}
                className={
                  shots.length === 3 && i === 1
                    ? "relative z-[1] h-[260px] w-[260px]"
                    : `relative h-[200px] w-[200px] ${i === 0 && shots.length > 1 ? "-mr-[30px]" : ""} ${i === 2 ? "-ml-[30px]" : ""}`
                }
              >
                <Image src={src} alt="" fill sizes="260px" className="object-contain" />
              </span>
            ))}
          </div>
        )}
      </section>

      {forms.size > 1 && (
        <nav aria-label={ts("form")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          <Chip href={`/brands/${slug}`} active={!activeForm} count={products.length}>{tb("all")}</Chip>
          {[...forms].map(([unit, count]) => (
            <Chip key={unit} href={`/brands/${slug}?form=${unit}`} active={activeForm === unit} count={count}>
              {ts(unit === "tablet" ? "formTablet" : "formCapsule")}
            </Chip>
          ))}
        </nav>
      )}

      <section aria-label={tb("products", { brand: brand.name })}>
        <ProductGrid products={shown} mobileLimit={shown.length} />
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:gap-4">
        {facts.map((f) => (
          <div key={f.title} className="flex flex-col gap-2 rounded-[20px] bg-tile p-5 lg:p-7">
            <h2 className="text-lg font-bold lg:text-[19px]">{f.title}</h2>
            <p className="text-base leading-6 text-ink-2">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
