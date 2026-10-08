import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { getAllProducts } from "@/lib/shop/all-products";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { chipClass } from "@/components/ui/Chip";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { categoryCutout, productCutout } from "@/lib/content/product-cutouts";
import { productBrand } from "@/lib/content/product-brands";
import { COMMERCE } from "@/lib/config/commerce";
import { SUBSCRIPTION_INTERVALS } from "@/lib/subscription/plans";
import {
  activeFilterCount,
  applyFilters,
  filtersToQuery,
  toFacts,
  toggle,
  EMPTY_FILTERS,
  type CatalogFilters,
} from "@/lib/shop/catalog-filters";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { SORT_ORDER, sortKey, type CatalogSort } from "@/lib/shop/catalog-sort";
import { CatalogSidebar, MobileFilterBar, type PanelContext } from "./CatalogFilterPanel";
import { isStocked } from "@/lib/shop/categories";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd, collectionLd } from "@/lib/seo/jsonld";
import { categorySeoCopy } from "@/lib/content/category-seo";

/** Shopflow filters by category and search; the rest runs over every matching product. */
const PAGE_SIZE = 24;

/*
  Design: CatalogV3 / CatalogMobileV3 / FiltersMobileV3.

  `page` is cumulative ("Yana N ta koʻrsatish" shows the first page × 24), so
  every listing state is still a plain URL a crawler and the back button can
  reach.
*/
export async function ShopView({
  locale,
  activeCategory,
  sort = "popular",
  search,
  filters = EMPTY_FILTERS,
  page = 1,
}: {
  locale: Locale;
  activeCategory?: string;
  sort?: CatalogSort;
  search?: string;
  filters?: CatalogFilters;
  page?: number;
}) {
  const [t, v3, nav, prod, header, categories, pool, topics] = await Promise.all([
    getTranslations("shop"),
    getTranslations("shop.v3"),
    getTranslations("nav"),
    getTranslations("product"),
    getTranslations("header"),
    shopflow.getCategories(locale),
    getAllProducts({ locale, category: activeCategory, search, sort }),
    getHealthTopics(locale, "goal"),
  ]);

  // "Ommabop" has no sales history to rank by, so the supplement lines with a
  // cutout pack shot lead and coffee and devices follow — as on the home page.
  const items =
    sort === "popular"
      ? [...pool.items].sort((a, b) => Number(!productCutout(a.slug)) - Number(!productCutout(b.slug)))
      : pool.items;
  const facts = items.map((p) => toFacts(p, topics));
  const matchIds = new Set(applyFilters(facts, filters).map((f) => f.id));
  const matched = items.filter((p) => matchIds.has(p.id));
  const visible = matched.slice(0, page * PAGE_SIZE);
  const remaining = matched.length - visible.length;

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) : undefined;
  const shelves = categories.filter(isStocked);
  const basePath = activeCategory ? `/products/${activeCategory}` : "/products";
  const keep: Record<string, string> = search ? { q: search } : {};
  const heading = search ? t("searchResults", { query: search }) : active ? active.name : t("title");

  const brandNames = Object.fromEntries(
    pool.items.map((p) => productBrand(p.slug)).filter(Boolean).map((b) => [b!.slug, b!.name]),
  );
  const goalNames = Object.fromEntries(topics.map((topic) => [topic.slug, topic.name]));
  const ctx: PanelContext = { facts, filters, sort, basePath, keep, brandNames, goalNames };

  function href(next: CatalogFilters, nextSort: CatalogSort = sort, nextPage = 1) {
    const query: Record<string, string> = { ...keep, ...filtersToQuery(next) };
    if (nextSort !== "popular") query.sort = nextSort;
    if (nextPage > 1) query.page = String(nextPage);
    return { pathname: basePath, query };
  }

  const priceLabel =
    filters.min != null && filters.max != null
      ? `${formatNumber(filters.min)} – ${formatMoney(filters.max, locale)}`
      : filters.min != null
        ? t("priceFromValue", { value: formatMoney(filters.min, locale) })
        : filters.max != null
          ? t("priceToValue", { value: formatMoney(filters.max, locale) })
          : null;
  const formLabel = { capsule: v3("formCapsule"), tablet: v3("formTablet") };

  const chips = [
    filters.stock && { key: "stock", label: v3("inStock"), next: { ...filters, stock: false } },
    filters.sale && { key: "sale", label: v3("onSale"), next: { ...filters, sale: false } },
    filters.goal && { key: "goal", label: goalNames[filters.goal] ?? filters.goal, next: { ...filters, goal: null } },
    ...filters.brands.map((b) => ({ key: `b-${b}`, label: brandNames[b] ?? b, next: { ...filters, brands: toggle(filters.brands, b) } })),
    ...filters.forms.map((f) => ({ key: `f-${f}`, label: formLabel[f], next: { ...filters, forms: toggle(filters.forms, f) } })),
    ...filters.origins.map((o) => ({ key: `o-${o}`, label: o, next: { ...filters, origins: toggle(filters.origins, o) } })),
    priceLabel && { key: "price", label: priceLabel, next: { ...filters, min: null, max: null } },
  ].filter((c): c is { key: string; label: string; next: CatalogFilters } => Boolean(c));

  const activeCount = activeFilterCount(filters);
  const hours = String(COMMERCE.delivery.tashkent.hours);

  return (
    <div className="wrap flex flex-col gap-4 pb-9 pt-1 lg:gap-6 lg:pb-[72px] lg:pt-5">
      {!search && <ShelfJsonLd />}
      <div className="flex flex-col gap-1 lg:gap-4">
        <nav aria-label={prod("breadcrumbHome")} className="hidden flex-wrap gap-2 text-sm text-muted lg:flex">
          <Link href="/" className="hover:text-ink">{prod("breadcrumbHome")}</Link>
          <span aria-hidden>/</span>
          {active || search ? (
            <Link href="/products" className="hover:text-ink">{header("catalog")}</Link>
          ) : (
            <span className="text-ink">{header("catalog")}</span>
          )}
          {active && (
            <>
              <span aria-hidden>/</span>
              <span className="text-ink">{active.name}</span>
            </>
          )}
        </nav>
        {(active || search) && (
          <Link href="/products" className="inline-flex items-center gap-1 self-start text-sm text-ink-2 lg:hidden">
            <Icon d="M15 6l-6 6 6 6" className="h-4 w-4" />
            {header("catalog")}
          </Link>
        )}
        <div className="flex flex-col gap-1 lg:-mt-1.5 lg:flex-row lg:flex-wrap lg:items-baseline lg:gap-3.5">
          <h1 className="text-[26px] font-bold leading-8 lg:text-h-page">{heading}</h1>
          <span className="text-[15px] text-muted lg:text-[17px]">{v3("count", { count: matched.length })}</span>
        </div>
      </div>

      <nav aria-label={v3("categories")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:gap-3 lg:px-0">
        {shelves.map((c) => {
          const img = categoryCutout(c.slug);
          const current = c.slug === activeCategory;
          return (
            <Link
              key={c.id}
              href={`/products/${c.slug}`}
              aria-current={current ? "page" : undefined}
              className={cn(
                "relative flex h-28 w-28 shrink-0 flex-col overflow-hidden rounded-[18px] p-2.5 pb-0 transition-colors lg:h-[120px] lg:w-[calc((100%-60px)/6)] lg:rounded-[20px] lg:p-4 lg:pb-0",
                current ? "bg-ink text-white" : "bg-tile hover:bg-tile-hover",
              )}
            >
              <span className="relative z-10 text-[13px] font-semibold leading-4 lg:text-base lg:leading-5">
                {c.name}
                {c.productCount != null && (
                  <small className={cn("block text-[13px] font-normal", current ? "text-on-dark-2" : "text-muted")}>
                    {v3("count", { count: c.productCount })}
                  </small>
                )}
              </span>
              {img && (
                <span className="absolute bottom-0.5 right-0.5 h-16 w-16 lg:bottom-1 lg:right-1.5 lg:h-[78px] lg:w-[78px]">
                  <Image src={img} alt="" fill sizes="78px" className="object-contain" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside aria-label={t("filters")} className="hidden flex-col lg:flex">
          <CatalogSidebar key={JSON.stringify(filters)} {...ctx} />
          <QuizTile
            className="mt-6 bg-tile"
            title={v3("quizTitle")}
            text={v3("quizText")}
            cta={v3("quizCta")}
          />
        </aside>

        <section aria-label={heading} className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <div className="hidden flex-wrap items-center justify-between gap-4 lg:flex">
            <div className="flex flex-wrap items-center gap-1">
              <span className="mr-1.5 text-[15px] text-muted">{v3("sortLabel")}</span>
              {SORT_ORDER.map((s) => (
                <Link
                  key={s}
                  href={href(filters, s)}
                  aria-current={s === sort ? "true" : undefined}
                  className={cn(
                    "rounded-[10px] px-3.5 py-2 text-[15px]",
                    s === sort ? "bg-tile font-semibold text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {t(sortKey(s))}
                </Link>
              ))}
            </div>
          </div>

          <MobileFilterBar key={JSON.stringify(filters) + sort} ctx={ctx} activeCount={activeCount} />

          {chips.length > 0 && (
            <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:gap-2 lg:px-0">
              {chips.map((c) => (
                <Link
                  key={c.key}
                  href={href(c.next)}
                  aria-label={t("removeFilter", { name: c.label })}
                  className={cn(chipClass(true), "h-9 text-sm lg:h-10 lg:text-[15px]")}
                >
                  {c.label}
                  <Icon d="M6 6l12 12M18 6L6 18" className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </Link>
              ))}
              {chips.length > 1 && (
                <Link href={href(EMPTY_FILTERS)} className="inline-flex h-9 shrink-0 items-center px-2 text-sm underline lg:h-10 lg:text-[15px]">
                  {v3("clearAll")}
                </Link>
              )}
            </div>
          )}

          {matched.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-lead text-ink-2">{t("empty")}</p>
              {activeCount > 0 && (
                <Link href={href(EMPTY_FILTERS)} className="inline-flex h-12 items-center rounded-sm bg-ink px-6 text-button font-semibold text-white">
                  {t("clearFilters")}
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-3 md:gap-x-3 md:gap-y-6 xl:grid-cols-4">
              {visible.map((p, i) => (
                <ListingSlot key={p.id} index={i}>
                  <ProductCard product={p} index={i} />
                </ListingSlot>
              ))}
            </div>
          )}

          {matched.length > 0 && (
            <div className="flex flex-col items-center gap-2.5 pt-2">
              <span className="text-sm text-ink-2 lg:text-[15px]">{v3("shown", { total: matched.length, shown: visible.length })}</span>
              <div className="h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-line" aria-hidden>
                <div className="h-1 rounded-full bg-ink" style={{ width: `${Math.round((visible.length / matched.length) * 100)}%` }} />
              </div>
              {remaining > 0 && (
                <Link
                  href={href(filters, sort, page + 1)}
                  scroll={false}
                  className="mt-1 flex h-12 w-full max-w-[360px] items-center justify-center rounded-sm bg-tile text-button font-semibold transition-colors hover:bg-tile-hover"
                >
                  {v3("more", { count: Math.min(remaining, PAGE_SIZE) })}
                </Link>
              )}
            </div>
          )}

          {active && (
            <div className="flex max-w-[820px] flex-col gap-2.5 pt-4">
              <h2 className="text-title font-bold">{v3("seoTitle", { name: active.name })}</h2>
              {categorySeoCopy(active.slug, locale).map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-body text-ink-2">{paragraph}</p>
              ))}
              <p className="text-body text-ink-2">
                {v3("seoText", {
                  name: active.name,
                  count: active.productCount ?? matched.length,
                  hours,
                  free: formatNumber(COMMERCE.freeShippingOver),
                })}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  /** Only the clean shelf URL carries it; a search result is not a page of its own. */
  function ShelfJsonLd() {
    const url = `${SITE_URL}/${locale}${basePath}`;
    const crumbs = [
      { name: prod("breadcrumbHome"), url: `${SITE_URL}/${locale}` },
      { name: header("catalog"), url: `${SITE_URL}/${locale}/products` },
      ...(active ? [{ name: active.name, url }] : []),
    ];
    return (
      <>
        <JsonLd data={breadcrumbLd(crumbs)} />
        <JsonLd data={collectionLd({ name: heading, url, products: visible })} />
      </>
    );
  }

  /*
    Two editorial tiles live in the grid itself, as in the design: the quiz
    after the fourth card on phones (the sidebar holds it on desktop) and the
    subscription banner after the eighth, across the full row.
  */
  function ListingSlot({ index, children }: { index: number; children: React.ReactNode }) {
    return (
      <>
        {index === 4 && (
          <QuizTile
            className="col-span-full bg-dark-panel text-white lg:hidden"
            title={v3("quizTitle")}
            text={v3("quizText")}
            cta={v3("quizCta")}
            onDark
          />
        )}
        {index === 8 && (
          <Link
            href="/loyalty"
            className="col-span-full flex flex-col gap-4 rounded-3xl bg-dark-panel p-5 text-white md:flex-row md:items-center md:gap-6 md:px-8 md:py-6"
          >
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-on-dark-2 md:text-[13px]">{v3("subEyebrow")}</span>
              <span className="text-xl font-bold md:text-[26px] md:leading-[31px]">
                {v3("subTitle", {
                  first: COMMERCE.discounts.subscriptionFirstPercent,
                  recurring: COMMERCE.discounts.subscriptionRecurringPercent,
                })}
              </span>
              <span className="text-sm text-on-dark-2 md:text-[15px]">
                {v3("subText", { intervals: SUBSCRIPTION_INTERVALS.join(", ") })}
              </span>
            </span>
            <span className="inline-flex h-12 items-center self-start rounded-[14px] bg-bg px-7 text-[17px] font-semibold text-ink md:self-auto">
              {v3("subCta")}
            </span>
          </Link>
        )}
        <div className="h-full">{children}</div>
      </>
    );
  }
}

function QuizTile({
  title,
  text,
  cta,
  className,
  onDark = false,
}: {
  title: string;
  text: string;
  cta: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link href="/quiz" className={cn("flex flex-col gap-2 rounded-[20px] p-5 lg:p-[22px]", className)}>
      <span className="text-[19px] font-bold leading-6 lg:text-lg lg:leading-[23px]">{title}</span>
      <span className={cn("text-sm leading-5", onDark ? "text-on-dark-2" : "text-ink-2")}>{text}</span>
      <span
        className={cn(
          "mt-1.5 inline-flex h-11 items-center self-start rounded-sm px-[18px] text-[15px] font-semibold",
          onDark ? "bg-bg text-ink" : "bg-ink text-white",
        )}
      >
        {cta}
      </span>
    </Link>
  );
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
