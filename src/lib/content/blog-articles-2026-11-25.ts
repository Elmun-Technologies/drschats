import type { RawArticle } from "./blog";

/*
  SEO batch, 2026-11-25. General guidance only, no promise of effect (blog.test.ts runs the
  claim checks). Sources: American Academy of Sleep Medicine guidance on screens before bed,
  EFSA authorised claims (magnesium, B vitamins — psychological function, tiredness), NHS pages
  on cold hands and Raynaud's phenomenon, WHO guidance on daily water intake for adults.
  Photos: Adobe Stock bank, docs/IMAGE-BANK.md.
*/
export const articlesNov2026i: RawArticle[] = [
  {
    slug: "imtihon-davrida-talaba-ovqatlanishi-va-uyqusi",
    date: "2026-11-25",
    imageSeed: "bank3-student",
    category: { uz: "Uyqu va stress", ru: "Сон и стресс" },
    categoryKey: "lifestyle",
    title: {
      uz: "Imtihon davrida talaba: uyqu, ovqat va diqqat",
      ru: "Студент в сессию: сон, еда и концентрация",
    },
    excerpt: {
      uz: "Tunda oʻqish nega natija bermaydi, miya uchun qanday nonushta qulay, kofeinni qancha ichish mumkin va B vitaminlari hamda magniy qayerdan olinadi.",
      ru: "Почему ночная зубрёжка не работает, какой завтрак удобен для учёбы, сколько кофеина можно и где взять витамины группы B и магний.",
    },
    sections: [
      {
        heading: { uz: "Uyqu — oʻqishning bir qismi", ru: "Сон — часть учёбы" },
        paragraphs: {
          uz: [
            "Kun davomida oʻrganilgan maʼlumot uyqu paytida mustahkamlanadi. Shuning uchun imtihon oldidan tunni bedor oʻtkazish koʻpincha foyda emas, zarar beradi: ertasi kuni diqqat va xotira sustlashadi.",
            "Imtihon davrida ham kechasi 7–9 soat uxlashga harakat qiling, har kuni bir vaqtda yoting va turing. Uxlashdan bir soat oldin telefon va noutbukni chetga qoʻying — ekran yorugʻligi uyquga ketishni kechiktiradi.",
          ],
          ru: [
            "Информация, выученная за день, закрепляется во время сна. Поэтому бессонная ночь перед экзаменом чаще вредит, чем помогает: на следующий день страдают внимание и память.",
            "Даже в сессию старайтесь спать 7–9 часов ночью, ложитесь и вставайте в одно время. За час до сна отложите телефон и ноутбук — свет экрана откладывает засыпание.",
          ],
        },
      },
      {
        heading: { uz: "Nonushta va kun davomida ovqat", ru: "Завтрак и еда в течение дня" },
        paragraphs: {
          uz: [
            "Nonushtani tashlab ketmang. Boʻtqa yoki toʻliq donli non, tuxum yoki tvorog, meva — bu toʻyimli va uzoq vaqt quvvat beradigan kombinatsiya. Shirinlik va shirin ichimliklar tez quvvat beradi, lekin bir soatdan keyin charchoq qaytadi.",
            "Har 3–4 soatda yengil ovqatlaning: yongʻoq, meva, qatiq. Kun davomida suv iching — ozgina suvsizlanish ham bosh ogʻrigʻi va diqqat pasayishiga olib keladi.",
          ],
          ru: [
            "Не пропускайте завтрак. Каша или цельнозерновой хлеб, яйцо или творог, фрукт — сытное сочетание, которое даёт энергию надолго. Сладости и сладкие напитки дают быструю энергию, но через час усталость возвращается.",
            "Перекусывайте каждые 3–4 часа: орехи, фрукты, кефир. Пейте воду в течение дня — даже лёгкое обезвоживание приводит к головной боли и снижению внимания.",
          ],
        },
      },
      {
        heading: { uz: "Kofein: qancha va qachon", ru: "Кофеин: сколько и когда" },
        paragraphs: {
          uz: [
            "Kattalar uchun kuniga 400 mg gacha kofein (taxminan 3–4 piyola qahva) xavfsiz hisoblanadi. Energetiklar koʻp miqdorda kofein va shakar beradi — ularni bir necha marta ketma-ket ichish yurak urishini tezlashtiradi va uyquni buzadi.",
            "Kofein taʼsiri 5–6 soat davom etadi, shuning uchun soat 15:00 dan keyin qahva ichmaslik kechasi uxlashni osonlashtiradi.",
          ],
          ru: [
            "Для взрослых безопасным считается до 400 мг кофеина в день (примерно 3–4 чашки кофе). Энергетики дают много кофеина и сахара — несколько банок подряд учащают сердцебиение и сбивают сон.",
            "Кофеин действует 5–6 часов, поэтому, если не пить кофе после 15:00, ночью легче уснуть.",
          ],
        },
      },
      {
        heading: { uz: "B vitaminlari va magniy", ru: "Витамины группы B и магний" },
        paragraphs: {
          uz: [
            "B1, B6, B12 vitaminlari va magniy normal psixologik faoliyatga hamda charchoqni kamaytirishga hissa qoʻshadi. Ular toʻliq donli mahsulotlar, dukkaklilar, tuxum, goʻsht, yongʻoq va bananda bor.",
            "Ovqatlanish imtihon paytida bir xil boʻlib qolsa, B-kompleks yoki magniy qoʻshimchasi qulay boʻlishi mumkin. Lekin u uyqu va toʻyimli ovqatning oʻrnini bosmaydi. Qoʻshimcha — biologik faol qoʻshimcha, dori vositasi emas.",
          ],
          ru: [
            "Витамины B1, B6, B12 и магний способствуют нормальной психологической функции и снижению усталости. Они есть в цельнозерновых продуктах, бобовых, яйцах, мясе, орехах и бананах.",
            "Если в сессию питание стало однообразным, может быть удобен B-комплекс или магний. Но они не заменяют сон и полноценную еду. Добавка — биологически активная добавка, а не лекарство.",
          ],
        },
      },
      {
        heading: { uz: "Qachon yordam soʻrash kerak", ru: "Когда обратиться за помощью" },
        paragraphs: {
          uz: [
            "Haftalar davomida uxlay olmasangiz, ishtaha yoʻqolsa, doimiy xavotir yoki tushkunlik his qilsangiz — buni yolgʻiz koʻtarmang. Yaqinlaringizga, universitet psixologiga yoki shifokorga murojaat qiling.",
          ],
          ru: [
            "Если неделями не удаётся уснуть, пропал аппетит, вы постоянно чувствуете тревогу или подавленность — не справляйтесь с этим в одиночку. Поговорите с близкими, психологом вуза или врачом.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-neuroforce-30", "dr-frei-antistress-magniy-20", "dr-frei-multivitamins-biotin-20"],
    relatedArticleSlugs: ["b-vitaminlari-nima-uchun-kerak", "kuniga-qancha-qahva-ichsa-boladi", "magniy-va-uyqu"],
  },
  {
    slug: "telefon-va-uyqu-ekran-yorugligi",
    date: "2026-11-25",
    imageSeed: "bank3-phone-bed",
    category: { uz: "Uyqu va stress", ru: "Сон и стресс" },
    categoryKey: "lifestyle",
    title: {
      uz: "Yotishdan oldin telefon: ekran va uyqu",
      ru: "Телефон перед сном: как экран влияет на сон",
    },
    excerpt: {
      uz: "Ekran yorugʻligi va lentani aylantirish uyquni qanday kechiktiradi, «tungi rejim» yetarlimi va uxlashdan oldingi bir soatni qanday oʻtkazish kerak.",
      ru: "Как свет экрана и бесконечная лента откладывают сон, достаточно ли «ночного режима» и как провести час перед сном.",
    },
    sections: [
      {
        heading: { uz: "Nega telefon uyquni kechiktiradi", ru: "Почему телефон откладывает сон" },
        paragraphs: {
          uz: [
            "Kechqurun qorongʻilashganda organizm melatonin ishlab chiqara boshlaydi — bu uyquga tayyorlanish signali. Ekranning yorqin, ayniqsa koʻk-oq yorugʻligi bu jarayonni kechiktirishi mumkin.",
            "Faqat yorugʻlik emas: yangiliklar, xabarlar va qisqa videolar miyani faol ushlab turadi. «Yana bitta video» deb yarim soat oʻtib ketadi, uyqu esa qisqaradi.",
          ],
          ru: [
            "Когда вечером темнеет, организм начинает вырабатывать мелатонин — сигнал готовиться ко сну. Яркий, особенно сине-белый свет экрана может откладывать этот процесс.",
            "Дело не только в свете: новости, сообщения и короткие видео держат мозг в активном состоянии. «Ещё одно видео» — и проходит полчаса, а сон становится короче.",
          ],
        },
      },
      {
        heading: { uz: "«Tungi rejim» yetarlimi", ru: "Достаточно ли «ночного режима»" },
        paragraphs: {
          uz: [
            "Iliq ranglar rejimi yorugʻlikni biroz yumshatadi, lekin muammoning faqat bir qismini hal qiladi. Asosiysi — uxlashdan oldin ekranga qarash vaqtini qisqartirish va telefonni yotoqdan uzoqroqqa qoʻyish.",
          ],
          ru: [
            "Тёплый режим цветов немного смягчает свет, но решает только часть проблемы. Главное — сократить время у экрана перед сном и держать телефон подальше от кровати.",
          ],
        },
      },
      {
        heading: { uz: "Uxlashdan oldingi bir soat", ru: "Час перед сном" },
        paragraphs: {
          uz: [
            "Uxlashdan 30–60 daqiqa oldin telefonni chetga qoʻying va budilnikni oddiy soatda qoʻying. Xonani qorongʻi, salqin (18–20 °C) va jim qiling. Bu vaqtni kitob, iliq dush, yengil choʻzilish yoki ertangi rejani yozish bilan oʻtkazing.",
            "Har kuni bir vaqtda yotish va turish — dam olish kunlari ham — ichki soatni tartibga soladi. Kechqurun ogʻir ovqat, kofein va energetiklardan saqlaning.",
          ],
          ru: [
            "За 30–60 минут до сна отложите телефон и поставьте будильник на обычных часах. Сделайте комнату тёмной, прохладной (18–20 °C) и тихой. Проведите это время с книгой, тёплым душем, лёгкой растяжкой или запишите план на завтра.",
            "Ложиться и вставать в одно время каждый день, включая выходные, помогает настроить внутренние часы. Вечером избегайте тяжёлой еды, кофеина и энергетиков.",
          ],
        },
      },
      {
        heading: { uz: "Magniy va uyqu", ru: "Магний и сон" },
        paragraphs: {
          uz: [
            "Magniy asab tizimining normal faoliyatiga va normal psixologik faoliyatga hissa qoʻshadi. U yongʻoq, urugʻlar, dukkaklilar va toʻliq donli mahsulotlarda bor. Magniy qoʻshimchasi uyqu gigiyenasining oʻrnini bosmaydi.",
          ],
          ru: [
            "Магний способствует нормальной работе нервной системы и нормальной психологической функции. Он есть в орехах, семечках, бобовых и цельнозерновых продуктах. Добавка магния не заменяет гигиену сна.",
          ],
        },
      },
      {
        heading: { uz: "Qachon shifokorga borish kerak", ru: "Когда идти к врачу" },
        paragraphs: {
          uz: [
            "Uch oydan ortiq haftasiga 3 kecha va undan koʻp uxlay olmasangiz, uyquda nafas toʻxtashi yoki kuchli xurrak boʻlsa, kunduzi rul ortida uxlab qolish xavfi tugʻilsa — terapevt yoki nevrologga murojaat qiling.",
          ],
          ru: [
            "Если больше трёх месяцев вы не можете уснуть 3 ночи в неделю и чаще, во сне бывают остановки дыхания или сильный храп, днём клонит в сон за рулём — обратитесь к терапевту или неврологу.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-antistress-magniy-20"],
    relatedArticleSlugs: ["magniy-va-uyqu", "kuniga-qancha-qahva-ichsa-boladi"],
  },
  {
    slug: "qol-oyoq-doim-sovuq-sabablari",
    date: "2026-11-25",
    imageSeed: "bank3-cold-hands",
    category: { uz: "Bilim", ru: "Знания" },
    categoryKey: "science",
    title: {
      uz: "Qoʻl-oyoq doim sovuq: sabablari va tekshiruv",
      ru: "Всегда холодные руки и ноги: причины",
    },
    excerpt: {
      uz: "Qishda qoʻl-oyoq sovushi normal, lekin xonada ham doim muzlab tursa, temir, qalqonsimon bez yoki qon aylanishini tekshirish kerak boʻlishi mumkin.",
      ru: "Зимой мёрзнуть нормально, но если руки и ноги ледяные даже в тёплой комнате, стоит проверить железо, щитовидную железу или кровообращение.",
    },
    sections: [
      {
        heading: { uz: "Nega qoʻl-oyoq tez sovuydi", ru: "Почему руки и ноги мёрзнут быстрее" },
        paragraphs: {
          uz: [
            "Sovuqda organizm issiqlikni ichki aʼzolarda saqlash uchun teridagi va barmoqlardagi qon tomirlarini toraytiradi. Shuning uchun qoʻl va oyoq birinchi boʻlib soviydi. Ayollarda, ozgʻin odamlarda va kam harakat qiladiganlarda bu koʻproq seziladi.",
          ],
          ru: [
            "На холоде организм сужает сосуды кожи и пальцев, чтобы сохранить тепло во внутренних органах. Поэтому руки и ноги остывают первыми. У женщин, худощавых людей и тех, кто мало двигается, это заметнее.",
          ],
        },
      },
      {
        heading: { uz: "Qanday sabablar boʻlishi mumkin", ru: "Какие бывают причины" },
        paragraphs: {
          uz: [
            "Temir yetishmovchiligi va kamqonlik: charchoq, rangparlik, hansirash bilan birga kelsa, gemoglobin va ferritinni tekshiring.",
            "Qalqonsimon bez faoliyati pasayishi: doimiy sovqotish, terining qurishi, vazn ortishi va lanjlik bilan kelishi mumkin — TTG tahlili koʻrsatadi.",
            "Reyno fenomeni: sovuq yoki hayajondan barmoqlar oqarib, keyin koʻkarib, qizaradi. Qandli diabet, chekish va qon tomir kasalliklari ham qon aylanishiga taʼsir qiladi.",
          ],
          ru: [
            "Дефицит железа и анемия: если вместе с этим есть усталость, бледность, одышка — проверьте гемоглобин и ферритин.",
            "Снижение функции щитовидной железы: может проявляться постоянной зябкостью, сухостью кожи, набором веса и вялостью — покажет анализ на ТТГ.",
            "Феномен Рейно: от холода или волнения пальцы белеют, затем синеют и краснеют. На кровообращение также влияют сахарный диабет, курение и болезни сосудов.",
          ],
        },
      },
      {
        heading: { uz: "Uyda nima qilish mumkin", ru: "Что можно сделать дома" },
        paragraphs: {
          uz: [
            "Qatlam-qatlam kiyining, qoʻlqop, issiq paypoq va bosh kiyim kiying — bosh va boʻyin ham koʻp issiqlik yoʻqotadi. Kun davomida harakat qiling: har soatda turib yurish va qoʻl-oyoq mashqlari qon aylanishini yaxshilaydi.",
            "Muntazam ovqatlaning va issiq ichimlik iching. Chekishni tashlash qon tomirlari uchun eng foydali qadamlardan biri.",
          ],
          ru: [
            "Одевайтесь слоями, носите перчатки, тёплые носки и шапку — голова и шея тоже теряют много тепла. Двигайтесь в течение дня: каждый час вставайте, ходите и делайте упражнения для рук и ног, это улучшает кровообращение.",
            "Питайтесь регулярно и пейте тёплые напитки. Отказ от курения — один из самых полезных шагов для сосудов.",
          ],
        },
      },
      {
        heading: { uz: "Qachon shifokorga borish kerak", ru: "Когда идти к врачу" },
        paragraphs: {
          uz: [
            "Xonada ham qoʻl-oyoq doim muzlasa, barmoqlar rangi oʻzgarsa, ogʻrisa yoki uvishsa, teri yarasi bitmasa, sovqotish charchoq va vazn oʻzgarishi bilan kelsa — terapevtga murojaat qiling. Temir yoki boshqa qoʻshimchani tahlilsiz ichmang: sababni avval aniqlash kerak.",
          ],
          ru: [
            "Если руки и ноги мёрзнут даже в помещении, пальцы меняют цвет, болят или немеют, ранки на коже плохо заживают, а зябкость сочетается с усталостью и изменением веса — обратитесь к терапевту. Не принимайте железо или другие добавки без анализов: сначала нужно выяснить причину.",
          ],
        },
      },
    ],
    relatedProductSlugs: [],
    relatedArticleSlugs: ["temir-nima-uchun-kerak", "doimiy-charchoq-qaysi-moddalar-yetishmaydi", "selen-nima-uchun-kerak"],
  },
];
