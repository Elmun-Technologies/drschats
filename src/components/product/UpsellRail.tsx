"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { UpsellOffer } from "@/lib/shopflow/types";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { DiscountBadge } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { trackAddToCart } from "@/lib/analytics/events";
import { productCutout } from "@/lib/content/product-cutouts";

/** Companion offers from the catalogue, each with its real extra discount. */
export function UpsellRail({ offers, title }: { offers: UpsellOffer[]; title: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const add = useCart((s) => s.add);
  const notify = useToast((s) => s.notify);

  if (offers.length === 0) return null;

  return (
    <section aria-labelledby="pdp-upsell" className="wrap flex flex-col gap-3.5 lg:gap-6">
      <h2 id="pdp-upsell" className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {offers.map(({ product, discountPercent }) => {
          const discounted = Math.round(product.price * (1 - discountPercent / 100));
          const image = productCutout(product.slug) ?? product.images[0]?.url;
          return (
            <div key={product.id} className="flex gap-4 rounded-[20px] bg-tile p-4">
              <Link href={`/product/${product.slug}`} className="relative h-24 w-24 shrink-0 rounded-[16px] bg-bg">
                {image && <Image src={image} alt={product.name} fill sizes="96px" className="object-contain p-2" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link href={`/product/${product.slug}`} className="text-[15px] font-medium leading-5 hover:underline">
                  {product.name}
                </Link>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatMoney(discounted, locale)}</span>
                    <DiscountBadge percent={discountPercent} />
                  </span>
                  <Button
                    size="sm"
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
                      notify();
                    }}
                  >
                    {t("addUpsell")}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
