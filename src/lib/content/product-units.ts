/**
 * Pack size in countable doses, for the per-unit price on the product card
 * ("3 950 soʻm / tabletka"). Source: design/data/products.json. A product
 * without an entry (liquids, devices, creams) shows no unit price — the line
 * keeps its height so the cards in a row stay aligned.
 */
export type DoseUnit = "tablet" | "capsule";

export const PRODUCT_UNITS: Record<string, { count: number; unit: DoseUnit }> = {
  "aminomorin-forte-30": { count: 30, unit: "capsule" },
  "dr-frei-antistress-magniy-20": { count: 20, unit: "tablet" },
  "dr-frei-gold-vitamins-20": { count: 20, unit: "tablet" },
  "dr-frei-kids-multivitamins-20": { count: 20, unit: "tablet" },
  "dr-frei-multivitamins-biotin-20": { count: 20, unit: "tablet" },
  "swiss-energy-calcivit-30": { count: 30, unit: "capsule" },
  "swiss-energy-hair-nail-skin-30": { count: 30, unit: "capsule" },
  "swiss-energy-immunovit-30": { count: 30, unit: "capsule" },
  "swiss-energy-neuroforce-30": { count: 30, unit: "capsule" },
  "swiss-energy-prenatal-forte-60": { count: 60, unit: "capsule" },
  "swiss-energy-visiovit-30": { count: 30, unit: "capsule" },
  "swiss-energy-vitamin-c-20": { count: 20, unit: "tablet" },
};

/*
  Products whose label says one tablet or capsule a day, quoted in their
  «Qabul qilish» text (mock.ts howToUse). For these the per-unit price is the
  price of a day, and the product page says so: «kuniga 9 200 soʻm». Products
  whose label says "as on the bottle" or that leave the dose to a doctor
  (Calcivit, NeuroForce, Potenton, Prenatal Forte) are not here: a daily price
  built on a guessed dose would be an invented number.
*/
export const ONE_A_DAY = new Set<string>([
  "dr-frei-antistress-magniy-20",
  "dr-frei-gold-vitamins-20",
  "dr-frei-kids-multivitamins-20",
  "dr-frei-multivitamins-biotin-20",
  "swiss-energy-hair-nail-skin-30",
  "swiss-energy-immunovit-30",
  "swiss-energy-visiovit-30",
  "swiss-energy-vitamin-c-20",
]);

export function unitPrice(slug: string, price: number): { amount: number; unit: DoseUnit } | null {
  const pack = PRODUCT_UNITS[slug];
  return pack ? { amount: price / pack.count, unit: pack.unit } : null;
}
