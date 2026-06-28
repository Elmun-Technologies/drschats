import type { Locale } from "@/lib/i18n/routing";
import { locales } from "@/lib/i18n/routing";
import { BRAND } from "@/lib/brand";
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

const PLACEHOLDERS = 6;
const img = (seed: string, alt: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return { url: `/placeholders/p${(h % PLACEHOLDERS) + 1}.svg`, alt };
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
  catSimple("cat-omega", "omega", "Omega va baliq yog'i", "Омега и рыбий жир"),
  catSimple("cat-collagen", "collagen", "Kollagen", "Коллаген"),
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
    name: { uz: "Swiss Energy Coffee Edel 250g", ru: "Swiss Energy Coffee Edel 250г" },
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
    name: { uz: "Swiss Energy Coffee Edel 500g", ru: "Swiss Energy Coffee Edel 500г" },
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
    name: { uz: "Swiss Energy Coffee Crema 500g", ru: "Swiss Energy Coffee Crema 500г" },
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
    name: { uz: "Swiss Energy Coffee Crema 250g", ru: "Swiss Energy Coffee Crema 250г" },
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
    name: { uz: "Dr. Frei Turbo Base Ingalyator", ru: "Dr. Frei Turbo Base Ингалятор" },
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
    name: { uz: "Peano Balzam 30g", ru: "Peano Бальзам 30г" },
    tagline: {
      uz: "Teri tiklanishi va bitishi uchun dermatologik malham",
      ru: "Дерматологическая мазь для восстановления и заживления кожи",
    },
    description: {
      uz: "Peano Balzam — teri tiklanishi va bitishi uchun mo'ljallangan dermatologik malham. Yara, quyish va teri muammolarida samarali. 30 g.",
      ru: "Peano Бальзам — дерматологическая мазь для восстановления и заживления кожи. Эффективен при ранах, ожогах и проблемах кожи. 30 г.",
    },
    highlights: {
      uz: ["Dermatologik malham", "Teri tiklanishi", "30 g", "Tez ta'sir qiladi"],
      ru: ["Дерматологическая мазь", "Восстановление кожи", "30 г", "Быстрое действие"],
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
      uz: [{ name: "Faol tarkiblar", amount: "30 g malham" }],
      ru: [{ name: "Активные компоненты", amount: "30 г мази" }],
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
      uz: "Ko'zlar uchun vitaminlar — lyutein, chernika va sink",
      ru: "Витамины для глаз — лютеин, черника и цинк",
    },
    description: {
      uz: "Swiss Energy Visiovit — ko'rish o'tkirligini qo'llab-quvvatlovchi kompleks. Lyutein, chernika ekstrakti, zeaksantin, A, E, Zn vitaminlari. Ko'zni tashqi omillardan himoya qiladi.",
      ru: "Swiss Energy Visiovit — комплекс для поддержания остроты зрения. Лютеин, экстракт черники, зеаксантин, витамины A, E, Zn. Защищает глаза от внешних факторов.",
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
      uz: "Immunitet uchun vitaminlar — echinacea, propolis, C va Zn",
      ru: "Витамины для иммунитета — эхинацея, прополис, C и Zn",
    },
    description: {
      uz: "Swiss Energy ImmunoVit — immun tizimni kuchaytiruvchi kompleks. Echinacea, propolis, vitamin C va sink. Mavsumiy himoya va umumiy salomatlik uchun.",
      ru: "Swiss Energy ImmunoVit — комплекс для укрепления иммунной системы. Эхинацея, прополис, витамин C и цинк. Для сезонной защиты и общего здоровья.",
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
    tagline: {
      uz: "Immunitetni mustahkamlash uchun shipuchi multivitaminlar",
      ru: "Шипучие мультивитамины для укрепления иммунитета",
    },
    description: {
      uz: "Dr. Frei Multivitamins + Biotin — A, B, C, D, E, PP vitaminlari va biotin bilan boyitilgan shipuchi tabletkalar. Immunitetni kuchaytiradi, energiya beradi. 14+ yoshdan.",
      ru: "Dr. Frei Multivitamins + Biotin — шипучие таблетки, обогащённые витаминами A, B, C, D, E, PP и биотином. Укрепляет иммунитет, даёт энергию. С 14+ лет.",
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
    name: { uz: "HAMDARD SAFI-Eks 200ml", ru: "HAMDARD SAFI-Экс 200мл" },
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
      uz: "Ko'z va immunitet uchun eruvchan vitaminlar — lyutein, A, C, E, Zn",
      ru: "Растворимые витамины для зрения и иммунитета — лютеин, A, C, E, Zn",
    },
    description: {
      uz: "Dr. Frei Gold — lyutein, vitamin A, C, E va sink bilan boyitilgan eruvchan vitaminlar. Ko'z va immunitet uchun kompleks qo'llab-quvvatlash. 14+ yoshdan.",
      ru: "Dr. Frei Gold — растворимые витамины, обогащённые лютеином, витаминами A, C, E и цинком. Комплексная поддержка зрения и иммунитета. С 14+ лет.",
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
      uz: "1 tabletkani 200 ml suvda eriting. Kuniga 1 marta iching.",
      ru: "Растворите 1 таблетку в 200 мл воды. Пейте 1 раз в день.",
    },
    faq: {
      uz: [{ question: "Visiovit bilan farqi?", answer: "Gold — eruvchan tabletka, Visiovit — kapsula. Tarkib o'xshash, format boshqa." }],
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
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "20 tabletka", ru: "20 таблеток" },
    badges: { uz: ["Aksiya", "7+ yosh", "Arzon narx kafolati"], ru: ["Акция", "7+ лет", "Гарантия низкой цены"] },
    name: { uz: "Dr. Frei Kids Multivitaminlar 20", ru: "Dr. Frei Kids Мультивитамины 20" },
    tagline: {
      uz: "Bolalar uchun vitaminlar A, B, C, D3, Kalsiy — 7 yoshdan",
      ru: "Витамины для детей A, B, C, D3, Кальций — с 7 лет",
    },
    description: {
      uz: "Dr. Frei Kids — A, B, C, D3, Kalsiy va PP vitaminlarini o'z ichiga olgan bolalar kompleksi. Bolaning o'sishi, suyak va immunitetini qo'llab-quvvatlaydi. 7+ yoshdan, 20 tabletka.",
      ru: "Dr. Frei Kids — детский комплекс, включающий витамины A, B, C, D3, кальций и PP. Поддерживает рост, кости и иммунитет ребёнка. С 7+ лет, 20 таблеток.",
    },
    highlights: {
      uz: ["A, B, C, D3 + Kalsiy", "7+ yoshdan", "Bolalar uchun maxsus", "20 tabletka"],
      ru: ["A, B, C, D3 + Кальций", "С 7+ лет", "Специально для детей", "20 таблеток"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "O'sish va rivojlanish", description: "D3 va kalsiy suyaklar o'sishini qo'llab-quvvatlaydi." },
        { icon: "shield", title: "Bolalar immuniteti", description: "Vitamin C va A himoyani kuchaytiradi." },
        { icon: "sparkle", title: "Energiya", description: "B vitaminlari faollik va e'tiborni yaxshilaydi." },
      ],
      ru: [
        { icon: "bolt", title: "Рост и развитие", description: "D3 и кальций поддерживают рост костей." },
        { icon: "shield", title: "Детский иммунитет", description: "Витамин C и A укрепляет защиту." },
        { icon: "sparkle", title: "Энергия", description: "B-витамины улучшают активность и внимание." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Vitamin A", amount: "400 mkg", dailyValue: "50%" },
        { name: "Vitamin C", amount: "40 mg", dailyValue: "50%" },
        { name: "Vitamin D3", amount: "2.5 mkg", dailyValue: "50%" },
        { name: "Kalsiy", amount: "240 mg", dailyValue: "30%" },
        { name: "B vitaminlari", amount: "50% RDI" },
      ],
      ru: [
        { name: "Витамин A", amount: "400 мкг", dailyValue: "50%" },
        { name: "Витамин C", amount: "40 мг", dailyValue: "50%" },
        { name: "Витамин D3", amount: "2,5 мкг", dailyValue: "50%" },
        { name: "Кальций", amount: "240 мг", dailyValue: "30%" },
        { name: "B-витамины", amount: "50% RDI" },
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
      uz: "Eriydigan Vitamin C 550mg — energiya va kuchli immunitet",
      ru: "Растворимый Витамин C 550мг — энергия и крепкий иммунитет",
    },
    description: {
      uz: "Swiss Energy Vitamin C 550mg — yuqori dozali eriydigan vitamin C. Apelsin ta'mi, energiya va jismoniy faollik uchun. 14+ yoshdan. 20 tabletka.",
      ru: "Swiss Energy Витамин C 550мг — растворимый витамин C в высокой дозе. Вкус апельсина, для энергии и физической активности. С 14+ лет. 20 таблеток.",
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
      uz: "1 tabletkani 200 ml suvda eriting. Ovqat bilan yoki keyingi 1 marta iching. 14+ yoshdan.",
      ru: "Растворите 1 таблетку в 200 мл воды. Принимайте во время или после еды 1 раз в день. С 14+ лет.",
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
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    images:
      BRAND.productImageOverrides[p.slug]?.length
        ? BRAND.productImageOverrides[p.slug].map((url) => ({ url, alt: p.name[locale] }))
        : p.imageSeeds.map((s) => img(s, p.name[locale])),
    highlights: p.highlights[locale],
    benefits: p.benefits[locale],
    ingredients: p.ingredients[locale],
    howToUse: p.howToUse[locale],
    faq: p.faq[locale],
    reviews: p.reviews[locale],
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
    case "popular":
    default:
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
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q),
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
