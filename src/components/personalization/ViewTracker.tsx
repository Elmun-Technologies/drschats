"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/personalization/tracker";

interface Props {
  slug: string;
  categorySlug: string;
  price: number;
}

export function ViewTracker({ slug, categorySlug, price }: Props) {
  useEffect(() => {
    trackView(slug, categorySlug, price);
  }, [slug, categorySlug, price]);

  return null;
}
