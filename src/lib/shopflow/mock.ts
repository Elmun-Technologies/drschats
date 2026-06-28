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

const rawCategories: RawCategory[] = [
  {
    id: "cat-omega",
    slug: "omega",
    name: { uz: "Omega va baliq yog'i", ru: "Омега и рыбий жир" },
    description: {
      uz: "Yurak, miya va bo'g'imlar uchun yuqori tozalikdagi omega-3.",
      ru: "Высокоочищенная омега-3 для сердца, мозга и суставов.",
    },
    image: img("cat-omega", "Omega").url,
  },
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
      uz: "Teri, soch va tirnoq uchun kollagen va biotin.",
      ru: "Коллаген и биотин для кожи, волос и ногтей.",
    },
    image: img("cat-beauty", "Beauty").url,
  },
  catSimple("cat-kids", "kids", "Bolalar uchun", "Дети"),
  catSimple("cat-effervescent", "effervescent", "Shipuchi tabletkalar", "Шипучие таблетки"),
  catSimple("cat-probiotics", "probiotics", "Probiotiklar", "Пробиотики"),
  catSimple("cat-collagen", "collagen", "Kollagen", "Коллаген"),
  catSimple("cat-sexual", "sexual-health", "Jinsiy salomatlik", "Сексуальное здоровье"),
  catSimple("cat-hair", "hair-care", "Soch parvarishi", "Уход за волосами"),
  catSimple("cat-sport", "sport", "Sport va fitnes", "Спорт и фитнес"),
  catSimple("cat-joints", "joints", "Bo'g'imlar", "Суставы"),
  catSimple("cat-liver", "liver", "Jigar uchun", "Для печени"),
  catSimple("cat-pregnancy", "pregnancy", "Homiladorlik", "Беременность"),
  catSimple("cat-herbaltea", "herbal-tea", "O'simlik choyi", "Травяной чай"),
];

