import type { ComponentType } from "react";
import type { Locale } from "@/lib/i18n/routing";
import type { Product, UpsellOffer } from "@/lib/shopflow/types";
import { Omega3Premium } from "./Omega3Premium";
import { VitaminD3K2 } from "./VitaminD3K2";
import { MagnesiumB6 } from "./MagnesiumB6";
import { ImmunoComplex } from "./ImmunoComplex";
import { CollagenBeauty } from "./CollagenBeauty";
import { MultivitaminDaily } from "./MultivitaminDaily";

export interface BespokeProps {
  product: Product;
  upsells: UpsellOffer[];
  locale: Locale;
}

/**
 * Maps a product slug to its hand-crafted bespoke page. Products without an
 * entry here fall back to the rich ProductTemplate — so adding a product in
 * Shopflow never breaks, and a new bespoke design is just one new entry.
 */
export const bespokeRegistry: Record<string, ComponentType<BespokeProps>> = {
  "omega-3-premium": Omega3Premium,
  "vitamin-d3-k2": VitaminD3K2,
  "magnesium-b6": MagnesiumB6,
  "immuno-complex": ImmunoComplex,
  "collagen-beauty": CollagenBeauty,
  "multivitamin-daily": MultivitaminDaily,
};

export function getBespokeComponent(slug: string): ComponentType<BespokeProps> | null {
  return bespokeRegistry[slug] ?? null;
}
