import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { cn, formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";
import type { Category, Product, UpsellOffer } from "@/lib/shopflow/types";
import type { Expert } from "@/lib/content/experts";
import type { HealthTopic } from "@/lib/content/health-topics";
import { COMMERCE } from "@/lib/config/commerce";
import { ONLINE_PROVIDERS } from "@/lib/config/payments";
import { discountPercent } from "@/components/ui/Price";
import { buttonVariants } from "@/components/ui/Button";
import { chipClass } from "@/components/ui/Chip";
import { ProductRow } from "@/components/home/HomeBlocks";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox, MiniBuyCard } from "@/components/product/BuyBox";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ShareButton } from "@/components/product/ShareButton";
import { CompareButton } from "@/components/product/CompareButton";
import { Collapsible, SectionNav } from "@/components/product/ProductSections";
import { ProductReviews } from "@/components/product/ProductReviews";
import { HealthContext } from "@/components/product/HealthContext";
import { DoctorVideo } from "@/components/product/DoctorVideo";
import { UpsellRail } from "@/components/product/UpsellRail";
import { RecentlyViewed } from "@/components/personalization/RecentlyViewed";
import { cutoutOf, unitOf, brandOf } from "@/lib/catalog/product-facts";

/*
  Design: ProductV3 (desktop), ProductMobileV3 (phones).

  One DOM for both. The phone artboard puts the gallery above the title and
  the composition above the description, so blocks carry an `order-*` that the
  desktop grid resets. Everything printed is the product's own data: rows
  without a value are dropped rather than filled ("Kunlik doza", "Yosh" have
  no field in the catalogue, so they are not on the page).
*/
export async function ProductTemplate({
  product,
  category,
  upsells,
  similar,
  allProducts,
  locale,
  reviewer,
  topics = [],
}: {
  product: Product;
  category?: Category;
  upsells: UpsellOffer[];
  similar: Product[];
  allProducts: Product[];
  locale: Locale;
  reviewer?: Expert | null;
  /** Health topics this product belongs to; empty hides the block. */
  topics?: HealthTopic[];
}) {
  const t = await getTranslations("product");
  const tv = await getTranslations("product.v3");
  const tc = await getTranslations("common");
  const legal = await getTranslations("legal");
  const td = await getTranslations("delivery");

  const brand = brandOf(product);
  const pack = unitOf(product);
  const cutout = cutoutOf(product);
  const images = cutout ? [{ url: cutout, alt: product.name }, ...product.images.slice(1)] : product.images;
  const discount = discountPercent(product.price, product.oldPrice);
  const guaranteeLabel = product.badges.find((b) => /kafolat|гарантия/i.test(b));
  const dose = tv(pack?.unit === "tablet" ? "doseTablet" : pack?.unit === "capsule" ? "doseCapsule" : "doseServing");
  const descriptionImage = product.images[2] ?? product.images[1];
  const backHref = category ? `/products/${category.slug}` : "/products";

  const specs = [
    brand && { k: tv("specBrand"), v: brand.name },
    product.origin && { k: tv("specOrigin"), short: tv("specOriginShort"), v: product.origin },
    pack && { k: tv("specForm"), v: tv(pack.unit === "tablet" ? "formTablet" : "formCapsule") },
    product.servings != null && { k: tv("specPack"), v: String(product.servings) },
    pack && { k: tv("specType"), v: tv("typeSupplement") },
  ].filter((s): s is { k: string; short?: string; v: string } => Boolean(s));
  const keySpecs = specs.slice(0, 4);

  const free = formatMoney(COMMERCE.freeShippingOver, locale);
  const delivery = [
    { icon: ICON.truck, title: tv("courier"), price: formatMoney(COMMERCE.shippingFee, locale), note: tv("courierNote", { hours: COMMERCE.delivery.tashkent.hours, amount: free }) },
    { icon: ICON.home, title: tv("pickup"), price: tv("free"), note: tv("pickupNote") },
    { icon: ICON.box, title: tv("regions"), price: formatMoney(COMMERCE.shippingFee, locale), note: tv("regionsNote", { days: td("regionsTime"), amount: free }) },
    {
      icon: ICON.card,
      title: tv("payment"),
      price: "",
      note: ONLINE_PROVIDERS.length
        ? tv("paymentOnline", { providers: ONLINE_PROVIDERS.map((p) => p.label).join(", ") })
        : tv("paymentCod"),
    },
  ];

  const sections = [
    { id: "tavsif", label: tv("description") },
    product.ingredients.length > 0 && { id: "tarkib", label: tv("composition") },
    product.howToUse && { id: "qabul", label: tv("usage") },
    specs.length > 0 && { id: "xususiyatlar", label: tv("specs") },
    { id: "savollar", label: product.faq.length ? `${tv("qa")} · ${product.faq.length}` : tv("qa") },
    { id: "sharhlar", label: `${tv("reviews")} · ${product.reviewCount}` },
    { id: "hujjatlar", label: tv("documents") },
  ].filter((s): s is { id: string; label: string } => Boolean(s));

  const reviewsLabel = product.reviewCount > 0 ? tc("reviews", { count: product.reviewCount }) : tv("noReviews");

  return (
    <div className="flex flex-col gap-10 pb-9 pt-3 lg:gap-14 lg:pb-[72px] lg:pt-5">
      <div className="wrap grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_384px] lg:items-start lg:gap-x-9 lg:gap-y-0">
        <div className="-my-1 -mr-2 flex items-center justify-between lg:hidden">
          <Link href={backHref} className="inline-flex min-h-11 items-center gap-1 text-sm text-ink-2">
            <Icon d="M15 6l-6 6 6 6" className="h-4 w-4" />
            {category?.name ?? tc("viewAll")}
          </Link>
          <div className="flex">
            <CompareButton productId={product.id} iconOnly className="h-11 w-11 justify-center" />
            <WishlistButton productId={product.id} className="h-11 w-11" iconClassName="h-6 w-6" />
            <ShareButton name={product.name} iconOnly className="h-11 w-11 justify-center" />
          </div>
        </div>

        <div className="order-2 flex flex-col gap-2 lg:order-none lg:col-span-3 lg:mb-9 lg:gap-3.5">
          <nav aria-label={t("breadcrumbHome")} className="hidden flex-wrap gap-2 text-sm text-muted lg:flex">
            <Link href="/" className="hover:text-ink">{t("breadcrumbHome")}</Link>
            {category && (
              <>
                <span aria-hidden>/</span>
                <Link href={backHref} className="hover:text-ink">{category.name}</Link>
              </>
            )}
          </nav>
          <h1 className="max-w-[920px] text-[22px] font-bold leading-7 lg:text-[32px] lg:leading-[38px]">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-sm text-ink-2 lg:gap-x-6 lg:text-[15px]">
            <a href="#sharhlar" className={META}>
              <Icon d={ICON.star} className="hidden h-[18px] w-[18px] lg:block" />
              {reviewsLabel}
            </a>
            {product.faq.length > 0 && (
              <a href="#savollar" className={META}>
                <Icon d={ICON.chat} className="hidden h-[18px] w-[18px] lg:block" />
                {tv("questions", { count: product.faq.length })}
              </a>
            )}
            {brand && (
              <span className="inline-flex items-center gap-1.5">
                <span className="hidden lg:inline">{tv("brand")}:</span>
                <Link href={`/brands/${brand.slug}`} className="font-semibold text-ink underline-offset-4 lg:underline">
                  {brand.name}
                </Link>
              </span>
            )}
            <span className="hidden flex-1 lg:block" />
            <CompareButton productId={product.id} className="hidden text-[15px] hover:text-ink lg:inline-flex" />
            <WishlistButton
              productId={product.id}
              label={{ add: tv("favorite"), saved: tv("favoriteSaved") }}
              className="hidden gap-1.5 text-[15px] lg:inline-flex"
            />
            <ShareButton name={product.name} className="hidden text-[15px] hover:text-ink lg:inline-flex" />
          </div>
        </div>

        <div className="order-1 lg:order-none">
          <ProductGallery
            images={images}
            cutout={Boolean(cutout)}
            discountPercent={discount}
            guaranteeLabel={guaranteeLabel}
            outOfStockLabel={product.inStock ? undefined : tc("outOfStock")}
          />
        </div>

        <div className="order-4 mt-4 flex flex-col gap-6 lg:order-none lg:mt-0">
          {product.servings != null && (
            <div className="hidden flex-col gap-2.5 lg:flex">
              <span className="text-[17px] font-bold">{tv("packSize")}</span>
              <span className={cn(chipClass(true), "self-start")}>{product.servings}</span>
            </div>
          )}
          {keySpecs.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[21px] font-bold leading-[26px] lg:text-[17px] lg:leading-6">{tv("keySpecs")}</h2>
              {keySpecs.map((s) => (
                <SpecRow key={s.k} label={s.short ?? s.k} value={s.v} />
              ))}
              <a href="#xususiyatlar" className="hidden items-center gap-1.5 text-[15px] font-semibold hover:underline lg:inline-flex">
                {tv("allSpecs")}
                <Icon d="M6 9l6 6 6-6" className="h-4 w-4" />
              </a>
            </div>
          )}
          {product.ingredients.length > 0 && (
            <div className="hidden flex-col gap-2 rounded-[20px] bg-tile px-5 py-[18px] lg:flex">
              <span className="text-[15px] font-bold">{tv("inDose", { dose })}</span>
              <span className="text-[15px] leading-[23px] text-ink-2">
                {product.ingredients.map((i) => `${i.name} ${i.amount}`).join(" · ")}
              </span>
            </div>
          )}
        </div>

        <div className="order-3 flex flex-col gap-3 lg:order-none">
          <BuyBox product={product} reviewer={reviewer} />
          <div className="rounded-[20px] bg-tile px-[18px] py-1 lg:px-[22px] lg:py-1.5">
            {delivery.map((d, i) => (
              <div key={d.title} className={cn("flex gap-3 py-3.5 lg:gap-3.5 lg:py-4", i < delivery.length - 1 && "border-b border-[#DCDFDB]")}>
                <Icon d={d.icon} className="mt-px h-[22px] w-[22px] shrink-0" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex justify-between gap-2 text-[15px] font-semibold">
                    <span>{d.title}</span>
                    {d.price && <span className="whitespace-nowrap">{d.price}</span>}
                  </div>
                  <span className="text-sm leading-[19px] text-ink-2">{d.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionNav label={tv("sections")} items={sections} />

      <div className="wrap grid gap-8 lg:-mt-4 lg:grid-cols-[minmax(0,1fr)_384px] lg:items-start lg:gap-14">
        <div className="flex min-w-0 flex-col gap-8 lg:gap-12">
          <Collapsible id="tavsif" title={tv("description")} className="order-3 lg:order-none">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="flex flex-col gap-4">
                <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{product.description}</p>
                {product.highlights.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {product.highlights.map((h) => (
                      <li key={h} className={chipClass()}>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <HealthContext topics={topics} />
              </div>
              {descriptionImage && (
                <span className="relative hidden aspect-[3/4] overflow-hidden rounded-[20px] bg-tile lg:block">
                  <Image src={descriptionImage.url} alt={descriptionImage.alt} fill sizes="260px" className="object-cover" />
                </span>
              )}
            </div>
            {/* Renders nothing until a clip has consent and an OTC product behind
                it — see lib/content/doctor-videos.ts. */}
            {await DoctorVideo({ slug: product.slug, locale })}
          </Collapsible>

          {product.ingredients.length > 0 && (
            <Section id="tarkib" className="order-1 lg:order-none">
              <h2 className={H2}>
                <span className="lg:hidden">{tv("inDose", { dose })}</span>
                <span className="hidden lg:inline">{tv("composition")}</span>
              </h2>
              <div>
                <div className={cn(ING_ROW, "hidden pb-4 pt-1 text-sm text-muted lg:grid")}>
                  <span className="first-letter:uppercase">{dose}</span>
                  <span>{tv("amount")}</span>
                  <span>{tv("dailyValue")}</span>
                </div>
                {product.ingredients.map((r) => (
                  <div key={r.name} className={ING_ROW}>
                    <span className="font-semibold">{r.name}</span>
                    <span>{r.amount}</span>
                    <span className="text-right text-ink-2 lg:text-left lg:text-ink">{r.dailyValue ?? "—"}</span>
                  </div>
                ))}
                <p className="pt-2 text-[13px] leading-[18px] text-muted lg:hidden">{tv("dailyValueNote")}</p>
              </div>
            </Section>
          )}

          {product.howToUse && (
            <Section id="qabul" className="order-2 lg:order-none">
              <h2 className={H2}>{tv("usage")}</h2>
              <p className="rounded-[20px] bg-tile px-[18px] py-4 text-base leading-[23px] lg:p-5 lg:text-[17px] lg:leading-[26px]">
                {product.howToUse}
              </p>
              <p role="note" className="text-[13px] leading-[18px] text-muted lg:text-sm">
                {legal("warning")}
              </p>
            </Section>
          )}

          {specs.length > 0 && (
            <Collapsible id="xususiyatlar" title={tv("specs")} mobileTitle={tv("allSpecs")} className="order-4 lg:order-none lg:max-w-[680px]">
              <div className="flex flex-col gap-3">
                {specs.map((s) => (
                  <SpecRow key={s.k} label={s.k} value={s.v} large />
                ))}
              </div>
            </Collapsible>
          )}

          <Collapsible id="savollar" title={tv("qa")} mobileTitle={sections.find((s) => s.id === "savollar")!.label} className="order-5 lg:order-none">
            {product.faq.map((q) => (
              <div key={q.question} className="flex flex-col gap-1.5 border-b border-line py-[18px] first:pt-0 lg:first:pt-[18px]">
                <span className="text-[17px] font-bold">{q.question}</span>
                <span className="text-base leading-6 text-ink-2">{q.answer}</span>
              </div>
            ))}
            <div className="pt-4">
              <Link href="/contact" className={buttonVariants("secondary")}>
                {tv("askQuestion")}
              </Link>
            </div>
          </Collapsible>

          <Section id="sharhlar" className="order-7 lg:order-none">
            {product.reviews.length > 0 ? (
              <>
                <h2 className={H2}>{tv("reviews")}</h2>
                <ProductReviews reviews={product.reviews} rating={product.rating} reviewCount={product.reviewCount} />
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-tile p-5 lg:p-7">
                <div className="flex max-w-[520px] flex-col gap-1.5">
                  <h2 className="text-[19px] font-bold lg:text-[22px]">{tv("reviews")}</h2>
                  <p className="text-base leading-6 text-ink-2">{tv("reviewsEmpty")}</p>
                </div>
                <Link href="/contact" className={cn(buttonVariants("primary"), "h-11 lg:h-12")}>
                  {tv("writeReview")}
                </Link>
              </div>
            )}
          </Section>

          <Collapsible id="hujjatlar" title={tv("documents")} className="order-6 lg:order-none">
            <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-line p-5 lg:p-7">
              <div className="flex max-w-[560px] items-start gap-4">
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-tile">
                  <Icon d={ICON.doc} className="h-6 w-6" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-lg font-bold lg:text-xl">{tv("docsTitle")}</span>
                  <span className="text-base leading-6 text-ink-2">{tv("docsText")}</span>
                </div>
              </div>
              <Link href="/licenses" className={buttonVariants("secondary")}>
                {tv("docsCta")}
              </Link>
            </div>
          </Collapsible>
        </div>

        <aside className="sticky top-[calc(var(--header-sticky)+72px)] hidden lg:block">
          <MiniBuyCard product={product} image={cutout ?? product.images[0]?.url} />
        </aside>
      </div>

      <UpsellRail offers={upsells} title={tv("upsell")} />

      {similar.length > 0 && (
        <section aria-labelledby="pdp-similar" className="wrap flex flex-col gap-3.5 lg:gap-6">
          <h2 id="pdp-similar" className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">
            {tv("similar")}
          </h2>
          <ProductRow products={similar} />
        </section>
      )}

      <RecentlyViewed allProducts={allProducts} title={tv("seen")} excludeSlug={product.slug} />
    </div>
  );
}

function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("flex scroll-mt-4 flex-col gap-3 lg:scroll-mt-[calc(var(--header-sticky)+72px)] lg:gap-4", className)}>
      {children}
    </section>
  );
}

function SpecRow({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className={cn("flex gap-2 text-[15px] leading-[22px]", large && "lg:text-base")}>
      <span className="shrink-0 text-muted">{label}</span>
      <i aria-hidden className="flex-1 -translate-y-1.5 border-b border-dotted border-on-dark-2" />
      <span className="text-right">{value}</span>
    </div>
  );
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const META = "inline-flex items-center gap-1.5 hover:text-ink";
const H2 = "text-[21px] font-bold leading-[26px] lg:text-[26px] lg:leading-8";
const ING_ROW =
  "grid grid-cols-[minmax(0,1fr)_76px_52px] gap-2 border-b border-line py-3 text-[15px] lg:grid-cols-[minmax(0,1fr)_140px_160px] lg:gap-3 lg:px-1 lg:py-4 lg:text-base";

const ICON = {
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  chat: "M4 5h16v11H9l-5 4z",
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  home: "M4 10l8-6 8 6v10H4zM10 20v-6h4v6",
  box: "M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10",
  card: "M3 7h18v10H3zM3 11h18",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4M9 13l2 2 4-4",
};
