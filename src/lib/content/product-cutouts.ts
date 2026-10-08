/**
 * Background-removed pack shots for the V3 product card and gallery, keyed by
 * product slug. Source: design/data/products.json (`imageCutout`). They sit on
 * the `tile` ground with object-fit: contain, so a product without one keeps
 * its photo from PRODUCT_PHOTOS.
 */
export const PRODUCT_CUTOUTS: Record<string, string> = {
  "aminomorin-forte-30": "/images/products/c-aminomorin-forte-30-4.png",
  "delical-abrikos-200ml": "/images/products/c-delical-abrikos-200ml-3.png",
  "delical-shokolad-200ml": "/images/products/c-delical-shokolad-200ml-3.png",
  "delical-vanil-200ml": "/images/products/c-delical-vanil-200ml-white.png",
  "dr-frei-antistress-magniy-20": "/images/products/c-dr-frei-antistress-magniy-20-3.png",
  "dr-frei-gold-vitamins-20": "/images/products/c-dr-frei-gold-vitamins-20-2.png",
  "dr-frei-kids-multivitamins-20": "/images/products/c-dr-frei-kids-multivitamins-20-3.png",
  "dr-frei-multivitamins-biotin-20": "/images/products/c-dr-frei-multivitamins-biotin-20-4.png",
  "dr-frei-tonometr-a20": "/images/products/c-dr-frei-tonometr-a20-4.png",
  "dr-frei-turbo-base-ingalyator": "/images/products/c-dr-frei-turbo-base-ingalyator-white.png",
  "peano-balzam-30g": "/images/products/c-peano-balzam-30g-3.png",
  "swiss-energy-calcivit-30": "/images/products/c-swiss-energy-calcivit-30-hero.png",
  "swiss-energy-hair-nail-skin-30": "/images/products/c-swiss-energy-hair-nail-skin-30.png",
  "swiss-energy-immunovit-30": "/images/products/c-swiss-energy-immunovit-30-hero.png",
  "swiss-energy-nature-collagen": "/images/products/c-swiss-energy-nature-collagen.png",
  "swiss-energy-neuroforce-30": "/images/products/c-swiss-energy-neuroforce-30-front.png",
  "swiss-energy-prenatal-forte-60": "/images/products/c-swiss-energy-prenatal-forte-60.png",
  "swiss-energy-visiovit-30": "/images/products/c-swiss-energy-visiovit-30-2.png",
  "swiss-energy-vitamin-c-20": "/images/products/c-swiss-energy-vitamin-c-20-2.png",
};

export function productCutout(slug: string): string | undefined {
  return PRODUCT_CUTOUTS[slug];
}
