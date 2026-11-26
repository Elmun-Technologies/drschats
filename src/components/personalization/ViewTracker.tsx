"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/personalization/tracker";
import { isAdult } from "@/lib/catalog/adult";

interface Props {
  slug: string;
  categorySlug: string;
  price: number;
}

export function ViewTracker({ slug, categorySlug, price }: Props) {
  useEffect(() => {
    // 18+ views stay out of the visitor's history: "recently viewed" on a shared device would show them.
    if (isAdult({ categorySlug })) return;
    trackView(slug, categorySlug, price);
  }, [slug, categorySlug, price]);

  return null;
}
