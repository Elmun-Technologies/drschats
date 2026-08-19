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
      uz: "Immun tizimini mustahkamlovchi isbotlangan nutriyentlar",
      ru: "Доказанные нутриенты для укрепления иммунной системы",
    },
    intro: {
      uz: "Immun tizimi kundalik ovqatlanish, uyqu sifati va mikroelementlar balansiga tayanadi. Quyida immunitetni qo'llab-quvvatlash uchun zarur asosiy moddalar keltirilgan.",
      ru: "Иммунная система напрямую зависит от питания, качества сна и баланса микроэлементов. Ниже — ключевые нутриенты для надежной защиты организма.",
    },
    sections: {
      uz: [
        {
          title: "Immunitet qanday ishlaydi?",
          body: "Immun tizimi organizmga kiruvchi virus va bakteriyalardan himoya qiluvchi murakkab mexanizmdir. Vitamin D3, Sink va Vitamin C bu tizimning to'g'ri ishlashi uchun asosiy qurilish g'ishtlari sanaladi.",
        },
        {
          title: "Profilaktika va qabul tartibi",
          body: "Mavsumiy shamollashlar davrida yoki intensiv aqliy/jismoniy yuklamalarda profilaktik kurslar o'tkazish tavsiya etiladi. Yog'da eriydigan vitaminlar (D3) yog'li taom bilan yaxshi so'riladi.",
        },
      ],
      ru: [
        {
          title: "Как работает иммунная защита?",
          body: "Иммунитет — сложный клеточный барьер. Витамин D3, цинк и витамин C служат ключевыми элементами для созревания и активности иммунных клеток (Т- и B-лимфоцитов).",
        },
        {
          title: "Профилактический курс",
          body: "В межсезонье и периоды высоких нагрузок рекомендуется курсовой прием нутриентов. Жирорастворимый витамин D3 лучше принимать с пищей, содержащей полезные жиры.",
        },
      ],
    },
    bullets: {
      uz: [
        "Vitamin D3 — immun hujayralari faolligi",
        "Vitamin C — antioksidant himoya va fagotsitoz",
        "Sink — shilliq qavatlar butunligi va antiviral to'siq",
        "Sifatli uyqu va to'laqonli oqsil ratsioni",
      ],
      ru: [
        "Витамин D3 — регуляция иммунного ответа",
        "Витамин C — антиоксидантная защита мембран",
        "Цинк — барьерная функция слизистых оболочек",
        "Полноценный сон и достаточное количество белка",
      ],
    },
    ingredientSlugs: ["vitamin-d3", "vitamin-c", "zinc"],
    productSlugs: ["immuno-complex", "vitamin-d3-k2", "swiss-energy-vitamin-c-1000"],
    categorySlugs: ["immunity", "vitamins"],
    relatedSlugs: ["frequent-colds", "vitamin-d3", "vitamin-c", "zinc"],
    faq: {
      uz: [
        {
          question: "Immunitet uchun vitaminlarni qachon ichish kerak?",
          answer: "Profilaktika maqsadida kuz-qish mavsumida yoki holsizlik sezilganda 1–2 oylik kurs shaklida qabul qilish maqsadga muvofiq.",
        },
        {
          question: "Bolalar uchun kattalar vitaminlari to'g'ri keladimi?",
          answer: "Yo'q, bolalarda dozalar tana vazniga qarab belgilanadi. Bolalar uchun maxsus ishlab chiqilgan shakllarni tanlang.",
        },
      ],
      ru: [
        {
          question: "Как часто нужно проходить курс для иммунитета?",
          answer: "Обычно профилактический курс составляет 1–2 месяца в осенне-зимний период или при повышенных стрессовых нагрузках.",
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
      uz: "Chuqur uyqu va asab tizimi relaksatsiyasi",
      ru: "Глубокий сон и восстановление нервной системы",
    },
    intro: {
      uz: "Uyqu sifatining buzilishi stress, magniy yetishmovchiligi va asab qo'zg'aluvchanligi bilan bevosita bog'liq. To'g'ri nutriyentlar chuqur uyqu fazasini tiklashga yordam beradi.",
      ru: "Нарушения сна связаны с дефицитом магния, перегрузкой нервной системы и вечерним экраном. Нутрицевтики помогают восстановить фазу глубокого сна.",
    },
    sections: {
      uz: [
        {
          title: "Magniy va melatonin o'zaro ta'siri",
          body: "Magniy GABA (GAMK) retseptorlarini faollashtirib, miyani tinchlantiradi va tabiiy uyqu gormoni ishlab chiqarilishiga zamin yaratadi.",
        },
        {
          title: "Kechki tartib",
          body: "Magniyni yotishdan 30-60 daqiqa oldin qabul qilish mushak spazmlarini yozadi va xotirjam uyquga ketishni osonlashtiradi.",
        },
      ],
      ru: [
        {
          title: "Роль магния и ГАМК",
          body: "Магний активирует рецепторы гамма-аминомасляной кислоты (ГАМК), снижая возбудимость нейронов и способствуя плавному погружению в сон.",
        },
        {
          title: "Вечерний протокол",
          body: "Принимайте магний за 30–60 минут до сна для снятия мышечного тонуса и легкого засыпания.",
        },
      ],
    },
    bullets: {
      uz: [
        "Magniy xelat / sitrat — mushaklar bo'shashishi",
        "Vitamin B6 — asab impulslarini tartibga solish",
        "Yotishdan 1 soat oldin ekranlarni cheklash",
      ],
      ru: [
        "Хелат/цитрат магния — расслабление мускулатуры",
        "Витамин B6 — регуляция метаболизма нейромедиаторов",
        "Ограничение яркого синего света за час до сна",
      ],
    },
    ingredientSlugs: ["magnesium"],
    productSlugs: ["magnesium-b6", "swiss-energy-magnesium"],
    categorySlugs: ["sleep", "minerals"],
    relatedSlugs: ["insomnia", "stress", "magnesium"],
    faq: {
      uz: [
        {
          question: "Magniy o'rganib qolish (qaramlik) chaqiradimi?",
          answer: "Yo'q, magniy organizm uchun tabiiy mineral bo'lib, o'rganib qolish xususiyatiga ega emas.",
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
      uz: "Hujayra darajasida energiya almashinuvi va charchoqni yengish",
      ru: "Клеточная энергия, тонус и преодоление усталости",
    },
    intro: {
      uz: "Surunkali charchoq ko'pincha B guruhi vitaminlari, temir, D3 va magniy yetishmovchiligidan kelib chiqadi. To'g'ri formulalar mitoxondriyalarni quvvat bilan ta'minlaydi.",
      ru: "Упадок сил часто вызван нехваткой витаминов группы B, железа или витамина D3. Сбалансированный комплекс питает митохондрии и возвращает ресурс.",
    },
    sections: {
      uz: [
        {
          title: "Hujayra energiyasi (ATF)",
          body: "Mitoxondriyalar ATF energiyasini ishlab chiqarishi uchun B12, B6, magniy va kofermentlar kerak. Ushbu moddalar bo'lmasa organizm ovqatni energiyaga aylantirishda qiynaladi.",
        },
        {
          title: "Kunduzgi faollik",
          body: "B guruhi va multivitaminlarni ertalab nonushta paytida qabul qilish kun bo'yi barqaror energiya bilan ta'minlaydi.",
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
    productSlugs: ["multivitamin-daily", "dr-frei-active"],
    categorySlugs: ["vitamins", "energy"],
    relatedSlugs: ["fatigue", "vitamin-b12", "iron"],
    faq: {
      uz: [
        {
          question: "Natija qachon seziladi?",
          answer: "Odatda muntazam qabul boshlanganidan 7–14 kun o'tgach ertalabki tetiklik va umumiy ish qobiliyati oshishi seziladi.",
        },
      ],
      ru: [
        {
          question: "Через сколько времени ощущается эффект?",
          answer: "Обычно прилив сил и ясность ума отмечаются через 7–14 дней регулярного приема.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "beauty",
    name: { uz: "Go'zallik (Soch, Teri, Tirnoq)", ru: "Красота (Волосы, Кожа, Ногти)" },
    headline: {
      uz: "Kollagen, biotin va antioksidantlar bilan tabiiy go'zallik",
      ru: "Поддержка синтеза коллагена, эластичности кожи и густоты волос",
    },
    intro: {
      uz: "Tashqi go'zallik ichki to'qimalar oziqlanishidan boshlanadi. Dengiz kollageni, biotin, sink va vitamin C teri tarangligini va soch o'sishini ta'minlaydi.",
      ru: "Здоровье кожи, блеск волос и прочность ногтей формируются изнутри. Пептиды коллагена, биотин и цинк стимулируют обновление клеток дермы.",
    },
    sections: {
      uz: [
        {
          title: "Kollagen va Keratin sintezi",
          body: "25 yoshdan so'ng organizmda tabiiy kollagen ishlab chiqarilishi har yili 1-1.5% ga kamayadi. Dengiz kollageni peptidlari terini namlantirish va ajinlarni kamaytirishga yordam beradi.",
        },
      ],
      ru: [
        {
          title: "Синтез дермального матрикса",
          body: "После 25 лет естественная выработка коллагена снижается. Прием гидролизованных пептидов с витамином C восстанавливает упругость кожи.",
        },
      ],
    },
    bullets: {
      uz: [
        "Gidrolizlangan dengiz kollageni — elastiklik",
        "Biotin (B7) — soch tolalarini mustahkamlash",
        "Vitamin C — kollagen tolalarini bog'lash",
        "Sink — toza va sog'lom teri",
      ],
      ru: [
        "Морские пептиды коллагена — упругость кожи",
        "Высокодозный биотин — укрепление корней волос",
        "Витамин C — кофермент синтеза коллагена",
        "Цинк — себорегуляция и чистота кожи",
      ],
    },
    ingredientSlugs: ["collagen", "biotin", "vitamin-c", "zinc"],
    productSlugs: ["collagen-beauty", "swiss-energy-beauty"],
    categorySlugs: ["beauty"],
    relatedSlugs: ["hair-loss", "collagen", "biotin"],
    faq: {
      uz: [
        {
          question: "Kollagenni qanday qabul qilish kerak?",
          answer: "Ertalab och qoringa yoki ovqatdan 30 daqiqa oldin suv bilan ichish eng yaxshi so'rilishni ta'minlaydi. Kurs davomiyligi 2–3 oy.",
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
    name: { uz: "Stressdan himoya", ru: "Антистресс и нервная система" },
    headline: {
      uz: "Asab tizimini qo'llab-quvvatlash va hissiy barqarorlik",
      ru: "Баланс нейромедиаторов и устойчивость к психоэмоциональным перегрузкам",
    },
    intro: {
      uz: "Doimiy stress magniy va B guruhi vitaminlarini organizmdan tez yuvilib ketishiga olib keladi. Bularni to'ldirish hissiy barqarorlikni tiklaydi.",
      ru: "Хронический стресс ускоряет выведение магния и истощает запасы витаминов B. Восполнение дефицита возвращает эмоциональный контроль.",
    },
    sections: {
      uz: [
        {
          title: "Kortizol va magniy balansi",
          body: "Stress gormoni kortizol yuqori bo'lganda yurak urishi tezlashadi va mushaklar qisqaradi. Magniy xelati asab qo'zg'aluvchanligini me'yorga keltiradi.",
        },
      ],
      ru: [
        {
          title: "Контроль кортизола",
          body: "Магний блокирует избыточный выброс адреналина и кортизола, предотвращая вегетативные кризы и спазмы.",
        },
      ],
    },
    bullets: {
      uz: ["Magniy sitrat / xelat — tezkor tinchlantiruvchi ta'sir", "Vitamin B6 — asab impulslarini yaxshilash"],
      ru: ["Органический магний — снижение тревожности", "Витамин B6 — синтез серотонина"],
    },
    ingredientSlugs: ["magnesium", "vitamin-b12"],
    productSlugs: ["magnesium-b6"],
    categorySlugs: ["sleep", "vitamins"],
    relatedSlugs: ["stress-anxiety", "sleep", "magnesium"],
    faq: {
      uz: [
        {
          question: "Kunduzi uyqu chaqiradimi?",
          answer: "Magniy uyqu dorisi emas, u faqat asab tizimini tinchlantiradi va diqqatni jamlashga xalaqit bermaydi.",
        },
      ],
      ru: [
        {
          question: "Вызывает ли магний дневную сонливость?",
          answer: "Нет, магний снимает избыточное напряжение, не нарушая концентрации внимания.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "digestion",
    name: { uz: "Hazm qilish va ichak", ru: "Здоровое пищеварение" },
    headline: {
      uz: "Mikrobiota balansi, yengillik va to'g'ri o'zlashtirish",
      ru: "Баланс микрофлоры, комфорт и усвоение питательных веществ",
    },
    intro: {
      uz: "Oziq moddalarning so'rilishi va immunitetning 70% qismi ichak salomatligiga bog'liq. Probiotiklar va fermentlar hazmni yengillashtiradi.",
      ru: "Более 70% иммунных клеток сосредоточено в кишечнике. Пробиотические культуры восстанавливают барьер и комфорт пищеварения.",
    },
    sections: {
      uz: [
        {
          title: "Mikrobiomaning ahamiyati",
          body: "Foydali bakteriyalar B guruhi vitaminlarini sintez qiladi va ichak shilliq qavatini patogenlardan himoya qiladi.",
        },
      ],
      ru: [
        {
          title: "Здоровье микробиома",
          body: "Полезные лакто- и бифидобактерии синтезируют витамины и поддерживают местный иммунитет.",
        },
      ],
    },
    bullets: {
      uz: ["Probiotik shtammlar — mikrofloranı tiklash", "Prebiotik tolalar — foydali bakteriyalar ozuqasi"],
      ru: ["Мультиштаммовые пробиотики", "Пребиотические волокна для питания флоры"],
    },
    ingredientSlugs: ["probiotics", "zinc"],
    productSlugs: ["dr-frei-probiotic"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["digestive-bloat", "probiotics"],
    faq: {
      uz: [
        {
          question: "Antibiotik qabul qilganda qanday ichiladi?",
          answer: "Antibiotik ichilgandan 2-3 soat keyin probiotik qabul qilinadi va davolanish tugagach yana 2 hafta davom ettiriladi.",
        },
      ],
      ru: [
        {
          question: "Как принимать с антибиотиками?",
          answer: "С интервалом не менее 2–3 часов после антибиотика, продолжая прием еще 2 недели после курса.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "heart",
    name: { uz: "Yurak va qon tomirlar", ru: "Сердце и сосуды" },
    headline: {
      uz: "Qon bosimi nazorati, tomirlar elastikligi va xolesterin balansi",
      ru: "Поддержка миокарда, эластичность сосудов и липидный профиль",
    },
    intro: {
      uz: "Omega-3 yog' kislotalari, magniy va K2 vitamini qon tomirlar devorini toza va elastik saqlashda, yurak ritmini me'yorlashtirishda asosiy rol o'ynaydi.",
      ru: "Полиненасыщенные жирные кислоты Омега-3, магний и витамин K2 защищают сосуды от кальцификации и поддерживают ритм сердца.",
    },
    sections: {
      uz: [
        {
          title: "Omega-3 EPA va DHA kuchi",
          body: "EPA qon tomir yallig'lanishini pasaytiradi, DHA esa hujayra membranalarini moslashuvchan qiladi va qon quyilish xavfini kamaytiradi.",
        },
      ],
      ru: [
        {
          title: "Действие кислот EPA и DHA",
          body: "ЭПК снижает уровень триглицеридов и системное воспаление, а ДГК поддерживает эластичность эндотелия.",
        },
      ],
    },
    bullets: {
      uz: ["Omega-3 EPA/DHA — xolesterin balansi", "Magniy — qon tomir spazmini oldini olish", "Vitamin K2 — kalsiyning tomirda cho'kishiga yo'l qo'ymaslik"],
      ru: ["Омега-3 высокой концентрации", "Органический магний против сосудистого спазма", "Витамин K2 для защиты артерий"],
    },
    ingredientSlugs: ["epa-dha", "magnesium", "vitamin-k2"],
    productSlugs: ["omega-3-premium", "dr-frei-omega-3-1000", "vitamin-d3-k2"],
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
    name: { uz: "Bo'g'imlar va suyaklar", ru: "Суставы и связки" },
    headline: {
      uz: "Erkin harakat, tog'ay to'qimasi tiklanishi va suyak mustahkamligi",
      ru: "Свобода движения, восстановление хрящей и плотность костей",
    },
    intro: {
      uz: "Bo'g'imlar harakatchanligi kollagen, D3, K2 va kalsiy miqdoriga to'g'ridan-to'g'ri bog'liq. Ular birgalikda sinovial suyuqlik va tog'ay to'qimasini oziqlantiradi.",
      ru: "Здоровье опорно-двигательного аппарата требует комплексного подхода: пептиды коллагена, витамин D3+K2 и кальций питают хрящевую ткань.",
    },
    sections: {
      uz: [
        {
          title: "Bo'g'im tog'aylarini tiklash",
          body: "Kollagen peptidlari bo'g'imdagi yallig'lanishni kamaytiradi va tog'ay to'qimasi elastikligini oshiradi.",
        },
      ],
      ru: [
        {
          title: "Регенерация хрящевой ткани",
          body: "Пептиды коллагена и минералы стимулируют синтез хондроцитов и улучшают амортизацию суставов.",
        },
      ],
    },
    bullets: {
      uz: ["Kollagen peptidlari — tog'ay to'qimasi elastikligi", "Vitamin D3 + K2 — kalsiyning suyakka to'g'ri birikishi", "Kalsiy — suyak mustahkamligi"],
      ru: ["Пептиды коллагена для суставов", "Витамины D3 и K2 для минерализации костей", "Биодоступный кальций"],
    },
    ingredientSlugs: ["collagen", "vitamin-d3", "vitamin-k2", "calcium"],
    productSlugs: ["collagen-beauty", "vitamin-d3-k2", "swiss-energy-calcid"],
    categorySlugs: ["vitamins", "minerals"],
    relatedSlugs: ["joint-pain", "collagen", "calcium", "vitamin-d3"],
    faq: {
      uz: [
        {
          question: "Jismoniy mashqlar qiluvchilarga qaysi biri mos?",
          answer: "Kollagen va D3+K2 kombinatsiyasi paylar va bo'g'imlarni jarohatlardan himoya qiladi.",
        },
      ],
      ru: [
        {
          question: "Что рекомендуется при спортивных нагрузках?",
          answer: "Комбинация коллагена и витамина D3+K2 защищает связки и суставы от перегрузок и микротравм.",
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
      uz: "Omega-3 DHA, B guruhi vitaminlari va magniy miya neyronlari orasidagi signallarni tezlashtiradi, xotirani mustahkamlaydi.",
      ru: "ДГК Омега-3, витамины группы B и магний улучшают синаптическую пластичность мозга и защищают нейроны от перегрузок.",
    },
    sections: {
      uz: [
        {
          title: "Neyronlar oziqlanishi",
          body: "Miya quruq moddasining 60% qismi yog'lardan iborat. DHA kislotasi neyron membranalarining asosiy elementi hisoblanadi.",
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
      uz: ["Omega-3 DHA — kognitiv o'tkirlik", "Vitamin B12 — nerv tolalari himoyasi", "Magniy — aqliy charchoqni kamaytirish"],
      ru: ["Высокая концентрация ДГК Омега-3", "Витамин B12 для проводимости нервных волокон", "Магний для устойчивости к нагрузкам"],
    },
    ingredientSlugs: ["epa-dha", "vitamin-b12", "magnesium"],
    productSlugs: ["omega-3-premium", "dr-frei-active"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["omega-3", "vitamin-b12", "fatigue"],
    faq: {
      uz: [
        {
          question: "Imtihonlar yoki og'ir loyihalar davrida nima ichish kerak?",
          answer: "Omega-3 va B-kompleks kombinatsiyasi aqliy charchoqni yengishga yordam beradi.",
        },
      ],
      ru: [
        {
          question: "Что принимать в периоды экзаменов и дедлайнов?",
          answer: "Комплекс Омега-3 и витаминов группы B с магнием повышает концентрацию и снимает умственное истощение.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "weight",
    name: { uz: "Metabolizm va vazn nazorati", ru: "Метаболизм и контроль веса" },
    headline: {
      uz: "Moddalar almashinuvini tezlashtirish va ishtaha balansi",
      ru: "Оптимизация обмена веществ и контроль аппетита",
    },
    intro: {
      uz: "Metabolizm sekinlashishi ko'pincha D vitamini, xrom, magniy va B vitaminlari tanqisligi bilan bog'liq. Balansni tiklash sog'lom vaznga erishishni tezlashtiradi.",
      ru: "Нарушения метаболизма часто сопряжены с дефицитом витамина D и микроэлементов. Коррекция нутриентного статуса помогает нормализовать обмен веществ.",
    },
    sections: {
      uz: [
        {
          title: "Insulin sezgirligi va metabolizm",
          body: "D3 vitamini va magniy hujayralarning insulinga sezgirligini oshirib, ortiqcha shirinlikka bo'lgan ehtiyojni kamaytiradi.",
        },
      ],
      ru: [
        {
          title: "Чувствительность к инсулину",
          body: "Витамин D3 и магний участвуют в регуляции углеводного обмена, снижая тягу к простым сахарам.",
        },
      ],
    },
    bullets: {
      uz: ["Vitamin D3 — metabolik faollik", "Magniy — glyukoza utilizatsiyasi", "Probiotiklar — ichak metabolik balansi"],
      ru: ["Витамин D3 для регуляции метаболизма", "Магний для энергетического обмена", "Пробиотики для кишечной микробиоты"],
    },
    ingredientSlugs: ["vitamin-d3", "magnesium", "probiotics"],
    productSlugs: ["vitamin-d3-k2", "magnesium-b6", "dr-frei-probiotic"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-d3", "magnesium", "probiotics"],
    faq: {
      uz: [
        {
          question: "Vitaminlar vazn to'plashga olib kelmaydimi?",
          answer: "Yo'q, sifatli vitaminlar kaloriyasiz bo'lib, faqat metabolizmni me'yorga soladi.",
        },
      ],
      ru: [
        {
          question: "Могут ли витамины вызвать набор веса?",
          answer: "Нет, нутрицевтики не содержат калорий и лишь нормализуют физиологические процессы обмена веществ.",
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
      ru: "Солнечный прогормон для костей, иммунитета и долголетия",
    },
    intro: {
      uz: "Vitamin D3 (xolekalsiferol) organizmda yuzlab genlar faoliyatini boshqaradi. U kalsiy so'rilishi, immun hujayralar va yaxshi kayfiyat uchun muhimdir.",
      ru: "Витамин D3 выполняет роль прогормона, регулируя работу иммунной, костной и эндокринной систем.",
    },
    sections: {
      uz: [
        {
          title: "Nima uchun D3 tanqisligi keng tarqalgan?",
          body: "Kuyoshli mintaqalarda ham xonalarda o'tirish, quyosh kremlari va yopiq kiyimlar sababli aholining 70% dan ortig'ida D vitamini yetishmovchiligi kuzatiladi.",
        },
        {
          title: "D3 va K2 sinergiyasi",
          body: "D3 kalsiyning ichakda so'rilishini ta'minlasa, K2 vitamini kalsiyni qon tomirlariga emas, aynan suyaklarga yo'naltiradi.",
        },
      ],
      ru: [
        {
          title: "Почему возникает дефицит?",
          body: "Даже в солнечных странах пребывание в офисах и использование SPF-кремов приводит к дефициту D3 у более чем 70% людей.",
        },
        {
          title: "Синергия с K2",
          body: "Витамин D3 обеспечивает всасывание кальция, а витамин K2 направляет его в костную ткань, защищая сосуды.",
        },
      ],
    },
    bullets: {
      uz: [
        "Profilaktik doza: 2000–5000 IU",
        "Yog'li taom bilan nonushtada qabul qilinadi",
        "K2 (MK-7) bilan birga ichish eng xavfsiz va samarali",
      ],
      ru: [
        "Профилактическая дозировка: 2000–5000 ME",
        "Прием утром с жиросодержащей пищей",
        "Оптимально в паре с витамином K2 (MK-7)",
      ],
    },
    ingredientSlugs: ["vitamin-d3", "vitamin-k2"],
    productSlugs: ["vitamin-d3-k2", "swiss-energy-d3-caps"],
    categorySlugs: ["vitamins", "immunity"],
    relatedSlugs: ["immunity", "frequent-colds", "calcium"],
    faq: {
      uz: [
        {
          question: "D vitaminini yozda ham ichish kerakmi?",
          answer: "Agar kunning ko'p qismini binoda o'tkazsangiz, yozda ham minimal profilaktik doza (1000–2000 IU) tavsiya etiladi.",
        },
      ],
      ru: [
        {
          question: "Нужно ли принимать летом?",
          answer: "При работе в помещении умеренные профилактические дозировки рекомендованы круглый год.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-c",
    name: { uz: "Vitamin C", ru: "Витамин C" },
    headline: {
      uz: "Bosh antioksidant — kollagen sintezi va kuchli immunitet",
      ru: "Главный водорастворимый антиоксидант и защитник сосудов",
    },
    intro: {
      uz: "Inson organizmi vitamin C ni o'zi ishlab chiqara olmaydi. U har kuni oziq-ovqat va sifatli qo'shimchalar orqali tushishi shart.",
      ru: "Витамин C не синтезируется в организме человека и должен поступать ежедневно для защиты клеток и синтеза коллагена.",
    },
    sections: {
      uz: [
        {
          title: "Asosiy vazifalari",
          body: "Oksidlovchi stressdan himoya qiladi, qon tomirlar devorini mustahkamlaydi, kollagen tolalarini hosil qiladi va temir so'rilishini 3 baravargacha oshiradi.",
        },
      ],
      ru: [
        {
          title: "Ключевые функции",
          body: "Нейтрализует свободные радикалы, участвует в гидроксилировании пролина в коллагене и усиливает биодоступность железа.",
        },
      ],
    },
    bullets: {
      uz: ["Antioksidant va viruslarga qarshi to'siq", "Kollagen va elastiklik", "Temir so'rilishini kuchaytirish"],
      ru: ["Антиоксидантная защита", "Кофактор выработки коллагена", "Усиление всасывания железа"],
    },
    ingredientSlugs: ["vitamin-c"],
    productSlugs: ["immuno-complex", "swiss-energy-vitamin-c-1000", "dr-frei-vitamin-c"],
    categorySlugs: ["vitamins", "effervescent"],
    relatedSlugs: ["immunity", "frequent-colds", "iron"],
    faq: {
      uz: [
        {
          question: "Katta dozada vitamin C buyrakka zarar emasmi?",
          answer: "Kunlik profilaktik me'yor 500–1000 mg ni tashkil etadi. Ko'p suv ichish buyraklar salomatligini ta'minlaydi.",
        },
      ],
      ru: [
        {
          question: "Безопасны ли дозировки 1000 мг?",
          answer: "Дозировки 500–1000 мг безопасны при соблюдении питьевого режима.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "magnesium",
    name: { uz: "Magniy", ru: "Магний" },
    headline: {
      uz: "Tinch asablar, bo'shashgan mushaklar va chuqur uyqu",
      ru: "Антистресс-минерал, мышечный релаксант и поддержка сердца",
    },
    intro: {
      uz: "Magniy — organizmdagi 300 dan ortiq ferment tizimlarining kofaktori. U yetishmaganda asabiylashish, uyqusizlik va tomir tortishishlari kuzatiladi.",
      ru: "Магний контролирует передачу нервных импульсов, расслабление мышц и синтез энергии АТФ.",
    },
    sections: {
      uz: [
        {
          title: "Magniyning to'g'ri shakllari",
          body: "Magniy xelati (bisglisinat) va sitrati oshqozonga yumshoq ta'sir qiladi va ichakda 80% gacha yuqori so'riladi.",
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
      uz: ["Mushaklar spazmi va tortishishiga qarshi", "Stress va xavotirni kamaytirish", "Yurak ritmini qo'llab-quvvatlash"],
      ru: ["Снятие мышечных судорог", "Снижение тревожности и стресса", "Поддержка сердечного ритма"],
    },
    ingredientSlugs: ["magnesium"],
    productSlugs: ["magnesium-b6", "swiss-energy-magnesium"],
    categorySlugs: ["minerals", "sleep"],
    relatedSlugs: ["sleep", "stress", "insomnia"],
    faq: {
      uz: [
        {
          question: "Magniyni kunning qaysi vaqtida ichish yaxshiroq?",
          answer: "Tinchlantiruvchi va uyquni yaxshilovchi xususiyati tufayli magniyni kechki ovqatdan keyin yoki yotishdan oldin ichish maqsadga muvofiq.",
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
      uz: "Immun to'siq, toza teri va gormonlar balansi",
      ru: "Микроэлемент для иммунитета, регенерации кожи и синтеза тестостерона",
    },
    intro: {
      uz: "Sink — immun hujayralarining bo'linishi, oqsil sintezi va yaralarning tez bitishi uchun mas'ul bo'lgan muhim mineral.",
      ru: "Цинк необходим для работы ферментов антиоксидантной защиты, заживления тканей и поддержания гормонального баланса.",
    },
    sections: {
      uz: [
        {
          title: "Shamollash vaqtida sinkning roli",
          body: "Shamollashning dastlabki kunlarida sink qabul qilish viruslarning ko'payishini to'xtatib, kasallik muddatini qisqartiradi.",
        },
      ],
      ru: [
        {
          title: "Роль цинка при ОРВИ",
          body: "Ионы цинка блокируют репликацию вирусов в эпителиальных клетках носоглотки.",
        },
      ],
    },
    bullets: {
      uz: ["Immun tizimini tezkor kuchaytirish", "Akne va teri yallig'lanishlariga qarshi", "Soch o'sishini qo'llab-quvvatlash"],
      ru: ["Усиление иммунной защиты", "Противовоспалительный эффект при акне", "Стимуляция роста волос"],
    },
    ingredientSlugs: ["zinc"],
    productSlugs: ["immuno-complex", "dr-frei-zinc"],
    categorySlugs: ["minerals", "immunity"],
    relatedSlugs: ["immunity", "frequent-colds", "beauty"],
    faq: {
      uz: [
        {
          question: "Sinkni och qoringa ichsa bo'ladimi?",
          answer: "Och qoringa ichilganda ko'ngil aynishi mumkin, shuning uchun sinkni doimo to'yib ovqatlangan holda ichish kerak.",
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
      uz: "Yurak, miya faoliyati, ko'rish va tomirlar elastikligi",
      ru: "Эссенциальные полиненасыщенные жирные кислоты для сердца и мозга",
    },
    intro: {
      uz: "Tozalangan chuqur dengiz baliq yog'idan olingan Omega-3 triglitserid shaklida eng yuqori bio-mavjudlikka ega.",
      ru: "Высокоочищенные жирные кислоты EPA и DHA в форме триглицеридов защищают сосуды и питают клетки головного мозга.",
    },
    sections: {
      uz: [
        {
          title: "Triglitserid shaklining afzalligi",
          body: "Tabiiy triglitserid (TG) shaklidagi Omega-3 etil efirlarga nisbatan 70% ga yaxshiroq so'riladi va oshqozonni bezovta qilmaydi.",
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
      uz: ["Yuqori EPA/DHA konsentratsiyasi", "Yurak ritmi va qon tomirlar elastikligi", "Miya va ko'rish o'tkirligi"],
      ru: ["Высокая концентрация EPA/DHA", "Поддержка липидного профиля", "Когнитивные функции и зрение"],
    },
    ingredientSlugs: ["epa-dha"],
    productSlugs: ["omega-3-premium", "dr-frei-omega-3-1000"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["heart", "brain"],
    faq: {
      uz: [
        {
          question: "Baliq yog'i ta'mi keladimi?",
          answer: "Zamonaviy molekulyar tozalash texnologiyasi tufayli yoqimsiz baliq hidi va ta'mi butunlay yo'qotilgan.",
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
      uz: "Teri tarangligi, ajinlarga qarshi kurash va bo'g'imlar elastikligi",
      ru: "Пептиды коллагена для плотности кожи, блеска волос и гибкости суставов",
    },
    intro: {
      uz: "Gidrolizlangan kichik molekulyar dengiz kollageni organizm tomonidan darhol o'zlashtirilib, terining tabiiy karkasini tiklaydi.",
      ru: "Низкомолекулярные пептиды рыбного коллагена проникают в глубокие слои дермы, стимулируя синтез собственного фибриллярного белка.",
    },
    sections: {
      uz: [
        {
          title: "Nima uchun dengiz kollageni?",
          body: "Dengiz kollageni molekulalari qoramol kollageniga qaraganda ancha mayda bo'lib, ichakda 1.5 baravar tezroq va to'liq so'riladi.",
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
    productSlugs: ["collagen-beauty", "swiss-energy-collagen"],
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
      uz: "Qon hosil bo'lishi, asab tolalari himoyasi va charchoqqa qarshi kurash",
      ru: "Кроветворение, защита нервных волокон и преодоление слабости",
    },
    intro: {
      uz: "Metilkobalamin — B12 vitaminining faol koferment shakli. U eritrotsitlar ishlab chiqarilishi va energiya almashinuvi uchun zarur.",
      ru: "Метилкобаламин — биоактивная форма B12, необходимая для синтеза гемоглобина и правильного функционирования нейронов.",
    },
    sections: {
      uz: [
        {
          title: "B12 tanqisligi xavfi",
          body: "B12 yetishmovchiligi kamqonlik (anemiya), xotira pasayishi, qo'l-oyoqlarning uvishishi va doimiy holsizlikka sabab bo'ladi.",
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
      uz: ["Biofaol metilkobalamin shakli", "Gemoglobin va qon tarkibini yaxshilash", "Asab tizimini himoya qilish"],
      ru: ["Биоактивная коферментная форма", "Поддержка уровня гемоглобина", "Защита миелиновых оболочек нервов"],
    },
    ingredientSlugs: ["vitamin-b12"],
    productSlugs: ["multivitamin-daily", "dr-frei-active"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["fatigue", "energy", "iron"],
    faq: {
      uz: [
        {
          question: "Vegetarianlarga B12 shartmi?",
          answer: "Ha, B12 asosan hayvon mahsulotlarida bo'lgani sababli, go'sht kam iste'mol qiluvchilarga B12 qabul qilish majburiydir.",
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
      uz: "Gemoglobin va ferritin darajasini oshirish, to'qimalarga kislorod",
      ru: "Восстановление ферритина и гемоглобина без раздражения желудка",
    },
    intro: {
      uz: "Temir bisglisinat xelati oshqozonda noqulaylik chaqirmaydigan eng xavfsiz va tez o'zlashtiriladigan temir shaklidir.",
      ru: "Бисглицинат железа обладает высочайшей биодоступностью и не вызывает тошноты или запоров со стороны ЖКТ.",
    },
    sections: {
      uz: [
        {
          title: "Temir tanqisligi anemiyasi",
          body: "Ferritin past bo'lganda to'qimalar kislorod ochligiga uchraydi: bosh aylanishi, soch to'kilishi va kuchsizlik yuzaga keladi.",
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
      uz: ["Oshqozonni bezovta qilmaydigan bisglisinat shakli", "Vitamin C bilan birga yuqori so'rilish", "Kislorod tashilishi va tetiklik"],
      ru: ["Хелатная форма без побочных эффектов", "Максимальное усвоение с витамином C", "Устранение гипоксии и слабости"],
    },
    ingredientSlugs: ["iron", "vitamin-c"],
    productSlugs: ["multivitamin-daily"],
    categorySlugs: ["minerals", "vitamins"],
    relatedSlugs: ["fatigue", "energy", "hair-loss"],
    faq: {
      uz: [
        {
          question: "Temirni nimalar bilan ichish mumkin emas?",
          answer: "Choy, kofe va sut mahsulotlari temir so'rilishini to'sadi. Ularni 2 soat oraliq bilan iste'mol qiling.",
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
      uz: "Mustahkam suyaklar, sog'lom tishlar va mushaklar kuchi",
      ru: "Минеральная плотность костей, здоровье зубов и проводимость мышц",
    },
    intro: {
      uz: "Kalsiy suyak skeletining asosiy tayanchi. Uning to'g'ri o'zlashtirilishi uchun D3 va K2 vitaminlari kofaktor sifatida talab qilinadi.",
      ru: "Кальций необходим для минерализации костей, свертывания крови и передачи нервных импульсов.",
    },
    sections: {
      uz: [
        {
          title: "Kalsiy sitratining afzalligi",
          body: "Kalsiy sitrati oshqozon kislotaliligi past bo'lganda ham to'liq so'riladi va buyraklarda tosh hosil qilish xavfi eng kamdir.",
        },
      ],
      ru: [
        {
          title: "Форма цитрата",
          body: "Цитрат кальция усваивается независимо от кислотности желудочного сока и безопасен для почек.",
        },
      ],
    },
    bullets: {
      uz: ["Suyak sinishi va osteoporoz profilaktikasi", "D3 va K2 bilan to'g'ri birikish", "Tish emali mustahkamligi"],
      ru: ["Профилактика остеопении и остеопороза", "Синергия с D3 и K2", "Крепость зубной эмали"],
    },
    ingredientSlugs: ["calcium", "vitamin-d3", "vitamin-k2"],
    productSlugs: ["swiss-energy-calcid", "vitamin-d3-k2"],
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
      uz: "Mikroorganizmlarning foydali shtammlari ichak devorlarini himoya qiladi va yallig'lanishni kamaytiradi.",
      ru: "Комплекс лакто- и бифидобактерий восстанавливает микробиом после стрессов, неправильного питания и антибиотикотерапии.",
    },
    sections: {
      uz: [
        {
          title: "Shtammlar xilma-xilligi",
          body: "Lactobacillus va Bifidobacterium birgalikda ichakning barcha bo'limlarida sog'lom muhitni ta'minlaydi.",
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
      uz: ["Milliardlab jonli probiotik bakteriyalar", "Qorin dam bo'lishini bartaraf etish", "Hazm va immunitet balansi"],
      ru: ["Миллиарды КОЕ живых бактерий", "Устранение вздутия и дискомфорта", "Поддержка иммунитета"],
    },
    ingredientSlugs: ["probiotics"],
    productSlugs: ["dr-frei-probiotic"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["digestion", "digestive-bloat", "immunity"],
    faq: {
      uz: [
        {
          question: "Probiotiklarni muzlatgichda saqlash kerakmi?",
          answer: "Zamonaviy mikrokapsulalangan shtammlar xona haroratida o'z faolligini to'liq saqlab qoladi.",
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
      uz: "Ertalabdan quvvatsizlik sabablari va energiyani tiklash yo'llari",
      ru: "Причины нехватки сил и пошаговый план восстановления энергии",
    },
    intro: {
      uz: "Doimiy charchoq — organizmning signalidir. Uning ortida temir tanqisligi (anemiya), B12, D3 yoki magniy yetishmovchiligi turishi mumkin.",
      ru: "Хроническая усталость — сигнал дефицита нутриентов: ферритина, витаминов группы B, D3 или магния.",
    },
    sections: {
      uz: [
        {
          title: "Keng tarqalgan sabablar",
          body: "Kam uyqu, surunkali stress, temir va B12 yetishmovchiligi, qalqonsimon bez gipofunksiyasi. Nutriyentlar balansini tiklash energiya almashinuvini jonlantiradi.",
        },
      ],
      ru: [
        {
          title: "Основные факторы истощения",
          body: "Дефицит ферритина, недостаток витамина B12, хронический недосып и гипотиреоз — главные причины отсутствия бодрости.",
        },
      ],
    },
    bullets: {
      uz: ["Temir va ferritin darajasini tekshirish", "Vitamin D3 va B12 qabul qilish", "Magniy bilan uyquni tiklash"],
      ru: ["Проверка ферритина и гемоглобина", "Восполнение D3 и B-комплекса", "Нормализация сна с магнием"],
    },
    ingredientSlugs: ["iron", "vitamin-b12", "magnesium", "vitamin-d3"],
    productSlugs: ["multivitamin-daily", "magnesium-b6", "dr-frei-active"],
    categorySlugs: ["vitamins", "energy"],
    relatedSlugs: ["energy", "vitamin-b12", "iron"],
    faq: {
      uz: [
        {
          question: "Charchoq qachon o'tib ketadi?",
          answer: "To'g'ri tanlangan vitaminlar va temir qabul qilinganda dastlabki 2 haftada kuch-quvvat tiklanishi boshlanadi.",
        },
      ],
      ru: [
        {
          question: "Как быстро проходит слабость?",
          answer: "При коррекции ключевых дефицитов улучшение наступает в течение 10–14 дней.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "hair-loss",
    name: { uz: "Soch to'kilishi va sinishi", ru: "Выпадение и ломкость волос" },
    headline: {
      uz: "Soch ildizlarini oziqlantirish, zichlik va o'sishni rag'batlantirish",
      ru: "Укрепление волосяных фолликулов, густота и блеск",
    },
    intro: {
      uz: "Soch to'kilishi ko'pincha temir tanqisligi, biotin, sink va oqsil (kollagen) yetishmovchiligidan kelib chiqadi.",
      ru: "Выпадение волос часто спровоцировано дефицитом железа (ферритина), цинка, биотина и пептидов коллагена.",
    },
    sections: {
      uz: [
        {
          title: "Soch follikulasi nima bilan oziqlanadi?",
          body: "Soch 90% keratin oqsilidan iborat. Biotin, sink va aminokislotalar soch ildizini mustahkamlaydi va yangi sochlar o'sishini faollashtiradi.",
        },
      ],
      ru: [
        {
          title: "Питание фолликула",
          body: "Биотин и цинк участвуют в синтезе кератина, а коллаген улучшает микроциркуляцию в коже головы.",
        },
      ],
    },
    bullets: {
      uz: ["Biotin va kollagen — soch karkasini mustahkamlash", "Sink — bosh terisi yog'lanishini nazorat qilish", "Temir va ferritin darajasini to'ldirish"],
      ru: ["Биотин и коллаген для кератина", "Цинк для здоровья кожи головы", "Восполнение уровня железа"],
    },
    ingredientSlugs: ["biotin", "collagen", "zinc", "iron"],
    productSlugs: ["collagen-beauty", "swiss-energy-beauty"],
    categorySlugs: ["beauty"],
    relatedSlugs: ["beauty", "collagen", "biotin"],
    faq: {
      uz: [
        {
          question: "Natija qachon ko'rinadi?",
          answer: "Sochning o'sish sikli sababli yangi sochlar paydo bo'lishi va to'kilish to'xtashi 1–2 oylik kursdan keyin yaqqol seziladi.",
        },
      ],
      ru: [
        {
          question: "Когда ждать уменьшения выпадения?",
          answer: "Учитывая цикл роста волос, видимый эффект наступает через 4–8 недель регулярного приема.",
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
      uz: "Kechqurun uxlashga qiynalish va tez-tez uyg'onish asab tizimida magniy va B vitaminlari yetishmovchiligidan darak beradi.",
      ru: "Трудности с засыпанием и ночные пробуждения указывают на истощение запасов магния и повышенную возбудимость нервной системы.",
    },
    sections: {
      uz: [
        {
          title: "Asab impulslarini tartibga solish",
          body: "Magniy mushaklar tonusini pasaytiradi, miyani kundalik axborot yuklamasidan tinchlantiradi.",
        },
      ],
      ru: [
        {
          title: "Восстановление фаз сна",
          body: "Хелат магния мягко тормозит нервную передачу, подготавливая организм к естественному засыпанию.",
        },
      ],
    },
    bullets: {
      uz: ["Magniy xelat / B6 — kechki relaksatsiya", "Kechqurun kofein va spirtli ichimliklarni cheklash", "Xonani salqin va qorong'u saqlash"],
      ru: ["Органический магний B6 за 40 минут до сна", "Ограничение кофеина во второй половине дня", "Проветривание спальни"],
    },
    ingredientSlugs: ["magnesium", "vitamin-b12"],
    productSlugs: ["magnesium-b6", "swiss-energy-magnesium"],
    categorySlugs: ["sleep", "minerals"],
    relatedSlugs: ["sleep", "stress", "magnesium"],
    faq: {
      uz: [
        {
          question: "Uyqu dorilariga qaraganda magniyning farqi nima?",
          answer: "Magniy sun'iy sedativ emas, u tabiiy minerallarni to'ldirib, tabiiy uyqu ritmini qaytaradi.",
        },
      ],
      ru: [
        {
          question: "В чем отличие от снотворных?",
          answer: "Магний не угнетает ЦНС искусственно, а физиологически нормализует естественные биоритмы.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "frequent-colds",
    name: { uz: "Tez-tez shamollash", ru: "Частые простуды и слабый иммунитет" },
    headline: {
      uz: "Tizimli immunitetni kuchaytirish va viruslarga qarshi to'siq",
      ru: "Активация противовирусной защиты и укрепление барьеров",
    },
    intro: {
      uz: "Yiliga 3-4 martadan ko'p shamollash immun tizimi resurslari tugaganini bildiradi. D3, Sink va C vitamini himoyani qayta tiklaydi.",
      ru: "Частые ОРВИ свидетельствуют о снижении местного и системного иммунитета. Протокол D3 + Цинк + Витамин C восстанавливает защиту.",
    },
    sections: {
      uz: [
        {
          title: "Antiviral himoya zanjiri",
          body: "Sink viruslarning ko'payishiga to'sqinlik qiladi, D3 makrofaglarni faollashtiradi, C vitamini esa erkin radikallarni neytrallaydi.",
        },
      ],
      ru: [
        {
          title: "Иммунный протокол",
          body: "Комплекс цинка, витамина C и D3 повышает синтез интерферонов и защищает слизистые оболочки дыхательных путей.",
        },
      ],
    },
    bullets: {
      uz: ["Vitamin D3 5000 IU kurs", "Sink pikolinat 25-50 mg", "Vitamin C 1000 mg"],
      ru: ["Курсовой витамин D3", "Хелатный цинк", "Высокодозный витамин C"],
    },
    ingredientSlugs: ["vitamin-d3", "zinc", "vitamin-c"],
    productSlugs: ["immuno-complex", "vitamin-d3-k2", "swiss-energy-vitamin-c-1000"],
    categorySlugs: ["immunity", "vitamins"],
    relatedSlugs: ["immunity", "vitamin-d3", "zinc"],
    faq: {
      uz: [
        {
          question: "Shamollash boshlanganda nima qilish kerak?",
          answer: "Dastlabki 3 kunda Sink va Vitamin C ni qabul qilish kasallikni yengil o'tishiga yordam beradi.",
        },
      ],
      ru: [
        {
          question: "Что принимать при первых признаках простуды?",
          answer: "Прием цинка и витамина C в первые 48 часов значительно снижает продолжительность симптомов.",
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
      ru: "Снижение тревожности, внутреннее спокойствие и стрессоустойчивость",
    },
    intro: {
      uz: "Ichki bezovtalik va stress magniy va B guruhi vitaminlari zaxirasini kamaytiradi. Ularni to'ldirish asab tizimini barqarorlashtiradi.",
      ru: "Повышенная раздражительность часто связана с гипервозбудимостью нейронов из-за дефицита магния.",
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
      ru: ["Хелат магния с витамином B6", "Эмоциональный баланс", "Защита сердца от стресса"],
    },
    ingredientSlugs: ["magnesium", "vitamin-b12"],
    productSlugs: ["magnesium-b6"],
    categorySlugs: ["sleep", "minerals"],
    relatedSlugs: ["stress", "sleep", "insomnia"],
    faq: {
      uz: [
        {
          question: "Magniy qancha vaqt ichiladi?",
          answer: "Stressli vaziyatlarda 1–2 oylik kurs tavsiya etiladi.",
        },
      ],
      ru: [
        {
          question: "Сколько длится курс?",
          answer: "Рекомендуемый курс антистресс-терапии магнием — от 1 до 2 месяцев.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "digestive-bloat",
    name: { uz: "Qorin dam bo'lishi va og'irlik", ru: "Вздутие и тяжесть в животе" },
    headline: {
      uz: "Yengil hazm, to'g'ri mikroflora va qorin damini bartaraf etish",
      ru: "Устранение метеоризма, комфортное пищеварение и легкость",
    },
    intro: {
      uz: "Qorindagi noqulaylik va gazlar ichakda foydali bakteriyalar kamayganidan va fermentlar yetishmasligidan yuzaga keladi.",
      ru: "Вздутие живота и ощущение тяжести после еды — признаки дисбиоза и замедленного пищеварения.",
    },
    sections: {
      uz: [
        {
          title: "Mikroflorani qayta tiklash",
          body: "Probiotik shtammlar patogen bakteriyalarni siqib chiqarib, ovqatning to'liq parchalanishini ta'minlaydi.",
        },
      ],
      ru: [
        {
          title: "Нормализация флоры",
          body: "Живые культуры лакто- и бифидобактерий уменьшают бродильные процессы в кишечнике.",
        },
      ],
    },
    bullets: {
      uz: ["Jonli probiotiklar kursi", "Yetarli miqdorda iliq suv ichish", "Shirinlik va oq unni cheklash"],
      ru: ["Курс мультипробиотика", "Достаточный питьевой режим", "Снижение доли рафинированных сахаров"],
    },
    ingredientSlugs: ["probiotics", "zinc"],
    productSlugs: ["dr-frei-probiotic"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["digestion", "probiotics"],
    faq: {
      uz: [
        {
          question: "Probiotik qachon ta'sir qiladi?",
          answer: "Dastlabki 3–5 kunda hazm yengillashishi va dam bo'lish kamayishi seziladi.",
        },
      ],
      ru: [
        {
          question: "Как быстро наступает облегчение?",
          answer: "Снижение вздутия и нормализация стула обычно отмечаются на 3–5 день приема.",
        },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "joint-pain",
    name: { uz: "Bo'g'imlarda og'riq va qisirlash", ru: "Дискомфорт и хруст в суставах" },
    headline: {
      uz: "Tog'ay to'qimasini oziqlantirish, moylash va harakat yengilligi",
      ru: "Питание хряща, выработка суставной жидкости и легкость движений",
    },
    intro: {
      uz: "Bo'g'imlardagi qisirlash va noqulaylik sinovial suyuqlik kamayishi va kollagen tolalari eskirishi bilan bog'liq.",
      ru: "Дискомфорт при ходьбе и хруст в коленях вызваны истончением суставного хряща и дефицитом коллагена.",
    },
    sections: {
      uz: [
        {
          title: "Bo'g'imlar uchun nutriyentlar",
          body: "Gidrolizlangan kollagen, D3, K2 va kalsiy birgalikda bo'g'im tog'aylarini tiklashda kuchli sinergiya beradi.",
        },
      ],
      ru: [
        {
          title: "Хондропротективное действие",
          body: "Коллаген в сочетании с кальцием и витамином D3 восстанавливает матрикс суставов и снижает воспаление.",
        },
      ],
    },
    bullets: {
      uz: ["Dengiz kollageni peptidlari", "Vitamin D3 + K2 kalsiy bilan", "Doimiy yumshoq jismoniy faollik"],
      ru: ["Пептиды коллагена для хрящей", "Витамины D3 и K2 с кальцием", "Умеренная двигательная активность"],
    },
    ingredientSlugs: ["collagen", "vitamin-d3", "vitamin-k2", "calcium"],
    productSlugs: ["collagen-beauty", "vitamin-d3-k2", "swiss-energy-calcid"],
    categorySlugs: ["vitamins", "minerals"],
    relatedSlugs: ["joints", "collagen", "calcium"],
    faq: {
      uz: [
        {
          question: "Kollagen bo'g'imlarga qanchada yordam beradi?",
          answer: "Bo'g'im tog'aylarining yangilanishi sekin kechadi, shuning uchun minimal kurs 2–3 oyni tashkil etadi.",
        },
      ],
      ru: [
        {
          question: "Сколько длится курс для суставов?",
          answer: "Восстановление хрящевой ткани требует курсового приема от 2 до 3 месяцев.",
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
