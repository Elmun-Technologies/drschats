"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { formatMoney } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlist } from "@/lib/wishlist/store";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import type { Product } from "@/lib/shopflow/types";

type Filter = "all" | "sale" | "stock";

/*
  Design: FavoritesV3 / FavoritesMobileV3.

  Saved products are resolved against a catalogue pool passed in by the page:
  the store holds product ids and the API has no by-ids lookup. A saved
  product outside the pool cannot be rendered; once the catalogue outgrows the
  pool this needs `getProductsByIds` on the backend rather than a bigger pool.

  No "Ulashish" button: the list lives in this browser, so a shared link
  would open the recipient's own (empty) list.

  The heading renders before hydration — only the list depends on
  localStorage, and a page with no h1 until then is an unnamed page.
*/
export function WishlistView({ allProducts, recommended }: { allProducts: Product[]; recommended: Product[] }) {
  const t = useTranslations("wishlist");
  const tf = useTranslations("shop.favorites");
  const ts = useTranslations("shop.v3");
  const tsearch = useTranslations("shop.search");
  const tp = useTranslations("product");
  const locale = useLocale() as Locale;
  const ids = useWishlist((s) => s.items);
  const add = useCart((s) => s.add);
  const notify = useToast((s) => s.notify);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  useEffect(() => setHydrated(true), []);

  const byId = new Map(allProducts.map((p) => [p.id, p]));
  // Most recently saved first: the store appends, so read it backwards.
  const saved = hydrated ? ([...ids].reverse().map((id) => byId.get(id)).filter(Boolean) as Product[]) : [];
  const onSale = saved.filter((p) => p.oldPrice && p.oldPrice > p.price);
  const inStock = saved.filter((p) => p.inStock);
  const shown = filter === "sale" ? onSale : filter === "stock" ? inStock : saved;
  const total = inStock.reduce((sum, p) => sum + p.price, 0);
  const savedIds = new Set(saved.map((p) => p.id));
  const rec = recommended.filter((p) => !savedIds.has(p.id) && p.inStock).slice(0, 6);

  function addAll() {
    for (const p of inStock) {
      // Silent: one confirmation for the whole batch, not one per product.
      add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? "", price: p.price, oldPrice: p.oldPrice }, 1, { silent: true });
    }
    notify();
  }

  const addAllButton = inStock.length > 0 && (
    <Button onClick={addAll} className="w-full lg:w-auto">
      {tf("addAll", { amount: formatMoney(total, locale) })}
    </Button>
  );

  return (
    <div className="wrap flex flex-col gap-4 pb-9 pt-1 lg:gap-7 lg:pb-[72px] lg:pt-5">
      <nav aria-label={tp("breadcrumbHome")} className="hidden gap-2 text-sm text-muted lg:flex">
        <Link href="/" className="hover:text-ink">{tp("breadcrumbHome")}</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{t("title")}</span>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-4 lg:-mt-2.5">
        <div className="flex items-baseline gap-2.5 lg:gap-3.5">
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{t("title")}</h1>
          {saved.length > 0 && <span className="text-[15px] text-muted lg:text-[17px]">{t("count", { count: saved.length })}</span>}
        </div>
        {saved.length > 0 && (
          <div className="hidden lg:block">{addAllButton}</div>
        )}
      </div>

      {!hydrated ? (
        <div className="min-h-[50vh]" />
      ) : saved.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[28px] bg-tile px-6 py-14 text-center">
          <p className="text-base text-ink-2 lg:text-[17px]">{t("empty")}</p>
          <Link href="/products" className={buttonVariants("primary", "lg")}>
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <>
          <div className="lg:hidden">{addAllButton}</div>
          <nav aria-label={t("title")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <Chip active={filter === "all"} count={saved.length} onClick={() => setFilter("all")}>{tsearch("all")}</Chip>
            {onSale.length > 0 && (
              <Chip active={filter === "sale"} count={onSale.length} onClick={() => setFilter("sale")}>{ts("onSale")}</Chip>
            )}
            <Chip active={filter === "stock"} count={inStock.length} onClick={() => setFilter("stock")}>{ts("inStock")}</Chip>
          </nav>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-[repeat(auto-fill,minmax(188px,1fr))] md:gap-x-3 md:gap-y-6">
            {shown.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3.5 rounded-[20px] bg-tile p-[18px] lg:px-7 lg:py-6">
            <span aria-hidden className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg lg:flex">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h16v11H4zM8 20h8M12 16v4" />
              </svg>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[17px] font-bold lg:text-lg">{tf("deviceTitle")}</span>
              <span className="text-base leading-6 text-ink-2">{tf("deviceText")}</span>
            </span>
          </div>
        </>
      )}

      {rec.length > 0 && (
        <section aria-labelledby="fav-rec" className="hidden flex-col gap-5 pt-4 lg:flex">
          <h2 id="fav-rec" className="text-[26px] font-bold leading-8">{tf("rec")}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(188px,1fr))] gap-x-3 gap-y-6">
            {rec.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
