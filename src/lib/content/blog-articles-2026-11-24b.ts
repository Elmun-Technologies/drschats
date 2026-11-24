import type { RawArticle } from "./blog";

/*
  SEO batch, 2026-11-24 (evening). Reference intakes and general guidance only, no promise of
  effect (blog.test.ts runs the claim checks). Sources: FAO/WHO definition of probiotics (2001,
  ISAPP 2014 consensus), EFSA authorised claims on tiredness and fatigue (iron, magnesium,
  vitamins B2, B6, B12, C, folate), NIH Office of Dietary Supplements fact sheets (vitamin B12,
  vitamin D, calcium) for intakes after 50. Photos: Adobe Stock bank, docs/IMAGE-BANK.md.
*/
export const articlesNov2026h: RawArticle[] = [
  {
    slug: "probiotiklar-nima-va-kimga-kerak",
    date: "2026-11-24",
    imageSeed: "bank2-ayran",
    category: { uz: "Hazm qilish", ru: "Пищеварение" },
    categoryKey: "nutrition",
    title: {
      uz: "Probiotiklar nima va ular kimga kerak",
      ru: "Пробиотики: что это и кому они нужны",
    },
    excerpt: {
      uz: "Probiotik, prebiotik va fermentlangan ovqat farqi, qatiq va ayronda nima bor, qoʻshimchani yorliqqa qarab qanday tanlash va kimlar shifokor bilan maslahatlashishi kerak.",
      ru: "Чем пробиотик отличается от пребиотика и ферментированной еды, что есть в катыке и айране, как выбрать добавку по этикетке и кому сначала нужен врач.",
    },
    sections: [
      {
        heading: { uz: "Probiotik degani nima", ru: "Что такое пробиотик" },
        paragraphs: {
          uz: [
            "Jahon sogʻliqni saqlash tashkiloti va FAO taʼrifiga koʻra probiotik — yetarli miqdorda qabul qilinganda odam sogʻligʻiga foyda keltiradigan tirik mikroorganizmlar. Asosan bu sut kislotasi bakteriyalari (Lactobacillus, Bifidobacterium guruhlari) va baʼzi achitqi zamburugʻlari (Saccharomyces boulardii).",
            "Har qanday bakteriya ham probiotik emas. Mikroorganizm tirik boʻlishi, aniq shtamm nomi bilan atalishi va tadqiqotda oʻrganilgan miqdorda boʻlishi kerak. Shuning uchun bir xil turdagi ikki mahsulot turlicha ishlashi mumkin — ahamiyati tur emas, aynan shtammda.",
          ],
          ru: [
            "По определению ВОЗ и ФАО пробиотики — это живые микроорганизмы, которые при приёме в достаточном количестве приносят пользу здоровью человека. Чаще всего это молочнокислые бактерии (группы Lactobacillus и Bifidobacterium) и некоторые дрожжи (Saccharomyces boulardii).",
            "Не всякая бактерия — пробиотик. Микроорганизм должен быть живым, называться конкретным штаммом и присутствовать в количестве, которое изучали в исследованиях. Поэтому два продукта одного вида могут работать по-разному: значение имеет не вид, а именно штамм.",
          ],
        },
      },
      {
        heading: { uz: "Prebiotik va fermentlangan ovqatdan farqi", ru: "Чем отличаются пребиотики и ферментированная еда" },
        paragraphs: {
          uz: [
            "Prebiotik — bakteriya emas, balki foydali ichak bakteriyalari oziqlanadigan tola: inulin, oligosaxaridlar. Ular piyoz, sarimsoq, banan, suli va dukkaklilarda bor. Probiotik va prebiotik birga boʻlgan mahsulot sinbiotik deb ataladi.",
            "Qatiq, ayron, kefir, tuzlangan karam va boshqa fermentlangan ovqatlarda tirik bakteriyalar boʻladi, ammo ularning shtammi va miqdori odatda koʻrsatilmaydi. Bunday ovqat ratsion uchun foydali, lekin uni aniq shtammli probiotik qoʻshimcha bilan tenglashtirib boʻlmaydi. Qizdirilgan yoki pasterizatsiyadan keyin qadoqlangan mahsulotda tirik bakteriya qolmaydi.",
          ],
          ru: [
            "Пребиотик — не бактерия, а клетчатка, которой питаются полезные бактерии кишечника: инулин, олигосахариды. Они есть в луке, чесноке, бананах, овсе и бобовых. Продукт, где есть и пробиотик, и пребиотик, называют синбиотиком.",
            "В катыке, айране, кефире, квашеной капусте и другой ферментированной еде есть живые бактерии, но их штамм и количество обычно не указаны. Такая еда полезна в рационе, но приравнивать её к пробиотической добавке с конкретным штаммом нельзя. В нагретом или пастеризованном после брожения продукте живых бактерий не остаётся.",
          ],
        },
      },
      {
        heading: { uz: "Qachon probiotik haqida oʻylash mumkin", ru: "Когда стоит подумать о пробиотике" },
        paragraphs: {
          uz: [
            "Koʻpincha probiotik antibiotik kursi paytida va undan keyin, safarda ovqat oʻzgarganda yoki ichak faoliyati notekis boʻlganda tanlanadi. Bunday holatlarda qaysi shtamm va qancha muddat ichish kerakligini shifokor yoki farmatsevt bilan aniqlash maʼqul: antibiotik bilan birga ichilganda odatda kamida 2 soat oraliq qilinadi.",
            "Ichakdagi noqulaylik uzoq davom etsa, qonli najas, vazn yoʻqotish, kechasi ogʻriq yoki isitma boʻlsa — bu qoʻshimcha tanlash emas, shifokorga borish uchun sabab.",
          ],
          ru: [
            "Чаще всего пробиотик выбирают во время курса антибиотиков и после него, в поездке при смене питания или когда работа кишечника нерегулярна. В таких случаях какой штамм и как долго принимать, лучше уточнить у врача или фармацевта: вместе с антибиотиком их обычно разносят минимум на 2 часа.",
            "Если дискомфорт в кишечнике длится долго, есть кровь в стуле, потеря веса, ночные боли или температура — это повод идти к врачу, а не подбирать добавку.",
          ],
        },
      },
      {
        heading: { uz: "Yorliqqa qarab qanday tanlash", ru: "Как выбрать по этикетке" },
        paragraphs: {
          uz: [
            "Yaxshi yorliqda shtammning toʻliq nomi yoziladi: tur va harf-raqamli belgi, masalan Lactobacillus rhamnosus GG. Faqat «laktobakteriyalar» deb yozilgan boʻlsa, tanlash qiyin. Tirik hujayralar soni KOE (koloniya hosil qiluvchi birlik) bilan, yaroqlilik muddati oxirigacha kafolatlangan miqdorda koʻrsatilishi kerak.",
            "Saqlash sharoitini oʻqing: baʼzi probiotiklar faqat muzlatgichda saqlanadi. Yuqori raqam har doim yaxshi degani emas — tadqiqotda qaysi doza oʻrganilgan boʻlsa, oʻsha muhim.",
          ],
          ru: [
            "На хорошей этикетке указано полное название штамма: вид и буквенно-цифровое обозначение, например Lactobacillus rhamnosus GG. Если написано просто «лактобактерии», выбрать сложно. Количество живых клеток указывают в КОЕ (колониеобразующих единицах), причём гарантированное до конца срока годности.",
            "Прочитайте условия хранения: некоторые пробиотики хранят только в холодильнике. Большое число не всегда лучше — важна та доза, которую изучали в исследованиях.",
          ],
        },
      },
      {
        heading: { uz: "Kimlar ehtiyot boʻlishi kerak", ru: "Кому нужна осторожность" },
        paragraphs: {
          uz: [
            "Immuniteti jiddiy susaygan odamlar (kimyoterapiya, transplantatsiyadan keyin), markaziy venoz kateteri bor bemorlar va chala tugʻilgan chaqaloqlarga probiotik faqat shifokor koʻrsatmasi bilan beriladi. Homiladorlik va emizish davrida ham avval shifokor bilan maslahatlashing.",
            "Probiotik — biologik faol qoʻshimcha, dori vositasi emas. U muvozanatli ovqatlanish, yetarli tola va suvni almashtirmaydi.",
          ],
          ru: [
            "Людям с сильно ослабленным иммунитетом (после химиотерапии, трансплантации), пациентам с центральным венозным катетером и недоношенным детям пробиотики дают только по назначению врача. При беременности и кормлении грудью тоже сначала посоветуйтесь с врачом.",
            "Пробиотик — биологически активная добавка, а не лекарство. Он не заменяет сбалансированное питание, достаточно клетчатки и воды.",
          ],
        },
      },
    ],
    relatedProductSlugs: [],
    relatedArticleSlugs: ["bad-nima-dori-vositasidan-farqi", "multivitamin-qanday-tanlash"],
  },
  {
    slug: "doimiy-charchoq-qaysi-moddalar-yetishmaydi",
    date: "2026-11-24",
    imageSeed: "bank2-fatigue",
    category: { uz: "Energiya", ru: "Энергия" },
    categoryKey: "vitamins",
    title: {
      uz: "Doimiy charchoq: qaysi moddalar yetishmasligi mumkin",
      ru: "Постоянная усталость: каких веществ не хватает",
    },
    excerpt: {
      uz: "Charchoqning eng koʻp uchraydigan sabablari, qaysi tahlillarni topshirish foydali, temir, B12, magniy va vitamin D ning roli va qachon darhol shifokorga borish kerak.",
      ru: "Самые частые причины усталости, какие анализы стоит сдать, роль железа, B12, магния и витамина D и когда идти к врачу сразу.",
    },
    sections: [
      {
        heading: { uz: "Avval oddiy sabablarni tekshiring", ru: "Сначала проверьте простые причины" },
        paragraphs: {
          uz: [
            "Charchoqning koʻp sababi vitaminga bogʻliq emas: kam uxlash yoki notinch uyqu, kam suv ichish, nonushtasiz kun, kam harakat, uzoq vaqt ekran oldida oʻtirish va doimiy ish bosimi. Ikki hafta davomida uyqu, ovqat va harakatni yozib borish koʻpincha sababni koʻrsatadi.",
            "Agar rejim tartibda boʻlsa-yu, holsizlik bir oydan uzoq davom etsa, tahlil topshirish vaqti keldi.",
          ],
          ru: [
            "Многие причины усталости не связаны с витаминами: недосып или беспокойный сон, мало воды, день без завтрака, мало движения, долгие часы у экрана и постоянное напряжение на работе. Дневник сна, еды и активности за две недели часто показывает причину.",
            "Если режим в порядке, а слабость держится дольше месяца, пора сдать анализы.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi tahlillar foydali", ru: "Какие анализы полезны" },
        paragraphs: {
          uz: [
            "Odatda shifokor umumiy qon tahlili, ferritin (temir zaxirasi), vitamin B12, 25(OH)D (vitamin D) va qalqonsimon bez gormoni TTG ni tavsiya qiladi. Ayollarda temir yetishmasligi ayniqsa koʻp uchraydi: hayz, homiladorlik va goʻsht kam yeyish uning asosiy sabablari.",
            "Tahlil natijasiga qarab qoʻshimcha tanlash koʻr-koʻrona ichishdan ancha foydali. Masalan, temirni yetishmovchiliksiz uzoq ichish zararli boʻlishi mumkin.",
          ],
          ru: [
            "Обычно врач советует общий анализ крови, ферритин (запас железа), витамин B12, 25(OH)D (витамин D) и гормон щитовидной железы ТТГ. У женщин особенно часто встречается дефицит железа: основные причины — менструации, беременность и мало мяса в рационе.",
            "Подобрать добавку по анализам намного полезнее, чем пить наугад. Например, долго принимать железо без дефицита может быть вредно.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi moddalar charchoq bilan bogʻliq", ru: "Какие вещества связаны с усталостью" },
        paragraphs: {
          uz: [
            "Yevropa oziq-ovqat xavfsizligi agentligi (EFSA) tasdiqlagan taʼriflarga koʻra temir, magniy, vitamin B2, B6, B12, C va foliy kislota charchoq va holsizlikni kamaytirishga hissa qoʻshadi. Bu — ular yetishmaganda organizm meʼyoriy ishlashi uchun kerak degani, yetarli boʻlganda qoʻshimcha «quvvat» beradi degani emas.",
            "Temir gemoglobin hosil boʻlishida ishtirok etadi, B12 va foliy kislota qon hujayralari yetilishida, magniy esa energiya almashinuvi va mushaklar ishida kerak. Vitamin D qishda koʻpchilikda past boʻladi: kun qisqa, quyosh kam, teri uni deyarli ishlab chiqarmaydi.",
          ],
          ru: [
            "По формулировкам, одобренным Европейским агентством по безопасности пищевых продуктов (EFSA), железо, магний, витамины B2, B6, B12, C и фолиевая кислота способствуют уменьшению усталости и утомляемости. Это значит, что они нужны организму для нормальной работы при их нехватке, а не что они дают дополнительную «энергию», когда их достаточно.",
            "Железо участвует в образовании гемоглобина, B12 и фолиевая кислота — в созревании клеток крови, магний нужен для энергетического обмена и работы мышц. Витамин D зимой низкий у многих: день короткий, солнца мало, кожа его почти не вырабатывает.",
          ],
        },
      },
      {
        heading: { uz: "Ovqatdan qanday olish mumkin", ru: "Как получить из еды" },
        paragraphs: {
          uz: [
            "Temir — mol goʻshti, jigar, dukkaklilar va koʻkatlarda; oʻsimlikdagi temir C vitaminli ovqat bilan birga yaxshiroq soʻriladi, choy va qahva esa soʻrilishini kamaytiradi, shuning uchun ularni ovqatdan bir soat keyin ichgan maʼqul. B12 asosan hayvon mahsulotlarida bor: goʻsht, baliq, tuxum, sut; oʻsimlik mahsulotlarida esa faqat boyitilgan boʻlsa (baʼzi yormalar, oziq-ovqat xamirturushi). Magniy — yongʻoq, urugʻlar, butun don va dukkaklilarda.",
          ],
          ru: [
            "Железо — в говядине, печени, бобовых и зелени; растительное железо лучше усваивается вместе с едой, где есть витамин C, а чай и кофе усвоение снижают, поэтому их лучше пить через час после еды. B12 есть в основном в продуктах животного происхождения: мясе, рыбе, яйцах, молоке; в растительных — только если они обогащены (некоторые хлопья, пищевые дрожжи). Магний — в орехах, семенах, цельных злаках и бобовых.",
          ],
        },
      },
      {
        heading: { uz: "Qachon darhol shifokorga borish kerak", ru: "Когда идти к врачу сразу" },
        paragraphs: {
          uz: [
            "Charchoq bilan birga sababsiz vazn yoʻqotish, isitma, kechasi terlash, nafas qisishi, koʻkrak ogʻrigʻi, qattiq chanqoq yoki tez-tez siyish, kayfiyatning uzoq tushkunligi boʻlsa — qoʻshimcha tanlamasdan shifokorga boring.",
            "Biologik faol qoʻshimcha dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing, ayniqsa doimiy dori ichsangiz.",
          ],
          ru: [
            "Если вместе с усталостью есть беспричинная потеря веса, температура, ночная потливость, одышка, боль в груди, сильная жажда или частое мочеиспускание, долгое подавленное настроение — идите к врачу, не подбирая добавку.",
            "Биологически активная добавка — не лекарство. Перед приёмом посоветуйтесь со специалистом, особенно если постоянно принимаете лекарства.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-gold-vitamins-20", "dr-frei-antistress-magniy-20", "swiss-energy-neuroforce-30"],
    relatedArticleSlugs: ["temir-nima-uchun-kerak", "vitamin-b12-kimlarga-kerak", "qishda-vitamin-d"],
  },
  {
    slug: "60-yoshdan-keyin-qaysi-vitaminlar-kerak",
    date: "2026-11-24",
    imageSeed: "bank2-seniors",
    category: { uz: "Keksalar", ru: "Старший возраст" },
    categoryKey: "vitamins",
    title: {
      uz: "60 yoshdan keyin qaysi vitaminlar muhim",
      ru: "Витамины после 60 лет: что важно",
    },
    excerpt: {
      uz: "Yosh oʻtgan sari nima oʻzgaradi, vitamin D, kalsiy, B12 va oqsilga ehtiyoj, dorilar bilan oʻzaro taʼsir va qoʻshimchani xavfsiz tanlash qoidalari.",
      ru: "Что меняется с возрастом, потребность в витамине D, кальции, B12 и белке, взаимодействие с лекарствами и правила безопасного выбора добавок.",
    },
    sections: [
      {
        heading: { uz: "Yosh bilan nima oʻzgaradi", ru: "Что меняется с возрастом" },
        paragraphs: {
          uz: [
            "Yoshi kattalarda ishtaha va ovqat hajmi kamayadi, ammo vitamin va minerallarga ehtiyoj kamaymaydi, baʼzilariga hatto ortadi. Teri quyosh nurida vitamin D ni yoshlikdagiga qaraganda kamroq hosil qiladi, oshqozon kislotasi kamayishi esa ovqatdagi B12 ning soʻrilishini qiyinlashtiradi.",
            "Shuning uchun 60 yoshdan keyin ovqatlanishning sifati — har bir likopchada oqsil, sabzavot va sut mahsuloti boʻlishi — ayniqsa muhim.",
          ],
          ru: [
            "У старших людей снижаются аппетит и объём еды, но потребность в витаминах и минералах не уменьшается, а для некоторых даже растёт. Кожа под солнцем вырабатывает меньше витамина D, чем в молодости, а снижение кислотности желудка затрудняет усвоение B12 из еды.",
            "Поэтому после 60 особенно важно качество питания: чтобы в каждой тарелке были белок, овощи и молочные продукты.",
          ],
        },
      },
      {
        heading: { uz: "Vitamin D va kalsiy", ru: "Витамин D и кальций" },
        paragraphs: {
          uz: [
            "AQSh Milliy sogʻliqni saqlash institutlari (NIH) maʼlumotiga koʻra 70 yoshdan oshganlarga kuniga 800 XB (20 mkg) vitamin D tavsiya etiladi, 51 yoshdan oshgan ayollar va 70 yoshdan oshgan erkaklarga esa kuniga 1200 mg kalsiy. Vitamin D va kalsiy suyaklarning meʼyoriy holatini saqlashga hissa qoʻshadi.",
            "Kalsiyni avval ovqatdan olishga harakat qiling: sut, qatiq, tvorog, pishloq, kunjut. Qoʻshimcha faqat ovqatdagi yetishmovchilikni toʻldirishi kerak — kalsiyni meʼyordan ortiq ichish foyda bermaydi.",
          ],
          ru: [
            "По данным Национальных институтов здоровья США (NIH), людям старше 70 лет рекомендуют 800 МЕ (20 мкг) витамина D в день, женщинам старше 51 и мужчинам старше 70 — 1200 мг кальция в день. Витамин D и кальций способствуют поддержанию нормального состояния костей.",
            "Кальций старайтесь сначала получать из еды: молоко, катык, творог, сыр, кунжут. Добавка должна только восполнять нехватку в рационе — кальций сверх нормы пользы не даёт.",
          ],
        },
      },
      {
        heading: { uz: "Vitamin B12 va oqsil", ru: "Витамин B12 и белок" },
        paragraphs: {
          uz: [
            "50 yoshdan oshganlarning bir qismida B12 ovqatdan yaxshi soʻrilmaydi, shuning uchun NIH uni boyitilgan mahsulot yoki qoʻshimcha shaklida olishni tavsiya qiladi: qoʻshimchadagi B12 oqsilga bogʻlanmagan va osonroq soʻriladi. Kunlik meʼyor — 2,4 mkg. Metformin va oshqozon kislotasini kamaytiruvchi dorilarni uzoq ichadiganlarda B12 ni tekshirib turish foydali.",
            "Mushak massasini saqlash uchun oqsil har kuni kerak: goʻsht, baliq, tuxum, dukkaklilar va sut mahsulotlari kun davomida teng taqsimlanishi yaxshi.",
          ],
          ru: [
            "У части людей старше 50 лет B12 плохо усваивается из еды, поэтому NIH советует получать его из обогащённых продуктов или добавок: B12 в добавках не связан с белком и усваивается легче. Суточная норма — 2,4 мкг. Тем, кто долго принимает метформин или препараты, снижающие кислотность желудка, полезно контролировать B12.",
            "Для сохранения мышечной массы белок нужен каждый день: мясо, рыба, яйца, бобовые и молочные продукты лучше распределять равномерно в течение дня.",
          ],
        },
      },
      {
        heading: { uz: "Dorilar bilan oʻzaro taʼsir", ru: "Взаимодействие с лекарствами" },
        paragraphs: {
          uz: [
            "Yoshi kattalar koʻpincha bir nechta dori ichadi, shuning uchun qoʻshimchani doim shifokor bilan kelishish kerak. Masalan, vitamin K qon suyultiruvchi varfarin taʼsiriga, kalsiy va temir baʼzi antibiotiklar va qalqonsimon bez gormoni soʻrilishiga taʼsir qiladi — ularni vaqt boʻyicha ajratish kerak boʻladi.",
            "Bir vaqtda bir nechta multivitamin ichmang: bir xil modda ikki marta kelib, meʼyordan oshib ketishi mumkin.",
          ],
          ru: [
            "Старшие люди часто принимают несколько лекарств, поэтому добавку всегда нужно согласовать с врачом. Например, витамин K влияет на действие разжижающего кровь варфарина, а кальций и железо — на усвоение некоторых антибиотиков и гормона щитовидной железы: их приходится разносить по времени.",
            "Не пейте одновременно несколько мультивитаминов: одно и то же вещество может прийти дважды и превысить норму.",
          ],
        },
      },
      {
        heading: { uz: "Qanday tanlash", ru: "Как выбирать" },
        paragraphs: {
          uz: [
            "Yorliqda har bir moddaning miqdori va kunlik meʼyorga nisbati yozilgan boʻlsin. Katta tabletkani yutish qiyin boʻlsa, eruvchi yoki kichik kapsula shaklini tanlang. Qon bosimini uyda oʻlchab borish ham yoshi kattalar uchun foydali odat.",
            "Biologik faol qoʻshimcha dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.",
          ],
          ru: [
            "На этикетке должно быть указано количество каждого вещества и процент от суточной нормы. Если большую таблетку трудно глотать, выбирайте шипучую форму или маленькие капсулы. Полезная привычка для старшего возраста — регулярно измерять давление дома.",
            "Биологически активная добавка — не лекарство. Перед приёмом посоветуйтесь со специалистом.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-calcivit-30", "swiss-energy-visiovit-30", "dr-frei-tonometr-a20"],
    relatedArticleSlugs: ["kalsiy-va-vitamin-d3-birga", "vitamin-b12-kimlarga-kerak", "qon-bosimini-uyda-togri-olchash"],
  },
];
