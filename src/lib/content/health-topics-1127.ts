import type { RawHealthTopic } from "./health-topics";

/*
  Daily batch 2026-11-27: mother and child — pregnancy planning, breastfeeding,
  trimesters, school-age children (7–13), the home first-aid kit for a baby.
  Picked from Planner demand (ru: «витамины для планирования беременности»,
  «витамины для кормящих», «витамины для школьников»). Products only as their
  pack describes them; no product is offered for breastfeeding because no pack
  in the catalogue names it. Every page sends danger signs to a doctor first.
*/

export const topics1127: RawHealthTopic[] = [
  {
    "kind": "goal",
    "slug": "pregnancy-planning",
    "name": {
      "uz": "Homiladorlikni rejalashtirish",
      "ru": "Планирование беременности"
    },
    "headline": {
      "uz": "Homiladorlikni rejalashtirish: foliy kislotasi qachon boshlanadi va shifokor bilan nimani kelishish kerak",
      "ru": "Планирование беременности: когда начинать фолиевую кислоту и что обсудить с врачом"
    },
    "intro": {
      "uz": "Homiladorlikka tayyorgarlik homiladorlikdan oldin boshlanadi. Foliy kislotasi, tahlillar va turmush tarzi — rejalashtirish bosqichida nima muhim va katalogdagi qaysi mahsulot tarkibida folat bor.",
      "ru": "Подготовка к беременности начинается до беременности. Фолиевая кислота, анализы и образ жизни — что важно на этапе планирования и в каком продукте из каталога есть фолат."
    },
    "sections": {
      "uz": [
        {
          "title": "Nega rejalashtirish erta boshlanadi",
          "body": "Homilaning nerv nayi homiladorlikning birinchi 4 haftasida shakllanadi — koʻp ayollar bu paytda homilador ekanini hali bilmaydi. Shuning uchun JSST foliy kislotasini homiladorlikdan oldin, imkon qadar erta boshlashni tavsiya qiladi."
        },
        {
          "title": "Foliy kislotasi",
          "body": "Qoʻshimcha folat onaning folat darajasini oshiradi. Onada folat darajasining pastligi homilada nerv nayi nuqsonlari rivojlanishi uchun xavf omili hisoblanadi. Odatda kuniga 400 mkg tavsiya etiladi; dozani va muddatni shifokor belgilaydi."
        },
        {
          "title": "Rejalashtirish koʻrigi",
          "body": "Shifokor bilan uchrashuvda tahlillar, emlash holati, doimiy ichiladigan dorilar va surunkali kasalliklar koʻrib chiqiladi. Ayrim dorilar homiladorlikdan oldin almashtirilishi kerak boʻlishi mumkin — oʻzingiz toʻxtatmang, shifokor bilan kelishing."
        },
        {
          "title": "Turmush tarzi",
          "body": "Spirtli ichimlik va chekishdan voz kechish, xilma-xil ovqatlanish va meʼyoridagi vazn homiladorlikka tayyorgarlikning bir qismi. Bu ikkala sherikka ham tegishli."
        },
        {
          "title": "Katalogdagi mahsulot",
          "body": "Swiss Energy Prenatal Forte: 20 ta vitamin va mineral, jumladan folat 400 mkg va temir 14 mg, 60 kapsula. Qadoqda «Support of healthy pregnancy» deb yozilgan. Rejalashtirish davrida qabul qilish haqida shifokor bilan kelishing; tarkibida A vitamini ham bor, shuning uchun boshqa A vitaminli mahsulot bilan birga ichmang."
        }
      ],
      "ru": [
        {
          "title": "Почему планировать нужно заранее",
          "body": "Нервная трубка плода формируется в первые 4 недели беременности — многие женщины в это время ещё не знают о беременности. Поэтому ВОЗ рекомендует начинать фолиевую кислоту до беременности, как можно раньше."
        },
        {
          "title": "Фолиевая кислота",
          "body": "Дополнительный приём фолата повышает уровень фолата у матери. Низкий уровень фолата у матери считается фактором риска развития дефектов нервной трубки у плода. Обычно рекомендуют 400 мкг в день; дозу и длительность назначает врач."
        },
        {
          "title": "Осмотр при планировании",
          "body": "На приёме у врача обсуждают анализы, прививки, постоянно принимаемые лекарства и хронические заболевания. Некоторые препараты может понадобиться заменить до беременности — не отменяйте их сами, согласуйте с врачом."
        },
        {
          "title": "Образ жизни",
          "body": "Отказ от алкоголя и курения, разнообразное питание и нормальный вес — часть подготовки к беременности. Это касается обоих партнёров."
        },
        {
          "title": "Продукт из каталога",
          "body": "Swiss Energy Prenatal Forte: 20 витаминов и минералов, в том числе фолат 400 мкг и железо 14 мг, 60 капсул. На упаковке указано «Support of healthy pregnancy». Приём на этапе планирования согласуйте с врачом; в составе есть витамин A, поэтому не совмещайте с другими продуктами с витамином A."
        }
      ]
    },
    "bullets": {
      "uz": [
        "Foliy kislotasi — homiladorlikdan oldin, imkon qadar erta",
        "Odatda kuniga 400 mkg; dozani shifokor belgilaydi",
        "Rejalashtirish koʻrigi: tahlillar, emlash, dorilar",
        "Prenatal Forte tarkibida folat 400 mkg va temir 14 mg"
      ],
      "ru": [
        "Фолиевая кислота — до беременности, как можно раньше",
        "Обычно 400 мкг в день; дозу назначает врач",
        "Осмотр при планировании: анализы, прививки, лекарства",
        "В Prenatal Forte — фолат 400 мкг и железо 14 мг"
      ]
    },
    "ingredientSlugs": [
      "iron"
    ],
    "productSlugs": [
      "swiss-energy-prenatal-forte-60"
    ],
    "categorySlugs": [],
    "relatedSlugs": [
      "folic-acid",
      "pregnancy",
      "pregnancy-trimesters",
      "iron"
    ],
    "faq": {
      "uz": [
        {
          "question": "Foliy kislotasini qachon boshlash kerak?",
          "answer": "JSST homiladorlikdan oldin, imkon qadar erta boshlashni tavsiya qiladi, chunki nerv nayi birinchi 4 haftada shakllanadi. Aniq muddatni shifokor bilan kelishing."
        },
        {
          "question": "Kuniga qancha foliy kislotasi kerak?",
          "answer": "Odatda 400 mkg. Ayrim holatlarda shifokor boshqa dozani belgilaydi — oʻzingiz oshirmang."
        },
        {
          "question": "Prenatal Forte ni rejalashtirishda ichsa boʻladimi?",
          "answer": "Tarkibida folat 400 mkg bor, lekin qadoqda homiladorlik uchun deb yozilgan. Rejalashtirish davrida qabul qilish haqida shifokor bilan kelishing."
        },
        {
          "question": "Erkakka ham tayyorgarlik kerakmi?",
          "answer": "Ha: chekish va spirtli ichimlikdan voz kechish, ovqatlanish va shifokor koʻrigi ikkala sherikka ham tegishli."
        }
      ],
      "ru": [
        {
          "question": "Когда начинать фолиевую кислоту?",
          "answer": "ВОЗ рекомендует начинать до беременности, как можно раньше, потому что нервная трубка формируется в первые 4 недели. Точные сроки согласуйте с врачом."
        },
        {
          "question": "Сколько фолиевой кислоты нужно в день?",
          "answer": "Обычно 400 мкг. В отдельных случаях врач назначает другую дозу — не увеличивайте её сами."
        },
        {
          "question": "Можно ли принимать Prenatal Forte при планировании?",
          "answer": "В составе есть фолат 400 мкг, но на упаковке указано, что продукт для беременности. Приём на этапе планирования согласуйте с врачом."
        },
        {
          "question": "Нужна ли подготовка мужчине?",
          "answer": "Да: отказ от курения и алкоголя, питание и осмотр у врача касаются обоих партнёров."
        }
      ]
    }
  },
  {
    "kind": "goal",
    "slug": "breastfeeding",
    "name": {
      "uz": "Emizish davrida vitaminlar",
      "ru": "Витамины для кормящих мам"
    },
    "headline": {
      "uz": "Emizish davrida ona ovqatlanishi: qaysi moddalar muhim va qoʻshimchani nima uchun shifokor bilan tanlash kerak",
      "ru": "Питание кормящей мамы: какие вещества важны и почему добавку выбирают вместе с врачом"
    },
    "intro": {
      "uz": "Emizish davrida onaning ayrim moddalarga ehtiyoji oshadi. Nima muhim, qahvani qancha ichsa boʻladi va chaqaloqqa D vitamini haqida pediatrdan nimani soʻrash kerak.",
      "ru": "В период кормления грудью потребность мамы в некоторых веществах растёт. Что важно, сколько можно кофе и что спросить у педиатра о витамине D для малыша."
    },
    "sections": {
      "uz": [
        {
          "title": "JSST tavsiyasi",
          "body": "JSST chaqaloqni birinchi 6 oy faqat ona suti bilan boqishni va emizishni 2 yoshgacha va undan keyin ham davom ettirishni tavsiya qiladi."
        },
        {
          "title": "Onaga nima muhim",
          "body": "Emizish davrida suyuqlik, energiya va ayrim moddalarga — masalan, yod va D vitaminiga — ehtiyoj oshadi. Xilma-xil ovqat asos boʻladi. Qaysi qoʻshimcha kerakligini tahlillar va ovqatlanishingizga qarab shifokor aniqlaydi."
        },
        {
          "title": "Qahva va kofein",
          "body": "Yevropa oziq-ovqat xavfsizligi agentligi (EFSA) maʼlumotiga koʻra, emizikli ona kuniga 200 mg gacha kofein (taxminan 2 chashka qahva) isteʼmol qilsa, chaqaloq uchun xavotir yoʻq."
        },
        {
          "title": "Chaqaloq uchun D vitamini",
          "body": "Koʻp pediatrlar emizikli chaqaloqqa birinchi kunlardan D vitamini tomchilarini tavsiya qiladi. Dozani faqat pediatr belgilaydi. Katalogimizda 0–3 yosh uchun vitaminlar hozircha yoʻq — buni ochiq aytamiz."
        },
        {
          "title": "Katalogdagi mahsulot haqida",
          "body": "Swiss Energy Prenatal Forte qadogʻida homiladorlik uchun deb yozilgan. Emizish davrida ichish mumkinligini shifokordan soʻrang — biz uni bu davr uchun tavsiya qilmaymiz."
        }
      ],
      "ru": [
        {
          "title": "Рекомендация ВОЗ",
          "body": "ВОЗ рекомендует первые 6 месяцев кормить ребёнка только грудным молоком и продолжать грудное вскармливание до 2 лет и дольше."
        },
        {
          "title": "Что важно маме",
          "body": "В период кормления растёт потребность в жидкости, энергии и некоторых веществах — например, в йоде и витамине D. Основа — разнообразное питание. Нужна ли добавка, врач определит по анализам и вашему рациону."
        },
        {
          "title": "Кофе и кофеин",
          "body": "По данным Европейского агентства по безопасности пищевых продуктов (EFSA), потребление кормящей мамой до 200 мг кофеина в день (примерно 2 чашки кофе) не вызывает опасений для малыша."
        },
        {
          "title": "Витамин D для малыша",
          "body": "Многие педиатры рекомендуют грудничкам капли витамина D с первых дней. Дозу назначает только педиатр. Витаминов для детей 0–3 лет в нашем каталоге пока нет — говорим об этом честно."
        },
        {
          "title": "О продукте из каталога",
          "body": "На упаковке Swiss Energy Prenatal Forte указано, что он для беременности. Можно ли принимать его при кормлении, спросите у врача — мы не рекомендуем его для этого периода."
        }
      ]
    },
    "bullets": {
      "uz": [
        "JSST: 6 oy faqat ona suti, emizish 2 yoshgacha va undan keyin",
        "Yod va D vitaminiga ehtiyoj oshadi — qoʻshimchani shifokor tanlaydi",
        "Kofein: kuniga 200 mg gacha (EFSA)",
        "Chaqaloqqa D vitamini — faqat pediatr belgilagan dozada"
      ],
      "ru": [
        "ВОЗ: 6 месяцев только грудное молоко, кормление до 2 лет и дольше",
        "Растёт потребность в йоде и витамине D — добавку выбирает врач",
        "Кофеин: до 200 мг в день (EFSA)",
        "Витамин D малышу — только в дозе, назначенной педиатром"
      ]
    },
    "ingredientSlugs": [
      "vitamin-d3"
    ],
    "productSlugs": [],
    "categorySlugs": [],
    "relatedSlugs": [
      "pregnancy",
      "vitamin-d3",
      "kids",
      "baby-first-aid"
    ],
    "faq": {
      "uz": [
        {
          "question": "Emizish davrida vitamin ichish kerakmi?",
          "answer": "Bu ovqatlanish va tahlillarga bogʻliq. Xilma-xil ovqat asos; qoʻshimcha kerakligini shifokor aniqlaydi."
        },
        {
          "question": "Emizikli ona qahva ichsa boʻladimi?",
          "answer": "EFSA maʼlumotiga koʻra kuniga 200 mg gacha kofein (taxminan 2 chashka) chaqaloq uchun xavotir tugʻdirmaydi."
        },
        {
          "question": "Chaqaloqqa D vitamini kerakmi?",
          "answer": "Koʻp pediatrlar emizikli chaqaloqqa D vitamini tomchilarini tavsiya qiladi. Dozani pediatr belgilaydi."
        }
      ],
      "ru": [
        {
          "question": "Нужно ли пить витамины при кормлении грудью?",
          "answer": "Это зависит от питания и анализов. Основа — разнообразный рацион; нужна ли добавка, определит врач."
        },
        {
          "question": "Можно ли кормящей маме кофе?",
          "answer": "По данным EFSA, до 200 мг кофеина в день (примерно 2 чашки) не вызывает опасений для малыша."
        },
        {
          "question": "Нужен ли малышу витамин D?",
          "answer": "Многие педиатры рекомендуют грудничкам капли витамина D. Дозу назначает педиатр."
        }
      ]
    }
  },
  {
    "kind": "goal",
    "slug": "pregnancy-trimesters",
    "name": {
      "uz": "Homiladorlik trimestrlari va vitaminlar",
      "ru": "Витамины по триместрам беременности"
    },
    "headline": {
      "uz": "1, 2 va 3-trimestr: har bosqichda qaysi moddalar haqida shifokor bilan gaplashish kerak",
      "ru": "1, 2 и 3 триместр: о каких веществах говорить с врачом на каждом этапе"
    },
    "intro": {
      "uz": "Homiladorlik 40 hafta davom etadi va har trimestrda eʼtibor qaratiladigan narsalar oʻzgaradi. Folat, temir, kalsiy va D vitamini — qachon nima muhim.",
      "ru": "Беременность длится 40 недель, и в каждом триместре акценты меняются. Фолат, железо, кальций и витамин D — когда что важно."
    },
    "sections": {
      "uz": [
        {
          "title": "1-trimestr (1–13 hafta)",
          "body": "Shifokorda roʻyxatdan oʻtish va birinchi tahlillar vaqti. Foliy kislotasi davom ettiriladi: folat homiladorlik davrida ona toʻqimalarining oʻsishiga hissa qoʻshadi. Koʻngil aynishi boʻlsa, kapsulani qachon ichish qulayligini shifokor bilan kelishing."
        },
        {
          "title": "2-trimestr (14–27 hafta)",
          "body": "Qon hajmi ortadi va temirga ehtiyoj koʻpayadi. Temir qizil qon tanachalari va gemoglobinning normal hosil boʻlishiga hissa qoʻshadi. Temir dozasini shifokor tahlillarga qarab belgilaydi — JSST homiladorlik davomida temir va foliy kislotasini kunlik qabul qilishni tavsiya qiladi."
        },
        {
          "title": "3-trimestr (28–40 hafta)",
          "body": "Homilaning suyaklari faol oʻsadi. Kalsiy suyaklarning normal holatini saqlashga, D vitamini kalsiyning normal soʻrilishiga hissa qoʻshadi. Kalsiyning asosiy manbai — sut mahsulotlari; qoʻshimcha kerakligini shifokor aytadi."
        },
        {
          "title": "Har trimestrda",
          "body": "Shifokor koʻriklarini oʻtkazib yubormang. Toʻsatdan kuchli bosh ogʻrigʻi, koʻrish buzilishi, qon ketishi yoki homila harakati kamayishi — darhol shifokorga yoki 103 ga."
        },
        {
          "title": "Katalogdagi mahsulot",
          "body": "Swiss Energy Prenatal Forte: 20 ta vitamin va mineral, jumladan folat 400 mkg, temir 14 mg, D va K2 vitaminlari, 60 kapsula (kuniga 1 ta bilan taxminan 2 oy). Qadoq va shifokor koʻrsatmasi boʻyicha qabul qilinadi."
        }
      ],
      "ru": [
        {
          "title": "1 триместр (1–13 недели)",
          "body": "Время встать на учёт и сдать первые анализы. Приём фолиевой кислоты продолжается: фолат вносит вклад в рост материнских тканей во время беременности. Если беспокоит тошнота, удобное время приёма капсулы обсудите с врачом."
        },
        {
          "title": "2 триместр (14–27 недели)",
          "body": "Объём крови растёт, и потребность в железе увеличивается. Железо вносит вклад в нормальное образование эритроцитов и гемоглобина. Дозу железа врач назначает по анализам — ВОЗ рекомендует ежедневный приём железа и фолиевой кислоты на протяжении беременности."
        },
        {
          "title": "3 триместр (28–40 недели)",
          "body": "Кости плода активно растут. Кальций способствует поддержанию нормального состояния костей, витамин D — нормальному усвоению кальция. Главный источник кальция — молочные продукты; нужна ли добавка, скажет врач."
        },
        {
          "title": "В каждом триместре",
          "body": "Не пропускайте осмотры у врача. Внезапная сильная головная боль, нарушение зрения, кровотечение или ослабление шевелений — сразу к врачу или в 103."
        },
        {
          "title": "Продукт из каталога",
          "body": "Swiss Energy Prenatal Forte: 20 витаминов и минералов, в том числе фолат 400 мкг, железо 14 мг, витамины D и K2, 60 капсул (примерно на 2 месяца по 1 в день). Принимается по инструкции на упаковке и рекомендации врача."
        }
      ]
    },
    "bullets": {
      "uz": [
        "1-trimestr: foliy kislotasi va birinchi tahlillar",
        "2-trimestr: temirga ehtiyoj oshadi — doza tahlilga qarab",
        "3-trimestr: kalsiy va D vitamini",
        "Xavfli belgilar — darhol shifokorga yoki 103"
      ],
      "ru": [
        "1 триместр: фолиевая кислота и первые анализы",
        "2 триместр: растёт потребность в железе — доза по анализам",
        "3 триместр: кальций и витамин D",
        "Тревожные признаки — сразу к врачу или в 103"
      ]
    },
    "ingredientSlugs": [
      "iron",
      "calcium",
      "vitamin-d3"
    ],
    "productSlugs": [
      "swiss-energy-prenatal-forte-60"
    ],
    "categorySlugs": [],
    "relatedSlugs": [
      "pregnancy",
      "pregnancy-planning",
      "iron",
      "calcium"
    ],
    "faq": {
      "uz": [
        {
          "question": "Qaysi trimestrda qaysi vitamin kerak?",
          "answer": "1-trimestrda foliy kislotasi, 2-trimestrda temirga ehtiyoj oshadi, 3-trimestrda kalsiy va D vitamini muhim. Aniq rejani shifokor tahlillarga qarab tuzadi."
        },
        {
          "question": "Prenatal kompleksni butun homiladorlik davomida ichsa boʻladimi?",
          "answer": "Qadoq va shifokor koʻrsatmasi boʻyicha. Prenatal Forte tarkibida folat 400 mkg va temir 14 mg bor."
        },
        {
          "question": "Temirni qancha ichish kerak?",
          "answer": "Dozani shifokor gemoglobin va boshqa tahlillarga qarab belgilaydi."
        }
      ],
      "ru": [
        {
          "question": "Какие витамины нужны в каком триместре?",
          "answer": "В 1 триместре — фолиевая кислота, во 2 растёт потребность в железе, в 3 важны кальций и витамин D. Точный план врач составит по анализам."
        },
        {
          "question": "Можно ли принимать пренатальный комплекс всю беременность?",
          "answer": "По инструкции на упаковке и рекомендации врача. В Prenatal Forte — фолат 400 мкг и железо 14 мг."
        },
        {
          "question": "Сколько железа нужно принимать?",
          "answer": "Дозу врач назначает по гемоглобину и другим анализам."
        }
      ]
    }
  },
  {
    "kind": "goal",
    "slug": "school-kids",
    "name": {
      "uz": "Maktab oʻquvchilari uchun vitaminlar",
      "ru": "Витамины для школьников"
    },
    "headline": {
      "uz": "7–13 yosh: maktab yillarida ovqatlanish, uyqu va qaysi mahsulot qaysi yoshdan",
      "ru": "7–13 лет: питание, сон в школьные годы и какой продукт с какого возраста"
    },
    "intro": {
      "uz": "Kichik va oʻrta maktab yoshidagi bolalar uchun vitaminlar: kalsiy qancha kerak, nonushta va uyqu nega muhim, katalogdagi bolalar multivitamini tarkibi.",
      "ru": "Витамины для детей младшего и среднего школьного возраста: сколько нужно кальция, почему важны завтрак и сон, состав детского мультивитамина из каталога."
    },
    "sections": {
      "uz": [
        {
          "title": "Asos — ovqat va uyqu",
          "body": "Multivitamin ratsionga qoʻshimcha boʻladi, lekin nonushta, xilma-xil ovqat va yetarli uyquning oʻrnini bosmaydi. 6–12 yoshli bolaga kechasi 9–12 soat uyqu tavsiya etiladi."
        },
        {
          "title": "Kalsiy qancha kerak",
          "body": "AQSh Milliy sogʻliq institutlari (NIH) maʼlumotiga koʻra 4–8 yoshda kuniga 1000 mg, 9–13 yoshda 1300 mg kalsiy kerak. Bir stakan sutda taxminan 300 mg bor. Kalsiy va D vitamini bolalarda suyaklarning normal oʻsishi va rivojlanishiga hissa qoʻshadi."
        },
        {
          "title": "Dr. Frei Kids tarkibi",
          "body": "7 yoshdan yuqori bolalar uchun shipuchi tabletka: 12 ta vitamin (A, B1, B2, B3, B5, B6, B9, B12, C, D3, E, H) va kalsiy 200 mg. 1 tabletka bir stakan (200 ml) suvda eritiladi — yutish shart emas."
        },
        {
          "title": "Yoshga eʼtibor bering",
          "body": "Qadoqdagi yosh muhim: Dr. Frei Kids — 7 yoshdan. 7–13 yoshli bolaga kattalar mahsulotini bermang; 14 yoshdan keyingi tanlov — oʻsmirlar sahifasida."
        },
        {
          "title": "Xavfsizlik",
          "body": "Dozani oshirmang va bir vaqtning oʻzida ikki xil multivitamin bermang. Shipuchi tabletkani bolalar yetmaydigan joyda saqlang. Qoʻshimcha kerakligini pediatr bilan aniqlang."
        }
      ],
      "ru": [
        {
          "title": "Основа — питание и сон",
          "body": "Мультивитамин дополняет рацион, но не заменяет завтрак, разнообразную еду и достаточный сон. Детям 6–12 лет рекомендуется 9–12 часов ночного сна."
        },
        {
          "title": "Сколько нужно кальция",
          "body": "По данным Национальных институтов здоровья США (NIH), в 4–8 лет нужно 1000 мг кальция в день, в 9–13 лет — 1300 мг. В стакане молока — около 300 мг. Кальций и витамин D способствуют нормальному росту и развитию костей у детей."
        },
        {
          "title": "Состав Dr. Frei Kids",
          "body": "Шипучие таблетки для детей старше 7 лет: 12 витаминов (A, B1, B2, B3, B5, B6, B9, B12, C, D3, E, H) и кальций 200 мг. 1 таблетку растворяют в стакане (200 мл) воды — глотать не нужно."
        },
        {
          "title": "Обращайте внимание на возраст",
          "body": "Возраст на упаковке важен: Dr. Frei Kids — с 7 лет. Ребёнку 7–13 лет не давайте взрослые продукты; выбор после 14 лет — на странице для подростков."
        },
        {
          "title": "Безопасность",
          "body": "Не превышайте дозу и не давайте два разных мультивитамина одновременно. Храните шипучие таблетки в недоступном для детей месте. Нужна ли добавка, уточните у педиатра."
        }
      ]
    },
    "bullets": {
      "uz": [
        "Kalsiy: 4–8 yosh — 1000 mg, 9–13 yosh — 1300 mg (NIH)",
        "6–12 yosh: kechasi 9–12 soat uyqu",
        "Dr. Frei Kids — 7 yoshdan, kalsiy 200 mg + 12 vitamin",
        "Kattalar mahsuloti — 14 yoshdan"
      ],
      "ru": [
        "Кальций: 4–8 лет — 1000 мг, 9–13 лет — 1300 мг (NIH)",
        "6–12 лет: 9–12 часов ночного сна",
        "Dr. Frei Kids — с 7 лет, кальций 200 мг + 12 витаминов",
        "Взрослые продукты — с 14 лет"
      ]
    },
    "ingredientSlugs": [
      "calcium",
      "vitamin-d3",
      "vitamin-c"
    ],
    "productSlugs": [
      "dr-frei-kids-multivitamins-20"
    ],
    "categorySlugs": [
      "kids"
    ],
    "relatedSlugs": [
      "kids",
      "teens",
      "calcium",
      "vitamin-d3"
    ],
    "faq": {
      "uz": [
        {
          "question": "Maktab oʻquvchisiga vitamin kerakmi?",
          "answer": "Ovqatlanish xilma-xil boʻlsa, koʻpincha shart emas. Qoʻshimcha kerakligini pediatr aniqlaydi."
        },
        {
          "question": "Dr. Frei Kids necha yoshdan?",
          "answer": "Qadoqda 7 yoshdan yuqori bolalar uchun deb yozilgan."
        },
        {
          "question": "Bolaga kuniga qancha kalsiy kerak?",
          "answer": "NIH maʼlumotiga koʻra 4–8 yoshda 1000 mg, 9–13 yoshda 1300 mg. Bir stakan sutda taxminan 300 mg bor."
        }
      ],
      "ru": [
        {
          "question": "Нужны ли школьнику витамины?",
          "answer": "При разнообразном питании часто не обязательны. Нужна ли добавка, определит педиатр."
        },
        {
          "question": "С какого возраста Dr. Frei Kids?",
          "answer": "На упаковке указано: для детей старше 7 лет."
        },
        {
          "question": "Сколько кальция нужно ребёнку в день?",
          "answer": "По данным NIH, в 4–8 лет — 1000 мг, в 9–13 лет — 1300 мг. В стакане молока около 300 мг."
        }
      ]
    }
  },
  {
    "kind": "goal",
    "slug": "baby-first-aid",
    "name": {
      "uz": "Bola uchun uy aptechkasi",
      "ru": "Детская домашняя аптечка"
    },
    "headline": {
      "uz": "Bola uchun uy aptechkasi: termometr, sovutuvchi plastir va qachon shifokorga zudlik bilan murojaat qilish kerak",
      "ru": "Детская аптечка дома: термометр, охлаждающий пластырь и когда срочно обращаться к врачу"
    },
    "intro": {
      "uz": "Uyda kichkintoy boʻlsa, aptechka oldindan tayyor turgani maʼqul. Nima boʻlishi kerak, termometrni qanday tanlash va qaysi belgilar bilan kutmasdan shifokorga borish kerak.",
      "ru": "Если дома малыш, аптечку лучше собрать заранее. Что в ней должно быть, как выбрать термометр и с какими признаками нельзя ждать."
    },
    "sections": {
      "uz": [
        {
          "title": "Darhol shifokorga yoki 103 ga",
          "body": "3 oygacha chaqaloqda harorat 38 °C va undan yuqori boʻlsa, nafas olish qiyinlashsa, bola sust yoki uygʻonmaydigan boʻlsa, toshma bosganda yoʻqolmasa yoki tutqanoq boʻlsa — kutmang."
        },
        {
          "title": "Aptechkada nima boʻlishi kerak",
          "body": "Elektron termometr, burun uchun fiziologik eritma, steril bint va plastirlar, antiseptik, sovutuvchi plastir hamda pediatr tavsiya qilgan isitma tushiruvchi vosita (doza bolaning vazniga qarab). Pediatr va eng yaqin dorixona telefonini ham yozib qoʻying."
        },
        {
          "title": "Termometr tanlash",
          "body": "Simobsiz elektron termometr xavfsizroq. Dr. Frei T30 — bolalar uchun, egiluvchan uchli; Dr. Frei T10 — metall uchli. Haroratni har safar bir xil usulda oʻlchang, shunda koʻrsatkichlarni solishtirish oson."
        },
        {
          "title": "Sovutuvchi plastir",
          "body": "HIEW sovutuvchi gel-plastiri (16 dona) terini 8 soatgacha sovutadi va bolaga yengillik beradi. U isitma tushiruvchi dori emas — harorat va bolaning holatini kuzatishda davom eting."
        },
        {
          "title": "Ingalyator haqida",
          "body": "Nebulayzer orqali dori faqat shifokor tayinlasa beriladi: qaysi dori, qancha va necha marta — pediatr belgilaydi."
        }
      ],
      "ru": [
        {
          "title": "Сразу к врачу или в 103",
          "body": "Если у малыша до 3 месяцев температура 38 °C и выше, ему трудно дышать, он вялый или не просыпается, сыпь не исчезает при надавливании или начались судороги — не ждите."
        },
        {
          "title": "Что должно быть в аптечке",
          "body": "Электронный термометр, физраствор для носа, стерильные бинты и пластыри, антисептик, охлаждающий пластырь и жаропонижающее, которое рекомендовал педиатр (доза — по весу ребёнка). Запишите телефон педиатра и ближайшей аптеки."
        },
        {
          "title": "Как выбрать термометр",
          "body": "Электронный термометр без ртути безопаснее. Dr. Frei T30 — детский, с гибким наконечником; Dr. Frei T10 — с металлическим наконечником. Измеряйте температуру каждый раз одинаковым способом, чтобы показания было удобно сравнивать."
        },
        {
          "title": "Охлаждающий пластырь",
          "body": "Охлаждающий гель-пластырь HIEW (16 шт.) охлаждает кожу до 8 часов и приносит ребёнку облегчение. Это не жаропонижающее средство — продолжайте следить за температурой и состоянием ребёнка."
        },
        {
          "title": "Об ингаляторе",
          "body": "Лекарство через небулайзер дают только по назначению врача: какое, сколько и как часто — решает педиатр."
        }
      ]
    },
    "bullets": {
      "uz": [
        "3 oygacha chaqaloqda 38 °C va yuqori — darhol shifokorga",
        "Elektron termometr: Dr. Frei T30 (egiluvchan uchli) yoki T10",
        "HIEW plastiri terini 8 soatgacha sovutadi — dori emas",
        "Isitma tushiruvchi va ingalyatsiya — faqat pediatr dozasida"
      ],
      "ru": [
        "Малыш до 3 месяцев и 38 °C и выше — сразу к врачу",
        "Электронный термометр: Dr. Frei T30 (гибкий наконечник) или T10",
        "Пластырь HIEW охлаждает кожу до 8 часов — это не лекарство",
        "Жаропонижающее и ингаляции — только в дозе от педиатра"
      ]
    },
    "ingredientSlugs": [],
    "productSlugs": [
      "dr-frei-thermometer-t30",
      "dr-frei-thermometer-t10",
      "hiew-cooling-plaster-16"
    ],
    "categorySlugs": [
      "devices"
    ],
    "relatedSlugs": [
      "fever",
      "kids",
      "breastfeeding",
      "frequent-colds"
    ],
    "faq": {
      "uz": [
        {
          "question": "Bola uchun aptechkada nima boʻlishi kerak?",
          "answer": "Elektron termometr, burun uchun fiziologik eritma, bint va plastirlar, antiseptik, sovutuvchi plastir va pediatr tavsiya qilgan isitma tushiruvchi vosita."
        },
        {
          "question": "Chaqaloq uchun qaysi termometr yaxshi?",
          "answer": "Simobsiz elektron termometr. Dr. Frei T30 bolalar uchun moʻljallangan va uchi egiluvchan."
        },
        {
          "question": "Sovutuvchi plastir isitmani tushiradimi?",
          "answer": "Yoʻq, u terini sovutib, yengillik beradi. Isitma tushiruvchi dori emas."
        },
        {
          "question": "Qachon darhol shifokorga borish kerak?",
          "answer": "3 oygacha chaqaloqda 38 °C va undan yuqori harorat, nafas qiyinlashishi, sustlik, bosganda yoʻqolmaydigan toshma yoki tutqanoqda — darhol 103 ga."
        }
      ],
      "ru": [
        {
          "question": "Что должно быть в детской аптечке?",
          "answer": "Электронный термометр, физраствор для носа, бинты и пластыри, антисептик, охлаждающий пластырь и жаропонижающее, рекомендованное педиатром."
        },
        {
          "question": "Какой термометр лучше для малыша?",
          "answer": "Электронный без ртути. Dr. Frei T30 предназначен для детей и имеет гибкий наконечник."
        },
        {
          "question": "Снижает ли охлаждающий пластырь температуру?",
          "answer": "Нет, он охлаждает кожу и приносит облегчение. Это не жаропонижающее средство."
        },
        {
          "question": "Когда срочно к врачу?",
          "answer": "У малыша до 3 месяцев при 38 °C и выше, при затруднённом дыхании, вялости, сыпи, не исчезающей при надавливании, или судорогах — сразу в 103."
        }
      ]
    }
  }
];
