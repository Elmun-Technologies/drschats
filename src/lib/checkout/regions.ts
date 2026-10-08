/** Region keys under `checkout.regions` — the order form and the partner form share one list. */
export const REGION_KEYS = [
  "tashkentCity",
  "tashkent",
  "samarkand",
  "fergana",
  "andijan",
  "namangan",
  "bukhara",
  "khorezm",
  "kashkadarya",
  "surkhandarya",
  "syrdarya",
  "jizzakh",
  "navoi",
  "karakalpakstan",
] as const;

export type RegionKey = (typeof REGION_KEYS)[number];
