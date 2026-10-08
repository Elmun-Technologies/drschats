import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Category, Product, UpsellOffer } from "@/lib/shopflow/types";
import type { Expert } from "@/lib/content/experts";
import type { HealthTopic } from "@/lib/content/health-topics";
import { Link } from "@/lib/i18n/navigation";
import { BRAND } from "@/lib/brand";
import { COMMERCE } from "@/lib/config/commerce";
import { ONLINE_PROVIDERS } from "@/lib/config/payments";
import { productBrand } from "@/lib/content/product-brands";
import { productCutout } from "@/lib/content/product-cutouts";
import { PRODUCT_UNITS } from "@/lib/content/product-units";
import { formatMoney, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { DiscountBadge, discountPercent } from "@/components/ui/Price";
import { buttonVariants } from "@/components/ui/Button";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { ProductGallery, type GalleryImage } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductBuyBar, ProductMiniCard } from "@/components/product/ProductMiniBuy";
import { ProductSection } from "@/components/product/ProductSection";
import { ProductSectionNav } from "@/components/product/ProductSectionNav";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ShareButton } from "@/components/product/ShareButton";
import { UpsellRail } from "@/components/product/UpsellRail";
import { HealthContext } from "@/components/product/HealthContext";
import { DoctorVideo } from "@/components/product/DoctorVideo";

/** Yellow pills: the price guarantee and "Xit" — nothing else gets the colour. */
const YELLOW_BADGES = new Set(["Arzon narx kafolati", "Гарантия низкой цены", "Bestseller", "Хит продаж", "Xit", "Хит"]);

