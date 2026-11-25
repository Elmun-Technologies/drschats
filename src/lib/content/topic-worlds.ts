import type { Locale } from "@/lib/i18n/routing";
import type { HealthTopicKind } from "./health-topics";

/*
  An audience page with its own look instead of the shared topic template:
  its own accent, hero, a "day" timeline and a ready set to buy in one tap.
  The rest of the page (products, article, FAQ) stays the shared template.
  Copy follows the same rules as topic copy — supplement wording only, facts
  from the pack — and is checked by `topic-worlds.test.ts`.
*/

export type WorldAccent = "sport" | "kids" | "women" | "men" | "seniors";

/** `dark`: ink panel, white text. `light`: the accent's pale tint, ink text. */
export type WorldHeroStyle = "dark" | "light";

/** How the steps are laid out: photo cards, a path of round stops, or one wide row each. */
export type WorldLayout = "cards" | "path" | "list";

type L = Record<Locale, string>;

interface RawWorldStep {
  time: L;
  title: L;
  body: L;
  /** Bank photo (`public/images/bank/<file>.webp`) — every step has one. */
  image: string;
  imageAlt: L;
  productSlug?: string;
  /** A deeper page for this step (route without locale). */
  href?: string;
}

interface RawTopicWorld {
  accent: WorldAccent;
  heroStyle: WorldHeroStyle;
  layout?: WorldLayout;
  /** Larger body text (older readers). */
  large?: boolean;
  eyebrow: L;
  hero: { file: string; alt: L; position?: string };
  /** A second, round photo laid over the hero. */
  inset: { file: string; alt: L };
  /** Products floating on the hero as stickers, by slug. */
  stickers: string[];
  stats: { value: L; label: L }[];
  dayTitle: L;
  dayIntro: L;
  steps: RawWorldStep[];
  bundle?: { title: L; text: L; cta: L; total: L; slugs: string[] };
  ctaBundle?: L;
  ctaDay: L;
}

const MORE: L = { uz: "Batafsil", ru: "Подробнее" };
const SET_CTA: L = { uz: "Toʻplamni savatga qoʻshish", ru: "Добавить набор в корзину" };
const SET_TOTAL: L = { uz: "Toʻplam narxi", ru: "Цена набора" };

