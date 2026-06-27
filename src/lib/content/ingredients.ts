import type { Locale } from "@/lib/i18n/routing";

/**
 * Active-ingredient transparency index (E-E-A-T topical authority). Each entry
 * explains what the nutrient does; the page also surfaces synergy/antagonism
 * pairs (the "compatibility" guidance from the spec). Educational only — every
 * card sits under the medical disclaimer.
 */

type L<T = string> = Record<Locale, T>;

interface RawIngredient {
  slug: string;
  name: L;
  role: L;
  description: L;
  /** product slugs that contain this ingredient */
  inProducts: string[];
}

export interface Ingredient {
  slug: string;
  name: string;
  role: string;
  description: string;
  inProducts: string[];
}

const raw: RawIngredient[] = [
  {
    slug: "epa-dha",
    name: { uz: "Omega-3 (EPA/DHA)", ru: "Омега-3 (EPA/DHA)", en: "Omega-3 (EPA/DHA)" },
    role: { uz: "Yurak · miya", ru: "Сердце · мозг", en: "Heart · brain" },
    description: {
      uz: "To‘yinmagan yog‘ kislotalari; yurak, miya va ko‘rish uchun zarur. Organizm o‘zi ishlab chiqarmaydi.",
      ru: "Ненасыщенные жирные кислоты для сердца, мозга и зрения. Организм их не вырабатывает.",
      en: "Unsaturated fatty acids for heart, brain and vision; the body cannot make them.",
    },
    inProducts: ["omega-3-premium"],
  },
  {
    slug: "vitamin-d3",
    name: { uz: "Vitamin D3", ru: "Витамин D3", en: "Vitamin D3" },
    role: { uz: "Suyak · immunitet", ru: "Кости · иммунитет", en: "Bones · immunity" },
    description: {
      uz: "Quyosh vitamini; kalsiy so‘rilishi, suyak va immunitet uchun muhim.",
      ru: "Солнечный витамин; важен для усвоения кальция, костей и иммунитета.",
      en: "The sunshine vitamin; key for calcium absorption, bones and immunity.",
    },
    inProducts: ["vitamin-d3-k2"],
  },
  {
    slug: "vitamin-k2",
    name: { uz: "Vitamin K2 (MK-7)", ru: "Витамин K2 (MK-7)", en: "Vitamin K2 (MK-7)" },
    role: { uz: "Suyak", ru: "Кости", en: "Bones" },
    description: {
      uz: "Kalsiyni qon tomirlaridan suyaklarga yo‘naltiradi — D3 bilan ideal juftlik.",
      ru: "Направляет кальций из сосудов в кости — идеальная пара к D3.",
      en: "Routes calcium from arteries into bones — the ideal partner to D3.",
    },
    inProducts: ["vitamin-d3-k2"],
  },
  {
    slug: "magnesium",
    name: { uz: "Magniy", ru: "Магний", en: "Magnesium" },
    role: { uz: "Asab · mushak", ru: "Нервы · мышцы", en: "Nerves · muscles" },
    description: {
      uz: "Yuzlab fermentativ reaksiyada ishtirok etadi; asab va mushak ishini qo‘llab-quvvatlaydi.",
      ru: "Участвует в сотнях реакций; поддерживает работу нервов и мышц.",
      en: "Takes part in hundreds of reactions; supports nerve and muscle function.",
    },
    inProducts: ["magnesium-b6"],
  },
  {
    slug: "vitamin-c",
    name: { uz: "Vitamin C", ru: "Витамин C", en: "Vitamin C" },
    role: { uz: "Immunitet · antioksidant", ru: "Иммунитет · антиоксидант", en: "Immunity · antioxidant" },
    description: {
      uz: "Antioksidant; immunitetni qo‘llab-quvvatlaydi va temir so‘rilishini oshiradi.",
      ru: "Антиоксидант; поддерживает иммунитет и усиливает усвоение железа.",
      en: "An antioxidant that supports immunity and boosts iron absorption.",
    },
    inProducts: ["immuno-complex"],
  },
  {
    slug: "zinc",
    name: { uz: "Sink", ru: "Цинк", en: "Zinc" },
    role: { uz: "Immunitet", ru: "Иммунитет", en: "Immunity" },
    description: {
      uz: "Immun hujayralari va teri salomatligi uchun muhim mineral.",
      ru: "Минерал, важный для иммунных клеток и здоровья кожи.",
      en: "A mineral important for immune cells and skin health.",
    },
    inProducts: ["immuno-complex"],
  },
  {
    slug: "collagen",
    name: { uz: "Kollagen peptidlari", ru: "Пептиды коллагена", en: "Collagen peptides" },
    role: { uz: "Teri · soch", ru: "Кожа · волосы", en: "Skin · hair" },
    description: {
      uz: "Teri elastikligi, soch va tirnoq mustahkamligi uchun oqsil peptidlari.",
      ru: "Белковые пептиды для упругости кожи, крепости волос и ногтей.",
      en: "Protein peptides for skin elasticity and strong hair and nails.",
    },
    inProducts: ["collagen-beauty"],
  },
  {
    slug: "biotin",
    name: { uz: "Biotin (B7)", ru: "Биотин (B7)", en: "Biotin (B7)" },
    role: { uz: "Soch · tirnoq", ru: "Волосы · ногти", en: "Hair · nails" },
    description: {
      uz: "Soch, teri va tirnoq salomatligini qo‘llab-quvvatlovchi B guruh vitamini.",
      ru: "Витамин группы B для здоровья волос, кожи и ногтей.",
      en: "A B-vitamin that supports hair, skin and nail health.",
    },
    inProducts: ["collagen-beauty"],
  },
];

