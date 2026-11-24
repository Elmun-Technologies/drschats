import type { Locale } from "@/lib/i18n/routing";
import { demandVitaminTopics } from "./health-topics-demand";
import { audienceGoalTopics } from "./health-topics-audience";
import { moreTopics } from "./health-topics-more";

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

export interface RawHealthTopic {
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
      uz: "Suyaklar, mushaklar va immunitet uchun quyosh vitamini",
      ru: "Солнечный витамин для костей, мышц и иммунитета",
    },
    intro: {
      uz: "Vitamin D3 kalsiy va fosforning normal soʻrilishiga, suyak, tish, mushak va immun tizimining normal ishlashiga hissa qoʻshadi.",
      ru: "Витамин D3 вносит вклад в нормальное усвоение кальция и фосфора, состояние костей и зубов, работу мышц и иммунной системы.",
    },
    sections: {
      uz: [
        {
          title: "Vitamin D3 nima uchun kerak",
          body: "Vitamin D kalsiy va fosforning normal soʻrilishi va ishlatilishiga, qondagi kalsiy miqdorining normal boʻlishiga, suyak va tishlarning normal holatiga, mushaklar hamda immun tizimining normal ishlashiga hissa qoʻshadi.",
        },
        {
          title: "D3 va D2 — farqi nimada",
          body: "Vitamin D ikki asosiy shaklda uchraydi: D2 (ergokalsiferol) va D3 (xolekalsiferol). Qoʻshimchalarda koʻpincha D3 ishlatiladi. Qaysi shakl borligi mahsulot qadogʻida koʻrsatiladi: masalan, Swiss Energy Prenatal Forte tarkibida D2 shakli bor.",
        },
        {
          title: "D3 va K2 birga",
          body: "D vitamini kalsiyning normal soʻrilishiga hissa qoʻshadi, K vitamini esa suyaklarning normal holatiga va qonning normal ivishiga hissa qoʻshadi. Shuning uchun kalsiy, D3 va K2 koʻpincha bitta majmuada boʻladi.",
        },
        {
          title: "Qaysi mahsulotlarda D bor",
          body: "Swiss Energy Calcivit — kalsiy, D3, K2, sink, B vitaminlari, mis va marganets, 30 kapsula. Dr. Frei Multivitamins + Biotin — shipuchi tabletkada vitamin D 5 mkg. Alohida D3 (monokomponent) mahsuloti katalogda hozircha yoʻq.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "D vitamini yogʻda eriydi, shuning uchun uni ovqat bilan ichish qulay. Dozani mahsulot qadogʻidan oling; qoʻshimcha dozalar haqida shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен витамин D3",
          body: "Витамин D вносит вклад в нормальное усвоение и использование кальция и фосфора, нормальный уровень кальция в крови, нормальное состояние костей и зубов, работу мышц и иммунной системы.",
        },
        {
          title: "D3 и D2: в чём разница",
          body: "Витамин D встречается в двух основных формах: D2 (эргокальциферол) и D3 (холекальциферол). В добавках чаще используют D3. Форма указана на упаковке: например, в Swiss Energy Prenatal Forte содержится форма D2.",
        },
        {
          title: "D3 и K2 вместе",
          body: "Витамин D вносит вклад в нормальное усвоение кальция, а витамин K — в нормальное состояние костей и свёртываемость крови. Поэтому кальций, D3 и K2 часто объединяют в одном комплексе.",
        },
        {
          title: "В каких продуктах есть D",
          body: "Swiss Energy Calcivit — кальций, D3, K2, цинк, витамины группы B, медь и марганец, 30 капсул. Dr. Frei Multivitamins + Biotin — шипучие таблетки, витамин D 5 мкг. Отдельного монокомпонентного D3 в каталоге пока нет.",
        },
        {
          title: "Как принимать",
          body: "Витамин D жирорастворим, поэтому принимать его удобно во время еды. Дозировку берите с упаковки; о дополнительных дозах проконсультируйтесь с врачом.",
        },
      ],
    },
    bullets: {
      uz: ["Calcivit tarkibida: kalsiy + D3 + K2 + sink, B, Cu, Mn", "Multivitamins + Biotin tarkibida vitamin D 5 mkg", "D yogʻda eriydi — ovqat bilan qabul qilish qulay", "Dozani qadoqdan oling, qoʻshimcha dozani shifokor bilan kelishing"],
      ru: ["В Calcivit: кальций + D3 + K2 + цинк, B, Cu, Mn", "В Multivitamins + Biotin витамин D 5 мкг", "D жирорастворим — удобно принимать с едой", "Дозировку берите с упаковки, дополнительную согласуйте с врачом"],
    },
    ingredientSlugs: ["vitamin-d3", "vitamin-k2"],
    productSlugs: ["swiss-energy-calcivit-30", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: ["vitamins", "immunity"],
    relatedSlugs: ["immunity", "frequent-colds", "calcium", "vitamin-k2"],
    faq: {
      uz: [
        {
          question: "Vitamin D3 nima uchun kerak?",
          answer: "D vitamini kalsiy va fosforning normal soʻrilishiga, suyak va tishlarning normal holatiga, mushaklar hamda immun tizimining normal ishlashiga hissa qoʻshadi. Qoʻshimcha dori vositasi emas.",
        },
        {
          question: "D3 ni yozda ham ichish kerakmi?",
          answer: "Bu quyosh nurida boʻlish vaqti, yashash joyi va ovqatlanishga bogʻliq. Ehtiyojni aniqlash uchun shifokor qon tahlilini (25-OH vitamin D) tavsiya qilishi mumkin; dozani u bilan kelishing.",
        },
        {
          question: "D3 va D2 farqi nima?",
          answer: "Ikkalasi ham vitamin D shakllari: D2 — ergokalsiferol, D3 — xolekalsiferol. Qoʻshimchalarda koʻpincha D3 ishlatiladi; qadoqda qaysi shakl borligi yoziladi.",
        },
        {
          question: "D3 ni K2 bilan birga ichish kerakmi?",
          answer: "D va K vitaminlari turli vazifalarda qatnashadi: D kalsiyning soʻrilishiga, K suyaklarning normal holatiga hissa qoʻshadi. Swiss Energy Calcivit tarkibida ular birga. Alohida qoʻshishdan oldin shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Для чего нужен витамин D3?",
          answer: "Витамин D вносит вклад в нормальное усвоение кальция и фосфора, состояние костей и зубов, работу мышц и иммунной системы. Добавка не является лекарством.",
        },
        {
          question: "Нужно ли принимать D3 летом?",
          answer: "Это зависит от времени на солнце, места проживания и питания. Чтобы оценить потребность, врач может назначить анализ крови (25-OH витамин D); дозировку согласуйте с ним.",
        },
        {
          question: "Чем D3 отличается от D2?",
          answer: "Обе формы — витамин D: D2 — эргокальциферол, D3 — холекальциферол. В добавках чаще используют D3; форма указана на упаковке.",
        },
        {
          question: "Нужно ли принимать D3 вместе с K2?",
          answer: "D и K участвуют в разных процессах: D вносит вклад в усвоение кальция, K — в нормальное состояние костей. В Swiss Energy Calcivit они вместе. Прежде чем добавлять отдельно, проконсультируйтесь с врачом.",
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
          title: "Vitamin C nima uchun kerak",
          body: "Vitamin C immun va asab tizimining normal ishlashiga, normal kollagen hosil boʻlishiga, charchoq va holsizlikni kamaytirishga hissa qoʻshadi hamda temirning soʻrilishini oshiradi. Organizm uni oʻzi ishlab chiqara olmaydi.",
        },
        {
          title: "Qaysi shaklda: shipuchi yoki kapsula",
          body: "Swiss Energy Vitamin C — 550 mg, 20 shipuchi tabletka, apelsin taʼmi. Swiss Energy ImmunoVit — 30 kapsula: echinacea 100 mg, propolis 50 mg, vitamin C 80 mg va sink 10 mg. Dr. Frei Gold Vitamins tarkibida ham vitamin C 80 mg bor.",
        },
        {
          title: "Vitamin C va temir",
          body: "Vitamin C temirning soʻrilishini oshirishga hissa qoʻshadi — shuning uchun temir qoʻshimchalari koʻpincha C bilan birga boʻladi.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "Vitamin C 550 mg: 1 tabletkani suvda eriting, kuniga 1 marta, ovqat paytida yoki darhol keyin. Katta dozalar haqida shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен витамин C",
          body: "Витамин C вносит вклад в нормальную работу иммунной и нервной систем, нормальное образование коллагена, снижение усталости и утомляемости, а также повышает усвоение железа. Организм не синтезирует его самостоятельно.",
        },
        {
          title: "Какую форму выбрать: шипучие таблетки или капсулы",
          body: "Swiss Energy Vitamin C — 550 мг, 20 шипучих таблеток со вкусом апельсина. Swiss Energy ImmunoVit — 30 капсул: эхинацея 100 мг, прополис 50 мг, витамин C 80 мг и цинк 10 мг. В Dr. Frei Gold Vitamins тоже есть витамин C 80 мг.",
        },
        {
          title: "Витамин C и железо",
          body: "Витамин C повышает усвоение железа — поэтому добавки с железом часто сочетают с C.",
        },
        {
          title: "Как принимать",
          body: "Витамин C 550 мг: 1 таблетку растворить в воде, 1 раз в день во время еды или сразу после. О высоких дозах проконсультируйтесь с врачом.",
        },
      ],
    },
    bullets: {
      uz: ["550 mg — bir shipuchi tabletkada", "20 tabletka, apelsin taʼmi", "ImmunoVit: C 80 mg + sink 10 mg + echinacea + propolis", "Temirning soʻrilishini oshirishga hissa qoʻshadi"],
      ru: ["550 мг в одной шипучей таблетке", "20 таблеток, вкус апельсина", "ImmunoVit: C 80 мг + цинк 10 мг + эхинацея + прополис", "Повышает усвоение железа"],
    },
    ingredientSlugs: ["vitamin-c"],
    productSlugs: ["swiss-energy-immunovit-30", "swiss-energy-vitamin-c-20", "dr-frei-gold-vitamins-20"],
    categorySlugs: ["vitamins", "effervescent"],
    relatedSlugs: ["immunity", "frequent-colds", "iron", "zinc"],
    faq: {
      uz: [
        {
          question: "Vitamin C ni qachon ichish kerak?",
          answer: "Swiss Energy Vitamin C uchun ishlab chiqaruvchi kuniga 1 marta, ovqat paytida yoki darhol keyin ichishni koʻrsatadi.",
        },
        {
          question: "Shipuchi tabletka bilan kapsulaning farqi nima?",
          answer: "Shipuchi tabletka suvda eritib ichiladi (Vitamin C 550 mg), kapsula esa suv bilan yutiladi (ImmunoVit, vitamin C 80 mg va boshqa komponentlar bilan). Miqdor va tarkib mahsulotga qarab farq qiladi — qadoqni solishtiring.",
        },
        {
          question: "Vitamin C ni har kuni ichsa boʻladimi?",
          answer: "Qadoqdagi koʻrsatma kuniga 1 tabletkani nazarda tutadi. Uzoq muddat yoki yuqori dozada qabul qilishdan oldin shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Когда принимать витамин C?",
          answer: "Для Swiss Energy Vitamin C производитель указывает: 1 раз в день во время еды или сразу после.",
        },
        {
          question: "Чем шипучие таблетки отличаются от капсул?",
          answer: "Шипучую таблетку растворяют в воде (Vitamin C 550 мг), капсулу запивают водой (ImmunoVit, витамин C 80 мг и другие компоненты). Количество и состав зависят от продукта — сравнивайте упаковки.",
        },
        {
          question: "Можно ли принимать витамин C каждый день?",
          answer: "Инструкция на упаковке предполагает 1 таблетку в день. Перед длительным приёмом или более высокой дозой проконсультируйтесь с врачом.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "magnesium",
    name: { uz: "Magniy B6", ru: "Магний B6" },
    headline: {
      uz: "Asab tizimi, mushaklar va energiya almashinuvi uchun mineral",
      ru: "Минерал для нервной системы, мышц и энергетического обмена",
    },
    intro: {
      uz: "Magniy asab va mushaklarning normal ishlashiga hissa qoʻshadi. Magniy B6 nima, sitrat va xelat farqi, qanday tanlash — qisqa va aniq.",
      ru: "Магний вносит вклад в нормальную работу нервной системы и мышц. Магний B6, цитрат и хелат: чем отличаются и как выбрать.",
    },
    sections: {
      uz: [
        {
          title: "Magniy nima uchun kerak",
          body: "Magniy organizmdagi koʻplab fermentlar ishida qatnashadigan mineral. U normal energiya almashinuvi, asab tizimi va mushaklar faoliyati, elektrolit balansiga hamda charchoq va holsizlikni kamaytirishga hissa qoʻshadi.",
        },
        {
          title: "Magniy B6 nima",
          body: "Magniy B6 — magniy va B6 vitamini bitta qoʻshimchada. B6 vitamini ham asab tizimi va psixologik faoliyatning normal kechishiga hissa qoʻshadi. Har bir moddaning miqdori mahsulot qadogʻida koʻrsatiladi.",
        },
        {
          title: "Sitrat, xelat, oksid — farqi nimada",
          body: "Magniy turli tuz shakllarida boʻladi: sitrat, xelat (bisglitsinat), oksid, laktat va boshqalar. Shakllar turlicha soʻriladi va oshqozon-ichakka turlicha taʼsir qilishi mumkin. Tanlashda qadoqdagi shakl va sof magniy miqdoriga qarang. Dr. Frei Antistress tarkibida magniy 100 mg, B6 2 mg; magniy tuzining aniq shakli qadoqda alohida koʻrsatilmagan, shuning uchun uni sitrat yoki xelat deb atamaymiz.",
        },
        {
          title: "Antistress tarkibida yana nima bor",
          body: "Magniy va B6 dan tashqari bir tabletkada taurin 100 mg, vitamin C 80 mg va vitamin K 30 mkg bor. Shipuchi tabletka bir stakan suvda eriydi.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "1 tabletkani 200 ml suvda eriting va kechqurun, ovqatdan keyin iching. Aniq koʻrsatma uchun qadoqqa qarang.",
        },
        {
          title: "Kimlar shifokor bilan maslahatlashishi kerak",
          body: "Buyrak faoliyatida muammo boʻlsa, homiladorlik va emizish davrida yoki doimiy dori qabul qilsangiz — magniy qoʻshimchasini boshlashdan oldin shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен магний",
          body: "Магний участвует в работе многих ферментов. Он вносит вклад в нормальный энергетический обмен, работу нервной системы и мышц, баланс электролитов, а также в снижение усталости и утомляемости.",
        },
        {
          title: "Что такое магний B6",
          body: "Магний B6 — сочетание магния и витамина B6 в одной добавке. Витамин B6 тоже вносит вклад в нормальную работу нервной системы и психологические функции. Количество каждого вещества указано на упаковке.",
        },
        {
          title: "Цитрат, хелат, оксид: в чём разница",
          body: "Магний выпускают в разных солевых формах: цитрат, хелат (бисглицинат), оксид, лактат и другие. Формы по-разному усваиваются и могут по-разному переноситься желудочно-кишечным трактом. При выборе смотрите на форму и количество чистого магния на упаковке. В Dr. Frei Antistress магния 100 мг, B6 — 2 мг; конкретная соль магния на упаковке отдельно не указана, поэтому мы не называем её цитратом или хелатом.",
        },
        {
          title: "Что ещё в составе Antistress",
          body: "Помимо магния и B6 в одной таблетке таурин 100 мг, витамин C 80 мг и витамин K 30 мкг. Шипучая таблетка растворяется в стакане воды.",
        },
        {
          title: "Как принимать",
          body: "1 таблетку растворить в 200 мл воды и принимать вечером после еды. Точная инструкция — на упаковке.",
        },
        {
          title: "Когда нужна консультация врача",
          body: "Если есть нарушения работы почек, во время беременности и кормления грудью или при постоянном приёме лекарств — перед началом приёма магния проконсультируйтесь с врачом.",
        },
      ],
    },
    bullets: {
      uz: ["Magniy 100 mg + B6 2 mg — bir tabletkada (Dr. Frei Antistress)", "Shipuchi tabletka: 200 ml suvda eriydi, kechqurun ovqatdan keyin", "Tarkibida taurin, vitamin C va K ham bor", "20 tabletka — 20 kunlik hajm"],
      ru: ["Магний 100 мг + B6 2 мг в одной таблетке (Dr. Frei Antistress)", "Шипучая таблетка: растворить в 200 мл воды, вечером после еды", "В составе также таурин, витамин C и K", "20 таблеток — на 20 дней"],
    },
    ingredientSlugs: ["magnesium"],
    productSlugs: ["dr-frei-antistress-magniy-20"],
    categorySlugs: ["minerals", "sleep"],
    relatedSlugs: ["vitamin-b6", "sleep", "stress", "insomnia"],
    faq: {
      uz: [
        {
          question: "Magniy B6 nima uchun kerak?",
          answer: "Magniy asab tizimi va mushaklarning normal ishlashiga, energiya almashinuviga va charchoqni kamaytirishga hissa qoʻshadi; B6 vitamini asab tizimi va psixologik faoliyatning normal kechishiga hissa qoʻshadi. Qoʻshimcha dori vositasi emas.",
        },
        {
          question: "Magniy sitrat va magniy xelat — qaysi biri yaxshiroq?",
          answer: "Bitta «eng yaxshi» shakl yoʻq: sitrat, xelat va boshqa tuzlar turlicha soʻriladi va ichakka turlicha taʼsir qilishi mumkin. Qadoqdagi sof magniy miqdoriga va oʻz bardoshliligingizga qarang; shakl tanlashda shifokor yoki farmatsevt bilan maslahatlashing.",
        },
        {
          question: "Magniy B6 ni qachon ichish kerak?",
          answer: "Dr. Frei Antistress uchun ishlab chiqaruvchi kechqurun, ovqatdan keyin 1 tabletkani 200 ml suvda eritib ichishni koʻrsatadi. Boshqa mahsulotlarda qadoqdagi koʻrsatmaga amal qiling.",
        },
        {
          question: "Magniy B6 ni kimlar ichmasligi kerak?",
          answer: "Tarkibdagi biror modda koʻtarilmasa, shuningdek buyrak kasalligi, homiladorlik, emizish yoki doimiy dori qabul qilish holatlarida avval shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Для чего нужен магний B6?",
          answer: "Магний вносит вклад в нормальную работу нервной системы и мышц, энергетический обмен и снижение усталости; витамин B6 — в нормальную работу нервной системы и психологические функции. Добавка не является лекарством.",
        },
        {
          question: "Магний цитрат или магний хелат — что лучше?",
          answer: "Единой «лучшей» формы нет: цитрат, хелат и другие соли по-разному усваиваются и могут по-разному переноситься. Смотрите на количество чистого магния на упаковке и на собственную переносимость; форму лучше выбирать вместе с врачом или фармацевтом.",
        },
        {
          question: "Когда принимать магний B6?",
          answer: "Для Dr. Frei Antistress производитель указывает: 1 таблетку растворить в 200 мл воды и выпить вечером после еды. Для других продуктов следуйте инструкции на упаковке.",
        },
        {
          question: "Кому нельзя принимать магний B6?",
          answer: "Если есть непереносимость компонентов, а также при заболеваниях почек, беременности, кормлении грудью или постоянном приёме лекарств — сначала проконсультируйтесь с врачом.",
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
        {
          title: "Sink — teri, soch va tirnoq",
          body: "Sink terining, sochning va tirnoqlarning normal holatini saqlashga hissa qoʻshadi. Shuning uchun u goʻzallik yoʻnalishidagi vitamin majmualarida ham uchraydi.",
        },
        {
          title: "Qaysi mahsulotlarda sink bor",
          body: "Katalogda sink 10 mg miqdorida: Swiss Energy ImmunoVit (echinacea, propolis va vitamin C bilan), Swiss Energy Hair Nail Skin (biotin va B vitaminlari bilan) hamda Dr. Frei Gold Vitamins (lutein, A, C va E bilan). Alohida sink mahsuloti hozircha yoʻq.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "Sink koʻngil aynishiga sabab boʻlishi mumkin, shuning uchun uni ovqat bilan ichish qulay. Har bir mahsulot uchun qadoqdagi koʻrsatmaga amal qiling.",
        },
      ],
      ru: [
        {
          title: "Цинк и иммунная система",
          body: "Цинк способствует нормальной работе иммунной системы. При симптомах простуды обратитесь к врачу.",
        },
        {
          title: "Цинк: кожа, волосы, ногти",
          body: "Цинк вносит вклад в поддержание нормального состояния кожи, волос и ногтей. Поэтому он встречается и в витаминных комплексах для красоты.",
        },
        {
          title: "В каких продуктах есть цинк",
          body: "В каталоге цинк в количестве 10 мг: Swiss Energy ImmunoVit (с эхинацеей, прополисом и витамином C), Swiss Energy Hair Nail Skin (с биотином и витаминами группы B) и Dr. Frei Gold Vitamins (с лютеином, A, C и E). Отдельного продукта с цинком пока нет.",
        },
        {
          title: "Как принимать",
          body: "Цинк может вызывать тошноту, поэтому его удобно принимать во время еды. Для каждого продукта следуйте инструкции на упаковке.",
        },
      ],
    },
    bullets: {
      uz: ["Immun tizimining normal ishlashini qoʻllab-quvvatlash", "Terining normal holatini saqlash", "Sochning normal holatini saqlash", "Katalogda 3 ta mahsulotda 10 mg sink bor"],
      ru: ["Поддержка нормальной работы иммунитета", "Поддержание нормального состояния кожи", "Поддержание нормального состояния волос", "В каталоге 3 продукта с цинком 10 мг"],
    },
    ingredientSlugs: ["zinc"],
    productSlugs: ["swiss-energy-immunovit-30", "swiss-energy-hair-nail-skin-30", "dr-frei-gold-vitamins-20"],
    categorySlugs: ["minerals", "immunity"],
    relatedSlugs: ["immunity", "frequent-colds", "beauty", "vitamin-c"],
    faq: {
      uz: [
        {
          question: "Sinkni och qoringa ichsa boʻladimi?",
          answer: "Och qoringa ichilganda koʻngil aynishi mumkin, shuning uchun sinkni ovqat bilan ichish qulay.",
        },
        {
          question: "Sink qaysi mahsulotlarda bor?",
          answer: "ImmunoVit, Hair Nail Skin va Gold Vitamins tarkibida 10 mg dan sink bor. Alohida sink mahsuloti katalogda hozircha yoʻq.",
        },
        {
          question: "Sink va vitamin C ni birga ichsa boʻladimi?",
          answer: "Swiss Energy ImmunoVit tarkibida ikkalasi birga: sink 10 mg va vitamin C 80 mg (echinacea va propolis bilan). Qoʻshimcha sifatida alohida ichishdan oldin shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Можно ли принимать цинк натощак?",
          answer: "Натощак возможна тошнота, поэтому цинк удобнее принимать во время еды.",
        },
        {
          question: "В каких продуктах есть цинк?",
          answer: "В ImmunoVit, Hair Nail Skin и Gold Vitamins по 10 мг цинка. Отдельного продукта с цинком в каталоге пока нет.",
        },
        {
          question: "Можно ли принимать цинк вместе с витамином C?",
          answer: "В Swiss Energy ImmunoVit они вместе: цинк 10 мг и витамин C 80 мг (с эхинацеей и прополисом). Прежде чем принимать добавки отдельно, проконсультируйтесь с врачом.",
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
    name: { uz: "Kollagen", ru: "Коллаген" },
    headline: {
      uz: "Teri, paylar va boʻgʻimlarning tarkibiy oqsili",
      ru: "Структурный белок кожи, связок и суставов",
    },
    intro: {
      uz: "Kollagen — teri, paylar va xaftaga toʻqimasining tarkibiy oqsili. Kukun kollagen: tarkibi, qabul qilinishi va tanlash boʻyicha.",
      ru: "Коллаген — структурный белок кожи, связок и хрящей. Порошковый коллаген: состав, как принимать и на что смотреть при выборе.",
    },
    sections: {
      uz: [
        {
          title: "Kollagen nima",
          body: "Kollagen — organizmdagi asosiy tarkibiy oqsil: teri, paylar, xaftaga va suyaklarda boʻladi. Qoʻshimcha sifatida odatda gidrolizlangan (mayda boʻlakchalarga ajratilgan) shaklda — kukun yoki kapsulada — sotiladi.",
        },
        {
          title: "Swiss Energy Nature Collagen tarkibi",
          body: "Qadoqda: Premium Formula, 100% sof kollagen, shakarsiz, neytral taʼm, Shveytsariyada ishlab chiqarilgan. Qadoq maʼlumotiga koʻra teri, soch, tirnoq, suyak va boʻgʻimlar uchun moʻljallangan. Taʼsir odamdan odamga farq qilishi mumkin.",
        },
        {
          title: "Kollagen va vitamin C",
          body: "Vitamin C normal kollagen hosil boʻlishiga (teri, qon tomirlar, suyak, xaftaga, tish va milk uchun) hissa qoʻshadi, shuning uchun kollagen koʻpincha vitamin C bilan birga olinadi. Katalogda C — Swiss Energy Vitamin C shipuchi tabletkasi.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "Kukun istalgan ichimlikka aralashtiriladi, taʼmi neytral, shakarsiz. Miqdor va qabul vaqti uchun bankadagi koʻrsatmaga amal qiling.",
        },
      ],
      ru: [
        {
          title: "Что такое коллаген",
          body: "Коллаген — основной структурный белок организма: он есть в коже, связках, хрящах и костях. В добавках его обычно используют в гидролизованной форме (расщеплённой на мелкие фрагменты) — в виде порошка или капсул.",
        },
        {
          title: "Состав Swiss Energy Nature Collagen",
          body: "На упаковке: Premium Formula, 100% чистый коллаген, без сахара, нейтральный вкус, произведено в Швейцарии. По данным упаковки, предназначен для кожи, волос, ногтей, костей и суставов. Эффект может отличаться у разных людей.",
        },
        {
          title: "Коллаген и витамин C",
          body: "Витамин C вносит вклад в нормальное образование коллагена (для кожи, сосудов, костей, хрящей, зубов и дёсен), поэтому коллаген часто принимают вместе с витамином C. В каталоге C — шипучие таблетки Swiss Energy Vitamin C.",
        },
        {
          title: "Как принимать",
          body: "Порошок размешивают в любом напитке, вкус нейтральный, без сахара. Количество и время приёма — по инструкции на банке.",
        },
      ],
    },
    bullets: {
      uz: ["100% sof kollagen kukuni, shakarsiz", "Neytral taʼm — istalgan ichimlikka aralashadi", "Shveytsariyada ishlab chiqarilgan (Dr. Frei)", "Vitamin C bilan birga olish odatiy"],
      ru: ["100% чистый коллаген в порошке, без сахара", "Нейтральный вкус — растворяется в любом напитке", "Произведено в Швейцарии (Dr. Frei)", "Часто принимают вместе с витамином C"],
    },
    ingredientSlugs: ["collagen", "vitamin-c", "biotin"],
    productSlugs: ["swiss-energy-nature-collagen", "swiss-energy-hair-nail-skin-30", "swiss-energy-vitamin-c-20"],
    categorySlugs: ["beauty"],
    relatedSlugs: ["beauty", "joints", "hair-loss", "biotin", "vitamin-c"],
    faq: {
      uz: [
        {
          question: "Kollagenni qachon ichish kerak?",
          answer: "Swiss Energy Nature Collagen istalgan ichimlikka aralashtiriladi. Qabul vaqti va miqdori uchun bankadagi koʻrsatmaga qarang.",
        },
        {
          question: "Kukun kollagen bilan kapsulaning farqi nima?",
          answer: "Kukun ichimlikka aralashtiriladi va miqdorni moslash oson; kapsula esa yutishga qulay. Tarkibi va miqdori mahsulotga qarab farq qiladi — qadoqni solishtiring.",
        },
        {
          question: "Kollagenni vitamin C bilan birga ichish kerakmi?",
          answer: "Vitamin C normal kollagen hosil boʻlishiga hissa qoʻshadi, shuning uchun ularni koʻpincha birga olishadi. Bu majburiy emas; har bir mahsulotning koʻrsatmasiga amal qiling.",
        },
        {
          question: "Kollagenni kimlar ichmasligi kerak?",
          answer: "Tarkibdagi manbaga allergiyangiz boʻlsa yoki homilador va emizikli boʻlsangiz — avval shifokor bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          question: "Когда принимать коллаген?",
          answer: "Swiss Energy Nature Collagen размешивают в любом напитке. Время и количество приёма — по инструкции на банке.",
        },
        {
          question: "Чем порошок отличается от капсул?",
          answer: "Порошок размешивают в напитке, им удобно регулировать количество; капсулы проще проглатывать. Состав и количество зависят от продукта — сравнивайте упаковки.",
        },
        {
          question: "Нужно ли принимать коллаген вместе с витамином C?",
          answer: "Витамин C вносит вклад в нормальное образование коллагена, поэтому их часто принимают вместе. Это не обязательно; следуйте инструкции каждого продукта.",
        },
        {
          question: "Кому не стоит принимать коллаген?",
          answer: "Если есть аллергия на компоненты, а также во время беременности и кормления грудью — сначала проконсультируйтесь с врачом.",
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
          title: "Kalsiy nima uchun kerak",
          body: "Kalsiy suyaklar va tishlarning normal holatini saqlashga, mushaklarning normal ishlashiga, qonning normal ivishiga va asab impulslarining uzatilishiga hissa qoʻshadi.",
        },
        {
          title: "Kalsiy, D3 va K2",
          body: "Kalsiyning normal soʻrilishi uchun D vitamini kerak: u kalsiy va fosforning soʻrilishiga hissa qoʻshadi. K vitamini suyaklarning normal holatiga va qonning normal ivishiga hissa qoʻshadi. Shu sababli bu uch modda koʻpincha bitta majmuada boʻladi.",
        },
        {
          title: "Swiss Energy Calcivit tarkibi",
          body: "Kalsiy + D3 + K2 + sink, B vitaminlari, mis (Cu) va marganets (Mn); 30 kapsula, sekin chiqariladigan shakl. Qadoq maʼlumotiga koʻra suyak, tish va mushaklar uchun moʻljallangan. Alohida komponentlar miqdori uchun qadoqqa qarang.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "Bankadagi koʻrsatma boʻyicha. Kalsiy qoʻshimchalarini boshqa dorilar bilan birga ichishdan oldin shifokor yoki farmatsevt bilan maslahatlashing.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен кальций",
          body: "Кальций вносит вклад в поддержание нормального состояния костей и зубов, нормальную работу мышц, свёртываемость крови и передачу нервных импульсов.",
        },
        {
          title: "Кальций, D3 и K2",
          body: "Для усвоения кальция нужен витамин D: он вносит вклад в усвоение кальция и фосфора. Витамин K вносит вклад в нормальное состояние костей и свёртываемость крови. Поэтому эти три вещества часто объединяют в одном комплексе.",
        },
        {
          title: "Состав Swiss Energy Calcivit",
          body: "Кальций + D3 + K2 + цинк, витамины группы B, медь (Cu) и марганец (Mn); 30 капсул замедленного высвобождения. По данным упаковки, предназначен для костей, зубов и мышц. Количество отдельных компонентов — на упаковке.",
        },
        {
          title: "Как принимать",
          body: "По инструкции на банке. Перед приёмом кальция вместе с лекарствами проконсультируйтесь с врачом или фармацевтом.",
        },
      ],
    },
    bullets: {
      uz: ["Calcivit: kalsiy + D3 + K2 bitta majmuada", "30 kapsula, sekin chiqariladigan shakl", "Tarkibida sink, B vitaminlari, mis va marganets ham bor", "Dori bilan birga ichishdan oldin shifokor bilan maslahatlashing"],
      ru: ["Calcivit: кальций + D3 + K2 в одном комплексе", "30 капсул замедленного высвобождения", "В составе также цинк, витамины B, медь и марганец", "Перед приёмом вместе с лекарствами — консультация врача"],
    },
    ingredientSlugs: ["calcium", "vitamin-d3", "vitamin-k2"],
    productSlugs: ["swiss-energy-calcivit-30"],
    categorySlugs: ["minerals"],
    relatedSlugs: ["joints", "vitamin-d3", "vitamin-k2"],
    faq: {
      uz: [
        {
          question: "Kalsiyni D3 va K2 bilan birga ichish kerakmi?",
          answer: "D vitamini kalsiyning normal soʻrilishiga, K vitamini suyaklarning normal holatiga hissa qoʻshadi. Swiss Energy Calcivit tarkibida uchalasi birga.",
        },
        {
          question: "Kalsiyni qachon ichish kerak?",
          answer: "Calcivit uchun bankadagi koʻrsatmaga amal qiling. Kapsula sekin chiqariladigan shaklda, 30 kunlik hajm.",
        },
        {
          question: "Calcivit tarkibida nimalar bor?",
          answer: "Kalsiy, vitamin D3, vitamin K2, sink, B vitaminlari, mis va marganets. Har bir komponentning aniq miqdori qadoqda koʻrsatilgan.",
        },
      ],
      ru: [
        {
          question: "Нужно ли принимать кальций вместе с D3 и K2?",
          answer: "Витамин D вносит вклад в нормальное усвоение кальция, витамин K — в нормальное состояние костей. В Swiss Energy Calcivit все три вещества вместе.",
        },
        {
          question: "Когда принимать кальций?",
          answer: "Для Calcivit следуйте инструкции на банке. Капсулы замедленного высвобождения, объём на 30 дней.",
        },
        {
          question: "Что входит в состав Calcivit?",
          answer: "Кальций, витамин D3, витамин K2, цинк, витамины группы B, медь и марганец. Точное количество каждого компонента указано на упаковке.",
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
  ...demandVitaminTopics,
  ...audienceGoalTopics,
  ...moreTopics,
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
