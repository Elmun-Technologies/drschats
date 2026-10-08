"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import type { Product } from "@/lib/shopflow/types";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { COMPARE_LIMIT, useCompare } from "@/lib/compare/store";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";
import { discountPercent } from "@/components/ui/Price";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cutoutOf, unitOf, unitPriceOf, brandOf } from "@/lib/catalog/product-facts";

/*
  Design: CompareV3. Every cell is the product's own data; a missing value is
  "—", never a guess. Rows whose values differ get the tile background, and
  "Faqat farqlar" hides the rest. Products are resolved against the page's
  catalogue pool, as the wishlist's are.
*/
export function CompareView({ allProducts }: { allProducts: Product[] }) {
  const t = useTranslations("shop.compare");
  const ts = useTranslations("shop.v3");
  const common = useTranslations("common");
  const tp = useTranslations("product");
  const locale = useLocale() as Locale;
  const ids = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const add = useCart((s) => s.add);
  const [hydrated, setHydrated] = useState(false);
  const [onlyDiff, setOnlyDiff] = useState(false);
  useEffect(() => setHydrated(true), []);

  const byId = new Map(allProducts.map((p) => [p.id, p]));
  const products = hydrated ? (ids.map((id) => byId.get(id)).filter(Boolean) as Product[]) : [];
  const dash = "—";

  const rows: { label: string; values: string[] }[] = [
    { label: t("price"), values: products.map((p) => formatMoney(p.price, locale)) },
    {
      label: t("unit"),
      values: products.map((p) => {
        const u = unitPriceOf(p);
        return u ? common("perUnit", { price: formatMoney(Math.round(u.amount), locale), unit: common(u.unit === "tablet" ? "unitTablet" : "unitCapsule") }) : dash;
      }),
    },
    { label: t("discount"), values: products.map((p) => (discountPercent(p.price, p.oldPrice) ? `−${discountPercent(p.price, p.oldPrice)}%` : dash)) },
    {
      label: t("composition"),
      values: products.map((p) => (p.ingredients.length ? p.ingredients.slice(0, 5).map((i) => i.name).join(", ") : p.tagline || dash)),
    },
    {
      label: t("form"),
      values: products.map((p) => {
        const unit = unitOf(p)?.unit;
        return unit ? ts(unit === "tablet" ? "formTablet" : "formCapsule") : dash;
      }),
    },
    { label: t("pack"), values: products.map((p) => (p.servings != null ? String(p.servings) : dash)) },
    { label: t("brand"), values: products.map((p) => brandOf(p)?.name ?? dash) },
    { label: t("origin"), values: products.map((p) => p.origin ?? dash) },
  ];
  const diff = (values: string[]) => new Set(values).size > 1;
  const visible = onlyDiff ? rows.filter((r) => diff(r.values)) : rows;
  // Phones scroll sideways with fixed 150px columns; desktop shares the width.
  const cols = { "--n": Math.max(products.length, 1) } as React.CSSProperties;
  const COLS = "grid-cols-[100px_repeat(var(--n),150px)] lg:grid-cols-[240px_repeat(var(--n),minmax(0,1fr))]";

  return (
    <div className="wrap flex flex-col gap-5 pb-9 pt-1 lg:gap-6 lg:pb-[72px] lg:pt-5">
      <nav aria-label={tp("breadcrumbHome")} className="hidden gap-2 text-sm text-muted lg:flex">
        <Link href="/" className="hover:text-ink">{tp("breadcrumbHome")}</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{t("title")}</span>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-4 lg:-mt-2.5">
        <div className="flex items-baseline gap-2.5 lg:gap-3.5">
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{t("title")}</h1>
          {products.length > 0 && <span className="text-[15px] text-muted lg:text-[17px]">{ts("count", { count: products.length })}</span>}
        </div>
        {products.length > 1 && (
          <div role="group" aria-label={t("show")} className="flex items-center gap-1.5">
            <span className="mr-1.5 text-[15px] text-ink-2">{t("show")}</span>
            <Chip active={!onlyDiff} onClick={() => setOnlyDiff(false)} className="h-11 lg:h-9">{t("all")}</Chip>
            <Chip active={onlyDiff} onClick={() => setOnlyDiff(true)} className="h-11 lg:h-9">{t("diff")}</Chip>
          </div>
        )}
      </div>

      {!hydrated ? (
        <div className="min-h-[50vh]" />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[28px] bg-tile px-6 py-14 text-center">
          <h2 className="text-xl font-bold lg:text-2xl">{t("emptyTitle")}</h2>
          <p className="max-w-[520px] text-base leading-6 text-ink-2">{t("emptyText", { limit: COMPARE_LIMIT })}</p>
          <Link href="/products" className={buttonVariants("primary", "lg")}>
            {ts("show")}
          </Link>
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="min-w-max lg:min-w-0">
            <div style={cols} className={cn("grid items-start gap-3 bg-bg py-3 lg:sticky lg:top-[var(--header-sticky)] lg:z-10 lg:gap-4", COLS)}>
              <div className="flex flex-col gap-2.5 pt-2">
                <Button variant="light" size="sm" onClick={clear} className="h-auto min-h-11 self-start whitespace-normal py-2 text-left lg:min-h-10">
                  {t("clear")}
                </Button>
              </div>
              {products.map((p) => {
                const image = cutoutOf(p) ?? p.images[0]?.url;
                return (
                  <div key={p.id} className="relative flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      aria-label={t("removeFor", { name: p.name })}
                      className="absolute right-2 top-2 z-[1] flex h-11 w-11 items-center justify-center rounded-full bg-bg"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                    <Link href={`/product/${p.slug}`} aria-label={p.name} tabIndex={-1} className="relative h-40 rounded-[20px] bg-tile lg:h-[200px]">
                      {image && <Image src={image} alt="" fill sizes="240px" className="object-contain p-4" />}
                    </Link>
                    <Link href={`/product/${p.slug}`} className="min-h-[42px] text-base leading-[21px] hover:underline">
                      {p.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="text-xl font-bold lg:text-[22px]">{formatMoney(p.price, locale)}</span>
                      {p.oldPrice && p.oldPrice > p.price && <span className="text-sm text-muted line-through">{formatNumber(p.oldPrice)}</span>}
                    </div>
                    <Button
                      className="w-full"
                      disabled={!p.inStock}
                      onClick={() => {
                        add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? "", price: p.price, oldPrice: p.oldPrice });
                        trackAddToCart(p.slug, p.price, 1);
                      }}
                    >
                      {p.inStock ? common("addToCartShort") : common("outOfStock")}
                    </Button>
                  </div>
                );
              })}
            </div>
            <div role="table" aria-label={t("title")}>
              {visible.map((r) => (
                <div
                  key={r.label}
                  role="row"
                  style={cols}
                  className={cn(
                    "grid items-start gap-3 border-b py-[18px] text-[15px] lg:gap-4 lg:text-base",
                    COLS,
                    diff(r.values) ? "-mx-3 rounded-sm border-transparent bg-tile px-3" : "border-line",
                  )}
                >
                  <span role="rowheader" className="text-muted">{r.label}</span>
                  {r.values.map((v, i) => (
                    <span key={products[i].id} role="cell">{v}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {products.length > 0 && <p className="text-sm text-muted">{t("note")}</p>}
    </div>
  );
}
