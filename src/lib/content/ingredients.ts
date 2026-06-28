import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

interface RawIngredient {
  slug: string;
  name: L;
  role: L;
  description: L;
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
    name: { uz: "Omega-3 (EPA/DHA)", ru: "Омега-3 (EPA/DHA)" },
    role: { uz: "Yurak · miya", ru: "Сердце · мозг" },
    description: {
      uz: "To'yinmagan yog' kislotalari; yurak, miya va ko'rish uchun zarur. Organizm o'zi ishlab chiqarmaydi.",
      ru: "Ненасыщенные жирные кислоты для сердца, мозга и зрения. Организм их не вырабатывает.",
    },
    inProducts: ["omega-3-premium"],
  },
  {
    slug: "vitamin-d3",
    name: { uz: "Vitamin D3", ru: "Витамин D3" },
    role: { uz: "Suyak · immunitet", ru: "Кости · иммунитет" },
    description: {
      uz: "Quyosh vitamini; kalsiy so'rilishi, suyak va immunitet uchun muhim.",
      ru: "Солнечный витамин; важен для усвоения кальция, костей и иммунитета.",
    },
    inProducts: ["vitamin-d3-k2"],
  },
  {
    slug: "vitamin-k2",
    name: { uz: "Vitamin K2 (MK-7)", ru: "Витамин K2 (MK-7)" },
    role: { uz: "Suyak", ru: "Кости" },
    description: {
      uz: "Kalsiyni qon tomirlaridan suyaklarga yo'naltiradi — D3 bilan ideal juftlik.",
      ru: "Направляет кальций из сосудов в кости — идеальная пара к D3.",
    },
    inProducts: ["vitamin-d3-k2"],
  },
  {
    slug: "magnesium",
    name: { uz: "Magniy", ru: "Магний" },
    role: { uz: "Asab · mushak", ru: "Нервы · мышцы" },
    description: {
      uz: "Yuzlab fermentativ reaksiyada ishtirok etadi; asab va mushak ishini qo'llab-quvvatlaydi.",
      ru: "Участвует в сотнях реакций; поддерживает работу нервов и мышц.",
    },
    inProducts: ["magnesium-b6"],
  },
  {
    slug: "vitamin-c",
    name: { uz: "Vitamin C", ru: "Витамин C" },
    role: { uz: "Immunitet · antioksidant", ru: "Иммунитет · антиоксидант" },
    description: {
      uz: "Antioksidant; immunitetni qo'llab-quvvatlaydi va temir so'rilishini oshiradi.",
      ru: "Антиоксидант; поддерживает иммунитет и усиливает усвоение железа.",
    },
    inProducts: ["immuno-complex"],
  },
  {
    slug: "zinc",
    name: { uz: "Sink", ru: "Цинк" },
    role: { uz: "Immunitet", ru: "Иммунитет" },
    description: {
      uz: "Immun hujayralari va teri salomatligi uchun muhim mineral.",
      ru: "Минерал, важный для иммунных клеток и здоровья кожи.",
    },
    inProducts: ["immuno-complex"],
  },
  {
    slug: "collagen",
    name: { uz: "Kollagen peptidlari", ru: "Пептиды коллагена" },
    role: { uz: "Teri · soch", ru: "Кожа · волосы" },
    description: {
      uz: "Teri elastikligi, soch va tirnoq mustahkamligi uchun oqsil peptidlari.",
      ru: "Белковые пептиды для упругости кожи, крепости волос и ногтей.",
    },
    inProducts: ["collagen-beauty"],
  },
  {
    slug: "biotin",
    name: { uz: "Biotin (B7)", ru: "Биотин (B7)" },
    role: { uz: "Soch · tirnoq", ru: "Волосы · ногти" },
    description: {
      uz: "Soch, teri va tirnoq salomatligini qo'llab-quvvatlovchi B guruh vitamini.",
      ru: "Витамин группы B для здоровья волос, кожи и ногтей.",
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
    a: { uz: "Temir", ru: "Железо" },
    b: { uz: "Vitamin C", ru: "Витамин C" },
    note: { uz: "Vitamin C temir so'rilishini oshiradi.", ru: "Витамин C усиливает усвоение железа." },
  },
  {
    type: "boost",
    a: { uz: "Vitamin D3", ru: "Витамин D3" },
    b: { uz: "Vitamin K2", ru: "Витамин K2" },
    note: { uz: "K2 kalsiyni suyaklarga to'g'ri yo'naltiradi.", ru: "K2 правильно направляет кальций в кости." },
  },
  {
    type: "block",
    a: { uz: "Kalsiy", ru: "Кальций" },
    b: { uz: "Sink", ru: "Цинк" },
    note: { uz: "Birga yuqori dozada so'rilishga to'sqinlik qiladi — ajratib qabul qiling.", ru: "В высоких дозах вместе мешают усвоению — принимайте раздельно." },
  },
  {
    type: "block",
    a: { uz: "Kalsiy", ru: "Кальций" },
    b: { uz: "Temir", ru: "Железо" },
    note: { uz: "Kalsiy temir so'rilishini kamaytiradi.", ru: "Кальций снижает усвоение железа." },
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
