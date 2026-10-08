import { shopflow } from "@/lib/shopflow";
import type { ProductListParams, ProductListResult } from "@/lib/shopflow/types";

const PAGE_SIZE = 100;
/** A ceiling, not a target: 2 000 products before the listing stops asking. */
const MAX_PAGES = 20;

/*
  Every product matching `params`, page by page.

  The catalogue, search, brand, sale, wishlist and compare views filter and
  count over the whole matching set on the server, so reading one page of 100
  made everything after it unreachable once a category outgrew it. Shopflow
  pages; this walks the pages until `total` is reached. When the catalogue
  grows into the thousands, the filters belong in the backend instead.
*/
export async function getAllProducts(params: Omit<ProductListParams, "page" | "pageSize">): Promise<ProductListResult> {
  const first = await shopflow.getProducts({ ...params, page: 1, pageSize: PAGE_SIZE });
  const items = [...first.items];
  for (let page = 2; items.length < first.total && page <= MAX_PAGES; page++) {
    const next = await shopflow.getProducts({ ...params, page, pageSize: PAGE_SIZE });
    if (next.items.length === 0) break;
    items.push(...next.items);
  }
  return { ...first, items, page: 1, pageSize: items.length };
}
