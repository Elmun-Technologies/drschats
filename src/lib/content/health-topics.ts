import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

/*
  Health topics are the SEO backbone of the storefront.

  A visitor does not search for "Magnesium" — they search for "why am I always
  tired". Three families of landing pages cover that intent and all three share
  one shape, so they share one model:

    goal     /goals/immunity      — what the visitor wants to achieve
    symptom  /symptoms/fatigue    — what the visitor is experiencing
    vitamin  /vitamins/vitamin-d  — the substance itself

  Every topic funnels into the same places: related products, the ingredients
  behind them, a credentialed doctor (E-E-A-T) and neighbouring topics.

  Editorial note: `sections` and `faq` carry health copy. They are authored in
  Sanity and reviewed by the medical board — the static seed below is
  deliberately conservative and factual, never a therapeutic claim.
*/

export type HealthTopicKind = "goal" | "symptom" | "vitamin";

export const TOPIC_KINDS: HealthTopicKind[] = ["goal", "symptom", "vitamin"];

/** URL segment each family lives under. */
export const TOPIC_BASE_PATH: Record<HealthTopicKind, string> = {
  goal: "/goals",
  symptom: "/symptoms",
  vitamin: "/vitamins",
};

export interface TopicSection {
  title: string;
  body: string;
}

export interface TopicFaq {
  question: string;
  answer: string;
}

export interface HealthTopic {
  kind: HealthTopicKind;
  slug: string;
  name: string;
  /** Short supporting line under the H1. */
  headline: string;
  /** Opening paragraph — also used as the meta description. */
  intro: string;
  /** "What is it", "Who needs it", "When to take", "What it combines with"… */
  sections: TopicSection[];
  /** Symptom signs, or goal benefits — rendered as a checklist. */
  bullets: string[];
  /** Ingredient slugs from the ingredient guide. */
  ingredientSlugs: string[];
  /** Shopflow product slugs to surface. */
  productSlugs: string[];
  /** Shopflow category slugs to link into the catalogue. */
  categorySlugs: string[];
  /** Other topic slugs (any family) for internal linking. */
  relatedSlugs: string[];
  faq: TopicFaq[];
}

interface RawHealthTopic {
  kind: HealthTopicKind;
  slug: string;
  name: L;
  headline: L;
  intro: L;
  sections: L<TopicSection[]>;
  bullets: L<string[]>;
  ingredientSlugs: string[];
  productSlugs: string[];
  categorySlugs: string[];
  relatedSlugs: string[];
  faq: L<TopicFaq[]>;
}

