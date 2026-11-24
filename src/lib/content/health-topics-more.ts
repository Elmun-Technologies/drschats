import type { RawHealthTopic } from "./health-topics";

/*
  Pages for demand the report showed with no page to land on (/admin/keywords:
  aud-teens, aud-elderly, aud-sport, sym-nails, plus muscle cramps). Same
  rules as the audience pages: products only where the pack allows that
  audience, amounts only where the catalogue states them, and nutrient copy
  limited to "contributes to normal …" wording (claims.ts).
*/

export const moreTopics: RawHealthTopic[] = [
  {
    kind: "goal",
    slug: "teens",
    name: { uz: "Oʻsmirlar uchun vitaminlar", ru: "Витамины для подростков" },
    headline: {
      uz: "14 yoshdan: maktab, sport va oʻsish davrida ratsionga qoʻshimcha",
      ru: "С 14 лет: дополнение к рациону в годы учёбы, спорта и роста",
    },
    intro: {
      uz: "Oʻsmirlar va maktab oʻquvchilari uchun vitaminlar: qaysi mahsulot qaysi yoshdan, tarkibida nima bor va qanday qabul qilinadi.",
      ru: "Витамины для подростков и школьников: с какого возраста какой продукт, что в составе и как принимать.",
    },
    sections: {
      uz: [
        {
          title: "Oʻsmirga vitamin kerakmi",
          body: "Oʻsish, oʻqish va sport yillarida ovqatlanish xilma-xil boʻlishi muhim. Multivitamin ratsionga qoʻshimcha boʻladi, lekin ovqat, uyqu va harakatning oʻrnini bosmaydi. Qoʻshimcha kerakligini shifokor bilan aniqlang.",
        },
        {
          title: "Yosh boʻyicha tanlash",
          body: "Qadoqdagi yosh muhim: Dr. Frei Kids — 7 yoshdan, Multi + Biotin va Gold — 14 yoshdan. 7–13 yoshli bola uchun kattalar mahsulotini bermang.",
        },
        {
          title: "Multi + Biotin tarkibida nima bor",
          body: "Bir shipuchi tabletkada A (800 mkg), C (80 mg), D (5 mkg), E (12 mg), B guruhi vitaminlari va biotin (50 mkg) bor. Vitamin C va D immun tizimining normal ishlashiga, B guruhi vitaminlari normal energiya almashinuviga hissa qoʻshadi.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "1 tabletkani 200 ml suvda eriting, kuniga 1 marta ovqatdan keyin iching. Bir vaqtda bir nechta multivitaminni ichmang — tarkibdagi vitaminlar qoʻshilib ketadi.",
        },
      ],
      ru: [
        {
          title: "Нужны ли подростку витамины",
          body: "В годы роста, учёбы и спорта важно разнообразное питание. Мультивитамин дополняет рацион, но не заменяет еду, сон и движение. Нужна ли добавка, решите вместе с врачом.",
        },
        {
          title: "Выбор по возрасту",
          body: "Возраст на упаковке важен: Dr. Frei Kids — с 7 лет, Multi + Biotin и Gold — с 14 лет. Ребёнку 7–13 лет не давайте продукт для взрослых.",
        },
        {
          title: "Что в составе Multi + Biotin",
          body: "В одной шипучей таблетке A (800 мкг), C (80 мг), D (5 мкг), E (12 мг), витамины группы B и биотин (50 мкг). Витамины C и D вносят вклад в нормальную работу иммунной системы, витамины группы B — в нормальный энергетический обмен.",
        },
        {
          title: "Как принимать",
          body: "1 таблетку растворить в 200 мл воды, принимать 1 раз в день после еды. Не принимайте одновременно несколько мультивитаминов — витамины в составе суммируются.",
        },
      ],
    },
    bullets: {
      uz: ["Multi + Biotin va Gold — 14 yoshdan", "7–13 yosh — Dr. Frei Kids", "Kuniga 1 shipuchi tabletka, ovqatdan keyin", "Bir vaqtda bitta multivitamin"],
      ru: ["Multi + Biotin и Gold — с 14 лет", "7–13 лет — Dr. Frei Kids", "1 шипучая таблетка в день после еды", "Один мультивитамин за раз"],
    },
    ingredientSlugs: ["vitamin-c", "vitamin-d3", "biotin", "zinc"],
    productSlugs: ["dr-frei-multivitamins-biotin-20", "dr-frei-gold-vitamins-20", "swiss-energy-vitamin-c-20", "dr-frei-kids-multivitamins-20"],
    categorySlugs: [],
    relatedSlugs: ["kids", "immunity", "energy", "multivitamins"],
    faq: {
      uz: [
        { question: "Oʻsmirlarga qaysi yoshdan kattalar vitamini mumkin?", answer: "Multi + Biotin va Gold uchun ishlab chiqaruvchi 14 yoshdan koʻrsatadi. Undan kichik bolalar uchun Dr. Frei Kids (7 yoshdan) bor." },
        { question: "Imtihon davrida vitamin ichish kerakmi?", answer: "Asosiysi — uyqu, ovqat va dam olish. Qoʻshimcha kerakligini shifokor bilan aniqlang; qadoqdagi dozadan oshirmang." },
        { question: "Multivitamin va vitamin C ni birga ichsa boʻladimi?", answer: "Multi + Biotin tarkibida vitamin C bor. Ikkalasini birga qabul qilishdan oldin shifokor bilan maslahatlashing." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, bu biologik faol qoʻshimcha: dori vositasi emas va toʻliq ovqatlanishning oʻrnini bosmaydi." },
      ],
      ru: [
        { question: "С какого возраста подростку можно взрослые витамины?", answer: "Для Multi + Biotin и Gold производитель указывает возраст с 14 лет. Для детей младше есть Dr. Frei Kids (с 7 лет)." },
        { question: "Нужны ли витамины во время экзаменов?", answer: "Главное — сон, питание и отдых. Нужна ли добавка, решите с врачом; не превышайте дозу на упаковке." },
        { question: "Можно ли принимать мультивитамин и витамин C вместе?", answer: "В Multi + Biotin уже есть витамин C. Перед совместным приёмом проконсультируйтесь с врачом." },
        { question: "Это лекарство?", answer: "Нет, это биологически активная добавка: не лекарственное средство и не замена полноценному питанию." },
      ],
    },
  },
  {
    kind: "goal",
    slug: "seniors",
    name: { uz: "Keksalar uchun vitaminlar", ru: "Витамины для пожилых" },
    headline: {
      uz: "50 yoshdan keyin: suyaklar, koʻz, asab tizimi va uyda bosim nazorati",
      ru: "После 50: кости, глаза, нервная система и контроль давления дома",
    },
    intro: {
      uz: "Keksalar uchun vitaminlar va jihozlar: kalsiy va D3, koʻz uchun lutein, B guruhi vitaminlari, tonometr. Dori bilan birga qabul qilishdan oldin shifokorga ayting.",
      ru: "Витамины и приборы для пожилых: кальций и D3, лютеин для глаз, витамины группы B, тонометр. Перед приёмом вместе с лекарствами скажите врачу.",
    },
    sections: {
      uz: [
        {
          title: "Avval — shifokor bilan",
          body: "Yosh oʻtgan sari doimiy qabul qilinadigan dorilar koʻpayadi. Har qanday qoʻshimchani boshlashdan oldin roʻyxatni shifokorga koʻrsating: baʼzi vitaminlar dorilar bilan birga ehtiyot boʻlishni talab qiladi.",
        },
        {
          title: "Suyaklar: kalsiy, D3 va K2",
          body: "Kalsiy va vitamin D normal suyaklarni saqlashga, vitamin K normal suyaklarni saqlashga hissa qoʻshadi. Calcivit — kalsiy, D3, K2, sink, mis va marganets bitta kapsulada, 30 kunlik qadoq.",
        },
        {
          title: "Koʻz uchun",
          body: "Vitamin A va sink normal koʻrishni saqlashga hissa qoʻshadi. Visiovit (kapsula) va Gold (shipuchi tabletka) tarkibida lutein, A, E va sink bor — formatini qulayiga qarab tanlang.",
        },
        {
          title: "Uyda bosimni oʻlchash",
          body: "Shifokor bosimni muntazam oʻlchashni aytgan boʻlsa, uyda tonometr kerak. Dr. Frei A20 — mexanik tonometr, 2 yillik kafolat bilan. Natijalarni yozib boring va qabulga olib boring.",
        },
      ],
      ru: [
        {
          title: "Сначала — с врачом",
          body: "С возрастом растёт число постоянно принимаемых лекарств. Перед началом любой добавки покажите врачу список: некоторые витамины требуют осторожности вместе с лекарствами.",
        },
        {
          title: "Кости: кальций, D3 и K2",
          body: "Кальций и витамин D вносят вклад в поддержание нормального состояния костей, витамин K — тоже. Calcivit — кальций, D3, K2, цинк, медь и марганец в одной капсуле, упаковка на 30 дней.",
        },
        {
          title: "Для глаз",
          body: "Витамин A и цинк вносят вклад в поддержание нормального зрения. В Visiovit (капсулы) и Gold (шипучие таблетки) есть лютеин, A, E и цинк — выбирайте удобный формат.",
        },
        {
          title: "Давление дома",
          body: "Если врач назначил регулярно измерять давление, дома нужен тонометр. Dr. Frei A20 — механический тонометр с гарантией 2 года. Записывайте результаты и показывайте их на приёме.",
        },
      ],
    },
    bullets: {
      uz: ["Kalsiy + D3 + K2 — bitta kapsulada", "Koʻz uchun: lutein, A, E, sink", "Uyda bosim: mexanik tonometr", "Dori bilan birga — faqat shifokor bilan"],
      ru: ["Кальций + D3 + K2 в одной капсуле", "Для глаз: лютеин, A, E, цинк", "Давление дома: механический тонометр", "Вместе с лекарствами — только с врачом"],
    },
    ingredientSlugs: ["calcium", "vitamin-d3", "vitamin-k2", "vitamin-b12", "magnesium"],
    productSlugs: ["swiss-energy-calcivit-30", "swiss-energy-visiovit-30", "dr-frei-gold-vitamins-20", "swiss-energy-neuroforce-30", "dr-frei-tonometr-a20", "dr-frei-antistress-magniy-20"],
    categorySlugs: [],
    relatedSlugs: ["joints", "eyes", "heart", "calcium"],
    faq: {
      uz: [
        { question: "60 yoshdan keyin qaysi vitaminlar kerak?", answer: "Bu ovqatlanish, tahlillar va qabul qilinayotgan dorilarga bogʻliq. Koʻpincha shifokor kalsiy, vitamin D va B12 ni tekshiradi — natijaga qarab tanlang." },
        { question: "Kalsiyni dori bilan birga ichsa boʻladimi?", answer: "Kalsiy baʼzi dorilarning soʻrilishiga taʼsir qilishi mumkin. Qabul vaqtini shifokor yoki farmatsevt bilan kelishing." },
        { question: "Mexanik tonometr bilan oʻzim oʻlchay olamanmi?", answer: "Mexanik tonometr stetoskop bilan ishlaydi va koʻnikma talab qiladi. Birinchi oʻlchovni shifokor yoki hamshira koʻrsatib bersin." },
        { question: "Bu dori vositasimi?", answer: "Vitaminlar — biologik faol qoʻshimcha, dori vositasi emas. Tonometr — oʻlchov jihozi." },
      ],
      ru: [
        { question: "Какие витамины нужны после 60?", answer: "Это зависит от питания, анализов и принимаемых лекарств. Часто врач проверяет кальций, витамин D и B12 — выбирайте по результатам." },
        { question: "Можно ли принимать кальций вместе с лекарствами?", answer: "Кальций может влиять на всасывание некоторых лекарств. Время приёма согласуйте с врачом или фармацевтом." },
        { question: "Смогу ли я сам измерять механическим тонометром?", answer: "Механический тонометр работает со стетоскопом и требует навыка. Пусть первое измерение покажет врач или медсестра." },
        { question: "Это лекарство?", answer: "Витамины — биологически активные добавки, не лекарственные средства. Тонометр — измерительный прибор." },
      ],
    },
  },
  {
    kind: "goal",
    slug: "sport",
    name: { uz: "Sportchilar uchun vitaminlar", ru: "Витамины для спортсменов" },
    headline: {
      uz: "Mashgʻulot kunlari: magniy, vitamin C, B guruhi va suv",
      ru: "Дни тренировок: магний, витамин C, группа B и вода",
    },
    intro: {
      uz: "Sport bilan shugʻullanuvchilar uchun vitaminlar: magniy, vitamin C va multivitamin — tarkib, qabul qilish vaqti va nimalarga eʼtibor berish.",
      ru: "Витамины для тех, кто занимается спортом: магний, витамин C и мультивитамин — состав, время приёма и на что обратить внимание.",
    },
    sections: {
      uz: [
        {
          title: "Asos — ovqat, suv va uyqu",
          body: "Mashgʻulotdan keyingi holat birinchi navbatda ovqat, suv va uyquga bogʻliq. Vitaminlar ratsionni toʻldiradi, lekin ularning oʻrnini bosmaydi.",
        },
        {
          title: "Magniy",
          body: "Magniy normal mushak faoliyatiga va charchoqni kamaytirishga hissa qoʻshadi. Dr. Frei Antistress — magniy 100 mg, B6 2 mg, taurin, C va K bitta shipuchi tabletkada; kechqurun ovqatdan keyin.",
        },
        {
          title: "Vitamin C",
          body: "Vitamin C jismoniy faollik vaqtida va undan keyin immun tizimining normal ishlashiga hissa qoʻshadi. Swiss Energy Vitamin C — 550 mg, apelsin taʼmli shipuchi tabletka.",
        },
        {
          title: "Multivitamin",
          body: "Ratsion bir xil boʻlsa, multivitamin qoʻshimcha boʻladi. Multi + Biotin — A, C, D, E va B guruhi, 14 yoshdan. Bir nechta mahsulotni birga ichsangiz, vitamin C qoʻshilib ketishini hisobga oling.",
        },
      ],
      ru: [
        {
          title: "Основа — еда, вода и сон",
          body: "Самочувствие после тренировки в первую очередь зависит от еды, воды и сна. Витамины дополняют рацион, но не заменяют их.",
        },
        {
          title: "Магний",
          body: "Магний вносит вклад в нормальную работу мышц и в уменьшение утомляемости. Dr. Frei Антистресс — магний 100 мг, B6 2 мг, таурин, C и K в одной шипучей таблетке; вечером после еды.",
        },
        {
          title: "Витамин C",
          body: "Витамин C вносит вклад в нормальную работу иммунной системы во время и после физической нагрузки. Swiss Energy Витамин C — 550 мг, шипучая таблетка со вкусом апельсина.",
        },
        {
          title: "Мультивитамин",
          body: "При однообразном рационе мультивитамин станет дополнением. Multi + Biotin — A, C, D, E и группа B, с 14 лет. Если пьёте несколько продуктов, учитывайте, что витамин C суммируется.",
        },
      ],
    },
    bullets: {
      uz: ["Magniy + B6 — kechqurun", "Vitamin C 550 mg — shipuchi", "Multivitamin — ratsion bir xil boʻlsa", "Suv va uyqu — birinchi oʻrinda"],
      ru: ["Магний + B6 — вечером", "Витамин C 550 мг — шипучий", "Мультивитамин — при однообразном рационе", "Вода и сон — в первую очередь"],
    },
    ingredientSlugs: ["magnesium", "vitamin-c", "zinc", "collagen"],
    productSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-vitamin-c-20", "dr-frei-multivitamins-biotin-20", "swiss-energy-nature-collagen", "swiss-energy-calcivit-30"],
    categorySlugs: [],
    relatedSlugs: ["energy", "joints", "magnesium", "muscle-cramps"],
    faq: {
      uz: [
        { question: "Sportchiga qaysi vitaminlar kerak?", answer: "Koʻpincha magniy, vitamin C va D, B guruhi soʻraladi. Aniq ehtiyojni ovqatlanish va tahlillar koʻrsatadi — sport shifokori bilan maslahatlashing." },
        { question: "Magniyni qachon ichgan maʼqul?", answer: "Dr. Frei Antistress uchun ishlab chiqaruvchi kechqurun ovqatdan keyin qabul qilishni koʻrsatadi." },
        { question: "Kollagen sportchilarga kerakmi?", answer: "Kollagen — oqsil. U ovqatdagi oqsilning oʻrnini bosmaydi; qoʻshimcha sifatida ichishni xohlasangiz, istalgan ichimlikka aralashtiriladi." },
        { question: "Bu dopingmi?", answer: "Yoʻq, bu vitamin va minerallar — biologik faol qoʻshimcha. Musobaqada qatnashsangiz, har qanday qoʻshimchani federatsiya qoidalariga solishtiring." },
      ],
      ru: [
        { question: "Какие витамины нужны спортсмену?", answer: "Чаще спрашивают о магнии, витаминах C и D, группе B. Точную потребность покажут питание и анализы — проконсультируйтесь со спортивным врачом." },
        { question: "Когда лучше пить магний?", answer: "Для Dr. Frei Антистресс производитель рекомендует приём вечером после еды." },
        { question: "Нужен ли спортсменам коллаген?", answer: "Коллаген — это белок. Он не заменяет белок из еды; если хотите принимать его как добавку, он смешивается с любым напитком." },
        { question: "Это допинг?", answer: "Нет, это витамины и минералы — биологически активные добавки. Если вы выступаете на соревнованиях, сверяйте любую добавку с правилами федерации." },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "brittle-nails",
    name: { uz: "Moʻrt tirnoqlar", ru: "Ломкие ногти" },
    headline: {
      uz: "Tirnoq sinishi va qatlamlanishi: sabablar, parvarish va tarkib",
      ru: "Ногти ломаются и слоятся: причины, уход и состав",
    },
    intro: {
      uz: "Tirnoq sinishi va qatlamlanishi koʻpincha suv va tozalash vositalari, quruq havo yoki ratsionga bogʻliq. Sink va biotin normal tirnoqqa hissa qoʻshadi.",
      ru: "Ногти ломаются и слоятся чаще всего из-за воды и бытовой химии, сухого воздуха или рациона. Цинк и биотин вносят вклад в нормальное состояние ногтей.",
    },
    sections: {
      uz: [
        {
          title: "Nima sabab boʻlishi mumkin",
          body: "Qoʻl tez-tez suvda boʻlishi, tozalash vositalari, aseton, quruq havo va tirnoqni asbob sifatida ishlatish eng koʻp uchraydigan sabablar. Ratsionda oqsil va mikroelementlar kam boʻlsa ham tirnoq moʻrtlashadi.",
        },
        {
          title: "Kundalik parvarish",
          body: "Idish yuvishda qoʻlqop kiying, qoʻlni yuvgandan keyin krem surting, tirnoqni qisqaroq tuting va bir yoʻnalishda egovlang. Asetonli suyuqlikni kamroq ishlating.",
        },
        {
          title: "Tarkib: sink va biotin",
          body: "Sink normal tirnoqlarni saqlashga, biotin normal soch va terini saqlashga hissa qoʻshadi. Hair, Nail & Skin — sink 10 mg, biotin 150 mkg, B5, B3, L-sistein va L-metionin, 14 yoshdan, kuniga 1 kapsula.",
        },
        {
          title: "Qachon shifokorga",
          body: "Tirnoq rangi yoki shakli oʻzgarsa, qalinlashsa, atrofida ogʻriq yoki qizarish boʻlsa — dermatologga murojaat qiling. Bu belgilar parvarish bilan oʻtmaydi.",
        },
      ],
      ru: [
        {
          title: "В чём может быть причина",
          body: "Чаще всего — частый контакт с водой, бытовая химия, ацетон, сухой воздух и привычка использовать ногти как инструмент. Ногти становятся ломкими и при нехватке белка и микроэлементов в рационе.",
        },
        {
          title: "Ежедневный уход",
          body: "Мойте посуду в перчатках, после мытья рук наносите крем, держите ногти короче и подпиливайте в одном направлении. Реже используйте жидкость с ацетоном.",
        },
        {
          title: "Состав: цинк и биотин",
          body: "Цинк вносит вклад в поддержание нормального состояния ногтей, биотин — волос и кожи. Hair, Nail & Skin — цинк 10 мг, биотин 150 мкг, B5, B3, L-цистеин и L-метионин, с 14 лет, 1 капсула в день.",
        },
        {
          title: "Когда к врачу",
          body: "Если изменился цвет или форма ногтя, он утолщился, вокруг боль или покраснение — обратитесь к дерматологу. Такие признаки уходом не проходят.",
        },
      ],
    },
    bullets: {
      uz: ["Qoʻlqop va krem — birinchi qadam", "Sink 10 mg + biotin 150 mkg — bitta kapsulada", "Kuniga 1 kapsula, 14 yoshdan", "Rang yoki shakl oʻzgarsa — dermatologga"],
      ru: ["Перчатки и крем — первый шаг", "Цинк 10 мг + биотин 150 мкг в одной капсуле", "1 капсула в день, с 14 лет", "Изменился цвет или форма — к дерматологу"],
    },
    ingredientSlugs: ["zinc", "biotin", "collagen"],
    productSlugs: ["swiss-energy-hair-nail-skin-30", "swiss-energy-nature-collagen", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: [],
    relatedSlugs: ["hair-loss", "beauty", "biotin", "zinc"],
    faq: {
      uz: [
        { question: "Tirnoq nega sinadi?", answer: "Koʻpincha suv, tozalash vositalari va quruq havo sabab. Ratsion ham rol oʻynaydi. Rang yoki shakl oʻzgarsa, dermatologga koʻrining." },
        { question: "Tirnoq uchun qaysi vitamin?", answer: "Sink normal tirnoqlarni saqlashga hissa qoʻshadi. Hair, Nail & Skin tarkibida sink va biotin bor; qadoq 30 kunlik." },
        { question: "Natija qachon koʻrinadi?", answer: "Tirnoq sekin oʻsadi, yangi qismi bir necha oyda chiqadi. Ishlab chiqaruvchi kamida 3 oy qabul qilishni koʻrsatadi." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, bu biologik faol qoʻshimcha. Tirnoq kasalliklarini dermatolog aniqlaydi." },
      ],
      ru: [
        { question: "Почему ломаются ногти?", answer: "Чаще всего из-за воды, бытовой химии и сухого воздуха. Играет роль и рацион. Если изменился цвет или форма — покажитесь дерматологу." },
        { question: "Какой витамин для ногтей?", answer: "Цинк вносит вклад в поддержание нормального состояния ногтей. В Hair, Nail & Skin есть цинк и биотин; упаковка на 30 дней." },
        { question: "Когда будет виден результат?", answer: "Ноготь растёт медленно, новая часть отрастает за несколько месяцев. Производитель рекомендует приём не менее 3 месяцев." },
        { question: "Это лекарство?", answer: "Нет, это биологически активная добавка. Заболевания ногтей определяет дерматолог." },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "muscle-cramps",
    name: { uz: "Mushak tortishishi", ru: "Судороги в мышцах" },
    headline: {
      uz: "Oyoq tortishishi: nima qilish, magniy va qachon shifokorga",
      ru: "Сводит ноги: что делать, магний и когда к врачу",
    },
    intro: {
      uz: "Mushak, ayniqsa oyoq tortishishi koʻpincha charchoq, suv yetishmovchiligi yoki uzoq bir holatda turishdan keyin boʻladi. Magniy normal mushak faoliyatiga hissa qoʻshadi.",
      ru: "Судороги в мышцах, особенно в ногах, часто бывают после усталости, нехватки воды или долгого пребывания в одной позе. Магний вносит вклад в нормальную работу мышц.",
    },
    sections: {
      uz: [
        {
          title: "Tortishganda nima qilish kerak",
          body: "Mushakni sekin choʻzing: boldir tortishsa, oyoq barmoqlarini oʻzingizga torting. Yengil massaj qiling, iliq narsa qoʻying. Tortishish odatda bir necha daqiqada oʻtadi.",
        },
        {
          title: "Nima sabab boʻlishi mumkin",
          body: "Kuchli jismoniy yuklama, issiqda terlash va suv yetishmasligi, uzoq tik turish yoki oʻtirish, homiladorlik. Baʼzan doimiy qabul qilinadigan dorilar ham sabab boʻladi — bu haqda shifokorga ayting.",
        },
        {
          title: "Magniy va kalsiy",
          body: "Magniy va kalsiy normal mushak faoliyatiga hissa qoʻshadi. Dr. Frei Antistress — magniy 100 mg va B6 2 mg shipuchi tabletkada, kechqurun. Calcivit — kalsiy, D3 va K2 kapsulada.",
        },
        {
          title: "Qachon shifokorga",
          body: "Tortishish tez-tez, har kecha takrorlansa, oyoq shishsa, qizarsa yoki ogʻrisa, yoki tortishish uzoq oʻtmasa — shifokorga murojaat qiling. Bu belgilar tekshiruvni talab qiladi.",
        },
      ],
      ru: [
        {
          title: "Что делать, если свело мышцу",
          body: "Медленно растяните мышцу: если свело икру, потяните пальцы стопы на себя. Сделайте лёгкий массаж, приложите тёплое. Обычно судорога проходит за несколько минут.",
        },
        {
          title: "В чём может быть причина",
          body: "Сильная физическая нагрузка, потеря жидкости в жару, долгое стояние или сидение, беременность. Иногда причиной бывают постоянно принимаемые лекарства — скажите об этом врачу.",
        },
        {
          title: "Магний и кальций",
          body: "Магний и кальций вносят вклад в нормальную работу мышц. Dr. Frei Антистресс — магний 100 мг и B6 2 мг в шипучей таблетке, вечером. Calcivit — кальций, D3 и K2 в капсуле.",
        },
        {
          title: "Когда к врачу",
          body: "Если судороги повторяются часто, каждую ночь, нога отекает, краснеет или болит, либо судорога долго не проходит — обратитесь к врачу. Такие признаки требуют обследования.",
        },
      ],
    },
    bullets: {
      uz: ["Tortishganda — sekin choʻzing", "Suv yetarli boʻlsin, ayniqsa issiqda", "Magniy 100 mg + B6 — kechqurun", "Har kecha takrorlansa — shifokorga"],
      ru: ["Свело — медленно растяните", "Пейте достаточно воды, особенно в жару", "Магний 100 мг + B6 — вечером", "Повторяется каждую ночь — к врачу"],
    },
    ingredientSlugs: ["magnesium", "calcium", "vitamin-d3"],
    productSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-calcivit-30"],
    categorySlugs: [],
    relatedSlugs: ["magnesium", "sport", "calcium", "fatigue"],
    faq: {
      uz: [
        { question: "Kechasi oyoq nega tortishadi?", answer: "Koʻpincha kunduzgi yuklama, suv yetishmasligi yoki uzoq bir holatda turishdan keyin. Har kecha takrorlansa, shifokorga koʻrining." },
        { question: "Tortishishda qaysi vitamin kerak?", answer: "Magniy va kalsiy normal mushak faoliyatiga hissa qoʻshadi. Tanqislik borligini tahlil koʻrsatadi — shifokor bilan aniqlang." },
        { question: "Homiladorlikda tortishsa magniy ichsa boʻladimi?", answer: "Homiladorlikda har qanday qoʻshimchani faqat shifokor bilan kelishib qabul qiling." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, bu biologik faol qoʻshimcha. Tez-tez tortishishning sababini shifokor aniqlaydi." },
      ],
      ru: [
        { question: "Почему ночью сводит ноги?", answer: "Чаще всего после дневной нагрузки, нехватки воды или долгой позы. Если повторяется каждую ночь — покажитесь врачу." },
        { question: "Какой витамин нужен при судорогах?", answer: "Магний и кальций вносят вклад в нормальную работу мышц. Есть ли дефицит, покажет анализ — уточните у врача." },
        { question: "Можно ли пить магний при судорогах во время беременности?", answer: "Во время беременности любую добавку принимайте только по согласованию с врачом." },
        { question: "Это лекарство?", answer: "Нет, это биологически активная добавка. Причину частых судорог определяет врач." },
      ],
    },
  },
];