function catSimple(id: string, slug: string, uz: string, ru: string): RawCategory {
  return {
    id,
    slug,
    name: { uz, ru },
    description: { uz, ru },
    image: img(id, uz).url,
  };
}

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
  {
    id: "p-omega3",
    slug: "omega-3-premium",
    categoryId: "cat-omega",
    categorySlug: "omega",
    price: 189000,
    oldPrice: 249000,
    rating: 4.9,
    reviewCount: 412,
    inStock: true,
    imageSeeds: ["omega3-a", "omega3-b", "omega3-c"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "60 kapsula", ru: "60 капсул" },
    badges: {
      uz: ["Bestseller", "Shveytsariya sifati"],
      ru: ["Хит продаж", "Швейцарское качество"],
    },
    name: { uz: "Omega-3 Premium", ru: "Omega-3 Premium" },
    tagline: {
      uz: "Yurak, miya va ko'z uchun ultra-toza omega-3",
      ru: "Ультрачистая омега-3 для сердца, мозга и зрения",
    },
    description: {
      uz: "Omega-3 Premium — molekulyar distillangan baliq yog'i, har bir kapsulada 1000 mg EPA va DHA. Og'ir metallardan tozalangan, IFOS sertifikatiga ega va hidsiz formulada.",
      ru: "Omega-3 Premium — молекулярно дистиллированный рыбий жир, 1000 мг EPA и DHA в каждой капсуле. Очищен от тяжёлых металлов, сертифицирован IFOS, без рыбного послевкусия.",
    },
    highlights: {
      uz: ["1000 mg EPA+DHA", "Molekulyar distillangan", "IFOS sertifikati", "Hidsiz"],
      ru: ["1000 мг EPA+DHA", "Молекулярная дистилляция", "Сертификат IFOS", "Без запаха"],
    },
    benefits: {
      uz: [
        { icon: "heart", title: "Yurak sog'lig'i", description: "Normal xolesterin va qon bosimini qo'llab-quvvatlaydi." },
        { icon: "brain", title: "Miya va xotira", description: "DHA — bosh miya hujayralarining asosiy qurilish bloki." },
        { icon: "eye", title: "Ko'rish o'tkirligi", description: "To'r parda salomatligi uchun zarur yog' kislotalari." },
        { icon: "shield", title: "Yallig'lanishga qarshi", description: "Bo'g'imlar harakatchanligini saqlaydi." },
      ],
      ru: [
        { icon: "heart", title: "Здоровье сердца", description: "Поддерживает нормальный холестерин и давление." },
        { icon: "brain", title: "Мозг и память", description: "DHA — главный строительный блок клеток мозга." },
        { icon: "eye", title: "Острота зрения", description: "Жирные кислоты, необходимые для сетчатки." },
        { icon: "shield", title: "Против воспалений", description: "Сохраняет подвижность суставов." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Baliq yog'i konsentrati", amount: "1400 mg" },
        { name: "EPA (eykozapentaen)", amount: "660 mg", dailyValue: "*" },
        { name: "DHA (dokozaheksaen)", amount: "440 mg", dailyValue: "*" },
        { name: "Vitamin E", amount: "10 mg", dailyValue: "83%" },
      ],
      ru: [
        { name: "Концентрат рыбьего жира", amount: "1400 мг" },
        { name: "EPA (эйкозапентаеновая)", amount: "660 мг", dailyValue: "*" },
        { name: "DHA (докозагексаеновая)", amount: "440 мг", dailyValue: "*" },
        { name: "Витамин E", amount: "10 мг", dailyValue: "83%" },
      ],
    },
    howToUse: {
      uz: "Kuniga 1 kapsuladan ovqat bilan qabul qiling yoki shifokor tavsiyasiga amal qiling.",
      ru: "Принимайте по 1 капсуле в день во время еды или по рекомендации врача.",
    },
    faq: {
      uz: [
        { question: "Kapsulada baliq hidi bormi?", answer: "Yo'q, maxsus distillash texnologiyasi tufayli formula hidsiz." },
        { question: "Homiladorlar uchun mosmi?", answer: "DHA homiladorlik uchun foydali, ammo qabuldan oldin shifokor bilan maslahatlashing." },
      ],
      ru: [
        { question: "Есть ли рыбный запах?", answer: "Нет, благодаря технологии дистилляции формула без запаха." },
        { question: "Подходит беременным?", answer: "DHA полезна при беременности, но проконсультируйтесь с врачом." },
      ],
    },
    reviews: {
      uz: [
        { author: "Dilnoza A.", rating: 5, date: "2026-04-12", text: "Hidsiz, ichish oson. Bir oydan keyin energiyam oshdi." },
        { author: "Sardor T.", rating: 5, date: "2026-03-30", text: "Sifati zo'r, yetkazib berish tez bo'ldi." },
      ],
      ru: [
        { author: "Дилноза А.", rating: 5, date: "2026-04-12", text: "Без запаха, легко принимать. Через месяц прибавилось энергии." },
        { author: "Сардор Т.", rating: 5, date: "2026-03-30", text: "Отличное качество, быстрая доставка." },
      ],
    },
  },
  {
    id: "p-d3k2",
    slug: "vitamin-d3-k2",
    categoryId: "cat-vitamins",
    categorySlug: "vitamins",
    price: 129000,
    oldPrice: 159000,
    rating: 4.8,
    reviewCount: 287,
    inStock: true,
    imageSeeds: ["d3k2-a", "d3k2-b", "d3k2-c"],
    bespoke: true,
    origin: { uz: "Germaniya", ru: "Германия" },
    servings: { uz: "90 tomchi-tabletka", ru: "90 таблеток" },
    badges: {
      uz: ["Yangi formula", "D3 + K2 MK-7"],
      ru: ["Новая формула", "D3 + K2 MK-7"],
    },
    name: { uz: "Vitamin D3 + K2", ru: "Витамин D3 + K2" },
    tagline: {
      uz: "Suyak, immunitet va kayfiyat uchun quyosh vitamini",
      ru: "Солнечный витамин для костей, иммунитета и настроения",
    },
    description: {
      uz: "Vitamin D3 (5000 IU) va K2 (MK-7) sinergiyasi: kalsiyni suyaklarga yo'naltiradi, immunitet va kayfiyatni qo'llab-quvvatlaydi. Quyosh kam bo'lgan oylar uchun ideal.",
      ru: "Синергия витамина D3 (5000 МЕ) и K2 (MK-7): направляет кальций в кости, поддерживает иммунитет и настроение. Идеален в сезон нехватки солнца.",
    },
    highlights: {
      uz: ["5000 IU D3", "K2 MK-7 forma", "Suyak + immunitet", "Germaniya ishlab chiqarilgan"],
      ru: ["5000 МЕ D3", "Форма K2 MK-7", "Кости + иммунитет", "Произведено в Германии"],
    },
    benefits: {
      uz: [
        { icon: "bone", title: "Mustahkam suyaklar", description: "Kalsiy almashinuvini to'g'ri yo'naltiradi." },
        { icon: "shield", title: "Immunitet", description: "Mavsumiy himoyani kuchaytiradi." },
        { icon: "sun", title: "Kayfiyat va energiya", description: "Quyosh yetishmovchiligini qoplaydi." },
      ],
      ru: [
        { icon: "bone", title: "Крепкие кости", description: "Правильно направляет обмен кальция." },
        { icon: "shield", title: "Иммунитет", description: "Усиливает сезонную защиту." },
        { icon: "sun", title: "Настроение и энергия", description: "Компенсирует нехватку солнца." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Vitamin D3 (xolekalsiferol)", amount: "125 mkg (5000 IU)", dailyValue: "2500%" },
        { name: "Vitamin K2 (MK-7)", amount: "100 mkg", dailyValue: "133%" },
      ],
      ru: [
        { name: "Витамин D3 (холекальциферол)", amount: "125 мкг (5000 МЕ)", dailyValue: "2500%" },
        { name: "Витамин K2 (MK-7)", amount: "100 мкг", dailyValue: "133%" },
      ],
    },
    howToUse: {
      uz: "Kuniga 1 tabletkadan yog'li ovqat bilan qabul qiling.",
      ru: "Принимайте по 1 таблетке в день с жирной пищей.",
    },
    faq: {
      uz: [
        { question: "Nima uchun K2 bilan birga?", answer: "K2 kalsiyni qon tomirlaridan suyaklarga yo'naltiradi — bu D3 bilan ideal juftlik." },
        { question: "Har kuni 5000 IU ko'pmi?", answer: "Ko'pchilik kattalar uchun xavfsiz doza, ammo qon tahlili bo'yicha shifokor bilan moslang." },
      ],
      ru: [
        { question: "Почему вместе с K2?", answer: "K2 направляет кальций из сосудов в кости — идеальная пара к D3." },
        { question: "5000 МЕ в день — не много?", answer: "Безопасная доза для большинства взрослых, но согласуйте с врачом по анализам." },
      ],
    },
    reviews: {
      uz: [
        { author: "Kamola R.", rating: 5, date: "2026-05-02", text: "Qishda kayfiyatim ancha yaxshi. Tavsiya qilaman." },
        { author: "Jasur N.", rating: 4, date: "2026-04-18", text: "Sifatli, lekin narxi biroz qimmat." },
      ],
      ru: [
        { author: "Камола Р.", rating: 5, date: "2026-05-02", text: "Зимой настроение заметно лучше. Рекомендую." },
        { author: "Жасур Н.", rating: 4, date: "2026-04-18", text: "Качественно, но цена немного высокая." },
      ],
    },
  },
  {
    id: "p-magnesium",
    slug: "magnesium-b6",
    categoryId: "cat-minerals",
    categorySlug: "minerals",
    price: 99000,
    rating: 4.7,
    reviewCount: 198,
    inStock: true,
    imageSeeds: ["mag-a", "mag-b"],
    bespoke: true,
    origin: { uz: "Germaniya", ru: "Германия" },
    servings: { uz: "60 tabletka", ru: "60 таблеток" },
    badges: { uz: ["Stressga qarshi"], ru: ["Против стресса"] },
    name: { uz: "Magniy + B6", ru: "Магний + B6" },
    tagline: {
      uz: "Asab tizimi va mushaklar uchun tinchlik minerali",
      ru: "Минерал спокойствия для нервов и мышц",
    },
    description: {
      uz: "Magniy sitrat va B6 vitamini: charchoqni kamaytiradi, mushak tirishishini yumshatadi va uyquni yaxshilaydi.",
      ru: "Цитрат магния и витамин B6: снижают усталость, смягчают судороги и улучшают сон.",
    },
    highlights: {
      uz: ["Magniy sitrat", "B6 bilan", "Uyqu va xotirjamlik"],
      ru: ["Цитрат магния", "С B6", "Сон и спокойствие"],
    },
    benefits: {
      uz: [
        { icon: "moon", title: "Yaxshi uyqu", description: "Asab tizimini tinchlantiradi." },
        { icon: "bolt", title: "Energiya", description: "Charchoqni kamaytiradi." },
      ],
      ru: [
        { icon: "moon", title: "Хороший сон", description: "Успокаивает нервную систему." },
        { icon: "bolt", title: "Энергия", description: "Снижает усталость." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Magniy (sitrat)", amount: "300 mg", dailyValue: "80%" },
        { name: "Vitamin B6", amount: "2 mg", dailyValue: "143%" },
      ],
      ru: [
        { name: "Магний (цитрат)", amount: "300 мг", dailyValue: "80%" },
        { name: "Витамин B6", amount: "2 мг", dailyValue: "143%" },
      ],
    },
    howToUse: {
      uz: "Kuniga 1–2 tabletkadan ovqat bilan, kechqurun qabul qiling.",
      ru: "Принимайте по 1–2 таблетки в день с едой, вечером.",
    },
    faq: {
      uz: [{ question: "Qachon ichish kerak?", answer: "Kechqurun qabul qilish uyquni yaxshilashga yordam beradi." }],
      ru: [{ question: "Когда принимать?", answer: "Вечерний приём помогает улучшить сон." }],
    },
    reviews: {
      uz: [{ author: "Nigora S.", rating: 5, date: "2026-04-22", text: "Uyqum yaxshilandi, oyoq tirishishi qoldi." }],
      ru: [{ author: "Нигора С.", rating: 5, date: "2026-04-22", text: "Сон улучшился, судороги прошли." }],
    },
  },
  {
    id: "p-immuno",
    slug: "immuno-complex",
    categoryId: "cat-immunity",
    categorySlug: "immunity",
    price: 109000,
    oldPrice: 139000,
    rating: 4.8,
    reviewCount: 233,
    inStock: true,
    imageSeeds: ["immuno-a", "immuno-b"],
    bespoke: true,
    origin: { uz: "Rossiya", ru: "Россия" },
    servings: { uz: "30 paketcha", ru: "30 саше" },
    badges: { uz: ["Vitamin C + Sink"], ru: ["Витамин C + Цинк"] },
    name: { uz: "Immuno Complex", ru: "Immuno Complex" },
    tagline: {
      uz: "Vitamin C, sink va selen — kuchli himoya",
      ru: "Витамин C, цинк и селен — мощная защита",
    },
    description: {
      uz: "Mavsumiy himoya uchun kompleks: 1000 mg vitamin C, sink va selen bir paketchada. Suvda eriydigan, ta'mi limonli.",
      ru: "Комплекс для сезонной защиты: 1000 мг витамина C, цинк и селен в одном саше. Растворимый, со вкусом лимона.",
    },
    highlights: {
      uz: ["1000 mg vitamin C", "Sink + selen", "Limon ta'mi"],
      ru: ["1000 мг витамина C", "Цинк + селен", "Вкус лимона"],
    },
    benefits: {
      uz: [
        { icon: "shield", title: "Immunitet", description: "Mavsumiy himoyani kuchaytiradi." },
        { icon: "bolt", title: "Antioksidant", description: "Hujayralarni himoya qiladi." },
      ],
      ru: [
        { icon: "shield", title: "Иммунитет", description: "Усиливает сезонную защиту." },
        { icon: "bolt", title: "Антиоксидант", description: "Защищает клетки." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Vitamin C", amount: "1000 mg", dailyValue: "1250%" },
        { name: "Sink", amount: "10 mg", dailyValue: "100%" },
        { name: "Selen", amount: "55 mkg", dailyValue: "100%" },
      ],
      ru: [
        { name: "Витамин C", amount: "1000 мг", dailyValue: "1250%" },
        { name: "Цинк", amount: "10 мг", dailyValue: "100%" },
        { name: "Селен", amount: "55 мкг", dailyValue: "100%" },
      ],
    },
    howToUse: {
      uz: "Bir paketchani 200 ml suvda eriting va kuniga 1 marta iching.",
      ru: "Растворите саше в 200 мл воды и пейте 1 раз в день.",
    },
    faq: {
      uz: [{ question: "Bolalar ichsa bo'ladimi?", answer: "12 yoshdan oshganlarga mos, kichiklarga shifokor tavsiyasi bilan." }],
      ru: [{ question: "Можно ли детям?", answer: "Подходит с 12 лет, младшим — по рекомендации врача." }],
    },
    reviews: {
      uz: [{ author: "Aziza M.", rating: 5, date: "2026-02-10", text: "Shamollash mavsumida oilam uchun zo'r." }],
      ru: [{ author: "Азиза М.", rating: 5, date: "2026-02-10", text: "Отлично для всей семьи в сезон простуд." }],
    },
  },
  {
    id: "p-collagen",
    slug: "collagen-beauty",
    categoryId: "cat-beauty",
    categorySlug: "beauty",
    price: 159000,
    rating: 4.9,
    reviewCount: 321,
    inStock: true,
    imageSeeds: ["collagen-a", "collagen-b"],
    bespoke: true,
    origin: { uz: "Germaniya", ru: "Германия" },
    servings: { uz: "30 kunlik", ru: "на 30 дней" },
    badges: { uz: ["Teri & soch"], ru: ["Кожа & волосы"] },
    name: { uz: "Collagen Beauty", ru: "Collagen Beauty" },
    tagline: {
      uz: "Teri, soch va tirnoq uchun gidrolizlangan kollagen",
      ru: "Гидролизованный коллаген для кожи, волос и ногтей",
    },
    description: {
      uz: "Gidrolizlangan kollagen peptidlari, gialuron kislotasi va biotin: teri elastikligini oshiradi, sochni mustahkamlaydi.",
      ru: "Пептиды гидролизованного коллагена, гиалуроновая кислота и биотин: повышают упругость кожи и укрепляют волосы.",
    },
    highlights: {
      uz: ["Kollagen peptidlari", "Gialuron + biotin", "Mevali ta'm"],
      ru: ["Пептиды коллагена", "Гиалурон + биотин", "Фруктовый вкус"],
    },
    benefits: {
      uz: [
        { icon: "sparkle", title: "Yorqin teri", description: "Elastiklik va namlikni oshiradi." },
        { icon: "sparkle", title: "Kuchli soch", description: "Soch va tirnoqni mustahkamlaydi." },
      ],
      ru: [
        { icon: "sparkle", title: "Сияющая кожа", description: "Повышает упругость и увлажнённость." },
        { icon: "sparkle", title: "Крепкие волосы", description: "Укрепляет волосы и ногти." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Kollagen peptidlari", amount: "5000 mg" },
        { name: "Gialuron kislotasi", amount: "80 mg" },
        { name: "Biotin", amount: "50 mkg", dailyValue: "100%" },
      ],
      ru: [
        { name: "Пептиды коллагена", amount: "5000 мг" },
        { name: "Гиалуроновая кислота", amount: "80 мг" },
        { name: "Биотин", amount: "50 мкг", dailyValue: "100%" },
      ],
    },
    howToUse: {
      uz: "Bir o'lchov qoshiqni suv yoki sharbatda eriting, kuniga 1 marta iching.",
      ru: "Растворите мерную ложку в воде или соке, пейте 1 раз в день.",
    },
    faq: {
      uz: [{ question: "Qachon natija ko'rinadi?", answer: "Odatda 4–8 hafta muntazam qabuldan so'ng." }],
      ru: [{ question: "Когда виден результат?", answer: "Обычно через 4–8 недель регулярного приёма." }],
    },
    reviews: {
      uz: [{ author: "Malika X.", rating: 5, date: "2026-05-15", text: "Terim yumshoq bo'ldi, tirnoqlarim sinmaydi." }],
      ru: [{ author: "Малика Х.", rating: 5, date: "2026-05-15", text: "Кожа стала мягче, ногти не ломаются." }],
    },
  },
  {
    id: "p-multi",
    slug: "multivitamin-daily",
    categoryId: "cat-vitamins",
    categorySlug: "vitamins",
    price: 119000,
    rating: 4.6,
    reviewCount: 176,
    inStock: true,
    imageSeeds: ["multi-a", "multi-b"],
    bespoke: true,
    origin: { uz: "Shveytsariya", ru: "Швейцария" },
    servings: { uz: "60 tabletka", ru: "60 таблеток" },
    badges: { uz: ["A–Z kompleks"], ru: ["Комплекс A–Z"] },
    name: { uz: "Multivitamin Daily", ru: "Multivitamin Daily" },
    tagline: {
      uz: "Kun davomida energiya uchun 23 vitamin va mineral",
      ru: "23 витамина и минерала для энергии на весь день",
    },
    description: {
      uz: "Kundalik ehtiyoj uchun to'liq A–Z kompleks: energiya, immunitet va umumiy salomatlikni qo'llab-quvvatlaydi.",
      ru: "Полный комплекс A–Z для ежедневных потребностей: энергия, иммунитет и общее здоровье.",
    },
    highlights: {
      uz: ["23 nutriyent", "Kunlik 1 tabletka", "Butun oila uchun"],
      ru: ["23 нутриента", "1 таблетка в день", "Для всей семьи"],
    },
    benefits: {
      uz: [
        { icon: "bolt", title: "Energiya", description: "Kunlik faollikni qo'llab-quvvatlaydi." },
        { icon: "shield", title: "Immunitet", description: "Umumiy himoyani mustahkamlaydi." },
      ],
      ru: [
        { icon: "bolt", title: "Энергия", description: "Поддерживает дневную активность." },
        { icon: "shield", title: "Иммунитет", description: "Укрепляет общую защиту." },
      ],
    },
    ingredients: {
      uz: [
        { name: "Vitamin kompleksi (A, C, D, E, B)", amount: "100% RDI" },
        { name: "Minerallar (Zn, Mg, Fe, Se)", amount: "100% RDI" },
      ],
      ru: [
        { name: "Комплекс витаминов (A, C, D, E, B)", amount: "100% RDI" },
        { name: "Минералы (Zn, Mg, Fe, Se)", amount: "100% RDI" },
      ],
    },
    howToUse: {
      uz: "Kuniga 1 tabletkadan ertalab ovqat bilan qabul qiling.",
      ru: "Принимайте по 1 таблетке утром во время еды.",
    },
    faq: {
      uz: [{ question: "Boshqa qo'shimchalar bilan ichsa bo'ladimi?", answer: "Ha, ammo umumiy dozani nazorat qiling." }],
      ru: [{ question: "Можно с другими добавками?", answer: "Да, но следите за общей дозировкой." }],
    },
    reviews: {
      uz: [{ author: "Bobur E.", rating: 4, date: "2026-03-05", text: "Kunlik energiya uchun yaxshi yechim." }],
      ru: [{ author: "Бобур Э.", rating: 4, date: "2026-03-05", text: "Хорошее решение для ежедневной энергии." }],
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