/*
  The product page (design: ProductV3, ProductMobileV3, ProductMobileFirstV3).

  Desktop: breadcrumb and title over three columns — gallery, key specs, buy
  card with delivery — then sticky section tabs over the description sections
  with a sticky mini buy card beside them. Phone: the same blocks restacked
  (gallery, title, buy, delivery, specs), the long sections as accordion rows,
  and a fixed buy bar above the tab bar.

  Every spec row is read from the catalogue. The design's "Kunlik doza",
  "Yosh", "Qadoq yetadi" and importer rows have no field behind them, so they
  are not drawn rather than invented.
*/
export async function ProductTemplate({
  product,
  category,
  upsells,
  locale,
  reviewer,
  topics = [],
}: {
  product: Product;
  category?: Category;
  upsells: UpsellOffer[];
  locale: Locale;
  reviewer?: Expert | null;
  topics?: HealthTopic[];
}) {
  const t = await getTranslations("product");
  const v3 = await getTranslations("product.v3");
  const tc = await getTranslations("common");
  const shop = await getTranslations("shop.v3");
  const header = await getTranslations("header");
  const delivery = await getTranslations("delivery");

  const brand = productBrand(product.slug);
  const pack = PRODUCT_UNITS[product.slug];
  const cutout = productCutout(product.slug);
  const discount = discountPercent(product.price, product.oldPrice);
  const yellow = product.badges.filter((b) => YELLOW_BADGES.has(b));

  const images: GalleryImage[] = [
    ...(cutout ? [{ url: cutout, alt: product.name, cutout: true }] : []),
    ...product.images.slice(cutout ? 1 : 0).map((img, i) => ({
      url: img.url,
      alt: img.alt || v3("photo", { name: product.name, index: i + 2 }),
    })),
  ];
  const descriptionPhoto = product.images.length > 1 ? product.images[product.images.length - 1] : undefined;

  const specs = [
    brand && { label: v3("brand"), value: brand.name },
    product.origin && { label: v3("specOrigin"), value: product.origin },
    pack && { label: v3("specForm"), value: shop(pack.unit === "tablet" ? "formTablet" : "formCapsule") },
    product.servings && { label: v3("specPack"), value: String(product.servings) },
  ].filter((s): s is { label: string; value: string } => Boolean(s));

  const perDose = pack ? v3(pack.unit === "tablet" ? "perTablet" : "perCapsule") : null;
  const hasReviews = product.reviews.length > 0;
  const hasComposition = product.ingredients.length > 0;

  const sections = [
    { id: "tavsif", label: v3("tabDescription") },
    hasComposition && { id: "tarkib", label: v3("tabComposition") },
    product.howToUse && { id: "qabul", label: v3("tabHowTo") },
    specs.length > 0 && { id: "xususiyatlar", label: v3("tabSpecs") },
    product.faq.length > 0 && { id: "savollar", label: `${v3("tabQa")} · ${product.faq.length}` },
    { id: "sharhlar", label: `${v3("tabReviews")} · ${product.reviews.length}` },
    { id: "hujjatlar", label: v3("tabDocs") },
  ].filter((s): s is { id: string; label: string } => Boolean(s));

  const fee = formatMoney(COMMERCE.shippingFee, locale);
  const freeFrom = v3("freeFrom", { amount: formatNumber(COMMERCE.freeShippingOver) });
  const payment = [...ONLINE_PROVIDERS.map((p) => p.label), delivery("payCod")].join(", ");

  return (
    <div className="flex flex-col gap-10 pt-3 lg:gap-14 lg:pb-[72px] lg:pt-5">
      <div className="wrap grid gap-x-9 gap-y-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_384px] lg:[grid-template-areas:'head_head_head'_'gal_spec_buy']">
        {/* Head: crumbs, title, meta row */}
        <div className="contents lg:flex lg:flex-col lg:gap-3.5 lg:[grid-area:head]">
          <div className="order-1 flex items-center gap-2 lg:order-none">
            <nav aria-label={t("breadcrumbHome")} className="hidden flex-wrap gap-2 text-sm text-muted lg:flex">
              <Link href="/" className="hover:text-ink">{t("breadcrumbHome")}</Link>
              <span aria-hidden>/</span>
              <Link href="/products" className="hover:text-ink">{header("catalog")}</Link>
              {category && (
                <>
                  <span aria-hidden>/</span>
                  <Link href={`/products/${category.slug}`} className="hover:text-ink">{category.name}</Link>
                </>
              )}
            </nav>
            <Link
              href={category ? `/products/${category.slug}` : "/products"}
              className="-ml-1 inline-flex min-h-11 items-center gap-1 pr-2 text-[15px] text-ink-2 lg:hidden"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
              {category?.name ?? header("catalog")}
            </Link>
            <span className="flex-1 lg:hidden" />
            <WishlistButton productId={product.id} className="h-11 w-11 lg:hidden" />
            <ShareButton name={product.name} className="h-11 w-11 lg:hidden" />
          </div>

          <div className="order-3 flex flex-col gap-2.5 lg:order-none lg:gap-3.5">
            <h1 className="text-[22px] font-bold leading-7 lg:max-w-[920px] lg:text-[32px] lg:leading-[38px]">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[15px] text-ink-2">
              <a href="#sharhlar" className="inline-flex min-h-6 items-center hover:text-ink">
                {hasReviews ? tc("reviews", { count: product.reviewCount }) : v3("noReviews")}
              </a>
              {product.faq.length > 0 && (
                <a href="#savollar" className="inline-flex min-h-6 items-center hover:text-ink">
                  {v3("questions", { count: product.faq.length })}
                </a>
              )}
              {brand && (
                <span>
                  <span className="hidden lg:inline">{v3("brand")}: </span>
                  <Link href={`/products?brand=${brand.slug}`} className="font-semibold text-ink underline underline-offset-4">
                    {brand.name}
                  </Link>
                </span>
              )}
              <span className="hidden flex-1 lg:block" />
              <WishlistButton productId={product.id} showLabel className="hidden min-h-6 lg:flex" />
              <ShareButton name={product.name} showLabel className="hidden min-h-6 lg:flex" />
            </div>
            {reviewer && <ReviewedBy expert={reviewer} />}
          </div>
        </div>

        <div className="order-2 lg:order-none lg:[grid-area:gal]">
          <ProductGallery
            images={images}
            badges={
              discount > 0 || yellow.length > 0 ? (
                <>
                  <DiscountBadge percent={discount} className="h-[30px] px-3 text-[15px]" />
                  {yellow.map((b) => (
                    <Badge key={b} tone="hit" className="h-[30px] px-3 text-[15px]">{b}</Badge>
                  ))}
                </>
              ) : undefined
            }
          />
        </div>

        <div className="order-4 flex flex-col gap-3 lg:order-none lg:[grid-area:buy]">
          <BuyBox product={product} />
          <DeliveryPanel
            rows={[
              { icon: ICONS.truck, title: delivery("tashkentTitle"), price: fee, note: `${delivery("tashkentTime")} · ${freeFrom}` },
              { icon: ICONS.store, title: delivery("pickupTitle"), price: delivery("pickupTime"), note: delivery("pickupFree") },
              { icon: ICONS.box, title: delivery("regionsTitle"), price: fee, note: `${delivery("regionsTime")} · ${freeFrom}` },
              { icon: ICONS.card, title: delivery("paymentTitle"), note: payment },
            ]}
          />
        </div>

        {specs.length > 0 && (
          <div className="order-5 flex flex-col gap-6 lg:order-none lg:[grid-area:spec]">
            {product.servings && (
              <div className="hidden flex-col gap-2.5 lg:flex">
                <span className="text-[17px] font-bold">{v3("packSize")}</span>
                <span className="inline-flex h-10 w-fit items-center rounded-sm bg-ink px-4 text-[15px] font-medium text-white">
                  {product.servings}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <h2 className="text-[22px] font-bold leading-7 lg:text-[17px] lg:leading-normal">{v3("keySpecs")}</h2>
              <SpecRows rows={specs} />
              <a href="#xususiyatlar" className="hidden items-center gap-1 text-[15px] font-semibold lg:inline-flex">
                {v3("allSpecs")}
                <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </a>
            </div>
            {hasComposition && (
              <div className="hidden flex-col gap-2 rounded-[20px] bg-tile px-5 py-[18px] lg:flex">
                <span className="text-[15px] font-bold">{perDose ? `${v3("composition")}, ${perDose}` : v3("composition")}</span>
                <span className="text-[15px] leading-[23px] text-ink-2">
                  {product.ingredients.map((i) => `${i.name} ${i.amount}`).join(" · ")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <ProductSectionNav label={v3("sections")} items={sections} />

      <div className="wrap grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_384px]">
        <div className="flex min-w-0 flex-col gap-8 lg:gap-12">
          <ProductSection id="tavsif" title={v3("tabDescription")} collapsible className="order-3 lg:order-1">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="flex flex-col gap-4">
                <p className="text-lead text-ink-2">{product.description}</p>
                {product.highlights.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {product.highlights.map((h) => (
                      <li key={h} className="inline-flex h-10 items-center rounded-sm bg-tile px-4 text-[15px] font-medium">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <HealthContext topics={topics} />
              </div>
              {descriptionPhoto && (
                <div className="relative hidden aspect-[3/4] overflow-hidden rounded-[20px] bg-tile lg:block">
                  <Image src={descriptionPhoto.url} alt={descriptionPhoto.alt} fill sizes="260px" className="object-cover" />
                </div>
              )}
            </div>
            {await DoctorVideo({ slug: product.slug, locale })}
          </ProductSection>

          {hasComposition && (
            <ProductSection
              id="tarkib"
              title={perDose ? `${v3("tabComposition")}, ${perDose}` : v3("tabComposition")}
              className="order-1 lg:order-2"
            >
              <table className="w-full border-collapse text-left text-[15px] lg:text-base">
                <thead>
                  <tr className="text-sm text-muted">
                    <th scope="col" className="py-2 pr-3 font-normal">{perDose ?? v3("ingredient")}</th>
                    <th scope="col" className="py-2 pr-3 font-normal lg:w-[26%]">{t("ingredientAmount")}</th>
                    <th scope="col" className="py-2 text-right font-normal lg:w-[26%] lg:text-left">{t("ingredientDV")}</th>
                  </tr>
                </thead>
                <tbody>
                  {product.ingredients.map((row) => (
                    <tr key={row.name} className="border-t border-line">
                      <th scope="row" className="py-3.5 pr-3 font-semibold">{row.name}</th>
                      <td className="py-3.5 pr-3">{row.amount}</td>
                      <td className="py-3.5 text-right lg:text-left">{row.dailyValue ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ProductSection>
          )}

          {product.howToUse && (
            <ProductSection id="qabul" title={v3("tabHowTo")} className="order-2 lg:order-3">
              <div className="flex flex-col gap-4">
                <p className="rounded-[20px] bg-tile p-5 text-[17px] font-semibold leading-6">{product.howToUse}</p>
                <Disclaimer variant="product" />
              </div>
            </ProductSection>
          )}

          {specs.length > 0 && (
            <ProductSection id="xususiyatlar" title={v3("tabSpecs")} collapsible className="order-4 lg:max-w-[680px]">
              <SpecRows rows={specs} large />
              {product.certifications && product.certifications.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {product.certifications.map((c) => (
                    <li key={c} className="inline-flex h-8 items-center rounded-pill bg-chip-strong px-3 text-sm font-medium">{c}</li>
                  ))}
                </ul>
              )}
            </ProductSection>
          )}

          {product.faq.length > 0 && (
            <ProductSection id="savollar" title={v3("tabQa")} collapsible className="order-5">
              <dl className="flex flex-col">
                {product.faq.map((f) => (
                  <div key={f.question} className="flex flex-col gap-1.5 border-b border-line py-[18px] first:pt-0">
                    <dt className="text-[17px] font-bold">{f.question}</dt>
                    <dd className="text-base text-ink-2">{f.answer}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={BRAND.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonVariants("secondary", "md")} mt-4`}
              >
                {v3("askQuestion")}
              </a>
            </ProductSection>
          )}

          <section id="sharhlar" aria-labelledby="sharhlar-heading" className="order-7 scroll-mt-40 lg:order-6">
            {hasReviews ? (
              <>
                <h2 id="sharhlar-heading" className="mb-4 text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{v3("tabReviews")}</h2>
                <ProductReviews reviews={product.reviews} rating={product.rating} reviewCount={product.reviewCount} />
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-tile p-5 lg:p-7">
                <div className="flex max-w-[520px] flex-col gap-1.5">
                  <h2 id="sharhlar-heading" className="text-[22px] font-bold leading-7">{v3("tabReviews")}</h2>
                  <p className="text-base text-ink-2">{v3("reviewsEmpty")}</p>
                </div>
                <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className={buttonVariants("primary", "md")}>
                  {v3("writeReview")}
                </a>
              </div>
            )}
          </section>

          <ProductSection id="hujjatlar" title={v3("tabDocs")} collapsible className="order-6 lg:order-7">
            <div className="flex flex-wrap items-center justify-between gap-5 lg:rounded-[20px] lg:border lg:border-line lg:p-7">
              <div className="flex max-w-[560px] items-start gap-4">
                <span className="hidden h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-tile lg:flex">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" />
                  </svg>
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xl font-bold">{v3("docsTitle")}</span>
                  <p className="text-[15px] text-ink-2">{v3("docsText")}</p>
                </div>
              </div>
              <Link href="/licenses" className={buttonVariants("secondary", "md")}>
                {v3("docsCta")}
              </Link>
            </div>
          </ProductSection>
        </div>

        <aside className="sticky top-[200px] hidden lg:block">
          <ProductMiniCard product={product} image={cutout ?? product.images[0]?.url} shortName={product.name} />
        </aside>
      </div>

      {upsells.length > 0 && (
        <div className="wrap">
          <UpsellRail offers={upsells} />
        </div>
      )}

      <ProductBuyBar product={product} />
    </div>
  );
}

function SpecRows({ rows, large = false }: { rows: { label: string; value: string }[]; large?: boolean }) {
  return (
    <dl className="flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.label} className={`flex items-baseline gap-2 ${large ? "text-base" : "text-[15px]"}`}>
          <dt className="shrink-0 text-ink-2">{r.label}</dt>
          <span aria-hidden className="min-w-4 flex-1 translate-y-[-4px] border-b border-dotted border-line-strong" />
          <dd className="text-right font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const ICONS = {
  truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  store: "M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6",
  box: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  card: "M3 6h18v12H3zM3 10h18M7 15h3",
};

function DeliveryPanel({ rows }: { rows: { icon: string; title: string; price?: string; note: string }[] }) {
  return (
    <ul className="rounded-[20px] bg-tile px-5 py-1.5 lg:px-[22px]">
      {rows.map((r) => (
        <li key={r.title} className="flex gap-3.5 border-b border-line-strong py-4 last:border-0">
          <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={r.icon} />
          </svg>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex justify-between gap-2 text-[15px] font-semibold">
              <span>{r.title}</span>
              {r.price && <span className="whitespace-nowrap">{r.price}</span>}
            </div>
            <span className="text-sm leading-[19px] text-ink-2">{r.note}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
