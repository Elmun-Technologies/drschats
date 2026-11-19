import type { RawArticle } from "./blog";

/*
  Keyword-led batch, 2026-11-19 (Keyword Planner export 2026-11-02, migration 0037; analysis in
  docs/KEYWORDS-2026-11-19.md). Topics chosen by demand where the catalogue has a matching
  product and no existing article answers the same intent. Reference intakes and authorised
  nutrient wording only (NIH ODS, EFSA, WHO); no promise of effect — blog.test.ts runs the
  claim checks.
*/
export const articlesNov2026e: RawArticle[] = [
  {
    slug: "magniy-b6-va-magniy-sitrat-farqi",
    date: "2026-11-19",
    imageSeed: "bank-magnesium-capsules",
    category: { uz: "Minerallar", ru: "Минералы" },
    categoryKey: "vitamins",
    title: {
      uz: "Magniy B6 va magniy sitrat: farqi va tanlash",
      ru: "Магний B6 и магний цитрат: в чём разница",
    },
    excerpt: {
      uz: "Magniyning qaysi shakllari bor, B6 bilan birga nima uchun chiqariladi, kunlik meʼyor qancha va qadoqdagi miqdorni qanday oʻqish kerak.",
      ru: "Какие бывают формы магния, зачем его выпускают вместе с B6, какова суточная норма и как читать количество на упаковке.",
    },
    sections: [
      {
        heading: { uz: "Magniy organizmda nima qiladi", ru: "Что делает магний в организме" },
        paragraphs: {
          uz: [
            "Magniy — organizmdagi 300 dan ortiq ferment ishida qatnashadigan mineral. NIH ODS (AQSH Milliy sogʻliqni saqlash institutlarining Ovqat qoʻshimchalari boʻlimi) maʼlumotiga koʻra, u energiya almashinuvi, mushak va asab faoliyati, suyak tuzilishi uchun kerak.",
            "EFSA maʼqullagan formulalarga koʻra, magniy normal energiya almashinuviga, asab tizimining normal ishlashiga, mushaklarning normal faoliyatiga va charchoq hissini kamaytirishga hissa qoʻshadi. Bu — mineralning fiziologik vazifasi, taʼsir vaʼdasi emas.",
          ],
          ru: [
            "Магний — минерал, участвующий в работе более 300 ферментов организма. По данным NIH ODS (Управление пищевых добавок Национальных институтов здоровья США), он нужен для энергетического обмена, работы мышц и нервов, строения костей.",
            "По формулировкам, одобренным EFSA, магний способствует нормальному энергетическому обмену, нормальной работе нервной системы, нормальной функции мышц и уменьшению ощущения усталости. Это физиологическая роль минерала, а не обещание эффекта.",
          ],
        },
      },
      {
        heading: { uz: "Magniy shakllari: sitrat, laktat, oksid", ru: "Формы магния: цитрат, лактат, оксид" },
        paragraphs: {
          uz: [
            "Qoʻshimchalarda magniy doim biror birikma holida boʻladi: sitrat, laktat, aspartat, xlorid, glitsinat, oksid, sulfat va boshqalar. NIH ODS yozishicha, kichik tadqiqotlarda aspartat, sitrat, laktat va xlorid shakllari oksid va sulfatga qaraganda toʻliqroq soʻrilgan. Lekin bu farq har bir odam uchun bir xil emas.",
            "Magniy sitrat — limon kislotasi bilan birikma, suvda yaxshi eriydi, shuning uchun koʻpincha kukun va shipuchi tabletkalarda uchraydi. Oksid shaklida bir tabletkaga koʻp magniy sigʻadi, ammo uning bir qismi soʻrilmay qolishi mumkin. Shakl nomi qadoqda yozilishi kerak; yozilmagan boʻlsa, ishlab chiqaruvchidan soʻrash mumkin.",
            "Muhim nuqta: qadoqda koʻpincha ikkita raqam boʻladi — birikmaning ogʻirligi va undagi «sof» (elementar) magniy. Kunlik meʼyor bilan aynan elementar magniy taqqoslanadi. Masalan, 500 mg magniy sitrat ichida elementar magniy ancha kam boʻladi.",
          ],
          ru: [
            "В добавках магний всегда находится в виде соединения: цитрат, лактат, аспартат, хлорид, глицинат, оксид, сульфат и другие. Как пишет NIH ODS, в небольших исследованиях аспартат, цитрат, лактат и хлорид усваивались полнее, чем оксид и сульфат. Но эта разница не одинакова для всех людей.",
            "Магния цитрат — соединение с лимонной кислотой, хорошо растворяется в воде, поэтому часто встречается в порошках и шипучих таблетках. В форме оксида в одну таблетку помещается много магния, но часть его может не усвоиться. Название формы должно быть указано на упаковке; если его нет, можно уточнить у производителя.",
            "Важный момент: на упаковке часто две цифры — масса соединения и количество «чистого» (элементарного) магния в нём. С суточной нормой сравнивают именно элементарный магний. Например, в 500 мг цитрата магния элементарного магния значительно меньше.",
          ],
        },
      },
      {
        heading: { uz: "Nega magniy B6 bilan birga chiqariladi", ru: "Почему магний выпускают вместе с B6" },
        paragraphs: {
          uz: [
            "B6 vitamini (piridoksin) ham asab tizimining normal ishlashiga va normal psixologik faoliyatga hissa qoʻshadi (EFSA formulasi). Ikkalasi bir xil vazifalarda ishtirok etgani uchun ishlab chiqaruvchilar ularni koʻpincha bitta tabletkaga joylaydi. «Magniy B6» — bu alohida shakl emas, balki magniy birikmasi va B6 vitaminining kombinatsiyasi.",
            "B6 ni boshqa qoʻshimchalardan ham olayotgan boʻlsangiz, kunlik yigʻindini hisoblang. B6 uchun EFSA 2023-yilda kattalarga kuniga 12 mg yuqori chegarani belgilagan. B vitaminlari haqida batafsil «B vitaminlari: qaysi biri nima uchun kerak» maqolamizda yozganmiz.",
          ],
          ru: [
            "Витамин B6 (пиридоксин) тоже способствует нормальной работе нервной системы и нормальной психологической функции (формулировка EFSA). Поскольку оба участвуют в одних и тех же процессах, производители часто объединяют их в одной таблетке. «Магний B6» — это не отдельная форма, а сочетание соединения магния и витамина B6.",
            "Если вы получаете B6 и из других добавок, посчитайте суточную сумму. Для B6 EFSA в 2023 году установило верхний предел для взрослых — 12 мг в сутки. Подробнее о витаминах группы B читайте в нашей статье «Витамины группы B: какой для чего нужен».",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor va yuqori chegara", ru: "Суточная норма и верхний предел" },
        paragraphs: {
          uz: [
            "NIH ODS maʼlumotiga koʻra, kattalar uchun tavsiya etilgan miqdor: erkaklar uchun kuniga 400–420 mg, ayollar uchun 310–320 mg (homiladorlikda biroz koʻproq). Bu miqdor ovqat va qoʻshimchadan olinadigan jami magniy. Magniy yashil bargli sabzavotlar, dukkaklilar, yongʻoq, urugʻlar va toʻliq donli mahsulotlarda koʻp.",
            "Qoʻshimcha va dorilardan olinadigan magniy uchun kattalarga yuqori chegara kuniga 350 mg deb belgilangan (ovqatdagi magniy bunga kirmaydi). Yuqori dozalar ich ketishi, koʻngil aynishi va qorin ogʻrigʻiga sabab boʻlishi mumkin. Buyrak kasalligi boʻlgan odamlar magniyli qoʻshimchani faqat shifokor bilan kelishib ichishi kerak.",
          ],
          ru: [
            "По данным NIH ODS, рекомендуемое количество для взрослых: мужчинам 400–420 мг в сутки, женщинам 310–320 мг (при беременности немного больше). Это общее количество магния из пищи и добавок. Магния много в зелёных листовых овощах, бобовых, орехах, семенах и цельнозерновых продуктах.",
            "Для магния из добавок и лекарств верхний предел у взрослых — 350 мг в сутки (магний из пищи сюда не входит). Высокие дозы могут вызывать диарею, тошноту и боль в животе. Людям с заболеваниями почек магниевые добавки можно принимать только по согласованию с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Qanday tanlash va ichish kerak", ru: "Как выбрать и принимать" },
        paragraphs: {
          uz: [
            "Tanlashda uchta narsaga qarang: elementar magniy miqdori (mg va kunlik meʼyorning foizi), shakl nomi va qoʻshimcha komponentlar (B6, taurin, vitaminlar). Qadoqdagi dozani oshirmang va bir vaqtda bir nechta magniyli mahsulot ichmang.",
            "Katalogimizdagi Dr. Frei Antistress shipuchi tabletkasida 100 mg magniy (kunlik meʼyorning 27%), 2 mg B6, 100 mg taurin, vitamin C va K bor; bir tabletka bir stakan suvda eritiladi. Magniy ayrim antibiotiklar va osteoporoz dorilari soʻrilishiga taʼsir qilishi mumkin, shuning uchun doimiy dori ichsangiz, vaqt oraligʻini shifokor yoki farmatsevt bilan kelishing.",
          ],
          ru: [
            "При выборе смотрите на три вещи: количество элементарного магния (мг и процент от суточной нормы), название формы и дополнительные компоненты (B6, таурин, витамины). Не превышайте дозу на упаковке и не принимайте одновременно несколько продуктов с магнием.",
            "В шипучей таблетке Dr. Frei Антистресс из нашего каталога 100 мг магния (27% суточной нормы), 2 мг B6, 100 мг таурина, витамины C и K; одна таблетка растворяется в стакане воды. Магний может влиять на всасывание некоторых антибиотиков и препаратов от остеопороза, поэтому при постоянном приёме лекарств согласуйте интервал с врачом или фармацевтом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Magniyni ertalab yoki kechqurun ichgan yaxshimi? Qatʼiy qoida yoʻq; koʻpchilik uni ovqat bilan ichadi, shunda oshqozonga yengilroq tushadi. Uyqu va magniy haqida alohida maqolamiz bor: «Magniy va uyqu».",
            "Magniy sitrat va magniy B6 ni birga ichsa boʻladimi? Bunda magniy miqdori qoʻshilib ketadi va yuqori chegaradan oshishi mumkin. Odatda bitta mahsulot tanlanadi; ikkalasi kerakmi, shifokor bilan maslahatlashing.",
            "Mushak tortishishi magniy yetishmasligini bildiradimi? Bunday belgining sababi turlicha boʻlishi mumkin. Tez-tez takrorlansa, oʻzingiz xulosa qilmasdan shifokorga murojaat qiling.",
          ],
          ru: [
            "Когда лучше принимать магний — утром или вечером? Строгого правила нет; многие принимают его во время еды, так он легче переносится. О сне и магнии у нас есть отдельная статья: «Магний и сон».",
            "Можно ли принимать магний цитрат и магний B6 вместе? Количество магния при этом складывается и может превысить верхний предел. Обычно выбирают один продукт; нужны ли оба — обсудите с врачом.",
            "Означают ли судороги в мышцах нехватку магния? Причины такого признака бывают разными. Если он повторяется часто, не делайте выводов сами, а обратитесь к врачу.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-neuroforce-30"],
  },
  {
    slug: "foliy-kislota-nima-uchun-kerak",
    date: "2026-11-19",
    imageSeed: "bank-folate-spinach",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Foliy kislota: nima uchun kerak va qanday ichiladi",
      ru: "Фолиевая кислота: для чего нужна и как принимать",
    },
    excerpt: {
      uz: "Folat va foliy kislota farqi, kunlik meʼyor, homiladorlikni rejalashtirishda JSST tavsiyasi, metilfolat va kimlar ehtiyot boʻlishi kerak.",
      ru: "Разница между фолатом и фолиевой кислотой, суточная норма, рекомендация ВОЗ при планировании беременности, метилфолат и кому нужна осторожность.",
    },
    sections: [
      {
        heading: { uz: "Folat va foliy kislota: farqi nimada", ru: "Фолат и фолиевая кислота: в чём разница" },
        paragraphs: {
          uz: [
            "Folat — B9 vitaminining ovqatda tabiiy uchraydigan shakllari umumiy nomi. Foliy kislota esa uning sintetik shakli: u qoʻshimchalarda va boyitilgan unda ishlatiladi. NIH ODS maʼlumotiga koʻra, qoʻshimchadagi foliy kislota ovqatdagi folatga qaraganda yaxshiroq soʻriladi.",
            "EFSA maʼqullagan formulalarga koʻra, folat hujayralar boʻlinishi jarayonida, normal qon hosil boʻlishida va homiladorlikda ona toʻqimalarining oʻsishida ishtirok etadi, shuningdek normal psixologik faoliyatga va charchoq hissini kamaytirishga hissa qoʻshadi.",
          ],
          ru: [
            "Фолат — общее название природных форм витамина B9 в пище. Фолиевая кислота — его синтетическая форма: она используется в добавках и обогащённой муке. По данным NIH ODS, фолиевая кислота из добавок усваивается лучше, чем фолат из пищи.",
            "По формулировкам, одобренным EFSA, фолат участвует в процессе деления клеток, нормальном кроветворении и росте тканей матери во время беременности, а также способствует нормальной психологической функции и уменьшению ощущения усталости.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor qancha", ru: "Какова суточная норма" },
        paragraphs: {
          uz: [
            "NIH ODS boʻyicha kattalar uchun tavsiya etilgan miqdor kuniga 400 mkg DFE (folat ekvivalenti), homiladorlikda 600 mkg, emizish davrida 500 mkg. DFE birligi ovqatdagi folat va qoʻshimchadagi foliy kislotaning turlicha soʻrilishini hisobga oladi.",
            "Qoʻshimcha va boyitilgan mahsulotlardan olinadigan foliy kislota uchun kattalarga yuqori chegara kuniga 1000 mkg. Ovqatdagi tabiiy folat bu chegaraga kirmaydi. Qadoqdagi dozadan koʻp ichish kerak boʻlsa, bu faqat shifokor tavsiyasi bilan boʻlishi kerak.",
          ],
          ru: [
            "По NIH ODS рекомендуемое количество для взрослых — 400 мкг DFE (фолатного эквивалента) в сутки, при беременности — 600 мкг, при кормлении грудью — 500 мкг. Единица DFE учитывает разное усвоение фолата из пищи и фолиевой кислоты из добавок.",
            "Для фолиевой кислоты из добавок и обогащённых продуктов верхний предел у взрослых — 1000 мкг в сутки. Природный фолат из пищи в этот предел не входит. Принимать больше дозы на упаковке можно только по рекомендации врача.",
          ],
        },
      },
      {
        heading: { uz: "Homiladorlikni rejalashtirishda", ru: "При планировании беременности" },
        paragraphs: {
          uz: [
            "Jahon sogʻliqni saqlash tashkiloti (JSST) homilador boʻlishni rejalashtirayotgan ayollarga homiladorlikdan oldin va homiladorlikning dastlabki 12 haftasi davomida kuniga 400 mkg foliy kislota ichishni tavsiya qiladi. Bu davr homila asab naychasi shakllanadigan vaqtga toʻgʻri keladi, va koʻpincha ayol hali homiladorligini bilmaydi — shuning uchun tavsiya oldindan boshlashni nazarda tutadi.",
            "Ayrim ayollarga shifokor kattaroq doza tayinlashi mumkin (masalan, oilada tegishli holatlar boʻlsa yoki baʼzi dorilar ichilsa). Dozani oʻzingiz oshirmang: individual tavsiyani shifokor beradi. Homiladorlik davridagi boshqa vitaminlar haqida «Homiladorlikda qaysi vitaminlar kerak» maqolamizni oʻqing.",
          ],
          ru: [
            "Всемирная организация здравоохранения (ВОЗ) рекомендует женщинам, планирующим беременность, принимать 400 мкг фолиевой кислоты в сутки до беременности и в течение первых 12 недель беременности. Этот период совпадает со временем формирования нервной трубки плода, а женщина часто ещё не знает о беременности — поэтому рекомендация предполагает начинать заранее.",
            "Некоторым женщинам врач может назначить более высокую дозу (например, при соответствующих случаях в семье или приёме некоторых лекарств). Не увеличивайте дозу сами: индивидуальную рекомендацию даёт врач. О других витаминах во время беременности читайте в статье «Какие витамины нужны при беременности».",
          ],
        },
      },
      {
        heading: { uz: "Metilfolat nima", ru: "Что такое метилфолат" },
        paragraphs: {
          uz: [
            "Metilfolat (5-MTHF) — folatning organizmda faol ishlaydigan shakli; u ham qoʻshimchalarda sotiladi. Ayrim odamlarda MTHFR genidagi oʻzgarish tufayli foliy kislotaning faol shaklga aylanishi sekinroq boʻlishi mumkin, shuning uchun bu shakl haqida koʻp soʻraladi.",
            "JSST va koʻpchilik rasmiy tavsiyalar homiladorlikni rejalashtirishda aynan foliy kislotani nazarda tutadi. Qaysi shakl sizga mosligini oʻzingiz tanlamang: genetik tahlil natijasi yoki maxsus holat boʻlsa, buni shifokor bilan muhokama qiling.",
          ],
          ru: [
            "Метилфолат (5-MTHF) — форма фолата, которая работает в организме активно; её тоже продают в добавках. У некоторых людей из-за изменения в гене MTHFR превращение фолиевой кислоты в активную форму может идти медленнее, поэтому об этой форме часто спрашивают.",
            "ВОЗ и большинство официальных рекомендаций при планировании беременности имеют в виду именно фолиевую кислоту. Не выбирайте форму сами: если есть результат генетического анализа или особая ситуация, обсудите это с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda va qanday qoʻshimchalarda bor", ru: "В каких продуктах и добавках есть" },
        paragraphs: {
          uz: [
            "Folat koʻp boʻlgan ovqatlar: ismaloq va boshqa yashil bargli sabzavotlar, brokkoli, noʻxat, loviya va yasmiq, apelsin, avokado, jigar, tuxum. Uzoq qaynatish folatning bir qismini parchalaydi, shuning uchun sabzavotlarni qisqa vaqt pishirish yoki bugʻda tayyorlash maʼqul.",
            "Katalogimizda Swiss Energy Prenatal Forte bor: unda 400 mkg folat, temir va boshqa vitamin-minerallar mavjud, homiladorlik davri uchun moʻljallangan. Swiss Energy NeuroForce B-kompleksida ham B9 bor. Bir nechta mahsulot ichsangiz, foliy kislota miqdorini qoʻshib hisoblang.",
          ],
          ru: [
            "Продукты, богатые фолатом: шпинат и другие зелёные листовые овощи, брокколи, горох, фасоль и чечевица, апельсины, авокадо, печень, яйца. Долгая варка разрушает часть фолата, поэтому овощи лучше готовить недолго или на пару.",
            "В нашем каталоге есть Swiss Energy Prenatal Forte: в нём 400 мкг фолата, железо и другие витамины и минералы, он предназначен для периода беременности. B9 есть и в B-комплексе Swiss Energy NeuroForce. Если принимаете несколько продуктов, суммируйте количество фолиевой кислоты.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Foliy kislotani qachon ichish kerak? Odatda kuniga bir marta, qadoqdagi koʻrsatmaga koʻra; ovqat bilan yoki ovqatsiz ichish mumkin. Muhimi — muntazamlik.",
            "Erkaklarga ham foliy kislota kerakmi? Folat har bir odamga kerak va odatda ovqatdan olinadi. Qoʻshimcha zarurligini ratsion va shifokor tavsiyasi hal qiladi.",
            "Foliy kislota B12 bilan qanday bogʻliq? Yuqori dozadagi foliy kislota B12 tanqisligi belgilarini yashirishi mumkin. Shuning uchun uzoq muddat yuqori doza ichishdan oldin shifokor bilan maslahatlashing, ayniqsa 50 yoshdan oshgan va vegetarian ovqatlanadigan boʻlsangiz.",
          ],
          ru: [
            "Когда принимать фолиевую кислоту? Обычно один раз в день, по инструкции на упаковке; можно во время еды или без неё. Главное — регулярность.",
            "Нужна ли фолиевая кислота мужчинам? Фолат нужен каждому и обычно поступает с пищей. Нужна ли добавка, решают рацион и рекомендация врача.",
            "Как фолиевая кислота связана с B12? Высокие дозы фолиевой кислоты могут маскировать признаки недостатка B12. Поэтому перед длительным приёмом высоких доз посоветуйтесь с врачом, особенно если вам больше 50 лет или вы вегетарианец.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-prenatal-forte-60", "swiss-energy-neuroforce-30"],
  },
  {
    slug: "vitamin-e-nima-uchun-kerak",
    date: "2026-11-19",
    imageSeed: "bank-seeds-jars",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Vitamin E: nima uchun kerak va qayerdan olish",
      ru: "Витамин Е: для чего нужен и где его найти",
    },
    excerpt: {
      uz: "Vitamin E (tokoferol) organizmda qanday vazifa bajaradi, kunlik meʼyor va yuqori chegara qancha, qaysi ovqatlarda koʻp va qoʻshimchani qanday tanlash kerak.",
      ru: "Какую роль в организме играет витамин Е (токоферол), какова суточная норма и верхний предел, в каких продуктах его много и как выбрать добавку.",
    },
    sections: [
      {
        heading: { uz: "Vitamin E nima", ru: "Что такое витамин Е" },
        paragraphs: {
          uz: [
            "Vitamin E — yogʻda eriydigan birikmalar guruhi; inson organizmida asosan alfa-tokoferol shakli ishlatiladi. Yogʻda eriganligi sababli u ovqatdagi yogʻ bilan birga yaxshiroq soʻriladi va organizmda maʼlum zaxira hosil qiladi.",
            "EFSA maʼqullagan formulaga koʻra, vitamin E hujayralarni oksidlovchi stressdan himoyalashga hissa qoʻshadi. Bu uning antioksidant vazifasi: u hujayra membranalaridagi yogʻlarni oksidlanishdan saqlashda ishtirok etadi. Bu formula kasallikka taʼsir haqida emas, balki vitaminning oddiy fiziologik roli haqida.",
          ],
          ru: [
            "Витамин Е — группа жирорастворимых соединений; в организме человека в основном используется форма альфа-токоферол. Поскольку он растворяется в жирах, он лучше усваивается вместе с жиром пищи и образует в организме определённый запас.",
            "По формулировке, одобренной EFSA, витамин Е способствует защите клеток от окислительного стресса. Это его антиоксидантная роль: он участвует в защите жиров клеточных мембран от окисления. Эта формулировка говорит не о влиянии на болезни, а об обычной физиологической роли витамина.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor va yuqori chegara", ru: "Суточная норма и верхний предел" },
        paragraphs: {
          uz: [
            "NIH ODS boʻyicha 14 yoshdan katta odamlar uchun tavsiya etilgan miqdor kuniga 15 mg alfa-tokoferol, emizish davrida 19 mg. EFSA Yevropa uchun biroz boshqacha qiymat beradi: erkaklarga 13 mg, ayollarga 11 mg. Qadoqlarda koʻpincha 12 mg «kunlik meʼyorning 100%» deb yoziladi — bu Yevropa yorliq meʼyori.",
            "Yuqori chegaralar ham manbaga qarab farq qiladi: AQSHda qoʻshimchadan olinadigan alfa-tokoferol uchun kattalarga 1000 mg, EFSA esa kuniga 300 mg chegarani belgilagan. Ehtiyotkor yoʻl — past chegarani moʻljal qilish. Yuqori dozalar qon ivishiga taʼsir qilishi mumkin.",
          ],
          ru: [
            "По NIH ODS рекомендуемое количество для людей старше 14 лет — 15 мг альфа-токоферола в сутки, при кормлении грудью — 19 мг. EFSA для Европы даёт немного иные значения: мужчинам 13 мг, женщинам 11 мг. На упаковках часто пишут 12 мг как «100% суточной нормы» — это европейская норма для маркировки.",
            "Верхние пределы тоже различаются в зависимости от источника: в США для альфа-токоферола из добавок у взрослых — 1000 мг, а EFSA установило предел 300 мг в сутки. Осторожный путь — ориентироваться на меньший предел. Высокие дозы могут влиять на свёртываемость крови.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda koʻp", ru: "В каких продуктах его много" },
        paragraphs: {
          uz: [
            "Vitamin E ning eng boy manbalari — oʻsimlik yogʻlari (kungaboqar, bugʻdoy murtagi, zaytun yogʻlari), kungaboqar urugʻi, bodom, yeryongʻoq va boshqa yongʻoqlar. Ismaloq va brokkoli kabi yashil sabzavotlarda ham bor, lekin kamroq miqdorda.",
            "NIH ODS yozishicha, sogʻlom va xilma-xil ovqatlanadigan odamlarda vitamin E tanqisligi kam uchraydi. U asosan yogʻ soʻrilishi buzilgan holatlarda (masalan, ayrim ichak va jigar kasalliklarida) kuzatiladi. Bunday holatda qoʻshimcha masalasini shifokor hal qiladi.",
          ],
          ru: [
            "Самые богатые источники витамина Е — растительные масла (подсолнечное, масло зародышей пшеницы, оливковое), семена подсолнечника, миндаль, арахис и другие орехи. Есть он и в зелёных овощах, таких как шпинат и брокколи, но в меньшем количестве.",
            "Как пишет NIH ODS, у здоровых людей с разнообразным питанием недостаток витамина Е встречается редко. Он наблюдается в основном при нарушении всасывания жиров (например, при некоторых заболеваниях кишечника и печени). В таком случае вопрос о добавке решает врач.",
          ],
        },
      },
      {
        heading: { uz: "Kimlar ehtiyot boʻlishi kerak", ru: "Кому нужна осторожность" },
        paragraphs: {
          uz: [
            "Qon suyultiruvchi dorilar (masalan, varfarin) ichadiganlar vitamin E qoʻshimchasini faqat shifokor bilan kelishib ichishi kerak: NIH ODS yuqori dozalar qon ketish xavfini oshirishi mumkinligini qayd etadi. Operatsiyadan oldin ham shifokorga qanday qoʻshimchalar ichayotganingizni ayting.",
            "Homiladorlik, emizish davri va bolalar uchun vitamin E dozasi alohida hisoblanadi. Bolalarga kattalar uchun moʻljallangan mahsulotni bermang; yoshiga mos multivitamin haqida «Bolalar uchun vitaminlar yoshga qarab» maqolamizni oʻqing.",
          ],
          ru: [
            "Людям, принимающим препараты для разжижения крови (например, варфарин), добавки с витамином Е можно принимать только по согласованию с врачом: NIH ODS отмечает, что высокие дозы могут повышать риск кровотечения. Перед операцией тоже сообщите врачу, какие добавки вы принимаете.",
            "При беременности, кормлении грудью и для детей доза витамина Е рассчитывается отдельно. Не давайте детям продукты для взрослых; о подходящих по возрасту мультивитаминах читайте статью «Витамины для детей по возрасту».",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimchani qanday tanlash", ru: "Как выбрать добавку" },
        paragraphs: {
          uz: [
            "Yorliqda vitamin E shakli va miqdorini toping: «d-alfa-tokoferol» — tabiiy shakl, «dl-alfa-tokoferol» — sintetik shakl. Miqdor mg yoki xalqaro birlikda (XB, IU) yozilishi mumkin; ularni bir-biriga taqqoslashda shaklni hisobga olish kerak. Kunlik meʼyorning foizi eng qulay moʻljal.",
            "Katalogimizdagi Dr. Frei Gold, Swiss Energy Visiovit va Dr. Frei Multivitamin + Biotin tarkibida bir porsiyada 12 mg vitamin E (yorliq meʼyorining 100%) bor; ular vitamin A, sink va boshqa komponentlar bilan birga keladi. Bir nechta kompleksni birga ichsangiz, vitamin E va A miqdorini qoʻshib hisoblang.",
          ],
          ru: [
            "Найдите на этикетке форму и количество витамина Е: «d-альфа-токоферол» — природная форма, «dl-альфа-токоферол» — синтетическая. Количество может быть указано в мг или международных единицах (МЕ, IU); при их сравнении нужно учитывать форму. Удобнее всего ориентироваться на процент суточной нормы.",
            "В составе Dr. Frei Gold, Swiss Energy Visiovit и Dr. Frei Мультивитамины + Биотин из нашего каталога в одной порции 12 мг витамина Е (100% нормы для маркировки); они содержат также витамин A, цинк и другие компоненты. Если принимаете несколько комплексов вместе, суммируйте количество витаминов Е и A.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Vitamin E ni qachon ichish kerak? Yogʻda eriydigan vitamin boʻlgani uchun uni yogʻ bor ovqat bilan ichgan maʼqul.",
            "Kapsuladagi vitamin E ni teriga surtsa boʻladimi? Kosmetik vositalarda tokoferol koʻp ishlatiladi, lekin ichish uchun moʻljallangan kapsulani teriga surtish yorliqda koʻrsatilmagan boʻlsa, uni shunday ishlatmang; teri uchun alohida vositalarni tanlang.",
            "Aevit nima? Bu vitamin A va E kombinatsiyasi nomi. Vitamin A ham yogʻda eriydi va organizmda toʻplanadi, shuning uchun bunday mahsulotni ham qadoqdagi dozadan oshirmasdan, ehtiyot boʻlib ichish kerak.",
          ],
          ru: [
            "Когда принимать витамин Е? Поскольку он жирорастворимый, его лучше принимать во время еды, содержащей жиры.",
            "Можно ли наносить витамин Е из капсул на кожу? Токоферол часто используется в косметике, но если на этикетке капсулы для приёма внутрь это не указано, не используйте её так; для кожи выбирайте отдельные средства.",
            "Что такое Аевит? Это название сочетания витаминов A и Е. Витамин A тоже жирорастворимый и накапливается в организме, поэтому такой продукт тоже нужно принимать осторожно, не превышая дозу на упаковке.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-gold-vitamins-20", "swiss-energy-visiovit-30", "dr-frei-multivitamins-biotin-20"],
  },
  {
    slug: "multivitamin-qanday-tanlash",
    date: "2026-11-19",
    imageSeed: "bank-multivitamin-assorted",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Multivitamin qanday tanlanadi: 7 ta mezon",
      ru: "Как выбрать мультивитамины: 7 критериев",
    },
    excerpt: {
      uz: "Multivitamin kimga kerak boʻlishi mumkin, yorliqdagi foizlarni qanday oʻqish, shakl, yosh va jinsga moslik, dozalarni qoʻshib hisoblash va boshqa mezonlar.",
      ru: "Кому могут понадобиться мультивитамины, как читать проценты на этикетке, форма выпуска, соответствие возрасту и полу, суммирование доз и другие критерии.",
    },
    sections: [
      {
        heading: { uz: "Multivitamin kimga kerak", ru: "Кому нужны мультивитамины" },
        paragraphs: {
          uz: [
            "NIH ODS taʼkidlashicha, sogʻlom va xilma-xil ovqatlanadigan odamlarning koʻpchiligi kerakli vitamin va minerallarni ovqatdan oladi. Multivitamin ovqatlanishni almashtirmaydi; u ratsiondagi boʻshliqlarni toʻldirish uchun ishlatiladi.",
            "Ratsion cheklangan odamlar (masalan, vegetarianlar, kam ovqatlanadiganlar), keksalar, homiladorlikni rejalashtirayotgan va homilador ayollar uchun ayrim vitamin va minerallarga ehtiyoj alohida boʻlishi mumkin. Bu holatlarda qaysi mahsulot kerakligini shifokor bilan aniqlash maʼqul. Quyidagi 7 mezon tanlashda yordam beradi.",
          ],
          ru: [
            "Как подчёркивает NIH ODS, большинство здоровых людей с разнообразным питанием получают нужные витамины и минералы из пищи. Мультивитамины не заменяют питание; их используют, чтобы восполнить пробелы в рационе.",
            "У людей с ограниченным рационом (например, вегетарианцев, тех, кто мало ест), пожилых людей, женщин, планирующих беременность, и беременных потребность в некоторых витаминах и минералах может быть особой. В таких случаях какой продукт нужен, лучше определить с врачом. Следующие 7 критериев помогут при выборе.",
          ],
        },
      },
      {
        heading: { uz: "1–2. Tarkib va kunlik meʼyor foizi", ru: "1–2. Состав и процент суточной нормы" },
        paragraphs: {
          uz: [
            "Birinchi mezon — tarkib: qaysi vitamin va minerallar bor va qaysilari yoʻq. Masalan, ayrim komplekslarda temir yoki yod boʻlmaydi, boshqalarida lyutein yoki biotin qoʻshilgan. Sizga kerakli komponent borligini tekshiring.",
            "Ikkinchi mezon — har bir komponentning kunlik meʼyorga nisbatan foizi. Koʻp hollarda 100% atrofidagi miqdor yetarli moʻljal hisoblanadi. Foizi bir necha yuz yoki ming boʻlgan komponentlar har doim ham yaxshiroq emas: ayniqsa vitamin A, D, E, B6 va temir uchun yuqori chegaralar bor.",
          ],
          ru: [
            "Первый критерий — состав: какие витамины и минералы есть, а каких нет. Например, в некоторых комплексах нет железа или йода, в других добавлены лютеин или биотин. Проверьте, есть ли нужный вам компонент.",
            "Второй критерий — процент каждого компонента от суточной нормы. Во многих случаях количество около 100% — разумный ориентир. Компоненты с процентом в несколько сотен или тысяч не всегда лучше: особенно для витаминов A, D, E, B6 и железа есть верхние пределы.",
          ],
        },
      },
      {
        heading: { uz: "3–4. Yosh, jins va holatga moslik", ru: "3–4. Соответствие возрасту, полу и состоянию" },
        paragraphs: {
          uz: [
            "Uchinchi mezon — yosh. Bolalar uchun komplekslar boshqa dozada boʻladi, kattalar mahsulotini bolaga bermang. Yorliqda «14+», «3 yoshdan» kabi koʻrsatma boʻladi — unga amal qiling. Bolalar uchun batafsil: «Bolalar uchun vitaminlar yoshga qarab».",
            "Toʻrtinchi mezon — jins va holat. Homiladorlik uchun mahsulotlarda folat va temir koʻproq boʻladi; erkaklar uchun komplekslarda koʻpincha sink va selen urgʻulanadi. Homiladorlikda faqat shu davr uchun moʻljallangan mahsulotni va shifokor tavsiyasini tanlang.",
          ],
          ru: [
            "Третий критерий — возраст. Детские комплексы выпускаются в других дозах, не давайте ребёнку продукт для взрослых. На этикетке есть указание вроде «14+» или «с 3 лет» — следуйте ему. Подробно о детях: «Витамины для детей по возрасту».",
            "Четвёртый критерий — пол и состояние. В продуктах для беременных больше фолата и железа; в мужских комплексах часто делают акцент на цинке и селене. При беременности выбирайте только продукт, предназначенный для этого периода, и следуйте рекомендации врача.",
          ],
        },
      },
      {
        heading: { uz: "5–6. Shakl va boshqa qoʻshimchalar bilan yigʻindi", ru: "5–6. Форма выпуска и сумма с другими добавками" },
        paragraphs: {
          uz: [
            "Beshinchi mezon — shakl. Tabletka va kapsula odatiy variant; shipuchi tabletka suvda eriydi va yutish qiyin boʻlganlar uchun qulay, lekin unda natriy boʻladi — tuz cheklangan boʻlsa, buni hisobga oling. Shipuchi vitaminlar haqida alohida maqolamiz bor.",
            "Oltinchi mezon — boshqa qoʻshimchalar bilan yigʻindi. Multivitamin bilan birga alohida vitamin D, magniy yoki B-kompleks ichsangiz, bir xil komponentlar qoʻshilib ketadi. Ichayotgan hamma mahsulotlarning tarkibini yozib, kunlik jami miqdorni yuqori chegara bilan taqqoslang.",
          ],
          ru: [
            "Пятый критерий — форма. Таблетки и капсулы — обычный вариант; шипучая таблетка растворяется в воде и удобна тем, кому трудно глотать, но в ней есть натрий — учитывайте это, если соль ограничена. О шипучих витаминах у нас есть отдельная статья.",
            "Шестой критерий — сумма с другими добавками. Если вместе с мультивитаминами вы принимаете отдельно витамин D, магний или B-комплекс, одинаковые компоненты складываются. Выпишите состав всех продуктов и сравните суточную сумму с верхним пределом.",
          ],
        },
      },
      {
        heading: { uz: "7. Yorliq, ishlab chiqaruvchi va saqlash", ru: "7. Этикетка, производитель и хранение" },
        paragraphs: {
          uz: [
            "Yettinchi mezon — yorliqning toʻliqligi: ishlab chiqaruvchi, mamlakat, partiya raqami, yaroqlilik muddati, porsiyadagi miqdorlar va qabul qilish tartibi aniq yozilgan boʻlishi kerak. Kasallikni yoʻqotishni vaʼda qiladigan mahsulotlardan ehtiyot boʻling: ovqat qoʻshimchasi dori vositasi emas.",
            "Vitaminlarni namlik va issiqdan uzoqda, bolalar yeta olmaydigan joyda saqlang; shipuchi tabletkalar trubkasini har safar mahkam yoping. Katalogimizdagi variantlar: Dr. Frei Multivitamin + Biotin (A, C, D, E, B guruhi va biotin, har biri 100% atrofida), Dr. Frei Gold (lyutein, A, C, E, sink), bolalar uchun Dr. Frei Kids va immunitet uchun Swiss Energy Immunovit.",
          ],
          ru: [
            "Седьмой критерий — полнота этикетки: должны быть чётко указаны производитель, страна, номер партии, срок годности, количество в порции и порядок приёма. Остерегайтесь продуктов, обещающих избавить от болезни: пищевая добавка — не лекарство.",
            "Храните витамины вдали от влаги и тепла, в недоступном для детей месте; тубу с шипучими таблетками каждый раз плотно закрывайте. Варианты из нашего каталога: Dr. Frei Мультивитамины + Биотин (A, C, D, E, группа B и биотин, каждый около 100%), Dr. Frei Gold (лютеин, A, C, E, цинк), для детей Dr. Frei Kids и для иммунитета Swiss Energy Immunovit.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Multivitaminni qancha vaqt ichish kerak? Qadoqda kurs davomiyligi koʻrsatiladi; uzoq muddat ichishni rejalashtirsangiz, shifokor bilan maslahatlashing.",
            "Ertalab ichgan yaxshimi? Koʻpchilik multivitaminni nonushta bilan ichadi: yogʻda eriydigan vitaminlar (A, D, E) ovqat bilan yaxshiroq soʻriladi, oshqozonga ham yengilroq tushadi.",
            "Qimmat multivitamin arzonidan yaxshiroqmi? Narx tarkib sifatini kafolatlamaydi. Tarkib, foizlar, sizga moslik va yorliqning toʻliqligini solishtiring.",
          ],
          ru: [
            "Сколько времени принимать мультивитамины? Продолжительность курса указана на упаковке; если планируете долгий приём, посоветуйтесь с врачом.",
            "Лучше принимать утром? Многие принимают мультивитамины за завтраком: жирорастворимые витамины (A, D, E) лучше усваиваются с едой, и так они легче переносятся желудком.",
            "Дорогие мультивитамины лучше дешёвых? Цена не гарантирует качество состава. Сравнивайте состав, проценты, соответствие вам и полноту этикетки.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-multivitamins-biotin-20", "dr-frei-gold-vitamins-20", "dr-frei-kids-multivitamins-20", "swiss-energy-immunovit-30"],
  },
  {
    slug: "bad-nima-dori-vositasidan-farqi",
    date: "2026-11-19",
    imageSeed: "bank-label-reading",
    category: { uz: "Bilim", ru: "Знания" },
    categoryKey: "science",
    title: {
      uz: "BAD nima va dori vositasidan qanday farq qiladi",
      ru: "Что такое БАД и чем он отличается от лекарства",
    },
    excerpt: {
      uz: "Biologik faol qoʻshimcha (BAD) nima, u dori vositasidan qanday farq qiladi, yorliqni qanday oʻqish va xavfsiz tanlash uchun nimalarga eʼtibor berish kerak.",
      ru: "Что такое биологически активная добавка (БАД), чем она отличается от лекарства, как читать этикетку и на что обратить внимание для безопасного выбора.",
    },
    sections: [
      {
        heading: { uz: "BAD nima", ru: "Что такое БАД" },
        paragraphs: {
          uz: [
            "BAD — biologik faol qoʻshimcha, xalqaro amaliyotda «ovqat qoʻshimchasi» (food supplement, dietary supplement) deb ataladi. Bu — oddiy ratsionni toʻldirish uchun moʻljallangan, vitamin, mineral, aminokislota, oʻsimlik ekstrakti kabi moddalarni kichik dozada oʻz ichiga olgan mahsulot. Tabletka, kapsula, kukun, shipuchi tabletka yoki sirop shaklida chiqariladi.",
            "Yevropa Ittifoqida ovqat qoʻshimchalari oziq-ovqat qonunchiligi doirasida tartibga solinadi (2002/46/EC direktivasi), AQSHda esa «dietary supplement» toifasiga kiradi. Ikkalasida ham bu mahsulotlar dori emas, balki oziq-ovqat turi hisoblanadi. Shuning uchun govita saytidagi har bir qoʻshimcha sahifasida «Dori vositasi emas» degan ogohlantirish bor.",
          ],
          ru: [
            "БАД — биологически активная добавка, в международной практике её называют «пищевой добавкой» (food supplement, dietary supplement). Это продукт, предназначенный для дополнения обычного рациона и содержащий в небольших дозах такие вещества, как витамины, минералы, аминокислоты, растительные экстракты. Выпускается в виде таблеток, капсул, порошков, шипучих таблеток или сиропов.",
            "В Европейском союзе пищевые добавки регулируются в рамках пищевого законодательства (директива 2002/46/EC), в США они относятся к категории «dietary supplement». В обоих случаях эти продукты считаются не лекарствами, а видом пищи. Поэтому на странице каждой добавки на сайте govita есть предупреждение «Не является лекарственным средством».",
          ],
        },
      },
      {
        heading: { uz: "Dori vositasidan asosiy farqlar", ru: "Главные отличия от лекарства" },
        paragraphs: {
          uz: [
            "Dori vositasi kasallikka taʼsir qilish uchun moʻljallangan va roʻyxatdan oʻtishdan oldin samaradorligi va xavfsizligi klinik sinovlarda baholanadi; uni shifokor tayinlaydi va dozasini belgilaydi. BAD esa ratsionni toʻldiradi va kasallikka taʼsir haqida daʼvo qila olmaydi.",
            "Yevropada ovqat qoʻshimchasi yorligʻida faqat EFSA baholagan va maʼqullangan formulalarni yozish mumkin (1924/2006-sonli reglament): masalan, «vitamin C immun tizimning normal faoliyatiga hissa qoʻshadi». Mahsulot biror kasallikdan xalos qilishini vaʼda qilsa, bu ruxsat etilgan formula emas — bunday mahsulotga ehtiyot boʻlib qarang.",
          ],
          ru: [
            "Лекарство предназначено для воздействия на болезнь, и до регистрации его эффективность и безопасность оцениваются в клинических испытаниях; его назначает врач и определяет дозу. БАД же дополняет рацион и не может заявлять о воздействии на болезнь.",
            "В Европе на этикетке пищевой добавки можно писать только формулировки, оценённые и одобренные EFSA (регламент 1924/2006): например, «витамин C способствует нормальной работе иммунной системы». Если продукт обещает избавить от какой-либо болезни, это не разрешённая формулировка — относитесь к такому продукту с осторожностью.",
          ],
        },
      },
      {
        heading: { uz: "«Tabiiy» degani xavfsiz degani emas", ru: "«Натуральный» не значит безопасный" },
        paragraphs: {
          uz: [
            "Qoʻshimchalar ham organizmga taʼsir qiluvchi moddalar. NIH ODS ogohlantirishicha, ayrim qoʻshimchalar dorilar bilan oʻzaro taʼsir qilishi mumkin: masalan, vitamin K qon suyultiruvchi dorilar bilan, ayrim oʻsimlik ekstraktlari esa boshqa dorilar bilan. Yuqori dozalar ham muammo tugʻdirishi mumkin — vitamin A, D, E, B6, temir va boshqalar uchun yuqori chegaralar bor.",
            "Shuning uchun doimiy dori ichadiganlar, homilador va emizikli ayollar, bolalar, surunkali kasalligi borlar va operatsiyaga tayyorlanayotganlar qoʻshimchani boshlashdan oldin shifokor yoki farmatsevt bilan maslahatlashishi kerak. Qabulda qanday qoʻshimchalar ichayotganingizni albatta ayting.",
          ],
          ru: [
            "Добавки — тоже вещества, влияющие на организм. Как предупреждает NIH ODS, некоторые добавки могут взаимодействовать с лекарствами: например, витамин K — с препаратами для разжижения крови, а некоторые растительные экстракты — с другими лекарствами. Высокие дозы тоже могут создавать проблемы — для витаминов A, D, E, B6, железа и других есть верхние пределы.",
            "Поэтому людям, постоянно принимающим лекарства, беременным и кормящим женщинам, детям, людям с хроническими заболеваниями и тем, кто готовится к операции, нужно посоветоваться с врачом или фармацевтом перед началом приёма добавки. На приёме обязательно скажите, какие добавки вы принимаете.",
          ],
        },
      },
      {
        heading: { uz: "Yorliqni qanday oʻqish kerak", ru: "Как читать этикетку" },
        paragraphs: {
          uz: [
            "Yorliqda quyidagilar boʻlishi kerak: mahsulot nomi va «ovqat qoʻshimchasi» yoki «BAD» degan belgi, tarkib va bir porsiyadagi miqdor (koʻpincha kunlik meʼyor foizi bilan), qabul qilish tartibi, ogohlantirishlar, ishlab chiqaruvchi va mamlakat, partiya raqami va yaroqlilik muddati.",
            "Bir nechta qoʻshimcha ichsangiz, ularning tarkibini taqqoslang: bir xil vitamin bir nechta mahsulotda boʻlsa, kunlik yigʻindi oshib ketishi mumkin. Qadoqdagi dozani oʻzingiz oshirmang. Multivitamin tanlash boʻyicha batafsil: «Multivitamin qanday tanlanadi: 7 ta mezon».",
          ],
          ru: [
            "На этикетке должно быть: название продукта и пометка «пищевая добавка» или «БАД», состав и количество в порции (часто с процентом суточной нормы), способ применения, предупреждения, производитель и страна, номер партии и срок годности.",
            "Если вы принимаете несколько добавок, сравните их состав: если один и тот же витамин есть в нескольких продуктах, суточная сумма может оказаться превышенной. Не увеличивайте дозу на упаковке самостоятельно. Подробнее о выборе мультивитаминов: «Как выбрать мультивитамины: 7 критериев».",
          ],
        },
      },
      {
        heading: { uz: "Qayerdan sotib olish maʼqul", ru: "Где лучше покупать" },
        paragraphs: {
          uz: [
            "Qoʻshimchani ishonchli sotuvchidan — dorixona yoki rasmiy distribyutordan oling: u mahsulotning kelib chiqishi, saqlash sharoiti va yaroqlilik muddati uchun javob beradi. Notanish sahifalardagi «moʻjizaviy» vaʼdali, tarkibi yozilmagan yoki yorligʻi chet tilida tushunarsiz mahsulotlardan saqlaning.",
            "govita katalogida har bir mahsulot sahifasida tarkib, kunlik meʼyor foizi, qabul qilish tartibi va ishlab chiqaruvchi koʻrsatiladi. Savol tugʻilsa, operatorimizdan soʻrang, ammo tibbiy maslahat uchun shifokorga murojaat qiling.",
          ],
          ru: [
            "Покупайте добавки у надёжного продавца — в аптеке или у официального дистрибьютора: он отвечает за происхождение продукта, условия хранения и срок годности. Избегайте продуктов с «чудодейственными» обещаниями на незнакомых страницах, без указанного состава или с непонятной иностранной этикеткой.",
            "В каталоге govita на странице каждого продукта указаны состав, процент суточной нормы, способ применения и производитель. Если появятся вопросы, спросите нашего оператора, но за медицинским советом обращайтесь к врачу.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "BAD ni dori oʻrniga ichsa boʻladimi? Yoʻq. Shifokor tayinlagan dorini qoʻshimcha bilan almashtirmang va dori ichishni oʻzingiz toʻxtatmang.",
            "BAD ni retseptsiz olsa boʻladimi? Ha, odatda ovqat qoʻshimchalari retseptsiz sotiladi. Lekin retsept kerak emasligi har kimga mos degani emas — yuqoridagi ehtiyot qoidalariga amal qiling.",
            "Vitaminlar ham BAD hisoblanadimi? Vitamin va mineral qoʻshimchalarining koʻpchiligi ovqat qoʻshimchasi sifatida roʻyxatdan oʻtadi. Ayrim yuqori dozali vitamin preparatlari esa dori sifatida chiqariladi — buni qadoqdagi belgi koʻrsatadi.",
          ],
          ru: [
            "Можно ли принимать БАД вместо лекарства? Нет. Не заменяйте назначенное врачом лекарство добавкой и не прекращайте приём лекарства самостоятельно.",
            "Можно ли купить БАД без рецепта? Да, обычно пищевые добавки продаются без рецепта. Но отсутствие рецепта не означает, что продукт подходит всем — соблюдайте правила осторожности, описанные выше.",
            "Витамины — это тоже БАД? Большинство добавок с витаминами и минералами регистрируются как пищевые добавки. А некоторые витаминные препараты в высоких дозах выпускаются как лекарства — это показывает пометка на упаковке.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-multivitamins-biotin-20", "swiss-energy-vitamin-c-20", "swiss-energy-immunovit-30"],
  },
];
