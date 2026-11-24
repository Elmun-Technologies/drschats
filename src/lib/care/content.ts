import type { Locale } from "@/lib/i18n/routing";
import type { FaqItem } from "@/lib/shopflow/types";
import type { HealthTopicKind } from "@/lib/content/health-topics";

/*
  Copy for the two care hubs, /care/mom and /care/baby (docs/ONA-BOLA.md).
  It lives here rather than in messages/*.json because it is page content in
  two languages, the way health topics are, and the client tracker receives
  only the strings it renders as props.

  Products are listed by slug and only where the pack itself allows it: the
  catalogue has nothing for children under seven, and the page says so
  instead of stretching an adult product into that slot.

  `{first}` and `{recurring}` are filled from /admin/commerce — never write
  the subscription percents out by hand.
*/

export type CareKind = "mom" | "baby";

export const CARE_PATH: Record<CareKind, string> = { mom: "/care/mom", baby: "/care/baby" };

export const BOX_SLUG = "swiss-energy-prenatal-forte-60";

export const KIT_SLUGS = [
  "dr-frei-thermometer-t30",
  "hiew-cooling-plaster-16",
  "dr-frei-turbo-lex-ingalyator",
  "dr-frei-thermometer-t10",
] as const;

/** Pre-ticked in the kit builder: the two things every home with a baby needs first. */
export const KIT_DEFAULT = ["dr-frei-thermometer-t30", "hiew-cooling-plaster-16"] as const;

export const CARE_PHOTO_FIT: Record<CareKind, "contain" | "cover"> = { mom: "cover", baby: "cover" };

export const CARE_PHOTO: Record<CareKind, string> = {
  mom: "/images/stock/st-aud-expectant.webp",
  baby: "/images/stock/st-aud-child.webp",
};

export interface CareStageTile {
  big: string;
  small: string;
  title: string;
  sub: string;
}

export interface CareProductSection {
  id: string;
  title: string;
  lead: string;
  slugs: string[];
}

export interface CareTrackerCopy {
  title: string;
  lead: string;
  dateLabel: string;
  dateHint: string;
  nameLabel?: string;
  save: string;
  clear: string;
  demo: string;
  note: string;
  stored: string;
  outOfRange: string;
  prev: string;
  next: string;
  unit: string;
  unitYears?: string;
  unitMonths?: string;
  stageNames: string[];
  checklist: [string, string][][];
  addChild?: string;
  childrenTitle?: string;
  childDefault?: string;
  remove?: string;
}

export interface CareCopy {
  breadcrumb: string;
  h1: string;
  lead: string;
  heroBadge: string;
  heroTitle: string;
  heroText: string;
  heroCta: string;
  heroCta2: string;
  heroCta2Href: string;
  photoAlt: string;
  stages: CareStageTile[];
  nextTile: CareStageTile & { href: string };
  tracker: CareTrackerCopy;
  sections: CareProductSection[];
  allProducts: string;
  waitlist?: { title: string; text: string; cta: string };
  panel: { eyebrow: string; title: string; text: string; cta: string; href: string };
  box?: {
    eyebrow: string;
    title: string;
    steps: [string, string][];
    interval: string;
    days: string;
    once: string;
    first: string;
    recurring: string;
    cta: string;
    note: string;
  };
  kit?: { eyebrow: string; title: string; text: string; tags: string[]; count: string; cta: string; subscribable: string };
  cross: { big: string; title: string; text: string; cta: string; href: string };
  guidesTitle: string;
  guides: { kind: HealthTopicKind; slug: string }[];
  privacy: { title: string; text: string };
  faq: FaqItem[];
  seoTitle: string;
  seoText: string;
}

const MOM_PRODUCTS: CareProductSection[] = [
  {
    id: "pregnancy",
    title: "",
    lead: "",
    slugs: ["swiss-energy-prenatal-forte-60", "dr-frei-tonometr-a20", "dr-frei-thermometer-t10"],
  },
  {
    id: "after",
    title: "",
    lead: "",
    slugs: [
      "swiss-energy-hair-nail-skin-30",
      "swiss-energy-nature-collagen",
      "swiss-energy-calcivit-30",
      "dr-frei-antistress-magniy-20",
      "swiss-energy-immunovit-30",
      "swiss-energy-vitamin-c-20",
    ],
  },
];

const BABY_PRODUCTS: CareProductSection[] = [
  {
    id: "devices",
    title: "",
    lead: "",
    slugs: [
      "dr-frei-thermometer-t30",
      "hiew-cooling-plaster-16",
      "dr-frei-turbo-lex-ingalyator",
      "dr-frei-turbo-base-ingalyator",
      "dr-frei-thermometer-t10",
      "dr-frei-kids-multivitamins-20",
    ],
  },
];

function withText(sections: CareProductSection[], text: [string, string][]): CareProductSection[] {
  return sections.map((s, i) => ({ ...s, title: text[i][0], lead: text[i][1] }));
}

