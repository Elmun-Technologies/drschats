import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

/*
  Programs are the "buy a plan, not a bottle" layer.

  A customer who wants to fix their sleep does not want to compare magnesium
  SKUs — they want a set that works together for a month. A program bundles
  5–6 products behind one goal, one duration and one discount, and drops the
  whole set into the cart in a single action.

  Product selection mirrors health topics: pinned `productSlugs` win, and the
  program's categories fill the rest. The seed below pins nothing, because
  real product slugs come from the commerce backend — editors pin them in
  Sanity once the catalogue is final.
*/

export interface ProgramStep {
  title: string;
  body: string;
}

export interface ProgramFaq {
  question: string;
  answer: string;
}

export interface Program {
  slug: string;
  name: string;
  headline: string;
  intro: string;
  /** Shown as "30 kun" / "30 дней". */
  durationDays: number;
  /** Applied to every line when the whole program is added to the cart. */
  discountPercent: number;
  /** Who the program is for — rendered as a checklist. */
  forWhom: string[];
  /** How the month is structured. */
  steps: ProgramStep[];
  productSlugs: string[];
  categorySlugs: string[];
  ingredientSlugs: string[];
  /** Health topic slugs for cross-linking. */
  topicSlugs: string[];
  faq: ProgramFaq[];
}

interface RawProgram {
  slug: string;
  name: L;
  headline: L;
  intro: L;
  durationDays: number;
  discountPercent: number;
  forWhom: L<string[]>;
  steps: L<ProgramStep[]>;
  productSlugs: string[];
  categorySlugs: string[];
  ingredientSlugs: string[];
  topicSlugs: string[];
  faq: L<ProgramFaq[]>;
}

