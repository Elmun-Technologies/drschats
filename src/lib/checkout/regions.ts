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

export function isRegionKey(value: unknown): value is RegionKey {
  return typeof value === "string" && (REGION_KEYS as readonly string[]).includes(value);
}

/*
  The names, for places with no translation context: the operator's Telegram
  message, the admin, the bot. Kept equal to `checkout.regions` in both
  message files by regions.test.ts.
*/
export const REGION_NAMES: Record<RegionKey, { uz: string; ru: string }> = {
  tashkentCity: { uz: "Toshkent shahri", ru: "город Ташкент" },
  tashkent: { uz: "Toshkent viloyati", ru: "Ташкентская область" },
  samarkand: { uz: "Samarqand viloyati", ru: "Самаркандская область" },
  fergana: { uz: "Fargʻona viloyati", ru: "Ферганская область" },
  andijan: { uz: "Andijon viloyati", ru: "Андижанская область" },
  namangan: { uz: "Namangan viloyati", ru: "Наманганская область" },
  bukhara: { uz: "Buxoro viloyati", ru: "Бухарская область" },
  khorezm: { uz: "Xorazm viloyati", ru: "Хорезмская область" },
  kashkadarya: { uz: "Qashqadaryo viloyati", ru: "Кашкадарьинская область" },
  surkhandarya: { uz: "Surxondaryo viloyati", ru: "Сурхандарьинская область" },
  syrdarya: { uz: "Sirdaryo viloyati", ru: "Сырдарьинская область" },
  jizzakh: { uz: "Jizzax viloyati", ru: "Джизакская область" },
  navoi: { uz: "Navoiy viloyati", ru: "Навоийская область" },
  karakalpakstan: { uz: "Qoraqalpogʻiston Respublikasi", ru: "Республика Каракалпакстан" },
};

/**
 * An order's region as text. New orders store the key; orders placed before
 * 2026-11 (and bot orders) stored the name itself, which is returned as is.
 */
export function regionName(region: string | null | undefined, locale: "uz" | "ru" = "uz"): string {
  if (!region) return "";
  return isRegionKey(region) ? REGION_NAMES[region][locale] : region;
}

/** The twelve districts of Tashkent city — the courier's first question. */
export const TASHKENT_DISTRICTS: { key: string; uz: string; ru: string }[] = [
  { key: "bektemir", uz: "Bektemir", ru: "Бектемир" },
  { key: "chilonzor", uz: "Chilonzor", ru: "Чиланзар" },
  { key: "mirobod", uz: "Mirobod", ru: "Мирабад" },
  { key: "mirzo-ulugbek", uz: "Mirzo Ulugʻbek", ru: "Мирзо-Улугбек" },
  { key: "olmazor", uz: "Olmazor", ru: "Алмазар" },
  { key: "sergeli", uz: "Sergeli", ru: "Сергели" },
  { key: "shayxontohur", uz: "Shayxontohur", ru: "Шайхантахур" },
  { key: "uchtepa", uz: "Uchtepa", ru: "Учтепа" },
  { key: "yakkasaroy", uz: "Yakkasaroy", ru: "Яккасарай" },
  { key: "yangihayot", uz: "Yangihayot", ru: "Янгихаёт" },
  { key: "yashnobod", uz: "Yashnobod", ru: "Яшнабад" },
  { key: "yunusobod", uz: "Yunusobod", ru: "Юнусабад" },
];

/** A Tashkent district key → its name; anything else (a town typed for a region) as is. */
export function districtName(district: string | null | undefined, locale: "uz" | "ru" = "uz"): string {
  if (!district) return "";
  return TASHKENT_DISTRICTS.find((d) => d.key === district)?.[locale] ?? district;
}
