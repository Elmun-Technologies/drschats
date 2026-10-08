import type { Category } from "@/lib/shopflow/types";

/**
 * A shelf worth linking to. `productCount` is optional in the Shopflow schema
 * and the HTTP client does not fill it, so an unknown count means "show it";
 * only an explicit zero hides a category.
 */
export function isStocked(category: Category): boolean {
  return category.productCount !== 0;
}
