import type { RawArticle } from "./blog";

/*
  SEO batch, 2026-11-26. General guidance only, no promise of effect (blog.test.ts runs the
  claim checks). Sources: NIH Office of Dietary Supplements fact sheets (vitamin D, vitamin B12,
  iron, zinc, omega-3, vitamin A, vitamin C, folate), EFSA tolerable upper intake levels and
  authorised health claims, WHO. Photos: Adobe Stock bank, docs/IMAGE-BANK.md.
*/
export const articlesNov2026k: RawArticle[] = [
  {
    slug: "vitamin-d-tahlili-25-oh-normasi",
    date: "2026-11-26",
    imageSeed: "bank4-blood-tests",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "nutrition",
    title: {
      uz: "Vitamin D tahlili: 25(OH)D natijasini qanday oʻqish",
      ru: "Анализ на витамин D: как читать результат 25(OH)D",
    },
    excerpt: {
      uz: "25(OH)D tahlili nimani koʻrsatadi, ng/ml va nmol/l qanday oʻzgartiriladi, NIH boʻyicha chegaralar, tahlilni qachon topshirish va natijadan keyin nima qilish kerak.",
      ru: "Что показывает анализ 25(OH)D, как перевести нг/мл в нмоль/л, границы по NIH, когда сдавать анализ и что делать с результатом.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob: tahlil nimani koʻrsatadi", ru: "Коротко: что показывает анализ" },
        paragraphs: {
          uz: [
            "Vitamin D holati qonda 25-gidroksivitamin D, yaʼni 25(OH)D miqdori bilan baholanadi. Bu — organizmdagi vitamin D ning asosiy aylanib yuruvchi shakli: u quyosh nuri, ovqat va qoʻshimchalardan olingan vitamin D ni birga hisobga oladi. Shuning uchun tahlil «ovqatda nima yedim» emas, «umumiy zaxira qanday» degan savolga javob beradi.",
            "Natijani oʻqish uchun ikki narsani bilish kerak: oʻlchov birligi (ng/ml yoki nmol/l) va laboratoriyaning oʻz mezonlari. Quyida NIH Dietary Supplements ofisi (NIH ODS) qoʻllaydigan umumiy chegaralar keltirilgan; yakuniy izohni esa shifokor sizning holatingizga qarab beradi.",
          ],
          ru: [
            "Статус витамина D оценивают по уровню 25-гидроксивитамина D, то есть 25(OH)D в крови. Это основная циркулирующая форма витамина D: она учитывает всё, что поступило из солнечного света, еды и добавок. Поэтому анализ отвечает не на вопрос «что я съел», а на вопрос «каков общий запас».",
            "Чтобы прочитать результат, нужно знать две вещи: единицу измерения (нг/мл или нмоль/л) и собственные референсы лаборатории. Ниже — общие границы, которые использует Управление пищевых добавок NIH (NIH ODS); окончательную трактовку даёт врач с учётом вашей ситуации.",
          ],
        },
      },
      {
        heading: { uz: "ng/ml va nmol/l: birlikni oʻzgartirish", ru: "нг/мл и нмоль/л: перевод единиц" },
        paragraphs: {
          uz: [
            "Oʻzbekiston laboratoriyalarida natija ikki xil birlikda chiqishi mumkin. Oʻzgartirish oddiy: 1 ng/ml = 2,5 nmol/l. Demak, 20 ng/ml — 50 nmol/l, 30 ng/ml — 75 nmol/l, 12 ng/ml — 30 nmol/l.",
            "Raqamni boshqa laboratoriya yoki internetdagi jadval bilan solishtirishdan oldin birliklar bir xilligini tekshiring. Eng koʻp uchraydigan xato — ng/ml dagi «25» ni nmol/l deb oʻqib, natijani haqiqatdan past deb hisoblash.",
          ],
          ru: [
            "В лабораториях Узбекистана результат могут выдавать в разных единицах. Перевод простой: 1 нг/мл = 2,5 нмоль/л. Значит, 20 нг/мл — это 50 нмоль/л, 30 нг/мл — 75 нмоль/л, 12 нг/мл — 30 нмоль/л.",
            "Прежде чем сравнивать цифру с таблицей из интернета или с результатом другой лаборатории, убедитесь, что единицы одинаковые. Самая частая ошибка — прочитать «25» нг/мл как нмоль/л и решить, что результат гораздо ниже реального.",
          ],
        },
      },
      {
        heading: { uz: "NIH ODS chegaralari", ru: "Границы по NIH ODS" },
        paragraphs: {
          uz: [
            "NIH ODS maʼlumotiga koʻra: 30 nmol/l (12 ng/ml) dan past daraja — tanqislik, yaʼni suyak va mushaklar uchun yetarli emas; 30 dan 50 nmol/l gacha (12–20 ng/ml) — baʼzi odamlar uchun yetarli emas; 50 nmol/l (20 ng/ml) va undan yuqori — aholining koʻpchiligi uchun yetarli; 125 nmol/l (50 ng/ml) dan yuqori — salbiy taʼsir xavfi bilan bogʻliq boʻlishi mumkin.",
            "Bu chegaralar umumiy aholi uchun; ayrim mutaxassislar boshqa maqsadli qiymatlar qoʻllaydi, shuning uchun turli manbalarda raqamlar farq qilishi mumkin. Muhim narsa — natijani oʻzingiz «tuzatishga» urinmaslik: past va yuqori chegaralar orasidagi keng oraliqda koʻpchilik sogʻlom odam turadi.",
            "Natijaga faqat ovqat va qoʻshimcha emas, boshqa omillar ham taʼsir qiladi: yoshi katta odamlarda terida vitamin D hosil boʻlishi kamayadi, toʻq rangli teri quyosh nurini kamroq oʻtkazadi, ortiqcha vazn D vitaminini yogʻ toʻqimasida ushlab qolishi mumkin. Yashash joyi va yilning vaqti ham muhim: qishda quyosh burchagi past boʻlgani uchun teri D vitamini deyarli hosil qilmaydi.",
            "Laboratoriyalar oʻlchash usullari bilan ham farq qiladi, shuning uchun bir odamning bir xil qonidan ikki joyda biroz boshqacha raqam chiqishi mumkin. Ikki natijani taqqoslashda kichik farqlarga (masalan, 1–3 ng/ml) ahamiyat bermang, tendensiyaga qarang.",
          ],
          ru: [
            "По данным NIH ODS: уровень ниже 30 нмоль/л (12 нг/мл) — дефицит, то есть недостаточно для костей и мышц; от 30 до 50 нмоль/л (12–20 нг/мл) — для некоторых людей недостаточно; 50 нмоль/л (20 нг/мл) и выше — достаточно для большинства населения; выше 125 нмоль/л (50 нг/мл) — может быть связано с риском нежелательных эффектов.",
            "Эти границы даны для общего населения; некоторые специалисты используют другие целевые значения, поэтому в разных источниках цифры могут отличаться. Главное — не пытаться «исправить» результат самостоятельно: в широком диапазоне между нижней и верхней границей находится большинство здоровых людей.",
            "На результат влияют не только еда и добавки, но и другие факторы: с возрастом выработка витамина D в коже снижается, тёмная кожа пропускает меньше солнечного света, а избыточный вес может «удерживать» витамин D в жировой ткани. Важны также место жительства и время года: зимой солнце стоит низко, и кожа почти не вырабатывает витамин D.",
            "Лаборатории различаются и методами измерения, поэтому из одной и той же крови в двух местах может получиться немного разная цифра. При сравнении двух результатов не придавайте значения небольшой разнице (например, 1–3 нг/мл), смотрите на динамику.",
          ],
        },
      },
      {
        heading: { uz: "Tahlilni kim va qachon topshiradi", ru: "Кому и когда сдавать анализ" },
        paragraphs: {
          uz: [
            "Hamma uchun muntazam tekshiruv shart emas: tahlilni odatda shifokor sababi bor deb topganda buyuradi — masalan, suyak zichligi muammolari, soʻrilish buzilishi, quyosh nuri deyarli tushmaydigan hayot tarzi yoki yuqori dozali qoʻshimcha ichayotgan boʻlsangiz.",
            "Natijaga mavsum taʼsir qiladi: qish oxirida daraja yoz oxiriga qaraganda past boʻlishi odatiy. Shu sababli keyingi tahlilni taqqoslash uchun yilning shu vaqtida va bir laboratoriyada topshirgan maʼqul. Tahlil uchun maxsus tayyorgarlik odatda talab qilinmaydi, laboratoriya yoʻriqnomasiga qarang.",
            "NIH ODS vitamin D yetishmovchiligi xavfi yuqori guruhlarni sanaydi: faqat ona suti bilan oziqlanadigan chaqaloqlar, keksalar, quyosh nurida kam boʻladigan yoki terisini toʻliq yopib yuradigan odamlar, toʻq rangli teri egalari, ortiqcha vazni borlar hamda yogʻlarning soʻrilishini buzadigan kasalliklarga chalinganlar.",
            "Agar siz shu guruhlardan biriga kirsangiz va savolingiz boʻlsa, tahlil haqida shifokor bilan gaplashing. Bu «oʻzimga vitamin D ichishim kerak» degani emas: tahlil birinchi navbatda holatni aniq koʻrsatish uchun.",
          ],
          ru: [
            "Регулярно проверяться всем подряд не нужно: анализ обычно назначает врач, когда есть основание — например, вопросы по плотности костей, нарушенное всасывание, образ жизни почти без солнца или приём добавки в высокой дозе.",
            "На результат влияет сезон: в конце зимы уровень обычно ниже, чем в конце лета. Поэтому для сравнения повторный анализ лучше сдавать в то же время года и в той же лаборатории. Специальной подготовки обычно не требуется — смотрите инструкцию лаборатории.",
            "NIH ODS перечисляет группы повышенного риска нехватки витамина D: младенцы на грудном вскармливании без добавок, пожилые люди, те, кто мало бывает на солнце или полностью закрывает кожу, люди с тёмной кожей, с избыточным весом, а также с заболеваниями, нарушающими усвоение жиров.",
            "Если вы относитесь к одной из этих групп и у вас есть вопросы, обсудите анализ с врачом. Это не значит «мне нужно пить витамин D»: анализ нужен прежде всего, чтобы точно увидеть ситуацию.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor va yuqori chegara", ru: "Суточная норма и верхний предел" },
        paragraphs: {
          uz: [
            "NIH ODS 1–70 yoshdagi kattalar uchun kuniga 15 mkg (600 XB), 70 yoshdan keyin 20 mkg (800 XB) tavsiya etadi; 1 mkg = 40 XB. Qabul qilinadigan yuqori chegara — kuniga 100 mkg (4 000 XB): shu miqdorni EFSA ham kattalar uchun belgilagan. U ovqat va qoʻshimchalar yigʻindisiga tegishli.",
            "Yetarli miqdorda vitamin D kalsiy va fosforning normal soʻrilishiga, suyak, tish va mushaklarning normal holatiga hamda immunitet tizimining normal ishlashiga hissa qoʻshadi (EFSA ruxsat etgan formulalar). Bu vitaminning oddiy vazifalari; u kasallikni bartaraf etmaydi.",
            "Ovqatdan vitamin D olish qiyin: uning boy manbalari yogʻli dengiz baliqlari (losos, skumbriya), baliq jigari yogʻi, tuxum sarigʻi va boyitilgan mahsulotlar. Odatiy ratsionda ular kam boʻladi, shuning uchun koʻp odamlar uchun asosiy manba — quyosh nuri va qoʻshimcha boʻladi.",
            "Quyosh nuri bilan hosil boʻlish miqdori fasl, kun vaqti, kiyim va teri rangiga bogʻliq, shuning uchun uni aniq hisoblab boʻlmaydi. Teri kuyishi D vitamini olishning yoʻli emas: quyoshda ehtiyot boʻling.",
          ],
          ru: [
            "NIH ODS рекомендует взрослым от 1 до 70 лет 15 мкг (600 МЕ) в сутки, после 70 лет — 20 мкг (800 МЕ); 1 мкг = 40 МЕ. Допустимый верхний предел — 100 мкг (4 000 МЕ) в сутки: такое же значение для взрослых установило EFSA. Он относится к сумме из еды и добавок.",
            "Достаточное количество витамина D способствует нормальному усвоению кальция и фосфора, нормальному состоянию костей, зубов и мышц и нормальной работе иммунной системы (формулировки, разрешённые EFSA). Это обычные функции витамина; заболевания он не устраняет.",
            "Получить витамин D из еды непросто: богатые источники — жирная морская рыба (лосось, скумбрия), жир печени рыб, яичный желток и обогащённые продукты. В обычном рационе их мало, поэтому для многих людей основной источник — солнечный свет и добавка.",
            "Количество, вырабатываемое под солнцем, зависит от сезона, времени суток, одежды и цвета кожи, поэтому точно его рассчитать нельзя. Солнечный ожог — не способ получить витамин D: берегите кожу на солнце.",
          ],
        },
      },
      {
        heading: { uz: "Natijadan keyin nima qilish kerak", ru: "Что делать после результата" },
        paragraphs: {
          uz: [
            "Natija meʼyordan past chiqsa, birinchi qadam — shifokorga koʻrsatish. Shifokor sababni (quyosh nuri, ovqat, soʻrilish, dorilar) koʻrib, ovqatlanish, kun tartibi va kerak boʻlsa qoʻshimcha dozasi haqida qaror qiladi. Dozani internetdagi jadvaldan olib oʻzingiz tanlamang: tanqislikda ham, yuqori dozada ham xato bahosi bor.",
            "Qoʻshimcha tanlayotganda D vitamini miqdorini yorliqdan tekshiring. Masalan, Dr. Frei Multivitamins + Biotin tarkibida 5 mkg vitamin D bor, Swiss Energy Calcivit esa kalsiy, D3 va K2 ni birlashtiradi. Barcha vitaminlarni birga hisoblang — bir nechta mahsulotdagi D3 yigʻiladi.",
            "Kundalik odatlar ham yordam beradi: kunduzi imkon boʻlsa yurish, baliq va tuxumni haftalik ovqatga qoʻshish, yopiq xonada oʻtirishni kamaytirish. Bu choralar tahlilni «tuzatish» uchun emas, umumiy ovqatlanishni boyitish uchun.",
            "Natijalarni bir joyda saqlab boring: sana, birlik, laboratoriya nomi va qoʻshimcha dozasi. Keyingi tahlilda shifokor bu yozuvlardan tendensiyani koʻrishi mumkin.",
          ],
          ru: [
            "Если результат ниже нормы, первый шаг — показать его врачу. Врач оценит причину (солнце, питание, всасывание, лекарства) и решит, что менять в питании и режиме и нужна ли добавка в какой-то дозе. Не выбирайте дозу сами по таблице из интернета: цена ошибки есть и при дефиците, и при высокой дозе.",
            "Выбирая добавку, проверьте количество витамина D на этикетке. Например, в Dr. Frei Multivitamins + Biotin — 5 мкг витамина D, а Swiss Energy Calcivit объединяет кальций, D3 и K2. Считайте все витамины вместе: D3 из нескольких продуктов суммируется.",
            "Помогают и повседневные привычки: прогулки днём, когда есть возможность, рыба и яйца в недельном меню, меньше времени в закрытых помещениях. Эти шаги нужны не чтобы «исправить» анализ, а чтобы обогатить общее питание.",
            "Храните результаты в одном месте: дата, единица, название лаборатории и доза добавки. При следующем анализе врач увидит по этим записям динамику.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "25(OH)D va «faol D» bir narsami? Yoʻq. Odatda baholash uchun 25(OH)D tekshiriladi; faol shakl (1,25) boshqa maqsadlarda, shifokor koʻrsatmasi bilan oʻlchanadi.",
            "Tahlilni och qoringa topshirish shartmi? Koʻp laboratoriyalar bunday talab qoʻymaydi, ammo yoʻriqnomani oldindan tekshiring.",
            "Qancha vaqtdan keyin qayta topshiriladi? Qoʻshimcha boshlangan boʻlsa, shifokor odatda bir necha oydan keyin nazorat tahlilini tayinlaydi.",
            "Quyosh nuri yetarlimi? Qish va yopiq kiyim sharoitida terida D vitamini kam hosil boʻladi; bu haqda «Qishda vitamin D» maqolasida yozilgan.",
            "Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing. Bu maqola umumiy maʼlumot; tashxis qoʻymaydi va shifokor tayinlovini almashtirmaydi.",
          ],
          ru: [
            "25(OH)D и «активный D» — одно и то же? Нет. Для оценки обычно проверяют 25(OH)D; активную форму (1,25) измеряют для других целей, по назначению врача.",
            "Нужно ли сдавать анализ натощак? Многие лаборатории этого не требуют, но уточните инструкцию заранее.",
            "Через какое время повторять анализ? Если добавка начата, врач обычно назначает контроль через несколько месяцев.",
            "Хватает ли солнца? Зимой и в закрытой одежде в коже вырабатывается мало витамина D; об этом написано в статье «Витамин D зимой».",
            "Биологически активная добавка. Не является лекарственным средством. Перед приёмом проконсультируйтесь со специалистом. Статья носит общий характер: она не ставит диагноз и не заменяет назначение врача.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-calcivit-30", "dr-frei-multivitamins-biotin-20"],
    relatedArticleSlugs: ["qishda-vitamin-d", "kalsiy-va-vitamin-d3-birga", "vitaminlarni-ortiqcha-ichish-yuqori-chegaralar"],
  },
  {
    slug: "vegetarianlar-uchun-vitaminlar-b12-temir-sink",
    date: "2026-11-26",
    imageSeed: "bank4-healthy-food",
    category: { uz: "Ovqatlanish", ru: "Питание" },
    categoryKey: "nutrition",
    title: {
      uz: "Vegetarianlar uchun vitaminlar: B12, temir, sink",
      ru: "Витамины для вегетарианцев: B12, железо, цинк",
    },
    excerpt: {
      uz: "Oʻsimlik ovqatida qaysi moddalar kam boʻladi: B12, temir, sink, omega-3, kalsiy va D. Vegetarian va vegan uchun nimaga eʼtibor berish va qachon tahlil topshirish.",
      ru: "Каких веществ меньше в растительном питании: B12, железо, цинк, омега-3, кальций и D. На что обратить внимание вегетарианцам и веганам и когда сдавать анализы.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob: nimalarga eʼtibor berish kerak", ru: "Коротко: на что обратить внимание" },
        paragraphs: {
          uz: [
            "Yaxshi rejalashtirilgan vegetarian ovqatlanish kattalar uchun mos boʻlishi mumkin, lekin beshta modda alohida eʼtibor talab qiladi: vitamin B12, temir, sink, omega-3 (EPA va DHA) hamda kalsiy bilan vitamin D. Veganlar uchun B12 asosiy masala: u tabiiy holda deyarli faqat hayvon mahsulotlarida uchraydi.",
            "Quyida har bir modda uchun NIH ODS maʼlumotlari asosida qisqa tushuntirish berilgan. Maqola umumiy: homiladorlik, emizish, bolalar va kasalligi borlar uchun ovqatlanish rejasini shifokor yoki dietolog bilan tuzing.",
          ],
          ru: [
            "Хорошо спланированное вегетарианское питание может подходить взрослым, но пять веществ требуют особого внимания: витамин B12, железо, цинк, омега-3 (EPA и DHA), а также кальций с витамином D. Для веганов главный вопрос — B12: в природе он содержится почти только в продуктах животного происхождения.",
            "Ниже по каждому веществу — краткое объяснение на основе данных NIH ODS. Статья общая: питание при беременности, кормлении, для детей и при заболеваниях составляйте с врачом или диетологом.",
          ],
        },
      },
      {
        heading: { uz: "Vitamin B12", ru: "Витамин B12" },
        paragraphs: {
          uz: [
            "B12 qizil qon tanachalarining normal hosil boʻlishiga, asab tizimi va psixologik faoliyatning normal ishlashiga hissa qoʻshadi (EFSA ruxsat etgan formulalar). Sut va tuxum yeydigan vegetarianlar B12 ni bir qadar oladi; veganlar esa boyitilgan mahsulotlar yoki qoʻshimchaga tayanadi.",
            "Tanqislik asta-sekin rivojlanadi, chunki organizm B12 zaxirasini jigarda saqlaydi. Shu sababli vegan ovqatlanish boshlaganlar B12 darajasini vaqti-vaqti bilan tekshirishi mumkin. Batafsil maʼlumot — «Vitamin B12: kimlarga kerak» maqolasida.",
            "Manbalar: baliq, goʻsht, sut mahsulotlari va tuxum, shuningdek B12 qoʻshilgan nonushtalik donlar va oʻsimlik ichimliklari. Dengiz suv oʻtlari yoki fermentlangan oʻsimlik mahsulotlari B12 manbai deb ishonchli hisoblanmaydi — yorliqda aniq miqdor yozilgan boyitilgan mahsulotni tanlang.",
            "NIH ODS maʼlumotiga koʻra, qoʻshimchadagi B12 yaxshi soʻriladi. Yoshi katta odamlarda ovqatdagi B12 ni ajratib olish qiyinlashadi, shuning uchun ularga boyitilgan mahsulot yoki qoʻshimcha koʻproq mos keladi.",
          ],
          ru: [
            "B12 способствует нормальному образованию эритроцитов, нормальной работе нервной системы и психологической функции (формулировки, разрешённые EFSA). Вегетарианцы, которые едят молочное и яйца, получают B12 в какой-то мере; веганы опираются на обогащённые продукты или добавку.",
            "Дефицит развивается медленно, потому что организм хранит запас B12 в печени. Поэтому тем, кто перешёл на веганское питание, имеет смысл периодически проверять уровень B12. Подробнее — в статье «Витамин B12: кому нужен».",
            "Источники: рыба, мясо, молочные продукты и яйца, а также готовые завтраки и растительные напитки с добавленным B12. Морские водоросли и ферментированные растительные продукты не считаются надёжным источником B12 — выбирайте обогащённые продукты, где на этикетке указано точное количество.",
            "По данным NIH ODS, B12 из добавок хорошо усваивается. У пожилых людей усвоение B12 из пищи ухудшается, поэтому им обогащённые продукты или добавка подходят чаще.",
          ],
        },
      },
      {
        heading: { uz: "Temir va sink", ru: "Железо и цинк" },
        paragraphs: {
          uz: [
            "Oʻsimlik manbalaridagi temir (dukkaklilar, ismaloq, quritilgan meva) organizm tomonidan goʻshtdagi temirga qaraganda kamroq soʻriladi. NIH ODS vegetarianlarning temirga ehtiyoji taxminan 1,8 baravar yuqori ekanini qayd etadi. Soʻrilishni C vitamini oshiradi, qahva va choy esa kamaytiradi: dukkakli taomni limon yoki bolgʻar qalampiri bilan yeng, choyni ovqatdan alohida ichin.",
            "Sink dukkaklilar, yongʻoq va urugʻlarda bor, lekin fitatlar uning soʻrilishini kamaytiradi; NIH ODS vegetarianlar uchun ehtiyoj taxminan 50% gacha yuqori boʻlishi mumkinligini aytadi. Dukkaklilarni ivitib, nonni xamirturush bilan qilish fitatlarni kamaytiradi. Temir va sinkni qoʻshimcha sifatida faqat tahlil va shifokor maslahati bilan qabul qiling.",
            "Amaliy misol: tushlikka yasmiq shoʻrva emas, limon sharbati bilan yasmiq va qizil bolgʻar qalampiri salati; kechqurun — ivitilgan nohut, qovurilgan qovoq urugʻi, tvorog yoki tofu. Choy va qahvani ovqatdan kamida bir soat oldin yoki keyin ichin.",
            "Dukkaklilar, yongʻoq va urugʻlar kunlik ratsionning doimiy qismi boʻlsa, temir va sink tanqisligi xavfi kamayadi. Lekin hayz paytida koʻp qon yoʻqotadigan ayollar, sportchilar va oʻsmirlar uchun ehtiyoj yuqoriroq; ular tekshiruvdan oʻtgani maʼqul.",
          ],
          ru: [
            "Железо из растительных источников (бобовые, шпинат, сухофрукты) усваивается хуже, чем железо из мяса. NIH ODS отмечает, что потребность вегетарианцев в железе примерно в 1,8 раза выше. Усвоение улучшает витамин C и ухудшают кофе и чай: ешьте блюда из бобовых с лимоном или болгарским перцем, а чай пейте отдельно от еды.",
            "Цинк есть в бобовых, орехах и семенах, но фитаты снижают его усвоение; NIH ODS сообщает, что потребность вегетарианцев может быть выше примерно на 50%. Замачивание бобовых и хлеб на закваске снижают содержание фитатов. Железо и цинк в виде добавок принимайте только по анализам и совету врача.",
            "Практический пример: на обед — чечевица с лимонным соком и салат из красного болгарского перца; вечером — замоченный нут, обжаренные тыквенные семечки, творог или тофу. Чай и кофе пейте не ближе чем за час до еды или после неё.",
            "Если бобовые, орехи и семена — постоянная часть рациона, риск дефицита железа и цинка ниже. Но потребность выше у женщин с обильными менструациями, спортсменов и подростков; им разумно пройти обследование.",
          ],
        },
      },
      {
        heading: { uz: "Omega-3: ALA va EPA/DHA farqi", ru: "Омега-3: разница между ALA и EPA/DHA" },
        paragraphs: {
          uz: [
            "Zigʻir urugʻi, chia va yongʻoq omega-3 ning ALA shaklini beradi. Organizm ALA ning faqat kichik qismini EPA va DHA ga aylantiradi (NIH ODS maʼlumotiga koʻra, odatda 15% dan kam). EPA va DHA dengiz baliqlarida va suv oʻtlaridan olingan yogʻlarda uchraydi.",
            "Baliq yemaydigan odamlar uchun suv oʻtlari asosidagi omega-3 qoʻshimchasi mavjud. EPA va DHA yurakning normal ishlashiga (kuniga 250 mg dan) hissa qoʻshadi — bu EFSA formulasi. Batafsil — «Omega-3 nima uchun kerak» maqolasida.",
            "ALA manbalarini yaxshiroq oʻzlashtirish uchun zigʻir urugʻini maydalab ishlating: butun urugʻ koʻpincha hazm boʻlmay chiqib ketadi. Bir osh qoshiq maydalangan zigʻir yoki chia boʻtqa, qatiq yoki salatga qoʻshish oson.",
            "Suv oʻtlari yogʻi EPA va DHA ni baliqsiz beradi. Yorliqdan EPA va DHA miqdorini (mg hisobida) tekshiring: «omega-3 1000 mg» yozuvi EPA va DHA 1000 mg degani emas.",
          ],
          ru: [
            "Льняное семя, чиа и грецкие орехи дают форму омега-3 ALA. Организм превращает в EPA и DHA лишь небольшую часть ALA (по данным NIH ODS, обычно менее 15%). EPA и DHA есть в морской рыбе и в маслах из водорослей.",
            "Тем, кто не ест рыбу, доступны добавки омега-3 на основе водорослей. EPA и DHA способствуют нормальной работе сердца (при 250 мг в сутки) — это формулировка EFSA. Подробнее — в статье «Зачем нужна омега-3».",
            "Чтобы лучше усваивать ALA, используйте молотое льняное семя: цельное часто выходит непереваренным. Столовую ложку молотого льна или чиа легко добавить в кашу, кефир или салат.",
            "Масло водорослей даёт EPA и DHA без рыбы. Проверьте на этикетке количество EPA и DHA (в мг): надпись «омега-3 1000 мг» не означает, что EPA и DHA — 1000 мг.",
          ],
        },
      },
      {
        heading: { uz: "Kalsiy va vitamin D", ru: "Кальций и витамин D" },
        paragraphs: {
          uz: [
            "Sut mahsulotlarini yeydigan vegetarianlar kalsiyni qatiq, suzma va pishloqdan oladi. Veganlar uchun manba — kalsiy bilan boyitilgan oʻsimlik ichimliklari, tofu, yashil bargli sabzavotlar (brokkoli, karam), kunjut. Ismaloqdagi kalsiy kam soʻriladi, shuning uchun uni asosiy manba deb hisoblamang.",
            "Vitamin D ovqatda kam: asosiy manba — quyosh nuri va boyitilgan mahsulotlar. Qishda, yopiq kiyimda va ofisda ishlaganda terida u kam hosil boʻladi. Kalsiy va D3 ni birga beradigan variant sifatida Swiss Energy Calcivit mavjud; dozani yorliqdan tekshiring.",
            "Haftalik reja uchun oddiy yoʻnalish: har kuni kamida bir marta dukkakli yoki soya mahsuloti, bir hovuch yongʻoq yoki urugʻ, bir necha porsiya sabzavot va meva, haftada bir necha marta boyitilgan mahsulot. Rang va turlar qancha xilma-xil boʻlsa, ratsion shuncha toʻliq.",
            "Vegetarian ovqatlanish boshlagan odamlarga birinchi 3–6 oyda oʻz holatini kuzatish va kerak boʻlsa tahlil topshirish foydali. Holsizlik, rangning oqarishi yoki qoʻl-oyoqlarda uvishish boʻlsa, bu faqat ovqat bilan bogʻliq deb oʻylamang — shifokorga koʻrining.",
          ],
          ru: [
            "Вегетарианцы, которые едят молочное, получают кальций из кефира, творога и сыра. Для веганов источники — обогащённые кальцием растительные напитки, тофу, зелёные листовые овощи (брокколи, капуста), кунжут. Кальций из шпината усваивается плохо, поэтому не считайте его основным источником.",
            "Витамина D в еде мало: главный источник — солнечный свет и обогащённые продукты. Зимой, в закрытой одежде и при работе в офисе в коже его вырабатывается немного. Вариант с кальцием и D3 вместе — Swiss Energy Calcivit; проверьте дозу на этикетке.",
            "Простой ориентир на неделю: каждый день хотя бы раз — бобовые или соевый продукт, горсть орехов или семян, несколько порций овощей и фруктов, несколько раз в неделю — обогащённые продукты. Чем разнообразнее цвета и виды, тем полнее рацион.",
            "Тем, кто перешёл на вегетарианское питание, полезно в первые 3–6 месяцев следить за самочувствием и при необходимости сдать анализы. Если появились слабость, бледность или онемение в руках и ногах, не списывайте это только на питание — обратитесь к врачу.",
          ],
        },
      },
      {
        heading: { uz: "Multivitamin kerakmi", ru: "Нужен ли мультивитамин" },
        paragraphs: {
          uz: [
            "Multivitamin xilma-xil ovqatning oʻrnini bosmaydi, lekin ratsioni cheklangan paytda qulay qoʻshimcha boʻlishi mumkin. Masalan, Dr. Frei Multivitamins + Biotin tarkibida B guruhi vitaminlari (B12 ham) va vitamin D bor; NeuroForce — B-kompleks. Tarkibdagi miqdorni yorliqdan oʻqing va boshqa mahsulotlardagi bilan qoʻshib hisoblang.",
            "Multivitamin temir va sinkni koʻp tutmasligi mumkin. Agar ularning yetishmasligi shubhasi boʻlsa, avval tahlil — gemoglobin, ferritin va B12 — keyin qaror.",
            "Qoʻshimcha tanlashdan oldin oʻzingizga uchta savol bering: ratsionimda aynan qaysi modda yetishmasligi mumkin, tahlil bunga ishora qiladimi, mahsulot yorligʻidagi miqdor ehtiyojga mos keladimi. Shu uch javobsiz «ehtiyot uchun» ichilgan qoʻshimcha foydadan koʻra koʻproq chalkashlik beradi.",
          ],
          ru: [
            "Мультивитамин не заменяет разнообразное питание, но при ограниченном рационе может быть удобной добавкой. Например, в Dr. Frei Multivitamins + Biotin есть витамины группы B (в том числе B12) и витамин D; NeuroForce — B-комплекс. Читайте количество на этикетке и суммируйте с другими продуктами.",
            "Мультивитамин может содержать мало железа и цинка. Если есть подозрение на их нехватку, сначала анализы — гемоглобин, ферритин и B12 — потом решение.",
            "Прежде чем выбирать добавку, задайте себе три вопроса: какого именно вещества может не хватать в моём рационе, указывают ли на это анализы, соответствует ли количество на этикетке потребности. Без этих трёх ответов добавка «на всякий случай» приносит больше путаницы, чем пользы.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Vegetarian va vegan farqi nima? Vegetarianlar goʻsht va baliq yemaydi, lekin sut va tuxum yeyishi mumkin; veganlar barcha hayvon mahsulotlarini chiqarib tashlaydi.",
            "B12 ni faqat tahlildan keyin ichish kerakmi? Veganlar uchun boyitilgan mahsulot yoki qoʻshimcha koʻp hollarda zarur; miqdorni shifokor bilan kelishing.",
            "Bolalar vegan boʻlishi mumkinmi? Bu faqat pediatr va dietolog nazoratida; oʻsish davrida B12, temir, D va kalsiy tanqisligi jiddiy oqibat beradi.",
            "Qaysi tahlillar foydali? Gemoglobin, ferritin, B12 va kerak boʻlsa 25(OH)D — shifokor tavsiyasi bilan.",
            "Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing. Homilador, emizikli ayollar va bolalar ovqatlanishini shifokor bilan kelishsin.",
          ],
          ru: [
            "Чем отличается вегетарианец от веган? Вегетарианцы не едят мясо и рыбу, но могут есть молочное и яйца; веганы исключают все продукты животного происхождения.",
            "Нужно ли пить B12 только после анализа? Веганам обогащённые продукты или добавка нужны в большинстве случаев; количество согласуйте с врачом.",
            "Можно ли детям быть веганами? Только под наблюдением педиатра и диетолога; в период роста нехватка B12, железа, D и кальция имеет серьёзные последствия.",
            "Какие анализы полезны? Гемоглобин, ферритин, B12 и при необходимости 25(OH)D — по рекомендации врача.",
            "Биологически активная добавка. Не является лекарственным средством. Перед приёмом проконсультируйтесь со специалистом. Беременным, кормящим и детям питание нужно согласовывать с врачом.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-multivitamins-biotin-20", "swiss-energy-neuroforce-30", "swiss-energy-calcivit-30"],
    relatedArticleSlugs: ["vitamin-b12-kimlarga-kerak", "temir-nima-uchun-kerak", "omega-3-nima-uchun-kerak"],
  },
  {
    slug: "vitaminlarni-ortiqcha-ichish-yuqori-chegaralar",
    date: "2026-11-26",
    imageSeed: "bank2-pill-organizer",
    category: { uz: "Xavfsizlik", ru: "Безопасность" },
    categoryKey: "nutrition",
    title: {
      uz: "Vitaminlarni ortiqcha ichish: yuqori chegaralar",
      ru: "Передозировка витаминов: верхние пределы",
    },
    excerpt: {
      uz: "Vitamin va minerallar uchun qabul qilinadigan yuqori chegara nima, EFSA va NIH raqamlari, bir nechta qoʻshimchani birga ichganda qanday yigʻiladi va yorliqni qanday tekshirish kerak.",
      ru: "Что такое допустимый верхний предел витаминов и минералов, цифры EFSA и NIH, как суммируются несколько добавок и как проверять этикетку.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob: ortiqcha ichish mumkinmi", ru: "Коротко: можно ли «перепить» витамины" },
        paragraphs: {
          uz: [
            "Ha, mumkin. Koʻpchilik vitamin va minerallar uchun «qabul qilinadigan yuqori chegara» (UL) belgilangan — bu deyarli hamma sogʻlom odam uchun xavf tugʻdirmaydigan eng yuqori kunlik miqdor. U maqsad emas, chegara: chegaradan oshgan sari nojoʻya taʼsir ehtimoli ortadi.",
            "Chegara odatda ovqat, boyitilgan mahsulot va qoʻshimchalarning yigʻindisiga tegishli (ayrim minerallarda — faqat qoʻshimchadan). Shuning uchun xavfsizlik savoli «bu tabletkada nima bor» emas, «bir kunda hammasidan qancha olyapman» boʻlishi kerak.",
            "Ortiqcha doza koʻpincha bilmasdan yigʻiladi: «koʻproq — yaxshiroq» degan fikr, reklamadagi «kuchli formula» va yuqori dozali alohida mahsulotlar sabab boʻladi. Aslida vitamin va minerallarning katta qismi ovqatdan yetarli keladi, qoʻshimcha esa aniq bir bosh sababga koʻra, mutaxassis maslahatida tanlanadi.",
            "Bu maqolaning maqsadi — qoʻrqitish emas, hisob-kitob qilishni oʻrgatish: yorliqdagi raqamlar bilan chegaralarni solishtirish uzoq muddatli ishonchli odat.",
          ],
          ru: [
            "Да, можно. Для большинства витаминов и минералов установлен «допустимый верхний уровень потребления» (UL) — наибольшее суточное количество, не создающее риска практически для всех здоровых людей. Это не цель, а граница: чем дальше за неё, тем выше вероятность нежелательных эффектов.",
            "Граница обычно относится к сумме из еды, обогащённых продуктов и добавок (у некоторых минералов — только из добавок). Поэтому вопрос безопасности звучит не «что в этой таблетке», а «сколько я получаю из всего за день».",
            "Лишняя доза часто набирается незаметно: причины — мысль «чем больше, тем лучше», слова «сильная формула» в рекламе и отдельные продукты с высокой дозой. На самом деле большую часть витаминов и минералов хватает получать из еды, а добавку выбирают по конкретной причине и по совету специалиста.",
            "Цель статьи — не напугать, а научить считать: сравнивать цифры на этикетке с пределами — надёжная долгосрочная привычка.",
          ],
        },
      },
      {
        heading: { uz: "Suvda va yogʻda eruvchi vitaminlar", ru: "Водо- и жирорастворимые витамины" },
        paragraphs: {
          uz: [
            "Suvda eruvchi vitaminlar (C va B guruhi) ortigʻi siydik bilan chiqib ketadi, shuning uchun ular «xavfsizroq» tuyuladi. Lekin bu mutlaq emas: yuqori dozada B6 uzoq muddat asab sezuvchanligi buzilishiga, C vitamini esa ich ketishiga olib kelishi mumkin.",
            "Yogʻda eruvchi vitaminlar (A, D, E, K) organizmda toʻplanadi, shuning uchun uzoq vaqt yuqori doza ichish xavfliroq. Eng sezgir nuqtalar — A vitamini (ayniqsa homiladorlikda) va D vitamini (qonda kalsiy ortishi).",
            "Homiladorlikda tayyor retinol shaklidagi vitamin A ni yuqori dozada ichish tavsiya etilmaydi: NIH ODS bu haqda ogohlantiradi. Shuning uchun homilador va homiladorlikni rejalashtirayotgan ayollar har bir qoʻshimchani, jumladan multivitamin va jigar mahsulotlarini, shifokor bilan kelishsin.",
            "Chekuvchilar uchun yuqori dozali beta-karotin qoʻshimchalaridan saqlanish tavsiya qilinadi (NIH ODS). Ovqatdagi beta-karotin — sabzi, qovoq, ismaloq — muammo emas: ogohlantirish qoʻshimchalarga tegishli.",
          ],
          ru: [
            "Водорастворимые витамины (C и группа B) излишки выводят с мочой, поэтому кажутся «безопаснее». Но это не абсолют: B6 в высоких дозах длительно может влиять на чувствительность нервов, а витамин C — вызывать расстройство желудка.",
            "Жирорастворимые витамины (A, D, E, K) накапливаются в организме, поэтому длительный приём высоких доз опаснее. Самые чувствительные точки — витамин A (особенно при беременности) и витамин D (повышение кальция в крови).",
            "При беременности высокие дозы витамина A в форме готового ретинола не рекомендуются: об этом предупреждает NIH ODS. Поэтому беременным и планирующим беременность любые добавки, включая мультивитамины и продукты из печени, лучше согласовывать с врачом.",
            "Курильщикам рекомендуют избегать добавок с высокой дозой бета-каротина (NIH ODS). Бета-каротин из еды — морковь, тыква, шпинат — не проблема: предупреждение относится к добавкам.",
          ],
        },
      },
      {
        heading: { uz: "Asosiy raqamlar", ru: "Основные цифры" },
        paragraphs: {
          uz: [
            "EFSA va NIH ODS kattalar uchun quyidagi yuqori chegaralarni belgilagan: vitamin D — 100 mkg (4 000 XB); sink — 25 mg (EFSA); vitamin B6 — 12 mg (EFSA); selen — 255 mkg (EFSA); kalsiy — 2 500 mg (EFSA, ovqat va qoʻshimcha birga); magniy — qoʻshimchadan 250 mg (EFSA); tayyor retinol shaklidagi vitamin A — 3 000 mkg RAE (NIH ODS); vitamin C — 2 000 mg (NIH ODS); sintetik foliy kislota — 1 000 mkg (NIH ODS).",
            "Bu raqamlar sogʻlom kattalar uchun; homiladorlar, emizikli ayollar, bolalar va kasallik tufayli dori ichayotganlarda boshqacha boʻlishi mumkin. Mamlakat va qayta koʻrib chiqilgan yilga qarab manbalar orasida farq uchrashi tabiiy — shifokor yoki farmatsevt bilan tekshiring.",
            "Birliklarda adashmaslik uchun: 1 mg = 1 000 mkg; vitamin D da 1 mkg = 40 XB; vitamin A da RAE — retinol ekvivalenti (1 mkg RAE = 1 mkg retinol). Yorliqda XB va mkg aralash yozilgan boʻlsa, avval bir birlikka keltiring, keyin chegara bilan solishtiring.",
            "Chegaradan past boʻlish xavfsizlik kafolati emas, yuqori boʻlish esa darhol zarar degani emas. Chegara — ehtiyotkor mezon: u zarar boshlanadigan nuqtadan past qilib belgilanadi, shuning uchun uni asoslangan nazorat chizigʻi deb qabul qiling.",
            "Bir nechta modda uchun chegara oʻrnatilmagan yoki cheklangan maʼlumot asosida belgilangan: bu «cheksiz xavfsiz» degani emas, yetarli maʼlumot yoʻqligini bildiradi. Shuning uchun ularda ham yorliqdagi dozadan oshmaslik kerak.",
          ],
          ru: [
            "EFSA и NIH ODS установили для взрослых такие верхние пределы: витамин D — 100 мкг (4 000 МЕ); цинк — 25 мг (EFSA); витамин B6 — 12 мг (EFSA); селен — 255 мкг (EFSA); кальций — 2 500 мг (EFSA, из еды и добавок вместе); магний — 250 мг из добавок (EFSA); витамин A в форме готового ретинола — 3 000 мкг RAE (NIH ODS); витамин C — 2 000 мг (NIH ODS); синтетическая фолиевая кислота — 1 000 мкг (NIH ODS).",
            "Эти цифры даны для здоровых взрослых; у беременных, кормящих, детей и тех, кто принимает лекарства из-за заболеваний, они могут быть другими. Значения в разных источниках могут отличаться из-за страны и года пересмотра — уточняйте у врача или фармацевта.",
            "Чтобы не запутаться в единицах: 1 мг = 1 000 мкг; у витамина D 1 мкг = 40 МЕ; у витамина A RAE — эквивалент ретинола (1 мкг RAE = 1 мкг ретинола). Если на этикетке единицы смешаны (МЕ и мкг), сначала приведите их к одной, а потом сравнивайте с пределом.",
            "Нахождение ниже предела — не гарантия безопасности, а превышение — не мгновенный вред. Предел — осторожный ориентир: его устанавливают ниже точки, где начинается риск, поэтому воспринимайте его как разумную контрольную линию.",
            "Для ряда веществ предел не установлен или определён на ограниченных данных: это не означает «безопасно без границ», а лишь отсутствие достаточных данных. Поэтому и для них не стоит превышать дозу на этикетке.",
          ],
        },
      },
      {
        heading: { uz: "Qanday qilib yigʻilib ketadi", ru: "Как всё суммируется" },
        paragraphs: {
          uz: [
            "Eng keng tarqalgan holat: odam multivitamin ichadi, ustiga alohida D, sink va kalsiy kompleksini qoʻshadi, ustiga boyitilgan nonushtalik va sport ichimligi. Har bir mahsulot dozasi alohida «normal» koʻrinadi, lekin yigʻindi chegaradan oshishi mumkin.",
            "Misol uchun, Dr. Frei Gold tarkibida vitamin A (800 mkg), C, E va sink bor; Multivitamins + Biotin tarkibida A, C, D va B guruhi. Ikkalasini birga ichsangiz, A va C ikki barobar yigʻiladi. Bunday juftlikni ichishdan oldin yorliqni oʻqing va shifokorga ayting.",
          ],
          ru: [
            "Самая частая ситуация: человек пьёт мультивитамин, добавляет отдельно D, цинк и комплекс с кальцием, а сверху — обогащённые завтраки и спортивный напиток. Доза в каждом продукте по отдельности выглядит «нормальной», но сумма может превысить предел.",
            "Например, в Dr. Frei Gold есть витамин A (800 мкг), C, E и цинк; в Multivitamins + Biotin — A, C, D и группа B. Если пить оба продукта вместе, A и C удвоятся. Перед таким сочетанием прочитайте этикетки и скажите врачу.",
          ],
        },
      },
      {
        heading: { uz: "Yorliqni tekshirish: 5 qadam", ru: "Проверка этикетки: 5 шагов" },
        paragraphs: {
          uz: [
            "1) Har bir mahsulotdagi miqdorni mkg, mg va XB birliklarida yozib oling. 2) Vitamin A da retinol va beta-karotin farqiga eʼtibor bering: chegara asosan tayyor retinolga tegishli. 3) Hamma mahsulotlar yigʻindisini chegara bilan solishtiring. 4) Yorliqdagi kunlik doza va mumkin boʻlgan cheklovlarni oʻqing. 5) Shubha boʻlsa, qoʻshimchalardan birini qoldiring va shifokorga murojaat qiling.",
            "Dori ichayotganlar alohida ehtiyot boʻlsin: masalan, qon suyultiruvchilar K vitamini bilan, ayrim antibiotiklar kalsiy, magniy va temir bilan taʼsirlashadi. Bolalar uchun mahsulotlarni kattalar dozasida bermang va bolalar qoʻli yetmaydigan joyda saqlang.",
            "Hisoblash misoli: Dr. Frei Gold va Multivitamins + Biotin yorligʻida vitamin A 800 mkg dan, vitamin C 80 mg dan koʻrsatilgan. Birga ichilsa, A — 1 600 mkg, C — 160 mg: ikkalasi ham yuqorida koʻrsatilgan chegaralardan (3 000 mkg RAE va 2 000 mg) ancha past. Demak, ayni juftlikda muammo A va C boʻyicha emas, boshqa mahsulotlar qoʻshilganda yigʻindiga eʼtibor berish kerak.",
            "Bu hisob faqat misol: ratsion, boshqa qoʻshimchalar va individual holat farq qiladi. Shubha boʻlsa, barcha mahsulotlar yorligʻini shifokor yoki farmatsevtga koʻrsating.",
          ],
          ru: [
            "1) Выпишите количество в каждом продукте в мкг, мг и МЕ. 2) У витамина A обратите внимание на разницу между ретинолом и бета-каротином: предел относится в основном к готовому ретинолу. 3) Сложите все продукты и сравните сумму с пределом. 4) Прочитайте суточную дозу и ограничения на этикетке. 5) При сомнениях откажитесь от одной из добавок и обратитесь к врачу.",
            "Особая осторожность — тем, кто принимает лекарства: например, антикоагулянты взаимодействуют с витамином K, а некоторые антибиотики — с кальцием, магнием и железом. Не давайте детям взрослые дозы и храните добавки в недоступном для детей месте.",
            "Пример расчёта: на этикетках Dr. Frei Gold и Multivitamins + Biotin указано по 800 мкг витамина A и по 80 мг витамина C. При совместном приёме выходит A — 1 600 мкг, C — 160 мг: оба значения заметно ниже приведённых выше пределов (3 000 мкг RAE и 2 000 мг). То есть в этой паре вопрос не в A и C, а в том, чтобы следить за суммой, когда добавляются другие продукты.",
            "Этот расчёт — лишь пример: рацион, другие добавки и индивидуальная ситуация различаются. Если есть сомнения, покажите этикетки всех продуктов врачу или фармацевту.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Yuqori chegara — tavsiya etilgan doza degani emasmi? Yoʻq. Tavsiya etilgan meʼyor ancha past; chegara — undan oshmaslik kerak boʻlgan tepa.",
            "Bir kun koʻproq ichib qoʻysam xavfli boʻladimi? Bir martalik ozgina oshish odatda xavf tugʻdirmaydi; muammo uzoq muddat muntazam oshishda. Baribir keyingi kuni odatdagi dozaga qayting.",
            "Qaysi belgilar ortiqcha doza haqida signal beradi? Koʻngil aynishi, ich ketishi, ishtahasizlik, boʻshashish; bunday belgilarda qoʻshimchani toʻxtating va shifokorga murojaat qiling.",
            "Bolalar vitaminlarini kattalar ichsa boʻladimi? Dozalar farq qiladi; yoshga mos mahsulotni tanlang.",
            "Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing. Maqola umumiy maʼlumot beradi va shaxsiy tavsiya hisoblanmaydi.",
          ],
          ru: [
            "Верхний предел — это рекомендуемая доза? Нет. Рекомендуемая норма заметно ниже; предел — потолок, которого превышать не следует.",
            "Опасно ли выпить больше один день? Разовое небольшое превышение обычно не создаёт риска; проблема — в длительном регулярном превышении. Но на следующий день вернитесь к обычной дозе.",
            "Какие признаки сигнализируют о передозировке? Тошнота, расстройство желудка, потеря аппетита, слабость; при таких признаках прекратите приём добавки и обратитесь к врачу.",
            "Можно ли взрослым пить детские витамины? Дозы отличаются; выбирайте продукт, подходящий по возрасту.",
            "Биологически активная добавка. Не является лекарственным средством. Перед приёмом проконсультируйтесь со специалистом. Статья даёт общую информацию и не является личной рекомендацией.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-gold-vitamins-20", "dr-frei-multivitamins-biotin-20", "swiss-energy-calcivit-30"],
    relatedArticleSlugs: ["vitaminlarni-qachon-ichish-kerak", "multivitamin-qanday-tanlash", "vitamin-d-tahlili-25-oh-normasi"],
  },
];
