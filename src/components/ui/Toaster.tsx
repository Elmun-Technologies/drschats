"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { useUpsell } from "@/lib/upsell/store";
import { useToast, type AddedItem } from "@/lib/ui/toast";
import { useCart } from "@/lib/cart/store";
import { getUpsellProducts } from "@/app/actions/getUpsellProducts";
import { getSimilarProducts } from "@/lib/personalization/engine";
import { cutoutOf } from "@/lib/catalog/product-facts";
import { formatMoney } from "@/lib/utils";

/*
  The add-to-cart confirmation: what was added, the way to the cart, and two
  products that go with it (same audience, same shelf first — the similarity
  rules the product page uses). Not a modal: it sits in the corner, closes by
  itself after a few seconds, and stays while the pointer or focus is on it.
*/
// One request per locale: names come back in the language they were asked for.
const pools = new Map<Locale, Promise<Product[]>>();

function useSuggestions(item: AddedItem | undefined, locale: Locale) {
  const lines = useCart((s) => s.lines);
  const [all, setAll] = useState<Product[]>([]);
  useEffect(() => {
    if (!item) return;
    if (!pools.has(locale)) pools.set(locale, getUpsellProducts(locale).catch(() => []));
    let alive = true;
    pools.get(locale)!.then((p) => alive && setAll(p));
    return () => {
      alive = false;
    };
  }, [item, locale]);
  if (!item || all.length === 0) return [];
  const inCart = new Set(lines.map((l) => l.productId));
  const added = all.find((p) => p.id === item.productId);
  const candidates = all.filter((p) => !inCart.has(p.id));
  return (added ? getSimilarProducts(added, candidates, 2) : candidates.slice(0, 2));
}

export function Toaster() {
  const t = useTranslations("common");
  const tp = useTranslations("popups.added");
  const locale = useLocale() as Locale;
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);
  const add = useCart((s) => s.add);
  const pathname = usePathname();
  // The upsell ladder is its own confirmation; on the cart page the cart is already in view.
  const ladderOpen = useUpsell((s) => s.isOpen);
  const onCart = pathname.startsWith("/cart");
  const toast = ladderOpen ? undefined : toasts[0];
  const full = !onCart;
  const suggestions = useSuggestions(toast?.kind === "cart" && full ? toast.item : undefined, locale);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--bottom-nav)+1rem)] z-[60] flex justify-end sm:left-auto sm:right-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={(e) => e.key === "Escape" && dismiss(toast.id)}
            className="pointer-events-auto w-full max-w-[360px] rounded-[20px] border border-line bg-bg p-4 shadow-pop"
          >
            {toast.kind === "copied" ? (
              <p className="text-[15px] font-semibold">{t("linkCopied")}</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="relative h-14 w-14 shrink-0 rounded-[12px] bg-tile">
                    {toast.item?.image && <Image src={toast.item.image} alt="" fill sizes="56px" className="object-contain p-1.5" />}
                    <span aria-hidden className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-ink">{t("addedToCart")}</span>
                    {toast.item && <span className="line-clamp-1 text-sm text-ink-2">{toast.item.name}</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    aria-label={t("close")}
                    className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-tile hover:text-ink"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {suggestions.length > 0 && (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-[13px] font-semibold text-ink-2">{tp("withIt")}</p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {suggestions.map((p) => {
                        const image = cutoutOf(p) ?? p.images[0]?.url;
                        return (
                          <li key={p.id} className="flex items-center gap-2.5">
                            <span className="relative h-11 w-11 shrink-0 rounded-[10px] bg-tile">
                              {image && <Image src={image} alt="" fill sizes="44px" className="object-contain p-1" />}
                            </span>
                            <Link href={`/product/${p.slug}`} onClick={() => dismiss(toast.id)} className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-4 hover:underline">
                              {p.name}
                            </Link>
                            <span className="shrink-0 text-[13px] font-bold">{formatMoney(p.price, locale)}</span>
                            <button
                              type="button"
                              aria-label={tp("addFor", { name: p.name })}
                              onClick={() =>
                                add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? "", price: p.price, oldPrice: p.oldPrice, saleEndsAt: p.saleEndsAt })
                              }
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-tile text-lg font-medium hover:bg-ink hover:text-white"
                            >
                              +
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {full && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className="flex h-11 items-center justify-center rounded-sm bg-tile text-sm font-semibold hover:bg-tile-hover"
                  >
                    {tp("continue")}
                  </button>
                  <Link
                    href="/cart"
                    onClick={() => dismiss(toast.id)}
                    className="flex h-11 items-center justify-center rounded-sm bg-ink text-sm font-semibold text-white hover:bg-black"
                  >
                    {t("viewCart")}
                  </Link>
                </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
