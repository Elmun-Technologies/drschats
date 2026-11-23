import type { RawHealthTopic } from "./health-topics";

/*
  Audience goals from the demand report (/admin/keywords): people search for
  vitamins by who they are for. Each page lists only products the catalogue
  already sells for that audience and quotes amounts only where the catalogue
  states them. Copy says a nutrient "contributes to" a normal function
  (claims.ts, health-claims.test.ts).
*/

export const audienceGoalTopics: RawHealthTopic[] = [
  {
    kind: "goal",
    slug: "kids",
    name: { uz: "Bolalar uchun vitaminlar", ru: "Витамины для детей" },
    headline: {
      uz: "Bolaning kundalik ratsioniga qoʻshimcha: tarkib, yosh va qabul qilish",
      ru: "Дополнение к ежедневному рациону ребёнка: состав, возраст и приём",
    },
    intro: {
      uz: "Bolalar uchun vitaminlar: qaysi yoshdan, tarkibida nima bor, qanday qabul qilinadi. Katalogdagi bolalar multivitamini haqida aniq maʼlumot.",
      ru: "Витамины для детей: с какого возраста, что в составе и как принимать. Подробно о детском мультивитамине из каталога.",
    },
    sections: {
      uz: [
        {
          title: "Bolalarga vitamin qachon va nima uchun beriladi",
          body: "Bolaning ovqatlanishi xilma-xil boʻlsa, koʻpchilik vitaminlar ovqatdan tushadi. Multivitamin qoʻshimchasi ratsionga qoʻshimcha sifatida ishlatiladi va toʻliq ovqatlanishning oʻrnini bosmaydi. Qoʻshimcha kerakligini pediatr bilan aniqlang.",
        },
        {
          title: "Dr. Frei Kids tarkibida nima bor",
          body: "7 yoshdan yuqori bolalar uchun shipuchi multivitamin: 12 ta vitamin (A, B1, B2, B3, B5, B6, B9, B12, C, D3, E, biotin) va kalsiy. Bir tabletkada, jumladan, kalsiy 200 mg, vitamin C 60 mg, D3 2,3 mkg bor. Kalsiy va vitamin D suyak va tishlarning normal oʻsishi va holatiga, vitamin C immun tizimining normal ishlashiga, B guruhi vitaminlari asab tizimi va psixologik faoliyatning normal kechishiga hissa qoʻshadi.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "1 tabletkani 200 ml suvda eriting va kuniga 1 marta, ovqatdan keyin iching. Tabletka yutish shart emas: u mevali ichimlikka aylanadi. Koʻrsatma 7 yoshdan boshlab.",
        },
        {
          title: "7 yoshgacha boʻlgan bolalar",
          body: "Katalogimizda 7 yoshgacha boʻlgan bolalar uchun vitamin (tomchi, sirop) hozircha yoʻq. Kichik bolalarga qoʻshimcha berish haqida pediatr bilan maslahatlashing.",
        },
        {
          title: "Bolaga vitamin berishdan oldin",
          body: "Tarkibdagi biror moddaga allergiya yoki bolada surunkali kasallik boʻlsa, avval shifokorga murojaat qiling. Qadoqdagi dozani oshirmang, vitaminlarni bir nechta mahsulotdan bir vaqtda bermang.",
        },
      ],
      ru: [
        {
          title: "Когда и зачем давать детям витамины",
          body: "Если питание ребёнка разнообразно, большинство витаминов поступает с едой. Мультивитаминная добавка дополняет рацион и не заменяет полноценное питание. Нужна ли добавка, лучше решить вместе с педиатром.",
        },
        {
          title: "Что в составе Dr. Frei Kids",
          body: "Шипучий мультивитамин для детей старше 7 лет: 12 витаминов (A, B1, B2, B3, B5, B6, B9, B12, C, D3, E, биотин) и кальций. В одной таблетке, в частности, кальций 200 мг, витамин C 60 мг, D3 2,3 мкг. Кальций и витамин D вносят вклад в нормальный рост и состояние костей и зубов, витамин C — в нормальную работу иммунной системы, витамины группы B — в нормальную работу нервной системы и психологические функции.",
        },
        {
          title: "Как принимать",
          body: "1 таблетку растворить в 200 мл воды и принимать 1 раз в день после еды. Таблетку не нужно глотать: получается фруктовый напиток. Рекомендация — с 7 лет.",
        },
        {
          title: "Дети младше 7 лет",
          body: "Витаминов для детей младше 7 лет (капли, сироп) в нашем каталоге пока нет. О добавках для малышей проконсультируйтесь с педиатром.",
        },
        {
          title: "Прежде чем давать ребёнку витамины",
          body: "При аллергии на компоненты или хронических заболеваниях сначала обратитесь к врачу. Не превышайте дозу на упаковке и не давайте несколько витаминных продуктов одновременно.",
        },
      ],
    },
    bullets: {
      uz: ["12 ta vitamin + kalsiy — bitta shipuchi tabletkada", "7 yoshdan, kuniga 1 tabletka, ovqatdan keyin", "Mevali taʼm — tabletka yutish shart emas", "Pediatr bilan maslahatlashib tanlang"],
      ru: ["12 витаминов + кальций в одной шипучей таблетке", "С 7 лет, 1 таблетка в день после еды", "Фруктовый вкус — таблетку не нужно глотать", "Выбирайте вместе с педиатром"],
    },
    ingredientSlugs: ["vitamin-c", "vitamin-d3", "calcium", "biotin"],
    productSlugs: ["dr-frei-kids-multivitamins-20"],
    categorySlugs: ["kids", "effervescent"],
    relatedSlugs: ["immunity", "frequent-colds", "vitamin-d3", "calcium"],
    faq: {
      uz: [
        {
          question: "Bolalarga qaysi yoshdan vitamin berish mumkin?",
          answer: "Dr. Frei Kids uchun ishlab chiqaruvchi 7 yoshdan boshlashni koʻrsatadi. Kichik bolalar uchun yosh va doza haqida pediatrga murojaat qiling.",
        },
        {
          question: "Shipuchi vitamin bolaga mosmi?",
          answer: "Shipuchi tabletka suvda eriydi va ichimlik koʻrinishida beriladi, tabletkani yutish shart emas. Tarkibdagi komponentlarga allergiya boʻlsa qoʻllamang.",
        },
        {
          question: "Bolaga multivitamin har kuni kerakmi?",
          answer: "Bu bolaning ovqatlanishi, yoshi va sogʻligʻiga bogʻliq. Qoʻshimchani doimiy qabul qilishdan oldin pediatr bilan maslahatlashing; qadoqdagi doza 1 tabletka/kun.",
        },
        {
          question: "Bolalar vitaminlari dori vositasimi?",
          answer: "Yoʻq, bu biologik faol qoʻshimcha (BAD): dori vositasi emas va toʻliq ovqatlanishning oʻrnini bosmaydi.",
        },
      ],
      ru: [
        {
          question: "С какого возраста можно давать детям витамины?",
          answer: "Для Dr. Frei Kids производитель указывает возраст от 7 лет. Для малышей возраст и дозировку уточняйте у педиатра.",
        },
        {
          question: "Подходят ли шипучие витамины ребёнку?",
          answer: "Шипучая таблетка растворяется в воде и даётся как напиток, глотать её не нужно. При аллергии на компоненты не применять.",
        },
        {
          question: "Нужно ли ребёнку принимать мультивитамины каждый день?",
          answer: "Это зависит от питания, возраста и здоровья ребёнка. Перед постоянным приёмом проконсультируйтесь с педиатром; доза на упаковке — 1 таблетка в день.",
        },
        {
          question: "Детские витамины — это лекарство?",
          answer: "Нет, это биологически активная добавка (БАД): не лекарственное средство и не заменяет полноценное питание.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "pregnancy",
    name: { uz: "Homiladorlar uchun vitaminlar", ru: "Витамины для беременных" },
    headline: {
      uz: "Homiladorlik davri uchun vitamin va minerallar: tarkib, ehtiyotkorlik, shifokor bilan kelishish",
      ru: "Витамины и минералы для периода беременности: состав, меры предосторожности, согласование с врачом",
    },
    intro: {
      uz: "Homiladorlar uchun vitaminlar: foliy kislotasi, temir va boshqa moddalar, katalogdagi prenatal kompleks tarkibi va qabul qilish tartibi.",
      ru: "Витамины для беременных: фолиевая кислота, железо и другие вещества, состав пренатального комплекса из каталога и порядок приёма.",
    },
    sections: {
      uz: [
        {
          title: "Homiladorlikda nimalar muhim",
          body: "Homiladorlik davrida organizmning bir qator vitamin va minerallarga ehtiyoji oʻzgaradi. Foliy kislotasi (folat) homiladorlik davrida ona toʻqimalarining oʻsishiga hissa qoʻshadi, temir esa qon va gemoglobinning normal hosil boʻlishiga hissa qoʻshadi.",
        },
        {
          title: "Swiss Energy Prenatal Forte tarkibi",
          body: "20 ta vitamin va mineral, jumladan folat 400 mkg va temir 14 mg: A, B1, B9, B12, C, D2, K2, selen va boshqalar. Qadoqda «Support of healthy pregnancy» deb yozilgan. 60 kapsula, sekin chiqariladigan shakl, kuniga 1 kapsula bilan taxminan 2 oyga yetadi.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "Qadoq va shifokor koʻrsatmasi boʻyicha. Boshqa vitamin-mineral komplekslari yoki A vitaminli mahsulotlar bilan bir vaqtda ichishdan oldin shifokor bilan maslahatlashing: ayrim moddalar miqdori jami oshib ketishi mumkin.",
        },
        {
          title: "Homiladorlikni rejalashtirish va emizish",
          body: "Rejalashtirish davrida foliy kislotasi haqida alohida sahifamizda oʻqing. Emizish davrida qaysi qoʻshimcha mos ekanini shifokor bilan aniqlang.",
        },
        {
          title: "Shifokor bilan nima uchun kelishiladi",
          body: "Har bir homiladorlik individual: tahlillar, ovqatlanish va sogʻliq holati ehtiyojni belgilaydi. BAD dori vositasi emas va shifokor nazoratini almashtirmaydi.",
        },
      ],
      ru: [
        {
          title: "Что важно при беременности",
          body: "В период беременности потребность в ряде витаминов и минералов меняется. Фолиевая кислота (фолат) вносит вклад в рост материнских тканей во время беременности, а железо — в нормальное образование эритроцитов и гемоглобина.",
        },
        {
          title: "Состав Swiss Energy Prenatal Forte",
          body: "20 витаминов и минералов, в том числе фолат 400 мкг и железо 14 мг: A, B1, B9, B12, C, D2, K2, селен и другие. На упаковке указано «Support of healthy pregnancy». 60 капсул замедленного высвобождения, при приёме по 1 капсуле в день — примерно на 2 месяца.",
        },
        {
          title: "Как принимать",
          body: "По инструкции на упаковке и рекомендации врача. Перед одновременным приёмом с другими витаминно-минеральными комплексами или продуктами с витамином A проконсультируйтесь с врачом: суммарное количество некоторых веществ может оказаться выше нормы.",
        },
        {
          title: "Планирование беременности и кормление грудью",
          body: "При планировании беременности читайте нашу отдельную страницу о фолиевой кислоте. Какая добавка подходит в период кормления, уточните у врача.",
        },
        {
          title: "Почему важно согласовать с врачом",
          body: "Каждая беременность индивидуальна: потребность определяют анализы, питание и состояние здоровья. БАД не является лекарством и не заменяет наблюдение врача.",
        },
      ],
    },
    bullets: {
      uz: ["Folat 400 mkg va temir 14 mg — Prenatal Forte tarkibida", "20 ta vitamin va mineral, 60 kapsula (~2 oy)", "Boshqa komplekslar bilan birga ichishdan oldin shifokorga", "Homiladorlikni rejalashtirish: foliy kislotasi sahifasi"],
      ru: ["Фолат 400 мкг и железо 14 мг в составе Prenatal Forte", "20 витаминов и минералов, 60 капсул (~2 месяца)", "Перед совмещением с другими комплексами — к врачу", "Планирование беременности: страница о фолиевой кислоте"],
    },
    ingredientSlugs: ["iron", "vitamin-k2"],
    productSlugs: ["swiss-energy-prenatal-forte-60"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["folic-acid", "iron", "vitamin-d3"],
    faq: {
      uz: [
        {
          question: "Homiladorlik paytida qaysi vitaminlarni ichish kerak?",
          answer: "Bu shifokor bilan aniqlanadi. Katalogimizda homiladorlar uchun Swiss Energy Prenatal Forte bor: 20 ta vitamin va mineral, jumladan folat 400 mkg va temir 14 mg.",
        },
        {
          question: "Prenatal Forte ni qanday ichiladi?",
          answer: "Qadoq va shifokor koʻrsatmasi boʻyicha. 60 kapsulalik qadoq kuniga 1 kapsula bilan taxminan 2 oyga yetadi.",
        },
        {
          question: "Prenatal kompleksni boshqa vitaminlar bilan birga ichsa boʻladimi?",
          answer: "Avval shifokor bilan maslahatlashing: boshqa mahsulotlarda ham A vitamini, temir yoki foliy kislotasi boʻlishi mumkin va jami miqdor oshib ketishi mumkin.",
        },
        {
          question: "Homiladorlikni rejalashtirishda nima ichiladi?",
          answer: "Rejalashtirish bosqichida foliy kislotasi haqida shifokor bilan gaplashing; batafsil maʼlumot foliy kislotasi sahifasida.",
        },
      ],
      ru: [
        {
          question: "Какие витамины пить при беременности?",
          answer: "Это определяется вместе с врачом. В нашем каталоге для беременных есть Swiss Energy Prenatal Forte: 20 витаминов и минералов, в том числе фолат 400 мкг и железо 14 мг.",
        },
        {
          question: "Как принимать Prenatal Forte?",
          answer: "По инструкции на упаковке и рекомендации врача. Упаковка из 60 капсул при приёме по 1 капсуле в день рассчитана примерно на 2 месяца.",
        },
        {
          question: "Можно ли принимать пренатальный комплекс вместе с другими витаминами?",
          answer: "Сначала проконсультируйтесь с врачом: в других продуктах тоже могут быть витамин A, железо или фолиевая кислота, и суммарное количество может оказаться выше нормы.",
        },
        {
          question: "Что принимать при планировании беременности?",
          answer: "На этапе планирования обсудите с врачом фолиевую кислоту; подробности — на странице о фолиевой кислоте.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "men",
    name: { uz: "Erkaklar uchun vitaminlar", ru: "Витамины для мужчин" },
    headline: {
      uz: "Erkaklar uchun vitamin va minerallar: sink, D, B guruhi, multivitaminlar",
      ru: "Витамины и минералы для мужчин: цинк, D, группа B, мультивитамины",
    },
    intro: {
      uz: "Erkaklar uchun vitaminlar: sink, vitamin D, B guruhi va multivitaminlar. Katalogdagi mahsulotlar tarkibi va qabul qilish tartibi.",
      ru: "Витамины для мужчин: цинк, витамин D, группа B и мультивитамины. Состав продуктов из каталога и порядок приёма.",
    },
    sections: {
      uz: [
        {
          title: "Erkaklar uchun nima muhim",
          body: "Ehtiyoj yosh, ovqatlanish va turmush tarziga bogʻliq. Sink qondagi testosteronning normal darajasini saqlashga hamda immun tizimining normal ishlashiga hissa qoʻshadi; vitamin D mushaklar va suyaklar holatiga; B guruhi vitaminlari esa normal energiya almashinuvi va asab tizimi faoliyatiga hissa qoʻshadi.",
        },
        {
          title: "Katalogdagi mahsulotlar",
          body: "Swiss Energy Potenton Happy man — erkaklar uchun moʻljallangan, 30 kapsula, kuniga 1 kapsula, 30 kunlik kurs; tarkibi va qabul qilish tartibi mahsulot sahifasi va qadoqda. Sink (10 mg) Swiss Energy ImmunoVit va Dr. Frei Gold Vitaminlar tarkibida bor. Dr. Frei Multivitamins + Biotin — A, B guruhi, C, D3, E va boshqa vitaminlar, 14 yoshdan, shipuchi tabletka.",
        },
        {
          title: "40 yoshdan keyin",
          body: "Yoshga qarab ehtiyoj va xavflar oʻzgaradi. Qaysi moddalar kerakligini tahlillar asosida shifokor aniqlaydi; qoʻshimchani oʻzboshimchalik bilan katta dozada ichmang.",
        },
        {
          title: "Qachon shifokorga murojaat qilish kerak",
          body: "Charchoq, energiya pasayishi yoki erkaklar salomatligi bilan bogʻliq shikoyatlar boʻlsa, vitamin tanlashdan oldin shifokor (terapevt yoki urolog) bilan maslahatlashing. BAD dori vositasi emas.",
        },
      ],
      ru: [
        {
          title: "Что важно мужчинам",
          body: "Потребность зависит от возраста, питания и образа жизни. Цинк вносит вклад в поддержание нормального уровня тестостерона в крови и в нормальную работу иммунной системы; витамин D — в состояние мышц и костей; витамины группы B — в нормальный энергетический обмен и работу нервной системы.",
        },
        {
          title: "Продукты из каталога",
          body: "Swiss Energy Potenton Happy man — для мужчин, 30 капсул, по 1 капсуле в день, курс 30 дней; состав и порядок приёма — на странице продукта и упаковке. Цинк (10 мг) есть в Swiss Energy ImmunoVit и Dr. Frei Gold. Dr. Frei Multivitamins + Biotin — A, группа B, C, D3, E и другие витамины, с 14 лет, шипучие таблетки.",
        },
        {
          title: "После 40 лет",
          body: "С возрастом потребности и риски меняются. Какие вещества нужны, определяет врач по анализам; не принимайте добавки самостоятельно в больших дозах.",
        },
        {
          title: "Когда обратиться к врачу",
          body: "При усталости, снижении энергии или жалобах, связанных с мужским здоровьем, перед выбором витаминов проконсультируйтесь с врачом (терапевт или уролог). БАД не является лекарством.",
        },
      ],
    },
    bullets: {
      uz: ["Sink — testosteronning normal darajasi va immunitet uchun", "Potenton Happy man: 30 kapsula, kuniga 1 kapsula", "Multivitamins + Biotin: A, B, C, D3, E (14+)", "40+ boʻlsa — tahlillar va shifokor tavsiyasi"],
      ru: ["Цинк — нормальный уровень тестостерона и иммунитет", "Potenton Happy man: 30 капсул, по 1 капсуле в день", "Multivitamins + Biotin: A, B, C, D3, E (14+)", "После 40 — анализы и рекомендация врача"],
    },
    ingredientSlugs: ["zinc", "vitamin-d3", "magnesium"],
    productSlugs: ["swiss-energy-potenton-30", "dr-frei-multivitamins-biotin-20", "dr-frei-gold-vitamins-20", "swiss-energy-immunovit-30"],
    categorySlugs: ["vitamins", "effervescent"],
    relatedSlugs: ["zinc", "energy", "stress"],
    faq: {
      uz: [
        {
          question: "Erkaklar uchun qaysi vitaminlar muhim?",
          answer: "Ehtiyoj shaxsga bogʻliq. Sink testosteronning normal darajasini saqlashga, vitamin D mushak va suyaklarga, B guruhi energiya almashinuviga hissa qoʻshadi. Shifokor bilan kelishib tanlang.",
        },
        {
          question: "Potenton Happy man ni qanday ichiladi?",
          answer: "Qadoqdagi koʻrsatma boʻyicha: kuniga 1 kapsula, kurs 30 kun. Aniq vaqt va shartlarni qadoq va shifokor bilan solishtiring.",
        },
        {
          question: "Erkaklar uchun multivitamin mosmi?",
          answer: "Dr. Frei Multivitamins + Biotin 14 yoshdan boshlab kuniga 1 tabletka: A, B guruhi, C, D3, E vitaminlari bor. Boshqa qoʻshimchalar bilan birga ichishdan oldin shifokorga murojaat qiling.",
        },
        {
          question: "Sinkni qaysi mahsulotlarda topish mumkin?",
          answer: "Swiss Energy ImmunoVit va Dr. Frei Gold Vitaminlar tarkibida 10 mg dan sink bor.",
        },
      ],
      ru: [
        {
          question: "Какие витамины важны для мужчин?",
          answer: "Потребность индивидуальна. Цинк вносит вклад в нормальный уровень тестостерона, витамин D — в состояние мышц и костей, группа B — в энергетический обмен. Выбирайте вместе с врачом.",
        },
        {
          question: "Как принимать Potenton Happy man?",
          answer: "По инструкции на упаковке: 1 капсула в день, курс 30 дней. Точное время и условия сверьте с упаковкой и врачом.",
        },
        {
          question: "Подойдёт ли мужчинам мультивитамин?",
          answer: "Dr. Frei Multivitamins + Biotin с 14 лет по 1 таблетке в день: в составе A, группа B, C, D3, E. Перед совмещением с другими добавками проконсультируйтесь с врачом.",
        },
        {
          question: "В каких продуктах есть цинк?",
          answer: "В Swiss Energy ImmunoVit и Dr. Frei Gold Vitamins по 10 мг цинка.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "women",
    name: { uz: "Ayollar uchun vitaminlar", ru: "Витамины для женщин" },
    headline: {
      uz: "Soch, teri, suyaklar va kundalik energiya uchun: katalogdagi mahsulotlar tarkibi",
      ru: "Для волос, кожи, костей и ежедневной энергии: состав продуктов из каталога",
    },
    intro: {
      uz: "Ayollar uchun vitaminlar: biotin, sink, kollagen, kalsiy va D3. Katalogdagi mahsulotlar tarkibi va qanday tanlash haqida.",
      ru: "Витамины для женщин: биотин, цинк, коллаген, кальций и D3. Состав продуктов из каталога и как выбрать.",
    },
    sections: {
      uz: [
        {
          title: "Ayollar uchun nimalar tanlanadi",
          body: "Ehtiyoj yosh, ovqatlanish va sogʻliq holatiga bogʻliq. Koʻpincha soch, teri va tirnoq (biotin, sink), suyaklar (kalsiy, D3, K2) va kundalik quvvat (B guruhi, multivitaminlar) yoʻnalishlari tanlanadi.",
        },
        {
          title: "Soch, teri va tirnoq",
          body: "Swiss Energy Hair Nail & Skin — biotin 150 mkg, sink 10 mg, B1, B6, pantoten kislota, niatsin, L-sistein, L-metionin va achitqi ekstrakti; 30 kapsula, kuniga 1 kapsula ovqat bilan. Biotin va sink soch, teri va tirnoqlarning normal holatini saqlashga hissa qoʻshadi. Swiss Energy Nature Collagen — 100% sof kollagen kukuni, shakarsiz.",
        },
        {
          title: "Suyaklar va kundalik quvvat",
          body: "Swiss Energy Calcivit — kalsiy, D3 va K2, sink, B vitaminlari, mis va marganets; 30 kapsula. Dr. Frei Multivitamins + Biotin — A, B guruhi, C, D3, E, 14 yoshdan, shipuchi tabletka.",
        },
        {
          title: "Alohida holatlar",
          body: "Homiladorlik va rejalashtirish uchun alohida sahifa bor. Ayollar uchun temir yetishmasligi va boshqa ehtiyojlar tahlillar bilan aniqlanadi — vitamin tanlashdan oldin shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          title: "Что выбирают женщины",
          body: "Потребность зависит от возраста, питания и состояния здоровья. Чаще всего выбирают направления: волосы, кожа и ногти (биотин, цинк), кости (кальций, D3, K2) и ежедневная энергия (группа B, мультивитамины).",
        },
        {
          title: "Волосы, кожа и ногти",
          body: "Swiss Energy Hair Nail & Skin — биотин 150 мкг, цинк 10 мг, B1, B6, пантотеновая кислота, ниацин, L-цистеин, L-метионин и дрожжевой экстракт; 30 капсул, по 1 капсуле в день во время еды. Биотин и цинк вносят вклад в поддержание нормального состояния волос, кожи и ногтей. Swiss Energy Nature Collagen — 100% чистый коллаген в порошке, без сахара.",
        },
        {
          title: "Кости и ежедневная энергия",
          body: "Swiss Energy Calcivit — кальций, D3 и K2, цинк, витамины группы B, медь и марганец; 30 капсул. Dr. Frei Multivitamins + Biotin — A, группа B, C, D3, E, с 14 лет, шипучие таблетки.",
        },
        {
          title: "Особые случаи",
          body: "Для беременности и её планирования есть отдельная страница. Дефицит железа и другие потребности определяются анализами — перед выбором витаминов обратитесь к врачу.",
        },
      ],
    },
    bullets: {
      uz: ["Hair Nail & Skin: biotin 150 mkg + sink 10 mg", "Kollagen kukuni — 100% sof, shakarsiz", "Calcivit: kalsiy + D3 + K2 suyaklar uchun", "Homiladorlar uchun alohida sahifa mavjud"],
      ru: ["Hair Nail & Skin: биотин 150 мкг + цинк 10 мг", "Коллаген в порошке — 100% чистый, без сахара", "Calcivit: кальций + D3 + K2 для костей", "Для беременных есть отдельная страница"],
    },
    ingredientSlugs: ["biotin", "collagen", "calcium", "vitamin-d3", "zinc"],
    productSlugs: ["swiss-energy-hair-nail-skin-30", "swiss-energy-nature-collagen", "swiss-energy-calcivit-30", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: ["beauty", "minerals"],
    relatedSlugs: ["beauty", "hair-loss", "calcium", "iron"],
    faq: {
      uz: [
        {
          question: "Ayollar uchun qaysi vitaminlar mos?",
          answer: "Bu yosh, ovqatlanish va sogʻliqqa bogʻliq. Soch, teri va tirnoq uchun biotin va sink, suyaklar uchun kalsiy, D3 va K2, kundalik quvvat uchun B guruhi va multivitaminlar tanlanadi. Shifokor bilan kelishing.",
        },
        {
          question: "Soch va tirnoq uchun qaysi mahsulot bor?",
          answer: "Swiss Energy Hair Nail & Skin: biotin 150 mkg, sink 10 mg va B guruhi vitaminlari; kuniga 1 kapsula ovqat bilan, ishlab chiqaruvchi kamida 3 oy qabul qilishni tavsiya etadi.",
        },
        {
          question: "40 yoshdan keyin ayollar uchun nima muhim?",
          answer: "Koʻpchilik suyaklar uchun kalsiy, D3 va K2 ga eʼtibor beradi. Aniq ehtiyojni shifokor tahlillar asosida belgilaydi.",
        },
        {
          question: "Kollagen vitamin emasmi?",
          answer: "Kollagen oqsil; u vitaminlar bilan birga, ratsionga qoʻshimcha sifatida ishlatiladi. Vitamin C normal kollagen hosil boʻlishiga hissa qoʻshadi.",
        },
      ],
      ru: [
        {
          question: "Какие витамины подходят женщинам?",
          answer: "Зависит от возраста, питания и здоровья. Для волос, кожи и ногтей выбирают биотин и цинк, для костей — кальций, D3 и K2, для ежедневной энергии — группу B и мультивитамины. Согласуйте с врачом.",
        },
        {
          question: "Какой продукт есть для волос и ногтей?",
          answer: "Swiss Energy Hair Nail & Skin: биотин 150 мкг, цинк 10 мг и витамины группы B; по 1 капсуле в день во время еды, производитель рекомендует принимать не менее 3 месяцев.",
        },
        {
          question: "Что важно женщинам после 40 лет?",
          answer: "Многие обращают внимание на кальций, D3 и K2 для костей. Точную потребность определяет врач по анализам.",
        },
        {
          question: "Коллаген — это не витамин?",
          answer: "Коллаген — белок; его принимают вместе с витаминами как дополнение к рациону. Витамин C вносит вклад в нормальное образование коллагена.",
        },
      ],
    },
  },
  {
    kind: "goal",
    slug: "eyes",
    name: { uz: "Koʻz uchun vitaminlar", ru: "Витамины для глаз" },
    headline: {
      uz: "Koʻrish uchun muhim moddalar: vitamin A, sink, lutein — katalogdagi mahsulotlar",
      ru: "Вещества для зрения: витамин A, цинк, лютеин — продукты из каталога",
    },
    intro: {
      uz: "Koʻz uchun vitaminlar: vitamin A va sink koʻrishning normal holatiga hissa qoʻshadi. Visiovit va Gold tarkibi, qabul qilish tartibi.",
      ru: "Витамины для глаз: витамин A и цинк вносят вклад в нормальное зрение. Состав Visiovit и Gold, порядок приёма.",
    },
    sections: {
      uz: [
        {
          title: "Koʻrish uchun muhim moddalar",
          body: "Vitamin A va sink koʻrishning normal holatini saqlashga hissa qoʻshadi; vitamin E va C hujayralarni oksidlovchi stressdan himoya qilishga hissa qoʻshadi. Lutein va zeaksantin — oʻsimlik pigmentlari (karotinoidlar), koʻpgina koʻz uchun mahsulotlarda boʻladi.",
        },
        {
          title: "Swiss Energy Visiovit",
          body: "Lutein + qoraqat (chernika) ekstrakti + zeaksantin + A, E vitaminlari + sink; 30 kapsula, sekin chiqariladigan shakl, kuniga 1 kapsula ovqat bilan. Qadoqda «for healthy eyesight» deb yozilgan.",
        },
        {
          title: "Dr. Frei Gold Vitaminlar",
          body: "Lutein 6 mg bilan birga vitamin A 800 mkg, C 80 mg, E 12 mg va sink 10 mg; 20 shipuchi tabletka, 14 yoshdan, kuniga 1 tabletka ovqat paytida yoki keyin.",
        },
        {
          title: "Koʻz uchun kundalik odatlar",
          body: "Ekranda uzoq ishlaganda har 20 daqiqada 20 soniya uzoqqa qarab tanaffus qiling, xonani yoritib turing va koʻz shifokorida muntazam tekshiruvdan oʻting. Koʻrishning oʻzgarishi, ogʻriq yoki qizarish boʻlsa — shifokorga murojaat qiling; vitaminlar uning oʻrnini bosmaydi.",
        },
      ],
      ru: [
        {
          title: "Что важно для зрения",
          body: "Витамин A и цинк вносят вклад в поддержание нормального зрения; витамины E и C — в защиту клеток от окислительного стресса. Лютеин и зеаксантин — растительные пигменты (каротиноиды), входят во многие продукты для глаз.",
        },
        {
          title: "Swiss Energy Visiovit",
          body: "Лютеин + экстракт черники + зеаксантин + витамины A, E + цинк; 30 капсул замедленного высвобождения, по 1 капсуле в день во время еды. На упаковке указано «for healthy eyesight».",
        },
        {
          title: "Dr. Frei Gold Vitamins",
          body: "Лютеин 6 мг, а также витамин A 800 мкг, C 80 мг, E 12 мг и цинк 10 мг; 20 шипучих таблеток, с 14 лет, по 1 таблетке в день во время еды или после.",
        },
        {
          title: "Привычки для глаз",
          body: "При длительной работе за экраном каждые 20 минут делайте перерыв на 20 секунд, глядя вдаль, обеспечьте хорошее освещение и регулярно проверяйте зрение у офтальмолога. При изменении зрения, боли или покраснении обратитесь к врачу; витамины его не заменяют.",
        },
      ],
    },
    bullets: {
      uz: ["Visiovit: lutein + zeaksantin + A, E + Zn", "Gold: lutein 6 mg + A, C, E, Zn (14+)", "Vitamin A va sink koʻrishning normal holatiga hissa qoʻshadi", "Ekranda ishlaganda tanaffus va koʻz shifokori"],
      ru: ["Visiovit: лютеин + зеаксантин + A, E + Zn", "Gold: лютеин 6 мг + A, C, E, Zn (с 14 лет)", "Витамин A и цинк вносят вклад в нормальное зрение", "Перерывы при работе с экраном и осмотр у офтальмолога"],
    },
    ingredientSlugs: ["zinc"],
    productSlugs: ["swiss-energy-visiovit-30", "dr-frei-gold-vitamins-20"],
    categorySlugs: ["vitamins", "effervescent"],
    relatedSlugs: ["lutein", "vitamin-a", "vitamin-e", "zinc"],
    faq: {
      uz: [
        {
          question: "Koʻz uchun qaysi vitaminlar kerak?",
          answer: "Vitamin A va sink koʻrishning normal holatini saqlashga hissa qoʻshadi. Katalogda Swiss Energy Visiovit (lutein, zeaksantin, A, E, sink) va Dr. Frei Gold (lutein, A, C, E, sink) bor.",
        },
        {
          question: "Visiovit ni qanday ichiladi?",
          answer: "Kuniga 1 kapsula ovqat bilan. Aniq koʻrsatma qadoqda.",
        },
        {
          question: "Lutein nima?",
          answer: "Lutein — oʻsimlik pigmenti (karotinoid), koʻz uchun moʻljallangan koʻplab qoʻshimchalar tarkibida boʻladi. Batafsil — lutein sahifasida.",
        },
        {
          question: "Koʻz charchasa vitamin yetadimi?",
          answer: "Ekran bilan uzoq ishlash, yoritish va uyqu ham muhim. Koʻrish oʻzgarsa yoki noqulaylik davom etsa, koʻz shifokoriga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Какие витамины нужны для глаз?",
          answer: "Витамин A и цинк вносят вклад в поддержание нормального зрения. В каталоге есть Swiss Energy Visiovit (лютеин, зеаксантин, A, E, цинк) и Dr. Frei Gold (лютеин, A, C, E, цинк).",
        },
        {
          question: "Как принимать Visiovit?",
          answer: "По 1 капсуле в день во время еды. Точная инструкция — на упаковке.",
        },
        {
          question: "Что такое лютеин?",
          answer: "Лютеин — растительный пигмент (каротиноид), входит в состав многих добавок для глаз. Подробнее — на странице о лютеине.",
        },
        {
          question: "Достаточно ли витаминов, если устают глаза?",
          answer: "Важны также режим работы с экраном, освещение и сон. Если зрение изменилось или дискомфорт сохраняется, обратитесь к офтальмологу.",
        },
      ],
    },
  },
];
