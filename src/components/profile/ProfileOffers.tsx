"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { ProductCard } from "@/components/product/ProductCard";
import { useProfile } from "@/lib/profile/store";
import { hasSignal } from "@/lib/profile/types";
import { getPersonalOffers, type PersonalOffer } from "@/app/actions/personalOffers";

/** The profile's own output: what these goals mean for the catalogue. */
export function ProfileOffers() {
  const t = useTranslations("profile.offers");
  const locale = useLocale() as Locale;
  const profile = useProfile((s) => s.profile);
  const [offers, setOffers] = useState<PersonalOffer[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!hasSignal(profile)) {
      setOffers([]);
      return;
    }
    getPersonalOffers(
      { goals: profile.goals, ingredients: profile.focusIngredients },
      locale,
    ).then((result) => {
      if (!cancelled) setOffers(result.slice(0, 4));
    });
    return () => {
      cancelled = true;
    };
  }, [profile, locale]);

  if (offers.length === 0) return null;

  return (
    <section aria-labelledby="profile-offers">
      <h2 id="profile-offers" className="font-display text-lg font-bold tracking-tight">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("description")}</p>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {offers.map((offer, i) => (
          <div key={offer.product.id} className="flex h-full flex-col gap-2">
            <div className="flex-1">
              <ProductCard product={offer.product} index={i} />
            </div>
            {offer.reasons.length > 0 && (
              <p className="px-1 text-xs leading-snug text-muted">
                <span className="font-semibold text-accent-strong">{t("because")}</span>{" "}
                {offer.reasons.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