const WORLDS: Partial<Record<`${HealthTopicKind}/${string}`, RawTopicWorld>> = {
  "goal/sport": {
    accent: "sport",
    heroStyle: "dark",
    eyebrow: { uz: "Sport · mashgʻulot kuni", ru: "Спорт · день тренировки" },
    hero: {
      file: "woman-dumbbells-gym",
      alt: { uz: "Ayol sport zalida gantel bilan mashq qilmoqda", ru: "Женщина тренируется с гантелью в зале" },
      position: "50% 30%",
    },
    inset: { file: "man-stretching-park", alt: { uz: "Erkak parkdagi yoʻlakda mashqdan oldin choʻzilmoqda", ru: "Мужчина разминается на дорожке в парке" } },
    stickers: ["dr-frei-antistress-magniy-20", "swiss-energy-vitamin-c-20"],
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
        image: "food-magnesium-3",
        imageAlt: { uz: "Yongʻoq, banan, avokado va ismaloq — magniyli mahsulotlar", ru: "Орехи, банан, авокадо и шпинат — продукты с магнием" },
      },
      {
        time: { uz: "Tun", ru: "Ночь" },
        title: { uz: "Uyqu", ru: "Сон" },
        body: {
          uz: "Mashgʻulot kunining oxirgi qismi. Yaxshi uyqusiz eng yaxshi rejaning ham foydasi kam.",
          ru: "Последняя часть тренировочного дня. Без хорошего сна даже лучший план мало что даст.",
        },
        image: "woman-sleeping",
        imageAlt: { uz: "Ayol kechqurun yorugʻi oʻchgan xonada uxlamoqda", ru: "Женщина спит в спальне вечером" },
      },
    ],
    bundle: {
      title: { uz: "Sportchi toʻplami", ru: "Набор спортсмена" },
      text: {
        uz: "Magniy, vitamin C va multivitamin — mashgʻulot kunining uchta qoʻshimchasi bitta tugmada. Bir nechtasini birga ichsangiz, vitamin C qoʻshilib ketishini hisobga oling.",
        ru: "Магний, витамин C и мультивитамин — три добавки тренировочного дня одной кнопкой. Если пьёте их вместе, учитывайте, что витамин C суммируется.",
      },
      cta: SET_CTA,
      total: SET_TOTAL,
      slugs: ["dr-frei-antistress-magniy-20", "swiss-energy-vitamin-c-20", "dr-frei-multivitamins-biotin-20"],
    },
    ctaBundle: { uz: "Sportchi toʻplami", ru: "Набор спортсмена" },
    ctaDay: { uz: "Mashgʻulot kuni", ru: "День тренировки" },
  },
  "goal/kids": {
    accent: "kids",
    heroStyle: "light",
    layout: "path",
    eyebrow: { uz: "Bolalar · yoshga qarab", ru: "Дети · по возрасту" },
    hero: {
      file: "father-son-football",
      alt: { uz: "Ota va oʻgʻil bogʻda futbol oʻynamoqda", ru: "Папа и сын играют в футбол в парке" },
    },
    inset: { file: "kid-winter-running", alt: { uz: "Bola qishda qorli bogʻda yugurib kelmoqda", ru: "Мальчик бежит по зимнему парку" } },
    stickers: ["dr-frei-kids-multivitamins-20"],
    stats: [
      { value: { uz: "7+", ru: "7+" }, label: { uz: "yoshdan — Dr. Frei Kids multivitamini", ru: "лет — мультивитамин Dr. Frei Kids" } },
      { value: { uz: "12", ru: "12" }, label: { uz: "vitamin va kalsiy bitta shipuchi tabletkada", ru: "витаминов и кальций в одной шипучей таблетке" } },
      { value: { uz: "200 mg", ru: "200 мг" }, label: { uz: "kalsiy bir tabletkada", ru: "кальция в одной таблетке" } },
    ],
    dayTitle: { uz: "Yoshga qarab yoʻl", ru: "Путь по возрасту" },
    dayIntro: {
      uz: "Bolaning yoshini toping — har bosqich uchun oʻz sahifasi va mahsuloti.",
      ru: "Найдите возраст ребёнка — у каждого этапа своя страница и свой продукт.",
    },
    steps: [
      {
        time: { uz: "0–3 yosh", ru: "0–3 года" },
        title: { uz: "Chaqaloq va kichkintoy", ru: "Малыш" },
        body: {
          uz: "Oʻsish kuzatuvi, ovqatlanish va uy aptechkasi — alohida boʻlimda.",
          ru: "Наблюдение за ростом, питание и домашняя аптечка — в отдельном разделе.",
        },
        image: "toddler-first-steps",
        imageAlt: { uz: "Kichkintoy uyda ilk qadamlarini qoʻymoqda", ru: "Малыш делает первые шаги дома" },
        href: "/care/baby",
      },
      {
        time: { uz: "3–7 yosh", ru: "3–7 лет" },
        title: { uz: "Bogʻcha yoshi", ru: "Дошкольники" },
        body: {
          uz: "Bu yosh uchun vitamin (tomchi, sirop) katalogda hozircha yoʻq. Qoʻshimcha haqida pediatr bilan maslahatlashing.",
          ru: "Витаминов для этого возраста (капли, сиропы) в каталоге пока нет. О добавках посоветуйтесь с педиатром.",
        },
        image: "kids-fruit-snack",
        imageAlt: { uz: "Bolalar stol atrofida meva yemoqda", ru: "Дети едят фрукты за столом" },
      },
      {
        time: { uz: "7+ yosh", ru: "7+ лет" },
        title: { uz: "Shipuchi multivitamin", ru: "Шипучий мультивитамин" },
        body: {
          uz: "1 tabletkani 200 ml suvda eriting, kuniga 1 marta ovqatdan keyin — mevali ichimlik boʻladi.",
          ru: "1 таблетку растворить в 200 мл воды, 1 раз в день после еды — получается фруктовый напиток.",
        },
        image: "child-milk",
        imageAlt: { uz: "Qizcha stakandan ichimlik ichmoqda", ru: "Девочка пьёт из стакана" },
        productSlug: "dr-frei-kids-multivitamins-20",
      },
      {
        time: { uz: "Maktab", ru: "Школа" },
        title: { uz: "Maktab kuni", ru: "Школьный день" },
        body: {
          uz: "Nonushta, suv, harakat va uyqu — maktab oʻquvchilari uchun alohida sahifa.",
          ru: "Завтрак, вода, движение и сон — отдельная страница для школьников.",
        },
        image: "kids-school-snow",
        imageAlt: { uz: "Ryukzakli maktab oʻquvchilari qishda koʻchada", ru: "Школьники с рюкзаками на зимней улице" },
        href: "/goals/school-kids",
      },
      {
        time: { uz: "Uyda", ru: "Дома" },
        title: { uz: "Uy aptechkasi", ru: "Домашняя аптечка" },
        body: {
          uz: "Termometr va bola uchun kerakli narsalar roʻyxati.",
          ru: "Термометр и список нужного для ребёнка.",
        },
        href: "/goals/baby-first-aid",
        image: "mother-daughter-handwash",
        imageAlt: { uz: "Ona va qizi qoʻllarini yuvmoqda", ru: "Мама и дочка моют руки" },
      },
    ],
    ctaDay: { uz: "Yoshni tanlash", ru: "Выбрать возраст" },
  },
  "goal/women": {
    accent: "women",
    heroStyle: "light",
    eyebrow: { uz: "Ayollar · hayot bosqichlari", ru: "Женщины · этапы жизни" },
    hero: {
      file: "pilates-women",
      alt: { uz: "Ayollar zalda pilates bilan shugʻullanmoqda", ru: "Женщины занимаются пилатесом в зале" },
    },
    inset: { file: "woman-cycling", alt: { uz: "Ayol shahar yoʻlagida velosipedda tabassum qilmoqda", ru: "Женщина с улыбкой едет на велосипеде по городу" } },
    stickers: ["swiss-energy-hair-nail-skin-30", "swiss-energy-nature-collagen"],
    stats: [
      { value: { uz: "150 mkg", ru: "150 мкг" }, label: { uz: "biotin + 10 mg sink — Hair Nail & Skin", ru: "биотина + 10 мг цинка — Hair Nail & Skin" } },
      { value: { uz: "D3 + K2", ru: "D3 + K2" }, label: { uz: "kalsiy bilan bitta kapsulada — Calcivit", ru: "с кальцием в одной капсуле — Calcivit" } },
      { value: { uz: "100%", ru: "100%" }, label: { uz: "sof kollagen kukuni, shakarsiz", ru: "чистый порошок коллагена, без сахара" } },
    ],
    dayTitle: { uz: "Hayot bosqichlari", ru: "Этапы жизни" },
    dayIntro: {
      uz: "Ehtiyoj yosh va holatga qarab oʻzgaradi. Oʻz bosqichingizni toping.",
      ru: "Потребности меняются с возрастом и состоянием. Найдите свой этап.",
    },
    steps: [
      {
        time: { uz: "Har kuni", ru: "Каждый день" },
        title: { uz: "Kundalik quvvat", ru: "Энергия на каждый день" },
        body: {
          uz: "Ratsion bir xil boʻlsa — multivitamin: A, B guruhi, C, D3, E, 14 yoshdan, shipuchi tabletka.",
          ru: "При однообразном рационе — мультивитамин: A, группа B, C, D3, E, с 14 лет, шипучая таблетка.",
        },
        image: "woman-glass-water",
        imageAlt: { uz: "Ayol uyda stakandan suv ichmoqda", ru: "Женщина пьёт воду из стакана дома" },
        productSlug: "dr-frei-multivitamins-biotin-20",
      },
      {
        time: { uz: "Goʻzallik", ru: "Красота" },
        title: { uz: "Soch, teri, tirnoq", ru: "Волосы, кожа, ногти" },
        body: {
          uz: "Biotin va sink soch, teri va tirnoqlarning normal holatini saqlashga hissa qoʻshadi. Kuniga 1 kapsula ovqat bilan.",
          ru: "Биотин и цинк вносят вклад в поддержание нормального состояния волос, кожи и ногтей. 1 капсула в день во время еды.",
        },
        image: "skin-care-woman",
        imageAlt: { uz: "Ayol yelkasiga krem surtmoqda", ru: "Женщина наносит крем на плечо" },
        productSlug: "swiss-energy-hair-nail-skin-30",
      },
      {
        time: { uz: "Rejalashtirish", ru: "Планирование" },
        title: { uz: "Homiladorlikka tayyorgarlik", ru: "Подготовка к беременности" },
        body: {
          uz: "Foliy kislotasi, tahlillar va shifokor bilan reja — alohida sahifada.",
          ru: "Фолиевая кислота, анализы и план с врачом — на отдельной странице.",
        },
        image: "woman-milk-morning",
        imageAlt: { uz: "Ayol ertalab deraza yonida sut ichmoqda", ru: "Женщина утром пьёт молоко у окна" },
        href: "/goals/pregnancy-planning",
      },
      {
        time: { uz: "40+", ru: "40+" },
        title: { uz: "Suyaklar", ru: "Кости" },
        body: {
          uz: "Kalsiy va vitamin D normal suyaklarni saqlashga hissa qoʻshadi. Calcivit — kalsiy, D3, K2, sink va B vitaminlari.",
          ru: "Кальций и витамин D вносят вклад в поддержание нормальных костей. Calcivit — кальций, D3, K2, цинк и витамины B.",
        },
        image: "woman-garden-stairs",
        imageAlt: { uz: "Ayol bogʻdagi tosh zinadan tushmoqda", ru: "Женщина спускается по каменной лестнице в саду" },
        productSlug: "swiss-energy-calcivit-30",
      },
      {
        time: { uz: "Menopauza", ru: "Менопауза" },
        title: { uz: "Yangi bosqich", ru: "Новый этап" },
        body: {
          uz: "Oʻzgarishlar, ovqatlanish va shifokor bilan suhbat — alohida sahifada.",
          ru: "Изменения, питание и разговор с врачом — на отдельной странице.",
        },
        href: "/goals/menopause",
        image: "woman-window-pensive",
        imageAlt: { uz: "Ayol deraza oldida oʻylanib turibdi", ru: "Женщина задумчиво стоит у окна" },
      },
    ],
    bundle: {
      title: { uz: "Goʻzallik toʻplami", ru: "Набор красоты" },
      text: {
        uz: "Hair Nail & Skin kapsulasi va sof kollagen kukuni — kundalik parvarish uchun ikkita mahsulot.",
        ru: "Капсулы Hair Nail & Skin и чистый порошок коллагена — два продукта для ежедневного ухода.",
      },
      cta: SET_CTA,
      total: SET_TOTAL,
      slugs: ["swiss-energy-hair-nail-skin-30", "swiss-energy-nature-collagen"],
    },
    ctaBundle: { uz: "Goʻzallik toʻplami", ru: "Набор красоты" },
    ctaDay: { uz: "Oʻz bosqichingiz", ru: "Ваш этап" },
  },
  "goal/men": {
    accent: "men",
    heroStyle: "dark",
    eyebrow: { uz: "Erkaklar · kun ritmi", ru: "Мужчины · ритм дня" },
    hero: {
      file: "man-drinking-water",
      alt: { uz: "Erkak oshxonada stakandan suv ichib tabassum qilmoqda", ru: "Мужчина с улыбкой пьёт воду на кухне" },
      position: "60% 40%",
    },
    inset: { file: "protein-shake-man", alt: { uz: "Erkak oshxonada mashqdan keyin ichimlik ichmoqda", ru: "Мужчина пьёт напиток на кухне после тренировки" } },
    stickers: ["swiss-energy-potenton-30", "swiss-energy-immunovit-30"],
    stats: [
      { value: { uz: "10 mg", ru: "10 мг" }, label: { uz: "sink — ImmunoVit va Gold tarkibida", ru: "цинка — в составе ImmunoVit и Gold" } },
      { value: { uz: "30 kun", ru: "30 дней" }, label: { uz: "Potenton kursi, kuniga 1 kapsula", ru: "курс Potenton, 1 капсула в день" } },
      { value: { uz: "14+", ru: "14+" }, label: { uz: "yoshdan — multivitamin + biotin", ru: "лет — мультивитамин + биотин" } },
    ],
    dayTitle: { uz: "Erkak kuni", ru: "День мужчины" },
    dayIntro: {
      uz: "Ovqat, harakat va uyqu — asos. Qoʻshimchalar kunning oʻz joyida.",
      ru: "Еда, движение и сон — основа. Добавки — в своё время дня.",
    },
    steps: [
      {
        time: { uz: "Ertalab", ru: "Утро" },
        title: { uz: "Xilma-xil nonushta", ru: "Разнообразный завтрак" },
        body: {
          uz: "Ratsion bir xil boʻlsa, multivitamin qoʻshimcha boʻladi: A, B guruhi, C, D3, E.",
          ru: "При однообразном рационе мультивитамин станет дополнением: A, группа B, C, D3, E.",
        },
        image: "man-breakfast-kitchen",
        imageAlt: { uz: "Erkak oshxonada nonushta tayyorlamoqda", ru: "Мужчина готовит завтрак на кухне" },
        productSlug: "dr-frei-multivitamins-biotin-20",
      },
      {
        time: { uz: "Ish", ru: "Работа" },
        title: { uz: "Tanaffus va suv", ru: "Перерывы и вода" },
        body: {
          uz: "Uzoq oʻtirganda har soatda turib yuring va suvni yoningizda tuting.",
          ru: "При долгой сидячей работе вставайте и проходитесь каждый час, держите воду под рукой.",
        },
        image: "man-focus-laptop",
        imageAlt: { uz: "Erkak noutbuk oldida oʻylab oʻtiribdi", ru: "Мужчина задумался за ноутбуком" },
      },
      {
        time: { uz: "Harakat", ru: "Движение" },
        title: { uz: "Mashgʻulot kuni", ru: "День тренировки" },
        body: {
          uz: "Magniy, vitamin C va suv — mashgʻulot kuni uchun alohida reja.",
          ru: "Магний, витамин C и вода — отдельный план на день тренировки.",
        },
        image: "man-foam-roller",
        imageAlt: { uz: "Erkak uyda massaj valigida mashq qilmoqda", ru: "Мужчина делает упражнение на массажном ролике дома" },
        href: "/goals/sport",
      },
      {
        time: { uz: "Immunitet", ru: "Иммунитет" },
        title: { uz: "Sink", ru: "Цинк" },
        body: {
          uz: "Sink immun tizimining normal ishlashiga hissa qoʻshadi. Swiss Energy ImmunoVit tarkibida — 10 mg.",
          ru: "Цинк вносит вклад в нормальную работу иммунной системы. В составе Swiss Energy ImmunoVit — 10 мг.",
        },
        productSlug: "swiss-energy-immunovit-30",
        image: "man-running-snow",
        imageAlt: { uz: "Erkak qishda qorli koʻprikda yugurmoqda", ru: "Мужчина бежит зимой по заснеженному мосту" },
      },
      {
        time: { uz: "Erkaklar uchun", ru: "Для мужчин" },
        title: { uz: "Potenton Happy man", ru: "Potenton Happy man" },
        body: {
          uz: "Erkaklar uchun moʻljallangan: kuniga 1 kapsula, 30 kunlik kurs. Tarkibi — mahsulot sahifasida.",
          ru: "Создан для мужчин: 1 капсула в день, курс 30 дней. Состав — на странице продукта.",
        },
        productSlug: "swiss-energy-potenton-30",
        image: "man-doctor-consult",
        imageAlt: { uz: "Erkak shifokor bilan suhbatlashmoqda", ru: "Мужчина на консультации у врача" },
      },
    ],
    ctaDay: { uz: "Erkak kuni", ru: "День мужчины" },
  },
  "goal/seniors": {
    accent: "seniors",
    heroStyle: "light",
    layout: "list",
    large: true,
    eyebrow: { uz: "Katta yosh · kun tartibi", ru: "Старший возраст · распорядок дня" },
    hero: {
      file: "senior-man-sunny",
      alt: { uz: "Tabassum qilayotgan keksa erkak quyoshli koʻchada", ru: "Улыбающийся пожилой мужчина на солнечной улице" },
      position: "50% 30%",
    },
    inset: { file: "grandparents-grandson", alt: { uz: "Buva va buvi nevarasi bilan kuzgi bogʻda", ru: "Бабушка и дедушка с внуком в осеннем парке" } },
    stickers: ["dr-frei-tonometr-a20", "swiss-energy-calcivit-30"],
    stats: [
      { value: { uz: "2 yil", ru: "2 года" }, label: { uz: "kafolat — Dr. Frei A20 tonometri", ru: "гарантии на тонометр Dr. Frei A20" } },
      { value: { uz: "D3 + K2", ru: "D3 + K2" }, label: { uz: "kalsiy bilan bitta kapsulada — Calcivit", ru: "с кальцием в одной капсуле — Calcivit" } },
      { value: { uz: "A + sink", ru: "A + цинк" }, label: { uz: "lutein va E bilan — Visiovit", ru: "с лютеином и E — Visiovit" } },
    ],
    dayTitle: { uz: "Kun tartibi", ru: "Распорядок дня" },
    dayIntro: {
      uz: "Har qanday qoʻshimchadan oldin doimiy dorilar roʻyxatini shifokorga koʻrsating.",
      ru: "Перед любой добавкой покажите врачу список лекарств, которые вы принимаете постоянно.",
    },
    steps: [
      {
        time: { uz: "Ertalab", ru: "Утро" },
        title: { uz: "Bosimni oʻlchash", ru: "Измерение давления" },
        body: {
          uz: "Shifokor aytgan boʻlsa, bosimni uyda bir vaqtda oʻlchab, natijani yozib boring.",
          ru: "Если врач советовал, измеряйте давление дома в одно и то же время и записывайте результат.",
        },
        image: "pensioner-reading-breakfast",
        imageAlt: { uz: "Keksa erkak nonushtada gazeta oʻqimoqda", ru: "Пожилой мужчина читает газету за завтраком" },
        productSlug: "dr-frei-tonometr-a20",
      },
      {
        time: { uz: "Kunduzi", ru: "Днём" },
        title: { uz: "Harakat", ru: "Движение" },
        body: {
          uz: "Yurish, suzish, bogʻdagi ish — har kuni ozgina harakat.",
          ru: "Прогулка, бассейн, работа в саду — немного движения каждый день.",
        },
        image: "seniors-swimming",
        imageAlt: { uz: "Keksa ayollar basseynda mashq qilmoqda", ru: "Пожилые женщины занимаются в бассейне" },
      },
      {
        time: { uz: "Ovqat bilan", ru: "С едой" },
        title: { uz: "Suyaklar", ru: "Кости" },
        body: {
          uz: "Kalsiy va vitamin D normal suyaklarni saqlashga hissa qoʻshadi. Calcivit — kalsiy, D3, K2 bitta kapsulada.",
          ru: "Кальций и витамин D вносят вклад в поддержание нормальных костей. Calcivit — кальций, D3, K2 в одной капсуле.",
        },
        productSlug: "swiss-energy-calcivit-30",
        image: "doctor-xray-bones",
        imageAlt: { uz: "Shifokor keksa bemorga rentgen natijasini koʻrsatmoqda", ru: "Врач показывает пожилому пациенту снимок" },
      },
      {
        time: { uz: "Kechqurun", ru: "Вечером" },
        title: { uz: "Koʻz", ru: "Глаза" },
        body: {
          uz: "Vitamin A va sink normal koʻrishni saqlashga hissa qoʻshadi. Visiovit — lutein, A, E va sink.",
          ru: "Витамин A и цинк вносят вклад в поддержание нормального зрения. Visiovit — лютеин, A, E и цинк.",
        },
        image: "senior-puzzle",
        imageAlt: { uz: "Keksa ayol stolda boshqotirma yigʻmoqda", ru: "Пожилая женщина собирает пазл за столом" },
        productSlug: "swiss-energy-visiovit-30",
      },
      {
        time: { uz: "Doim", ru: "Всегда" },
        title: { uz: "Dorilar roʻyxati", ru: "Список лекарств" },
        body: {
          uz: "Dorilar va qoʻshimchalar roʻyxatini bitta varaqqa yozing va har qabulga olib boring.",
          ru: "Запишите лекарства и добавки на один лист и берите его на каждый приём.",
        },
        image: "grandfather-grandson",
        imageAlt: { uz: "Bobo nevarasini yelkasida koʻtarib olgan", ru: "Дедушка несёт внука на плечах" },
      },
    ],
    bundle: {
      title: { uz: "Uy toʻplami", ru: "Домашний набор" },
      text: {
        uz: "Tonometr va kalsiy, D3, K2 kapsulasi — uyda bosimni kuzatish va har kungi qoʻshimcha.",
        ru: "Тонометр и капсулы с кальцием, D3 и K2 — контроль давления дома и ежедневная добавка.",
      },
      cta: SET_CTA,
      total: SET_TOTAL,
      slugs: ["dr-frei-tonometr-a20", "swiss-energy-calcivit-30"],
    },
    ctaBundle: { uz: "Uy toʻplami", ru: "Домашний набор" },
    ctaDay: { uz: "Kun tartibi", ru: "Распорядок дня" },
  },
};

