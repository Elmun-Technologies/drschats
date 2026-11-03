import type { Product } from "@/lib/shopflow/types";

/*
  What kind of thing a product is, for deciding what may sit next to it.
  A supplement is offered beside a supplement; coffee, a home device or a
  clinical drink only beside its own kind. The «Savatga qoʻshildi» card and
  the upsell ladder both read this, so neither offers coffee to someone who
  has just chosen ImmunoVit.
*/
export type ProductKind = "supplement" | "coffee" | "device" | "nutrition";

export function productKind(p: Pick<Product, "categorySlug">): ProductKind {
  if (p.categorySlug === "coffee") return "coffee";
  if (p.categorySlug === "devices") return "device";
  if (p.categorySlug === "clinical-nutrition") return "nutrition";
  return "supplement";
}
