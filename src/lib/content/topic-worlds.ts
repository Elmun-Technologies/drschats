import type { Locale } from "@/lib/i18n/routing";
import type { HealthTopicKind } from "./health-topics";

/*
  An audience page with its own look instead of the shared topic template:
  its own accent, hero, a "day" timeline and a ready set to buy in one tap.
  The rest of the page (products, article, FAQ) stays the shared template.
  Copy follows the same rules as topic copy — supplement wording only, facts
  from the pack — and is checked by `topic-worlds.test.ts`.
*/

export type WorldAccent = "sport";

type L = Record<Locale, string>;

interface RawWorldStep {
  time: L;
  title: L;
  body: L;
  /** Bank photo (`public/images/bank/<file>.webp`). */
  image?: string;
  imageAlt?: L;
  productSlug?: string;
}

interface RawTopicWorld {
  accent: WorldAccent;
  eyebrow: L;
  hero: { file: string; alt: L; position?: string };
  stats: { value: L; label: L }[];
  dayTitle: L;
  dayIntro: L;
  steps: RawWorldStep[];
  bundle: { title: L; text: L; cta: L; total: L; slugs: string[] };
  ctaBundle: L;
  ctaDay: L;
}

const WORLDS: Partial<Record<`${HealthTopicKind}/${string}`, RawTopicWorld>> = {
  "goal/sport": {
    accent: "sport",
    eyebrow: { uz: "Sport · mashgʻulot kuni", ru: "Спорт · день тренировки" },
    hero: {
      file: "woman-dumbbells-gym",
      alt: { uz: "Ayol sport zalida gantel bilan mashq qilmoqda", ru: "Женщина тренируется с гантелью в зале" },
      position: "50% 30%",
    },
    stats: [
      { value: { uz: "100 mg", ru: "100 мг" }, label: { uz: "magniy + 2 mg B6 bitta tabletkada", ru: "магния + 2 мг B6 в одной таблетке" } },
      { value: { uz: "550 mg", ru: "550 мг" }, label: { uz: "vitamin C shipuchi tabletkada", ru: "витамина C в шипучей таблетке" } },
      { value: { uz: "A–E + B", ru: "A–E + B" }, label: { uz: "multivitamin tarkibi, 14 yoshdan", ru: "состав мультивитамина, с 14 лет" } },
    ],
    dayTitle: { uz: "Mashgʻulot kuni", ru: "День тренировки" },
    dayIntro: {
      uz: "Asos — suv, ovqat va uyqu. Vitaminlar kunning toʻgʻri joyida ularni toʻldiradi.",
      ru: "Основа — вода, еда и сон. Витамины дополняют их в нужный момент дня.",
    },
    steps: [
      {
        time: { uz: "Oldin", ru: "До" },
        title: { uz: "Suv va yengil ovqat", ru: "Вода и лёгкая еда" },
        body: {
          uz: "Mashgʻulotga suv bilan kiring. Ogʻir ovqat — bir necha soat oldin, yengil gazak — yaqinroq.",
          ru: "Приходите на тренировку с водой. Плотная еда — за несколько часов, лёгкий перекус — ближе к началу.",
        },
        image: "woman-run-water-sweat",
        imageAlt: { uz: "Ayol yugurishdan keyin shishadan suv ichmoqda", ru: "Женщина пьёт воду из бутылки после пробежки" },
      },
      {
        time: { uz: "Mashgʻulot", ru: "Тренировка" },
        title: { uz: "Suv yoningizda boʻlsin", ru: "Вода всегда под рукой" },
        body: {
          uz: "Chanqoqni kutmasdan bir necha qultumdan iching — ayniqsa issiq zalda va uzoq mashgʻulotda.",
          ru: "Пейте по несколько глотков, не дожидаясь жажды, — особенно в жарком зале и на долгой тренировке.",
        },
        image: "man-gym-dumbbells",
        imageAlt: { uz: "Erkak sport zalida gantellar yonida mashq qilmoqda", ru: "Мужчина тренируется в зале рядом с гантелями" },
      },
      {
        time: { uz: "Keyin", ru: "После" },
        title: { uz: "Oqsilli ovqat va vitamin C", ru: "Белковая еда и витамин C" },
        body: {
          uz: "Vitamin C jismoniy faollik vaqtida va undan keyin immun tizimining normal ishlashiga hissa qoʻshadi.",
          ru: "Витамин C вносит вклад в нормальную работу иммунной системы во время и после физической нагрузки.",
        },
        image: "running-sport",
        imageAlt: { uz: "Erkak quyoshli yoʻlakda yugurmoqda", ru: "Мужчина бежит по солнечной дорожке" },
        productSlug: "swiss-energy-vitamin-c-20",
      },
      {
        time: { uz: "Kechqurun", ru: "Вечером" },
        title: { uz: "Magniy + B6", ru: "Магний + B6" },
        body: {
          uz: "Magniy normal mushak faoliyatiga hissa qoʻshadi. Dr. Frei Antistress — ishlab chiqaruvchi kechqurun ovqatdan keyin ichishni koʻrsatadi.",
          ru: "Магний вносит вклад в нормальную работу мышц. Dr. Frei Антистресс — производитель указывает приём вечером после еды.",
        },
        productSlug: "dr-frei-antistress-magniy-20",
      },
      {
        time: { uz: "Tun", ru: "Ночь" },
        title: { uz: "Uyqu", ru: "Сон" },
        body: {
          uz: "Mashgʻulot kunining oxirgi qismi. Yaxshi uyqusiz eng yaxshi rejaning ham foydasi kam.",
          ru: "Последняя часть тренировочного дня. Без хорошего сна даже лучший план мало что даст.",
        },
      },
    ],
    bundle: {
      title: { uz: "Sportchi toʻplami", ru: "Набор спортсмена" },
      text: {
        uz: "Magniy, vitamin C va multivitamin — mashgʻulot kunining uchta qoʻshimchasi bitta tugmada. Bir nechtasini birga ichsangiz, vitamin C qoʻshilib ketishini hisobga oling.",
        ru: "Магний, витамин C и мультивитамин — три добавки тренировочного дня одной кнопкой. Если пьёте их вместе, учитывайте, что витамин C суммируется.",
      },
      cta: { uz: "Toʻplamni savatga qoʻshish", ru: "Добавить набор в корзину" },
      total: { uz: "Toʻplam narxi", ru: "Цена набора" },
      slugs: ["dr-frei-antistress-magniy-20", "swiss-energy-vitamin-c-20", "dr-frei-multivitamins-biotin-20"],
    },
    ctaBundle: { uz: "Sportchi toʻplami", ru: "Набор спортсмена" },
    ctaDay: { uz: "Mashgʻulot kuni", ru: "День тренировки" },
  },
};

