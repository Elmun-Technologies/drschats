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
    role: { uz: "Yurak · miya · qon tomirlari", ru: "Сердце · мозг · сосуды" },
    description: {
      uz: "Yuqori tozalikdagi to'yinmagan yog' kislotalari. Yurak ritmi, miya faoliyati, ko'rish o'tkirligi va qon tomirlar elastikligini qo'llab-quvvatlaydi.",
      ru: "Очищенные полиненасыщенные жирные кислоты для сердца, сосудов, зрения и когнитивных функций.",
    },
    inProducts: ["omega-3-premium", "dr-frei-omega-3-1000"],
  },
  {
    slug: "vitamin-d3",
    name: { uz: "Vitamin D3 (Xolekalsiferol)", ru: "Витамин D3 (Холекальциферол)" },
    role: { uz: "Suyak · immunitet · gormonlar", ru: "Кости · иммунитет · гормоны" },
    description: {
      uz: "Quyosh vitamini. Kalsiy va fosfor so'rilishi, immun tizimi faolligi, energiya va kayfiyat barqarorligi uchun muhim biofaol modda.",
      ru: "Солнечный витамин; регулирует усвоение кальция, поддерживает иммунитет, плотность костей и жизненный тонус.",
    },
    inProducts: ["vitamin-d3-k2", "swiss-energy-d3-caps"],
  },
  {
    slug: "vitamin-k2",
    name: { uz: "Vitamin K2 (Menaquinone MK-7)", ru: "Витамин K2 (Менахинон MK-7)" },
    role: { uz: "Suyak zichligi · qon tomir tozaligi", ru: "Плотность костей · здоровье сосудов" },
    description: {
      uz: "Kalsiyni qon tomir devorlaridan suyak to'qimalariga yo'naltiruvchi maxsus vitamin. D3 bilan sinergiyada ishlaydi.",
      ru: "Направляет кальций непосредственно в костную ткань, предотвращая его отложение в сосудах.",
    },
    inProducts: ["vitamin-d3-k2"],
  },
  {
    slug: "magnesium",
    name: { uz: "Magniy (Xelat / Sitrat / B6)", ru: "Магний (Хелат / Цитрат / B6)" },
    role: { uz: "Asab · mushaklar · sifatli uyqu", ru: "Нервная система · мышцы · сон" },
    description: {
      uz: "Organizmda 300 dan ortiq biokimyoviy reaksiyalarda qatnashadi. Mushaklar spazmini yechadi, asab tizimini tinchlantiradi va uyquni me'yorlashtiradi.",
      ru: "Участвует более чем в 300 ферментативных реакциях; снижает нервную возбудимость, судороги и нормализует сон.",
    },
    inProducts: ["magnesium-b6", "swiss-energy-magnesium"],
  },
  {
    slug: "vitamin-c",
    name: { uz: "Vitamin C (L-Askorbin kislotasi)", ru: "Витамин C (L-Аскорбиновая кислота)" },
    role: { uz: "Antioksidant · immunitet · kollagen", ru: "Антиоксидант · иммунитет · коллаген" },
    description: {
      uz: "Kuchli antioksidant. Hujayralarni oksidlanishdan himoya qiladi, kollagen sintezini rag'batlantiradi va temir moddasi so'rilishini oshiradi.",
      ru: "Мощный антиоксидант; стимулирует выработку коллагена, укрепляет стенки капилляров и повышает сопротивляемость инфекциям.",
    },
    inProducts: ["immuno-complex", "swiss-energy-vitamin-c-1000", "dr-frei-vitamin-c"],
  },
  {
    slug: "zinc",
    name: { uz: "Sink (Pikolinat / Sitrat)", ru: "Цинк (Пиколинат / Цитрат)" },
    role: { uz: "Immun hujayralar · teri · gormonal balans", ru: "Иммунные клетки · кожа · гормоны" },
    description: {
      uz: "Immun hujayralari bo'linishi, jarohatlar bitishi, teri tozaligi va reproduktiv salomatlik uchun muhim mikroelement.",
      ru: "Ключевой минерал для дифференцировки Т-лимфоцитов, заживления тканей, здоровья кожи и выработки гормонов.",
    },
    inProducts: ["immuno-complex", "dr-frei-zinc"],
  },
  {
    slug: "collagen",
    name: { uz: "Gidrolizlangan Dengiz Kollageni", ru: "Гидролизованный морской коллаген" },
    role: { uz: "Teri elastikligi · soch · bo'g'imlar", ru: "Упругость кожи · волосы · суставы" },
    description: {
      uz: "Kichik molekulyar oqsil peptidlari. Teri elastikligini tiklaydi, ajinlar paydo bo'lishini sekinlashtiradi va bo'g'im tog'aylarini oziqlantiradi.",
      ru: "Легкоусвояемые пептиды коллагена I и III типа для плотности дермы, эластичности связок и укрепления суставов.",
    },
    inProducts: ["collagen-beauty", "swiss-energy-collagen"],
  },
  {
    slug: "biotin",
    name: { uz: "Biotin (Vitamin B7 / H)", ru: "Биотин (Витамин B7 / H)" },
    role: { uz: "Soch mustahkamligi · tirnoqlar", ru: "Крепость волос · ногти" },
    description: {
      uz: "Keratin oqsilining asosiy sintezlovchisi. Soch to'kilishini kamaytiradi, uning qalinligini oshiradi va tirnoqlarni mustahkamlaydi.",
      ru: "Кофермент в синтезе кератина; останавливает ломкость волос, укрепляет ногтевую пластину и улучшает текстуру кожи.",
    },
    inProducts: ["collagen-beauty", "swiss-energy-beauty"],
  },
  {
    slug: "vitamin-b12",
    name: { uz: "Vitamin B12 (Metilkobalamin)", ru: "Витамин B12 (Метилкобаламин)" },
    role: { uz: "Gemoglobin · miya · tetiklik", ru: "Гемоглобин · мозг · энергия" },
    description: {
      uz: "Eritrotsitlar hosil bo'lishi, asab tolalari qobig'i (miyelizatsiya) va aqliy tetiklik uchun almashtirib bo'lmaydigan vitamin.",
      ru: "Необходим для кроветворения, синтеза ДНК, поддержки нервных волокон и преодоления хронической усталости.",
    },
    inProducts: ["multivitamin-daily", "dr-frei-active"],
  },
  {
    slug: "iron",
    name: { uz: "Temir (Bisglisinat xelati)", ru: "Железо (Бисглицинат хелат)" },
    role: { uz: "Gemoglobin · kislorod · quvvat", ru: "Гемоглобин · кислород · энергия" },
    description: {
      uz: "Oshqozonni bezovta qilmaydigan yuqori bio-mavjudlikdagi temir shakli. To'qimalarga kislorod yetkazish va charchoqni yengish uchun.",
      ru: "Хелатная форма железа без побочных эффектов со стороны ЖКТ; восстанавливает уровень ферритина и гемоглобина.",
    },
    inProducts: ["multivitamin-daily"],
  },
  {
    slug: "calcium",
    name: { uz: "Kalsiy (Sitrat / D3)", ru: "Кальций (Цитрат / D3)" },
    role: { uz: "Suyak karkasi · tishlar", ru: "Костная ткань · зубы" },
    description: {
      uz: "Suyaklar va tishlarning asosiy mineral qurilish materiali. Yurak qisqarishi va qon ivishida ishtirok etadi.",
      ru: "Основа минеральной плотности скелета и зубов; участвует в нервной передаче и мышечном сокращении.",
    },
    inProducts: ["swiss-energy-calcid"],
  },
  {
    slug: "probiotics",
    name: { uz: "Probiotiklar va Prebiotiklar kompleksi", ru: "Комплекс пробиотиков и пребиотиков" },
    role: { uz: "Ichak mikrobiotasi · hazm · immunitet", ru: "Микробиота кишечника · пищеварение" },
    description: {
      uz: "Foydali jonli laktobakteriyalar va bifidobakteriyalar. Oziq moddalar so'rilishini yaxshilaydi va immun tizimini 70% ichak orqali kuchaytiradi.",
      ru: "Штаммы полезных бактерий для нормализации кишечной микрофлоры, комфортного пищеварения и иммунитета.",
    },
    inProducts: ["dr-frei-probiotic"],
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
    note: { uz: "Vitamin C temirning ichakda so'rilishini 3 baravargacha oshiradi.", ru: "Витамин C усиливает биодоступность и усвоение железа до 3 раз." },
  },
  {
    type: "boost",
    a: { uz: "Vitamin D3", ru: "Витамин D3" },
    b: { uz: "Vitamin K2", ru: "Витамин K2" },
    note: { uz: "K2 kalsiyni qon tomirlaridan to'g'ri suyak to'qimasiga yo'naltiradi.", ru: "K2 активирует белок остеокальцин, направляя кальций в кости." },
  },
  {
    type: "boost",
    a: { uz: "Magniy", ru: "Магний" },
    b: { uz: "Vitamin B6", ru: "Витамин B6" },
    note: { uz: "B6 vitamini magniyning hujayra ichiga kirishini osonlashtiradi.", ru: "Витамин B6 улучшает проникновение и фиксацию магния в клетках." },
  },
  {
    type: "boost",
    a: { uz: "Kollagen", ru: "Коллаген" },
    b: { uz: "Vitamin C", ru: "Витамин C" },
    note: { uz: "Organizmda yangi kollagen tolalari hosil bo'lishi uchun C vitamini kofaktor hisoblanadi.", ru: "Витамин C необходим для сборки собственных молекул коллагена." },
  },
  {
    type: "block",
    a: { uz: "Kalsiy", ru: "Кальций" },
    b: { uz: "Sink", ru: "Цинк" },
    note: { uz: "Bir vaqtda qabul qilinganda bir xil retseptorlar uchun raqobatlashadi — 2-3 soat oraliq bilan iching.", ru: "Конкурируют за одинаковые каналы всасывания — разносите приём на 2–3 часа." },
  },
  {
    type: "block",
    a: { uz: "Kalsiy", ru: "Кальций" },
    b: { uz: "Temir", ru: "Железо" },
    note: { uz: "Kalsiy temirning so'rilishini sezilarli darajada susaytiradi.", ru: "Кальций подавляет абсорбцию железа в кишечнике." },
  },
  {
    type: "block",
    a: { uz: "Kofe / Choy (Taninlar)", ru: "Кофе / Чай (Танины)" },
    b: { uz: "Temir va Magniy", ru: "Железо и Магний" },
    note: { uz: "Kofein va taninlar minerallarni bog'lab, chiqib ketishini tezlashtiradi.", ru: "Танины связывают минералы, снижая их биологическую ценность." },
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
