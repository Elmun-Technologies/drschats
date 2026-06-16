"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { UpsellOffer } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";

export function UpsellRail({ offers }: { offers: UpsellOffer[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const add = useCart((s) => s.add);

  if (offers.length === 0) return null;

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-semibold">{t("upsell")}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {offers.map(({ product, discountPercent, reason }) => {
          const discounted = Math.round(product.price * (1 - discountPercent / 100));
          return (
            <div key={product.id} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                <Image src={product.images[0]?.url ?? ""} alt={product.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-xs text-faint">{reason}</p>
                <p className="mt-0.5 text-sm font-medium">{product.name}</p>
                <Badge tone="gold" className="mt-1 w-fit">
                  {t("upsellDiscount", { percent: discountPercent })}
                </Badge>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-accent">{formatMoney(discounted, locale)}</span>
                  </div>
                  <button
                    onClick={() => {
                      add(
                        {
                          productId: product.id,
                          slug: product.slug,
                          name: product.name,
                          image: product.images[0]?.url ?? "",
                          price: product.price,
                          oldPrice: product.oldPrice,
                          upsellDiscountPercent: discountPercent,
                        },
                        1,
                      );
                      trackAddToCart(product.slug, discounted, 1);
                    }}
                    className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-ink transition-transform hover:scale-105"
                  >
                    {t("addUpsell")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
