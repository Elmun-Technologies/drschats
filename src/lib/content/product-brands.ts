/**
 * Brand of a product, read from its slug prefix. The catalogue has no brand
 * field; every slug starts with the brand (design/data/products.json agrees),
 * so the prefix is the one source that cannot disagree with the product.
 */
const BRANDS: { prefix: string; slug: string; name: string }[] = [
  { prefix: "swiss-energy-", slug: "swiss-energy", name: "Swiss Energy" },
  { prefix: "dr-frei-", slug: "dr-frei", name: "Dr. Frei" },
  { prefix: "delical-", slug: "delical", name: "Delical" },
  { prefix: "aminomorin-", slug: "aminomorin", name: "Aminomorin" },
  { prefix: "peano-", slug: "peano", name: "Peano" },
  { prefix: "hamdard-", slug: "hamdard", name: "Hamdard" },
  { prefix: "hiew-", slug: "hiew", name: "HIEW" },
];

export interface ProductBrand {
  slug: string;
  name: string;
}

export function productBrand(productSlug: string): ProductBrand | null {
  const hit = BRANDS.find((b) => productSlug.startsWith(b.prefix));
  return hit ? { slug: hit.slug, name: hit.name } : null;
}

/** Every brand the catalogue knows, in display order. */
export const ALL_BRANDS: ProductBrand[] = BRANDS.map(({ slug, name }) => ({ slug, name }));

export function brandBySlug(slug: string): ProductBrand | null {
  return ALL_BRANDS.find((b) => b.slug === slug) ?? null;
}
