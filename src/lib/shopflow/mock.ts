import type { Locale } from "@/lib/i18n/routing";
import { locales } from "@/lib/i18n/routing";
import { BRAND } from "@/lib/brand";
import { discountPercent } from "@/lib/shop/discounts";
import { SHOW_SAMPLE_SOCIAL_PROOF } from "@/lib/content/sample-social-proof";
import type {
  Category,
  Product,
  Promotion,
  ShopflowClient,
  ProductListParams,
  ProductListResult,
  UpsellOffer,
  OrderRequest,
  OrderResult,
  ProductBenefit,
  FaqItem,
  Review,
  IngredientRow,
} from "./types";

type L<T = string> = Record<Locale, T>;

/* Real product photos (AI-generated) keyed by slug fragment.
   When a product slug contains one of these keys, the real photo is used
   instead of a generic placeholder SVG. */
const REAL_PHOTOS: Record<string, string> = {
  "omega": "/products/omega-3-premium.jpg",
  "d3": "/products/vitamin-d3-k2.jpg",
  "collagen": "/products/collagen-beauty.jpg",
  "immuno": "/products/immuno-complex.jpg",
  "magn": "/products/magnesium-b6.jpg",
  "multivit": "/products/multivitamin-daily.jpg",
  "vitamin-c": "/products/immuno-complex.jpg",
  "hair-nail": "/products/collagen-beauty.jpg",
  "gold-vitamin": "/products/vitamin-d3-k2.jpg",
  "kids": "/products/multivitamin-daily.jpg",
  "antistress": "/products/magnesium-b6.jpg",
  "visiovit": "/products/omega-3-premium.jpg",
  "safi": "/products/immuno-complex.jpg",
  "delical": "/products/multivitamin-daily.jpg",
  "coffee": "/products/omega-3-premium.jpg",
  "peano": "/products/collagen-beauty.jpg",
  "tonometr": "/products/vitamin-d3-k2.jpg",
  "turbo": "/products/magnesium-b6.jpg",
};

const REAL_PHOTOS_FALLBACKS = [
  "/products/omega-3-premium.jpg",
  "/products/vitamin-d3-k2.jpg",
  "/products/collagen-beauty.jpg",
  "/products/immuno-complex.jpg",
  "/products/magnesium-b6.jpg",
  "/products/multivitamin-daily.jpg",
];

const img = (seed: string, alt: string) => {
  // Try to match a real product photo first
  const lc = seed.toLowerCase();
  for (const [key, url] of Object.entries(REAL_PHOTOS)) {
    if (lc.includes(key)) return { url, alt };
  }
  // Fallback to a real product photo instead of an SVG
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return { url: REAL_PHOTOS_FALLBACKS[h % REAL_PHOTOS_FALLBACKS.length], alt };
};

interface RawCategory {
  id: string;
  slug: string;
  name: L;
  description: L;
  image: string;
}

function catSimple(id: string, slug: string, uz: string, ru: string): RawCategory {
  return {
    id,
    slug,
    name: { uz, ru },
    description: { uz, ru },
    image: img(id, uz).url,
  };
}

const rawCategories: RawCategory[] = [
  {
    id: "cat-vitamins",
    slug: "vitamins",
    name: { uz: "Vitaminlar", ru: "Витамины" },
    description: {
      uz: "Kunlik energiya va immunitet uchun asosiy vitaminlar.",
      ru: "Базовые витамины для ежедневной энергии и иммунитета.",
    },
    image: img("cat-vitamins", "Vitamins").url,
  },
  {
    id: "cat-immunity",
    slug: "immunity",
    name: { uz: "Immunitet", ru: "Иммунитет" },
    description: {
      uz: "Himoyani kuchaytiruvchi komplekslar.",
      ru: "Комплексы для укрепления защиты.",
    },
    image: img("cat-immunity", "Immunity").url,
  },
  {
    id: "cat-beauty",
    slug: "beauty",
    name: { uz: "Go'zallik", ru: "Красота" },
    description: {
      uz: "Soch, teri va tirnoq uchun vitaminlar.",
      ru: "Витамины для волос, кожи и ногтей.",
    },
    image: img("cat-beauty", "Beauty").url,
  },
  {
    id: "cat-kids",
    slug: "kids",
    name: { uz: "Bolalar uchun", ru: "Детям" },
    description: {
      uz: "Bolalar uchun vitaminlar va qo'shimchalar.",
      ru: "Витамины и добавки для детей.",
    },
    image: img("cat-kids", "Kids").url,
  },
  {
    id: "cat-effervescent",
    slug: "effervescent",
    name: { uz: "Shipuchi tabletkalar", ru: "Шипучие таблетки" },
    description: {
      uz: "Suvda eriydigan vitaminlar — tez ta'sir qiladi.",
      ru: "Растворимые витамины — быстрое действие.",
    },
    image: img("cat-effervescent", "Effervescent").url,
  },
  {
    id: "cat-devices",
    slug: "devices",
    name: { uz: "Tibbiy jihozlar", ru: "Медицинские устройства" },
    description: {
      uz: "Tonometrlar, ingalyatorlar va boshqa tibbiy jihozlar.",
      ru: "Тонометры, ингаляторы и другие медицинские устройства.",
    },
    image: img("cat-devices", "Devices").url,
  },
  {
    id: "cat-coffee",
    slug: "coffee",
    name: { uz: "Qahva", ru: "Кофе" },
    description: {
      uz: "Tabiy arabika qahva — Swiss Energy brendidan.",
      ru: "Натуральный кофе арабика — от бренда Swiss Energy.",
    },
    image: img("cat-coffee", "Coffee").url,
  },
  {
    id: "cat-nutrition",
    slug: "nutrition",
    name: { uz: "Tibbiy ovqatlanish", ru: "Лечебное питание" },
    description: {
      uz: "Davolovchi va yuqori kaloriyali ichimliklar.",
      ru: "Лечебные и высококалорийные напитки.",
    },
    image: img("cat-nutrition", "Nutrition").url,
  },
  {
    id: "cat-minerals",
    slug: "minerals",
    name: { uz: "Minerallar", ru: "Минералы" },
    description: {
      uz: "Magniy, sink va boshqa hayotiy minerallar.",
      ru: "Магний, цинк и другие жизненно важные минералы.",
    },
    image: img("cat-minerals", "Minerals").url,
  },
  {
    id: "cat-skin",
    slug: "skin",
    name: { uz: "Teri parvarishi", ru: "Уход за кожей" },
    description: {
      uz: "Teri tiklanishi va parvarishi uchun mahsulotlar.",
      ru: "Средства для восстановления и ухода за кожей.",
    },
    image: img("cat-skin", "Skin").url,
  },
  catSimple("cat-herbal", "herbal", "O'simlik vositalari", "Растительные средства"),
  catSimple("cat-collagen", "collagen", "Kollagen", "Коллаген"),
  catSimple("cat-omega", "omega", "Omega va baliq yog'i", "Омега и рыбий жир"),
  catSimple("cat-sport", "sport", "Sport va fitnes", "Спорт и фитнес"),
  catSimple("cat-joints", "joints", "Bo'g'imlar", "Суставы"),
];

interface RawProduct {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  imageSeeds: string[];
  bespoke: boolean;
  origin: L;
  servings: L;
  badges: L<string[]>;
  name: L;
  /**
   * Extra words the product should be found by but never shown on the card:
   * the Cyrillic spellings shoppers actually type ("кофе эдель", "турбобейс")
   * after the printed name was cleaned to the label form.
   */
  searchAliases?: L<string[]>;
  tagline: L;
  description: L;
  highlights: L<string[]>;
  benefits: L<ProductBenefit[]>;
  ingredients: L<IngredientRow[]>;
  howToUse: L;
  faq: L<FaqItem[]>;
  reviews: L<Review[]>;
}