const COPY: Record<CareKind, Record<Locale, CareCopy>> = {
  mom: {
    uz: {
      breadcrumb: "Onalar uchun",
      h1: "Onalar uchun: homiladorlik va tugʻruqdan keyin",
      lead: "Bepul haftalik kuzatuv, bosqichga mos eslatmalar va oylik quti.",
      heroBadge: "Yangi · bepul kuzatuv",
      heroTitle: "40 hafta — har birida oʻz rejangiz",
      heroText: "Taxminiy tugʻilish sanasini kiriting: hafta va trimester oʻzi hisoblanadi, shu haftada eʼtibor beriladigan narsalar koʻrinadi.",
      heroCta: "Kuzatuvni boshlash",
      heroCta2: "Oylik quti",
      heroCta2Href: "#quti",
      photoAlt: "Homilador ayol",
      stages: [
        { big: "1–13", small: "hafta", title: "1-trimestr", sub: "Birinchi koʻriklar" },
        { big: "14–27", small: "hafta", title: "2-trimestr", sub: "Tekshiruvlar, ovqatlanish" },
        { big: "28–40", small: "hafta", title: "3-trimestr", sub: "Tugʻruqqa tayyorgarlik" },
        { big: "0–6", small: "hafta", title: "Tugʻruqdan keyin", sub: "Oʻzingiz uchun vaqt" },
        { big: "6–12", small: "oy", title: "Emizish davri", sub: "Har bir qoʻshimcha — shifokor bilan" },
      ],
      nextTile: { big: "0–3", small: "yosh", title: "Bola sahifasi", sub: "Bola tugʻilgach — shu yerda", href: "/care/baby" },
      tracker: {
        title: "Haftalik kuzatuv",
        lead: "Sanani kiriting yoki haftani surib koʻring.",
        dateLabel: "Taxminiy tugʻilish sanasi",
        dateHint: "Shifokor aytgan sana",
        save: "Hisoblash",
        clear: "Sanani oʻchirish",
        demo: "Namuna: sana kiritilmagan",
        note: "Hisob taxminiy — koʻrik va muddatlar uchun shifokoringiz belgilagan sanaga tayaning.",
        stored: "Sana faqat shu qurilmada saqlanadi va serverga yuborilmaydi.",
        outOfRange: "Bu sana boʻyicha homiladorlik haftasini hisoblab boʻlmaydi. Bola tugʻilgan boʻlsa — bola sahifasiga oʻting.",
        prev: "Oldingi hafta",
        next: "Keyingi hafta",
        unit: "hafta",
        stageNames: ["1-trimestr", "2-trimestr", "3-trimestr"],
        checklist: [
          [
            ["Koʻrik", "Birinchi koʻrik va tahlillar muddatini shifokor bilan kelishing"],
            ["Roʻyxat", "Qabul qilayotgan dori va qoʻshimchalar roʻyxatini shifokorga koʻrsating"],
            ["Ovqatlanish", "Ratsiondagi oʻzgarishlarni shifokordan soʻrang"],
          ],
          [
            ["Koʻrik", "Shifokor belgilagan tekshiruvlar muddatini tekshiring"],
            ["Tarkib", "Kompleksdagi miqdorlarni shifokor bilan solishtiring"],
            ["Savollar", "Keyingi qabul uchun savollaringizni yozib qoʻying"],
          ],
          [
            ["Tayyorgarlik", "Tugʻruqxona va hujjatlar roʻyxatini tayyorlang"],
            ["Uy", "Bola uchun termometr va uy aptechkasini oldindan tayyorlang"],
            ["Belgilar", "Shifokor aytgan xavotirli belgilarni eslab qoling"],
          ],
        ],
      },
      sections: withText(MOM_PRODUCTS, [
        ["Homiladorlik davri uchun", "Qadoqda homiladorlarga moʻljallangani yozilgan kompleks va uyda kuzatuv uchun jihozlar."],
        ["Tugʻruqdan keyin — oʻzingiz uchun", "Emizish davrida har qanday qoʻshimchani avval shifokor bilan kelishib oling."],
      ]),
      allProducts: "Katalog",
      panel: {
        eyebrow: "Oylik quti · podpiska",
        title: "Homiladorlik qutisi",
        text: "Prenatal Forte har oy uyingizga. Oraliqni oʻzingiz tanlaysiz.",
        cta: "Qutini sozlash",
        href: "#quti",
      },
      box: {
        eyebrow: "Podpiska",
        title: "Oylik quti — boshqaruv sizda",
        steps: [
          ["Oraliqni tanlang", "30, 45, 60 yoki 90 kunda bir marta yetkaziladi."],
          ["Birinchi yetkazishda chegirma", "Birinchi buyurtmada −{first}%, keyingilarida −{recurring}%."],
          ["Tarkibni siz tasdiqlaysiz", "Tarkib oʻzgarishi faqat roziligingiz bilan."],
          ["Istalgan vaqtda toʻxtatish", "Operatorga yozing — toʻxtatamiz yoki bekor qilamiz."],
        ],
        interval: "Yetkazish oraligʻi",
        days: "kun",
        once: "Bir martalik narx",
        first: "Birinchi yetkazish, −{first}%",
        recurring: "Keyingilari, −{recurring}%",
        cta: "Qutini savatga qoʻshish",
        note: "Chegirma foizlari sayt sozlamasidan olinadi.",
      },
      cross: {
        big: "0→3",
        title: "Bola tugʻilgach — bola sahifasi",
        text: "Tugʻilgan sanani kiriting: 0–3 yosh bosqichlari, pediatr koʻrigi eslatmalari va uy aptechkasi.",
        cta: "Bola 0–3 yosh",
        href: "/care/baby",
      },
      guidesTitle: "Qoʻllanmalar",
      guides: [
        { kind: "goal", slug: "pregnancy" },
        { kind: "vitamin", slug: "folic-acid" },
        { kind: "vitamin", slug: "iron" },
        { kind: "vitamin", slug: "calcium" },
      ],
      privacy: {
        title: "Sana faqat sizning qurilmangizda",
        text: "Kuzatuv uchun roʻyxatdan oʻtish shart emas. Sana brauzeringizda saqlanadi, serverga yuborilmaydi va «Sanani oʻchirish» tugmasi bilan oʻchadi.",
      },
      faq: [
        { question: "Kuzatuv pullikmi?", answer: "Yoʻq, haftalik kuzatuv bepul. Roʻyxatdan oʻtish ham shart emas." },
        { question: "Hafta qanchalik aniq hisoblanadi?", answer: "Hafta taxminiy tugʻilish sanasidan hisoblanadi: bu sana oxirgi hayzdan 280 kun keyin deb olinadi. Koʻrik va muddatlar uchun shifokoringiz belgilagan sanaga tayaning." },
        { question: "Oylik quti qanday ishlaydi?", answer: "Prenatal Forte podpiska bilan buyurtma qilinadi: oraliqni 30, 45, 60 yoki 90 kun qilib tanlaysiz. Birinchi yetkazishda −{first}%, keyingilarida −{recurring}% chegirma. Toʻxtatish yoki bekor qilish uchun operatorga yozing." },
        { question: "Mahsulotlar dori vositasimi?", answer: "Yoʻq, bu biologik faol qoʻshimchalar. Ular shifokor nazoratini almashtirmaydi; qabul qilishdan oldin shifokoringiz bilan maslahatlashing." },
        { question: "Emizish davrida qaysi qoʻshimchani tanlash kerak?", answer: "Bu savolga faqat shifokoringiz javob beradi. Sahifadagi mahsulotlarning tarkibini koʻrsating va qabul qilishni u bilan kelishing." },
        { question: "Sanam qayerda saqlanadi?", answer: "Faqat shu qurilmadagi brauzerda. Serverga yuborilmaydi; «Sanani oʻchirish» tugmasi uni darhol oʻchiradi." },
      ],
      seoTitle: "Homiladorlar va yosh onalar uchun vitaminlar — govita",
      seoText: "govita — Oʻzbekistonga rasmiy import qilinadigan vitaminlar va biologik faol qoʻshimchalar doʻkoni. Bu boʻlimda homiladorlarga moʻljallangan kompleks, uyda kuzatuv uchun tonometr va termometr hamda tugʻruqdan keyingi davr uchun mahsulotlar jamlangan. Bepul haftalik kuzatuv taxminiy tugʻilish sanangizdan hafta va trimesterni hisoblaydi. Har qanday qoʻshimchani qabul qilishdan oldin shifokoringiz bilan maslahatlashing.",
    },
    ru: {
      breadcrumb: "Мамам",
      h1: "Мамам: беременность и после родов",
      lead: "Бесплатный календарь по неделям, подсказки по срокам и ежемесячная коробка.",
      heroBadge: "Новое · бесплатный календарь",
      heroTitle: "40 недель — свой план на каждую",
      heroText: "Укажите предполагаемую дату родов: неделя и триместр посчитаются сами, а на странице появится то, на что стоит обратить внимание.",
      heroCta: "Начать календарь",
      heroCta2: "Ежемесячная коробка",
      heroCta2Href: "#quti",
      photoAlt: "Беременная женщина",
      stages: [
        { big: "1–13", small: "нед.", title: "1-й триместр", sub: "Первые обследования" },
        { big: "14–27", small: "нед.", title: "2-й триместр", sub: "Анализы, питание" },
        { big: "28–40", small: "нед.", title: "3-й триместр", sub: "Подготовка к родам" },
        { big: "0–6", small: "нед.", title: "После родов", sub: "Время для себя" },
        { big: "6–12", small: "мес.", title: "Грудное вскармливание", sub: "Любые добавки — с врачом" },
      ],
      nextTile: { big: "0–3", small: "года", title: "Страница малыша", sub: "После рождения — здесь", href: "/care/baby" },
      tracker: {
        title: "Календарь по неделям",
        lead: "Укажите дату или прокрутите недели.",
        dateLabel: "Предполагаемая дата родов",
        dateHint: "Дата, которую назвал врач",
        save: "Рассчитать",
        clear: "Удалить дату",
        demo: "Пример: дата не указана",
        note: "Расчёт примерный — сроки обследований уточняйте у своего врача.",
        stored: "Дата хранится только на этом устройстве и не отправляется на сервер.",
        outOfRange: "По этой дате неделю беременности не рассчитать. Если малыш уже родился — перейдите на страницу малыша.",
        prev: "Предыдущая неделя",
        next: "Следующая неделя",
        unit: "неделя",
        stageNames: ["1-й триместр", "2-й триместр", "3-й триместр"],
        checklist: [
          [
            ["Осмотр", "Согласуйте с врачом сроки первого осмотра и анализов"],
            ["Список", "Покажите врачу список лекарств и добавок, которые вы принимаете"],
            ["Питание", "Спросите врача, что изменить в рационе"],
          ],
          [
            ["Осмотр", "Проверьте сроки обследований, назначенных врачом"],
            ["Состав", "Сверьте дозировки комплекса с врачом"],
            ["Вопросы", "Запишите вопросы к следующему приёму"],
          ],
          [
            ["Подготовка", "Подготовьте список вещей и документов в роддом"],
            ["Дом", "Заранее подготовьте термометр и домашнюю аптечку для малыша"],
            ["Симптомы", "Запомните тревожные признаки, о которых говорил врач"],
          ],
        ],
      },
      sections: withText(MOM_PRODUCTS, [
        ["Во время беременности", "Комплекс, на упаковке которого указано, что он для беременных, и приборы для домашнего контроля."],
        ["После родов — для себя", "Во время грудного вскармливания любую добавку сначала согласуйте с врачом."],
      ]),
      allProducts: "Каталог",
      panel: {
        eyebrow: "Ежемесячная коробка · подписка",
        title: "Коробка для беременных",
        text: "Prenatal Forte каждый месяц к вам домой. Интервал выбираете сами.",
        cta: "Настроить коробку",
        href: "#quti",
      },
      box: {
        eyebrow: "Подписка",
        title: "Ежемесячная коробка — управляете вы",
        steps: [
          ["Выберите интервал", "Доставка раз в 30, 45, 60 или 90 дней."],
          ["Скидка с первой доставки", "−{first}% на первый заказ, −{recurring}% на следующие."],
          ["Состав подтверждаете вы", "Состав меняется только с вашего согласия."],
          ["Пауза в любой момент", "Напишите оператору — приостановим или отменим."],
        ],
        interval: "Интервал доставки",
        days: "дн.",
        once: "Цена разовой покупки",
        first: "Первая доставка, −{first}%",
        recurring: "Следующие, −{recurring}%",
        cta: "Добавить коробку в корзину",
        note: "Проценты скидки берутся из настроек сайта.",
      },
      cross: {
        big: "0→3",
        title: "Малыш родился — страница малыша",
        text: "Укажите дату рождения: этапы от 0 до 3 лет, напоминания о плановых осмотрах и домашняя аптечка.",
        cta: "Малыши 0–3",
        href: "/care/baby",
      },
      guidesTitle: "Полезно знать",
      guides: [
        { kind: "goal", slug: "pregnancy" },
        { kind: "vitamin", slug: "folic-acid" },
        { kind: "vitamin", slug: "iron" },
        { kind: "vitamin", slug: "calcium" },
      ],
      privacy: {
        title: "Дата — только на вашем устройстве",
        text: "Регистрация для календаря не нужна. Дата хранится в браузере, не отправляется на сервер и удаляется кнопкой «Удалить дату».",
      },
      faq: [
        { question: "Календарь платный?", answer: "Нет, календарь по неделям бесплатный. Регистрация тоже не нужна." },
        { question: "Насколько точно считается неделя?", answer: "Неделя считается от предполагаемой даты родов: она принимается за 280-й день от начала последней менструации. Сроки обследований уточняйте у своего врача." },
        { question: "Как работает ежемесячная коробка?", answer: "Prenatal Forte оформляется по подписке: интервал 30, 45, 60 или 90 дней. Скидка −{first}% на первую доставку и −{recurring}% на следующие. Чтобы приостановить или отменить, напишите оператору." },
        { question: "Это лекарства?", answer: "Нет, это биологически активные добавки. Они не заменяют наблюдение у врача; перед приёмом проконсультируйтесь со своим врачом." },
        { question: "Какую добавку выбрать при грудном вскармливании?", answer: "На этот вопрос ответит только ваш врач. Покажите ему состав товаров со страницы и согласуйте приём." },
        { question: "Где хранится моя дата?", answer: "Только в браузере на этом устройстве. На сервер она не отправляется; кнопка «Удалить дату» стирает её сразу." },
      ],
      seoTitle: "Витамины для беременных и молодых мам — govita",
      seoText: "govita — магазин витаминов и биологически активных добавок с официальным импортом в Узбекистан. В этом разделе собраны комплекс для беременных, тонометр и термометр для домашнего контроля и товары для периода после родов. Бесплатный календарь считает неделю и триместр по предполагаемой дате родов. Перед приёмом любой добавки проконсультируйтесь со своим врачом.",
    },
  },
  baby: {
    uz: {
      breadcrumb: "Bola 0–3 yosh",
      h1: "Bolalar uchun: 0–3 yosh kuzatuvi va uy aptechkasi",
      lead: "Oyma-oy bosqichlar, pediatr koʻrigi eslatmalari va bolalar uchun jihozlar.",
      heroBadge: "Yangi · bepul kuzatuv",
      heroTitle: "Birinchi 3 yil — oyma-oy",
      heroText: "Bolaning tugʻilgan sanasini kiriting: yosh oyda hisoblanadi, shu bosqichda eʼtibor beriladigan narsalar koʻrinadi.",
      heroCta: "Kuzatuvni boshlash",
      heroCta2: "Uy aptechkasi",
      heroCta2Href: "#aptechka",
      photoAlt: "Bola",
      stages: [
        { big: "0–1", small: "oy", title: "Yangi tugʻilgan", sub: "Birinchi koʻriklar" },
        { big: "1–3", small: "oy", title: "Chaqaloq", sub: "Emizish, uyqu" },
        { big: "3–6", small: "oy", title: "Oʻsish", sub: "Koʻrik jadvali" },
        { big: "6–9", small: "oy", title: "Qoʻshimcha ovqat", sub: "Pediatr bilan" },
        { big: "9–12", small: "oy", title: "1 yoshga", sub: "Yillik koʻrik" },
        { big: "1–2", small: "yosh", title: "Yurish davri", sub: "Ovqat jadvali" },
      ],
      nextTile: { big: "2–3", small: "yosh", title: "Bogʻchaga", sub: "Tayyorgarlik", href: "#kuzatuv" },
      tracker: {
        title: "Oyma-oy kuzatuv",
        lead: "Tugʻilgan sanani kiriting yoki yoshni surib koʻring. Bir nechta bola qoʻshish mumkin.",
        dateLabel: "Tugʻilgan sana",
        dateHint: "Yosh oyda hisoblanadi",
        nameLabel: "Ism (ixtiyoriy)",
        save: "Qoʻshish",
        clear: "Hammasini oʻchirish",
        demo: "Namuna: bola qoʻshilmagan",
        note: "Har bola oʻz surʼatida rivojlanadi — savollaringizni pediatrga bering.",
        stored: "Maʼlumot faqat shu qurilmada saqlanadi va serverga yuborilmaydi.",
        outOfRange: "Bu sana 0–3 yosh oraligʻiga tushmaydi.",
        prev: "Oldingi oy",
        next: "Keyingi oy",
        unit: "oylik",
        unitYears: "yosh",
        unitMonths: "oy",
        stageNames: ["0–1 oy", "1–3 oy", "3–6 oy", "6–9 oy", "9–12 oy", "1–2 yosh", "2–3 yosh"],
        checklist: [
          [["Koʻrik", "Pediatr koʻrigi va emlash jadvalini tekshiring"], ["Ovqat", "Emizish boʻyicha shifokor maslahatini yozib oling"], ["Uy", "Termometr va uy aptechkasini tayyorlab qoʻying"]],
          [["Koʻrik", "Navbatdagi koʻrik muddatini tekshiring"], ["Savollar", "Qabul uchun savollaringizni yozib qoʻying"], ["Uyqu", "Uyqu tartibi haqida pediatrdan soʻrang"]],
          [["Koʻrik", "Koʻrik jadvalini shifokor bilan tekshiring"], ["Ovqat", "Qoʻshimcha ovqatga oʻtish vaqtini pediatr bilan kelishing"], ["Eʼtibor", "Allergiya belgilarini shifokorga ayting"]],
          [["Ovqat", "Yangi ovqatlarni kiritish tartibini pediatrdan soʻrang"], ["Koʻrik", "Tahlillar muddatini tekshiring"], ["Uy", "Uy aptechkasini yangilang"]],
          [["Koʻrik", "1 yosh koʻrigini oldindan kelishing"], ["Ovqat", "Ovqat jadvalini shifokor bilan koʻrib chiqing"], ["Savollar", "Rivojlanish haqidagi savollaringizni yozib qoʻying"]],
          [["Koʻrik", "Yillik koʻrikni rejalashtiring"], ["Roʻyxat", "Berilayotgan vositalar roʻyxatini shifokorga koʻrsating"], ["Uy", "Dori-darmonni bola yetmaydigan joyda saqlang"]],
          [["Bogʻcha", "Bogʻchadan oldingi koʻrikni rejalashtiring"], ["Qoʻshimcha", "Har qanday qoʻshimchani pediatr bilan kelishing"], ["Uy", "Termometr va plastir zaxirasini tekshiring"]],
        ],
        addChild: "Bola qoʻshish",
        childrenTitle: "Bolalarim",
        childDefault: "Bola",
        remove: "Oʻchirish",
      },
      sections: withText(BABY_PRODUCTS, [
        ["Bolalar uchun jihozlar", "Qadoqda bolalar uchun moʻljallangani koʻrsatilgan mahsulotlar."],
      ]),
      allProducts: "Barcha jihozlar",
      waitlist: {
        title: "0–3 yosh uchun vitaminlar — tez orada",
        text: "Hozir katalogda bu yoshga moʻljallangan qoʻshimcha yoʻq: Kids Multivitamins qadoqqa koʻra 7 yoshdan. Bolaga biror vosita berishdan oldin pediatr bilan maslahatlashing.",
        cta: "Telegram klubda xabar olish",
      },
      panel: {
        eyebrow: "Toʻplam",
        title: "Bola uchun uy aptechkasi",
        text: "Termometr, sovutuvchi plastir va ingalyator — keraklisini belgilang, jami oʻzi hisoblanadi.",
        cta: "Toʻplamni yigʻish",
        href: "#aptechka",
      },
      kit: {
        eyebrow: "Toʻplam",
        title: "Uy aptechkasini oʻzingiz yigʻing",
        text: "Kerakli jihozlarni belgilang — jami narx oʻzi hisoblanadi. Tez tugaydigan plastirni podpiskaga qoʻyish mumkin.",
        tags: ["Rasmiy kafolat", "Bolalar uchun", "Podpiska — plastirga"],
        count: "ta mahsulot",
        cta: "Savatga qoʻshish",
        subscribable: "Podpiskaga mos",
      },
      cross: {
        big: "40",
        title: "Hali homiladorlik davridamisiz?",
        text: "Haftalik kuzatuv va homiladorlik qutisi — bola tugʻilgach bu sahifaga oʻtasiz.",
        cta: "Onalar uchun",
        href: "/care/mom",
      },
      guidesTitle: "Qoʻllanmalar",
      guides: [
        { kind: "goal", slug: "kids" },
        { kind: "vitamin", slug: "vitamin-d3" },
        { kind: "vitamin", slug: "vitamin-c" },
        { kind: "symptom", slug: "frequent-colds" },
      ],
      privacy: {
        title: "Bola maʼlumoti faqat qurilmangizda",
        text: "Faqat tugʻilgan sana va ixtiyoriy ism. Maʼlumot brauzeringizda saqlanadi, serverga yuborilmaydi va bir tugma bilan oʻchadi.",
      },
      faq: [
        { question: "Kuzatuv nechta bola uchun ishlaydi?", answer: "Bir nechta bolani qoʻshish mumkin — har biri oʻz yoshi va bosqichi bilan koʻrinadi." },
        { question: "Muddatidan oldin tugʻilgan bola uchun yosh qanday hisoblanadi?", answer: "Sayt kalendar yoshini koʻrsatadi. Muddatidan oldin tugʻilgan bolaning rivojlanishini pediatr boshqacha hisoblashi mumkin — buni shifokoringizdan soʻrang." },
        { question: "0–3 yosh uchun vitaminlar bormi?", answer: "Hozir katalogda bu yoshga moʻljallangan qoʻshimcha yoʻq. Kids Multivitamins qadoqqa koʻra 7 yoshdan. Bolaga biror vosita berishdan oldin pediatr bilan maslahatlashing." },
        { question: "Ingalyatorga qanday dori quyiladi?", answer: "Kompressorli ingalyator shifokor tayinlagan dorini nafas yoʻllariga yetkazish uchun. Dori va miqdorni faqat shifokor belgilaydi." },
        { question: "HIEW plastirini qancha vaqt ishlatish mumkin?", answer: "Qadoqdagi yoʻriqnomaga amal qiling: qadoqda sovutish 8 soatgacha deyilgan. Harorat yuqori boʻlsa yoki tushmasa, shifokorga murojaat qiling." },
        { question: "Bola maʼlumoti qayerda saqlanadi?", answer: "Faqat shu qurilmadagi brauzerda. Serverga yuborilmaydi; «Hammasini oʻchirish» tugmasi uni darhol oʻchiradi." },
      ],
      seoTitle: "Bolalar salomatligi uchun mahsulotlar — govita",
      seoText: "Bu boʻlimda bolalar uchun moʻljallangan termometrlar, sovutuvchi plastir, kompressorli ingalyatorlar va 7 yoshdan katta bolalar uchun vitaminlar jamlangan. Bepul kuzatuv bolaning yoshini oyda hisoblaydi va har bosqichda eʼtibor beriladigan narsalarni koʻrsatadi. Har qanday vositani bolaga berishdan oldin pediatr bilan maslahatlashing.",
    },
    ru: {
      breadcrumb: "Малыши 0–3",
      h1: "Детям: календарь от 0 до 3 лет и домашняя аптечка",
      lead: "Этапы по месяцам, подсказки о плановых осмотрах и приборы для детей.",
      heroBadge: "Новое · бесплатный календарь",
      heroTitle: "Первые 3 года — месяц за месяцем",
      heroText: "Укажите дату рождения малыша: возраст посчитается в месяцах, а на странице появится то, на что стоит обратить внимание на этом этапе.",
      heroCta: "Начать календарь",
      heroCta2: "Домашняя аптечка",
      heroCta2Href: "#aptechka",
      photoAlt: "Ребёнок",
      stages: [
        { big: "0–1", small: "мес.", title: "Новорождённый", sub: "Первые осмотры" },
        { big: "1–3", small: "мес.", title: "Младенец", sub: "Кормление, сон" },
        { big: "3–6", small: "мес.", title: "Рост", sub: "График осмотров" },
        { big: "6–9", small: "мес.", title: "Прикорм", sub: "С педиатром" },
        { big: "9–12", small: "мес.", title: "К году", sub: "Годовой осмотр" },
        { big: "1–2", small: "года", title: "Первые шаги", sub: "Режим питания" },
      ],
      nextTile: { big: "2–3", small: "года", title: "К садику", sub: "Подготовка", href: "#kuzatuv" },
      tracker: {
        title: "Календарь по месяцам",
        lead: "Укажите дату рождения или прокрутите возраст. Можно добавить нескольких детей.",
        dateLabel: "Дата рождения",
        dateHint: "Возраст считается в месяцах",
        nameLabel: "Имя (необязательно)",
        save: "Добавить",
        clear: "Удалить всё",
        demo: "Пример: ребёнок не добавлен",
        note: "Каждый малыш развивается в своём темпе — вопросы задавайте педиатру.",
        stored: "Данные хранятся только на этом устройстве и не отправляются на сервер.",
        outOfRange: "Эта дата не попадает в возраст от 0 до 3 лет.",
        prev: "Предыдущий месяц",
        next: "Следующий месяц",
        unit: "мес.",
        unitYears: "г.",
        unitMonths: "мес.",
        stageNames: ["0–1 мес.", "1–3 мес.", "3–6 мес.", "6–9 мес.", "9–12 мес.", "1–2 года", "2–3 года"],
        checklist: [
          [["Осмотр", "Проверьте график осмотров у педиатра и прививок"], ["Питание", "Запишите рекомендации врача по кормлению"], ["Дом", "Подготовьте термометр и домашнюю аптечку"]],
          [["Осмотр", "Проверьте дату следующего осмотра"], ["Вопросы", "Запишите вопросы к приёму"], ["Сон", "Спросите педиатра о режиме сна"]],
          [["Осмотр", "Сверьте график осмотров с врачом"], ["Питание", "Согласуйте с педиатром начало прикорма"], ["Внимание", "Сообщайте врачу о признаках аллергии"]],
          [["Питание", "Уточните у педиатра порядок введения новых продуктов"], ["Осмотр", "Проверьте сроки анализов"], ["Дом", "Обновите домашнюю аптечку"]],
          [["Осмотр", "Заранее запишитесь на осмотр в год"], ["Питание", "Обсудите с врачом режим питания"], ["Вопросы", "Запишите вопросы о развитии"]],
          [["Осмотр", "Запланируйте ежегодный осмотр"], ["Список", "Покажите врачу список средств, которые даёте ребёнку"], ["Дом", "Храните лекарства в недоступном для ребёнка месте"]],
          [["Садик", "Запланируйте осмотр перед садиком"], ["Добавки", "Любую добавку согласуйте с педиатром"], ["Дом", "Проверьте запас термометра и пластырей"]],
        ],
        addChild: "Добавить ребёнка",
        childrenTitle: "Мои дети",
        childDefault: "Ребёнок",
        remove: "Удалить",
      },
      sections: withText(BABY_PRODUCTS, [
        ["Приборы для детей", "Товары, на упаковке которых указано, что они подходят детям."],
      ]),
      allProducts: "Все приборы",
      waitlist: {
        title: "Витамины для детей от 0 до 3 лет — скоро",
        text: "Сейчас в каталоге нет добавок для этого возраста: Kids Multivitamins по упаковке — с 7 лет. Перед тем как давать ребёнку любое средство, проконсультируйтесь с педиатром.",
        cta: "Узнать в Telegram-клубе",
      },
      panel: {
        eyebrow: "Набор",
        title: "Домашняя аптечка для малыша",
        text: "Термометр, охлаждающий пластырь и ингалятор — отметьте нужное, сумма посчитается сама.",
        cta: "Собрать набор",
        href: "#aptechka",
      },
      kit: {
        eyebrow: "Набор",
        title: "Соберите домашнюю аптечку",
        text: "Отметьте нужные приборы — сумма посчитается сама. Пластыри, которые быстро заканчиваются, можно оформить по подписке.",
        tags: ["Официальная гарантия", "Для детей", "Подписка — на пластыри"],
        count: "товара",
        cta: "Добавить в корзину",
        subscribable: "Можно по подписке",
      },
      cross: {
        big: "40",
        title: "Ещё ждёте малыша?",
        text: "Календарь по неделям и коробка для беременных — после рождения вы перейдёте на эту страницу.",
        cta: "Мамам",
        href: "/care/mom",
      },
      guidesTitle: "Полезно знать",
      guides: [
        { kind: "goal", slug: "kids" },
        { kind: "vitamin", slug: "vitamin-d3" },
        { kind: "vitamin", slug: "vitamin-c" },
        { kind: "symptom", slug: "frequent-colds" },
      ],
      privacy: {
        title: "Данные ребёнка — только на вашем устройстве",
        text: "Только дата рождения и, по желанию, имя. Данные хранятся в браузере, не отправляются на сервер и удаляются одной кнопкой.",
      },
      faq: [
        { question: "Для скольких детей работает календарь?", answer: "Можно добавить нескольких детей — у каждого свой возраст и этап." },
        { question: "Как считается возраст недоношенного малыша?", answer: "Сайт показывает календарный возраст. Развитие недоношенного ребёнка педиатр может оценивать иначе — уточните это у своего врача." },
        { question: "Есть ли витамины для детей до 3 лет?", answer: "Сейчас в каталоге нет добавок для этого возраста. Kids Multivitamins по упаковке — с 7 лет. Перед тем как давать ребёнку любое средство, проконсультируйтесь с педиатром." },
        { question: "Какое лекарство заливать в ингалятор?", answer: "Компрессорный ингалятор доставляет в дыхательные пути лекарство, назначенное врачом. Препарат и дозировку определяет только врач." },
        { question: "Сколько можно использовать пластырь HIEW?", answer: "Следуйте инструкции на упаковке: охлаждение — до 8 часов. Если температура высокая или не снижается, обратитесь к врачу." },
        { question: "Где хранятся данные ребёнка?", answer: "Только в браузере на этом устройстве. На сервер они не отправляются; кнопка «Удалить всё» стирает их сразу." },
      ],
      seoTitle: "Товары для здоровья детей — govita",
      seoText: "В этом разделе собраны детские термометры, охлаждающий пластырь, компрессорные ингаляторы и витамины для детей старше 7 лет. Бесплатный календарь считает возраст малыша в месяцах и показывает, на что обратить внимание на каждом этапе. Перед тем как давать ребёнку любое средство, проконсультируйтесь с педиатром.",
    },
  },
};

