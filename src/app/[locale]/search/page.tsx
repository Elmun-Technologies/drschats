import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { shopflow } from "@/lib/shopflow";
import { getAllProducts } from "@/lib/shop/all-products";
import type { Product } from "@/lib/shopflow/types";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buttonVariants } from "@/components/ui/Button";
import { Chip, chipClass } from "@/components/ui/Chip";
import { ProductGrid } from "@/components/home/HomeBlocks";
import { OutOfStockNotify } from "@/components/product/OutOfStockNotify";
import { cutoutOf } from "@/lib/catalog/product-facts";
import { TrackSearch } from "@/components/analytics/TrackSearch";

type Params = Promise<{ locale: Locale }>;
type Query = Promise<{ q?: string; category?: string }>;

/*
  Design: SearchV3 / SearchEmptyV3. Results come from the catalogue's own
  search (the same call /products?q= makes); the category chips count what the
  results contain, so every chip leads somewhere non-empty.

  "Qidirib koʻring" offers only terms that return something today — the
  design's "Mashhur soʻrovlar" would need search statistics the shop does not
  have, and a suggested query that finds nothing is worse than none.
*/
const TRY_TERMS = ["Vitamin C", "Magniy", "Kalsiy", "Biotin", "Vitamin D", "Omega", "Kollagen", "Swiss Energy", "Dr. Frei", "Delical"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop.search" });
  return { ...buildPageMetadata({ locale, path: "/search", title: t("title"), description: t("startText") }), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params, searchParams }: { params: Params; searchParams: Query }) {
  const { locale } = await params;
  const { q: rawQ, category } = await searchParams;
  setRequestLocale(locale);
  const q = rawQ?.trim() ?? "";

  const [t, tc, tp, common, home, categories, pool, found] = await Promise.all([
    getTranslations("shop.search"),
    getTranslations("cart.v3"),
    getTranslations("product"),
    getTranslations("common"),
    getTranslations("home"),
    shopflow.getCategories(locale).catch(() => []),
    getAllProducts({ locale, sort: "popular", assortment: "core" }).catch(() => ({ items: [] as Product[] })),
    q ? getAllProducts({ locale, search: q }).catch(() => ({ items: [] as Product[] })) : null,
  ]);

  const results = found?.items ?? [];
  const byCategory = new Map<string, number>();
  for (const p of results) if (p.categoryId) byCategory.set(p.categoryId, (byCategory.get(p.categoryId) ?? 0) + 1);
  const chips = categories.filter((c) => byCategory.has(c.id));
  const activeCategory = chips.find((c) => c.slug === category);
  const shown = activeCategory ? results.filter((p) => p.categoryId === activeCategory.id) : results;

  const resultIds = new Set(results.map((p) => p.id));
  const others = [...pool.items]
    .filter((p) => !resultIds.has(p.id) && p.inStock)
    .sort((a, b) => Number(!cutoutOf(a)) - Number(!cutoutOf(b)))
    .slice(0, 6);
  const haystack = pool.items.map((p) => `${p.name} ${p.tagline}`.toLowerCase());
  const tryTerms = TRY_TERMS.filter((term) => haystack.some((h) => h.includes(term.toLowerCase()))).slice(0, 6);

  const crumbs = (
    <nav aria-label={tp("breadcrumbHome")} className="hidden gap-2 text-sm text-muted lg:flex">
      <Link href="/" className="hover:text-ink">{tp("breadcrumbHome")}</Link>
      <span aria-hidden>/</span>
      <span className="text-ink">{t("title")}</span>
    </nav>
  );

  const tryChips = tryTerms.length > 0 && (
    <div className="flex flex-col gap-2.5">
      <span className="text-base font-bold">{t("tryTitle")}</span>
      <div className="flex flex-wrap gap-2">
        {tryTerms.map((term) => (
          <Link key={term} href={{ pathname: "/search", query: { q: term } }} className={chipClass()}>
            {term}
          </Link>
        ))}
      </div>
    </div>
  );

  const rail = (title: string, products: Product[]) =>
    products.length > 0 && (
      <section aria-labelledby="search-rail" className="flex flex-col gap-3.5 lg:gap-6">
        <h2 id="search-rail" className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{title}</h2>
        <ProductGrid products={products} mobileLimit={4} />
      </section>
    );

  if (results.length === 0) {
    return (
      <div className="wrap flex flex-col gap-8 pb-9 pt-3 lg:gap-10 lg:pb-[72px] lg:pt-5">
        {crumbs}
      <TrackSearch term={q} />
        <TrackSearch term={q} />
        <section className="grid items-start gap-6 lg:-mt-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">
              {q ? t("emptyTitle", { query: q }) : t("startTitle")}
            </h1>
            <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{q ? t("emptyText") : t("startText")}</p>
            <div className="mt-2">{tryChips}</div>
          </div>
          {q && (
            <div className="flex flex-col gap-3 rounded-[20px] bg-tile p-5 lg:p-7">
              <h2 className="text-xl font-bold">{t("notifyTitle")}</h2>
              <p className="text-base leading-6 text-ink-2">{t("notifyText")}</p>
              <OutOfStockNotify
                productId={`search:${q.slice(0, 100)}`}
                productName={`Qidiruv: «${q.slice(0, 180)}»`}
                label=""
                submitLabel={t("notifySubmit")}
                event="search_notify"
                bare
              />
              <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold underline-offset-4 hover:underline">
                {t("orTelegram")}
              </a>
            </div>
          )}
        </section>
        {rail(t("maybe"), others)}
      </div>
    );
  }

  return (
    <div className="wrap flex flex-col gap-5 pb-9 pt-3 lg:gap-6 lg:pb-[72px] lg:pt-5">
      {crumbs}
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1 lg:-mt-1.5">
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{t("resultsFor", { query: q })}</h1>
        <span className="text-[15px] text-muted lg:text-[17px]">{t("count", { count: results.length })}</span>
      </div>
      {chips.length > 1 && (
        <nav aria-label={t("categories")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          <Chip href={`/search?q=${encodeURIComponent(q)}`} active={!activeCategory} count={results.length}>
            {t("all")}
          </Chip>
          {chips.map((c) => (
            <Chip
              key={c.id}
              href={`/search?q=${encodeURIComponent(q)}&category=${c.slug}`}
              active={activeCategory?.id === c.id}
              count={byCategory.get(c.id)}
            >
              {c.name}
            </Chip>
          ))}
        </nav>
      )}
      <ProductGrid products={shown} mobileLimit={shown.length} />
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-tile p-5 lg:px-7 lg:py-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-[19px] font-bold">{t("helpTitle")}</h2>
          <p className="text-base leading-6 text-ink-2">{t("helpText")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className={buttonVariants("primary")}>
            {tc("telegram")}
          </a>
          <Link href="/quiz" className={cn(buttonVariants("secondary"), "bg-transparent")}>
            {common("quiz")}
          </Link>
        </div>
      </div>
      <div className="pt-4">{rail(home("catalog.title"), others)}</div>
    </div>
  );
}