export interface WorldStep {
  time: string;
  title: string;
  body: string;
  image: { src: string; alt: string };
  productSlug?: string;
  href?: string;
}

export interface TopicWorld {
  accent: WorldAccent;
  heroStyle: WorldHeroStyle;
  layout: WorldLayout;
  large: boolean;
  more: string;
  eyebrow: string;
  hero: { src: string; alt: string; position?: string };
  inset: { src: string; alt: string };
  stickers: string[];
  stats: { value: string; label: string }[];
  dayTitle: string;
  dayIntro: string;
  steps: WorldStep[];
  bundle: { title: string; text: string; cta: string; total: string; slugs: string[] } | null;
  ctaBundle: string | null;
  ctaDay: string;
}

const bank = (file: string) => `/images/bank/${file}.webp`;

export function topicWorld(kind: HealthTopicKind, slug: string, locale: Locale): TopicWorld | null {
  const raw = WORLDS[`${kind}/${slug}`];
  if (!raw) return null;
  return {
    accent: raw.accent,
    heroStyle: raw.heroStyle,
    layout: raw.layout ?? "cards",
    large: raw.large ?? false,
    more: MORE[locale],
    eyebrow: raw.eyebrow[locale],
    hero: { src: bank(raw.hero.file), alt: raw.hero.alt[locale], position: raw.hero.position },
    inset: { src: bank(raw.inset.file), alt: raw.inset.alt[locale] },
    stickers: raw.stickers,
    stats: raw.stats.map((s) => ({ value: s.value[locale], label: s.label[locale] })),
    dayTitle: raw.dayTitle[locale],
    dayIntro: raw.dayIntro[locale],
    steps: raw.steps.map((s) => ({
      time: s.time[locale],
      title: s.title[locale],
      body: s.body[locale],
      image: { src: bank(s.image), alt: s.imageAlt[locale] },
      productSlug: s.productSlug,
      href: s.href,
    })),
    bundle: raw.bundle
      ? {
          title: raw.bundle.title[locale],
          text: raw.bundle.text[locale],
          cta: raw.bundle.cta[locale],
          total: raw.bundle.total[locale],
          slugs: raw.bundle.slugs,
        }
      : null,
    ctaBundle: raw.ctaBundle ? raw.ctaBundle[locale] : null,
    ctaDay: raw.ctaDay[locale],
  };
}

/** Every key, file and product slug a world refers to — for the tests. */
export const WORLD_ENTRIES = Object.entries(WORLDS) as [string, RawTopicWorld][];