interface SynergyPair {
  type: "boost" | "block";
  a: L;
  b: L;
  note: L;
}

const synergy: SynergyPair[] = [
  {
    type: "boost",
    a: { uz: "Temir", ru: "Железо", en: "Iron" },
    b: { uz: "Vitamin C", ru: "Витамин C", en: "Vitamin C" },
    note: { uz: "Vitamin C temir so‘rilishini oshiradi.", ru: "Витамин C усиливает усвоение железа.", en: "Vitamin C boosts iron absorption." },
  },
  {
    type: "boost",
    a: { uz: "Vitamin D3", ru: "Витамин D3", en: "Vitamin D3" },
    b: { uz: "Vitamin K2", ru: "Витамин K2", en: "Vitamin K2" },
    note: { uz: "K2 kalsiyni suyaklarga to‘g‘ri yo‘naltiradi.", ru: "K2 правильно направляет кальций в кости.", en: "K2 directs calcium correctly into bones." },
  },
  {
    type: "block",
    a: { uz: "Kalsiy", ru: "Кальций", en: "Calcium" },
    b: { uz: "Sink", ru: "Цинк", en: "Zinc" },
    note: { uz: "Birga yuqori dozada so‘rilishga to‘sqinlik qiladi — ajratib qabul qiling.", ru: "В высоких дозах вместе мешают усвоению — принимайте раздельно.", en: "In high doses together they hinder absorption — take separately." },
  },
  {
    type: "block",
    a: { uz: "Kalsiy", ru: "Кальций", en: "Calcium" },
    b: { uz: "Temir", ru: "Железо", en: "Iron" },
    note: { uz: "Kalsiy temir so‘rilishini kamaytiradi.", ru: "Кальций снижает усвоение железа.", en: "Calcium reduces iron absorption." },
  },
];

export function getIngredients(locale: Locale): Ingredient[] {
  return raw
    .map((r) => ({
      slug: r.slug,
      name: r.name[locale],
      role: r.role[locale],
      description: r.description[locale],
      inProducts: r.inProducts,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export function getSynergy(locale: Locale) {
  return synergy.map((s) => ({
    type: s.type,
    a: s.a[locale],
    b: s.b[locale],
    note: s.note[locale],
  }));
}
