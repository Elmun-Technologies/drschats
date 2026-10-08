"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { UpsellOffer } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { productCutout } from "@/lib/content/product-cutouts";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";

export function UpsellRail({ offers }: { offers: UpsellOffer[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const add = useCart((s) => s.add);

  if (offers.length === 0) return null;

  return (
    <section aria-labelledby="upsell-heading" className="flex flex-col gap-4 lg:gap-6">
      <h2 id="upsell-heading" className="text-[22px] font-bold leading-7 lg:text-h-section">{t("upsell")}</h2>
      <div className="grid gap-3 sm:grid-cols-3 lg:gap-5">
        {offers.map(({ product, discountPercent, reason }) => {
          const discounted = Math.round(product.price * (1 - discountPercent / 100));
          return (
            <div key={product.id} className="flex gap-4 rounded-[20px] border border-line p-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[14px] bg-tile">
                <Image src={productCutout(product.slug) ?? product.images[0]?.url ?? ""} alt={product.name} fill sizes="80px" className="object-contain p-1.5" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-[13px] text-muted">{reason}</p>
                <p className="mt-0.5 line-clamp-2 text-[15px] leading-5">{product.name}</p>
                <Badge className="mt-1.5 w-fit">
                  {t("upsellDiscount", { percent: discountPercent })}
                </Badge>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold">{formatMoney(discounted, locale)}</span>
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
                    className={buttonVariants("light", "sm")}
                  >
                    {t("addUpsell")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
