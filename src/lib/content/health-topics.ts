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
  // ── GOALS ──
  {
    kind: "goal",
    slug: "immunity",
    name: { uz: "Immunitet", ru: "Иммунитет" },
    headline: {
      uz: "Immun tizimining normal ishlashi uchun muhim nutriyentlar",
      ru: "Нутриенты, важные для нормальной работы иммунной системы",
    },
    intro: {
      uz: "Immun tizimi kundalik ovqatlanish, uyqu sifati va mikroelementlar balansiga tayanadi. Quyida immunitetni qoʻllab-quvvatlash uchun zarur asosiy moddalar keltirilgan.",
      ru: "Иммунная система напрямую зависит от питания, качества сна и баланса микроэлементов. Ниже — ключевые нутриенты для поддержки нормальной работы иммунной системы.",
    },
    sections: {
      uz: [
        {
          title: "Immunitet qanday ishlaydi?",
          body: "Immun tizimi — organizmning murakkab hujayraviy mexanizmi. Vitamin D3, sink va vitamin C immun tizimining normal ishlashiga hissa qoʻshadi va immun hujayralari faoliyatida ishtirok etadi.",
        },
        {
          title: "Mavsumiy kurs va qabul tartibi",
          body: "Kuz-qish mavsumida yoki intensiv aqliy/jismoniy yuklamalarda nutriyentlarni kurs shaklida qabul qilish mumkin. Yogʻda eriydigan vitaminlar (D3) yogʻli taom bilan yaxshi soʻriladi.",
        },
      ],
      ru: [
        {
          title: "Как работает иммунная защита?",
          body: "Иммунитет — сложный клеточный механизм. Витамин D3, цинк и витамин C способствуют нормальной работе иммунной системы и участвуют в работе иммунных клеток (Т- и B-лимфоцитов).",
        },
        {
          title: "Сезонный курс приема",
          body: "В межсезонье и периоды высоких нагрузок рекомендуется курсовой прием нутриентов. Жирорастворимый витамин D3 лучше принимать с пищей, содержащей полезные жиры.",
        },
      ],
    },
    bullets: {
      uz: [
        "Vitamin D3 — immun hujayralari faolligi",
        "Vitamin C — antioksidant himoya va fagotsitoz",
        "Sink — immun tizimining normal ishlashiga hissa",
        "Sifatli uyqu va toʻlaqonli oqsil ratsioni",
      ],
      ru: [
        "Витамин D3 — регуляция иммунного ответа",
        "Витамин C — антиоксидантная защита мембран",
        "Цинк — вклад в нормальную работу иммунной системы",
        "Полноценный сон и достаточное количество белка",
      ],
    },
    ingredientSlugs: ["vitamin-d3", "vitamin-c", "zinc"],
    productSlugs: ["swiss-energy-immunovit-30", "swiss-energy-vitamin-c-20", "dr-frei-gold-vitamins-20"],
    categorySlugs: ["immunity", "vitamins"],
    relatedSlugs: ["frequent-colds", "vitamin-d3", "vitamin-c", "zinc"],
    faq: {
      uz: [
        {
          question: "Immunitet uchun vitaminlarni qachon ichish kerak?",
          answer: "Odatda kuz-qish mavsumida yoki yuklamalar ortgan davrda 1–2 oylik kurs shaklida qabul qilinadi. Kurs muddatini shifokor bilan kelishing.",
        },
        {
          question: "Bolalar uchun kattalar vitaminlari toʻgʻri keladimi?",
          answer: "Yoʻq, bolalarda dozalar tana vazniga qarab belgilanadi. Bolalar uchun maxsus ishlab chiqilgan shakllarni tanlang.",
        },
      ],
      ru: [
        {
          question: "Как часто нужно проходить курс для иммунитета?",
          answer: "Обычно курс составляет 1–2 месяца в осенне-зимний период или при повышенных нагрузках. Длительность курса согласуйте с врачом.",
        },
        {
          question: "Подходят ли взрослые дозировки детям?",
          answer: "Нет, детям требуются адаптированные возрастные дозировки и формы выпуска.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "sleep",
    name: { uz: "Sifatli uyqu", ru: "Качественный сон" },
    headline: {
      uz: "Chuqur uyqu va asab tizimining normal ishlashi",
      ru: "Глубокий сон и нормальная работа нервной системы",
    },
    intro: {
      uz: "Uyqu sifatining buzilishi stress, magniy yetishmovchiligi va asab qoʻzgʻaluvchanligi bilan bogʻliq boʻlishi mumkin. Magniy va B6 asab tizimining normal ishlashiga hissa qoʻshadi.",
      ru: "Нарушения сна могут быть связаны с дефицитом магния, перегрузкой нервной системы и вечерним экраном. Магний и B6 способствуют нормальной работе нервной системы.",
    },
    sections: {
      uz: [
        {
          title: "Magniy va melatonin oʻzaro taʼsiri",
          body: "Magniy GABA (GAMK) tizimi faoliyatida ishtirok etadi va asab tizimining normal ishlashiga hissa qoʻshadi.",
        },
        {
          title: "Kechki tartib",
          body: "Magniyni kechqurun, yotishdan 30–60 daqiqa oldin qabul qilish qulay: u mushaklarning normal ishlashiga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          title: "Роль магния и ГАМК",
          body: "Магний участвует в работе системы гамма-аминомасляной кислоты (ГАМК) и способствует нормальной работе нервной системы.",
        },
        {
          title: "Вечерний протокол",
          body: "Магний удобно принимать вечером, за 30–60 минут до сна: он способствует нормальной работе мышц.",
        },
      ],
    },
    bullets: {
      uz: [
        "Magniy xelat / sitrat — mushaklarning normal ishlashi",
        "Vitamin B6 — asab impulslarini tartibga solish",
        "Yotishdan 1 soat oldin ekranlarni cheklash",
      ],
      ru: [
        "Хелат/цитрат магния — нормальная работа мышц",
        "Витамин B6 — регуляция метаболизма нейромедиаторов",
        "Ограничение яркого синего света за час до сна",
      ],
    },
    ingredientSlugs: ["magnesium"],
    productSlugs: ["dr-frei-antistress-magniy-20"],
    categorySlugs: ["sleep", "minerals"],
    relatedSlugs: ["insomnia", "stress", "magnesium"],
    faq: {
      uz: [
        {
          question: "Magniy oʻrganib qolish (qaramlik) chaqiradimi?",
          answer: "Yoʻq, magniy organizm uchun tabiiy mineral boʻlib, oʻrganib qolish xususiyatiga ega emas.",
        },
      ],
      ru: [
        {
          question: "Вызывает ли магний привыкание?",
          answer: "Нет, магний — это эссенциальный минерал, необходимый клеткам каждый день, он не вызывает привыкания.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "energy",
    name: { uz: "Energiya va tetiklik", ru: "Энергия и бодрость" },
    headline: {
      uz: "Hujayra darajasida energiya almashinuvi va charchoqni kamaytirishga hissa",
      ru: "Клеточный энергетический обмен и вклад в снижение усталости",
    },
    intro: {
      uz: "Charchoq B guruhi vitaminlari, temir, D3 yoki magniy yetishmovchiligi bilan bogʻliq boʻlishi mumkin. B12, temir va magniy normal energiya almashinuviga hissa qoʻshadi.",
      ru: "Упадок сил может быть связан с нехваткой витаминов группы B, железа, витамина D3 или магния. B12, железо и магний способствуют нормальному энергетическому обмену.",
    },
    sections: {
      uz: [
        {
          title: "Hujayra energiyasi (ATF)",
          body: "Mitoxondriyalar ATF energiyasini ishlab chiqarishi uchun B12, B6, magniy va kofermentlar kerak. Ushbu moddalar boʻlmasa organizm ovqatni energiyaga aylantirishda qiynaladi.",
        },
        {
          title: "Kunduzgi faollik",
          body: "B guruhi va multivitaminlarni ertalab nonushta paytida qabul qilish maqsadga muvofiq.",
        },
      ],
      ru: [
        {
          title: "Синтез АТФ в клетках",
          body: "Для выработки молекул АТФ митохондриям необходимы коферменты группы B, железо и магний. Их дефицит приводит к быстрой истощаемости.",
        },
        {
          title: "Прием в первой половине дня",
          body: "Энергетические комплексы и витамины группы B оптимально принимать утром во время завтрака.",
        },
      ],
    },
    bullets: {
      uz: [
        "Vitamin B12 va B-kompleks — asab va metabolizm",
        "Temir bisglisinat — hujayralarga kislorod tashish",
        "Koenzim Q10 va D3 — mitoxondriyalar faoliyati",
      ],
      ru: [
        "Витамины группы B — энергетический метаболизм",
        "Хелатное железо — доставка кислорода тканям",
        "Коэнзим Q10 и D3 — поддержка митохондрий",
      ],
    },
    ingredientSlugs: ["vitamin-b12", "iron", "vitamin-d3", "magnesium"],
    productSlugs: ["swiss-energy-neuroforce-30", "dr-frei-multivitamins-biotin-20", "aminomorin-forte-30"],
    categorySlugs: ["vitamins", "energy"],
    relatedSlugs: ["fatigue", "vitamin-b12", "iron"],
    faq: {
      uz: [
        {
          question: "Natija qachon seziladi?",
          answer: "Taʼsir har kimda turlicha. Vitaminlar kurs shaklida qabul qilinadi; charchoq uzoq davom etsa, shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Через сколько времени ощущается эффект?",
          answer: "Эффект индивидуален. Витамины принимают курсом; если усталость сохраняется долго, обратитесь к врачу.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "beauty",
    name: { uz: "Goʻzallik (Soch, Teri, Tirnoq)", ru: "Красота (Волосы, Кожа, Ногти)" },
    headline: {
      uz: "Kollagen, biotin va antioksidantlar bilan tabiiy goʻzallik",
      ru: "Поддержка синтеза коллагена, эластичности кожи и густоты волос",
    },
    intro: {
      uz: "Tashqi goʻzallik ichki toʻqimalar oziqlanishidan boshlanadi. Biotin va sink soch va terining normal holatini saqlashga, vitamin C esa normal kollagen hosil boʻlishiga hissa qoʻshadi.",
      ru: "Здоровье кожи, блеск волос и прочность ногтей формируются изнутри. Биотин и цинк способствуют поддержанию нормального состояния волос и кожи, а витамин C — нормальному образованию коллагена.",
    },
    sections: {
      uz: [
        {
          title: "Kollagen va Keratin sintezi",
          body: "25 yoshdan soʻng organizmda tabiiy kollagen ishlab chiqarilishi har yili 1-1.5% ga kamayadi. Vitamin C terining normal holati uchun zarur kollagen hosil boʻlishida ishtirok etadi.",
        },
      ],
      ru: [
        {
          title: "Синтез дермального матрикса",
          body: "После 25 лет естественная выработка коллагена снижается. Витамин C участвует в образовании коллагена, необходимого для нормального состояния кожи.",
        },
      ],
    },
    bullets: {
      uz: [
        "Gidrolizlangan dengiz kollageni — elastiklik",
        "Biotin (B7) — sochning normal holatini saqlash",
        "Vitamin C — kollagen tolalarini bogʻlash",
        "Sink — terining normal holati",
      ],
      ru: [
        "Морские пептиды коллагена — упругость кожи",
        "Биотин — поддержание нормального состояния волос",
        "Витамин C — кофермент синтеза коллагена",
        "Цинк — поддержание нормального состояния кожи",
      ],
    },
    ingredientSlugs: ["collagen", "biotin", "vitamin-c", "zinc"],
    productSlugs: ["swiss-energy-hair-nail-skin-30", "swiss-energy-nature-collagen"],
    categorySlugs: ["beauty"],
    relatedSlugs: ["hair-loss", "collagen", "biotin"],
    faq: {
      uz: [
        {
          question: "Kollagenni qanday qabul qilish kerak?",
          answer: "Ertalab och qoringa yoki ovqatdan 30 daqiqa oldin suv bilan ichish eng yaxshi soʻrilishni taʼminlaydi. Kurs davomiyligi 2–3 oy.",
        },
      ],
      ru: [
        {
          question: "Как правильно принимать коллаген?",
          answer: "Лучше всего принимать утром натощак за 30 минут до еды, запивая водой. Оптимальный курс — 2–3 месяца.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "stress",
    name: { uz: "Stress va asab tizimi", ru: "Стресс и нервная система" },
    headline: {
      uz: "Asab tizimini qoʻllab-quvvatlash va hissiy barqarorlik",
      ru: "Баланс нейромедиаторов и устойчивость к психоэмоциональным перегрузкам",
    },
    intro: {
      uz: "Doimiy stress magniy va B guruhi vitaminlarining organizmdan tezroq sarflanishiga olib kelishi mumkin. Magniy va B6 asab tizimining normal ishlashiga va normal psixologik funksiyaga hissa qoʻshadi.",
      ru: "Хронический стресс может ускорять расход магния и витаминов группы B. Магний и B6 способствуют нормальной работе нервной системы и нормальной психологической функции.",
    },
    sections: {
      uz: [
        {
          title: "Kortizol va magniy balansi",
          body: "Stress gormoni kortizol yuqori boʻlganda yurak urishi tezlashadi va mushaklar qisqaradi. Magniy asab tizimi va mushaklarning normal ishlashiga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          title: "Кортизол и магний",
          body: "При высоком уровне кортизола учащается сердцебиение и напрягаются мышцы. Магний способствует нормальной работе нервной системы и мышц.",
        },
      ],
    },
    bullets: {
      uz: ["Magniy sitrat / xelat — asab tizimining normal ishlashi", "Vitamin B6 — normal psixologik funksiya"],
      ru: ["Органический магний — нормальная работа нервной системы", "Витамин B6 — нормальная психологическая функция"],
    },
    ingredientSlugs: ["magnesium", "vitamin-b12"],
    productSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-neuroforce-30"],
    categorySlugs: ["sleep", "vitamins"],
    relatedSlugs: ["stress-anxiety", "sleep", "magnesium"],
    faq: {
      uz: [
        {
          question: "Kunduzi uyqu chaqiradimi?",
          answer: "Magniy uyqu dorisi emas: u asab tizimining normal ishlashiga hissa qoʻshadi va odatda diqqatni jamlashga xalaqit bermaydi.",
        },
      ],
      ru: [
        {
          question: "Вызывает ли магний дневную сонливость?",
          answer: "Нет, магний не снотворное: он способствует нормальной работе нервной системы и обычно не мешает концентрации внимания.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "digestion",
    name: { uz: "Hazm qilish va ichak", ru: "Здоровое пищеварение" },
    headline: {
      uz: "Mikrobiota balansi, yengillik va toʻgʻri oʻzlashtirish",
      ru: "Баланс микрофлоры, комфорт и усвоение питательных веществ",
    },
    intro: {
      uz: "Oziq moddalarning soʻrilishi ichak holatiga bogʻliq, immun hujayralarining 70% dan ortigʻi esa ichakda joylashgan. Probiotiklar ichak mikrobiotasini qoʻllab-quvvatlaydi.",
      ru: "Более 70% иммунных клеток сосредоточено в кишечнике. Пробиотические культуры поддерживают кишечную микробиоту и комфорт пищеварения.",
    },
    sections: {
      uz: [
        {
          title: "Mikrobiomaning ahamiyati",
          body: "Foydali bakteriyalar B guruhi vitaminlarini sintez qiladi va ichak shilliq qavatining normal holatida ishtirok etadi.",
        },
      ],
      ru: [
        {
          title: "Здоровье микробиома",
          body: "Полезные лакто- и бифидобактерии синтезируют витамины и участвуют в поддержании нормального состояния слизистой кишечника.",
        },
      ],
    },
    bullets: {
      uz: ["Probiotik shtammlar — mikroflora balansini qoʻllab-quvvatlash", "Prebiotik tolalar — foydali bakteriyalar ozuqasi"],
      ru: ["Мультиштаммовые пробиотики для баланса микрофлоры", "Пребиотические волокна для питания флоры"],
    },
    ingredientSlugs: ["probiotics", "zinc"],
    productSlugs: [],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["digestive-bloat", "probiotics"],
    faq: {
      uz: [
        {
          question: "Antibiotik qabul qilganda qanday ichiladi?",
          answer: "Odatda probiotik antibiotikdan kamida 2–3 soat keyin qabul qilinadi va antibiotik kursi tugagach yana 2 hafta davom ettiriladi. Qabul tartibini shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Как принимать с антибиотиками?",
          answer: "Обычно — с интервалом не менее 2–3 часов после антибиотика, продолжая прием еще 2 недели после курса. Посоветуйтесь с врачом о схеме приема.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "heart",
    name: { uz: "Yurak va qon tomirlar", ru: "Сердце и сосуды" },
    headline: {
      uz: "Yurak va qon tomirlarning normal ishlashini qoʻllab-quvvatlash",
      ru: "Поддержка нормальной работы сердца и сосудов",
    },
    intro: {
      uz: "Omega-3 yogʻ kislotalari (EPA va DHA) yurakning normal ishlashiga hissa qoʻshadi, magniy mushaklarning normal ishlashi uchun muhim, K2 vitamini esa kalsiy almashinuvida ishtirok etadi.",
      ru: "Полиненасыщенные жирные кислоты Омега-3 (ЭПК и ДГК) способствуют нормальной работе сердца, магний важен для нормальной работы мышц, а витамин K2 участвует в обмене кальция.",
    },
    sections: {
      uz: [
        {
          title: "Omega-3 EPA va DHA kuchi",
          body: "EPA va DHA yurakning normal ishlashiga hissa qoʻshadi, DHA esa hujayra membranalarining tarkibiy qismi hisoblanadi.",
        },
      ],
      ru: [
        {
          title: "Действие кислот EPA и DHA",
          body: "ЭПК и ДГК способствуют нормальной работе сердца, а ДГК входит в состав клеточных мембран.",
        },
      ],
    },
    bullets: {
      uz: ["Omega-3 EPA/DHA — yurakning normal ishlashi", "Magniy — mushaklarning normal ishlashi", "Vitamin K2 — kalsiy almashinuvida ishtirok"],
      ru: ["Омега-3 ЭПК/ДГК — нормальная работа сердца", "Магний — нормальная работа мышц", "Витамин K2 — участие в обмене кальция"],
    },
    ingredientSlugs: ["epa-dha", "magnesium", "vitamin-k2"],
    productSlugs: [],
    categorySlugs: ["vitamins", "minerals"],
    relatedSlugs: ["omega-3", "magnesium", "vitamin-d3"],
    faq: {
      uz: [
        {
          question: "Omega-3 qancha vaqt ichiladi?",
          answer: "Omega-3 organizmda sintezlanmaydi, shuning uchun uni yil davomida yoki 3 oylik takroriy kurslar bilan qabul qilish mumkin.",
        },
      ],
      ru: [
        {
          question: "Какова длительность курса Омега-3?",
          answer: "Поскольку ПНЖК не синтезируются организмом, возможен постоянный или длительный курсовой прием (по 3 месяца).",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "joints",
    name: { uz: "Boʻgʻimlar va suyaklar", ru: "Суставы и связки" },
    headline: {
      uz: "Erkin harakat, togʻay toʻqimasi va suyaklarning normal holati",
      ru: "Свобода движения, хрящевая ткань и нормальное состояние костей",
    },
    intro: {
      uz: "Boʻgʻimlar va suyaklar uchun kollagen, D3, K2 va kalsiy muhim. Vitamin D3 va kalsiy suyaklarning normal holatini saqlashga hissa qoʻshadi.",
      ru: "Для опорно-двигательного аппарата важны пептиды коллагена, витамины D3, K2 и кальций. Витамин D3 и кальций способствуют поддержанию нормального состояния костей.",
    },
    sections: {
      uz: [
        {
          title: "Togʻay toʻqimasi va kollagen",
          body: "Kollagen — togʻay toʻqimasining asosiy oqsili; vitamin C togʻaylarning normal faoliyati uchun zarur kollagen hosil boʻlishiga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          title: "Хрящевая ткань и коллаген",
          body: "Коллаген — основной белок хрящевой ткани; витамин C способствует нормальному образованию коллагена, необходимого для работы хрящей.",
        },
      ],
    },
    bullets: {
      uz: ["Kollagen peptidlari — togʻay toʻqimasi elastikligi", "Vitamin D3 + K2 — kalsiyning suyakka toʻgʻri birikishi", "Kalsiy — suyak mustahkamligi"],
      ru: ["Пептиды коллагена для суставов", "Витамины D3 и K2 для минерализации костей", "Биодоступный кальций"],
    },
    ingredientSlugs: ["collagen", "vitamin-d3", "vitamin-k2", "calcium"],
    productSlugs: ["swiss-energy-calcivit-30", "swiss-energy-nature-collagen"],
    categorySlugs: ["vitamins", "minerals"],
    relatedSlugs: ["joint-pain", "collagen", "calcium", "vitamin-d3"],
    faq: {
      uz: [
        {
          question: "Jismoniy mashqlar qiluvchilarga qaysi biri mos?",
          answer: "Faol shugʻullanuvchilar koʻpincha kollagen va D3+K2 kombinatsiyasini tanlaydi: vitamin D3 mushaklar va suyaklarning normal ishlashiga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          question: "Что рекомендуется при спортивных нагрузках?",
          answer: "При активных тренировках часто выбирают сочетание коллагена и витамина D3+K2: витамин D3 способствует нормальной работе мышц и костей.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "brain",
    name: { uz: "Xotira va miya faoliyati", ru: "Память и внимание" },
    headline: {
      uz: "Aqliy mehnat, kognitiv funksiyalar va yuqori konsentratsiya",
      ru: "Когнитивная продуктивность, ясность мышления и память",
    },
    intro: {
      uz: "Omega-3 DHA miyaning normal ishlashiga, B guruhi vitaminlari va magniy esa asab tizimining normal ishlashiga hissa qoʻshadi.",
      ru: "ДГК Омега-3 способствует поддержанию нормальной работы мозга, а витамины группы B и магний — нормальной работе нервной системы.",
    },
    sections: {
      uz: [
        {
          title: "Neyronlar oziqlanishi",
          body: "Miya quruq moddasining 60% qismi yogʻlardan iborat. DHA kislotasi neyron membranalarining asosiy elementi hisoblanadi.",
        },
      ],
      ru: [
        {
          title: "Питание нейронов",
          body: "Докозагексаеновая кислота (ДГК) является структурным компонентом серого вещества мозга и сетчатки глаз.",
        },
      ],
    },
    bullets: {
      uz: ["Omega-3 DHA — miyaning normal ishlashi", "Vitamin B12 — asab tizimining normal ishlashi", "Magniy — charchoqni kamaytirishga hissa"],
      ru: ["ДГК Омега-3 — нормальная работа мозга", "Витамин B12 — нормальная работа нервной системы", "Магний — вклад в снижение усталости"],
    },
    ingredientSlugs: ["epa-dha", "vitamin-b12", "magnesium"],
    productSlugs: ["swiss-energy-neuroforce-30"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["omega-3", "vitamin-b12", "fatigue"],
    faq: {
      uz: [
        {
          question: "Imtihonlar yoki ogʻir loyihalar davrida nima ichish kerak?",
          answer: "Koʻpincha Omega-3 va B-kompleks tanlanadi: DHA miyaning normal ishlashiga, B vitaminlari va magniy charchoqni kamaytirishga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          question: "Что принимать в периоды экзаменов и дедлайнов?",
          answer: "Часто выбирают Омега-3 и витамины группы B с магнием: ДГК способствует нормальной работе мозга, а витамины B и магний — снижению усталости.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "weight",
    name: { uz: "Metabolizm va vazn nazorati", ru: "Метаболизм и контроль веса" },
    headline: {
      uz: "Normal moddalar almashinuvini qoʻllab-quvvatlash",
      ru: "Поддержка нормального обмена веществ",
    },
    intro: {
      uz: "Metabolizm sekinlashishi D vitamini, xrom, magniy va B vitaminlari tanqisligi bilan bogʻliq boʻlishi mumkin. Magniy va B vitaminlari normal energiya almashinuviga hissa qoʻshadi; vazn uchun asosiysi — ovqatlanish va faollik.",
      ru: "Замедление метаболизма может быть связано с дефицитом витамина D и микроэлементов. Магний и витамины группы B способствуют нормальному энергетическому обмену; для веса главное — питание и активность.",
    },
    sections: {
      uz: [
        {
          title: "Magniy, D3 va metabolizm",
          body: "Magniy normal energiya almashinuviga hissa qoʻshadi, D3 vitamini esa moddalar almashinuvi jarayonlarida ishtirok etadi.",
        },
      ],
      ru: [
        {
          title: "Магний, D3 и метаболизм",
          body: "Магний способствует нормальному энергетическому обмену, а витамин D3 участвует в процессах обмена веществ.",
        },
      ],
    },
    bullets: {
      uz: ["Vitamin D3 — metabolik faollik", "Magniy — normal energiya almashinuvi", "Probiotiklar — ichak metabolik balansi"],
      ru: ["Витамин D3 для регуляции метаболизма", "Магний для энергетического обмена", "Пробиотики для кишечной микробиоты"],
    },
    ingredientSlugs: ["vitamin-d3", "magnesium", "probiotics"],
    productSlugs: [],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-d3", "magnesium", "probiotics"],
    faq: {
      uz: [
        {
          question: "Vitaminlar vazn toʻplashga olib kelmaydimi?",
          answer: "Yoʻq, vitaminlar deyarli kaloriyasiz va vazn ortishiga sabab boʻlmaydi.",
        },
      ],
      ru: [
        {
          question: "Могут ли витамины вызвать набор веса?",
          answer: "Нет, витамины практически не содержат калорий и не вызывают набора веса.",
        },
      ],
    },
  },

  // ── VITAMINS ──
  {
    kind: "vitamin",
    slug: "vitamin-d3",
    name: { uz: "Vitamin D3", ru: "Витамин D3" },
    headline: {
      uz: "Quyosh vitamini — suyak, immunitet va gormonal balans",
      ru: "Солнечный витамин для костей, иммунитета и гормонального баланса",
    },
    intro: {
      uz: "Vitamin D3 (xolekalsiferol) organizmda yuzlab genlar faoliyatini boshqaradi. U kalsiy soʻrilishi va immun tizimining normal ishlashi uchun muhimdir.",
      ru: "Витамин D3 участвует в регуляции работы сотен генов и важен для усвоения кальция и нормальной работы иммунной системы.",
    },
    sections: {
      uz: [
        {
          title: "Nima uchun D3 tanqisligi keng tarqalgan?",
          body: "Kuyoshli mintaqalarda ham xonalarda oʻtirish, quyosh kremlari va yopiq kiyimlar sababli aholining 70% dan ortigʻida D vitamini yetishmovchiligi kuzatiladi.",
        },
        {
          title: "D3 va K2 sinergiyasi",
          body: "D3 kalsiyning ichakda normal soʻrilishiga hissa qoʻshadi, K2 vitamini esa kalsiyning suyak toʻqimasiga yoʻnaltirilishida ishtirok etadi.",
        },
      ],
      ru: [
        {
          title: "Почему возникает дефицит?",
          body: "Даже в солнечных странах пребывание в офисах и использование SPF-кремов приводит к дефициту D3 у более чем 70% людей.",
        },
        {
          title: "Синергия с K2",
          body: "Витамин D3 способствует нормальному всасыванию кальция, а витамин K2 участвует в его направлении в костную ткань.",
        },
      ],
    },
    bullets: {
      uz: [
        "Odatiy doza: 2000–5000 IU (shifokor bilan kelishib)",
        "Yogʻli taom bilan nonushtada qabul qilinadi",
        "K2 (MK-7) bilan birga qabul qilish maqsadga muvofiq",
      ],
      ru: [
        "Обычная дозировка: 2000–5000 МЕ (по согласованию с врачом)",
        "Прием утром с жиросодержащей пищей",
        "Оптимально в паре с витамином K2 (MK-7)",
      ],
    },
    ingredientSlugs: ["vitamin-d3", "vitamin-k2"],
    productSlugs: ["swiss-energy-calcivit-30", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: ["vitamins", "immunity"],
    relatedSlugs: ["immunity", "frequent-colds", "calcium"],
    faq: {
      uz: [
        {
          question: "D vitaminini yozda ham ichish kerakmi?",
          answer: "Agar kunning koʻp qismini binoda oʻtkazsangiz, yozda ham kichik doza (1000–2000 IU) qabul qilish mumkin. Dozani shifokor bilan kelishing.",
        },
      ],
      ru: [
        {
          question: "Нужно ли принимать летом?",
          answer: "При работе в помещении умеренные дозировки (1000–2000 МЕ) можно принимать круглый год. Дозировку согласуйте с врачом.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-c",
    name: { uz: "Vitamin C", ru: "Витамин C" },
    headline: {
      uz: "Bosh antioksidant — kollagen hosil boʻlishi va immunitet",
      ru: "Главный водорастворимый антиоксидант для коллагена и иммунитета",
    },
    intro: {
      uz: "Inson organizmi vitamin C ni oʻzi ishlab chiqara olmaydi. U har kuni oziq-ovqat va sifatli qoʻshimchalar orqali tushishi shart.",
      ru: "Витамин C не синтезируется в организме человека и должен поступать ежедневно для защиты клеток и синтеза коллагена.",
    },
    sections: {
      uz: [
        {
          title: "Asosiy vazifalari",
          body: "Hujayralarni oksidlovchi stressdan himoyalashga hissa qoʻshadi, qon tomirlarning normal faoliyati uchun zarur kollagen hosil boʻlishida ishtirok etadi va temir soʻrilishini oshiradi.",
        },
      ],
      ru: [
        {
          title: "Ключевые функции",
          body: "Способствует защите клеток от окислительного стресса, участвует в образовании коллагена для нормальной работы сосудов и повышает усвоение железа.",
        },
      ],
    },
    bullets: {
      uz: ["Antioksidant va immun tizimining normal ishlashi", "Kollagen va elastiklik", "Temir soʻrilishini oshirish"],
      ru: ["Антиоксидант и нормальная работа иммунитета", "Кофактор выработки коллагена", "Повышение усвоения железа"],
    },
    ingredientSlugs: ["vitamin-c"],
    productSlugs: ["swiss-energy-immunovit-30", "swiss-energy-vitamin-c-20", "dr-frei-gold-vitamins-20"],
    categorySlugs: ["vitamins", "effervescent"],
    relatedSlugs: ["immunity", "frequent-colds", "iron"],
    faq: {
      uz: [
        {
          question: "Katta dozada vitamin C buyrakka zarar emasmi?",
          answer: "Odatiy kunlik doza 500–1000 mg ni tashkil etadi. Yetarli suv iching; buyrak kasalliklarida avval shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Безопасны ли дозировки 1000 мг?",
          answer: "Обычная суточная дозировка — 500–1000 мг. Соблюдайте питьевой режим, а при заболеваниях почек посоветуйтесь с врачом.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "magnesium",
    name: { uz: "Magniy", ru: "Магний" },
    headline: {
      uz: "Asab tizimi, mushaklar va sifatli uyqu uchun",
      ru: "Минерал для нервной системы, мышц и сна",
    },
    intro: {
      uz: "Magniy — organizmdagi 300 dan ortiq ferment tizimlarining kofaktori. U yetishmaganda asabiylashish, uyqusizlik va tomir tortishishlari kuzatiladi.",
      ru: "Магний контролирует передачу нервных импульсов, расслабление мышц и синтез энергии АТФ.",
    },
    sections: {
      uz: [
        {
          title: "Magniyning toʻgʻri shakllari",
          body: "Magniy xelati (bisglisinat) va sitrati oshqozonga yumshoq taʼsir qiladi va ichakda 80% gacha yuqori soʻriladi.",
        },
      ],
      ru: [
        {
          title: "Биодоступные формы",
          body: "Органические формы (хелат, цитрат) обладают максимальной биодоступностью и не раздражают ЖКТ.",
        },
      ],
    },
    bullets: {
      uz: ["Mushaklarning normal ishlashi", "Asab tizimining normal ishlashini qoʻllab-quvvatlash", "Charchoqni kamaytirishga hissa"],
      ru: ["Нормальная работа мышц", "Поддержка нормальной работы нервной системы", "Вклад в снижение усталости"],
    },
    ingredientSlugs: ["magnesium"],
    productSlugs: ["dr-frei-antistress-magniy-20"],
    categorySlugs: ["minerals", "sleep"],
    relatedSlugs: ["sleep", "stress", "insomnia"],
    faq: {
      uz: [
        {
          question: "Magniyni kunning qaysi vaqtida ichish yaxshiroq?",
          answer: "Magniyni kechki ovqatdan keyin yoki yotishdan oldin ichish qulay.",
        },
      ],
      ru: [
        {
          question: "В какое время суток принимать?",
          answer: "Оптимально принимать магний вечером за ужином или перед сном.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "zinc",
    name: { uz: "Sink", ru: "Цинк" },
    headline: {
      uz: "Immunitet, terining normal holati va gormonlar balansi",
      ru: "Микроэлемент для иммунитета, кожи и нормального уровня тестостерона",
    },
    intro: {
      uz: "Sink — hujayralar boʻlinishi, oqsil sintezi, antioksidant fermentlar ishi va gormonal balansda ishtirok etuvchi muhim mineral.",
      ru: "Цинк участвует в делении клеток, синтезе белка, работе антиоксидантных ферментов и поддержании гормонального баланса.",
    },
    sections: {
      uz: [
        {
          title: "Sink va immun tizimi",
          body: "Sink immun tizimining normal ishlashiga hissa qoʻshadi. Shamollash belgilari paydo boʻlsa, shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          title: "Цинк и иммунная система",
          body: "Цинк способствует нормальной работе иммунной системы. При симптомах простуды обратитесь к врачу.",
        },
      ],
    },
    bullets: {
      uz: ["Immun tizimining normal ishlashini qoʻllab-quvvatlash", "Terining normal holatini saqlash", "Sochning normal holatini saqlash"],
      ru: ["Поддержка нормальной работы иммунитета", "Поддержание нормального состояния кожи", "Поддержание нормального состояния волос"],
    },
    ingredientSlugs: ["zinc"],
    productSlugs: ["swiss-energy-immunovit-30", "swiss-energy-hair-nail-skin-30", "dr-frei-gold-vitamins-20"],
    categorySlugs: ["minerals", "immunity"],
    relatedSlugs: ["immunity", "frequent-colds", "beauty"],
    faq: {
      uz: [
        {
          question: "Sinkni och qoringa ichsa boʻladimi?",
          answer: "Och qoringa ichilganda koʻngil aynishi mumkin, shuning uchun sinkni doimo toʻyib ovqatlangan holda ichish kerak.",
        },
      ],
      ru: [
        {
          question: "Можно ли принимать натощак?",
          answer: "Нет, цинк следует принимать строго после еды во избежание тошноты.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "omega-3",
    name: { uz: "Omega-3 (EPA / DHA)", ru: "Омега-3 (ЭПК / ДГК)" },
    headline: {
      uz: "Yurak, miya faoliyati, koʻrish va tomirlar elastikligi",
      ru: "Эссенциальные полиненасыщенные жирные кислоты для сердца и мозга",
    },
    intro: {
      uz: "Tozalangan chuqur dengiz baliq yogʻidan olingan Omega-3 triglitserid shaklida eng yuqori bio-mavjudlikka ega.",
      ru: "Высокоочищенные жирные кислоты EPA и DHA в форме триглицеридов способствуют нормальной работе сердца и мозга.",
    },
    sections: {
      uz: [
        {
          title: "Triglitserid shaklining afzalligi",
          body: "Tabiiy triglitserid (TG) shaklidagi Omega-3 etil efirlarga nisbatan 70% ga yaxshiroq soʻriladi va oshqozonni bezovta qilmaydi.",
        },
      ],
      ru: [
        {
          title: "Преимущество формы триглицеридов",
          body: "Триглицеридная форма омега-3 усваивается на 70% эффективнее по сравнению с этиловыми эфирами.",
        },
      ],
    },
    bullets: {
      uz: ["Yuqori EPA/DHA konsentratsiyasi", "Yurakning normal ishlashi", "Miyaning normal ishlashi va koʻrish"],
      ru: ["Высокая концентрация EPA/DHA", "Нормальная работа сердца", "Нормальная работа мозга и зрение"],
    },
    ingredientSlugs: ["epa-dha"],
    productSlugs: [],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["heart", "brain"],
    faq: {
      uz: [
        {
          question: "Baliq yogʻi taʼmi keladimi?",
          answer: "Zamonaviy molekulyar tozalash texnologiyasi tufayli yoqimsiz baliq hidi va taʼmi butunlay yoʻqotilgan.",
        },
      ],
      ru: [
        {
          question: "Есть ли рыбный привкус?",
          answer: "Благодаря молекулярной дистилляции капсулы не имеют неприятного рыбного запаха.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "collagen",
    name: { uz: "Dengiz Kollageni", ru: "Морской Коллаген" },
    headline: {
      uz: "Teri tarangligi, soch va boʻgʻimlar elastikligi uchun",
      ru: "Пептиды коллагена для плотности кожи, блеска волос и гибкости суставов",
    },
    intro: {
      uz: "Gidrolizlangan kichik molekulyar dengiz kollageni yaxshi oʻzlashtiriladi; kollagen terining tabiiy karkasining asosiy oqsili.",
      ru: "Низкомолекулярные пептиды рыбного коллагена хорошо усваиваются; коллаген — основной белок естественного каркаса кожи.",
    },
    sections: {
      uz: [
        {
          title: "Nima uchun dengiz kollageni?",
          body: "Dengiz kollageni molekulalari qoramol kollageniga qaraganda ancha mayda boʻlib, ichakda 1.5 baravar tezroq va toʻliq soʻriladi.",
        },
      ],
      ru: [
        {
          title: "Преимущество морского источника",
          body: "Пептиды морского коллагена имеют наименьший молекулярный вес и максимальное сродство к человеческой дерме.",
        },
      ],
    },
    bullets: {
      uz: ["I va III turdagi toza kollagen peptidlari", "Vitamin C va gialuron kislotasi bilan boyitilgan", "Teri namlanishi va mayinligi"],
      ru: ["Пептиды коллагена I и III типа", "Обогащен витамином C и гиалуроновой кислотой", "Повышение гидратации кожи"],
    },
    ingredientSlugs: ["collagen", "vitamin-c", "biotin"],
    productSlugs: ["swiss-energy-nature-collagen"],
    categorySlugs: ["beauty"],
    relatedSlugs: ["beauty", "joints", "hair-loss"],
    faq: {
      uz: [
        {
          question: "Kollagenni qanday ichish samaraliroq?",
          answer: "Ertalab och qoringa yoki kechqurun ovqatdan 2 soat keyin 1 stakan iliq suv bilan qabul qilinadi.",
        },
      ],
      ru: [
        {
          question: "Как принимать для максимального эффекта?",
          answer: "Утром натощак или через 2 часа после ужина, запивая стаканом теплой воды.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-b12",
    name: { uz: "Vitamin B12", ru: "Витамин B12" },
    headline: {
      uz: "Qon hosil boʻlishi, asab tizimi va charchoqni kamaytirishga hissa",
      ru: "Кроветворение, нервная система и вклад в снижение усталости",
    },
    intro: {
      uz: "Metilkobalamin — B12 vitaminining faol koferment shakli. U eritrotsitlar ishlab chiqarilishi va energiya almashinuvi uchun zarur.",
      ru: "Метилкобаламин — биоактивная форма B12, необходимая для синтеза гемоглобина и правильного функционирования нейронов.",
    },
    sections: {
      uz: [
        {
          title: "B12 tanqisligi xavfi",
          body: "B12 yetishmovchiligi kamqonlik (anemiya), xotira pasayishi, qoʻl-oyoqlarning uvishishi va doimiy holsizlikka sabab boʻladi.",
        },
      ],
      ru: [
        {
          title: "Симптомы дефицита B12",
          body: "Нехватка проявляется анемией, онемением конечностей, снижением памяти и хронической утомляемостью.",
        },
      ],
    },
    bullets: {
      uz: ["Biofaol metilkobalamin shakli", "Normal qon hosil boʻlishiga hissa", "Asab tizimining normal ishlashi"],
      ru: ["Биоактивная коферментная форма", "Вклад в нормальное кроветворение", "Нормальная работа нервной системы"],
    },
    ingredientSlugs: ["vitamin-b12"],
    productSlugs: ["swiss-energy-neuroforce-30", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["fatigue", "energy", "iron"],
    faq: {
      uz: [
        {
          question: "Vegetarianlarga B12 shartmi?",
          answer: "Ha, B12 asosan hayvon mahsulotlarida boʻlgani sababli, goʻsht kam isteʼmol qiluvchilarga B12 qabul qilish majburiydir.",
        },
      ],
      ru: [
        {
          question: "Обязателен ли прием при вегетарианстве?",
          answer: "Да, так как B12 содержится преимущественно в продуктах животного происхождения.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "iron",
    name: { uz: "Temir (Xelat)", ru: "Хелат Железа" },
    headline: {
      uz: "Normal gemoglobin hosil boʻlishi va toʻqimalarga kislorod tashilishi",
      ru: "Нормальное образование гемоглобина и мягкая для желудка форма",
    },
    intro: {
      uz: "Temir bisglisinat xelati oshqozon uchun yumshoq va yaxshi oʻzlashtiriladigan temir shaklidir.",
      ru: "Бисглицинат железа обладает высокой биодоступностью и мягко переносится желудком.",
    },
    sections: {
      uz: [
        {
          title: "Temir tanqisligi anemiyasi",
          body: "Ferritin past boʻlganda toʻqimalar kislorod ochligiga uchraydi: bosh aylanishi, soch toʻkilishi va kuchsizlik yuzaga keladi.",
        },
      ],
      ru: [
        {
          title: "Латентный дефицит железа",
          body: "Снижение уровня ферритина приводит к тканевой гипоксии, ломкости ногтей и выпадению волос.",
        },
      ],
    },
    bullets: {
      uz: ["Oshqozon uchun yumshoq bisglisinat shakli", "Vitamin C bilan birga yuqori soʻrilish", "Kislorod tashilishi va charchoqni kamaytirishga hissa"],
      ru: ["Хелатная форма, мягкая для желудка", "Максимальное усвоение с витамином C", "Транспорт кислорода и вклад в снижение усталости"],
    },
    ingredientSlugs: ["iron", "vitamin-c"],
    productSlugs: [],
    categorySlugs: ["minerals", "vitamins"],
    relatedSlugs: ["fatigue", "energy", "hair-loss"],
    faq: {
      uz: [
        {
          question: "Temirni nimalar bilan ichish mumkin emas?",
          answer: "Choy, kofe va sut mahsulotlari temir soʻrilishini toʻsadi. Ularni 2 soat oraliq bilan isteʼmol qiling.",
        },
      ],
      ru: [
        {
          question: "С чем нельзя совмещать прием железа?",
          answer: "Чай, кофе и молочные продукты подавляют всасывание железа; выдерживайте паузу 2 часа.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "calcium",
    name: { uz: "Kalsiy", ru: "Кальций" },
    headline: {
      uz: "Mustahkam suyaklar, sogʻlom tishlar va mushaklar kuchi",
      ru: "Минеральная плотность костей, здоровье зубов и проводимость мышц",
    },
    intro: {
      uz: "Kalsiy suyak skeletining asosiy tayanchi. Uning toʻgʻri oʻzlashtirilishi uchun D3 va K2 vitaminlari kofaktor sifatida talab qilinadi.",
      ru: "Кальций необходим для минерализации костей, свертывания крови и передачи нервных импульсов.",
    },
    sections: {
      uz: [
        {
          title: "Kalsiy sitratining afzalligi",
          body: "Kalsiy sitrati oshqozon kislotaliligi past boʻlganda ham yaxshi soʻriladi.",
        },
      ],
      ru: [
        {
          title: "Форма цитрата",
          body: "Цитрат кальция хорошо усваивается независимо от кислотности желудочного сока.",
        },
      ],
    },
    bullets: {
      uz: ["Suyaklarning normal holatini saqlashga hissa", "D3 va K2 bilan toʻgʻri birikish", "Tishlarning normal holati"],
      ru: ["Поддержание нормального состояния костей", "Синергия с D3 и K2", "Нормальное состояние зубов"],
    },
    ingredientSlugs: ["calcium", "vitamin-d3", "vitamin-k2"],
    productSlugs: ["swiss-energy-calcivit-30"],
    categorySlugs: ["minerals"],
    relatedSlugs: ["joints", "vitamin-d3"],
    faq: {
      uz: [
        {
          question: "Kalsiyni qachon ichish maqsadga muvofiq?",
          answer: "Kalsiy suyaklarga kechasi yaxshiroq birikadi, shuning uchun uni kechki ovqat paytida ichish tavsiya etiladi.",
        },
      ],
      ru: [
        {
          question: "Когда принимать кальций?",
          answer: "Резорбция костной ткани наиболее активна ночью, поэтому кальций лучше принимать вечером.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "probiotics",
    name: { uz: "Probiotiklar", ru: "Пробиотики" },
    headline: {
      uz: "Ichak mikrobiotasi, yengil hazm va immunitet poydevori",
      ru: "Живые бактерии для микрофлоры, комфортного пищеварения и иммунитета",
    },
    intro: {
      uz: "Mikroorganizmlarning foydali shtammlari ichak mikrobiotasi balansini qoʻllab-quvvatlaydi.",
      ru: "Комплекс лакто- и бифидобактерий поддерживает баланс кишечной микробиоты.",
    },
    sections: {
      uz: [
        {
          title: "Shtammlar xilma-xilligi",
          body: "Lactobacillus va Bifidobacterium birgalikda ichakning barcha boʻlimlarida sogʻlom muhitni taʼminlaydi.",
        },
      ],
      ru: [
        {
          title: "Разнообразие штаммов",
          body: "Комбинация различных штаммов обеспечивает колонизацию как тонкого, так и толстого кишечника.",
        },
      ],
    },
    bullets: {
      uz: ["Milliardlab jonli probiotik bakteriyalar", "Qulay hazm qilish", "Hazm va immunitet balansi"],
      ru: ["Миллиарды КОЕ живых бактерий", "Комфортное пищеварение", "Поддержка иммунитета"],
    },
    ingredientSlugs: ["probiotics"],
    productSlugs: [],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["digestion", "digestive-bloat", "immunity"],
    faq: {
      uz: [
        {
          question: "Probiotiklarni muzlatgichda saqlash kerakmi?",
          answer: "Zamonaviy mikrokapsulalangan shtammlar xona haroratida oʻz faolligini toʻliq saqlab qoladi.",
        },
      ],
      ru: [
        {
          question: "Требуется ли хранение в холодильнике?",
          answer: "Современные микрокапсулированные формы стабильны при комнатной температуре.",
        },
      ],
    },
  },

  // ── SYMPTOMS ──
  {
    kind: "symptom",
    slug: "fatigue",
    name: { uz: "Doimiy charchoq va quvvatsizlik", ru: "Хроническая усталость и упадок сил" },
    headline: {
      uz: "Ertalabdan quvvatsizlik sabablari va nimaga eʼtibor berish kerak",
      ru: "Причины нехватки сил и на что обратить внимание",
    },
    intro: {
      uz: "Doimiy charchoq — organizmning signalidir. Uning ortida temir tanqisligi (anemiya), B12, D3 yoki magniy yetishmovchiligi turishi mumkin.",
      ru: "Хроническая усталость — сигнал дефицита нутриентов: ферритина, витаминов группы B, D3 или магния.",
    },
    sections: {
      uz: [
        {
          title: "Keng tarqalgan sabablar",
          body: "Kam uyqu, surunkali stress, temir va B12 yetishmovchiligi, qalqonsimon bez gipofunksiyasi. Charchoq uzoq davom etsa, shifokor bilan maslahatlashing. B12, temir va magniy normal energiya almashinuviga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          title: "Основные факторы истощения",
          body: "Дефицит ферритина, недостаток витамина B12, хронический недосып и гипотиреоз — частые причины отсутствия бодрости. При длительной усталости посоветуйтесь с врачом. B12, железо и магний способствуют нормальному энергетическому обмену.",
        },
      ],
    },
    bullets: {
      uz: ["Temir va ferritin darajasini tekshirish", "Vitamin D3 va B12 qabul qilish", "Uyqu tartibi va magniy"],
      ru: ["Проверка ферритина и гемоглобина", "Восполнение D3 и B-комплекса", "Режим сна и магний"],
    },
    ingredientSlugs: ["iron", "vitamin-b12", "magnesium", "vitamin-d3"],
    productSlugs: ["swiss-energy-neuroforce-30", "dr-frei-multivitamins-biotin-20", "dr-frei-antistress-magniy-20"],
    categorySlugs: ["vitamins", "energy"],
    relatedSlugs: ["energy", "vitamin-b12", "iron"],
    faq: {
      uz: [
        {
          question: "Charchoq qachon oʻtib ketadi?",
          answer: "Bu charchoq sababiga bogʻliq. Sababni aniqlash uchun tahlil topshiring va shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Как быстро проходит слабость?",
          answer: "Это зависит от причины усталости. Чтобы её выяснить, сдайте анализы и посоветуйтесь с врачом.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "hair-loss",
    name: { uz: "Soch toʻkilishi va sinishi", ru: "Выпадение и ломкость волос" },
    headline: {
      uz: "Soch ildizlarini oziqlantirish, zichlik va sochning normal holati",
      ru: "Питание волосяных фолликулов, густота и нормальное состояние волос",
    },
    intro: {
      uz: "Soch toʻkilishi koʻpincha temir tanqisligi, biotin, sink va oqsil (kollagen) yetishmovchiligidan kelib chiqadi.",
      ru: "Выпадение волос часто спровоцировано дефицитом железа (ферритина), цинка, биотина и пептидов коллагена.",
    },
    sections: {
      uz: [
        {
          title: "Soch follikulasi nima bilan oziqlanadi?",
          body: "Soch 90% keratin oqsilidan iborat. Biotin va sink sochning normal holatini saqlashga hissa qoʻshadi, aminokislotalar esa keratin uchun qurilish materiali.",
        },
      ],
      ru: [
        {
          title: "Питание фолликула",
          body: "Волос на 90% состоит из кератина. Биотин и цинк способствуют поддержанию нормального состояния волос, а аминокислоты служат строительным материалом для кератина.",
        },
      ],
    },
    bullets: {
      uz: ["Biotin va kollagen — soch karkasini mustahkamlash", "Sink — bosh terisi yogʻlanishini nazorat qilish", "Temir va ferritin darajasini toʻldirish"],
      ru: ["Биотин и коллаген для кератина", "Цинк для здоровья кожи головы", "Восполнение уровня железа"],
    },
    ingredientSlugs: ["biotin", "collagen", "zinc", "iron"],
    productSlugs: ["swiss-energy-hair-nail-skin-30", "swiss-energy-nature-collagen"],
    categorySlugs: ["beauty"],
    relatedSlugs: ["beauty", "collagen", "biotin"],
    faq: {
      uz: [
        {
          question: "Natija qachon koʻrinadi?",
          answer: "Sochning oʻsish sikli sekin, shuning uchun vitaminlar kamida 2 oy kurs bilan qabul qilinadi. Soch kuchli toʻkilsa, trixolog yoki shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Когда будет заметен результат?",
          answer: "Цикл роста волос медленный, поэтому витамины принимают курсом не менее 2 месяцев. При сильном выпадении обратитесь к трихологу или врачу.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "insomnia",
    name: { uz: "Uyqusizlik va bezovtalik", ru: "Бессонница и прерывистый сон" },
    headline: {
      uz: "Oson uxlash, chuqur faza va xotirjam tong",
      ru: "Легкое засыпание, непрерывный сон и бодрое пробуждение",
    },
    intro: {
      uz: "Kechqurun uxlashga qiynalish va tez-tez uygʻonish magniy va B vitaminlari yetishmovchiligidan darak berishi mumkin.",
      ru: "Трудности с засыпанием и ночные пробуждения могут указывать на нехватку магния и повышенную возбудимость нервной системы.",
    },
    sections: {
      uz: [
        {
          title: "Asab impulslarini tartibga solish",
          body: "Magniy asab tizimi va mushaklarning normal ishlashiga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          title: "Регуляция нервных импульсов",
          body: "Магний способствует нормальной работе нервной системы и мышц.",
        },
      ],
    },
    bullets: {
      uz: ["Magniy xelat / B6 — kechki relaksatsiya", "Kechqurun kofein va spirtli ichimliklarni cheklash", "Xonani salqin va qorongʻu saqlash"],
      ru: ["Органический магний B6 за 40 минут до сна", "Ограничение кофеина во второй половине дня", "Проветривание спальни"],
    },
    ingredientSlugs: ["magnesium", "vitamin-b12"],
    productSlugs: ["dr-frei-antistress-magniy-20"],
    categorySlugs: ["sleep", "minerals"],
    relatedSlugs: ["sleep", "stress", "magnesium"],
    faq: {
      uz: [
        {
          question: "Uyqu dorilariga qaraganda magniyning farqi nima?",
          answer: "Magniy uyqu dorisi yoki sedativ emas: u asab tizimining normal ishlashiga hissa qoʻshadigan mineral. Uyqusizlik uzoq davom etsa, shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "В чем отличие от снотворных?",
          answer: "Магний не снотворное и не седативное средство, а минерал, который способствует нормальной работе нервной системы. При длительной бессоннице обратитесь к врачу.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "frequent-colds",
    name: { uz: "Tez-tez shamollash", ru: "Частые простуды и слабый иммунитет" },
    headline: {
      uz: "Immun tizimining normal ishlashini qoʻllab-quvvatlash",
      ru: "Поддержка нормальной работы иммунной системы",
    },
    intro: {
      uz: "Yiliga 3–4 martadan koʻp shamollash immun tizimiga eʼtibor berish kerakligini bildirishi mumkin. D3, sink va C vitamini immun tizimining normal ishlashiga hissa qoʻshadi; tez-tez kasallansangiz, shifokorga murojaat qiling.",
      ru: "Частые ОРВИ — повод обратить внимание на иммунную систему. Витамины D3, C и цинк способствуют нормальной работе иммунной системы; при частых простудах обратитесь к врачу.",
    },
    sections: {
      uz: [
        {
          title: "Immunitet uchun nutriyentlar",
          body: "Sink, D3 va C vitamini immun tizimining normal ishlashiga hissa qoʻshadi, C vitamini esa hujayralarni oksidlovchi stressdan himoyalashga yordam beradi.",
        },
      ],
      ru: [
        {
          title: "Нутриенты для иммунитета",
          body: "Цинк, витамины D3 и C способствуют нормальной работе иммунной системы, а витамин C помогает защищать клетки от окислительного стресса.",
        },
      ],
    },
    bullets: {
      uz: ["Vitamin D3 5000 IU kurs", "Sink pikolinat 25-50 mg", "Vitamin C 1000 mg"],
      ru: ["Курсовой витамин D3", "Хелатный цинк", "Высокодозный витамин C"],
    },
    ingredientSlugs: ["vitamin-d3", "zinc", "vitamin-c"],
    productSlugs: ["swiss-energy-immunovit-30", "swiss-energy-vitamin-c-20"],
    categorySlugs: ["immunity", "vitamins"],
    relatedSlugs: ["immunity", "vitamin-d3", "zinc"],
    faq: {
      uz: [
        {
          question: "Shamollash boshlanganda nima qilish kerak?",
          answer: "Sink va C vitamini immun tizimining normal ishlashiga hissa qoʻshadi, lekin ular dori emas. Kasallik belgilari paydo boʻlsa, shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Что принимать при первых признаках простуды?",
          answer: "Цинк и витамин C способствуют нормальной работе иммунной системы, но не являются лекарством. При симптомах болезни обратитесь к врачу.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "stress-anxiety",
    name: { uz: "Xavotir va asabiylik", ru: "Тревожность и раздражительность" },
    headline: {
      uz: "Hissiy muvozanat, ichki xotirjamlik va stressga chidamlilik",
      ru: "Эмоциональный баланс, внутреннее спокойствие и стрессоустойчивость",
    },
    intro: {
      uz: "Ichki bezovtalik va stress magniy va B guruhi vitaminlari zaxirasini kamaytirishi mumkin. Magniy va B6 asab tizimining normal ishlashiga hissa qoʻshadi.",
      ru: "Внутреннее напряжение и стресс могут истощать запасы магния и витаминов группы B. Магний и B6 способствуют нормальной работе нервной системы.",
    },
    sections: {
      uz: [
        {
          title: "Xotirjamlik gormonlari",
          body: "Serotonin va GABA neyromediatorlari magniy va B6 ishtirokida sintezlanadi.",
        },
      ],
      ru: [
        {
          title: "Синтез серотонина",
          body: "Магний и B6 служат кофакторами для превращения триптофана в серотонин.",
        },
      ],
    },
    bullets: {
      uz: ["Magniy bisglisinat / B6", "Kunduzgi tinchlik va diqqat", "Kechki sifatli uyqu"],
      ru: ["Хелат магния с витамином B6", "Спокойствие и внимание днём", "Качественный сон вечером"],
    },
    ingredientSlugs: ["magnesium", "vitamin-b12"],
    productSlugs: ["dr-frei-antistress-magniy-20"],
    categorySlugs: ["sleep", "minerals"],
    relatedSlugs: ["stress", "sleep", "insomnia"],
    faq: {
      uz: [
        {
          question: "Magniy qancha vaqt ichiladi?",
          answer: "Odatda 1–2 oylik kurs shaklida qabul qilinadi.",
        },
      ],
      ru: [
        {
          question: "Сколько длится курс?",
          answer: "Обычно магний принимают курсом от 1 до 2 месяцев.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "digestive-bloat",
    name: { uz: "Qorin dam boʻlishi va ogʻirlik", ru: "Вздутие и тяжесть в животе" },
    headline: {
      uz: "Yengil hazm, mikroflora balansi va qorindagi qulaylik",
      ru: "Баланс микрофлоры, комфортное пищеварение и легкость",
    },
    intro: {
      uz: "Qorindagi noqulaylik va gazlar ichakda foydali bakteriyalar kamayganidan va fermentlar yetishmasligidan yuzaga kelishi mumkin.",
      ru: "Вздутие живота и ощущение тяжести после еды могут быть связаны с нарушением баланса микрофлоры и замедленным пищеварением.",
    },
    sections: {
      uz: [
        {
          title: "Mikroflora balansi",
          body: "Probiotik shtammlar ichak mikroflorasi balansini qoʻllab-quvvatlaydi va qulay hazm qilishga yordam beradi.",
        },
      ],
      ru: [
        {
          title: "Баланс микрофлоры",
          body: "Живые культуры лакто- и бифидобактерий поддерживают баланс кишечной микрофлоры и комфортное пищеварение.",
        },
      ],
    },
    bullets: {
      uz: ["Jonli probiotiklar kursi", "Yetarli miqdorda iliq suv ichish", "Shirinlik va oq unni cheklash"],
      ru: ["Курс мультипробиотика", "Достаточный питьевой режим", "Снижение доли рафинированных сахаров"],
    },
    ingredientSlugs: ["probiotics", "zinc"],
    productSlugs: [],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["digestion", "probiotics"],
    faq: {
      uz: [
        {
          question: "Probiotik qachon taʼsir qiladi?",
          answer: "Taʼsir har kimda turlicha, probiotiklar odatda kurs bilan qabul qilinadi. Noqulaylik uzoq davom etsa, shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Когда пробиотик начинает действовать?",
          answer: "Эффект индивидуален, пробиотики обычно принимают курсом. Если дискомфорт сохраняется, обратитесь к врачу.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "joint-pain",
    name: { uz: "Boʻgʻimlarda ogʻriq va qisirlash", ru: "Дискомфорт и хруст в суставах" },
    headline: {
      uz: "Togʻay toʻqimasini oziqlantirish, moylash va harakat yengilligi",
      ru: "Питание хряща, выработка суставной жидкости и легкость движений",
    },
    intro: {
      uz: "Boʻgʻimlardagi qisirlash va noqulaylik sinovial suyuqlik kamayishi va kollagen tolalari eskirishi bilan bogʻliq.",
      ru: "Дискомфорт при ходьбе и хруст в коленях связаны с уменьшением суставной жидкости и износом коллагеновых волокон.",
    },
    sections: {
      uz: [
        {
          title: "Boʻgʻimlar uchun nutriyentlar",
          body: "Gidrolizlangan kollagen, D3, K2 va kalsiy koʻpincha birga qabul qilinadi: D3 va kalsiy suyaklarning normal holatini saqlashga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          title: "Нутриенты для суставов",
          body: "Коллаген, витамины D3, K2 и кальций часто принимают вместе: витамин D3 и кальций способствуют поддержанию нормального состояния костей.",
        },
      ],
    },
    bullets: {
      uz: ["Dengiz kollageni peptidlari", "Vitamin D3 + K2 kalsiy bilan", "Doimiy yumshoq jismoniy faollik"],
      ru: ["Пептиды коллагена для хрящей", "Витамины D3 и K2 с кальцием", "Умеренная двигательная активность"],
    },
    ingredientSlugs: ["collagen", "vitamin-d3", "vitamin-k2", "calcium"],
    productSlugs: ["swiss-energy-calcivit-30", "swiss-energy-nature-collagen"],
    categorySlugs: ["vitamins", "minerals"],
    relatedSlugs: ["joints", "collagen", "calcium"],
    faq: {
      uz: [
        {
          question: "Kollagen boʻgʻimlarga qanchada yordam beradi?",
          answer: "Togʻay toʻqimasi sekin yangilanadi, shuning uchun kurs odatda 2–3 oy davom etadi. Boʻgʻimlarda ogʻriq boʻlsa, shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Сколько длится курс для суставов?",
          answer: "Хрящевая ткань обновляется медленно, поэтому курс обычно длится 2–3 месяца. При боли в суставах обратитесь к врачу.",
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