const raw: RawHealthTopic[] = [
  {
    kind: "goal",
    slug: "immunity",
    name: { uz: "Immunitet", ru: "Иммунитет" },
    headline: {
      uz: "Immun tizimini qo'llab-quvvatlaydigan nutriyentlar",
      ru: "Нутриенты для поддержки иммунной системы",
    },
    intro: {
      uz: "Immun tizimi kundalik ovqatlanish, uyqu va stress darajasiga bog'liq. Quyida immunitet uchun eng ko'p o'rganilgan nutriyentlar va ular qaysi mahsulotlarda uchrashi keltirilgan.",
      ru: "Иммунная система зависит от питания, сна и уровня стресса. Ниже — наиболее изученные нутриенты для иммунитета и продукты, в которых они содержатся.",
    },
    sections: {
      uz: [
        {
          title: "Immunitet nimaga bog'liq?",
          body: "Immun javobi bir nechta omilga bog'liq: yetarli uyqu, oqsil va mikroelementlar bilan ta'minlangan ovqatlanish, jismoniy faollik va stress darajasi. Bitta nutriyent immunitetni «ko'taradi» degan tasavvur soddalashtirilgan — nutriyentlar yetishmovchilikni to'ldiradi, mavjud normani oshirmaydi.",
        },
        {
          title: "Kimga ko'proq e'tibor kerak?",
          body: "Quyosh kam bo'lgan oylarda yashovchilar, ko'p sayohat qiladiganlar, katta jismoniy yuklama ostidagilar va cheklangan parhezdagilar mikroelement yetishmovchiligi xavfi yuqori guruhga kiradi.",
        },
        {
          title: "Qachon qabul qilinadi?",
          body: "Yog'da eriydigan vitaminlar (D, A, E, K) ovqat bilan yaxshi so'riladi. Suvda eriydiganlari (C, B guruhi) kun davomida taqsimlanishi mumkin. Aniq rejim mahsulot yorlig'ida ko'rsatiladi.",
        },
      ],
      ru: [
        {
          title: "От чего зависит иммунитет?",
          body: "Иммунный ответ зависит от нескольких факторов: достаточный сон, питание с белком и микроэлементами, физическая активность и уровень стресса. Представление о том, что один нутриент «поднимает» иммунитет, упрощённое — нутриенты восполняют дефицит, а не поднимают норму выше нормы.",
        },
        {
          title: "Кому стоит уделить больше внимания?",
          body: "В группу повышенного риска дефицита микроэлементов входят те, кто живёт в месяцы с малым количеством солнца, много путешествует, испытывает большие физические нагрузки или придерживается ограниченного рациона.",
        },
        {
          title: "Когда принимать?",
          body: "Жирорастворимые витамины (D, A, E, K) лучше усваиваются с едой. Водорастворимые (C, группа B) можно распределить в течение дня. Точный режим указан на упаковке продукта.",
        },
      ],
    },
    bullets: {
      uz: [
        "Vitamin C — antioksidant himoya",
        "Vitamin D3 — immun hujayralari faoliyati",
        "Sink — shilliq qavat butunligi",
        "Yetarli uyqu va oqsil",
      ],
      ru: [
        "Витамин C — антиоксидантная защита",
        "Витамин D3 — работа иммунных клеток",
        "Цинк — целостность слизистых",
        "Достаточный сон и белок",
      ],
    },
    ingredientSlugs: ["vitamin-c", "vitamin-d3", "zinc"],
    productSlugs: [],
    categorySlugs: ["immunity", "vitamins"],
    relatedSlugs: ["frequent-colds", "vitamin-d", "vitamin-c"],
    faq: {
      uz: [
        {
          question: "Immunitet uchun vitaminlarni doimiy ichish kerakmi?",
          answer: "Yo'q. Nutriyentlar yetishmovchilik bo'lganda tavsiya etiladi. Doimiy qabul qilishdan oldin shifokor bilan maslahatlashing va analiz topshiring.",
        },
        {
          question: "Bolalarga ham shu mahsulotlar mos keladimi?",
          answer: "Bolalar uchun alohida dozalar va shakllar mavjud. Kattalar uchun mo'ljallangan mahsulotni bolaga bermang — yosh chegarasi yorliqda ko'rsatiladi.",
        },
      ],
      ru: [
        {
          question: "Нужно ли принимать витамины для иммунитета постоянно?",
          answer: "Нет. Нутриенты рекомендуются при дефиците. Перед постоянным приёмом проконсультируйтесь с врачом и сдайте анализы.",
        },
        {
          question: "Подходят ли эти продукты детям?",
          answer: "Для детей существуют отдельные дозировки и формы. Не давайте ребёнку продукт, предназначенный для взрослых — возрастное ограничение указано на упаковке.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "sleep",
    name: { uz: "Uyqu", ru: "Сон" },
    headline: {
      uz: "Uyquni qo'llab-quvvatlaydigan nutriyentlar va odatlar",
      ru: "Нутриенты и привычки для поддержки сна",
    },
    intro: {
      uz: "Uyqu sifati kun tartibi, kofein va ekran vaqtiga bog'liq. Ba'zi mikroelementlar asab tizimi va mushak bo'shashuvida ishtirok etadi.",
      ru: "Качество сна зависит от режима дня, кофеина и экранного времени. Некоторые микроэлементы участвуют в работе нервной системы и расслаблении мышц.",
    },
    sections: {
      uz: [
        {
          title: "Uyquga nima ta'sir qiladi?",
          body: "Yorug'lik rejimi, kechki kofein, kech ovqatlanish va stress darajasi uyquga eng ko'p ta'sir qiladigan omillar. Nutriyentlar bu omillarni almashtirmaydi — ular faqat yetishmovchilikni to'ldiradi.",
        },
        {
          title: "Qaysi nutriyentlar o'rganilgan?",
          body: "Magniy mushak va asab tizimi ishida ishtirok etadi. B guruhi vitaminlari energiya almashinuvida qatnashadi. Aniq ta'sir individual va yetishmovchilik darajasiga bog'liq.",
        },
        {
          title: "Qachon qabul qilinadi?",
          body: "Magniy odatda kechqurun tavsiya etiladi. Aniq vaqt va doza mahsulot yorlig'ida ko'rsatiladi.",
        },
      ],
      ru: [
        {
          title: "Что влияет на сон?",
          body: "Световой режим, вечерний кофеин, поздний приём пищи и уровень стресса — факторы, влияющие на сон сильнее всего. Нутриенты не заменяют эти факторы, они лишь восполняют дефицит.",
        },
        {
          title: "Какие нутриенты изучены?",
          body: "Магний участвует в работе мышц и нервной системы. Витамины группы B участвуют в энергетическом обмене. Конкретный эффект индивидуален и зависит от степени дефицита.",
        },
        {
          title: "Когда принимать?",
          body: "Магний обычно рекомендуют вечером. Точное время и дозировка указаны на упаковке продукта.",
        },
      ],
    },
    bullets: {
      uz: [
        "Magniy — mushak va asab tizimi",
        "Barqaror uyqu vaqti",
        "Kechqurun kofeinni cheklash",
        "Yotishdan oldin ekran vaqtini kamaytirish",
      ],
      ru: [
        "Магний — мышцы и нервная система",
        "Стабильное время сна",
        "Ограничение кофеина вечером",
        "Меньше экранов перед сном",
      ],
    },
    ingredientSlugs: ["magnesium"],
    productSlugs: [],
    categorySlugs: ["sleep"],
    relatedSlugs: ["insomnia", "stress", "magnesium"],
    faq: {
      uz: [
        {
          question: "Magniy uyquni yaxshilaydimi?",
          answer: "Magniy asab-mushak faoliyatida ishtirok etadi. Uyqu buzilishi ko'p sabablarga bog'liq bo'lgani uchun uzoq davom etsa shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Улучшает ли магний сон?",
          answer: "Магний участвует в нервно-мышечной работе. Нарушения сна имеют много причин — при длительных нарушениях обратитесь к врачу.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "fatigue",
    name: { uz: "Doimiy charchoq", ru: "Постоянная усталость" },
    headline: {
      uz: "Charchoqning mumkin bo'lgan sabablari va qachon shifokorga borish kerak",
      ru: "Возможные причины усталости и когда обращаться к врачу",
    },
    intro: {
      uz: "Doimiy charchoq — o'z-o'zidan tashxis emas, balki belgi. Uning ortida uyqu yetishmovchiligidan tortib kamqonlik yoki qalqonsimon bez muammolarigacha turli sabablar turishi mumkin.",
      ru: "Постоянная усталость — не диагноз, а симптом. За ней могут стоять разные причины: от недосыпа до анемии или нарушений щитовидной железы.",
    },
    sections: {
      uz: [
        {
          title: "Eng keng tarqalgan sabablar",
          body: "Surunkali uyqu yetishmovchiligi, stress, harakatsiz turmush tarzi, suvsizlanish, temir yoki B12 yetishmovchiligi, qalqonsimon bez funksiyasi buzilishi. Sabablar ko'p bo'lgani uchun o'z-o'zini davolash tavsiya etilmaydi.",
        },
        {
          title: "Qachon shifokorga murojaat qilish kerak?",
          body: "Agar charchoq 2-3 haftadan ortiq davom etsa, dam olishdan keyin o'tmasa, vazn o'zgarishi, hansirash, yurak urishining tezlashishi yoki soch to'kilishi bilan birga kelsa — analiz topshirish uchun shifokorga murojaat qiling.",
        },
        {
          title: "Analizsiz nima qilish mumkin?",
          body: "Uyqu rejimini barqarorlashtirish, kunlik suv miqdorini nazorat qilish, ovqatda oqsil ulushini oshirish va harakatni ko'paytirish — bular xavfsiz va sabab qidirishga xalaqit bermaydi.",
        },
      ],
      ru: [
        {
          title: "Наиболее частые причины",
          body: "Хронический недосып, стресс, малоподвижный образ жизни, обезвоживание, дефицит железа или B12, нарушение функции щитовидной железы. Причин много, поэтому самолечение не рекомендуется.",
        },
        {
          title: "Когда обращаться к врачу?",
          body: "Если усталость длится дольше 2–3 недель, не проходит после отдыха, сопровождается изменением веса, одышкой, учащённым сердцебиением или выпадением волос — обратитесь к врачу для анализов.",
        },
        {
          title: "Что можно сделать до анализов?",
          body: "Стабилизировать режим сна, следить за питьевым режимом, увеличить долю белка в рационе и добавить движение — это безопасно и не мешает поиску причины.",
        },
      ],
    },
    bullets: {
      uz: [
        "Uyqu 7-9 soat, barqaror vaqtda",
        "Temir va B12 darajasini tekshirish",
        "Qalqonsimon bez funksiyasini tekshirish",
        "Kunlik harakat",
      ],
      ru: [
        "Сон 7–9 часов в стабильное время",
        "Проверить уровень железа и B12",
        "Проверить функцию щитовидной железы",
        "Ежедневная активность",
      ],
    },
    ingredientSlugs: ["magnesium", "vitamin-d3"],
    productSlugs: [],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["anemia", "sleep", "stress"],
    faq: {
      uz: [
        {
          question: "Charchoqda qaysi analizlarni topshirish kerak?",
          answer: "Odatda umumiy qon tahlili, ferritin, vitamin D va qalqonsimon bez gormonlari tekshiriladi. Aniq ro'yxatni shifokor belgilaydi.",
        },
        {
          question: "Vitaminlar charchoqni yo'qotadimi?",
          answer: "Faqat charchoq aniq yetishmovchilik bilan bog'liq bo'lsa. Sabab boshqa bo'lsa, vitaminlar yordam bermaydi va tashxisni kechiktiradi.",
        },
      ],
      ru: [
        {
          question: "Какие анализы сдать при усталости?",
          answer: "Обычно проверяют общий анализ крови, ферритин, витамин D и гормоны щитовидной железы. Точный список определяет врач.",
        },
        {
          question: "Уберут ли витамины усталость?",
          answer: "Только если усталость связана с подтверждённым дефицитом. При другой причине витамины не помогут и отсрочат диагноз.",
        },
      ],
    },
  },
];

function localise(topic: RawHealthTopic, locale: Locale): HealthTopic {
  return {
    kind: topic.kind,
    slug: topic.slug,
    name: topic.name[locale],
    headline: topic.headline[locale],
    intro: topic.intro[locale],
    sections: topic.sections[locale],
    bullets: topic.bullets[locale],
    ingredientSlugs: topic.ingredientSlugs,
    productSlugs: topic.productSlugs,
    categorySlugs: topic.categorySlugs,
    relatedSlugs: topic.relatedSlugs,
    faq: topic.faq[locale],
  };
}

export function getHealthTopics(locale: Locale, kind?: HealthTopicKind): HealthTopic[] {
  return raw
    .filter((t) => (kind ? t.kind === kind : true))
    .map((t) => localise(t, locale));
}

export function getHealthTopic(slug: string, locale: Locale): HealthTopic | null {
  const found = raw.find((t) => t.slug === slug);
  return found ? localise(found, locale) : null;
}

/** Every (kind, slug) pair — used by the sitemap and static params. */
export function getHealthTopicIndex(): { kind: HealthTopicKind; slug: string }[] {
  return raw.map((t) => ({ kind: t.kind, slug: t.slug }));
}
