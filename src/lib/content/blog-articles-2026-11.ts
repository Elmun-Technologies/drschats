import type { RawArticle } from "./blog";

/*
  Knowledge-centre articles written for search demand (docs/HOLAT.md → Trafik T2):
  each answers a question people type and links the products the shop sells for it.
  Composition and reference intakes only — no promise of effect (blog.test.ts runs the
  same claim checks as the health topics), and every page carries the BAD notice.
*/
export const articlesNov2026: RawArticle[] = [
  {
    slug: "kalsiy-va-vitamin-d3-birga",
    date: "2026-11-10",
    imageSeed: "blog-calcium",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Kalsiy va vitamin D3: nega birga ichiladi",
      ru: "Кальций и витамин D3: зачем принимать вместе",
    },
    excerpt: {
      uz: "Kalsiy suyak va tishlarning asosiy minerali, D3 esa uning soʻrilishi uchun kerak. Kunlik meʼyor, kimga koʻproq kerakligi va qanday ichish haqida.",
      ru: "Кальций — главный минерал костей и зубов, а D3 нужен для его усвоения. Суточная норма, кому нужно больше и как принимать.",
    },
    sections: [
      {
        heading: { uz: "Kalsiy nima uchun kerak", ru: "Зачем нужен кальций" },
        paragraphs: {
          uz: [
            "Organizmdagi kalsiyning 99 foizi suyak va tishlarda joylashgan. Qolgan qismi mushaklar qisqarishi, asab impulslari va qon ivishida ishtirok etadi. Kalsiy har kuni ovqat bilan kelishi kerak: organizm uni oʻzi ishlab chiqarmaydi.",
            "Kattalar uchun kunlik meʼyor taxminan 1000 mg. 50 yoshdan oshgan ayollar va 70 yoshdan oshgan erkaklar uchun koʻpincha 1200 mg tavsiya qilinadi. Asosiy manbalar — sut, qatiq, pishloq, tvorog, kunjut, bodom va bargli koʻkatlar.",
          ],
          ru: [
            "99 процентов кальция в организме находится в костях и зубах. Остальное участвует в сокращении мышц, передаче нервных импульсов и свёртывании крови. Кальций должен поступать с едой каждый день: организм сам его не вырабатывает.",
            "Суточная норма для взрослых — около 1000 мг. Женщинам старше 50 лет и мужчинам старше 70 лет часто рекомендуют 1200 мг. Основные источники — молоко, кефир, сыр, творог, кунжут, миндаль и листовая зелень.",
          ],
        },
      },
      {
        heading: { uz: "Nega D3 bilan birga", ru: "Почему вместе с D3" },
        paragraphs: {
          uz: [
            "Vitamin D3 ichakda kalsiyning soʻrilishi uchun zarur. D vitamini yetishmasa, ovqatdagi kalsiyning katta qismi oʻzlashtirilmay qoladi. Shuning uchun kalsiy preparatlari koʻpincha D3 bilan birga chiqariladi.",
            "D3 asosan quyosh nuri taʼsirida terida hosil boʻladi. Kuz va qishda, shuningdek koʻp vaqtini xonada oʻtkazadigan odamlarda uning darajasi pasayishi mumkin. Darajani qon tahlili bilan bilish mumkin — dozani shunga qarab shifokor belgilaydi.",
          ],
          ru: [
            "Витамин D3 нужен для всасывания кальция в кишечнике. При нехватке витамина D большая часть кальция из еды не усваивается. Поэтому препараты кальция часто выпускают вместе с D3.",
            "D3 в основном образуется в коже под действием солнца. Осенью и зимой, а также у тех, кто много времени проводит в помещении, его уровень может снижаться. Уровень показывает анализ крови — по нему врач и подбирает дозу.",
          ],
        },
      },
      {
        heading: { uz: "K2 vitamini nima qiladi", ru: "Что делает витамин K2" },
        paragraphs: {
          uz: [
            "Vitamin K suyaklarning meʼyoriy holatini saqlashda ishtirok etadi: u kalsiy bilan bogʻlanadigan oqsillar (masalan, osteokalsin) ishlashi uchun kerak. K2 shakli koʻpincha kalsiy va D3 bilan bir kompleksda keladi.",
            "Qon suyultiruvchi dorilar (masalan, varfarin) ichadigan odamlar K vitaminini faqat shifokor bilan kelishib qabul qilishi kerak — u dori taʼsiriga oʻzgartirish kiritishi mumkin.",
          ],
          ru: [
            "Витамин K участвует в поддержании нормального состояния костей: он нужен для работы белков, связывающих кальций (например, остеокальцина). Форма K2 часто входит в один комплекс с кальцием и D3.",
            "Людям, которые принимают препараты для разжижения крови (например, варфарин), витамин K можно принимать только по согласованию с врачом — он может изменить действие лекарства.",
          ],
        },
      },
      {
        heading: { uz: "Kimga koʻproq kerak boʻlishi mumkin", ru: "Кому может понадобиться больше" },
        paragraphs: {
          uz: [
            "Sut mahsulotlarini kam isteʼmol qiladiganlar, menopauzadagi ayollar, keksalar, quyoshda kam boʻladiganlar, homilador va emizikli ayollar. Lekin «kerak» degani tahlil va shifokor bilan aniqlanadi: ortiqcha kalsiy ham foydali emas.",
          ],
          ru: [
            "Тем, кто мало ест молочного, женщинам в менопаузе, пожилым людям, тем, кто мало бывает на солнце, беременным и кормящим. Но «нужно» ли — определяют анализы и врач: избыток кальция тоже не на пользу.",
          ],
        },
      },
      {
        heading: { uz: "Qanday ichish kerak", ru: "Как принимать" },
        paragraphs: {
          uz: [
            "Kalsiyni ovqat paytida ichgan maʼqul. Bir martada 500 mg dan koʻp boʻlsa, kunlik miqdorni ikkiga boʻlish yaxshiroq soʻriladi. Kalsiyni temir preparatlari, ayrim antibiotiklar va qalqonsimon bez dorilari bilan bir vaqtda ichmang — orasida kamida 2–4 soat boʻlsin.",
            "Buyrakda tosh, qonda kalsiy yuqori boʻlsa yoki doimiy dori ichsangiz — avval shifokor bilan maslahatlashing. Qadoqdagi koʻrsatmaga amal qiling va tavsiya qilingan miqdordan oshirmang.",
          ],
          ru: [
            "Кальций лучше принимать во время еды. Если доза больше 500 мг за раз, её лучше разделить на два приёма — так он усваивается лучше. Не принимайте кальций одновременно с препаратами железа, некоторыми антибиотиками и лекарствами для щитовидной железы — между ними должно быть 2–4 часа.",
            "Если есть камни в почках, повышенный кальций в крови или вы постоянно принимаете лекарства — сначала посоветуйтесь с врачом. Следуйте инструкции на упаковке и не превышайте рекомендованную дозу.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Kalsiyni ertalab ichgan yaxshimi yoki kechqurun? Muhimi vaqt emas, ovqat bilan ichish va katta dozani ikkiga boʻlish. Koʻpchilik uchun eng qulayi — nonushta va kechki ovqat paytida.",
            "Sut ichsam, kalsiy qoʻshimchasi kerakmi? Kuniga 2–3 porsiya sut mahsuloti isteʼmol qiladigan odam kalsiy meʼyorining katta qismini ovqatdan oladi. Qoʻshimcha kerakmi — shifokor ovqatlanish va tahlilga qarab aytadi.",
            "Kalsiy qabziyatga olib keladimi? Kalsiy karbonat ayrim odamlarda shunday taʼsir qilishi mumkin. Yetarli suv ichish va dozani boʻlib ichish yordam beradi; davom etsa, shifokorga ayting.",
            "Kalsiy bilan birga qahva ichsa boʻladimi? Kuchli qahva va choy kalsiy soʻrilishini biroz kamaytiradi. Ularni kalsiydan bir soat oldin yoki keyin ichgan maʼqul."
          ],
          ru: [
            "Когда лучше пить кальций — утром или вечером? Важно не время, а приём во время еды и деление большой дозы на два раза. Многим удобнее всего — за завтраком и ужином.",
            "Если я пью молоко, нужна ли добавка кальция? Тот, кто ест 2–3 порции молочного в день, получает большую часть нормы кальция с едой. Нужна ли добавка — скажет врач по питанию и анализам.",
            "Вызывает ли кальций запор? Карбонат кальция у некоторых людей может так действовать. Помогают достаточное количество воды и деление дозы; если не проходит — скажите врачу.",
            "Можно ли пить кофе вместе с кальцием? Крепкий кофе и чай немного снижают всасывание кальция. Их лучше пить за час до или через час после кальция."
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-calcivit-30", "dr-frei-kids-multivitamins-20"],
  },
  {
    slug: "bolalar-uchun-vitaminlar-yoshga-qarab",
    date: "2026-11-10",
    imageSeed: "blog-kids",
    category: { uz: "Bolalar", ru: "Дети" },
    categoryKey: "kids",
    title: {
      uz: "Bolalar uchun vitaminlar: yoshga qarab tanlash",
      ru: "Витамины для детей: как выбрать по возрасту",
    },
    excerpt: {
      uz: "Chaqaloqlik, maktabgacha va maktab yoshidagi bolalar uchun vitaminlar haqida: qachon kerak, qanday shakl tanlash va xavfsizlik qoidalari.",
      ru: "О витаминах для младенцев, дошкольников и школьников: когда они нужны, какую форму выбрать и правила безопасности.",
    },
    sections: [
      {
        heading: { uz: "Asosiy manba — ovqat", ru: "Главный источник — еда" },
        paragraphs: {
          uz: [
            "Sogʻlom va xilma-xil ovqatlanadigan bola vitaminlarning katta qismini dasturxondan oladi: sabzavot, meva, sut mahsulotlari, goʻsht, baliq, tuxum, yorma. Vitamin kompleksi ovqatning oʻrnini bosmaydi, faqat yetishmayotgan qismini toʻldiradi.",
            "Bolaga vitamin berishdan oldin pediatr bilan gaplashing. Shifokor bolaning ovqatlanishi, oʻsishi va kerak boʻlsa tahlillarga qarab nima kerakligini aytadi.",
          ],
          ru: [
            "Ребёнок, который питается разнообразно, получает большую часть витаминов со стола: овощи, фрукты, молочные продукты, мясо, рыба, яйца, крупы. Витаминный комплекс не заменяет еду, а только восполняет недостающее.",
            "Прежде чем давать ребёнку витамины, поговорите с педиатром. Врач оценит питание, рост и при необходимости анализы и скажет, что действительно нужно.",
          ],
        },
      },
      {
        heading: { uz: "Yoshga qarab", ru: "По возрасту" },
        paragraphs: {
          uz: [
            "1 yoshgacha: koʻpincha faqat D vitamini tomchilari tavsiya qilinadi — dozani pediatr belgilaydi. Bu yoshda multivitamin kompleksi odatda berilmaydi.",
            "1–6 yosh: shirin chaynaladigan va suyuq shakllar qulay, lekin qadoqdagi yosh chegarasiga albatta qarang. Bir vaqtda ikki xil multivitamin bermang.",
            "7 yoshdan: tabletka va shipuchi shakllar mumkin. Masalan, Dr. Frei Kids — 7 yoshdan, tarkibida A, B guruhi, C, D3, E vitaminlari va kalsiy bor, mevali taʼmga ega.",
          ],
          ru: [
            "До 1 года: чаще всего рекомендуют только витамин D в каплях — дозу назначает педиатр. Мультивитаминные комплексы в этом возрасте обычно не дают.",
            "1–6 лет: удобны жевательные и жидкие формы, но обязательно смотрите на возраст на упаковке. Не давайте одновременно два разных мультивитамина.",
            "С 7 лет: можно таблетки и шипучие формы. Например, Dr. Frei Kids — с 7 лет, содержит витамины A, группы B, C, D3, E и кальций, с фруктовым вкусом.",
          ],
        },
      },
      {
        heading: { uz: "Shipuchi tabletka bolaga qulaymi", ru: "Удобны ли шипучие таблетки детям" },
        paragraphs: {
          uz: [
            "Shipuchi tabletka bir stakan suvda eriydi — yutish qiyin boʻlgan bolalar uchun qulay, ichimlik sifatida qabul qilinadi. Tarkibida natriy boʻladi: tuz cheklangan parhezda buni hisobga oling.",
            "Tabletkani suvga solib, toʻliq erigach ichiring. Uni tilga qoʻyish yoki butunligicha yutish mumkin emas.",
          ],
          ru: [
            "Шипучая таблетка растворяется в стакане воды — удобно детям, которым трудно глотать, принимается как напиток. В составе есть натрий: учитывайте это при диете с ограничением соли.",
            "Опустите таблетку в воду и выпейте после полного растворения. Класть её на язык или глотать целиком нельзя.",
          ],
        },
      },
      {
        heading: { uz: "Xavfsizlik qoidalari", ru: "Правила безопасности" },
        paragraphs: {
          uz: [
            "Vitaminlarni bolalar qoʻli yetmaydigan joyda saqlang: shirin taʼm tufayli bola ularni konfet deb oʻylashi mumkin. Temir va A vitaminining ortiqcha miqdori bolalar uchun ayniqsa xavfli.",
            "Bolada allergiya, surunkali kasallik boʻlsa yoki u doimiy dori ichsa — har qanday qoʻshimchani faqat pediatr bilan kelishib bering. Isitma boʻlganda haroratni elektron termometr bilan oʻlchang va shifokorga murojaat qiling.",
          ],
          ru: [
            "Храните витамины там, где ребёнок их не достанет: из-за сладкого вкуса он может принять их за конфеты. Передозировка железа и витамина A особенно опасна для детей.",
            "Если у ребёнка аллергия, хроническое заболевание или он постоянно принимает лекарства — любые добавки только по согласованию с педиатром. При жаре измеряйте температуру электронным термометром и обращайтесь к врачу.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Bolaga vitaminni qancha muddat berish kerak? Kurs davomiyligi qadoqda yoki pediatr tavsiyasida koʻrsatiladi. Odatda 1–2 oylik kursdan keyin tanaffus qilinadi.",
            "Kattalar vitaminini yarim dozada bersa boʻladimi? Yoʻq. Bolalar formulalari yoshga mos miqdor va shakl bilan ishlab chiqiladi; kattalar tabletkasini boʻlish dozani notoʻgʻri qiladi.",
            "Vitamin ichsa ishtaha ochiladimi? Ishtahaning yoʻqligi turli sabablarga bogʻliq. Vitamin buni hal qilishiga vaʼda berib boʻlmaydi — sababini pediatr bilan aniqlang.",
            "Qaysi vaqtda bergan maʼqul? Ertalab yoki tushlikda, ovqat bilan. Kechqurun berilganda ayrim bolalar kech uxlashi mumkin."
          ],
          ru: [
            "Сколько давать ребёнку витамины? Длительность курса указана на упаковке или в рекомендации педиатра. Обычно после курса 1–2 месяца делают перерыв.",
            "Можно ли дать взрослые витамины в половинной дозе? Нет. Детские формулы рассчитаны на возраст по дозе и форме; деление взрослой таблетки даёт неверную дозу.",
            "Появится ли аппетит от витаминов? Отсутствие аппетита бывает по разным причинам. Обещать, что витамины это решат, нельзя — причину выясняйте с педиатром.",
            "В какое время лучше давать? Утром или в обед, во время еды. При вечернем приёме некоторые дети позже засыпают."
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-kids-multivitamins-20", "dr-frei-thermometer-t30", "dr-frei-turbo-lex-ingalyator"],
  },
  {
    slug: "homiladorlikda-qaysi-vitaminlar-kerak",
    date: "2026-11-10",
    imageSeed: "blog-pregnancy",
    category: { uz: "Homiladorlik", ru: "Беременность" },
    categoryKey: "pregnancy",
    title: {
      uz: "Homiladorlikda qaysi vitaminlar kerak",
      ru: "Какие витамины нужны при беременности",
    },
    excerpt: {
      uz: "Homiladorlikni rejalashtirishdan tugʻruqqacha: qaysi vitamin va minerallarga eʼtibor beriladi va nega dozani shifokor belgilaydi.",
      ru: "От планирования до родов: на какие витамины и минералы обращают внимание и почему дозу подбирает врач.",
    },
    sections: [
      {
        heading: { uz: "Foliy kislotasi — rejalashtirishdan", ru: "Фолиевая кислота — с планирования" },
        paragraphs: {
          uz: [
            "Jahon sogʻliqni saqlash tashkiloti homiladorlikni rejalashtirayotgan ayollarga kuniga 400 mkg foliy kislotasini homiladorlikdan oldin boshlab, birinchi trimestr oxirigacha ichishni tavsiya qiladi. Foliy kislotasi hujayralar boʻlinishida ishtirok etadi.",
            "Rejalashtirilmagan homiladorlikda ham uni iloji boricha erta boshlash tavsiya etiladi. Ayrim hollarda shifokor yuqoriroq dozani buyuradi — bu faqat uning qarori bilan.",
          ],
          ru: [
            "Всемирная организация здравоохранения рекомендует женщинам, планирующим беременность, принимать 400 мкг фолиевой кислоты в день — начиная до беременности и до конца первого триместра. Фолиевая кислота участвует в делении клеток.",
            "При незапланированной беременности её советуют начать как можно раньше. В отдельных случаях врач назначает более высокую дозу — только по его решению.",
          ],
        },
      },
      {
        heading: { uz: "Temir va yod", ru: "Железо и йод" },
        paragraphs: {
          uz: [
            "Homiladorlikda qon hajmi oshadi va temirga ehtiyoj koʻpayadi. Temir preparatining dozasi qon tahliliga (gemoglobin, ferritin) qarab belgilanadi — oʻzboshimchalik bilan katta doza ichish oshqozonni bezovta qilishi mumkin.",
            "Yod qalqonsimon bez gormonlari uchun kerak. Homilador va emizikli ayollar uchun yod ehtiyoji yuqoriroq; yodlangan tuz va shifokor tavsiyasi bilan qoʻshimcha manba hisobga olinadi.",
          ],
          ru: [
            "При беременности объём крови растёт, и потребность в железе увеличивается. Доза железа подбирается по анализам (гемоглобин, ферритин) — большие дозы по собственному решению могут раздражать желудок.",
            "Йод нужен для гормонов щитовидной железы. У беременных и кормящих потребность в йоде выше; учитываются йодированная соль и дополнительный источник по рекомендации врача.",
          ],
        },
      },
      {
        heading: { uz: "D vitamini va omega-3", ru: "Витамин D и омега-3" },
        paragraphs: {
          uz: [
            "D vitamini kalsiy almashinuvi uchun kerak, uning darajasi koʻpincha qishda pasayadi. Omega-3 (ayniqsa DHA) ham homiladorlikda koʻp muhokama qilinadigan moddadir. Ikkalasining dozasini ham shifokor tahlil va ovqatlanishga qarab tanlaydi.",
          ],
          ru: [
            "Витамин D нужен для обмена кальция, и его уровень часто падает зимой. Омега-3 (особенно DHA) — тоже вещество, которое часто обсуждают при беременности. Дозу обоих врач подбирает по анализам и питанию.",
          ],
        },
      },
      {
        heading: { uz: "Nimadan ehtiyot boʻlish kerak", ru: "Чего стоит остерегаться" },
        paragraphs: {
          uz: [
            "A vitaminining (retinol) yuqori dozasi homiladorlikda xavfli boʻlishi mumkin, shuning uchun oddiy multivitaminlar emas, homiladorlar uchun maxsus formulalar tanlanadi. Bir vaqtda bir nechta kompleksni ichmang — tarkiblar takrorlanib, meʼyordan oshib ketadi.",
            "Swiss Energy Prenatal Forte — homiladorlar uchun 20 ta vitamin va mineral, 400 mkg folat va 14 mg temir, 60 kapsula. Har qanday kompleksni ginekolog bilan kelishib boshlang.",
          ],
          ru: [
            "Высокие дозы витамина A (ретинола) при беременности могут быть опасны, поэтому выбирают не обычные мультивитамины, а специальные формулы для беременных. Не принимайте несколько комплексов одновременно — составы повторяются, и норма превышается.",
            "Swiss Energy Prenatal Forte — 20 витаминов и минералов для беременных, 400 мкг фолата и 14 мг железа, 60 капсул. Любой комплекс начинайте по согласованию с гинекологом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Foliy kislotasini qachon boshlash kerak? Ideal holda homiladorlikdan kamida bir oy oldin. Rejalashtirish bosqichida ginekolog bilan maslahatlashing.",
            "Prenatal kompleks bilan alohida temir ham ichish kerakmi? Bu qon tahliliga bogʻliq. Gemoglobin yoki ferritin past boʻlsa, shifokor qoʻshimcha temir buyurishi mumkin; oʻzboshimchalik bilan qoʻshmang.",
            "Koʻngil aynishida vitaminni qanday ichish kerak? Kapsulani ovqat bilan yoki kechqurun ichish qulayroq boʻlishi mumkin. Agar qusish tufayli ichib boʻlmasa, shifokorga ayting.",
            "Emizish davrida ham ichish kerakmi? Koʻplab ayollarga emizish davrida ham prenatal kompleksni davom ettirish tavsiya etiladi. Qaror — shifokor bilan."
          ],
          ru: [
            "Когда начинать фолиевую кислоту? В идеале — минимум за месяц до беременности. На этапе планирования посоветуйтесь с гинекологом.",
            "Нужно ли отдельно железо вместе с пренатальным комплексом? Зависит от анализа крови. При низком гемоглобине или ферритине врач может назначить дополнительное железо; не добавляйте его сами.",
            "Как принимать витамины при тошноте? Капсулу может быть удобнее пить во время еды или вечером. Если из-за рвоты принимать не получается — скажите врачу.",
            "Нужно ли пить их во время кормления грудью? Многим женщинам советуют продолжать пренатальный комплекс и во время кормления. Решение — вместе с врачом."
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-prenatal-forte-60", "swiss-energy-calcivit-30"],
  },
  {
    slug: "kollagen-qanday-ichiladi",
    date: "2026-11-10",
    imageSeed: "blog-collagen",
    category: { uz: "Goʻzallik", ru: "Красота" },
    categoryKey: "nutrition",
    title: {
      uz: "Kollagen: kukun yoki kapsula, qanday ichiladi",
      ru: "Коллаген: порошок или капсулы, как принимать",
    },
    excerpt: {
      uz: "Kollagen — teri, pay va suyakdagi asosiy oqsil. Gidrolizlangan kollagen, kunlik miqdor, kukunning afzalligi va C vitamini haqida.",
      ru: "Коллаген — главный белок кожи, связок и костей. О гидролизованном коллагене, суточном количестве, плюсах порошка и витамине C.",
    },
    sections: [
      {
        heading: { uz: "Kollagen nima", ru: "Что такое коллаген" },
        paragraphs: {
          uz: [
            "Kollagen — organizmdagi eng koʻp tarqalgan oqsil. U teri, pay, boʻgʻim togʻayi, suyak va qon tomirlari devorining tarkibida boʻladi. Yosh oʻtgan sari organizmning oʻzi ishlab chiqaradigan kollagen miqdori kamayadi.",
            "Qoʻshimchalarda odatda gidrolizlangan kollagen (kollagen peptidlari) ishlatiladi: oqsil mayda boʻlaklarga ajratilgan, suvda yaxshi eriydi va taʼmi neytral boʻladi.",
          ],
          ru: [
            "Коллаген — самый распространённый белок в организме. Он входит в состав кожи, связок, хряща суставов, костей и стенок сосудов. С возрастом организм вырабатывает его меньше.",
            "В добавках обычно используют гидролизованный коллаген (коллагеновые пептиды): белок расщеплён на мелкие фрагменты, хорошо растворяется в воде и имеет нейтральный вкус.",
          ],
        },
      },
      {
        heading: { uz: "Kukun yoki kapsula", ru: "Порошок или капсулы" },
        paragraphs: {
          uz: [
            "Tadqiqotlarda kollagen odatda kuniga bir necha gramm miqdorida oʻrganiladi. Bitta kapsulada esa bor-yoʻgʻi 0,5–1 g sigʻadi, yaʼni shu miqdorni olish uchun koʻp kapsula kerak boʻladi. Kukunda kunlik miqdor bitta oʻlchov qoshigʻida.",
            "Swiss Energy Nature Collagen — 100% sof kollagen kukuni, neytral taʼmli va shakarsiz, 240 g. Uni suv, choy, qahva, smuzi yoki qatiqqa qoʻshish mumkin.",
          ],
          ru: [
            "В исследованиях коллаген обычно изучают в количестве нескольких граммов в день. В одну капсулу помещается лишь 0,5–1 г, то есть для такого количества нужно много капсул. В порошке суточная порция — одна мерная ложка.",
            "Swiss Energy Nature Collagen — порошок из 100% чистого коллагена, с нейтральным вкусом и без сахара, 240 г. Его можно добавлять в воду, чай, кофе, смузи или кефир.",
          ],
        },
      },
      {
        heading: { uz: "C vitamini bilan birga", ru: "Вместе с витамином C" },
        paragraphs: {
          uz: [
            "C vitamini organizmda kollagenning meʼyoriy hosil boʻlishida ishtirok etadi. Shuning uchun kollagenni C vitaminiga boy ovqat (sitrus mevalar, qalampir, kivi) yoki C vitamini qoʻshimchasi bilan birga qabul qilish odatiy amaliyot.",
          ],
          ru: [
            "Витамин C участвует в нормальном образовании коллагена в организме. Поэтому коллаген часто принимают вместе с едой, богатой витамином C (цитрусовые, перец, киви), или с добавкой витамина C.",
          ],
        },
      },
      {
        heading: { uz: "Nimani kutish kerak va kimga ehtiyot", ru: "Чего ждать и кому осторожно" },
        paragraphs: {
          uz: [
            "Kollagen dori emas va bir haftada natija bermaydi. Uni odatda kamida 8–12 hafta muntazam ichishadi; natija har kimda turlicha. Yetarli suv ichish, uyqu va quyoshdan himoya ham teri holatiga taʼsir qiladi.",
            "Kollagen manbasiga (baliq, mol) allergiyasi bor odamlar, buyrak kasalligi boʻlganlar, homilador va emizikli ayollar uni shifokor bilan kelishib qabul qilishi kerak.",
          ],
          ru: [
            "Коллаген — не лекарство и не даёт результата за неделю. Его обычно принимают регулярно не меньше 8–12 недель; результат у всех разный. На состояние кожи влияют и достаточное количество воды, сон и защита от солнца.",
            "Людям с аллергией на источник коллагена (рыба, говядина), с заболеваниями почек, беременным и кормящим принимать его стоит по согласованию с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Kollagenni qachon ichgan maʼqul? Kunning istalgan vaqtida, eng muhimi — har kuni. Koʻpchilik uni ertalabki qahva yoki choyga qoʻshadi.",
            "Issiq ichimlikka qoʻshsa boʻladimi? Ha, gidrolizlangan kollagen issiq suvda eriydi. Faqat qaynab turgan ichimlikka emas, biroz sovigan ichimlikka qoʻshgan qulay.",
            "Kollagen va gialuron kislotasi farqi nima? Kollagen — oqsil, gialuron kislotasi esa namlikni ushlab turadigan modda. Ular turli vazifani bajaradi va baʼzan birga ishlatiladi.",
            "Erkaklar ham ichsa boʻladimi? Ha, kollagen jinsga bogʻliq emas. Sport bilan shugʻullanadiganlar uni ham koʻpincha ratsionga qoʻshadi."
          ],
          ru: [
            "Когда лучше пить коллаген? В любое время дня, главное — каждый день. Многие добавляют его в утренний кофе или чай.",
            "Можно ли добавлять в горячий напиток? Да, гидролизованный коллаген растворяется в горячей воде. Удобнее добавлять не в кипящий, а в немного остывший напиток.",
            "Чем коллаген отличается от гиалуроновой кислоты? Коллаген — белок, а гиалуроновая кислота — вещество, удерживающее влагу. У них разные задачи, иногда их принимают вместе.",
            "Можно ли мужчинам? Да, коллаген не зависит от пола. Его часто добавляют в рацион и те, кто занимается спортом."
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-nature-collagen", "swiss-energy-hair-nail-skin-30", "swiss-energy-vitamin-c-20"],
  },
  {
    slug: "tonometrni-qanday-tanlash",
    date: "2026-11-10",
    imageSeed: "blog-tonometer",
    category: { uz: "Tibbiy jihozlar", ru: "Медтехника" },
    categoryKey: "science",
    title: {
      uz: "Tonometrni qanday tanlash va bosimni oʻlchash",
      ru: "Как выбрать тонометр и правильно мерить давление",
    },
    excerpt: {
      uz: "Mexanik va avtomatik tonometr farqi, manjeta oʻlchami va uyda bosimni toʻgʻri oʻlchash qoidalari.",
      ru: "Чем отличаются механический и автоматический тонометры, как выбрать манжету и правила измерения давления дома.",
    },
    sections: [
      {
        heading: { uz: "Mexanik yoki avtomatik", ru: "Механический или автоматический" },
        paragraphs: {
          uz: [
            "Mexanik tonometrda havo grusha bilan haydaladi, bosim esa stetoskop orqali tonlarni eshitib aniqlanadi. U arzonroq, batareyasiz ishlaydi va aniq, lekin koʻnikma talab qiladi — odatda uni shifokorlar va tibbiy xodimlar ishlatadi.",
            "Avtomatik tonometr manjetani oʻzi toʻldiradi va natijani ekranda koʻrsatadi. Uyda mustaqil oʻlchash uchun eng qulayi shu. Yelkaga taqiladigan modellar bilakdagiga qaraganda koʻpincha aniqroq natija beradi.",
          ],
          ru: [
            "В механическом тонометре воздух нагнетают грушей, а давление определяют по тонам через стетоскоп. Он дешевле, работает без батареек и точен, но требует навыка — обычно им пользуются врачи и медработники.",
            "Автоматический тонометр сам накачивает манжету и показывает результат на экране. Для самостоятельных измерений дома он удобнее всего. Модели на плечо обычно точнее запястных.",
          ],
        },
      },
      {
        heading: { uz: "Manjeta oʻlchami", ru: "Размер манжеты" },
        paragraphs: {
          uz: [
            "Manjeta qoʻl aylanasiga mos boʻlishi kerak: tor manjeta bosimni yuqori, keng manjeta esa past koʻrsatadi. Sotib olishdan oldin yelkaning oʻrta qismi aylanasini santimetr tasma bilan oʻlchang va qadoqdagi diapazon bilan solishtiring.",
          ],
          ru: [
            "Манжета должна подходить по обхвату руки: узкая завышает давление, широкая занижает. Перед покупкой измерьте обхват середины плеча сантиметровой лентой и сравните с диапазоном на упаковке.",
          ],
        },
      },
      {
        heading: { uz: "Uyda qanday toʻgʻri oʻlchash", ru: "Как правильно измерять дома" },
        paragraphs: {
          uz: [
            "Oʻlchashdan 30 daqiqa oldin qahva ichmang, chekmang va jismoniy mashq qilmang. 5 daqiqa tinch oʻtiring, orqangizni suyang, oyoqlarni chalishtirmang. Qoʻl stolda, manjeta yurak darajasida boʻlsin.",
            "1–2 daqiqa oraliq bilan 2 marta oʻlchab, oʻrtachasini yozing. Bosimni har kuni bir vaqtda — ertalab va kechqurun — oʻlchab, kundalik yuritsangiz, shifokor uchun eng foydali maʼlumot shu boʻladi.",
          ],
          ru: [
            "За 30 минут до измерения не пейте кофе, не курите и не занимайтесь спортом. Посидите спокойно 5 минут, облокотившись на спинку, не скрещивая ноги. Рука на столе, манжета на уровне сердца.",
            "Измерьте 2 раза с интервалом 1–2 минуты и запишите среднее. Если измерять давление каждый день в одно время — утром и вечером — и вести дневник, это будут самые полезные данные для врача.",
          ],
        },
      },
      {
        heading: { uz: "Raqamlar nimani bildiradi", ru: "Что означают цифры" },
        paragraphs: {
          uz: [
            "Kattalarda 120/80 mm sim. ust. dan past bosim optimal hisoblanadi. Uyda bir necha kun davomida 135/85 va undan yuqori koʻrsatkichlar takrorlansa yoki kuchli bosh ogʻrigʻi, koʻkrakda ogʻriq paydo boʻlsa — shifokorga murojaat qiling. Tonometr kuzatish vositasi, tashxis va dori dozasini faqat shifokor belgilaydi.",
          ],
          ru: [
            "У взрослых давление ниже 120/80 мм рт. ст. считается оптимальным. Если дома несколько дней подряд показатели 135/85 и выше или появились сильная головная боль, боль в груди — обратитесь к врачу. Тонометр — средство наблюдения, диагноз и дозы лекарств определяет только врач.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Qaysi qoʻlda oʻlchash kerak? Birinchi marta ikkala qoʻlda oʻlchang. Keyin koʻrsatkich yuqoriroq chiqqan qoʻlda oʻlchashni davom ettiring.",
            "Nega har safar natija har xil chiqadi? Bosim kun davomida oʻzgaradi: harakat, hayajon, qahva taʼsir qiladi. Shuning uchun bitta oʻlchov emas, bir necha kunlik oʻrtacha muhim.",
            "Tonometrni qanchada bir tekshirish kerak? Ishlab chiqaruvchi tavsiyasiga qarang; odatda 1–2 yilda bir marta metrologik tekshiruv qilinadi. Mexanik tonometr strelkasi nolda turishi kerak.",
            "Keksalar uchun qaysi biri qulay? Katta ekranli, bitta tugmali avtomatik tonometr. Mexanik modelni uydagi boshqa oila aʼzosi yoki hamshira ishlatsa qulay."
          ],
          ru: [
            "На какой руке измерять? В первый раз измерьте на обеих. Дальше измеряйте на той руке, где показатель выше.",
            "Почему каждый раз разные цифры? Давление меняется в течение дня: влияют движение, волнение, кофе. Поэтому важно не одно измерение, а среднее за несколько дней.",
            "Как часто проверять тонометр? Смотрите рекомендацию производителя; обычно метрологическую проверку делают раз в 1–2 года. Стрелка механического тонометра должна стоять на нуле.",
            "Какой удобнее пожилым? Автоматический с большим экраном и одной кнопкой. Механической моделью удобно пользоваться, если измеряет другой член семьи или медсестра."
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-tonometr-a20"],
  },
  {
    slug: "ingalyator-nebulayzer-tanlash",
    date: "2026-11-10",
    imageSeed: "blog-inhaler",
    category: { uz: "Tibbiy jihozlar", ru: "Медтехника" },
    categoryKey: "science",
    title: {
      uz: "Nebulayzer (ingalyator) qanday tanlanadi",
      ru: "Как выбрать ингалятор-небулайзер",
    },
    excerpt: {
      uz: "Bugʻ ingalyatori va nebulayzer farqi, kompressorli modelning afzalligi, bolaga qanday tanlash va apparatni toʻgʻri tozalash.",
      ru: "Чем паровой ингалятор отличается от небулайзера, плюсы компрессорной модели, как выбрать для ребёнка и как правильно ухаживать.",
    },
    sections: [
      {
        heading: { uz: "Nebulayzer nima", ru: "Что такое небулайзер" },
        paragraphs: {
          uz: [
            "Nebulayzer suyuq eritmani juda mayda zarrachalarga aylantirib, aerozol hosil qiladi — u nafas bilan ichkariga kiradi. Bugʻ ingalyatoridan farqli ravishda eritma qizdirilmaydi, shuning uchun shifokor buyurgan dori eritmalari bilan ishlatiladi.",
            "Kompressorli nebulayzer havo kompressori yordamida ishlaydi. U koʻpchilik eritmalar bilan ishlay oladi va mustahkam, lekin biroz shovqinli boʻladi.",
          ],
          ru: [
            "Небулайзер превращает жидкий раствор в очень мелкие частицы — аэрозоль, который вдыхается. В отличие от парового ингалятора, раствор не нагревается, поэтому прибор используют с растворами лекарств, назначенными врачом.",
            "Компрессорный небулайзер работает с помощью воздушного компрессора. Он подходит для большинства растворов и надёжен, но немного шумит.",
          ],
        },
      },
      {
        heading: { uz: "Bolalar uchun qanday tanlash", ru: "Как выбрать для ребёнка" },
        paragraphs: {
          uz: [
            "Toʻplamda bolalar niqobi borligiga qarang: niqob yuzga zich yopishishi kerak. Kichik bolalar uchun shovqin va koʻrinish ham muhim — qiziqarli dizayndagi apparat jarayonni osonlashtiradi. Masalan, Dr. Frei Turbo Lex mashina shaklida va tinch ishlaydi.",
            "Kattalar va butun oila uchun universal kompressorli model — Dr. Frei Turbo Base: toʻplamda kattalar va bolalar niqoblari bor.",
          ],
          ru: [
            "Проверьте, есть ли в комплекте детская маска: она должна плотно прилегать к лицу. Маленьким детям важны и шум, и внешний вид — прибор с интересным дизайном облегчает процедуру. Например, Dr. Frei Turbo Lex сделан в форме машинки и работает тихо.",
            "Универсальная компрессорная модель для взрослых и всей семьи — Dr. Frei Turbo Base: в комплекте маски для взрослых и детей.",
          ],
        },
      },
      {
        heading: { uz: "Nimani quyish mumkin emas", ru: "Что нельзя заливать" },
        paragraphs: {
          uz: [
            "Nebulayzerga faqat shifokor buyurgan eritmalar va fiziologik eritma quyiladi. Efir moylari, oʻt damlamalari, siroplar va uyda tayyorlangan eritmalarni quymang — ular apparatni buzadi va nafas yoʻllari uchun xavfli boʻlishi mumkin.",
          ],
          ru: [
            "В небулайзер заливают только назначенные врачом растворы и физраствор. Не используйте эфирные масла, травяные отвары, сиропы и самодельные растворы — они портят прибор и могут быть опасны для дыхательных путей.",
          ],
        },
      },
      {
        heading: { uz: "Parvarish", ru: "Уход" },
        paragraphs: {
          uz: [
            "Har ishlatishdan keyin dori idishi, niqob va naychani iliq suv bilan yuving va toʻliq quriting. Havo filtrini qoʻllanmada koʻrsatilgan muddatda almashtiring. Har bir oila aʼzosi uchun alohida niqob ishlatgan maʼqul.",
          ],
          ru: [
            "После каждого использования промывайте ёмкость для лекарства, маску и трубку тёплой водой и полностью сушите. Меняйте воздушный фильтр в срок, указанный в инструкции. Каждому члену семьи лучше пользоваться своей маской.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Bugʻ ingalyatoridan nimasi farq qiladi? Bugʻ ingalyatori suvni qizdiradi va bugʻ hosil qiladi. Nebulayzer esa eritmani qizdirmasdan mayda aerozolga aylantiradi, shuning uchun dori eritmalari bilan ishlay oladi.",
            "Uxlab yotgan bolaga qilsa boʻladimi? Ayrim tinch ishlaydigan modellar bilan bu mumkin, lekin muolaja holati va davomiyligini shifokor bilan kelishing.",
            "Bir muolaja qancha davom etadi? Odatda 5–10 daqiqa, eritma miqdori va apparatga bogʻliq. Aniq vaqtni shifokor tavsiyasi va qoʻllanma belgilaydi.",
            "Niqob yoki mundshtuk? Kichik bolalar uchun niqob qulayroq. Kattalar va katta yoshdagi bolalar uchun mundshtuk koʻproq eritmani nafas yoʻllariga yetkazadi."
          ],
          ru: [
            "Чем отличается от парового ингалятора? Паровой ингалятор нагревает воду и даёт пар. Небулайзер превращает раствор в мелкий аэрозоль без нагрева, поэтому работает с растворами лекарств.",
            "Можно ли делать ингаляцию спящему ребёнку? С некоторыми тихими моделями это возможно, но положение и длительность процедуры согласуйте с врачом.",
            "Сколько длится одна процедура? Обычно 5–10 минут, в зависимости от объёма раствора и прибора. Точное время определяют рекомендация врача и инструкция.",
            "Маска или мундштук? Маленьким детям удобнее маска. Взрослым и детям постарше мундштук доставляет больше раствора в дыхательные пути."
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-turbo-base-ingalyator", "dr-frei-turbo-lex-ingalyator"],
  },
];
