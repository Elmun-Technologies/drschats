import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n/routing";
import type { Product, UpsellOffer } from "@/lib/shopflow/types";
import { Omega3Premium } from "./Omega3Premium";
import { VitaminD3K2 } from "./VitaminD3K2";
import { CollagenBeauty } from "./CollagenBeauty";
import { ImmunoComplex } from "./ImmunoComplex";
import { MagnesiumB6 } from "./MagnesiumB6";
import { MultivitaminDaily } from "./MultivitaminDaily";

export interface BespokeProps {
  product: Product;
  upsells: UpsellOffer[];
  locale: Locale;
}

/**
 * Bespoke rich cinematic pages for flagship formulas.
 */
export const bespokeRegistry: Record<string, ComponentType<BespokeProps>> = {
  "omega-3-premium": Omega3Premium,
  "vitamin-d3-k2": VitaminD3K2,
  "collagen-beauty": CollagenBeauty,
  "immuno-complex": ImmunoComplex,
  "magnesium-b6": MagnesiumB6,
  "multivitamin-daily": MultivitaminDaily,
};

export function getBespokeComponent(slug: string): ComponentType<BespokeProps> | null {
  return bespokeRegistry[slug] ?? null;
}