const rawProducts: RawProduct[] = [
  // ─── Delical ──────────────────────────────────────────────────────────────
  {
    id: "p-delical-vanil",
    slug: "delical-vanil-200ml",
    categoryId: "cat-nutrition",
    categorySlug: "nutrition",
    price: 118000,
    oldPrice: 350000,
    rating: 4.8,
    reviewCount: 42,
    inStock: true,
    imageSeeds: ["delical-vanil-a", "delical-vanil-b"],
    bespoke: true,
    origin: { uz: "Fransiya", ru: "Франция" },
    servings: { uz: "200 ml × 1 shisha", ru: "200 мл × 1 бутылка" },
    badges: { uz: ["Aksiya", "Laktozasiz"], ru: ["Акция", "Без лактозы"] },
    name: { uz: "Delical Vanil 200ml", ru: "Delical Ваниль 200мл" },
    tagline: {
      uz: "Davolovchi ovqatlanish — 452 kcal, 200 ml",
      ru: "Лечебное питание — 452 ккал, 200 мл",
    },
    description: {
      uz: "Delical — yuqori kaloriyali pitательный kokteyл. Kasal va tuzalayotgan bemorlar uchun mo'ljallangan. 452 kcal, 200 ml, laktozasiz formula. Vanil ta'mi.",
      ru: "Delical — высококалорийный питательный коктейль. Предназначен для больных и выздоравливающих пациентов. 452 ккал, 200 мл, без лактозы. Вкус ванили.",
    },
    highlights: {
      uz: ["452 kcal", "200 ml", "Laktozasiz", "Davolovchi formula"],
      ru: ["452 ккал", "200 мл", "Без лактозы", "Лечебная формула"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Yuqori energiya", description: "452 kcal kichik hajmda to'liq kaloriya ta'minlaydi." },
        { icon: "shield", title: "Tuzalishga yordam", description: "Kasallik va operatsiyadan keyin ovqatlanishni qo'llab-quvvatlaydi." },
      ],
      ru: [
        { icon: "bolt", title: "Высокая энергия", description: "452 ккал в небольшом объёме обеспечивает полный калораж." },
        { icon: "shield", title: "Помощь в восстановлении", description: "Поддерживает питание после болезни и операции." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Energiya", amount: "452 kcal" },
        { name: "Oqsil", amount: "18 g" },
        { name: "Yog'", amount: "22.8 g" },
        { name: "Uglevodlar", amount: "44.8 g" },
      ],
      ru: [
        { name: "Энергия", amount: "452 ккал" },
        { name: "Белок", amount: "18 г" },
        { name: "Жир", amount: "22.8 г" },
        { name: "Углеводы", amount: "44.8 г" },
      ],
    },
    howToUse: {
      uz: "Sovutilgan holda iching. Kuniga 1–3 shisha shifokor tavsiyasiga ko'ra.",
      ru: "Употреблять в охлаждённом виде. 1–3 бутылки в день по рекомендации врача.",
    },
    faq: {
      uz: [
        { question: "Kim uchun mo'ljallangan?", answer: "Kasallik, operatsiya yoki ishtahasizlik tufayli zaruriy kaloriya olib olmayotgan bemorlar uchun." },
        { question: "Bolalar icha oladimi?", answer: "3 yoshdan katta bolalar uchun, ammo shifokor tavsiyasi bilan." },
      ],
      ru: [
        { question: "Для кого предназначен?", answer: "Для пациентов, которые не могут получить необходимые калории из-за болезни, операции или потери аппетита." },
        { question: "Можно ли детям?", answer: "Для детей старше 3 лет, но по рекомендации врача." },
      ],
    },
    reviews: {
      uz: [
        { author: "Mohira A.", rating: 5, date: "2026-05-10", text: "Onama operatsiyadan keyin ishlatdik, juda foydali bo'ldi." },
      ],
      ru: [
        { author: "Мохира А.", rating: 5, date: "2026-05-10", text: "Давала маме после операции — очень помогло." },
      ],
    },
  },
  {
    id: "p-delical-shokolad",
    slug: "delical-shokolad-200ml",
    categoryId: "cat-nutrition",
    categorySlug: "nutrition",
    price: 118000,
    oldPrice: 350000,
    rating: 4.8,
    reviewCount: 38,
    inStock: true,
    imageSeeds: ["delical-choc-a", "delical-choc-b"],
    bespoke: true,
    origin: { uz: "Fransiya", ru: "Франция" },
    servings: { uz: "200 ml × 1 shisha", ru: "200 мл × 1 бутылка" },
    badges: { uz: ["Aksiya", "Laktozasiz"], ru: ["Акция", "Без лактозы"] },
    name: { uz: "Delical Shokolad 200ml", ru: "Delical Шоколад 200мл" },
    tagline: {
      uz: "Davolovchi ovqatlanish — 452 kcal, shokolad ta'mi",
      ru: "Лечебное питание — 452 ккал, вкус шоколада",
    },
    description: {
      uz: "Delical — yuqori kaloriyali pitательный kokteyл. 452 kcal, 200 ml, laktozasiz formula. Shokolad ta'mi.",
      ru: "Delical — высококалорийный питательный коктейль. 452 ккал, 200 мл, без лактозы. Вкус шоколада.",
    },
    highlights: {
      uz: ["452 kcal", "200 ml", "Laktozasiz", "Shokolad ta'mi"],
      ru: ["452 ккал", "200 мл", "Без лактозы", "Вкус шоколада"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Yuqori energiya", description: "452 kcal kichik hajmda to'liq kaloriya ta'minlaydi." },
        { icon: "shield", title: "Tuzalishga yordam", description: "Kasallik va operatsiyadan keyin ovqatlanishni qo'llab-quvvatlaydi." },
      ],
      ru: [
        { icon: "bolt", title: "Высокая энергия", description: "452 ккал в небольшом объёме обеспечивает полный калораж." },
        { icon: "shield", title: "Помощь в восстановлении", description: "Поддерживает питание после болезни и операции." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Energiya", amount: "452 kcal" },
        { name: "Oqsil", amount: "18 g" },
        { name: "Yog'", amount: "22.8 g" },
        { name: "Uglevodlar", amount: "44.8 g" },
      ],
      ru: [
        { name: "Энергия", amount: "452 ккал" },
        { name: "Белок", amount: "18 г" },
        { name: "Жир", amount: "22.8 г" },
        { name: "Углеводы", amount: "44.8 г" },
      ],
    },
    howToUse: {
      uz: "Sovutilgan holda iching. Kuniga 1–3 shisha shifokor tavsiyasiga ko'ra.",
      ru: "Употреблять в охлаждённом виде. 1–3 бутылки в день по рекомендации врача.",
    },
    faq: {
      uz: [{ question: "Vanil bilan farqi?", answer: "Faqat ta'm farq qiladi, tarkib bir xil." }],
      ru: [{ question: "Чем отличается от ванили?", answer: "Только вкус разный, состав одинаков." }],
    },
    reviews: {
      uz: [{ author: "Sarvinoz K.", rating: 5, date: "2026-04-20", text: "Shokolad ta'mi juda yoqimli, qabul qilish oson." }],
      ru: [{ author: "Сарвиноз К.", rating: 5, date: "2026-04-20", text: "Вкус шоколада очень приятный, легко принимать." }],
    },
  },
  {
    id: "p-delical-abrikos",
    slug: "delical-abrikos-200ml",
    categoryId: "cat-nutrition",
    categorySlug: "nutrition",
    price: 118000,
    oldPrice: 350000,
    rating: 4.7,
    reviewCount: 29,
    inStock: true,
    imageSeeds: ["delical-abr-a", "delical-abr-b"],
    bespoke: true,
    origin: { uz: "Fransiya", ru: "Франция" },
    servings: { uz: "200 ml × 1 shisha", ru: "200 мл × 1 бутылка" },
    badges: { uz: ["Aksiya", "Laktozasiz"], ru: ["Акция", "Без лактозы"] },
    name: { uz: "Delical Abrikos 200ml", ru: "Delical Абрикос 200мл" },
    tagline: {
      uz: "Davolovchi ovqatlanish — 452 kcal, abrikos ta'mi",
      ru: "Лечебное питание — 452 ккал, вкус абрикоса",
    },
    description: {
      uz: "Delical — yuqori kaloriyali pitательный kokteyл. 452 kcal, 200 ml, laktozasiz formula. Abrikos ta'mi.",
      ru: "Delical — высококалорийный питательный коктейль. 452 ккал, 200 мл, без лактозы. Вкус абрикоса.",
    },
    highlights: {
      uz: ["452 kcal", "200 ml", "Laktozasiz", "Abrikos ta'mi"],
      ru: ["452 ккал", "200 мл", "Без лактозы", "Вкус абрикоса"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Yuqori energiya", description: "452 kcal kichik hajmda to'liq kaloriya ta'minlaydi." },
        { icon: "shield", title: "Tuzalishga yordam", description: "Kasallik va operatsiyadan keyin ovqatlanishni qo'llab-quvvatlaydi." },
      ],
      ru: [
        { icon: "bolt", title: "Высокая энергия", description: "452 ккал в небольшом объёме обеспечивает полный калораж." },
        { icon: "shield", title: "Помощь в восстановлении", description: "Поддерживает питание после болезни и операции." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Energiya", amount: "452 kcal" },
        { name: "Oqsil", amount: "18 g" },
        { name: "Yog'", amount: "22.8 g" },
        { name: "Uglevodlar", amount: "44.8 g" },
      ],
      ru: [
        { name: "Энергия", amount: "452 ккал" },
        { name: "Белок", amount: "18 г" },
        { name: "Жир", amount: "22.8 г" },
        { name: "Углеводы", amount: "44.8 г" },
      ],
    },
    howToUse: {
      uz: "Sovutilgan holda iching. Kuniga 1–3 shisha shifokor tavsiyasiga ko'ra.",
      ru: "Употреблять в охлаждённом виде. 1–3 бутылки в день по рекомендации врача.",
    },
    faq: {
      uz: [{ question: "Qaysi ta'm eng mashhur?", answer: "Vanil eng ko'p sotiladi, lekin abrikos va shokolad ham talabgir." }],
      ru: [{ question: "Какой вкус самый популярный?", answer: "Ваниль продаётся больше всего, но абрикос и шоколад тоже востребованы." }],
    },
    reviews: {
      uz: [{ author: "Nodira F.", rating: 5, date: "2026-05-02", text: "Tabiiy abrikos ta'mi — juda yoqdi." }],
      ru: [{ author: "Нодира Ф.", rating: 5, date: "2026-05-02", text: "Натуральный вкус абрикоса — очень понравился." }],
    },
  },

  // ─── Swiss Energy Coffee ───────────────────────────────────────────────────
  {
    id: "p-coffee-edel-250",
    slug: "swiss-energy-coffee-edel-250g",
    categoryId: "cat-coffee",
    categorySlug: "coffee",
    price: 171000,
    rating: 4.5,
    reviewCount: 18,
    inStock: true,
    imageSeeds: ["coffee-edel-250-a", "coffee-edel-250-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "250 g", ru: "250 г" },
    badges: { uz: ["Yangilik!", "Arabika 100%"], ru: ["Новинка!", "Арабика 100%"] },
    name: { uz: "Swiss Energy Coffee Edel 250 g", ru: "Swiss Energy Coffee Edel 250 г" },
    // Cyrillic search habits kept searchable without printing them on the card.
    searchAliases: { uz: ["qahva edel", "edel qahva"], ru: ["кофе эдель", "эдель", "кофе"] },
    tagline: {
      uz: "Tabiiy maydalangan qahva, yangi qovurilgan, 100% arabika",
      ru: "Натуральный молотый кофе, свежеобжаренный, 100% арабика",
    },
    description: {
      uz: "Swiss Energy Coffee Edel — Shveytsariya brendidan 100% arabika qahva. Yangi qovurilgan va maydalangan, boy aromatli. 250 g.",
      ru: "Swiss Energy Coffee Edel — 100% арабика от швейцарского бренда. Свежеобжаренный и молотый, с богатым ароматом. 250 г.",
    },
    highlights: {
      uz: ["100% arabika", "Yangi qovurilgan", "250 g", "Shveytsariya sifati"],
      ru: ["100% арабика", "Свежеобжаренный", "250 г", "Швейцарское качество"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Kofein energiyasi", description: "Ertalabki faollikni oshiradi." },
        { icon: "sparkle", title: "Boy aroma", description: "Arabika ko'pqirrali ta'm beradi." },
      ],
      ru: [
        { icon: "bolt", title: "Энергия кофеина", description: "Повышает утреннюю активность." },
        { icon: "sparkle", title: "Богатый аромат", description: "Арабика даёт многогранный вкус." },
      ],
    },
    ingredients: {
      uz: [{ name: "100% arabika qahva", amount: "250 g" }],
      ru: [{ name: "100% кофе арабика", amount: "250 г" }],
    },
    howToUse: {
      uz: "1 choy qoshiq qahvani 200 ml qaynoq suvda dамлаб iching. Ta'mingizga qarab miqdorni sozlang.",
      ru: "Заварите 1 чайную ложку кофе в 200 мл горячей воды. Регулируйте количество по вкусу.",
    },
    faq: {
      uz: [{ question: "Edel va Crema farqi nima?", answer: "Edel 100% arabika, Crema esa 90% arabika + 10% robusta — ko'proq kuchli ta'mli." }],
      ru: [{ question: "В чём разница Edel и Crema?", answer: "Edel — 100% арабика, Crema — 90% арабика + 10% робуста — более крепкий вкус." }],
    },
    reviews: {
      uz: [{ author: "Ulugbek S.", rating: 5, date: "2026-06-01", text: "Aroma zo'r, ertalab ichish uchun ideal." }],
      ru: [{ author: "Улугбек С.", rating: 5, date: "2026-06-01", text: "Аромат отличный, идеально для утра." }],
    },
  },
  {
    id: "p-coffee-edel-500",
    slug: "swiss-energy-coffee-edel-500g",
    categoryId: "cat-coffee",
    categorySlug: "coffee",
    price: 315000,
    oldPrice: 475000,
    rating: 4.6,
    reviewCount: 10,
    inStock: true,
    imageSeeds: ["coffee-edel-500-a", "coffee-edel-500-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "500 g", ru: "500 г" },
    badges: { uz: ["Aksiya", "Arabika 100%"], ru: ["Акция", "Арабика 100%"] },
    name: { uz: "Swiss Energy Coffee Edel 500 g", ru: "Swiss Energy Coffee Edel 500 г" },
    searchAliases: { uz: ["qahva edel", "edel qahva"], ru: ["кофе эдель", "эдель", "кофе"] },
    tagline: {
      uz: "Tabiiy maydalangan qahva, 100% arabika, 500 g",
      ru: "Натуральный молотый кофе, 100% арабика, 500 г",
    },
    description: {
      uz: "Swiss Energy Coffee Edel — 100% arabika, 500 g. Iqtisodiy o'lcham, bir xil Shveytsariya sifati.",
      ru: "Swiss Energy Coffee Edel — 100% арабика, 500 г. Экономичный размер, то же швейцарское качество.",
    },
    highlights: {
      uz: ["100% arabika", "500 g", "Aksiya narxi", "Shveytsariya sifati"],
      ru: ["100% арабика", "500 г", "Акционная цена", "Швейцарское качество"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Kofein energiyasi", description: "Ertalabki faollikni oshiradi." },
        { icon: "sparkle", title: "Iqtisodiy hajm", description: "500 g — oilaviy yoki ofis uchun qulay." },
      ],
      ru: [
        { icon: "bolt", title: "Энергия кофеина", description: "Повышает утреннюю активность." },
        { icon: "sparkle", title: "Экономичный объём", description: "500 г — удобно для семьи или офиса." },
      ],
    },
    ingredients: {
      uz: [{ name: "100% arabika qahva", amount: "500 g" }],
      ru: [{ name: "100% кофе арабика", amount: "500 г" }],
    },
    howToUse: {
      uz: "1 choy qoshiq qahvani 200 ml qaynoq suvda dамлаб iching.",
      ru: "Заварите 1 чайную ложку кофе в 200 мл горячей воды.",
    },
    faq: {
      uz: [{ question: "250g bilan farqi?", answer: "Faqat hajm farq qiladi — 500g ko'proq tejamkor." }],
      ru: [{ question: "Чем отличается от 250г?", answer: "Только объём — 500г экономичнее." }],
    },
    reviews: {
      uz: [{ author: "Dilshod M.", rating: 4, date: "2026-05-15", text: "Yaxshi ta'm, oilam uchun olgandim." }],
      ru: [{ author: "Дилшод М.", rating: 4, date: "2026-05-15", text: "Хороший вкус, брал для семьи." }],
    },
  },
  {
    id: "p-coffee-crema-500",
    slug: "swiss-energy-coffee-crema-500g",
    categoryId: "cat-coffee",
    categorySlug: "coffee",
    price: 315000,
    oldPrice: 375000,
    rating: 4.9,
    reviewCount: 9,
    inStock: true,
    imageSeeds: ["coffee-crema-500-a", "coffee-crema-500-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "500 g", ru: "500 г" },
    badges: { uz: ["Aksiya", "Arabika 90%"], ru: ["Акция", "Арабика 90%"] },
    name: { uz: "Swiss Energy Coffee Crema 500 g", ru: "Swiss Energy Coffee Crema 500 г" },
    searchAliases: { uz: ["qahva crema", "krema qahva"], ru: ["кофе крема", "крема", "кофе"] },
    tagline: {
      uz: "Donli qahva, 90% arabika + 10% robusta, 500 g",
      ru: "Молотый кофе, 90% арабика + 10% робуста, 500 г",
    },
    description: {
      uz: "Swiss Energy Coffee Crema — Shveytsariya brendidan kuchli va yoqimli qahva. 90% arabika + 10% robusta. 500 g.",
      ru: "Swiss Energy Coffee Crema — крепкий и приятный кофе от швейцарского бренда. 90% арабика + 10% робуста. 500 г.",
    },
    highlights: {
      uz: ["90% arabika", "10% robusta", "500 g", "Aksiya narxi"],
      ru: ["90% арабика", "10% робуста", "500 г", "Акционная цена"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Kuchli ta'm", description: "Robusta qo'shimchasi qahvani kuchliroq qiladi." },
        { icon: "sparkle", title: "Kremal aroma", description: "Nozik qaymoqli aroma." },
      ],
      ru: [
        { icon: "bolt", title: "Крепкий вкус", description: "Добавка робусты делает кофе крепче." },
        { icon: "sparkle", title: "Кремовый аромат", description: "Нежный сливочный аромат." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Arabika", amount: "90%" },
        { name: "Robusta", amount: "10%" },
      ],
      ru: [
        { name: "Арабика", amount: "90%" },
        { name: "Робуста", amount: "10%" },
      ],
    },
    howToUse: {
      uz: "1 choy qoshiq qahvani 200 ml qaynoq suvda dамлаб iching.",
      ru: "Заварите 1 чайную ложку кофе в 200 мл горячей воды.",
    },
    faq: {
      uz: [{ question: "Espresso uchun yaraydimi?", answer: "Ha, kofe mashinasida ham, turka yoki french press-da ham ishlataversa bo'ladi." }],
      ru: [{ question: "Подходит для эспрессо?", answer: "Да, можно использовать в кофемашине, турке или french press." }],
    },
    reviews: {
      uz: [{ author: "Jasur T.", rating: 5, date: "2026-06-10", text: "Kuchli va yoqimli, ertalab energiya beradi." }],
      ru: [{ author: "Жасур Т.", rating: 5, date: "2026-06-10", text: "Крепкий и приятный, заряжает утром." }],
    },
  },
  {
    id: "p-coffee-crema-250",
    slug: "swiss-energy-coffee-crema-250g",
    categoryId: "cat-coffee",
    categorySlug: "coffee",
    price: 171000,
    rating: 4.5,
    reviewCount: 2,
    inStock: true,
    imageSeeds: ["coffee-crema-250-a", "coffee-crema-250-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "250 g", ru: "250 г" },
    badges: { uz: ["Yangilik!"], ru: ["Новинка!"] },
    name: { uz: "Swiss Energy Coffee Crema 250 g", ru: "Swiss Energy Coffee Crema 250 г" },
    searchAliases: { uz: ["qahva crema", "krema qahva"], ru: ["кофе крема", "крема", "кофе"] },
    tagline: {
      uz: "Donli qahva, 90% arabika + 10% robusta, 250 g",
      ru: "Молотый кофе, 90% арабика + 10% робуста, 250 г",
    },
    description: {
      uz: "Swiss Energy Coffee Crema — 90% arabika + 10% robusta. Kuchli va kremal aroma. 250 g.",
      ru: "Swiss Energy Coffee Crema — 90% арабика + 10% робуста. Крепкий и кремовый аромат. 250 г.",
    },
    highlights: {
      uz: ["90% arabika", "10% robusta", "250 g", "Shveytsariya sifati"],
      ru: ["90% арабика", "10% робуста", "250 г", "Швейцарское качество"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Kuchli ta'm", description: "Robusta qo'shimchasi kuchliroq qiladi." },
        { icon: "sparkle", title: "Kremal aroma", description: "Nozik qaymoqli aroma." },
      ],
      ru: [
        { icon: "bolt", title: "Крепкий вкус", description: "Добавка робусты делает крепче." },
        { icon: "sparkle", title: "Кремовый аромат", description: "Нежный сливочный аромат." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Arabika", amount: "90%" },
        { name: "Robusta", amount: "10%" },
      ],
      ru: [
        { name: "Арабика", amount: "90%" },
        { name: "Робуста", amount: "10%" },
      ],
    },
    howToUse: {
      uz: "1 choy qoshiq qahvani 200 ml qaynoq suvda dамлаб iching.",
      ru: "Заварите 1 чайную ложку кофе в 200 мл горячей воды.",
    },
    faq: {
      uz: [{ question: "500g bilan farqi?", answer: "Faqat hajm farq qiladi — birinchi marta sinab ko'rish uchun 250g ideal." }],
      ru: [{ question: "Чем отличается от 500г?", answer: "Только объём — 250г идеально для первой пробы." }],
    },
    reviews: {
      uz: [{ author: "Malika H.", rating: 4, date: "2026-06-05", text: "Yaxshi ta'm, kuchli qahva." }],
      ru: [{ author: "Малика Х.", rating: 4, date: "2026-06-05", text: "Хороший вкус, крепкий кофе." }],
    },
  },

  // ─── Swiss Energy Hair Nail Skin ───────────────────────────────────────────
  {
    id: "p-hair-nail-skin",
    slug: "swiss-energy-hair-nail-skin-30",
    categoryId: "cat-beauty",
    categorySlug: "beauty",
    price: 255150,
    oldPrice: 369000,
    rating: 4.9,
    reviewCount: 79,
    inStock: true,
    imageSeeds: ["hns-a", "hns-b", "hns-c"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "30 kapsula", ru: "30 капсул" },
    badges: { uz: ["Aksiya", "Original"], ru: ["Акция", "Original"] },
    name: { uz: "Swiss Energy Hair Nail & Skin 30", ru: "Swiss Energy Hair Nail & Skin 30" },
    searchAliases: { uz: ["soch tirnoq teri", "hair nail skin"], ru: ["волосы ногти кожа", "hair nail skin"] },
    tagline: {
      uz: "Soch, tirnoq va teri uchun vitaminlar — 30 kapsula",
      ru: "Витамины для волос, ногтей и кожи — 30 капсул",
    },
    description: {
      uz: "Swiss Energy Hair Nail & Skin — tibbiy achitqi ekstrakti, pantoten kislota, L-sistein, L-metionin, niatsin, sink, biotin, B1 va B6 vitamini. Soch va tirnoqni mustahkamlaydi, terini yaxshilaydi.",
      ru: "Swiss Energy Hair Nail & Skin — экстракт медицинских дрожжей, пантотеновая кислота, L-цистеин, L-метионин, ниацин, цинк, биотин, витамин B1 и B6. Укрепляет волосы и ногти, улучшает кожу.",
    },
    highlights: {
      uz: ["Biotin + Sink", "L-sistein + L-metionin", "B1 va B6 vitamini", "30 kapsula"],
      ru: ["Биотин + Цинк", "L-цистеин + L-метионин", "Витамин B1 и B6", "30 капсул"],
    },
    benefits: {
      uz: [
        { icon: "sparkle", title: "Mustahkam soch", description: "Biotin va sink sochni ichkaridan mustahkamlaydi." },
        { icon: "sparkle", title: "Sog'lom tirnoq", description: "L-sistein tirnoq sinishini kamaytiradi." },
        { icon: "sparkle", title: "Yorqin teri", description: "Niatsin va B vitaminlari teri holatini yaxshilaydi." },
      ],
      ru: [
        { icon: "sparkle", title: "Крепкие волосы", description: "Биотин и цинк укрепляют волосы изнутри." },
        { icon: "sparkle", title: "Здоровые ногти", description: "L-цистеин уменьшает ломкость ногтей." },
        { icon: "sparkle", title: "Сияющая кожа", description: "Ниацин и B-витамины улучшают состояние кожи." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Tibbiy achitqi ekstrakti", amount: "200 mg" },
        { name: "Pantoten kislota (B5)", amount: "6 mg", dailyValue: "100%" },
        { name: "L-sistein", amount: "50 mg" },
        { name: "L-metionin", amount: "50 mg" },
        { name: "Niatsin (B3)", amount: "16 mg", dailyValue: "100%" },
        { name: "Sink", amount: "10 mg", dailyValue: "100%" },
        { name: "Biotin", amount: "150 mkg", dailyValue: "300%" },
        { name: "Vitamin B1", amount: "1.1 mg", dailyValue: "100%" },
        { name: "Vitamin B6", amount: "1.4 mg", dailyValue: "100%" },
      ],
      ru: [
        { name: "Экстракт медицинских дрожжей", amount: "200 мг" },
        { name: "Пантотеновая кислота (B5)", amount: "6 мг", dailyValue: "100%" },
        { name: "L-цистеин", amount: "50 мг" },
        { name: "L-метионин", amount: "50 мг" },
        { name: "Ниацин (B3)", amount: "16 мг", dailyValue: "100%" },
        { name: "Цинк", amount: "10 мг", dailyValue: "100%" },
        { name: "Биотин", amount: "150 мкг", dailyValue: "300%" },
        { name: "Витамин B1", amount: "1,1 мг", dailyValue: "100%" },
        { name: "Витамин B6", amount: "1,4 мг", dailyValue: "100%" },
      ],
    },
    howToUse: {
      uz: "Kuniga 1 kapsuladan ovqat bilan qabul qiling. Kamida 3 oy ishlatish tavsiya etiladi.",
      ru: "Принимайте по 1 капсуле в день с едой. Рекомендуется использовать не менее 3 месяцев.",
    },
    faq: {
      uz: [
        { question: "Qachon natija ko'rinadi?", answer: "Soch va tirnoqda 4–8 haftadan keyin sezilarli o'zgarish bo'ladi." },
        { question: "14 yoshdan kichiklarga mosmi?", answer: "14+ yoshdan kattalar uchun mo'ljallangan." },
      ],
      ru: [
        { question: "Когда виден результат?", answer: "Заметные изменения волос и ногтей — через 4–8 недель." },
        { question: "Подходит ли до 14 лет?", answer: "Предназначен для лиц от 14 лет и старше." },
      ],
    },
    reviews: {
      uz: [
        { author: "Zilola N.", rating: 5, date: "2026-04-15", text: "Sochim to'kilyapti degan muammo o'tdi, tirnoqlarim ham zo'r." },
        { author: "Shahnoza A.", rating: 5, date: "2026-03-20", text: "2 oydan keyin sochim yanada qalinlashdi." },
      ],
      ru: [
        { author: "Зилола Н.", rating: 5, date: "2026-04-15", text: "Проблема выпадения волос прошла, ногти тоже отличные." },
        { author: "Шахноза А.", rating: 5, date: "2026-03-20", text: "После 2 месяцев волосы стали заметно гуще." },
      ],
    },
  },

  // ─── Dr. Frei Turbo Base ingalyator ───────────────────────────────────────
  {
    id: "p-inhaler-turbo",
    slug: "dr-frei-turbo-base-ingalyator",
    categoryId: "cat-devices",
    categorySlug: "devices",
    price: 502950,
    oldPrice: 1000000,
    rating: 4.8,
    reviewCount: 4,
    inStock: true,
    imageSeeds: ["inhaler-a", "inhaler-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "1 dona", ru: "1 штука" },
    badges: { uz: ["Aksiya", "Kattalar va bolalar uchun"], ru: ["Акция", "Для взрослых и детей"] },
    name: { uz: "Dr. Frei Turbo Base ingalyator", ru: "Ингалятор Dr. Frei Turbo Base" },
    searchAliases: { uz: ["turbobeys", "nebulayzer"], ru: ["турбобейс", "небулайзер", "ингалятор"] },
    tagline: {
      uz: "Kompressorli nebulayzer — kattalar va bolalar uchun",
      ru: "Компрессорный небулайзер — для взрослых и детей",
    },
    description: {
      uz: "Dr. Frei Turbo Base — kompressorli nebulayzer ingalyator. Nafas yo'llari kasalliklarini davolash uchun. Kattalar va bolalarga mos, oddiy foydalanish.",
      ru: "Dr. Frei Turbo Base — компрессорный небулайзер-ингалятор. Для лечения заболеваний дыхательных путей. Подходит взрослым и детям, простое использование.",
    },
    highlights: {
      uz: ["Kompressorli nebulayzer", "Kattalar va bolalar uchun", "Oddiy foydalanish", "Dr. Frei brendidan"],
      ru: ["Компрессорный небулайзер", "Для взрослых и детей", "Простое использование", "Бренд Dr. Frei"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Nafas yo'llari davolash", description: "Bronxit, astma, ARVI uchun samarali." },
        { icon: "sparkle", title: "Mayda zarrachalar", description: "Dori quyi nafas yo'llariga yetib boradi." },
      ],
      ru: [
        { icon: "shield", title: "Лечение дыхательных путей", description: "Эффективен при бронхите, астме, ОРВИ." },
        { icon: "sparkle", title: "Мелкие частицы", description: "Лекарство достигает нижних дыхательных путей." },
      ],
    },
    ingredients: {
      uz: [{ name: "Kompressor guchh", amount: "0.4 MPa" }],
      ru: [{ name: "Давление компрессора", amount: "0,4 МПа" }],
    },
    howToUse: {
      uz: "Nebulayzer idishiga dori soling, niqob kiyib nafas oling. Shifokor tavsiyasi bilan ishlating.",
      ru: "Наполните резервуар небулайзера лекарством, наденьте маску и дышите. Использовать по рекомендации врача.",
    },
    faq: {
      uz: [
        { question: "Qanday yoshdagi bolalar uchun?", answer: "Yangi tug'ilgan chaqaloqlardan katta yoshgacha, maxsus niqoblar bilan." },
        { question: "Qanday dorilar solinadi?", answer: "Shifokor belgilagan dori eritmalarini soling — o'z-o'zingizcha dori tanlamang." },
      ],
      ru: [
        { question: "Для детей какого возраста?", answer: "От новорождённых до взрослых, со специальными масками." },
        { question: "Какие препараты использовать?", answer: "Только растворы, назначенные врачом — не выбирайте препараты самостоятельно." },
      ],
    },
    reviews: {
      uz: [{ author: "Barno R.", rating: 5, date: "2026-05-28", text: "Bolam uchun oldim, juda qulay va samarali." }],
      ru: [{ author: "Барно Р.", rating: 5, date: "2026-05-28", text: "Купила для ребёнка, очень удобно и эффективно." }],
    },
  },

  // ─── Peano balzam ─────────────────────────────────────────────────────────
  {
    id: "p-peano-balzam",
    slug: "peano-balzam-30g",
    categoryId: "cat-skin",
    categorySlug: "skin",
    price: 142890,
    oldPrice: 800000,
    rating: 5.0,
    reviewCount: 5,
    inStock: true,
    imageSeeds: ["peano-a", "peano-b"],
    bespoke: true,
    origin: { uz: "Germaniya", ru: "Германия" },
    servings: { uz: "30 g", ru: "30 г" },
    badges: { uz: ["Aksiya", "Dermatologik"], ru: ["Акция", "Дерматологический"] },
    name: { uz: "Peano balzam 30 g", ru: "Peano крем-бальзам 30 г" },
    searchAliases: { uz: ["piano", "peano krem"], ru: ["пиано", "крем бальзам"] },
    tagline: {
      uz: "Teri tiklanishi uchun balzam — 30 g, xushbo'ysiz va parabensiz",
      ru: "Бальзам для кожи — 30 г, без отдушки и парабенов",
    },
    description: {
      uz: "Peano Balzam — dermatologik malham, 30 g. Tuproq va quti: «Teri tiklanishi uchun balzam», «Xushbo'y va Parabenlarsiz».",
      ru: "Peano Balzam — дерматологическая мазь, 30 г. На тубе: «Teri tiklanishi uchun balzam», без отдушки и парабенов.",
    },
    highlights: {
      uz: ["30 g", "Teri tiklanishi", "Xushbo'ysiz", "Parabensiz"],
      ru: ["30 г", "Восстановление кожи", "Без отдушки", "Без парабенов"],
    },
    benefits: {
      uz: [
        { icon: "sparkle", title: "Tez bitish", description: "Teri tiklanish jarayonini tezlashtiradi." },
        { icon: "shield", title: "Himoya", description: "Teriga namlantiruvchi himoya qatlami yaratadi." },
      ],
      ru: [
        { icon: "sparkle", title: "Быстрое заживление", description: "Ускоряет процесс восстановления кожи." },
        { icon: "shield", title: "Защита", description: "Создаёт увлажняющий защитный слой на коже." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Dermatologik asos", amount: "30 g" },
        { name: "Xushbo'y", amount: "yo'q" },
        { name: "Parabenlar", amount: "yo'q" },
      ],
      ru: [
        { name: "Дерматологическая основа", amount: "30 г" },
        { name: "Отдушка", amount: "нет" },
        { name: "Парабены", amount: "нет" },
      ],
    },
    howToUse: {
      uz: "Toza teriga kuniga 2–3 marta yupqa qatlam bilan suring. Bint bilan yopish mumkin.",
      ru: "Наносите тонким слоем на чистую кожу 2–3 раза в день. Можно накрыть повязкой.",
    },
    faq: {
      uz: [
        { question: "Yuz terisiga ishlataversa bo'ladimi?", answer: "Ha, yuz terisiga ham mos, lekin ko'zdan uzoq saqlang." },
      ],
      ru: [
        { question: "Можно ли применять на коже лица?", answer: "Да, подходит и для кожи лица, но держите подальше от глаз." },
      ],
    },
    reviews: {
      uz: [{ author: "Gulnora A.", rating: 5, date: "2026-06-01", text: "Kuygan joyim 3 kunda bitdi. Ajoyib mahsulot!" }],
      ru: [{ author: "Гулнора А.", rating: 5, date: "2026-06-01", text: "Ожог зажил за 3 дня. Замечательное средство!" }],
    },
  },

  // ─── Swiss Energy Visiovit ─────────────────────────────────────────────────
  {
    id: "p-visiovit",
    slug: "swiss-energy-visiovit-30",
    categoryId: "cat-vitamins",
    categorySlug: "vitamins",
    price: 255150,
    oldPrice: 420000,
    rating: 4.7,
    reviewCount: 63,
    inStock: true,
    imageSeeds: ["visio-a", "visio-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "30 kapsula", ru: "30 капсул" },
    badges: { uz: ["Aksiya", "Ko'zlar uchun"], ru: ["Акция", "Для глаз"] },
    name: { uz: "Swiss Energy Visiovit 30", ru: "Swiss Energy Visiovit 30" },
    tagline: {
      uz: "Visiovit — lyutein, chernika, zeaksantin, A, E, Zn. 30 kapsula",
      ru: "Visiovit — лютеин, черника, зеаксантин, A, E, Zn. 30 капсул",
    },
    description: {
      uz: "Swiss Energy Visiovit by Dr.Frei — 30 kapsula, sekin chiqarilish. Etiketka: Lutein + Blueberry Extract + Zeaxantin + A, E + Zn, «for healthy eyesight».",
      ru: "Swiss Energy Visiovit by Dr.Frei — 30 капсул, sustained release. Этикетка: Lutein + Blueberry Extract + Zeaxantin + A, E + Zn.",
    },
    highlights: {
      uz: ["Lyutein + zeaksantin", "Chernika ekstrakti", "A va E vitamini + Sink", "30 kapsula"],
      ru: ["Лютеин + зеаксантин", "Экстракт черники", "Витамин A и E + Цинк", "30 капсул"],
    },
    benefits: {
      uz: [
        { icon: "eye", title: "Ko'rish o'tkirligi", description: "Lyutein va zeaksantin makula sog'lig'ini qo'llab-quvvatlaydi." },
        { icon: "shield", title: "Ko'z himoyasi", description: "Ko'zni shu'la va tashqi omillardan himoya qiladi." },
      ],
      ru: [
        { icon: "eye", title: "Острота зрения", description: "Лютеин и зеаксантин поддерживают здоровье макулы." },
        { icon: "shield", title: "Защита глаз", description: "Защищает глаза от излучения и внешних факторов." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Lyutein", amount: "10 mg" },
        { name: "Chernika ekstrakti", amount: "80 mg" },
        { name: "Zeaksantin", amount: "2 mg" },
        { name: "Vitamin A", amount: "800 mkg", dailyValue: "100%" },
        { name: "Vitamin E", amount: "12 mg", dailyValue: "100%" },
        { name: "Sink", amount: "10 mg", dailyValue: "100%" },
      ],
      ru: [
        { name: "Лютеин", amount: "10 мг" },
        { name: "Экстракт черники", amount: "80 мг" },
        { name: "Зеаксантин", amount: "2 мг" },
        { name: "Витамин A", amount: "800 мкг", dailyValue: "100%" },
        { name: "Витамин E", amount: "12 мг", dailyValue: "100%" },
        { name: "Цинк", amount: "10 мг", dailyValue: "100%" },
      ],
    },
    howToUse: {
      uz: "Kuniga 1 kapsuladan ovqat bilan qabul qiling.",
      ru: "Принимайте по 1 капсуле в день с едой.",
    },
    faq: {
      uz: [
        { question: "Kompyutерda ko'p ishlaydiganlarga mosmi?", answer: "Ha, raqamli qurilmalar ko'z toliqishida juda foydali." },
      ],
      ru: [
        { question: "Подходит ли для тех, кто много работает за компьютером?", answer: "Да, очень полезен при усталости глаз от цифровых устройств." },
      ],
    },
    reviews: {
      uz: [
        { author: "Xurshid B.", rating: 5, date: "2026-04-10", text: "Ko'zim toliqishi kamaydi, kompyuter oldida yaxshi ishlayaman." },
        { author: "Nozima O.", rating: 4, date: "2026-03-15", text: "Yaxshi mahsulot, ko'z shifokorim tavsiya qildi." },
      ],
      ru: [
        { author: "Хуршид Б.", rating: 5, date: "2026-04-10", text: "Усталость глаз уменьшилась, лучше работаю за компьютером." },
        { author: "Нозима О.", rating: 4, date: "2026-03-15", text: "Хороший продукт, офтальмолог рекомендовал." },
      ],
    },
  },

  // ─── Swiss Energy ImmunoVit ────────────────────────────────────────────────
  {
    id: "p-immunovit",
    slug: "swiss-energy-immunovit-30",
    categoryId: "cat-immunity",
    categorySlug: "immunity",
    price: 255150,
    oldPrice: 500000,
    rating: 4.8,
    reviewCount: 20,
    inStock: true,
    imageSeeds: ["immuno-a", "immuno-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "30 kapsula", ru: "30 капсул" },
    badges: { uz: ["Aksiya", "Immunitet"], ru: ["Акция", "Иммунитет"] },
    name: { uz: "Swiss Energy ImmunoVit 30", ru: "Swiss Energy ImmunoVit 30" },
    tagline: {
      uz: "ImmunoVit — echinacea + propolis + C + Zn, 30 kapsula",
      ru: "ImmunoVit — эхинацея + прополис + C + Zn, 30 капсул",
    },
    description: {
      uz: "Swiss Energy ImmunoVit by Dr.Frei — 30 kapsula, sekin chiqarilish. Etiketka: Echinacea + Propolis + Vitamin C + Zn, «strengthening of immune system».",
      ru: "Swiss Energy ImmunoVit by Dr.Frei — 30 капсул, sustained release. Этикетка: Echinacea + Propolis + Vitamin C + Zn.",
    },
    highlights: {
      uz: ["Echinacea + Propolis", "Vitamin C + Sink", "30 kapsula", "Mavsumiy himoya"],
      ru: ["Эхинацея + Прополис", "Витамин C + Цинк", "30 капсул", "Сезонная защита"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Immunitetni kuchaytirish", description: "Echinacea va propolis immun tizimni faollashtiradi." },
        { icon: "bolt", title: "Antioksidant", description: "Vitamin C hujayralarni himoya qiladi." },
      ],
      ru: [
        { icon: "shield", title: "Укрепление иммунитета", description: "Эхинацея и прополис активируют иммунную систему." },
        { icon: "bolt", title: "Антиоксидант", description: "Витамин C защищает клетки." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Echinacea ekstrakti", amount: "100 mg" },
        { name: "Propolis", amount: "50 mg" },
        { name: "Vitamin C", amount: "80 mg", dailyValue: "100%" },
        { name: "Sink", amount: "10 mg", dailyValue: "100%" },
      ],
      ru: [
        { name: "Экстракт эхинацеи", amount: "100 мг" },
        { name: "Прополис", amount: "50 мг" },
        { name: "Витамин C", amount: "80 мг", dailyValue: "100%" },
        { name: "Цинк", amount: "10 мг", dailyValue: "100%" },
      ],
    },
    howToUse: {
      uz: "Kuniga 1 kapsuladan ovqat bilan qabul qiling. Mavsumiy profilaktika uchun 1–2 oy davomida.",
      ru: "Принимайте по 1 капсуле в день с едой. Для сезонной профилактики — 1–2 месяца.",
    },
    faq: {
      uz: [{ question: "Shamollayotganda ichsa bo'ladimi?", answer: "Ha, shamollash boshlanishida va davomida foydali." }],
      ru: [{ question: "Можно принимать при простуде?", answer: "Да, полезен в начале и во время простуды." }],
    },
    reviews: {
      uz: [{ author: "Aziz R.", rating: 5, date: "2026-02-20", text: "Bu qish juda kam kasal bo'ldim, rahmat!" }],
      ru: [{ author: "Азиз Р.", rating: 5, date: "2026-02-20", text: "Этой зимой болел очень мало, спасибо!" }],
    },
  },

  // ─── Dr. Frei A20 tonometr ─────────────────────────────────────────────────
  {
    id: "p-tonometr-a20",
    slug: "dr-frei-tonometr-a20",
    categoryId: "cat-devices",
    categorySlug: "devices",
    price: 242000,
    oldPrice: 1000000,
    rating: 4.9,
    reviewCount: 15,
    inStock: true,
    imageSeeds: ["tonometr-a", "tonometr-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "1 dona, 2 yillik kafolat", ru: "1 штука, гарантия 2 года" },
    badges: { uz: ["Aksiya", "2 yillik kafolat", "Arzon narx kafolati"], ru: ["Акция", "Гарантия 2 года", "Гарантия низкой цены"] },
    name: { uz: "Dr. Frei A20 Mexanik Tonometr", ru: "Dr. Frei A20 Механический Тонометр" },
    tagline: {
      uz: "Bosim o'lchash uchun mexanik tonometr — 2 yillik kafolat",
      ru: "Механический тонометр для измерения давления — гарантия 2 года",
    },
    description: {
      uz: "Dr. Frei A20 — klassik mexanik tonometr. Yuqori aniqlik, Shveytsariya sifati. 2 yillik kafolat. Uy va tibbiyot muassasalari uchun.",
      ru: "Dr. Frei A20 — классический механический тонометр. Высокая точность, швейцарское качество. Гарантия 2 года. Для дома и медицинских учреждений.",
    },
    highlights: {
      uz: ["Mexanik aniqligi", "Shveytsariya sifati", "2 yillik kafolat", "Arzon narx"],
      ru: ["Точность механики", "Швейцарское качество", "Гарантия 2 года", "Низкая цена"],
    },
    benefits: {
      uz: [
        { icon: "heart", title: "Aniq o'lchov", description: "Klassik mexanik sxema — eng ishonchli natijalar." },
        { icon: "shield", title: "Uzoq xizmat", description: "2 yillik kafolat va yuqori ishonchlilik." },
      ],
      ru: [
        { icon: "heart", title: "Точное измерение", description: "Классическая механическая схема — самые надёжные результаты." },
        { icon: "shield", title: "Долгая служба", description: "Гарантия 2 года и высокая надёжность." },
      ],
    },
    ingredients: {
      uz: [{ name: "O'lchov diapazoni", amount: "0–300 mmHg" }],
      ru: [{ name: "Диапазон измерения", amount: "0–300 мм рт.ст." }],
    },
    howToUse: {
      uz: "Bilakni yurak darajasida ushlab turing, manjetni kiyib, nasos bilan bosimni oshiring va ko'rsatkichni o'qing.",
      ru: "Держите руку на уровне сердца, наденьте манжету, накачайте давление насосом и считайте показание.",
    },
    faq: {
      uz: [
        { question: "Elektron va mexanik qaysi biri aniqroq?", answer: "Mexanik tonometr to'g'ri ishlatisganda elektron bilan bir xil yoki undan aniqroq." },
        { question: "Kafolat qanday ishlaydi?", answer: "2 yil davomida ishlab chiqaruvchi nuqsonlarida bepul ta'mirlanadi." },
      ],
      ru: [
        { question: "Что точнее — электронный или механический?", answer: "Механический тонометр при правильном использовании не менее точен, а часто точнее электронного." },
        { question: "Как работает гарантия?", answer: "В течение 2 лет бесплатный ремонт при производственном браке." },
      ],
    },
    reviews: {
      uz: [
        { author: "Hamid Y.", rating: 5, date: "2026-05-20", text: "Otam uchun oldim, juda aniq o'lchaydi." },
        { author: "Dilrabo K.", rating: 5, date: "2026-04-08", text: "Shifoxonada ishlagan vaqtimdan beri Dr. Frei-ga ishonaman." },
      ],
      ru: [
        { author: "Хамид Я.", rating: 5, date: "2026-05-20", text: "Купил для отца, измеряет очень точно." },
        { author: "Дилрабо К.", rating: 5, date: "2026-04-08", text: "Доверяю Dr. Frei ещё со времён работы в больнице." },
      ],
    },
  },

  // ─── Dr. Frei Multivitamins ────────────────────────────────────────────────
  {
    id: "p-dr-frei-multi",
    slug: "dr-frei-multivitamins-biotin-20",
    categoryId: "cat-effervescent",
    categorySlug: "effervescent",
    price: 73500,
    oldPrice: 107000,
    rating: 4.9,
    reviewCount: 154,
    inStock: true,
    imageSeeds: ["drfrei-multi-a", "drfrei-multi-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "20 tabletka", ru: "20 таблеток" },
    badges: { uz: ["Aksiya", "Arzon narx kafolati"], ru: ["Акция", "Гарантия низкой цены"] },
    name: { uz: "Dr. Frei Multivitamins + Biotin 20", ru: "Dr. Frei Multivitamins + Biotin 20" },
    searchAliases: { uz: ["multivitamin", "biotin"], ru: ["мульт", "мультивитамины", "биотин"] },
    tagline: {
      uz: "Multi + Biotin — A, B1–B12, C, D3, E, PP, H. 20 tabletka, 14+",
      ru: "Multi + Biotin — A, B1–B12, C, D3, E, PP, H. 20 таблеток, 14+",
    },
    description: {
      uz: "Dr. Frei MULTI VITAMINS + Biotin — 20 shipuchi tabletka. Tuproqda: A, B, C, D3, E, PP, H va biotin; «strong and healthy». 14+ yosh.",
      ru: "Dr. Frei MULTI VITAMINS + Biotin — 20 шипучих таблеток. На тубе: A, B, C, D3, E, PP, H и биотин. С 14 лет.",
    },
    highlights: {
      uz: ["A, B, C, D, E, PP + Biotin", "Shipuchi format", "14+ yoshdan", "20 tabletka"],
      ru: ["A, B, C, D, E, PP + Биотин", "Шипучий формат", "14+ лет", "20 таблеток"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Immunitet", description: "Vitaminlar kompleksi mavsumiy himoyani kuchaytiradi." },
        { icon: "bolt", title: "Energiya", description: "B vitaminlari charchoqni kamaytiradi." },
        { icon: "sparkle", title: "Tez so'rilish", description: "Shipuchi format tez ishlaydi." },
      ],
      ru: [
        { icon: "shield", title: "Иммунитет", description: "Комплекс витаминов усиливает сезонную защиту." },
        { icon: "bolt", title: "Энергия", description: "B-витамины снижают усталость." },
        { icon: "sparkle", title: "Быстрое усвоение", description: "Шипучий формат действует быстро." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Vitamin A", amount: "800 mkg", dailyValue: "100%" },
        { name: "Vitamin C", amount: "80 mg", dailyValue: "100%" },
        { name: "Vitamin D", amount: "5 mkg", dailyValue: "100%" },
        { name: "Vitamin E", amount: "12 mg", dailyValue: "100%" },
        { name: "B vitaminlari (B1, B2, B3, B5, B6, B12)", amount: "100% RDI" },
        { name: "Biotin", amount: "50 mkg", dailyValue: "100%" },
      ],
      ru: [
        { name: "Витамин A", amount: "800 мкг", dailyValue: "100%" },
        { name: "Витамин C", amount: "80 мг", dailyValue: "100%" },
        { name: "Витамин D", amount: "5 мкг", dailyValue: "100%" },
        { name: "Витамин E", amount: "12 мг", dailyValue: "100%" },
        { name: "Витамины B (B1, B2, B3, B5, B6, B12)", amount: "100% RDI" },
        { name: "Биотин", amount: "50 мкг", dailyValue: "100%" },
      ],
    },
    howToUse: {
      uz: "1 tabletkani 200 ml suvda eriting. Kuniga 1 marta, ovqatdan keyin iching.",
      ru: "Растворите 1 таблетку в 200 мл воды. Пейте 1 раз в день после еды.",
    },
    faq: {
      uz: [{ question: "Har kuni ichsa bo'ladimi?", answer: "Ha, kunlik qabul uchun mo'ljallangan." }],
      ru: [{ question: "Можно принимать каждый день?", answer: "Да, предназначен для ежедневного приёма." }],
    },
    reviews: {
      uz: [
        { author: "Feruza N.", rating: 5, date: "2026-05-12", text: "Juda mazali, ta'mi yoqimli, energiya beradi." },
        { author: "Sherzod I.", rating: 5, date: "2026-04-28", text: "Narxi arzon, sifati zo'r — har doim olib turaman." },
      ],
      ru: [
        { author: "Феруза Н.", rating: 5, date: "2026-05-12", text: "Очень вкусно, приятный вкус, даёт энергию." },
        { author: "Шерзод И.", rating: 5, date: "2026-04-28", text: "Цена низкая, качество отличное — беру постоянно." },
      ],
    },
  },

  // ─── HAMDARD SAFI ─────────────────────────────────────────────────────────
  {
    id: "p-safi-eks1",
    slug: "hamdard-safi-eks1-200ml",
    categoryId: "cat-herbal",
    categorySlug: "herbal",
    price: 142890,
    oldPrice: 800000,
    rating: 5.0,
    reviewCount: 5,
    inStock: true,
    imageSeeds: ["safi-a", "safi-b"],
    bespoke: true,
    origin: { uz: "Hindiston", ru: "Индия" },
    servings: { uz: "200 ml", ru: "200 мл" },
    badges: { uz: ["Aksiya", "O'simlik asosida"], ru: ["Акция", "На растительной основе"] },
    name: { uz: "Hamdard Safi 200 ml", ru: "Hamdard Safi 200 мл" },
    searchAliases: { uz: ["safi", "safi-eks", "hamdard"], ru: ["сафи", "сафи-экс", "хамдард"] },
    tagline: {
      uz: "Qonni kompleks tozalash uchun o'simlik siropi",
      ru: "Растительный сироп для комплексного очищения крови",
    },
    description: {
      uz: "HAMDARD SAFI — qonni tozalash uchun Hindiston o'simlik siropi. Teridagi muammolar va organizmni tozalash uchun an'anaviy vosita. 200 ml.",
      ru: "HAMDARD SAFI — индийский растительный сироп для очищения крови. Традиционное средство для кожных проблем и детоксикации организма. 200 мл.",
    },
    highlights: {
      uz: ["Qonni tozalash", "O'simlik asosida", "Hindiston formulasi", "200 ml"],
      ru: ["Очищение крови", "На растительной основе", "Индийская формула", "200 мл"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Qon tozalash", description: "Tanani ichkaridan tozalaydi." },
        { icon: "sparkle", title: "Teri muammolari", description: "Akne va teri kasalliklarida yordam beradi." },
      ],
      ru: [
        { icon: "shield", title: "Очищение крови", description: "Очищает организм изнутри." },
        { icon: "sparkle", title: "Проблемы кожи", description: "Помогает при акне и кожных заболеваниях." },
      ],
    },
    ingredients: {
      uz: [{ name: "O'simlik ekstraktlari kompleksi", amount: "200 ml" }],
      ru: [{ name: "Комплекс растительных экстрактов", amount: "200 мл" }],
    },
    howToUse: {
      uz: "Kuniga 2 marta 10 ml (2 choy qoshiq) suvda eriting. Ovqatdan 30 daqiqa oldin iching.",
      ru: "2 раза в день по 10 мл (2 чайные ложки) растворить в воде. Принимать за 30 минут до еды.",
    },
    faq: {
      uz: [{ question: "Qancha vaqt ichish kerak?", answer: "Odatda 4–6 hafta kurs, so'ng shifokor bilan maslahatlashing." }],
      ru: [{ question: "Сколько времени принимать?", answer: "Обычно курс 4–6 недель, затем проконсультируйтесь с врачом." }],
    },
    reviews: {
      uz: [{ author: "Sumaiya K.", rating: 5, date: "2026-05-18", text: "Yuzimdag'i akne yo'qoldi, organizmim yengil his qildi." }],
      ru: [{ author: "Сумайя К.", rating: 5, date: "2026-05-18", text: "Акне на лице прошло, организм стал чувствовать себя легче." }],
    },
  },

  // ─── Dr. Frei Gold ────────────────────────────────────────────────────────
  {
    id: "p-dr-frei-gold",
    slug: "dr-frei-gold-vitamins-20",
    categoryId: "cat-effervescent",
    categorySlug: "effervescent",
    price: 66150,
    oldPrice: 73500,
    rating: 4.9,
    reviewCount: 68,
    inStock: true,
    imageSeeds: ["drfrei-gold-a", "drfrei-gold-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "20 tabletka", ru: "20 таблеток" },
    badges: { uz: ["Aksiya", "Ko'z va immunitet"], ru: ["Акция", "Зрение и иммунитет"] },
    name: { uz: "Dr. Frei Gold Vitaminlar 20", ru: "Dr. Frei Gold Витамины 20" },
    tagline: {
      uz: "Gold — lyutein + A, C, E, Zn. 20 shipuchi tabletka, 14+",
      ru: "Gold — лютеин + A, C, E, Zn. 20 шипучих таблеток, 14+",
    },
    description: {
      uz: "Dr. Frei GOLD — lyutein bilan vitamin va minerallar kompleksi. Tuproqda: vitamin A, C, E, sink; kunlik qo'llab-quvvatlash. 20 shipuchi tabletka, 14+.",
      ru: "Dr. Frei GOLD — комплекс витаминов и минералов с лютеином. На тубе: A, C, E, цинк; ежедневная поддержка. 20 шипучих таблеток, 14+.",
    },
    highlights: {
      uz: ["Lyutein", "A, C, E vitamini + Sink", "Eruvchan format", "20 tabletka"],
      ru: ["Лютеин", "Витамин A, C, E + Цинк", "Растворимый формат", "20 таблеток"],
    },
    benefits: {
      uz: [
        { icon: "eye", title: "Ko'z sog'lig'i", description: "Lyutein va vitamin A ko'rish o'tkirligini qo'llab-quvvatlaydi." },
        { icon: "shield", title: "Immunitet", description: "Vitamin C va E immun tizimni mustahkamlaydi." },
      ],
      ru: [
        { icon: "eye", title: "Здоровье глаз", description: "Лютеин и витамин A поддерживают остроту зрения." },
        { icon: "shield", title: "Иммунитет", description: "Витамин C и E укрепляют иммунную систему." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Lyutein", amount: "6 mg" },
        { name: "Vitamin A", amount: "800 mkg", dailyValue: "100%" },
        { name: "Vitamin C", amount: "80 mg", dailyValue: "100%" },
        { name: "Vitamin E", amount: "12 mg", dailyValue: "100%" },
        { name: "Sink", amount: "10 mg", dailyValue: "100%" },
      ],
      ru: [
        { name: "Лютеин", amount: "6 мг" },
        { name: "Витамин A", amount: "800 мкг", dailyValue: "100%" },
        { name: "Витамин C", amount: "80 мг", dailyValue: "100%" },
        { name: "Витамин E", amount: "12 мг", dailyValue: "100%" },
        { name: "Цинк", amount: "10 мг", dailyValue: "100%" },
      ],
    },
    howToUse: {
      uz: "14+ yosh: 1 tabletkani 200 ml (1 stakan) suvda eriting. Kuniga 1 marta, ovqat paytida yoki keyin.",
      ru: "С 14 лет: растворите одну таблетку в 200 мл воды. 1 раз в сутки во время или после еды.",
    },
    faq: {
      uz: [{ question: "Visiovit bilan farqi?", answer: "Gold — shipuchi tabletka (lyutein + A, C, E, Zn). Visiovit — ko'z kapsulasi." }],
      ru: [{ question: "В чём разница с Visiovit?", answer: "Gold — шипучая таблетка, Visiovit — капсула. Состав похожий, формат разный." }],
    },
    reviews: {
      uz: [
        { author: "Iroda S.", rating: 5, date: "2026-04-22", text: "Ko'zim uchun ichaman, yaxshi samara beryapti." },
      ],
      ru: [
        { author: "Ирода С.", rating: 5, date: "2026-04-22", text: "Принимаю для глаз, хорошо помогает." },
      ],
    },
  },

  // ─── Dr. Frei Kids ────────────────────────────────────────────────────────
  {
    id: "p-dr-frei-kids",
    slug: "dr-frei-kids-multivitamins-20",
    categoryId: "cat-kids",
    categorySlug: "kids",
    price: 73500,
    oldPrice: 107000,
    rating: 4.9,
    reviewCount: 176,
    inStock: true,
    imageSeeds: ["drfrei-kids-a", "drfrei-kids-b"],
    bespoke: true,
    origin: { uz: "Bolgariya (EU)", ru: "Болгария (ЕС)" },
    servings: { uz: "20 shipuchi tabletka", ru: "20 шипучих таблеток" },
    badges: { uz: ["Aksiya", "7+ yosh", "Yevropa sifati"], ru: ["Акция", "7+ лет", "Европейское качество"] },
    name: { uz: "Dr. Frei Kids Multivitaminlar 20", ru: "Dr. Frei Kids Мультивитамины 20" },
    tagline: {
      uz: "Bolalar uchun A, B, C, D3, E + Kalsiy — 7 yoshdan, mevali ta'm",
      ru: "Для детей A, B, C, D3, E + Кальций — с 7 лет, ягодный вкус",
    },
    description: {
      uz: "Dr. Frei Kids — 7 yoshdan yuqori bolalar uchun shipuchi multivitamin kompleksi: 12 ta vitamin (A, B1, B2, B3, B5, B6, B9, B12, C, D3, E, H) va kalsiy. Bir tabletka — bir stakan (200 ml) xushbo'y mevali ichimlik; tabletka yutish shart emas. Kalsiy + D3 suyak va tishlarni, C immunitetni, B guruhi diqqat va xotirani qo'llab-quvvatlaydi.",
      ru: "Dr. Frei Kids — шипучие мультивитамины для детей с 7 лет: 12 витаминов (A, B1, B2, B3, B5, B6, B9, B12, C, D3, E, H) и кальций. Одна таблетка — стакан (200 мл) вкусного ягодного напитка; глотать таблетки не нужно. Кальций + D3 — кости и зубы, C — иммунитет, группа B — внимание и память.",
    },
    highlights: {
      uz: ["12 vitamin + Kalsiy", "7+ yoshdan", "Tabletka yutish shart emas", "200 ml suvga 1 tabletka", "Mevali ta'm"],
      ru: ["12 витаминов + Кальций", "С 7+ лет", "Без глотания таблеток", "1 таблетка на 200 мл воды", "Ягодный вкус"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Kalsiy + D3", description: "Kalsiy 200 mg va D3 2,3 mkg — mustahkam suyaklar va tishlar uchun." },
        { icon: "shield", title: "Immunitet", description: "Vitamin C 60 mg va A himoyani kuchaytiradi." },
        { icon: "sparkle", title: "Diqqat va xotira", description: "B guruhi vitaminlari maktab yuklamasida qo'llab-quvvatlaydi." },
      ],
      ru: [
        { icon: "bolt", title: "Кальций + D3", description: "Кальций 200 мг и D3 2,3 мкг — крепкие кости и зубы." },
        { icon: "shield", title: "Иммунитет", description: "Витамин C 60 мг и A укрепляют защиту." },
        { icon: "sparkle", title: "Внимание и память", description: "Витамины группы B поддерживают при школьных нагрузках." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Kalsiy (karbonat)", amount: "200 mg", dailyValue: "25%" },
        { name: "Vitamin C", amount: "60 mg", dailyValue: "75%" },
        { name: "Vitamin B3 (niatsinamid)", amount: "14,5 mg", dailyValue: "91%" },
        { name: "Vitamin B5", amount: "9 mg", dailyValue: "150%" },
        { name: "Vitamin B2", amount: "2 mg", dailyValue: "143%" },
        { name: "Vitamin B1", amount: "1,25 mg", dailyValue: "114%" },
        { name: "Vitamin B6", amount: "1,2 mg", dailyValue: "86%" },
        { name: "Vitamin B9 (folat)", amount: "200 mkg", dailyValue: "100%" },
        { name: "Vitamin H (biotin)", amount: "70 mkg", dailyValue: "140%" },
        { name: "Vitamin E", amount: "6,7 mg", dailyValue: "56%" },
        { name: "Vitamin A", amount: "270 mkg", dailyValue: "34%" },
        { name: "Vitamin D3", amount: "2,3 mkg", dailyValue: "46%" },
      ],
      ru: [
        { name: "Кальций (карбонат)", amount: "200 мг", dailyValue: "25%" },
        { name: "Витамин C", amount: "60 мг", dailyValue: "75%" },
        { name: "Витамин B3 (никотинамид)", amount: "14,5 мг", dailyValue: "91%" },
        { name: "Витамин B5", amount: "9 мг", dailyValue: "150%" },
        { name: "Витамин B2", amount: "2 мг", dailyValue: "143%" },
        { name: "Витамин B1", amount: "1,25 мг", dailyValue: "114%" },
        { name: "Витамин B6", amount: "1,2 мг", dailyValue: "86%" },
        { name: "Витамин B9 (фолат)", amount: "200 мкг", dailyValue: "100%" },
        { name: "Витамин H (биотин)", amount: "70 мкг", dailyValue: "140%" },
        { name: "Витамин E", amount: "6,7 мг", dailyValue: "56%" },
        { name: "Витамин A", amount: "270 мкг", dailyValue: "34%" },
        { name: "Витамин D3", amount: "2,3 мкг", dailyValue: "46%" },
      ],
    },
    howToUse: {
      uz: "1 tabletkani 200 ml suvda eriting. Kuniga 1 marta, ovqatdan keyin iching. 7+ yoshdan.",
      ru: "Растворите 1 таблетку в 200 мл воды. Пейте 1 раз в день после еды. С 7+ лет.",
    },
    faq: {
      uz: [
        { question: "7 yoshdan kichiklarga mosmi?", answer: "Yo'q, 7 yoshdan kichik bolalar uchun shifokor tavsiyasi kerak." },
        { question: "Ta'mi bormi?", answer: "Ha, meyvali ta'm bor — bolalar yaxshi ko'radi." },
      ],
      ru: [
        { question: "Подходит ли детям до 7 лет?", answer: "Нет, для детей до 7 лет требуется рекомендация врача." },
        { question: "Есть ли вкус?", answer: "Да, фруктовый вкус — дети любят." },
      ],
    },
    reviews: {
      uz: [
        { author: "Manzura B.", rating: 5, date: "2026-05-01", text: "Farzandim maktabda kam kasal bo'ldi, rahmat!" },
        { author: "Odil S.", rating: 5, date: "2026-04-15", text: "Narxi juda qulay, sifati zo'r. Har oyda olamiz." },
      ],
      ru: [
        { author: "Манзура Б.", rating: 5, date: "2026-05-01", text: "Ребёнок стал реже болеть в школе, спасибо!" },
        { author: "Одил С.", rating: 5, date: "2026-04-15", text: "Цена очень доступная, качество отличное. Берём каждый месяц." },
      ],
    },
  },

  // ─── Swiss Energy Vitamin C ────────────────────────────────────────────────
  {
    id: "p-vitamin-c",
    slug: "swiss-energy-vitamin-c-20",
    categoryId: "cat-effervescent",
    categorySlug: "effervescent",
    price: 107000,
    rating: 4.9,
    reviewCount: 140,
    inStock: true,
    imageSeeds: ["vitc-a", "vitc-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "20 tabletka", ru: "20 таблеток" },
    badges: { uz: ["Bestseller", "Apelsin ta'mi"], ru: ["Хит продаж", "Вкус апельсина"] },
    name: { uz: "Swiss Energy Vitamin C 550mg 20", ru: "Swiss Energy Витамин C 550мг 20" },
    tagline: {
      uz: "Vitamin C 550 mg — 20 shipuchi tabletka, apelsin ta'mi",
      ru: "Витамин C 550 мг — 20 шипучих таблеток, вкус апельсина",
    },
    description: {
      uz: "Dr. Frei / Swiss Energy Vitamin C 550 mg — shipuchi tabletka. Qadoq: energiya va immunitet, jismoniy va aqliy faollik, apelsin ta'mi. 20 tabletka. Kuniga 1 marta, ovqat paytida yoki darhol keyin.",
      ru: "Dr. Frei / Swiss Energy Витамин C 550 mg — шипучие таблетки. На баннере: энергия и иммунитет, физическая и умственная активность, вкус апельсина. 20 таблеток. 1 раз в день во время или сразу после еды.",
    },
    highlights: {
      uz: ["550 mg vitamin C", "Apelsin ta'mi", "Energiya va immunitet", "20 tabletka"],
      ru: ["550 мг витамина C", "Вкус апельсина", "Энергия и иммунитет", "20 таблеток"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Kuchli immunitet", description: "Yuqori doza vitamin C immun tizimni faollashtiradi." },
        { icon: "bolt", title: "Energiya va faollik", description: "Jismoniy charchashga qarshi samarali." },
        { icon: "sparkle", title: "Antioksidant", description: "Hujayralarni erkin radikallardan himoya qiladi." },
      ],
      ru: [
        { icon: "shield", title: "Крепкий иммунитет", description: "Высокая доза витамина C активирует иммунную систему." },
        { icon: "bolt", title: "Энергия и активность", description: "Эффективен против физической усталости." },
        { icon: "sparkle", title: "Антиоксидант", description: "Защищает клетки от свободных радикалов." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Vitamin C (askorbat kislota)", amount: "550 mg", dailyValue: "688%" },
      ],
      ru: [
        { name: "Витамин C (аскорбиновая кислота)", amount: "550 мг", dailyValue: "688%" },
      ],
    },
    howToUse: {
      uz: "1 tabletkani suvda eriting. Kuniga 1 marta, ovqat paytida yoki darhol keyin.",
      ru: "Растворите 1 таблетку в воде. 1 раз в день, во время или сразу после еды.",
    },
    faq: {
      uz: [
        { question: "550 mg ko'pmi?", answer: "Yo'q, bu normal terapevtik doza — shamollash va faollik uchun tavsiya etiladi." },
        { question: "Har kuni ichsa bo'ladimi?", answer: "Ha, kunlik qabul uchun xavfsiz." },
      ],
      ru: [
        { question: "550 мг — это много?", answer: "Нет, это обычная терапевтическая доза — рекомендуется при простуде и активности." },
        { question: "Можно принимать каждый день?", answer: "Да, безопасно для ежедневного приёма." },
      ],
    },
    reviews: {
      uz: [
        { author: "Kamola U.", rating: 5, date: "2026-05-08", text: "Shamollash mavsumida ichaman, juda foydali." },
        { author: "Akbar M.", rating: 5, date: "2026-04-30", text: "Apelsin ta'mi juda yoqimli, bolam ham yoqtiradi." },
      ],
      ru: [
        { author: "Камола У.", rating: 5, date: "2026-05-08", text: "Принимаю в сезон простуд, очень помогает." },
        { author: "Акбар М.", rating: 5, date: "2026-04-30", text: "Вкус апельсина очень приятный, ребёнку тоже нравится." },
      ],
    },
  },

  // ─── Dr. Frei Antistress ──────────────────────────────────────────────────
  {
    id: "p-antistress",
    slug: "dr-frei-antistress-magniy-20",
    categoryId: "cat-minerals",
    categorySlug: "minerals",
    price: 73500,
    oldPrice: 127000,
    rating: 4.9,
    reviewCount: 208,
    inStock: true,
    imageSeeds: ["antistress-a", "antistress-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "20 tabletka", ru: "20 таблеток" },
    badges: { uz: ["Aksiya", "Arzon narx kafolati"], ru: ["Акция", "Гарантия низкой цены"] },
    name: { uz: "Dr. Frei Antistress Magniy B6 20", ru: "Dr. Frei Антистресс Магний B6 20" },
    tagline: {
      uz: "Stressga qarshi vitaminlar — magniy B6, taurin, vitamin C va K",
      ru: "Витамины от стресса — магний B6, таурин, витамин C и K",
    },
    description: {
      uz: "Dr. Frei Antistress — magniy, B6 vitamini, taurin, vitamin C va K bilan boyitilgan shipuchi tabletkalar. Stress, charchoq va ta'sirlanishni kamaytiradi. 20 tabletka.",
      ru: "Dr. Frei Антистресс — шипучие таблетки с магнием, витамином B6, таурином, витамином C и K. Снижает стресс, усталость и раздражительность. 20 таблеток.",
    },
    highlights: {
      uz: ["Magniy + B6", "Taurin", "Vitamin C + K", "20 shipuchi tabletka"],
      ru: ["Магний + B6", "Таурин", "Витамин C + K", "20 шипучих таблеток"],
    },
    benefits: {
      uz: [
        { icon: "moon", title: "Stressni kamaytirish", description: "Magniy va taurin asab tizimini tinchlantiradi." },
        { icon: "bolt", title: "Energiya", description: "Charchoq va ta'sirlanishni kamaytiradi." },
        { icon: "shield", title: "Asab tizimi", description: "B6 vitamini miya faoliyatini qo'llab-quvvatlaydi." },
      ],
      ru: [
        { icon: "moon", title: "Снижение стресса", description: "Магний и таурин успокаивают нервную систему." },
        { icon: "bolt", title: "Энергия", description: "Снижает усталость и раздражительность." },
        { icon: "shield", title: "Нервная система", description: "Витамин B6 поддерживает работу мозга." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Magniy", amount: "100 mg", dailyValue: "27%" },
        { name: "Vitamin B6", amount: "2 mg", dailyValue: "143%" },
        { name: "Taurin", amount: "100 mg" },
        { name: "Vitamin C", amount: "80 mg", dailyValue: "100%" },
        { name: "Vitamin K", amount: "30 mkg", dailyValue: "40%" },
      ],
      ru: [
        { name: "Магний", amount: "100 мг", dailyValue: "27%" },
        { name: "Витамин B6", amount: "2 мг", dailyValue: "143%" },
        { name: "Таурин", amount: "100 мг" },
        { name: "Витамин C", amount: "80 мг", dailyValue: "100%" },
        { name: "Витамин K", amount: "30 мкг", dailyValue: "40%" },
      ],
    },
    howToUse: {
      uz: "1 tabletkani 200 ml suvda eriting. Kechqurun ovqatdan keyin iching.",
      ru: "Растворите 1 таблетку в 200 мл воды. Принимайте вечером после еды.",
    },
    faq: {
      uz: [
        { question: "Uyquga yordami bormi?", answer: "Ha, magniy uyquni yaxshilashga yordam beradi, kechqurun qabul qilish tavsiya etiladi." },
        { question: "Har kuni ichsa bo'ladimi?", answer: "Ha, kunlik qabul uchun mo'ljallangan." },
      ],
      ru: [
        { question: "Помогает ли со сном?", answer: "Да, магний помогает улучшить сон, рекомендуется вечерний приём." },
        { question: "Можно принимать каждый день?", answer: "Да, предназначен для ежедневного приёма." },
      ],
    },
    reviews: {
      uz: [
        { author: "Dilnoza R.", rating: 5, date: "2026-05-25", text: "Ish stressi kamaygandek — uyqum ham yaxshilandi." },
        { author: "Sanjar O.", rating: 5, date: "2026-05-10", text: "Eng ko'p sotib oladigan mahsulotim, juda foydali." },
      ],
      ru: [
        { author: "Дилноза Р.", rating: 5, date: "2026-05-25", text: "Рабочий стресс стал меньше — и сон улучшился." },
        { author: "Санжар О.", rating: 5, date: "2026-05-10", text: "Мой самый часто покупаемый продукт, очень полезно." },
      ],
    },
  },

  // ─── New catalogue entries from real photo packs ─────────────────────────
  {
    id: "p-calcivit",
    slug: "swiss-energy-calcivit-30",
    categoryId: "cat-minerals",
    categorySlug: "minerals",
    price: 255150,
    rating: 4.8,
    reviewCount: 24,
    inStock: true,
    imageSeeds: ["calcivit-a"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "30 kapsula", ru: "30 капсул" },
    badges: { uz: ["Kalsiy + D3 + K2", "Sustained release"], ru: ["Кальций + D3 + K2", "Sustained release"] },
    name: { uz: "Swiss Energy Calcivit 30", ru: "Swiss Energy Calcivit 30" },
    searchAliases: { uz: ["kalsivit", "kalsiy"], ru: ["кальцивит", "кальций"] },
    tagline: {
      uz: "Kalsiy + D3 + K2 + Zn, B, Cu, Mn — 30 kapsula",
      ru: "Кальций + D3 + K2 + Zn, B, Cu, Mn — 30 капсул",
    },
    description: {
      uz: "Swiss Energy Calcivit by Dr.Frei — 30 kapsula, sekin chiqarilish. Etiketka: Calcium + D3 + K2 + Zn + B + Cu + Mn, «strong bones and teeth». Qadoq: suyak, tish va mushaklar; bo'g'im va xaftaga to'qimasi (reklama).",
      ru: "Swiss Energy Calcivit by Dr.Frei — 30 капсул, sustained release. Этикетка: Calcium + D3 + K2 + Zn + B + Cu + Mn, «strong bones and teeth». На баннере: кости, зубы, мышцы, суставы и хрящ.",
    },
    highlights: {
      uz: ["30 kapsula", "Kalsiy + D3 + K2", "Zn + B + Cu + Mn", "Sustained release"],
      ru: ["30 капсул", "Кальций + D3 + K2", "Zn + B + Cu + Mn", "Sustained release"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Suyak va tish", description: "Qadoq: mustahkam suyaklar va sog'lom tishlar." },
        { icon: "sparkle", title: "D3 + K2", description: "Kompleks vitamin D3 va K2 bilan." },
        { icon: "heart", title: "Bo'g'imlar", description: "Reklama: bo'g'im va xaftaga to'qimasi." },
      ],
      ru: [
        { icon: "shield", title: "Кости и зубы", description: "На упаковке: крепкие кости и здоровые зубы." },
        { icon: "sparkle", title: "D3 + K2", description: "Комплекс с витаминами D3 и K2." },
        { icon: "heart", title: "Суставы", description: "На баннере: суставы и хрящевая ткань." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Kalsiy", amount: "Calcivit" },
        { name: "Vitamin D3", amount: "etiketka" },
        { name: "Vitamin K2", amount: "etiketka" },
        { name: "Sink (Zn)", amount: "etiketka" },
        { name: "B guruhi", amount: "etiketka" },
        { name: "Mis (Cu)", amount: "etiketka" },
        { name: "Marganets (Mn)", amount: "etiketka" },
      ],
      ru: [
        { name: "Кальций", amount: "Calcivit" },
        { name: "Витамин D3", amount: "на этикетке" },
        { name: "Витамин K2", amount: "на этикетке" },
        { name: "Цинк (Zn)", amount: "на этикетке" },
        { name: "Витамины B", amount: "на этикетке" },
        { name: "Медь (Cu)", amount: "на этикетке" },
        { name: "Марганец (Mn)", amount: "на этикетке" },
      ],
    },
    howToUse: {
      uz: "Bankadagi ko'rsatma bo'yicha. Sekin chiqariladigan kapsula, 30 kunlik hajm.",
      ru: "По инструкции на банке. Капсулы замедленного высвобождения, упаковка на 30 дней.",
    },
    faq: {
      uz: [
        { question: "Nechta kapsula?", answer: "30 kapsula." },
        { question: "Nima kiradi?", answer: "Kalsiy, D3, K2, Zn, B, Cu, Mn — etiketkada." },
      ],
      ru: [
        { question: "Сколько капсул?", answer: "30 капсул." },
        { question: "Что в составе?", answer: "Кальций, D3, K2, Zn, B, Cu, Mn — на этикетке." },
      ],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-neuroforce",
    slug: "swiss-energy-neuroforce-30",
    categoryId: "cat-vitamins",
    categorySlug: "vitamins",
    price: 255150,
    rating: 4.7,
    reviewCount: 18,
    inStock: true,
    imageSeeds: ["neuroforce-a"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "30 kapsula", ru: "30 капсул" },
    badges: { uz: ["B-kompleks", "Sustained release"], ru: ["B-комплекс", "Sustained release"] },
    name: { uz: "Swiss Energy NeuroForce 30", ru: "Swiss Energy NeuroForce 30" },
    searchAliases: { uz: ["neyrofors"], ru: ["нейрофорс"] },
    tagline: {
      uz: "B1+B2+B3+B5+B6+B7+B9+B12 — asab tizimi, 30 kapsula",
      ru: "B1+B2+B3+B5+B6+B7+B9+B12 — нервная система, 30 капсул",
    },
    description: {
      uz: "Swiss Energy NeuroForce by Dr.Frei — Vitamin B-Complex, 30 kapsula, sekin chiqarilish, «for healthy nervous system». Reklama: charchoq va asabiy taranglik, tinchlik, diqqat, stressni yengish, B yetishmovchiligida tavsiya.",
      ru: "Swiss Energy NeuroForce by Dr.Frei — Vitamin B-Complex, 30 капсул, sustained release, «for healthy nervous system». На баннере: нервная система, концентрация, ясность мышления, стресс, дефицит витаминов B.",
    },
    highlights: {
      uz: ["B1–B12", "30 kapsula", "Asab tizimi", "Sustained release"],
      ru: ["B1–B12", "30 капсул", "Нервная система", "Sustained release"],
    },
    benefits: {
      uz: [
        { icon: "moon", title: "Asab tizimi", description: "Qadoq: sog'lom asab tizimi uchun." },
        { icon: "bolt", title: "Diqqat", description: "Reklama: konsentratsiya va diqqat." },
        { icon: "shield", title: "B-kompleks", description: "Sakkizta B vitamini bir kapsulada." },
      ],
      ru: [
        { icon: "moon", title: "Нервная система", description: "На этикетке: for healthy nervous system." },
        { icon: "bolt", title: "Концентрация", description: "На баннере: внимание и ясность мышления." },
        { icon: "shield", title: "B-комплекс", description: "Восемь витаминов группы B." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Vitamin B1", amount: "B-kompleks" },
        { name: "Vitamin B2", amount: "B-kompleks" },
        { name: "Vitamin B3", amount: "B-kompleks" },
        { name: "Vitamin B5", amount: "B-kompleks" },
        { name: "Vitamin B6", amount: "B-kompleks" },
        { name: "Vitamin B7", amount: "B-kompleks" },
        { name: "Vitamin B9", amount: "B-kompleks" },
        { name: "Vitamin B12", amount: "B-kompleks" },
      ],
      ru: [
        { name: "Витамин B1", amount: "B-комплекс" },
        { name: "Витамин B2", amount: "B-комплекс" },
        { name: "Витамин B3", amount: "B-комплекс" },
        { name: "Витамин B5", amount: "B-комплекс" },
        { name: "Витамин B6", amount: "B-комплекс" },
        { name: "Витамин B7", amount: "B-комплекс" },
        { name: "Витамин B9", amount: "B-комплекс" },
        { name: "Витамин B12", amount: "B-комплекс" },
      ],
    },
    howToUse: {
      uz: "Bankadagi ko'rsatma bo'yicha. 30 kapsula — odatda bir oylik kurs hajmi.",
      ru: "По инструкции на банке. 30 капсул — обычно курс на месяц.",
    },
    faq: {
      uz: [
        { question: "Qaysi vitaminlar?", answer: "B1, B2, B3, B5, B6, B7, B9, B12 — etiketkada." },
        { question: "Nechta kapsula?", answer: "30 kapsula." },
      ],
      ru: [
        { question: "Какие витамины?", answer: "B1, B2, B3, B5, B6, B7, B9, B12 — на этикетке." },
        { question: "Сколько капсул?", answer: "30 капсул." },
      ],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-potenton",
    slug: "swiss-energy-potenton-30",
    categoryId: "cat-vitamins",
    categorySlug: "vitamins",
    price: 255150,
    rating: 4.6,
    reviewCount: 12,
    inStock: true,
    imageSeeds: ["potenton-a"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "30 kapsula", ru: "30 капсул" },
    badges: { uz: ["Erkaklar", "Long effect"], ru: ["Для мужчин", "Long effect"] },
    name: { uz: "Swiss Energy Potenton 30", ru: "Swiss Energy Potenton 30" },
    searchAliases: { uz: ["potenton"], ru: ["потентон"] },
    tagline: {
      uz: "Potenton Happy man — kuniga 1 kapsula, 30 kunlik kurs",
      ru: "Potenton Happy man — 1 капсула в день, курс 30 дней",
    },
    description: {
      uz: "Swiss Energy Potenton Happy man — Made in Switzerland, 30 kapsula, sekin chiqarilish, Long effect. Qadoq: Sexual stimulant / jinsiy stimulyator. Reklama sxemasi: kuniga 1 kapsula, kurs 30 kun, to'planib boruvchi ta'sir; testosteron, ereksiya va libido (reklama matni).",
      ru: "Swiss Energy Potenton Happy man — Made in Switzerland, 30 капсул, sustained release, Long effect. На упаковке: Sexual stimulant. Схема на баннере: 1 капсула в день, курс 30 дней, накопительный эффект; тестостерон, эрекция и либидо (реклама).",
    },
    highlights: {
      uz: ["30 kapsula", "Kuniga 1 dona", "Kurs 30 kun", "Made in Switzerland"],
      ru: ["30 капсул", "1 капсула в день", "Курс 30 дней", "Made in Switzerland"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Long effect", description: "Qadoq: uzoq / to'planib boruvchi ta'sir." },
        { icon: "heart", title: "Kurs", description: "Reklama: 30 kun, kuniga 1 kapsula." },
      ],
      ru: [
        { icon: "bolt", title: "Long effect", description: "На упаковке: длительный / накопительный эффект." },
        { icon: "heart", title: "Курс", description: "На баннере: 30 дней, 1 капсула в сутки." },
      ],
    },
    ingredients: {
      uz: [{ name: "Potenton kompleksi (sekin chiqarilish)", amount: "30 kapsula" }],
      ru: [{ name: "Комплекс Potenton (sustained release)", amount: "30 капсул" }],
    },
    howToUse: {
      uz: "Reklama: kuniga 1 kapsula, 30 kun. Aniq vaqtni qadoq va shifokor bilan solishtiring.",
      ru: "Баннер: 1 капсула в день, 30 дней. Сверьте время приёма с упаковкой и врачом.",
    },
    faq: {
      uz: [
        { question: "Qayerda ishlab chiqarilgan?", answer: "Qadoqda: Made in Switzerland." },
        { question: "Necha kun?", answer: "Reklama: 30 kunlik kurs, 30 kapsula." },
      ],
      ru: [
        { question: "Где произведён?", answer: "На упаковке: Made in Switzerland." },
        { question: "Сколько дней?", answer: "На баннере: курс 30 дней, 30 капсул." },
      ],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-prenatal",
    slug: "swiss-energy-prenatal-forte-60",
    categoryId: "cat-vitamins",
    categorySlug: "vitamins",
    price: 369000,
    rating: 4.8,
    reviewCount: 31,
    inStock: true,
    imageSeeds: ["prenatal-a"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "60 kapsula", ru: "60 капсул" },
    badges: { uz: ["Homiladorlik", "Folat 400 mkg"], ru: ["Беременность", "Фолат 400 мкг"] },
    name: { uz: "Swiss Energy Prenatal Forte 60", ru: "Swiss Energy Prenatal Forte 60" },
    searchAliases: { uz: ["prenatal", "homiladorlar uchun"], ru: ["пренатал", "пренаталь", "для беременных"] },
    tagline: {
      uz: "20 vitamin va mineral — folat 400 mkg, temir 14 mg, 60 kapsula",
      ru: "20 витаминов и минералов — фолат 400 мкг, железо 14 мг, 60 капсул",
    },
    description: {
      uz: "Swiss Energy Prenatal Forte, Platinum, Made in Switzerland. Etiketka: 20 Vitamins and Minerals, Folat 400 mcg, Iron 14 mg, 60 kapsula, sekin chiqarilish, «Support of healthy pregnancy». Qutida: A, B1, B9, B12, C, D2, K2, Se, F.",
      ru: "Swiss Energy Prenatal Forte, Platinum, Made in Switzerland. Этикетка: 20 Vitamins and Minerals, Folat 400 mcg, Iron 14 mg, 60 капсул, sustained release, «Support of healthy pregnancy». На коробке: A, B1, B9, B12, C, D2, K2, Se, F.",
    },
    highlights: {
      uz: ["60 kapsula", "20 vitamin va mineral", "Folat 400 mkg", "Temir 14 mg"],
      ru: ["60 капсул", "20 витаминов и минералов", "Фолат 400 мкг", "Железо 14 мг"],
    },
    benefits: {
      uz: [
        { icon: "heart", title: "Folat 400 mkg", description: "Etiketkada aniq doza." },
        { icon: "bolt", title: "Temir 14 mg", description: "Etiketka: Iron 14 mg." },
        { icon: "shield", title: "20 ta komponent", description: "Vitamin va minerallar majmuasi." },
      ],
      ru: [
        { icon: "heart", title: "Фолат 400 мкг", description: "Доза указана на этикетке." },
        { icon: "bolt", title: "Железо 14 мг", description: "На этикетке: Iron 14 mg." },
        { icon: "shield", title: "20 компонентов", description: "Комплекс витаминов и минералов." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Folat", amount: "400 mkg" },
        { name: "Temir", amount: "14 mg" },
        { name: "Vitamin A, C, D2, K2", amount: "qutida" },
        { name: "B1, B9, B12", amount: "qutida" },
        { name: "Selen (Se), Ftor (F)", amount: "qutida" },
        { name: "Jami", amount: "20 vitamin va mineral" },
      ],
      ru: [
        { name: "Фолат", amount: "400 мкг" },
        { name: "Железо", amount: "14 мг" },
        { name: "Витамины A, C, D2, K2", amount: "на коробке" },
        { name: "B1, B9, B12", amount: "на коробке" },
        { name: "Селен (Se), фтор (F)", amount: "на коробке" },
        { name: "Всего", amount: "20 витаминов и минералов" },
      ],
    },
    howToUse: {
      uz: "Qadoq va shifokor ko'rsatmasi bo'yicha. 60 kapsula — kuniga 1 donada taxminan 2 oy.",
      ru: "По инструкции на упаковке и рекомендации врача. 60 капсул — около 2 месяцев при 1 капсуле в день.",
    },
    faq: {
      uz: [
        { question: "Folat qancha?", answer: "400 mkg — etiketkada." },
        { question: "Temir?", answer: "14 mg." },
      ],
      ru: [
        { question: "Сколько фолата?", answer: "400 мкг — на этикетке." },
        { question: "Железо?", answer: "14 мг." },
      ],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-aminomorin",
    slug: "aminomorin-forte-30",
    categoryId: "cat-vitamins",
    categorySlug: "vitamins",
    price: 189000,
    rating: 4.5,
    reviewCount: 8,
    inStock: true,
    imageSeeds: ["aminomorin-a"],
    bespoke: true,
    origin: { uz: "Yaponiya texnologiyasi", ru: "Технология Японии" },
    servings: { uz: "30 kapsula", ru: "30 капсул" },
    badges: { uz: ["Aminokislotalar + vitaminlar"], ru: ["Аминокислоты + витамины"] },
    name: { uz: "Aminomorin Forte 30", ru: "Аминоморин Форте 30" },
    tagline: {
      uz: "Aminokislota kompleksi vitaminlar bilan — 30 kapsula",
      ru: "Аминокислотный комплекс с витаминами — 30 капсул",
    },
    description: {
      uz: "Aminomorin Forte — 30 kapsula. Qadoq: aminokislota kompleksi vitaminlar bilan. Ishlab chiqarish: Shenjjen Vanxe. Texnologiya: Morishita Pharmaceutical (Osaka, Yaponiya). Huquq egasi: Evrofarm (AQSH). Shtrix-kod: 6941472701894.",
      ru: "Аминоморин Форте — 30 капсул. На пачке: аминокислотный комплекс с витаминами. Производитель: Шэньчжэнь Ваньхэ. Технология: Моришита (Осака, Япония). Правообладатель: Еврофарм (США). Штрихкод: 6941472701894.",
    },
    highlights: {
      uz: ["30 kapsula", "Aminokislotalar + vitaminlar", "Morishita", "Osaka"],
      ru: ["30 капсул", "Аминокислоты + витамины", "Моришита", "Осака"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Kompleks", description: "Aminokislotalar va vitaminlar bir qutida." },
        { icon: "shield", title: "Yaponiya texnologiyasi", description: "Morishita Pharmaceutical, Osaka." },
      ],
      ru: [
        { icon: "bolt", title: "Комплекс", description: "Аминокислоты с витаминами." },
        { icon: "shield", title: "Технология Японии", description: "Моришита Фармасьютикал, Осака." },
      ],
    },
    ingredients: {
      uz: [{ name: "Aminokislota + vitamin kompleksi", amount: "30 kapsula" }],
      ru: [{ name: "Аминокислотный комплекс с витаминами", amount: "30 капсул" }],
    },
    howToUse: {
      uz: "Ichki varaqa va qadoqdagi ko'rsatma bo'yicha.",
      ru: "По вкладышу и инструкции на упаковке.",
    },
    faq: {
      uz: [
        { question: "Nechta kapsula?", answer: "30 kapsula." },
        { question: "Qayerdan texnologiya?", answer: "Morishita, Osaka — qadoqda." },
      ],
      ru: [
        { question: "Сколько капсул?", answer: "30 капсул." },
        { question: "Чья технология?", answer: "Моришита, Осака — на пачке." },
      ],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-collagen-nature",
    slug: "swiss-energy-nature-collagen",
    categoryId: "cat-collagen",
    categorySlug: "collagen",
    price: 289000,
    rating: 4.7,
    reviewCount: 16,
    inStock: true,
    imageSeeds: ["collagen-nature-a"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "Kukun, banka", ru: "Порошок, банка" },
    badges: { uz: ["100% kollagen", "Shakarsiz"], ru: ["100% коллаген", "Без сахара"] },
    name: { uz: "Swiss Energy Nature Collagen", ru: "Swiss Energy Nature Collagen" },
    searchAliases: { uz: ["kollagen"], ru: ["коллаген"] },
    tagline: {
      uz: "Premium Formula — 100% sof kollagen, neytral ta'm, shakarsiz",
      ru: "Premium Formula — 100% чистый коллаген, нейтральный вкус, без сахара",
    },
    description: {
      uz: "Swiss Energy Nature Collagen by Dr.Frei, Made in Switzerland. Etiketka: Premium Formula, 100% Pure Collagen, Sugar free, Mix into any drink, Neutral taste. Qadoqda: teri, soch, tirnoq, suyak va bo'g'imlar.",
      ru: "Swiss Energy Nature Collagen by Dr.Frei, Made in Switzerland. Этикетка: Premium Formula, 100% Pure Collagen, Sugar free, Mix into any drink, Neutral taste. На банке: кожа, волосы, ногти, кости и суставы.",
    },
    highlights: {
      uz: ["100% sof kollagen", "Shakarsiz", "Neytral ta'm", "Istalgan ichimlikka"],
      ru: ["100% чистый коллаген", "Без сахара", "Нейтральный вкус", "В любой напиток"],
    },
    benefits: {
      uz: [
        { icon: "sparkle", title: "Har qanday ichimlik", description: "Etiketka: mix into any drink." },
        { icon: "shield", title: "Shakarsiz", description: "Sugar free." },
        { icon: "heart", title: "Neytral ta'm", description: "Neutral taste." },
      ],
      ru: [
        { icon: "sparkle", title: "Любой напиток", description: "На этикетке: mix into any drink." },
        { icon: "shield", title: "Без сахара", description: "Sugar free." },
        { icon: "heart", title: "Нейтральный вкус", description: "Neutral taste." },
      ],
    },
    ingredients: {
      uz: [{ name: "Sof kollagen", amount: "100%" }],
      ru: [{ name: "Чистый коллаген", amount: "100%" }],
    },
    howToUse: {
      uz: "Istalgan ichimlikka aralashtiring. Neytral ta'm, shakarsiz.",
      ru: "Смешайте с любым напитком. Нейтральный вкус, без сахара.",
    },
    faq: {
      uz: [
        { question: "Shakar bormi?", answer: "Yo'q — sugar free." },
        { question: "Qayerda ishlab chiqarilgan?", answer: "Made in Switzerland." },
      ],
      ru: [
        { question: "Есть сахар?", answer: "Нет — sugar free." },
        { question: "Где произведён?", answer: "Made in Switzerland." },
      ],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-coffee-mokka-500",
    slug: "swiss-energy-coffee-mokka-500g",
    categoryId: "cat-coffee",
    categorySlug: "coffee",
    price: 315000,
    rating: 4.6,
    reviewCount: 7,
    inStock: true,
    imageSeeds: ["coffee-mokka-a"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "500 g", ru: "500 г" },
    badges: { uz: ["80% arabika", "20% robusta"], ru: ["80% арабика", "20% робуста"] },
    name: { uz: "Swiss Energy Coffee Mokka 500 g", ru: "Swiss Energy Coffee Mokka 500 г" },
    searchAliases: { uz: ["qahva mokka", "mokka qahva"], ru: ["кофе мокка", "мокка", "кофе"] },
    tagline: {
      uz: "Mokka — 500 g, 80% arabika + 20% robusta, St. Gallen",
      ru: "Mokka — 500 г, 80% арабика + 20% робуста, St. Gallen",
    },
    description: {
      uz: "Swiss Energy Coffee Mokka by TURM. Qop: St. Gallen, Switzerland, Since 1761, 500 g e, 80% Arabica / 20% Robusta, Anniversary 260 years.",
      ru: "Swiss Energy Coffee Mokka by TURM. На пакете: St. Gallen, Switzerland, Since 1761, 500 g e, 80% Arabica / 20% Robusta, Anniversary 260 years.",
    },
    highlights: {
      uz: ["500 g", "80% arabika", "20% robusta", "Since 1761"],
      ru: ["500 г", "80% арабика", "20% робуста", "Since 1761"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Kuchliroq aralashma", description: "20% robusta qopda yozilgan." },
        { icon: "sparkle", title: "St. Gallen", description: "Shveytsariya, 1761-yildan." },
      ],
      ru: [
        { icon: "bolt", title: "Крепче смесь", description: "20% робусты указано на пакете." },
        { icon: "sparkle", title: "St. Gallen", description: "Швейцария, с 1761 года." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Arabika", amount: "80%" },
        { name: "Robusta", amount: "20%" },
      ],
      ru: [
        { name: "Арабика", amount: "80%" },
        { name: "Робуста", amount: "20%" },
      ],
    },
    howToUse: {
      uz: "1 choy qoshiqni 200 ml qaynoq suvda damlang. Ta'mga qarab sozlang.",
      ru: "Заварите 1 чайную ложку в 200 мл горячей воды. Количество — по вкусу.",
    },
    faq: {
      uz: [{ question: "Edel dan farqi?", answer: "Mokka — 80/20. Edel — 100% arabika." }],
      ru: [{ question: "Чем отличается от Edel?", answer: "Mokka — 80/20. Edel — 100% арабика." }],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-thermo-t10",
    slug: "dr-frei-thermometer-t10",
    categoryId: "cat-devices",
    categorySlug: "devices",
    price: 89000,
    rating: 4.7,
    reviewCount: 11,
    inStock: true,
    imageSeeds: ["t10-a"],
    bespoke: true,
    origin: { uz: "Dr. Frei", ru: "Dr. Frei" },
    servings: { uz: "1 dona", ru: "1 штука" },
    badges: { uz: ["Elektron", "°C"], ru: ["Электронный", "°C"] },
    name: { uz: "Dr. Frei Termometr T10", ru: "Dr. Frei Термометр T10" },
    tagline: {
      uz: "Elektron raqamli termometr — ON/OFF, displey °C, metall uchi",
      ru: "Электронный цифровой термометр — ON/OFF, дисплей °C, металлический наконечник",
    },
    description: {
      uz: "Dr. Frei T10 — oq korpusli elektron termometr. ON/OFF, °C displey, metall uchi. Simob yo'q.",
      ru: "Dr. Frei T10 — электронный термометр в белом корпусе. ON/OFF, дисплей °C, металлический наконечник. Без ртути.",
    },
    highlights: {
      uz: ["Raqamli °C", "ON/OFF", "Metall uchi", "Simobsiz"],
      ru: ["Цифровой °C", "ON/OFF", "Металлический наконечник", "Без ртути"],
    },
    benefits: {
      uz: [
        { icon: "sparkle", title: "Raqamli o'qish", description: "Harorat displeyda °C da." },
        { icon: "shield", title: "Simobsiz", description: "Elektron sensor." },
      ],
      ru: [
        { icon: "sparkle", title: "Цифровое чтение", description: "Температура на дисплее в °C." },
        { icon: "shield", title: "Без ртути", description: "Электронный сенсор." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Korpus", amount: "1 dona" },
        { name: "Displey", amount: "°C" },
        { name: "Uchi", amount: "metall" },
      ],
      ru: [
        { name: "Корпус", amount: "1 шт." },
        { name: "Дисплей", amount: "°C" },
        { name: "Наконечник", amount: "металл" },
      ],
    },
    howToUse: {
      uz: "ON/OFF bosing, uchini qo'ying, displeydagi raqamni o'qing.",
      ru: "Нажмите ON/OFF, приложите наконечник, считайте значение.",
    },
    faq: {
      uz: [{ question: "Simob bormi?", answer: "Yo'q, elektron model." }],
      ru: [{ question: "Есть ртуть?", answer: "Нет, электронная модель." }],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-thermo-t30",
    slug: "dr-frei-thermometer-t30",
    categoryId: "cat-devices",
    categorySlug: "devices",
    price: 99000,
    rating: 4.8,
    reviewCount: 14,
    inStock: true,
    imageSeeds: ["t30-a"],
    bespoke: true,
    origin: { uz: "Dr. Frei", ru: "Dr. Frei" },
    servings: { uz: "1 dona", ru: "1 штука" },
    badges: { uz: ["Bolalar", "Egiluvchan uchi"], ru: ["Детям", "Гибкий носик"] },
    name: { uz: "Dr. Frei Termometr T30 kids", ru: "Dr. Frei Термометр T30 kids" },
    tagline: {
      uz: "Bolalar elektron termometri — egiluvchan uchi, simobsiz",
      ru: "Детский электронный термометр — гибкий носик, без ртути",
    },
    description: {
      uz: "Dr. Frei T30 — bolalar elektron termometri. Egiluvchan uchi, ON/OFF, °C, ayiqcha qopqoq. Reklama: 99% aniqlik, simob yo'q.",
      ru: "Dr. Frei T30 — электронный термометр для детей. Гибкий носик, ON/OFF, дисплей °C, колпачок-мишка. На баннере: 99% точность, без ртути.",
    },
    highlights: {
      uz: ["Egiluvchan uchi", "Simobsiz", "Bolalar uchun", "99% (reklama)"],
      ru: ["Гибкий носик", "Без ртути", "Для детей", "99% (баннер)"],
    },
    benefits: {
      uz: [
        { icon: "sparkle", title: "Egiluvchan uchi", description: "Reklama: гибкий носик." },
        { icon: "shield", title: "Simobsiz", description: "Reklama: не содержит ртуть." },
      ],
      ru: [
        { icon: "sparkle", title: "Гибкий носик", description: "Указано на баннере." },
        { icon: "shield", title: "Без ртути", description: "На баннере: не содержит ртуть." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Elektron termometr", amount: "1 dona" },
        { name: "Uchi", amount: "egiluvchan" },
      ],
      ru: [
        { name: "Электронный термометр", amount: "1 шт." },
        { name: "Наконечник", amount: "гибкий" },
      ],
    },
    howToUse: {
      uz: "ON/OFF bosing, egiluvchan uchi bilan o'lchang, °C ni o'qing.",
      ru: "Нажмите ON/OFF, измерьте гибким наконечником, считайте °C.",
    },
    faq: {
      uz: [{ question: "Kattalar ishlatsa bo'ladimi?", answer: "Ha, lekin model bolalar uchun (egiluvchan uchi)." }],
      ru: [{ question: "Можно взрослым?", answer: "Да, но позиционируется как детская модель." }],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-cooling-plaster",
    slug: "hiew-cooling-plaster-16",
    categoryId: "cat-devices",
    categorySlug: "devices",
    price: 65000,
    rating: 4.6,
    reviewCount: 9,
    inStock: true,
    imageSeeds: ["plaster-a"],
    bespoke: true,
    origin: { uz: "Yaponiya", ru: "Япония" },
    servings: { uz: "16 dona", ru: "16 штук" },
    badges: { uz: ["16 dona", "Yaponiya", "Bolalar"], ru: ["16 шт.", "Япония", "Детям"] },
    name: { uz: "HIEW sovutuvchi plastir 16", ru: "HIEW пластырь от жара 16" },
    tagline: {
      uz: "Yapon isitma plastiri — 16 dona, 8 soat sovutish (qadoq)",
      ru: "Японский пластырь от жара — 16 шт., охлаждение 8 часов",
    },
    description: {
      uz: "HIEW (Yaponiya) isitma plastiri, bolalar uchun, 16 dona. Qadoq: teriga yumshoq, 8 soat sovutish. Reklama: 1 daqiqada sovitadi.",
      ru: "HIEW (Япония) пластырь от жара, для детей, 16 шт. На упаковке: мягкий к коже, охлаждение 8 часов. Реклама: охлаждает за 1 минуту.",
    },
    highlights: {
      uz: ["16 dona", "8 soat (qadoq)", "1 daqiqa (reklama)", "Bolalar"],
      ru: ["16 шт.", "8 часов", "1 минута (реклама)", "Детям"],
    },
    benefits: {
      uz: [
        { icon: "sparkle", title: "Tez sovutish", description: "Reklama: 1 daqiqada." },
        { icon: "moon", title: "8 soat", description: "Qadoqdagi 8 soatlik sovutish." },
      ],
      ru: [
        { icon: "sparkle", title: "Быстрое охлаждение", description: "Реклама: за 1 минуту." },
        { icon: "moon", title: "8 часов", description: "На упаковке — охлаждение 8 часов." },
      ],
    },
    ingredients: {
      uz: [{ name: "Sovutuvchi gel-plastir", amount: "16 dona" }],
      ru: [{ name: "Охлаждающий гель-пластырь", amount: "16 шт." }],
    },
    howToUse: {
      uz: "Himoya plyonkani oling, peshonaga yopishtiring. Qadoqdagi ogohlantirishlarga amal qiling.",
      ru: "Снимите защитную плёнку, наклейте на лоб. Следуйте предупреждениям на упаковке.",
    },
    faq: {
      uz: [{ question: "Nechta dona?", answer: "16 dona bir qutida." }],
      ru: [{ question: "Сколько штук?", answer: "16 штук в упаковке." }],
    },
    reviews: { uz: [], ru: [] },
  },
  {
    id: "p-turbo-lex",
    slug: "dr-frei-turbo-lex-ingalyator",
    categoryId: "cat-devices",
    categorySlug: "devices",
    price: 489000,
    rating: 4.7,
    reviewCount: 6,
    inStock: true,
    imageSeeds: ["turbolex-a"],
    bespoke: true,
    origin: { uz: "Dr. Frei", ru: "Dr. Frei" },
    servings: { uz: "1 dona", ru: "1 штука" },
    badges: { uz: ["Kompressorli", "8 ml", "Bolalar"], ru: ["Компрессорный", "8 мл", "Детям"] },
    name: { uz: "Dr. Frei Turbo Lex ingalyator", ru: "Ингалятор Dr. Frei Turbo Lex" },
    searchAliases: { uz: ["turboleks", "nebulayzer"], ru: ["турболекс", "небулайзер", "ингалятор"] },
    tagline: {
      uz: "Mashina shaklidagi kompressorli ingalyator — 8 ml, tinch ishlash",
      ru: "Компрессорный ингалятор в форме машины — 8 мл, тихая работа",
    },
    description: {
      uz: "Dr. Frei TURBO LEX — qizil poyga mashinasi korpusidagi kompressorli nebulayzer (g'ildirakda TURBO LEX, orqada I/O). Reklama: bolalar va kattalar, tinch ishlash, 8 ml rezervuar.",
      ru: "Dr. Frei TURBO LEX — компрессорный небулайзер в красном корпусе-машинке (надпись TURBO LEX на колесе, выключатель I/O). На баннере: детям и взрослым, тихая работа, 8 мл.",
    },
    highlights: {
      uz: ["Mashina korpusi", "8 ml", "Tinch ishlash", "I/O o'chirgich"],
      ru: ["Корпус-машинка", "8 мл", "Тихая работа", "Выключатель I/O"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Bolalar uchun qulay", description: "O'yinchoq mashina shakli." },
        { icon: "sparkle", title: "8 ml", description: "Reklamada rezervuar hajmi." },
        { icon: "moon", title: "Tinch", description: "Reklama: тихая работа." },
      ],
      ru: [
        { icon: "shield", title: "Удобно детям", description: "Корпус в виде машинки." },
        { icon: "sparkle", title: "8 мл", description: "Объём резервуара на баннере." },
        { icon: "moon", title: "Тихо", description: "На баннере: тихая работа." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Kompressor-mashina", amount: "1 dona" },
        { name: "Dori rezervuari", amount: "8 ml" },
      ],
      ru: [
        { name: "Компрессор-машинка", amount: "1 шт." },
        { name: "Резервуар", amount: "8 мл" },
      ],
    },
    howToUse: {
      uz: "Shifokor eritmasini soling, shlang va niqobni ulang, orqa I/O ni yoqing, tinch nafas oling.",
      ru: "Налейте раствор врача, подключите шланг и маску, включите I/O сзади, дышите.",
    },
    faq: {
      uz: [
        { question: "Bu o'yinchoqmi?", answer: "Yo'q — kompressorli ingalyator, korpusi mashina shaklida." },
        { question: "Kattalar ishlatsa bo'ladimi?", answer: "Reklamada bolalar va kattalar uchun." },
      ],
      ru: [
        { question: "Это игрушка?", answer: "Нет — компрессорный ингалятор в корпусе-машинке." },
        { question: "Можно взрослым?", answer: "На баннере: для детей и взрослых." },
      ],
    },
    reviews: { uz: [], ru: [] },
  },

];

const rawPromotions: { id: string; type: Promotion["type"]; threshold?: number; percent?: number; title: L; description: L }[] = [
  {
    id: "promo-shipping",
    type: "free_shipping_over",
    threshold: 300000,
    title: { uz: "Bepul yetkazib berish", ru: "Бесплатная доставка" },
    description: {
      uz: "300 000 so'mdan ortiq buyurtmalarga bepul yetkazib berish.",
      ru: "Бесплатная доставка при заказе от 300 000 сум.",
    },
  },
  {
    id: "promo-bonus",
    type: "buy_x_get_y",
    title: { uz: "2 oling — 3-si sovg'a", ru: "2 + 1 в подарок" },
    description: {
      uz: "Tanlangan mahsulotlarga 2 ta olsangiz 3-si sovg'a.",
      ru: "На выбранные товары: купи 2 — третий в подарок.",
    },
  },
];

function resolveCategory(c: RawCategory, locale: Locale): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name[locale],
    description: c.description[locale],
    image: c.image,
    productCount: rawProducts.filter((p) => p.categoryId === c.id).length,
  };
}

/*
  The reviews and ratings below are sample copy, so they are withheld unless
  someone explicitly turns them on. Stripping them here rather than at each
  display site means the product page, the reviews page, the star ratings,
  the sitemap's rating boost and the Product structured data all go quiet
  together — there is no surface left that could still quote a number nobody
  earned. `StarRating` already renders nothing at zero.
*/
function resolveProduct(p: RawProduct, locale: Locale): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name[locale],
    tagline: p.tagline[locale],
    description: p.description[locale],
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    price: p.price,
    oldPrice: p.oldPrice,
    currency: "UZS",
    rating: SHOW_SAMPLE_SOCIAL_PROOF ? p.rating : 0,
    reviewCount: SHOW_SAMPLE_SOCIAL_PROOF ? p.reviewCount : 0,
    inStock: p.inStock,
    /*
      A product with no photography of its own gets NO image rather than a
      recycled photo of a different product — the catalogue card then falls
      back to its plain placeholder, and the gallery simply stays away. Every
      current SKU has real shots in BRAND.productImageOverrides, so this only
      guards whatever is added next.
    */
    images: BRAND.productImageOverrides[p.slug]?.length
      ? BRAND.productImageOverrides[p.slug].map((url) => ({ url, alt: p.name[locale] }))
      : [],
    highlights: p.highlights[locale],
    benefits: p.benefits[locale],
    ingredients: p.ingredients[locale],
    howToUse: p.howToUse[locale],
    faq: p.faq[locale],
    reviews: SHOW_SAMPLE_SOCIAL_PROOF ? p.reviews[locale] : [],
    badges: p.badges[locale],
    servings: p.servings[locale],
    origin: p.origin[locale],
    certifications: ["cGMP", "ISO 22000", "Halal"],
    bespoke: p.bespoke,
  };
}

function sortProducts(items: Product[], sort?: ProductListParams["sort"]): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price_desc":
      return copy.sort((a, b) => b.price - a.price);
    case "new":
      return copy.reverse();
    case "deals":
      // Deepest cut first; discounted or not, everything stays listed.
      return copy.sort((a, b) => discountPercent(b) - discountPercent(a));
    case "popular":
    default:
      // With review counts withheld this is a no-op on a stable sort, which
      // leaves the catalogue in its curated order — the right fallback for
      // "popular" on a shop that has no sales history to rank by.
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

export class MockShopflowClient implements ShopflowClient {
  async getCategories(locale: Locale): Promise<Category[]> {
    return rawCategories.map((c) => resolveCategory(c, locale));
  }

  async getProducts(params: ProductListParams): Promise<ProductListResult> {
    const { locale, category, search, origin, minPrice, maxPrice, sort, page = 1, pageSize = 12 } = params;
    let items = rawProducts.map((p) => resolveProduct(p, locale));

    if (category) items = items.filter((p) => p.categorySlug === category);
    if (origin) items = items.filter((p) => p.origin === origin);
    if (minPrice != null) items = items.filter((p) => p.price >= minPrice);
    if (maxPrice != null) items = items.filter((p) => p.price <= maxPrice);
    if (search) {
      const q = search.toLowerCase();
      const aliasesFor = (slug: string) => {
        const raw = rawProducts.find((r) => r.slug === slug);
        return raw?.searchAliases ? Object.values(raw.searchAliases).flat() : [];
      };
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          aliasesFor(p.slug).some((alias) => alias.toLowerCase().includes(q)),
      );
    }
    items = sortProducts(items, sort);

    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  async getProduct(slug: string, locale: Locale): Promise<Product | null> {
    const raw = rawProducts.find((p) => p.slug === slug);
    return raw ? resolveProduct(raw, locale) : null;
  }

  async getUpsells(productId: string, locale: Locale): Promise<UpsellOffer[]> {
    const others = rawProducts
      .filter((p) => p.id !== productId && p.inStock)
      .slice(0, 3)
      .map((p) => resolveProduct(p, locale));
    const reasons: Record<Locale, string> = {
      uz: "Ko'pincha shu bilan birga olishadi",
      ru: "Часто покупают вместе",
    };
    return others.map((product) => ({
      product,
      discountPercent: 15,
      reason: reasons[locale],
    }));
  }

  async getPromotions(locale: Locale): Promise<Promotion[]> {
    return rawPromotions.map((p) => ({
      id: p.id,
      type: p.type,
      threshold: p.threshold,
      percent: p.percent,
      title: p.title[locale],
      description: p.description[locale],
    }));
  }

  async createOrder(payload: OrderRequest): Promise<OrderResult> {
    const orderId = `MOCK-${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== "production") {
      console.info("[shopflow:mock] order received", orderId, payload);
    }
    return {
      ok: true,
      orderId,
      message: "Order received (mock).",
    };
  }
}

export function listAllSlugs(): { slug: string }[] {
  return rawProducts.map((p) => ({ slug: p.slug }));
}

export const allLocales = locales;