const raw: RawProgram[] = [
  {
    slug: "immunity-30",
    name: { uz: "30 kunlik immunitet", ru: "Иммунитет за 30 дней" },
    headline: {
      uz: "Sovuq mavsumga tayyorgarlik uchun bir oylik to'plam",
      ru: "Месячный набор для подготовки к холодному сезону",
    },
    intro: {
      uz: "Immun tizimi uchun eng ko'p o'rganilgan nutriyentlar bir oylik miqdorda. To'plam bitta bosishda savatga tushadi.",
      ru: "Наиболее изученные нутриенты для иммунной системы в месячном объёме. Набор добавляется в корзину одним нажатием.",
    },
    durationDays: 30,
    discountPercent: 12,
    forWhom: {
      uz: [
        "Sovuq mavsumga tayyorgarlik ko'rayotganlar",
        "Ko'p odam bilan ishlaydiganlar",
        "Quyosh kam bo'lgan oylarda yashovchilar",
      ],
      ru: [
        "Готовящимся к холодному сезону",
        "Работающим с большим потоком людей",
        "Живущим в месяцы с малым количеством солнца",
      ],
    },
    steps: {
      uz: [
        { title: "1–10 kun", body: "Kunlik rejimni shakllantiring: vitaminlarni bir xil vaqtda, ovqat bilan qabul qiling." },
        { title: "11–20 kun", body: "Uyqu va suv rejimini nazorat qiling — nutriyentlar shu ikkisisiz kutilgan natijani bermaydi." },
        { title: "21–30 kun", body: "Holatingizni baholang. Davom ettirish kerakmi — shifokor bilan maslahatlashing." },
      ],
      ru: [
        { title: "1–10 день", body: "Сформируйте режим: принимайте витамины в одно и то же время, вместе с едой." },
        { title: "11–20 день", body: "Контролируйте сон и питьевой режим — без них нутриенты не дадут ожидаемого эффекта." },
        { title: "21–30 день", body: "Оцените самочувствие. Продолжать ли — обсудите с врачом." },
      ],
    },
    productSlugs: ["immuno-complex", "vitamin-d3-k2"],
    categorySlugs: ["immunity", "vitamins"],
    ingredientSlugs: ["vitamin-c", "vitamin-d3", "zinc"],
    topicSlugs: ["immunity", "frequent-colds"],
    faq: {
      uz: [
        {
          question: "To'plamdagi mahsulotlarni birga ichsa bo'ladimi?",
          answer: "To'plam bir vaqtda qabul qilinadigan qilib tuzilgan, lekin aniq rejim har bir mahsulot yorlig'ida ko'rsatiladi. Doimiy dori qabul qilayotgan bo'lsangiz, avval farmatsevt bilan maslahatlashing.",
        },
        {
          question: "30 kundan keyin nima bo'ladi?",
          answer: "Bu davomiy kurs emas. 30 kundan keyin holatingizni baholang va davom ettirish kerakligini shifokor bilan hal qiling.",
        },
      ],
      ru: [
        {
          question: "Можно ли принимать продукты набора вместе?",
          answer: "Набор составлен для совместного приёма, но точный режим указан на упаковке каждого продукта. Если вы постоянно принимаете лекарства, сначала проконсультируйтесь с фармацевтом.",
        },
        {
          question: "Что после 30 дней?",
          answer: "Это не постоянный курс. Через 30 дней оцените самочувствие и решите с врачом, продолжать ли.",
        },
      ],
    },
  },
  {
    slug: "stress-recovery",
    name: { uz: "Stressdan tiklanish", ru: "Восстановление после стресса" },
    headline: {
      uz: "Asab tizimi va uyqu uchun bir oylik reja",
      ru: "Месячный план для нервной системы и сна",
    },
    intro: {
      uz: "Uzoq davom etgan yuklamadan keyin uyqu va bo'shashuvni tiklashga qaratilgan to'plam.",
      ru: "Набор, направленный на восстановление сна и расслабления после длительной нагрузки.",
    },
    durationDays: 30,
    discountPercent: 12,
    forWhom: {
      uz: ["Uzoq davom etgan ish yuklamasidan keyin", "Uyquga ketish qiyin bo'lganlar", "Kechqurun bo'shasha olmaydiganlar"],
      ru: ["После длительной рабочей нагрузки", "Кому трудно засыпать", "Кто не может расслабиться вечером"],
    },
    steps: {
      uz: [
        { title: "1-hafta", body: "Yotish vaqtini belgilang va har kuni bir xil vaqtda yoting." },
        { title: "2–3-hafta", body: "Kechki kofein va ekran vaqtini kamaytiring." },
        { title: "4-hafta", body: "Uyqu sifatini baholang; buzilish davom etsa shifokorga murojaat qiling." },
      ],
      ru: [
        { title: "1-я неделя", body: "Определите время отхода ко сну и ложитесь в одно и то же время." },
        { title: "2–3-я неделя", body: "Сократите вечерний кофеин и экранное время." },
        { title: "4-я неделя", body: "Оцените качество сна; если нарушения сохраняются — обратитесь к врачу." },
      ],
    },
    productSlugs: ["magnesium-b6", "omega-3-premium"],
    categorySlugs: ["sleep", "vitamins"],
    ingredientSlugs: ["magnesium"],
    topicSlugs: ["sleep", "stress"],
    faq: {
      uz: [
        {
          question: "Bu uyqu dorisimi?",
          answer: "Yo'q. To'plamda dori vositalari yo'q — bu biologik faol qo'shimchalar. Uyqusizlik uzoq davom etsa, sabab tibbiy bo'lishi mumkin, shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Это снотворное?",
          answer: "Нет. В наборе нет лекарственных средств — это биологически активные добавки. Если бессонница длится долго, причина может быть медицинской — обратитесь к врачу.",
        },
      ],
    },
  },
  {
    slug: "healthy-skin",
    name: { uz: "Sog'lom teri va soch", ru: "Здоровая кожа и волосы" },
    headline: { uz: "Teri, soch va tirnoq uchun bir oylik to'plam", ru: "Месячный набор для кожи, волос и ногтей" },
    intro: {
      uz: "Teri elastikligi, soch va tirnoq mustahkamligi uchun eng ko'p so'raladigan nutriyentlar.",
      ru: "Самые востребованные нутриенты для эластичности кожи, крепости волос и ногтей.",
    },
    durationDays: 30,
    discountPercent: 12,
    forWhom: {
      uz: ["Soch to'kilishini sezayotganlar", "Tirnoq sinishidan shikoyat qiluvchilar", "Teri quruqligi bilan"],
      ru: ["Кто замечает выпадение волос", "Кто жалуется на ломкость ногтей", "При сухости кожи"],
    },
    steps: {
      uz: [
        { title: "1-hafta", body: "Kunlik oqsil va suv miqdorini nazorat qiling — teri va soch shundan quriladi." },
        { title: "2–4-hafta", body: "To'plamni muntazam qabul qiling. Natija odatda bir necha oyda ko'rinadi." },
      ],
      ru: [
        { title: "1-я неделя", body: "Контролируйте суточный белок и воду — кожа и волосы строятся из этого." },
        { title: "2–4-я неделя", body: "Принимайте набор регулярно. Результат обычно виден через несколько месяцев." },
      ],
    },
    productSlugs: ["collagen-beauty", "multivitamin-daily"],
    categorySlugs: ["beauty"],
    ingredientSlugs: ["collagen", "biotin", "zinc"],
    topicSlugs: ["beauty", "hair-loss"],
    faq: {
      uz: [
        {
          question: "Qachon natija ko'rinadi?",
          answer: "Soch va tirnoq sekin o'sadi — o'zgarishni baholash uchun kamida 2–3 oy kerak. Keskin to'kilish bo'lsa, sabab tibbiy bo'lishi mumkin.",
        },
      ],
      ru: [
        {
          question: "Когда будет результат?",
          answer: "Волосы и ногти растут медленно — для оценки изменений нужно минимум 2–3 месяца. При резком выпадении причина может быть медицинской.",
        },
      ],
    },
  },
  {
    slug: "office-worker",
    name: { uz: "Ofis xodimi", ru: "Офисный работник" },
    headline: { uz: "Kam harakat va ko'p ekran uchun reja", ru: "План для малой подвижности и долгого экрана" },
    intro: {
      uz: "Kun bo'yi o'tirib ishlaydigan va ekran oldida ko'p vaqt o'tkazadiganlar uchun to'plam.",
      ru: "Набор для тех, кто весь день работает сидя и много времени проводит за экраном.",
    },
    durationDays: 30,
    discountPercent: 12,
    forWhom: {
      uz: ["Kuniga 8+ soat ekran oldida", "Kun bo'yi o'tirib ishlaydiganlar", "Ochiq havoda kam bo'ladiganlar"],
      ru: ["8+ часов в день за экраном", "Кто работает сидя весь день", "Кто мало бывает на улице"],
    },
    steps: {
      uz: [
        { title: "Har kuni", body: "Har soatda 5 daqiqa turing va uzoqqa qarang — bu hech qanday qo'shimcha almashtira olmaydigan odat." },
        { title: "Har hafta", body: "Kamida 150 daqiqa o'rtacha jismoniy faollik." },
      ],
      ru: [
        { title: "Каждый день", body: "Каждый час вставайте на 5 минут и смотрите вдаль — эту привычку не заменит никакая добавка." },
        { title: "Каждую неделю", body: "Минимум 150 минут умеренной физической активности." },
      ],
    },
    productSlugs: ["omega-3-premium", "vitamin-d3-k2", "magnesium-b6"],
    categorySlugs: ["vitamins", "immunity"],
    ingredientSlugs: ["magnesium", "vitamin-d3", "epa-dha"],
    topicSlugs: ["fatigue", "vision"],
    faq: {
      uz: [
        {
          question: "Ko'z uchun alohida nimadir kerakmi?",
          answer: "Ekran oldida ishlash ko'zni charchatadi, lekin buning asosiy yechimi — tanaffus va yorug'lik rejimi. Nutriyentlar bu odatlarni almashtirmaydi.",
        },
      ],
      ru: [
        {
          question: "Нужно ли что-то отдельно для глаз?",
          answer: "Работа за экраном утомляет глаза, но основное решение — перерывы и световой режим. Нутриенты не заменяют эти привычки.",
        },
      ],
    },
  },
  {
    slug: "womens-health",
    name: { uz: "Ayollar salomatligi", ru: "Женское здоровье" },
    headline: { uz: "Kundalik ehtiyojlar uchun bir oylik to'plam", ru: "Месячный набор для ежедневных потребностей" },
    intro: {
      uz: "Ayollarda ko'proq uchraydigan nutriyent yetishmovchiliklarini qamrab olgan to'plam.",
      ru: "Набор, охватывающий дефициты нутриентов, которые чаще встречаются у женщин.",
    },
    durationDays: 30,
    discountPercent: 12,
    forWhom: {
      uz: ["Kundalik yuklama yuqori bo'lganlar", "Temir yetishmovchiligi tashxisi qo'yilganlar (shifokor nazorati bilan)", "Teri va soch holatiga e'tibor beruvchilar"],
      ru: ["При высокой ежедневной нагрузке", "С установленным дефицитом железа (под контролем врача)", "Кто следит за состоянием кожи и волос"],
    },
    steps: {
      uz: [
        { title: "Boshlashdan oldin", body: "Ferritin va vitamin D darajasini tekshirib olish tavsiya etiladi." },
        { title: "1–4-hafta", body: "To'plamni muntazam qabul qiling, holatingizni kuzatib boring." },
      ],
      ru: [
        { title: "Перед началом", body: "Рекомендуется проверить уровень ферритина и витамина D." },
        { title: "1–4-я неделя", body: "Принимайте набор регулярно, отслеживайте самочувствие." },
      ],
    },
    productSlugs: ["collagen-beauty", "magnesium-b6", "multivitamin-daily"],
    categorySlugs: ["beauty", "vitamins"],
    ingredientSlugs: ["collagen", "vitamin-d3", "magnesium"],
    topicSlugs: ["beauty", "fatigue"],
    faq: {
      uz: [
        {
          question: "Homiladorlik davrida mos keladimi?",
          answer: "Bu to'plam homiladorlik uchun mo'ljallanmagan. Homiladorlik va emizish davrida har qanday qo'shimchani faqat shifokor tavsiyasi bilan qabul qiling.",
        },
      ],
      ru: [
        {
          question: "Подходит ли при беременности?",
          answer: "Этот набор не предназначен для беременности. В период беременности и кормления принимайте любые добавки только по назначению врача.",
        },
      ],
    },
  },
  {
    slug: "kids-growth",
    name: { uz: "Bolalar o'sishi", ru: "Рост детей" },
    headline: { uz: "Maktab yoshidagi bolalar uchun to'plam", ru: "Набор для детей школьного возраста" },
    intro: {
      uz: "Bolalar uchun mo'ljallangan dozalar va shakllardan tuzilgan to'plam.",
      ru: "Набор из дозировок и форм, предназначенных для детей.",
    },
    durationDays: 30,
    discountPercent: 12,
    forWhom: {
      uz: ["Maktab yoshidagi bolalar", "Tez-tez shamollaydigan bolalar", "Cheklangan parhezdagi bolalar"],
      ru: ["Дети школьного возраста", "Часто простужающиеся дети", "Дети с ограниченным рационом"],
    },
    steps: {
      uz: [
        { title: "Boshlashdan oldin", body: "Bolalar uchun har qanday qo'shimchani pediatr bilan kelishing." },
        { title: "Har kuni", body: "Yosh chegarasi va dozani yorliqdan tekshiring — kattalar mahsulotini bermang." },
      ],
      ru: [
        { title: "Перед началом", body: "Любые добавки для детей согласуйте с педиатром." },
        { title: "Каждый день", body: "Проверяйте возрастное ограничение и дозировку на упаковке — не давайте взрослые продукты." },
      ],
    },
    productSlugs: ["vitamin-d3-k2", "omega-3-premium"],
    categorySlugs: ["kids", "immunity"],
    ingredientSlugs: ["vitamin-d3", "vitamin-c"],
    topicSlugs: ["kids", "immunity"],
    faq: {
      uz: [
        {
          question: "Necha yoshdan mos keladi?",
          answer: "Har bir mahsulotning yosh chegarasi yorliqda ko'rsatiladi. Pediatr bilan kelishmasdan boshlamang.",
        },
      ],
      ru: [
        {
          question: "С какого возраста подходит?",
          answer: "Возрастное ограничение каждого продукта указано на упаковке. Не начинайте без согласования с педиатром.",
        },
      ],
    },
  },
  {
    slug: "senior-health",
    name: { uz: "55+ salomatlik", ru: "Здоровье 55+" },
    headline: { uz: "Suyak va yurak uchun bir oylik to'plam", ru: "Месячный набор для костей и сердца" },
    intro: {
      uz: "Yosh o'tgan sari e'tibor talab qiladigan yo'nalishlar — suyak zichligi va yurak-qon tomir tizimi.",
      ru: "Направления, требующие внимания с возрастом — плотность костей и сердечно-сосудистая система.",
    },
    durationDays: 30,
    discountPercent: 12,
    forWhom: {
      uz: ["55 yoshdan yuqori", "Suyak zichligi haqida qayg'uradiganlar", "Yurak salomatligiga e'tibor beruvchilar"],
      ru: ["Старше 55 лет", "Кто беспокоится о плотности костей", "Кто следит за здоровьем сердца"],
    },
    steps: {
      uz: [
        { title: "Boshlashdan oldin", body: "Doimiy dori qabul qilayotgan bo'lsangiz, farmatsevt bilan mosligini tekshiring." },
        { title: "Har kuni", body: "Kunlik harakat — yurish ham suyak va yurak uchun ishlaydi." },
      ],
      ru: [
        { title: "Перед началом", body: "Если принимаете лекарства постоянно, проверьте совместимость с фармацевтом." },
        { title: "Каждый день", body: "Ежедневное движение — даже ходьба работает на кости и сердце." },
      ],
    },
    productSlugs: ["vitamin-d3-k2", "omega-3-premium", "magnesium-b6"],
    categorySlugs: ["vitamins", "immunity"],
    ingredientSlugs: ["vitamin-d3", "vitamin-k2", "epa-dha"],
    topicSlugs: ["bones", "heart"],
    faq: {
      uz: [
        {
          question: "Qon suyultiruvchi dori bilan birga bo'ladimi?",
          answer: "Vitamin K va omega-3 ba'zi dorilar bilan o'zaro ta'sirga kirishishi mumkin. Doimiy dori qabul qilayotgan bo'lsangiz, albatta farmatsevt yoki shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Совместимо ли с разжижающими кровь препаратами?",
          answer: "Витамин K и омега-3 могут взаимодействовать с некоторыми препаратами. Если вы принимаете лекарства постоянно, обязательно проконсультируйтесь с фармацевтом или врачом.",
        },
      ],
    },
  },
];

function localise(program: RawProgram, locale: Locale): Program {
  return {
    slug: program.slug,
    name: program.name[locale],
    headline: program.headline[locale],
    intro: program.intro[locale],
    durationDays: program.durationDays,
    discountPercent: program.discountPercent,
    forWhom: program.forWhom[locale],
    steps: program.steps[locale],
    productSlugs: program.productSlugs,
    categorySlugs: program.categorySlugs,
    ingredientSlugs: program.ingredientSlugs,
    topicSlugs: program.topicSlugs,
    faq: program.faq[locale],
  };
}

export function getPrograms(locale: Locale): Program[] {
  return raw.map((p) => localise(p, locale));
}

export function getProgram(slug: string, locale: Locale): Program | null {
  const found = raw.find((p) => p.slug === slug);
  return found ? localise(found, locale) : null;
}

export function getProgramSlugs(): string[] {
  return raw.map((p) => p.slug);
}
