"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { cutoutOf } from "@/lib/catalog/product-facts";
import { formatMoney } from "@/lib/utils";

/** "Add one of these and delivery is free" — under the cart's free-shipping bar. */
export function FreeShippingFillers({ products }: { products: Product[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("cart.v3");
  const add = useCart((s) => s.add);
  if (products.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 pt-1">
      <span className="text-sm font-semibold">{t("fillersTitle")}</span>
      <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
        {products.map((p) => {
          const image = cutoutOf(p) ?? p.images[0]?.url;
          return (
            <li key={p.id} className="flex w-60 shrink-0 items-center gap-2.5 rounded-[14px] bg-bg p-2 lg:w-auto">
              <span className="relative h-12 w-12 shrink-0 rounded-[10px] bg-tile">
                {image && <Image src={image} alt="" fill sizes="48px" className="object-contain p-1" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span title={p.name} className="line-clamp-2 text-[13px] leading-4">{p.name}</span>
                <span className="text-sm font-bold">{formatMoney(p.price, locale)}</span>
              </span>
              <button
                type="button"
                aria-label={t("addFor", { name: p.name })}
                onClick={() =>
                  add({
                    productId: p.id,
                    slug: p.slug,
                    name: p.name,
                    image: p.images[0]?.url ?? "",
                    price: p.price,
                    oldPrice: p.oldPrice,
                  })
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-ink text-xl font-medium text-white transition-colors hover:bg-black"
              >
                +
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
