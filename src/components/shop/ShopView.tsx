import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import type { ProductListParams } from "@/lib/shopflow/types";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterBar } from "@/components/shop/FilterBar";
import { Pagination } from "@/components/shop/Pagination";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { paginateByGoal, toGoalFacets } from "@/lib/shop/goal-facets";
import { cn, formatMoney } from "@/lib/utils";

type Sort = NonNullable<ProductListParams["sort"]>;
const sorts: Sort[] = ["popular", "price_asc", "price_desc", "new"];
const sortLabelKey: Record<Sort, string> = {
  popular: "sortPopular",
  price_asc: "sortPriceAsc",
  price_desc: "sortPriceDesc",
  new: "sortNew",
};

const PAGE_SIZE = 24;

export async function ShopView({
  locale,
  activeCategory,
  goal,
  sort = "popular",
  search,
  origin,
  minPrice,
  maxPrice,
  page = 1,
}: {
  locale: Locale;
  activeCategory?: string;
  goal?: string;
  sort?: Sort;
  search?: string;
  origin?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}) {
  const [t, nav, prod, health, categories, listing, facetPool, topics] = await Promise.all([
    getTranslations("shop"),
    getTranslations("nav"),
    getTranslations("product"),
    getTranslations("health"),
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, category: activeCategory, search, origin, minPrice, maxPrice, sort, pageSize: PAGE_SIZE, page }),
    shopflow.getProducts({ locale, category: activeCategory, search, origin, minPrice, maxPrice, pageSize: 100 }),
    getHealthTopics(locale, "goal"),
  ]);

  const goalFacets = toGoalFacets(topics, facetPool.items);
  const activeGoal = goal ? topics.find((topicItem) => topicItem.slug === goal) : undefined;
  // Shopflow has no goal filter, so a goal listing is paginated over the pool.
  const result = activeGoal
    ? paginateByGoal(facetPool.items, activeGoal, { sort, page, pageSize: PAGE_SIZE })
    : listing;

  const origins = Array.from(
    new Set(facetPool.items.map((p) => p.origin).filter((o): o is string => Boolean(o))),
  ).sort();

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) : undefined;
  const basePath = activeCategory ? `/products/${activeCategory}` : "/products";
  const heading = search
    ? t("searchResults", { query: search })
    : activeGoal
      ? activeGoal.name
      : active
        ? active.name
        : t("title");
  const totalPages = Math.ceil((result.total || 0) / PAGE_SIZE);

  function buildQuery(overrides: Record<string, string | undefined>) {
    const q: Record<string, string> = {};
    if (sort !== "popular") q.sort = sort;
    if (goal) q.goal = goal;
    if (search) q.q = search;
    if (origin) q.origin = origin;
    if (minPrice != null) q.min = String(minPrice);
    if (maxPrice != null) q.max = String(maxPrice);
    if (page > 1) q.page = String(page);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) delete q[k]; else q[k] = v;
    });
    return { pathname: basePath, query: q };
  }

  const sortQuery = (s: Sort) => buildQuery({ sort: s !== "popular" ? s : undefined, page: undefined });

  /*
    Applied filters, each one removable on its own.

    Without this row the only record of an active filter is the sidebar, which
    is off-screen on mobile and easy to scroll past on desktop — so a visitor
    who filters into an empty result has no visible cause and no way back
    except the browser button. Price is one chip rather than two: the range is
    set as a pair, so it reads and clears as a pair.
  */
  const priceLabel =
    minPrice != null && maxPrice != null
      ? `${formatMoney(minPrice, locale)} – ${formatMoney(maxPrice, locale)}`
      : minPrice != null
        ? t("priceFromValue", { value: formatMoney(minPrice, locale) })
        : maxPrice != null
          ? t("priceToValue", { value: formatMoney(maxPrice, locale) })
          : null;

  const activeFilters = [
    search ? { key: "q", label: `“${search}”`, clear: { q: undefined } } : null,
    activeGoal ? { key: "goal", label: activeGoal.name, clear: { goal: undefined } } : null,
    origin ? { key: "origin", label: origin, clear: { origin: undefined } } : null,
    priceLabel ? { key: "price", label: priceLabel, clear: { min: undefined, max: undefined } } : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  return (
    <>
      {/* Breadcrumb band */}
      <div className="border-b border-line bg-surface">
        <Container className="flex flex-wrap items-center gap-2 py-4 text-sm">
          <Link href="/" className="text-muted hover:text-accent-strong">{prod("breadcrumbHome")}</Link>
          <span className="text-faint">/</span>
          <Link href="/products" className={active ? "text-muted hover:text-accent-strong" : "font-semibold text-fg"}>{nav("shop")}</Link>
          {active && (
            <>
              <span className="text-faint">/</span>
              <span className="font-semibold text-fg">{active.name}</span>
            </>
          )}
        </Container>
      </div>

      <Container className="py-10">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{heading}</h1>
          <p className="mt-2 text-muted">
            {search
              ? t("resultsCount", { count: result.total })
              : activeGoal?.headline ?? active?.description ?? t("subtitle")}
          </p>
          {activeGoal && (
            <Link
              href={`/goals/${activeGoal.slug}`}
              className="mt-3 inline-flex text-sm font-semibold text-accent-strong hover:underline"
            >
              {t("readGoal", { goal: activeGoal.name })} →
            </Link>
          )}
        </header>

        {/* Goal facets — the visitor filters by intent, not by warehouse category. */}
        {goalFacets.length > 0 && (
          <nav aria-label={health("goal.plural")} className="mb-8">
            <p className="mb-3 text-sm font-semibold text-fg">{t("byGoal")}</p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              <Link
                href={buildQuery({ goal: undefined, page: undefined })}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  !goal ? "border-accent bg-accent-soft text-accent-strong" : "border-line text-muted hover:border-line-strong hover:text-fg",
                )}
              >
                {t("all")}
              </Link>
              {goalFacets.map((facet) => (
                <Link
                  key={facet.slug}
                  href={buildQuery({ goal: facet.slug, page: undefined })}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    facet.slug === goal
                      ? "border-accent bg-accent-soft text-accent-strong"
                      : "border-line text-muted hover:border-line-strong hover:text-fg",
                  )}
                >
                  {facet.name}
                  <span className="ml-1.5 text-xs text-faint">{facet.count}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Mobile category chips — hidden on large screens */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          <Link
            href="/products"
            className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors", !activeCategory ? "border-accent bg-accent-soft text-accent-strong" : "border-line text-muted")}
          >
            {t("all")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products/${c.slug}`}
              className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors", c.slug === activeCategory ? "border-accent bg-accent-soft text-accent-strong" : "border-line text-muted")}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-ink p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-fg">{t("categoriesTitle")}</h2>
              <ul className="space-y-1">
                <li>
                  <Link href="/products" className={cn("block rounded-lg px-3 py-2 text-sm transition-colors", !activeCategory ? "bg-accent-soft font-semibold text-accent-strong" : "text-muted hover:bg-surface hover:text-fg")}>
                    {t("all")}
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/products/${c.slug}`} className={cn("flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors", c.slug === activeCategory ? "bg-accent-soft font-semibold text-accent-strong" : "text-muted hover:bg-surface hover:text-fg")}>
                      {c.name}
                      {c.productCount ? <span className="text-xs tabular-nums text-faint">{c.productCount}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <FilterBar
              basePath={basePath}
              origins={origins}
              current={{
                origin,
                min: minPrice != null ? String(minPrice) : undefined,
                max: maxPrice != null ? String(maxPrice) : undefined,
                sort,
                q: search,
              }}
            />
          </aside>

          {/* Main */}
          <div>
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-fg">{t("activeFilters")}:</span>
                {activeFilters.map((f) => (
                  <Link
                    key={f.key}
                    href={buildQuery({ ...f.clear, page: undefined })}
                    aria-label={t("removeFilter", { name: f.label })}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-strong transition-colors hover:bg-accent hover:text-white"
                  >
                    {f.label}
                    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </Link>
                ))}
                {activeFilters.length > 1 && (
                  <Link
                    href={buildQuery({ q: undefined, goal: undefined, origin: undefined, min: undefined, max: undefined, page: undefined })}
                    className="text-sm font-semibold text-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    {t("clearFilters")}
                  </Link>
                )}
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-3">
              <span className="text-sm text-muted">{t("resultsCount", { count: result.total })}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-faint">{t("sort")}:</span>
                {sorts.map((s) => (
                  <Link
                    key={s}
                    href={sortQuery(s)}
                    className={cn("rounded-full px-3 py-1.5 text-sm transition-colors", s === sort ? "bg-accent text-ink" : "text-muted hover:text-fg")}
                  >
                    {t(sortLabelKey[s])}
                  </Link>
                ))}
              </div>
            </div>

            {result.items.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-muted">{t("empty")}</p>
                {/* An empty result caused by filters needs a way out that is
                    not the browser back button. */}
                {activeFilters.length > 0 && (
                  <Link
                    href={buildQuery({ q: undefined, goal: undefined, origin: undefined, min: undefined, max: undefined, page: undefined })}
                    className="mt-4 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
                  >
                    {t("clearFilters")}
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {result.items.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  buildHref={(p) => buildQuery({ page: p > 1 ? String(p) : undefined })}
                />
              </>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
