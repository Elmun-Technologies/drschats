import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

/*
  Health consultant question bank.

  Deliberately rule-based, not an LLM call. Three reasons:

  1. Safety — a pharmacy recommending supplements has to be able to explain
     *why* a product was suggested, and have a doctor sign off on that logic.
     A generative answer cannot be reviewed ahead of time.
  2. Determinism — the same answers must always produce the same plan, so
     support can reproduce what a customer saw.
  3. Cost and latency — the result is instant and free, and works offline.

  Each option carries weights toward health topics (the /goals and /symptoms
  slugs) and toward ingredient slugs. The engine sums them; nothing is hidden.

  Editorial note: questions gather lifestyle context only. They never ask for
  a diagnosis and never conclude one — the result page routes anything
  medical to a doctor.
*/

export type QuestionId = string;

export interface QuizOption {
  id: string;
  label: string;
  /** topicSlug → weight */
  topics?: Record<string, number>;
  /** ingredientSlug → weight */
  ingredients?: Record<string, number>;
  /** Marks the answer as a red flag that should route to a doctor. */
  seeDoctor?: boolean;
}

/** Answers so far, keyed by question id. */
export type QuizAnswerMap = Record<QuestionId, string[]>;

/**
 * When a question applies.
 *
 * Data, not a predicate function: the question list is built on the server and
 * handed to a client component, and functions can't cross that boundary.
 */
export interface QuizCondition {
  /** An earlier question's id. */
  question: QuestionId;
  /** Shown when that question's answer includes any of these option ids. */
  includesAny: string[];
}

export interface QuizQuestion {
  id: QuestionId;
  question: string;
  hint?: string;
  guidance?: string;
  multiSelect: boolean;
  options: QuizOption[];
  /**
   * Asked only when this matches. Absent means always asked.
   *
   * A consultant that asks a man whether he is pregnant has stopped being a
   * consultant, so the few questions that apply to only some visitors say so.
   */
  showIf?: QuizCondition;
}

interface RawOption {
  id: string;
  label: L;
  topics?: Record<string, number>;
  ingredients?: Record<string, number>;
  seeDoctor?: boolean;
}

interface RawQuestion {
  id: QuestionId;
  question: L;
  hint?: L;
  guidance?: L;
  multiSelect: boolean;
  options: RawOption[];
  showIf?: QuizCondition;
}

