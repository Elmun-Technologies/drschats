import type { RawArticle } from "./blog";

/*
  Daily SEO batch (docs/HOLAT.md → Trafik T2). Same rules as the earlier batches: reference
  intakes and measuring technique only, no promise of effect (blog.test.ts runs the claim
  checks), every page carries the BAD notice. Sources: ESH/AHA home blood-pressure guidance,
  EFSA caffeine opinion (2015), WHO/NHS fever guidance, Minamata Convention.
*/
export const articlesNov2026c: RawArticle[] = [
  {
    slug: "qon-bosimini-uyda-togri-olchash",
    date: "2026-11-18",
    imageSeed: "blog-bp",
    category: { uz: "Tibbiy jihozlar", ru: "Медицинские приборы" },
    categoryKey: "devices",
    title: {
      uz: "Qon bosimini uyda toʻgʻri oʻlchash: 8 qadam",
      ru: "Как правильно измерять давление дома: 8 шагов",
    },
    excerpt: {
      uz: "Tonometr toʻgʻri natija berishi uchun oʻlchashdan oldin nima qilish kerak, qoʻl qanday turadi, necha marta va qachon oʻlchanadi.",
      ru: "Что сделать перед измерением, как держать руку, сколько раз и в какое время мерить, чтобы тонометр показал верный результат.",
    },
    sections: [
      {
        heading: { uz: "Nega uyda oʻlchash foydali", ru: "Зачем мерить дома" },
        paragraphs: {
          uz: [
            "Shifokor qabulida bosim koʻpincha hayajon tufayli yuqori chiqadi. Uyda tinch sharoitda bir necha kun oʻlchangan koʻrsatkichlar shifokorga haqiqiy rasmni koʻrsatadi. Shuning uchun Yevropa gipertoniya jamiyati (ESH) va Amerika yurak assotsiatsiyasi uyda oʻlchashni tavsiya qiladi.",
            "Tonometr tashxis qoʻymaydi: u faqat raqam beradi. Raqamni baholash va dori tanlash — shifokor ishi. Maqsadingiz — shifokorga ishonchli maʼlumot olib borish.",
          ],
          ru: [
            "На приёме у врача давление часто оказывается выше из-за волнения. Показатели, измеренные дома в спокойной обстановке за несколько дней, дают врачу настоящую картину. Поэтому Европейское общество гипертонии (ESH) и Американская ассоциация сердца рекомендуют домашние измерения.",
            "Тонометр не ставит диагноз: он лишь показывает цифры. Оценивать их и назначать препараты должен врач. Ваша задача — принести врачу надёжные данные.",
          ],
        },
      },
      {
        heading: { uz: "Oʻlchashdan oldin", ru: "Перед измерением" },
        paragraphs: {
          uz: [
            "Oʻlchashdan 30 daqiqa oldin qahva, choy, sigaret va jismoniy mashqdan saqlaning. Siydik pufagi toʻla boʻlsa, koʻrsatkich biroz oshishi mumkin — avval hojatga boring. Oʻlchashdan oldin 5 daqiqa tinch oʻtirib dam oling.",
            "Qulay kiyim kiying: yeng manjetni siqmasligi kerak, manjet yalang qoʻlga qoʻyiladi. Manjet oʻlchami qoʻl yoʻgʻonligiga mos boʻlishi shart: kichik manjet bosimni yuqori, katta manjet past koʻrsatishi mumkin.",
          ],
          ru: [
            "За 30 минут до измерения не пейте кофе и чай, не курите и не занимайтесь спортом. Полный мочевой пузырь может слегка завысить показатель — сначала сходите в туалет. Перед измерением спокойно посидите 5 минут.",
            "Наденьте удобную одежду: рукав не должен пережимать руку, манжета накладывается на голую руку. Размер манжеты должен соответствовать обхвату плеча: слишком маленькая завышает давление, слишком большая — занижает.",
          ],
        },
      },
      {
        heading: { uz: "Toʻgʻri holat", ru: "Правильное положение" },
        paragraphs: {
          uz: [
            "Orqangiz suyanchiqqa tegib, stulda oʻtiring, oyoqlar polda, oyoq-oyoq ustiga qoʻymang. Qoʻl stol ustida yotsin, manjet yurak sathida boʻlsin. Qoʻl yurakdan pastda tursa, koʻrsatkich yuqori chiqadi.",
            "Manjet tirsakdan 2–3 sm yuqorida, quvur esa qoʻl ichki tomonidagi arteriya ustida turishi kerak. Oʻlchash paytida gaplashmang, qimirlamang va telefonga qaramang.",
          ],
          ru: [
            "Сядьте на стул со спинкой, спина опирается, ноги стоят на полу, ноги не скрещивайте. Рука лежит на столе, манжета находится на уровне сердца. Если рука ниже сердца, показатель завышается.",
            "Манжета накладывается на 2–3 см выше локтевого сгиба, трубка — над артерией на внутренней стороне руки. Во время измерения не разговаривайте, не двигайтесь и не смотрите в телефон.",
          ],
        },
      },
      {
        heading: { uz: "Necha marta va qachon", ru: "Сколько раз и когда" },
        paragraphs: {
          uz: [
            "ESH tavsiyasi: shifokor qabulidan oldin 7 kun davomida ertalab (dori ichishdan oldin) va kechqurun, har safar 1 daqiqa oraliq bilan 2 martadan oʻlchang. Natijalarni daftarga yozing; birinchi kunni hisobga olmay, qolgan kunlarning oʻrtachasi olinadi.",
            "Koʻpincha uyda oʻrtacha 135/85 dan yuqori natija shifokorga murojaat qilish uchun sabab deb qaraladi, ammo bu faqat yoʻnalish: baholashni shifokor qiladi. Bosim juda yuqori boʻlsa yoki yomon his qilsangiz, kutmasdan shifokorga yoki tez yordamga murojaat qiling.",
          ],
          ru: [
            "Рекомендация ESH: за 7 дней до приёма врача измеряйте утром (до приёма лекарств) и вечером, по 2 раза с интервалом в 1 минуту. Записывайте результаты в дневник; берётся среднее по дням, первый день обычно не учитывают.",
            "Часто среднее домашнее значение выше 135/85 считают поводом обратиться к врачу, но это лишь ориентир: оценивает результат врач. Если давление очень высокое или вы плохо себя чувствуете, не ждите — обратитесь к врачу или вызовите скорую.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Qaysi qoʻlda oʻlchash kerak? Dastlab ikkala qoʻlda oʻlchab, koʻrsatkichi yuqori qoʻlni tanlang va doim shu qoʻlda oʻlchang. Qoʻllar orasidagi kichik farq normal holat.",
            "Natijalar har safar har xil chiqsa-chi? 5–10 mm sim ust. farq tabiiy. Katta farq boʻlsa, holatni va manjet oʻlchamini tekshiring, keyin shifokorga ayting.",
            "Tonometrni qancha vaqtda tekshirtirish kerak? Aniqligini shifokor qabulida oʻz asbobingizni olib borib, shifokor apparati bilan solishtirish mumkin. Batareya kuchsizlansa, koʻrsatkichlar buzilishi mumkin — batareyani oʻz vaqtida almashtiring.",
          ],
          ru: [
            "На какой руке мерить? Сначала измерьте на обеих руках, выберите руку с более высоким показателем и всегда мерьте на ней. Небольшая разница между руками — норма.",
            "Что делать, если результаты каждый раз разные? Разброс в 5–10 мм рт. ст. естественен. При большой разнице проверьте положение и размер манжеты, затем расскажите врачу.",
            "Как проверить тонометр? Принесите свой прибор на приём и сравните его показания с аппаратом врача. При слабой батарейке показания могут искажаться — меняйте её вовремя.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-tonometr-a20"],
  },
  {
    slug: "termometr-tanlash-qaysi-turi-qulay",
    date: "2026-11-18",
    imageSeed: "blog-thermo",
    category: { uz: "Tibbiy jihozlar", ru: "Медицинские приборы" },
    categoryKey: "devices",
    title: {
      uz: "Termometr tanlash: qaysi turi qulay",
      ru: "Как выбрать термометр: какой тип удобнее",
    },
    excerpt: {
      uz: "Elektron kontaktli, peshona va quloq termometrlari farqi, simobli termometrdan nega voz kechilmoqda va harorat qanday toʻgʻri oʻlchanadi.",
      ru: "Чем отличаются электронные контактные, лобные и ушные термометры, почему отказываются от ртутных и как правильно измерять температуру.",
    },
    sections: [
      {
        heading: { uz: "Termometrlarning asosiy turlari", ru: "Основные типы термометров" },
        paragraphs: {
          uz: [
            "Elektron kontaktli termometr qoʻltiq ostida, ogʻizda yoki toʻgʻri ichakda oʻlchaydi; natija bir necha soniya yoki daqiqada tayyor boʻladi. Bu eng keng tarqalgan va arzon tur.",
            "Infraqizil termometrlar teriga tegmasdan peshonadan yoki quloqdan oʻlchaydi, natija 1–2 soniyada chiqadi. Ular uxlayotgan yoki bezovta bolada qulay, lekin masofa va joylashuvga sezgir: yoʻriqnomadagi shartlarga amal qilish kerak.",
          ],
          ru: [
            "Электронный контактный термометр измеряет под мышкой, во рту или в прямой кишке; результат готов через несколько секунд или минут. Это самый распространённый и недорогой тип.",
            "Инфракрасные термометры измеряют без касания, на лбу или в ухе, результат появляется за 1–2 секунды. Они удобны для спящего или беспокойного ребёнка, но чувствительны к расстоянию и положению: нужно соблюдать условия из инструкции.",
          ],
        },
      },
      {
        heading: { uz: "Simobli termometrdan nega voz kechilmoqda", ru: "Почему отказываются от ртутных" },
        paragraphs: {
          uz: [
            "Simob zaharli metall. Minamata konvensiyasiga koʻra, 2020-yildan boshlab simobli termometrlarni ishlab chiqarish va eksport qilish taqiqlangan davlatlar koʻp. Shisha sinsa, simob bugʻlari xonani zaharlaydi, ayniqsa bolalar uchun xavfli.",
            "Agar uyingizda eski simobli termometr boʻlsa, uni oddiy axlatga tashlamang: maxsus qabul punktlari yoki ekologiya xizmatiga murojaat qiling. Sinsa, simobni changyutgich bilan yigʻmang, xonani shamollating va mutaxassislarga qoʻngʻiroq qiling.",
          ],
          ru: [
            "Ртуть — ядовитый металл. По Минаматской конвенции с 2020 года во многих странах запрещено производство и экспорт ртутных термометров. Если стекло разбилось, пары ртути отравляют воздух в комнате, особенно опасно для детей.",
            "Если дома остался старый ртутный термометр, не выбрасывайте его в обычный мусор: обратитесь в специальные пункты приёма или экологическую службу. При поломке не собирайте ртуть пылесосом, проветрите комнату и позвоните специалистам.",
          ],
        },
      },
      {
        heading: { uz: "Qanday tanlash kerak", ru: "Как выбирать" },
        paragraphs: {
          uz: [
            "Avval oʻlchash usuliga qarang: kontakt, peshona yoki quloq. Oilada kichik bola boʻlsa, tez oʻlchaydigan va sokin (ovozsiz) modelni tanlash qulay. Yoʻriqnomada tibbiy asbob sifatida roʻyxatdan oʻtganligi va aniqlik chegarasi (odatda ±0,1–0,2 °C) koʻrsatilgan boʻlsin.",
            "Qoʻshimcha qulayliklar: xotira, yorugʻ displey, ogʻirligi, batareyani almashtirish imkoniyati. Peshona va quloq modellarida sensorni tozalash oson boʻlishi kerak; kontaktli modelda esa uchi yuviladigan boʻlishi muhim.",
          ],
          ru: [
            "Сначала определитесь со способом измерения: контактный, лобный или ушной. Если в семье маленький ребёнок, удобна быстрая и беззвучная модель. В инструкции должны быть указаны регистрация как медицинского изделия и погрешность (обычно ±0,1–0,2 °C).",
            "Дополнительные удобства: память, подсветка дисплея, вес, возможность заменить батарейку. У лобных и ушных моделей сенсор должен легко очищаться, а у контактных — наконечник должен мыться.",
          ],
        },
      },
      {
        heading: { uz: "Harorat qanday toʻgʻri oʻlchanadi", ru: "Как правильно измерять температуру" },
        paragraphs: {
          uz: [
            "Oʻlchashdan oldin 15–30 daqiqa dam oling, issiq ichimlik ichmang, hammom qabul qilmang. Peshona termometrida peshonani terdan quruq artib oʻlchang; asbobni xona haroratiga moslashtirib oling (yoʻriqnomada vaqti yozilgan).",
            "Qoʻltiq ostidagi harorat ogʻiz va ichak haroratidan odatda biroz past boʻladi, shuning uchun usullarni aralashtirmang va natijalarni bir xil usulda solishtiring. Kattalarda 38 °C va undan yuqori harorat isitma hisoblanadi.",
            "3 oygacha chaqaloqda 38 °C yoki undan yuqori harorat chiqsa, kutmasdan shifokorga murojaat qiling. Ogʻir holat, nafas qisishi, tutqanoq yoki harorat bir necha kun tushmasa ham shifokorga boring.",
          ],
          ru: [
            "Перед измерением отдохните 15–30 минут, не пейте горячее и не принимайте ванну. Лоб при лобном измерении вытрите насухо; дайте прибору привыкнуть к комнатной температуре (время указано в инструкции).",
            "Температура под мышкой обычно немного ниже, чем во рту и в прямой кишке, поэтому не смешивайте способы и сравнивайте результаты, полученные одним методом. У взрослых температура 38 °C и выше считается лихорадкой.",
            "Если у младенца младше 3 месяцев температура 38 °C или выше, сразу обратитесь к врачу. Тяжёлое состояние, затруднённое дыхание, судороги или температура, которая держится несколько дней, — тоже повод идти к врачу.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Peshona termometri qoʻltiqdagiga nega mos kelmaydi? Usullar turlicha: teri harorati atrof-muhit taʼsirida oʻzgaradi. Bu xato emas, shuning uchun bir usulni tanlab, doim shu usulda oʻlchang.",
            "Termometrni qanday tozalash kerak? Har foydalanishdan keyin uchini spirtli salfetka yoki sovunli suv bilan artib, quriting. Suvga botirmang — yoʻriqnomada ruxsat berilgan boʻlsa istisno.",
          ],
          ru: [
            "Почему лобный термометр не совпадает с измерением под мышкой? Способы разные: температура кожи зависит от окружающей среды. Это не ошибка, поэтому выберите один способ и всегда мерьте им.",
            "Как чистить термометр? После каждого использования протирайте наконечник спиртовой салфеткой или мыльной водой и сушите. Не погружайте в воду, если инструкция этого не разрешает.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-thermometer-t10", "dr-frei-thermometer-t30"],
  },
  {
    slug: "kuniga-qancha-qahva-ichsa-boladi",
    date: "2026-11-18",
    imageSeed: "blog-coffee",
    category: { uz: "Ovqatlanish", ru: "Питание" },
    categoryKey: "nutrition",
    title: {
      uz: "Kuniga qancha qahva ichsa boʻladi: kofein meʼyori",
      ru: "Сколько кофе можно пить в день: норма кофеина",
    },
    excerpt: {
      uz: "EFSA tavsiyasi: kattalar, homilador ayollar va bolalar uchun kunlik kofein chegarasi, bir chashkada qancha kofein bor va uyquga taʼsiri.",
      ru: "Рекомендации EFSA: суточный предел кофеина для взрослых, беременных и детей, сколько кофеина в чашке и как он влияет на сон.",
    },
    sections: [
      {
        heading: { uz: "Kofein meʼyori: EFSA tavsiyasi", ru: "Норма кофеина: рекомендация EFSA" },
        paragraphs: {
          uz: [
            "Yevropa oziq-ovqat xavfsizligi boshqarmasi (EFSA, 2015) salomat kattalar uchun kuniga 400 mg gacha kofein xavfsiz deb hisoblaydi. Bir martalik doza 200 mg dan oshmasligi tavsiya qilinadi. Bu chegara qahvadan, choydan, kola va energetik ichimliklardan keladigan kofeinning yigʻindisiga tegishli.",
            "Homilador va emizikli ayollar uchun chegara — kuniga 200 mg gacha. Bolalar va oʻsmirlar uchun EFSA tana vazniga qarab kuniga 3 mg/kg dan oshmaslikni tavsiya qiladi. Aniq chegarani shifokor bilan kelishing.",
          ],
          ru: [
            "Европейское управление по безопасности продуктов питания (EFSA, 2015) считает безопасными для здоровых взрослых до 400 мг кофеина в день. Разовая доза не должна превышать 200 мг. Этот предел относится к сумме кофеина из кофе, чая, колы и энергетиков.",
            "Для беременных и кормящих женщин предел — до 200 мг в день. Для детей и подростков EFSA советует не превышать 3 мг/кг массы тела в сутки. Точный предел обсудите с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Bir chashkada qancha kofein bor", ru: "Сколько кофеина в чашке" },
        paragraphs: {
          uz: [
            "EFSA maʼlumotiga koʻra, 200 ml filtr qahvada taxminan 90 mg kofein boʻladi. Lekin miqdor navga, maydalanishiga, damlash usuli va hajmiga qarab oʻzgaradi: kuchli espresso, katta stakan va termos kofesi koʻproq kofein berishi mumkin.",
            "Amaliy qoida: 400 mg chegarasi taxminan 4 chashka filtr qahvaga toʻgʻri keladi, agar boshqa manbalardan kofein olmasangiz. Choy, shokolad, kola va dorilar ham kofein qoʻshadi — kunlik yigʻindini shuni hisobga olib oʻylang.",
          ],
          ru: [
            "По данным EFSA, в 200 мл фильтрованного кофе около 90 мг кофеина. Но количество зависит от сорта, помола, способа заваривания и объёма: крепкий эспрессо, большой стакан и кофе из термоса могут дать больше кофеина.",
            "Практическое правило: предел в 400 мг соответствует примерно четырём чашкам фильтрованного кофе, если больше нет других источников кофеина. Чай, шоколад, кола и некоторые лекарства тоже добавляют кофеин — учитывайте суточную сумму.",
          ],
        },
      },
      {
        heading: { uz: "Kofein va uyqu", ru: "Кофеин и сон" },
        paragraphs: {
          uz: [
            "Kofein organizmdan sekin chiqadi: yarim chiqish davri koʻpincha 3–7 soat. Shuning uchun tushdan keyin ichilgan qahva kechqurun ham taʼsir qilishi, uxlab qolishni qiyinlashtirishi mumkin. Kofeinga sezgirlik odamdan odamga katta farq qiladi.",
            "Uyqu bilan muammo boʻlsa, qahvani ertalabga qoldiring va kechki soatlarda choy yoki kofeinsiz ichimlik tanlang. Bu faqat umumiy yoʻnalish: uyqu buzilishi davom etsa, shifokorga murojaat qiling.",
          ],
          ru: [
            "Кофеин выводится медленно: период полувыведения часто составляет 3–7 часов. Поэтому кофе, выпитый днём, может действовать и вечером, затрудняя засыпание. Чувствительность к кофеину сильно различается у разных людей.",
            "Если есть проблемы со сном, оставьте кофе на утро, а вечером выбирайте чай без кофеина или другой напиток. Это лишь общий ориентир: если нарушения сна продолжаются, обратитесь к врачу.",
          ],
        },
      },
      {
        heading: { uz: "Kimlar ehtiyot boʻlishi kerak", ru: "Кому нужна осторожность" },
        paragraphs: {
          uz: [
            "Yurak urishi buzilishi, yuqori qon bosimi, gastrit yoki oshqozon yarasi, xavotirga moyillik, uyqusizlik yoki doimiy dori ichadigan odamlar kofein miqdorini shifokor bilan kelishishi kerak. Ayrim dorilar kofein taʼsirini kuchaytiradi yoki uning chiqishini sekinlashtiradi.",
            "Kofeinni birdan toʻxtatish ayrim odamlarda bosh ogʻrigʻi va holsizlik berishi mumkin; miqdorni bir necha kun davomida asta-sekin kamaytirgan maʼqul.",
          ],
          ru: [
            "Людям с нарушениями ритма сердца, высоким давлением, гастритом или язвой желудка, склонностью к тревожности, бессонницей, а также принимающим лекарства стоит согласовать количество кофеина с врачом. Некоторые лекарства усиливают действие кофеина или замедляют его выведение.",
            "Резкий отказ от кофеина у некоторых вызывает головную боль и вялость; лучше снижать количество постепенно в течение нескольких дней.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Qahva suvni chiqarib yuboradimi? Odatiy miqdorda ichilgan qahva suv balansiga sezilarli taʼsir qilmaydi; baribir kun davomida yetarli suv ichish kerak.",
            "Qahvani ovqatdan keyin ichsa boʻladimi? Ha, lekin temir va kalsiy preparatlarini qahvadan kamida bir soat oldin yoki keyin ichgan maʼqul: kuchli qahva ularning soʻrilishini biroz kamaytirishi mumkin.",
            "Kofeinsiz qahvada kofein umuman yoʻqmi? Unda kofein juda oz miqdorda qoladi, lekin nol emas. Meʼyor hisobida buni eʼtiborga oling.",
          ],
          ru: [
            "Выводит ли кофе воду из организма? В обычных количествах кофе заметно не влияет на водный баланс; в течение дня всё равно нужно пить достаточно воды.",
            "Можно ли пить кофе после еды? Да, но препараты железа и кальция лучше принимать минимум за час до или через час после кофе: крепкий кофе может немного снижать их усвоение.",
            "Есть ли кофеин в кофе без кофеина? Его остаётся очень мало, но не ноль. Учитывайте это при подсчёте нормы.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-coffee-crema-250g", "swiss-energy-coffee-edel-250g"],
  },
];
