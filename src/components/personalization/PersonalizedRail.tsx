"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProductCard } from "@/components/product/ProductCard";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { getUserProfile } from "@/lib/personalization/tracker";
import { getRecommendations } from "@/lib/personalization/engine";
import { useProfile } from "@/lib/profile/store";
import { hasSignal } from "@/lib/profile/types";
import { getPersonalOffers } from "@/app/actions/personalOffers";
import { useCart } from "@/lib/cart/store";

interface Props {
  allProducts: Product[];
  excludeSlugs?: string[];
}

interface Entry {
  product: Product;
  reasons: string[];
}

/*
  One "for you" rail, two sources, in this order:

  1. What the visitor *told* us — goals and ingredients saved on /profile or
     carried over from the quiz. These come back from the server with the
     topic and ingredient names that earned each place, so the rail can say
     why a product is there.
  2. What they *did* — the behavioural recommender, used when there is no
     saved profile yet. It cannot explain itself, so it shows no reasons.

  Two rails would compete for the same screen and the same products; the
  stated preference simply wins.
*/
export function PersonalizedRail({ allProducts, excludeSlugs = [] }: Props) {
  const t = useTranslations("home.forYou");
  const locale = useLocale() as Locale;
  const profile = useProfile((s) => s.profile);
  // What is already in the cart is not a recommendation.
  const inCart = useCart((s) => s.lines.map((l) => l.slug).join(","));
  const exclude = [...excludeSlugs, ...(inCart ? inCart.split(",") : [])];
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stated, setStated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (hasSignal(profile)) {
        const offers = await getPersonalOffers(
          { goals: profile.goals, ingredients: profile.focusIngredients, excludeSlugs: exclude },
          locale,
        );
        if (!cancelled && offers.length >= 2) {
          setEntries(offers);
          setStated(true);
          return;
        }
      }

      const behaviour = getUserProfile();
      // Fewer than two views is noise, not a preference.
      if (!behaviour || behaviour.views.length < 2) return;
      const recs = getRecommendations(allProducts, behaviour, exclude, 8);
      if (!cancelled && recs.length >= 2) {
        setEntries(recs.map((product) => ({ product, reasons: [] })));
        setStated(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
    // `excludeSlugs` is a fresh array on every render from most callers, so it
    // is compared by content rather than identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts, exclude.join(","), locale, profile]);

  if (entries.length === 0) return null;

  return (
    <section aria-labelledby="for-you" className="wrap flex flex-col gap-3.5 lg:gap-6">
      <div className="flex flex-col gap-1">
        <h2 id="for-you" className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">
          {t("title")}
        </h2>
        <p className="text-sm text-muted lg:text-base">{stated ? t("subtitleStated") : t("subtitle")}</p>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(188px,1fr))] md:gap-x-3 md:gap-y-6 md:overflow-visible md:px-0">
        {entries.map((entry, i) => (
          <div key={entry.product.id} className="flex h-full w-40 shrink-0 flex-col gap-2 md:w-auto">
            {/* The card stretches; the reason line keeps its own height, so
                cards stay aligned whether or not they have one. */}
            <div className="flex-1">
              <ProductCard product={entry.product} index={i} />
            </div>
            {entry.reasons.length > 0 && (
              <p className="px-1 text-[13px] leading-snug text-ink-2">
                <span className="font-semibold text-ink">{t("because")}</span> {entry.reasons.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