export function careCopy(kind: CareKind, locale: Locale): CareCopy {
  return COPY[kind][locale];
}

/** Every string of both pages, for the claim and apostrophe tests. */
export function allCareCopy(): { path: string; locale: Locale; value: unknown }[] {
  return (Object.keys(COPY) as CareKind[]).flatMap((kind) =>
    (Object.keys(COPY[kind]) as Locale[]).map((locale) => ({ path: `${kind}.${locale}`, locale, value: COPY[kind][locale] })),
  );
}

/** Fill `{first}` / `{recurring}` from the effective subscription percents. */
export function fillPercents(text: string, p: { firstPercent: number; recurringPercent: number }): string {
  return text.replace(/\{first\}/g, String(p.firstPercent)).replace(/\{recurring\}/g, String(p.recurringPercent));
}

export const HOME_CARE: Record<Locale, { badge: string; title: string; text: string; mom: string; baby: string }> = {
  uz: {
    badge: "Yangi boʻlim",
    title: "Homiladorlikdan 3 yoshgacha — bitta kuzatuv",
    text: "Haftalik va oylik kuzatuv, bosqichga mos mahsulotlar va oylik quti.",
    mom: "Onalar uchun",
    baby: "Bola 0–3 yosh",
  },
  ru: {
    badge: "Новый раздел",
    title: "От беременности до 3 лет — один календарь",
    text: "Календарь по неделям и месяцам, товары по этапам и ежемесячная коробка.",
    mom: "Мамам",
    baby: "Малыши 0–3",
  },
};
