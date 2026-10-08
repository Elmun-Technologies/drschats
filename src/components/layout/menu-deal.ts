import type { Product } from "@/lib/shopflow/types";
import { cutoutOf } from "@/lib/catalog/product-facts";

/** The "Haftaning taklifi" tile in the catalogue menu — the deepest real discount. */
export interface MenuDeal {
  slug: string;
  name: string;
  price: number;
  oldPrice: number;
  image: string | null;
}

export function toMenuDeal(product: Product | undefined): MenuDeal | null {
  if (!product?.oldPrice || product.oldPrice <= product.price) return null;
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    image: cutoutOf(product) ?? product.images[0]?.url ?? null,
  };
}

export function discountPercent(deal: Pick<MenuDeal, "price" | "oldPrice">): number {
  return Math.round((1 - deal.price / deal.oldPrice) * 100);
}