const raw: RawQuestion[] = [
  {
    id: "who",
    question: { uz: "Kim uchun tanlayapsiz?", ru: "Для кого подбираете?" },
    guidance: {
      uz: "Nima uchun bu muhim? Yosh va jinsga qarab vitaminlarning so'rilish darajasi hamda sutkalik ehtiyoj me'yorlari keskin farq qiladi.",
      ru: "Почему это важно? В зависимости от пола и возраста нормы потребления и усвояемость витаминов существенно различаются.",
    },
    multiSelect: false,
    options: [
      {
        id: "self-woman",
        label: { uz: "O'zim uchun (ayol)", ru: "Для себя (женщина)" },
        topics: { beauty: 1, immunity: 0.5 },
        ingredients: { collagen: 1, biotin: 1 },
      },
      {
        id: "self-man",
        label: { uz: "O'zim uchun (erkak)", ru: "Для себя (мужчина)" },
        topics: { energy: 1, immunity: 0.5 },
        ingredients: { magnesium: 1 },
      },
      {
        id: "child",
        label: { uz: "Bolam uchun", ru: "Для ребёнка" },
        topics: { kids: 2, immunity: 1 },
        ingredients: { "vitamin-d3": 1, "vitamin-c": 1 },
      },
      {
        id: "parent",
        label: { uz: "Keksa ota-onam uchun", ru: "Для пожилых родителей" },
        topics: { bones: 2, heart: 1 },
        ingredients: { "vitamin-d3": 1, "vitamin-k2": 1, "epa-dha": 1 },
      },
    ],
  },
  {
    id: "age",
    question: { uz: "Yosh guruhi", ru: "Возрастная группа" },
    guidance: {
      uz: "Nima uchun bu muhim? Yosh ulg'aygani sari kalsiy, D3 va B12 kabi nutriyentlarning biologik o'zlashtirilishi o'zgaradi.",
      ru: "Почему это важно? С возрастом усвояемость таких нутриентов, как кальций, D3 и B12, существенно меняется.",
    },
    multiSelect: false,
    options: [
      { id: "u18", label: { uz: "18 gacha", ru: "До 18" }, topics: { kids: 2 } },
      { id: "18-35", label: { uz: "18–35", ru: "18–35" }, topics: { energy: 0.5 } },
      { id: "36-55", label: { uz: "36–55", ru: "36–55" }, topics: { heart: 0.5, energy: 0.5 } },
      { id: "55+", label: { uz: "55 dan yuqori", ru: "Старше 55" }, topics: { bones: 1.5, heart: 1 } },
    ],
  },
  {
    id: "concerns",
    question: {
      uz: "Sizni nima ko'proq bezovta qiladi?",
      ru: "Что беспокоит больше всего?",
    },
    hint: { uz: "Bir nechtasini tanlash mumkin", ru: "Можно выбрать несколько" },
    guidance: {
      uz: "Nima uchun bu muhim? Charchoq, uyqu buzilishi va soch to'kilishi muayyan vitamin va minerallar yetishmovchiligining asosiy klinik belgilaridir.",
      ru: "Почему это важно? Усталость, проблемы со сном и выпадение волос — ключевые клинические признаки дефицита нутриентов.",
    },
    multiSelect: true,
    options: [
      {
        id: "fatigue",
        label: { uz: "Doimiy charchoq", ru: "Постоянная усталость" },
        topics: { fatigue: 3, energy: 2 },
        ingredients: { magnesium: 1, "vitamin-d3": 1 },
      },
      {
        id: "sleep",
        label: { uz: "Uyqu buzilishi", ru: "Нарушения сна" },
        topics: { sleep: 3, insomnia: 2 },
        ingredients: { magnesium: 2 },
      },
      {
        id: "stress",
        label: { uz: "Stress, asabiylik", ru: "Стресс, раздражительность" },
        topics: { stress: 3, sleep: 1 },
        ingredients: { magnesium: 2 },
      },
      {
        id: "colds",
        label: { uz: "Tez-tez shamollash", ru: "Частые простуды" },
        topics: { immunity: 3, "frequent-colds": 2 },
        ingredients: { "vitamin-c": 2, "vitamin-d3": 1, zinc: 2 },
      },
      {
        id: "hair-skin",
        label: { uz: "Soch to'kilishi, teri holati", ru: "Выпадение волос, состояние кожи" },
        topics: { beauty: 3, "hair-loss": 2 },
        ingredients: { collagen: 2, biotin: 2, zinc: 1 },
      },
      {
        id: "bones",
        label: { uz: "Suyak va bo'g'imlar", ru: "Кости и суставы" },
        topics: { bones: 3 },
        ingredients: { "vitamin-d3": 2, "vitamin-k2": 2 },
      },
      {
        id: "heart",
        label: { uz: "Yurak va qon tomirlar", ru: "Сердце и сосуды" },
        topics: { heart: 3 },
        ingredients: { "epa-dha": 2 },
      },
      {
        id: "focus",
        label: { uz: "Diqqat va xotira", ru: "Внимание и память" },
        topics: { brain: 3 },
        ingredients: { "epa-dha": 2 },
      },
    ],
  },
  {
    id: "sleep-hours",
    question: { uz: "Odatda necha soat uxlaysiz?", ru: "Сколько обычно спите?" },
    guidance: {
      uz: "Nima uchun bu muhim? Uyqu rejimining buzilishi D3 vitamini va magniy metabolizmiga hamda gormonal muvozanatga bevosita ta'sir qiladi.",
      ru: "Почему это важно? Нарушение режима сна напрямую влияет на метаболизм магния, витамина D3 и гормональный баланс.",
    },
    multiSelect: false,
    options: [
      { id: "lt5", label: { uz: "5 soatdan kam", ru: "Меньше 5 часов" }, topics: { sleep: 2, fatigue: 2 } },
      { id: "5-7", label: { uz: "5–7 soat", ru: "5–7 часов" }, topics: { sleep: 1, fatigue: 1 } },
      { id: "7-9", label: { uz: "7–9 soat", ru: "7–9 часов" }, topics: {} },
      { id: "gt9", label: { uz: "9 soatdan ko'p, baribir charchoq", ru: "Больше 9, но всё равно усталость" }, topics: { fatigue: 2 }, seeDoctor: true },
    ],
  },
  {
    id: "sun",
    question: {
      uz: "Kuniga qancha vaqt ochiq havoda bo'lasiz?",
      ru: "Сколько времени в день проводите на улице?",
    },
    guidance: {
      uz: "Nima uchun bu muhim? Quyosh nuri D3 vitaminining terida sintez bo'lishining asosiy manbai hisoblanadi.",
      ru: "Почему это важно? Солнечный свет — главный источник естественного синтеза витамина D3 в коже.",
    },
    multiSelect: false,
    options: [
      { id: "almost-none", label: { uz: "Deyarli chiqmayman", ru: "Почти не выхожу" }, ingredients: { "vitamin-d3": 3 }, topics: { fatigue: 1, bones: 1 } },
      { id: "lt1", label: { uz: "1 soatdan kam", ru: "Меньше часа" }, ingredients: { "vitamin-d3": 2 } },
      { id: "1-3", label: { uz: "1–3 soat", ru: "1–3 часа" }, ingredients: { "vitamin-d3": 0.5 } },
      { id: "gt3", label: { uz: "3 soatdan ko'p", ru: "Больше 3 часов" }, ingredients: {} },
    ],
  },
  {
    id: "activity",
    question: { uz: "Jismoniy faollik", ru: "Физическая активность" },
    guidance: {
      uz: "Nima uchun bu muhim? Jismoniy yuklama paytida magniy va aminokislotalar sarfi 2-3 baravarga ortadi.",
      ru: "Почему это важно? При физических нагрузках расход магния и аминокислот увеличивается в 2-3 раза.",
    },
    multiSelect: false,
    options: [
      { id: "sedentary", label: { uz: "Ko'proq o'tirib ishlayman", ru: "В основном сидячая работа" }, topics: { energy: 1, heart: 1 } },
      { id: "light", label: { uz: "Haftada 1–2 marta", ru: "1–2 раза в неделю" }, topics: {} },
      { id: "regular", label: { uz: "Haftada 3–5 marta", ru: "3–5 раз в неделю" }, topics: { sport: 2 }, ingredients: { magnesium: 1 } },
      { id: "athlete", label: { uz: "Har kuni, jiddiy yuklama", ru: "Ежедневно, серьёзные нагрузки" }, topics: { sport: 3, energy: 1 }, ingredients: { magnesium: 2 } },
    ],
  },
  {
    id: "diet",
    question: { uz: "Ovqatlanishingiz", ru: "Ваше питание" },
    guidance: {
      uz: "Nima uchun bu muhim? Ovqatlanish ratsioni Omega-3, B12 va kalsiy yetishmovchiligi xavfini belgilab beradi.",
      ru: "Почему это важно? Рацион питания определяет риски дефицита Омега-3, B12 и кальция.",
    },
    multiSelect: true,
    options: [
      { id: "fish", label: { uz: "Haftada 2+ marta baliq yeyman", ru: "Ем рыбу 2+ раза в неделю" }, ingredients: { "epa-dha": -1.5 } },
      { id: "veg", label: { uz: "Vegetarian yoki vegan", ru: "Вегетарианство или веганство" }, ingredients: { "epa-dha": 2, zinc: 1 }, topics: { energy: 1 } },
      { id: "no-dairy", label: { uz: "Sut mahsulotlarini iste'mol qilmayman", ru: "Не употребляю молочные продукты" }, ingredients: { "vitamin-d3": 1, "vitamin-k2": 1 }, topics: { bones: 1 } },
      { id: "irregular", label: { uz: "Tartibsiz, tez-tez o'tkazib yuboraman", ru: "Нерегулярное, часто пропускаю" }, topics: { fatigue: 1, energy: 1 } },
    ],
  },
  {
    id: "screen",
    question: { uz: "Ekran oldida kuniga qancha vaqt?", ru: "Сколько времени за экраном в день?" },
    guidance: {
      uz: "Nima uchun bu muhim? Ko'k nur (blue light) ko'z to'r pardasiga ta'sir qilib, lyutein va zeaksantin nutriyentlariga ehtiyojni oshiradi.",
      ru: "Почему это важно? Синий свет увеличивает потребность глаз в антиоксидантах, лютеине и зеаксантине.",
    },
    multiSelect: false,
    options: [
      { id: "lt4", label: { uz: "4 soatdan kam", ru: "Меньше 4 часов" }, topics: {} },
      { id: "4-8", label: { uz: "4–8 soat", ru: "4–8 часов" }, topics: { vision: 1 } },
      { id: "gt8", label: { uz: "8 soatdan ko'p", ru: "Больше 8 часов" }, topics: { vision: 2, sleep: 1 } },
    ],
  },
  {
    id: "smoking",
    question: { uz: "Chekasizmi?", ru: "Курите?" },
    guidance: {
      uz: "Nima uchun bu muhim? Chekish organizmdagi C vitaminining parchalanishini tezlashtiradi va antioksidantlarga ehtiyojni 50% ga oshiradi.",
      ru: "Почему это важно? Курение ускоряет расход витамина C и повышает потребность в антиоксидантах на 50%.",
    },
    multiSelect: false,
    options: [
      { id: "no", label: { uz: "Yo'q", ru: "Нет" }, topics: {} },
      { id: "sometimes", label: { uz: "Ba'zan", ru: "Иногда" }, ingredients: { "vitamin-c": 1 } },
      { id: "yes", label: { uz: "Ha, muntazam", ru: "Да, регулярно" }, ingredients: { "vitamin-c": 2 }, topics: { heart: 1 } },
    ],
  },
  {
    id: "medication",
    question: {
      uz: "Hozir doimiy dori ichyapsizmi?",
      ru: "Принимаете ли сейчас лекарства постоянно?",
    },
    hint: {
      uz: "Bu javob tavsiyaga ta'sir qilmaydi — faqat farmatsevt bilan maslahatlashish kerakligini ko'rsatadi",
      ru: "Ответ не влияет на подбор — он лишь показывает, нужна ли консультация фармацевта",
    },
    guidance: {
      uz: "Nima uchun bu muhim? Ba'zi dori vositalari vitaminlar so'rilishini bloklaydi va farmatsevt konsultatsiyasini talab qiladi.",
      ru: "Почему это важно? Некоторые лекарства блокируют всасывание витаминов и требуют консультации фармацевта.",
    },
    multiSelect: false,
    options: [
      { id: "none", label: { uz: "Yo'q", ru: "Нет" }, topics: {} },
      { id: "some", label: { uz: "Ha", ru: "Да" }, seeDoctor: true },
    ],
  },
  {
    id: "pregnancy",
    question: {
      uz: "Homiladorlik yoki emizish davridamisiz?",
      ru: "Беременность или период кормления?",
    },
    guidance: {
      uz: "Nima uchun bu muhim? Homiladorlikda foliy kislotasi va temir preparatlari faqat shifokor nazorati ostida tayinlanadi.",
      ru: "Почему это важно? При беременности фолиевая кислота и железо назначаются только под контролем врача.",
    },
    showIf: { question: "who", includesAny: ["self-woman"] },
    multiSelect: false,
    options: [
      { id: "no", label: { uz: "Yo'q / tegishli emas", ru: "Нет / не относится" }, topics: {} },
      { id: "yes", label: { uz: "Ha", ru: "Да" }, topics: { pregnancy: 3 }, seeDoctor: true },
    ],
  },
  {
    id: "experience",
    question: {
      uz: "Ilgari vitamin qabul qilganmisiz?",
      ru: "Принимали ли витамины раньше?",
    },
    guidance: {
      uz: "Nima uchun bu muhim? Vitamin qabul qilish tajribangiz doza va kurs davomiyligini to'g'ri rejalashtirishga yordam beradi.",
      ru: "Почему это важно? Ваш опыт приема витаминов помогает правильно рассчитать дозировку и курс.",
    },
    multiSelect: false,
    options: [
      { id: "never", label: { uz: "Yo'q, birinchi marta", ru: "Нет, впервые" }, topics: {} },
      { id: "sometimes", label: { uz: "Ba'zan, tizimsiz", ru: "Иногда, бессистемно" }, topics: {} },
      { id: "regular", label: { uz: "Ha, muntazam", ru: "Да, регулярно" }, topics: {} },
    ],
  },
];

export function getQuizQuestions(locale: Locale): QuizQuestion[] {
  return raw.map((q) => ({
    id: q.id,
    question: q.question[locale],
    hint: q.hint?.[locale],
    guidance: q.guidance?.[locale],
    multiSelect: q.multiSelect,
    options: q.options.map((o) => ({
      id: o.id,
      label: o.label[locale],
      topics: o.topics,
      ingredients: o.ingredients,
      seeDoctor: o.seeDoctor,
    })),
    showIf: q.showIf,
  }));
}

/**
 * The questions that apply given the answers so far.
 *
 * Called on every render rather than precomputed: changing an earlier answer
 * has to be able to bring a later question back.
 */
export function visibleQuestions(all: QuizQuestion[], answers: QuizAnswerMap): QuizQuestion[] {
  return all.filter((q) => {
    if (!q.showIf) return true;
    const given = answers[q.showIf.question] ?? [];
    return q.showIf.includesAny.some((id) => given.includes(id));
  });
}

export const QUIZ_LENGTH = raw.length;
