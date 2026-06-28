import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import type { ProductListParams } from "@/lib/shopflow/types";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterBar } from "@/components/shop/FilterBar";
import { cn } from "@/lib/utils";

type Sort = NonNullable<ProductListParams["sort"]>;
const sorts: Sort[] = ["popular", "price_asc", "price_desc", "new"];
const sortLabelKey: Record<Sort, string> = {
  popular: "sortPopular",
  price_asc: "sortPriceAsc",
  price_desc: "sortPriceDesc",
  new: "sortNew",
};

export async function ShopView({
  locale,
  activeCategory,
  sort = "popular",
  search,
  origin,
  minPrice,
  maxPrice,
}: {
  locale: Locale;
  activeCategory?: string;
  sort?: Sort;
  search?: string;
  origin?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const t = await getTranslations("shop");
  const [categories, result, facetPool] = await Promise.all([
    shopflow.getCategories(locale),
    shopflow.getProducts({ locale, category: activeCategory, search, origin, minPrice, maxPrice, sort, pageSize: 24 }),
    // Unfiltered (by origin/price) pool for the current category, to derive facets.
    shopflow.getProducts({ locale, category: activeCategory, search, pageSize: 100 }),
  ]);

  const origins = Array.from(
    new Set(facetPool.items.map((p) => p.origin).filter((o): o is string => Boolean(o))),
  ).sort();

  const active = activeCategory
    ? categories.find((c) => c.slug === activeCategory)
    : undefined;

  const basePath = activeCategory ? `/products/${activeCategory}` : "/products";
  const sortQuery = (s: Sort) => {
    const query: Record<string, string> = {};
    if (s !== "popular") query.sort = s;
    if (search) query.q = search;
    if (origin) query.origin = origin;
    if (minPrice != null) query.min = String(minPrice);
    if (maxPrice != null) query.max = String(maxPrice);
    return { pathname: basePath, query };
  };

  return (
    <div className="pt-10">
      <Container>
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {search ? t("searchResults", { query: search }) : active ? active.name : t("title")}
          </h1>
          <p className="mt-3 text-lg text-muted">
            {search ? t("resultsCount", { count: result.total }) : active?.description ?? t("subtitle")}
          </p>
        </header>

        {/* Category tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          <CategoryTab href="/products" active={!activeCategory}>
            {t("all")}
          </CategoryTab>
          {categories.map((c) => (
            <CategoryTab key={c.id} href={`/products/${c.slug}`} active={c.slug === activeCategory}>
              {c.name}
            </CategoryTab>
          ))}
        </div>

        {/* Sort + count */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
          <span className="text-sm text-muted">{t("resultsCount", { count: result.total })}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-faint">{t("sort")}:</span>
            {sorts.map((s) => (
              <Link
                key={s}
                href={sortQuery(s)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  s === sort ? "bg-accent text-ink" : "text-muted hover:text-fg",
                )}
              >
                {t(sortLabelKey[s])}
              </Link>
            ))}
          </div>
        </div>

        {/* Filters + grid */}
        <div className="mb-32 mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
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

          {result.items.length === 0 ? (
            <p className="py-24 text-center text-muted">{t("empty")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {result.items.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

function CategoryTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
