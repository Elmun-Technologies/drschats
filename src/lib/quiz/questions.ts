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
      uz: "Nima uchun bu muhim? Yosh va jinsga qarab sutkalik ehtiyoj meʼyorlari farq qiladi.",
      ru: "Почему это важно? В зависимости от пола и возраста суточные нормы потребления различаются.",
    },
    multiSelect: false,
    /*
      Six doors, not four.

      "Oʻzim uchun (ayol / erkak)" used to be the only way to say "for myself",
      which left out the two audiences the shop actually sells to: someone
      buying for a parent over 60, and someone recovering from an illness or an
      operation. Both were reachable only by picking "oʻzim uchun" and reading
      the result loosely. The doors are the question, so the question has to
      offer them.

      A "for myself or as a gift" question and a "taken vitamins before?"
      question used to follow; neither changed the result (the gift one
      promised wrapping the shop does not offer), so both were removed.
    */
    options: [
      {
        id: "self-woman",
        label: { uz: "Ayolga", ru: "Женщине" },
        topics: { beauty: 1, immunity: 0.5 },
        ingredients: { collagen: 1, biotin: 1 },
      },
      {
        id: "self-man",
        label: { uz: "Erkakka", ru: "Мужчине" },
        topics: { energy: 1, immunity: 0.5 },
        ingredients: { magnesium: 1 },
      },
      {
        id: "expectant",
        label: { uz: "Boʻlajak onaga", ru: "Будущей маме" },
        topics: { pregnancy: 3, immunity: 1 },
        ingredients: { "vitamin-d3": 1, iron: 1 },
        seeDoctor: true,
      },
      {
        id: "child",
        label: { uz: "Bolaga", ru: "Ребёнку" },
        topics: { kids: 2, immunity: 1 },
        ingredients: { "vitamin-d3": 1, "vitamin-c": 1 },
      },
      {
        id: "parent",
        label: { uz: "60+ ota-onaga", ru: "Родителям 60+" },
        topics: { bones: 2, heart: 1 },
        ingredients: { "vitamin-d3": 1, "vitamin-k2": 1, "epa-dha": 1 },
      },
      {
        id: "recovery",
        label: { uz: "Kasallik yoki operatsiyadan keyin", ru: "После болезни или операции" },
        topics: { fatigue: 2, immunity: 1 },
        ingredients: { "omega-3": 1, "vitamin-c": 1 },
        seeDoctor: true,
      },
    ],
  },
  {
    id: "age",
    question: { uz: "Yosh guruhi", ru: "Возрастная группа" },
    // A child is under 18 and a parent is 60+: the answer is already given.
    showIf: { question: "who", includesAny: ["self-woman", "self-man", "expectant", "recovery"] },
    guidance: {
      uz: "Nima uchun bu muhim? Mahsulotlarning tavsiya etilgan yoshi turlicha — tanlov shunga qarab qilinadi.",
      ru: "Почему это важно? У продуктов разный рекомендованный возраст — подборка это учитывает.",
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
      uz: "Sizni nima koʻproq bezovta qiladi?",
      ru: "Что беспокоит больше всего?",
    },
    hint: { uz: "Bir nechtasini tanlash mumkin", ru: "Можно выбрать несколько" },
    guidance: {
      uz: "Nima uchun bu muhim? Tanlov siz belgilagan mavzular boʻyicha tuziladi.",
      ru: "Почему это важно? Подборка строится по отмеченным вами темам.",
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
        label: { uz: "Soch toʻkilishi, teri holati", ru: "Выпадение волос, состояние кожи" },
        topics: { beauty: 3, "hair-loss": 2 },
        ingredients: { collagen: 2, biotin: 2, zinc: 1 },
      },
      {
        id: "bones",
        label: { uz: "Suyak va boʻgʻimlar", ru: "Кости и суставы" },
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
  /*
    Six lifestyle questions used to follow here (sleep hours, sun, activity,
    diet, screen time, smoking): 11 screens and 22 taps before any result.
    Measured on the catalogue (2026-11) they did not move the top three
    products in 18 of 18 profiles, and harsh answers pushed a generic
    multivitamin above what the visitor said bothers them (colds → ImmunoVit
    fell behind Multi + Biotin). Two of them (screen → "vision", activity →
    "sport") fed topics that no health topic carries, so they never counted.
    The test now asks who, age, what bothers you and the two safety questions.
  */
  {
    id: "medication",
    question: {
      uz: "Hozir doimiy dori qabul qilinyaptimi?",
      ru: "Принимаются ли сейчас лекарства постоянно?",
    },
    hint: {
      uz: "Bu javob tavsiyaga taʼsir qilmaydi — faqat farmatsevt bilan maslahatlashish kerakligini koʻrsatadi",
      ru: "Ответ не влияет на подбор — он лишь показывает, нужна ли консультация фармацевта",
    },
    guidance: {
      uz: "Nima uchun bu muhim? Dori qabul qilinayotganda qoʻshimchani mutaxassis bilan kelishish kerak.",
      ru: "Почему это важно? При приёме лекарств добавку нужно согласовать со специалистом.",
    },
    multiSelect: false,
    options: [
      { id: "none", label: { uz: "Yoʻq", ru: "Нет" }, topics: {} },
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
    // "Boʻlajak onaga" has already answered this; only a woman buying for herself is asked.
    showIf: { question: "who", includesAny: ["self-woman"] },
    multiSelect: false,
    options: [
      { id: "no", label: { uz: "Yoʻq / tegishli emas", ru: "Нет / не относится" }, topics: {} },
      { id: "yes", label: { uz: "Ha", ru: "Да" }, topics: { pregnancy: 3 }, seeDoctor: true },
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