export interface WorldStep {
  time: string;
  title: string;
  body: string;
  image?: { src: string; alt: string };
  productSlug?: string;
}

export interface TopicWorld {
  accent: WorldAccent;
  eyebrow: string;
  hero: { src: string; alt: string; position?: string };
  stats: { value: string; label: string }[];
  dayTitle: string;
  dayIntro: string;
  steps: WorldStep[];
  bundle: { title: string; text: string; cta: string; total: string; slugs: string[] };
  ctaBundle: string;
  ctaDay: string;
}

const bank = (file: string) => `/images/bank/${file}.webp`;

export function topicWorld(kind: HealthTopicKind, slug: string, locale: Locale): TopicWorld | null {
  const raw = WORLDS[`${kind}/${slug}`];
  if (!raw) return null;
  return {
    accent: raw.accent,
    eyebrow: raw.eyebrow[locale],
    hero: { src: bank(raw.hero.file), alt: raw.hero.alt[locale], position: raw.hero.position },
    stats: raw.stats.map((s) => ({ value: s.value[locale], label: s.label[locale] })),
    dayTitle: raw.dayTitle[locale],
    dayIntro: raw.dayIntro[locale],
    steps: raw.steps.map((s) => ({
      time: s.time[locale],
      title: s.title[locale],
      body: s.body[locale],
      image: s.image && s.imageAlt ? { src: bank(s.image), alt: s.imageAlt[locale] } : undefined,
      productSlug: s.productSlug,
    })),
    bundle: {
      title: raw.bundle.title[locale],
      text: raw.bundle.text[locale],
      cta: raw.bundle.cta[locale],
      total: raw.bundle.total[locale],
      slugs: raw.bundle.slugs,
    },
    ctaBundle: raw.ctaBundle[locale],
    ctaDay: raw.ctaDay[locale],
  };
}

/** Every key, file and product slug a world refers to — for the tests. */
export const WORLD_ENTRIES = Object.entries(WORLDS) as [string, RawTopicWorld][];
