"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { getUserProfile } from "@/lib/personalization/tracker";
import { getRecommendations } from "@/lib/personalization/engine";
import { useProfile } from "@/lib/profile/store";
import { hasSignal } from "@/lib/profile/types";
import { getPersonalOffers } from "@/app/actions/personalOffers";

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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stated, setStated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (hasSignal(profile)) {
        const offers = await getPersonalOffers(
          { goals: profile.goals, ingredients: profile.focusIngredients, excludeSlugs },
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
      const recs = getRecommendations(allProducts, behaviour, excludeSlugs, 8);
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
  }, [allProducts, excludeSlugs.join(","), locale, profile]);

  if (entries.length === 0) return null;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("eyebrow")}</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-2 text-muted">{stated ? t("subtitleStated") : t("subtitle")}</p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {entries.map((entry, i) => (
            <div key={entry.product.id} className="flex h-full flex-col gap-2">
              {/* The card stretches; the reason line keeps its own height, so
                  cards stay aligned whether or not they have one. */}
              <div className="flex-1">
                <ProductCard product={entry.product} index={i} />
              </div>
              {entry.reasons.length > 0 && (
                <p className="px-1 text-xs leading-snug text-muted">
                  <span className="font-semibold text-accent-strong">{t("because")}</span>{" "}
                  {entry.reasons.join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
