import type { RawArticle } from "./blog";

/*
  SEO batch, 2026-11-27. General guidance only, no promise of effect (blog.test.ts runs the
  claim checks). Sources: NIH Office of Dietary Supplements fact sheets (vitamin B6, magnesium,
  vitamin D), EFSA authorised health claims and tolerable upper intake levels (vitamin B6 2023,
  magnesium, vitamin D), WHO. Photos: Adobe Stock bank, docs/IMAGE-BANK.md.
*/
const DISCLAIMER_UZ =
  "Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing. Bu maqola umumiy maʼlumot; tashxis qoʻymaydi va shifokor tayinlovini almashtirmaydi.";
const DISCLAIMER_RU =
  "Биологически активная добавка. Не является лекарственным средством. Перед приёмом проконсультируйтесь со специалистом. Статья носит общий информационный характер, не ставит диагноз и не заменяет назначений врача.";

export const articlesNov2026l: RawArticle[] = [
  {
    slug: "vitamin-b6-nima-uchun-kerak-yuqori-chegara",
    date: "2026-11-27",
    imageSeed: "bank4-healthy-food",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "nutrition",
    title: {
      uz: "Vitamin B6: nima uchun kerak va yuqori chegara",
      ru: "Витамин B6: для чего нужен и верхняя граница",
    },
    excerpt: {
      uz: "Vitamin B6 (piridoksin) organizmda qanday vazifalarga hissa qoʻshadi, kuniga qancha kerak, qaysi ovqatlarda bor va nega uni ortiqcha ichish yaxshi gʻoya emas: NIH va EFSA maʼlumotlari.",
      ru: "Какие функции организма обеспечивает витамин B6 (пиридоксин), сколько его нужно в день, в каких продуктах он есть и почему избыток в добавках нежелателен: данные NIH и EFSA.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob: vitamin B6 nima", ru: "Коротко: что такое витамин B6" },
        paragraphs: {
          uz: [
            "Vitamin B6, yaʼni piridoksin — suvda eriydigan B guruhi vitaminlaridan biri. Organizm uni oʻzi hosil qila olmaydi, shuning uchun u ovqat yoki qoʻshimchalar orqali tushishi kerak. Kattalar uchun kunlik ehtiyoj kichik — taxminan 1,3–1,7 mg — va oddiy, xilma-xil ovqatlanishda koʻpchilik odam bu miqdorni oladi.",
            "Shu bilan birga B6 — «qancha koʻp boʻlsa, shuncha yaxshi» turdagi vitamin emas. Uning yuqori chegarasi bor, va bu chegara yaqinda Yevropada pasaytirilgan. Quyida vitamin nima qilishi, qancha kerakligi, qaysi ovqatda borligi va yorliqni qanday oʻqish kerakligi tushuntirilgan. Maʼlumotlar NIH Dietary Supplements ofisi (NIH ODS) va EFSA hujjatlariga asoslangan.",
          ],
          ru: [
            "Витамин B6, или пиридоксин, — один из водорастворимых витаминов группы B. Организм не умеет вырабатывать его сам, поэтому он должен поступать с едой или добавками. Суточная потребность взрослых невелика — примерно 1,3–1,7 мг — и при обычном разнообразном питании большинство людей получает эту норму.",
            "Вместе с тем B6 — не тот витамин, по которому «чем больше, тем лучше». У него есть верхняя граница безопасного потребления, и недавно в Европе её снизили. Ниже — что он делает, сколько нужно, в каких продуктах содержится и как читать этикетку. Данные основаны на материалах Управления пищевых добавок NIH (NIH ODS) и EFSA.",
          ],
        },
      },
      {
        heading: { uz: "Organizmda qanday vazifalarga hissa qoʻshadi", ru: "К каким функциям организма имеет отношение" },
        paragraphs: {
          uz: [
            "B6 koʻp fermentlar ishida ishtirok etadi, asosan oqsil va aminokislotalar almashinuvida. EFSA ruxsat bergan formulalarga koʻra, vitamin B6 oqsil va glikogen almashinuviga, asab tizimining normal ishlashiga, normal psixologik faoliyatga, qizil qon tanachalarining normal hosil boʻlishiga, normal energiya almashinuviga hamda charchoq va holsizlikning kamayishiga hissa qoʻshadi.",
            "Yana bir ruxsat etilgan formula — gomosistein almashinuvi va gormonal faollik tartibi bilan bogʻliq. Bu iboralar «B6 bu kasallikni yoʻqotadi» degani emas: ular vitamin organizmning oddiy ishlashi uchun kerak ekanini bildiradi. Yetarli miqdor olinsa, qoʻshimcha ichish qoʻshimcha «kuch» bermaydi.",
            "Yetishmovchilik kam uchraydi. NIH ODS ga koʻra xavf guruhlariga ichkilikka qaramlik, buyrak kasalligi, ovqat soʻrilishi buzilgan holatlar va baʼzi dorilarni uzoq qabul qilish kiradi. Agar sizda shunday holat boʻlsa, vitamin tanlashni shifokor bilan kelishing.",
          ],
          ru: [
            "B6 участвует в работе множества ферментов, в первую очередь в обмене белков и аминокислот. По разрешённым формулировкам EFSA, витамин B6 способствует нормальному обмену белков и гликогена, нормальной работе нервной системы, нормальной психологической функции, нормальному образованию эритроцитов, нормальному энергетическому обмену, а также снижению усталости и утомляемости.",
            "Есть и другие разрешённые формулировки — о нормальном обмене гомоцистеина и регуляции гормональной активности. Это не значит, что «B6 убирает болезнь»: речь о том, что витамин нужен для обычной работы организма. Если вы получаете достаточное количество, дополнительная добавка не даст дополнительной «силы».",
            "Дефицит встречается редко. По данным NIH ODS, к группам риска относятся люди с зависимостью от алкоголя, заболеваниями почек, нарушением всасывания и те, кто долго принимает некоторые лекарства. Если это про вас, выбор витаминов лучше обсудить с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Kuniga qancha kerak", ru: "Сколько нужно в день" },
        paragraphs: {
          uz: [
            "NIH ODS ning tavsiya etilgan kunlik meʼyorlari (RDA): 19–50 yoshdagi kattalar uchun 1,3 mg; 51 yoshdan oshgan erkaklar uchun 1,7 mg, ayollar uchun 1,5 mg; homiladorlikda 1,9 mg; emizish davrida 2,0 mg. Bolalarda ehtiyoj yoshga qarab kamroq: 1–3 yosh uchun 0,5 mg, 4–8 yosh uchun 0,6 mg, 9–13 yosh uchun 1,0 mg.",
            "Koʻrib turganingizdek, bu — milligrammning bir qismi. Shuning uchun yorliqda 2 mg yoki 1,4 mg yozilgan boʻlsa, bu kunlik ehtiyoj atrofidagi miqdor, «yuqori doza» emas. Muammo odatda boshqa joyda: bir necha mahsulotdan (multivitamin, B-kompleks, «energetik» ichimlik, alohida B6 tabletkasi) bir vaqtda ichilganda yigʻindi sezilmay oshib ketadi.",
          ],
          ru: [
            "Рекомендуемые суточные нормы (RDA) по данным NIH ODS: для взрослых 19–50 лет — 1,3 мг; для мужчин старше 51 года — 1,7 мг, для женщин — 1,5 мг; при беременности — 1,9 мг; при кормлении грудью — 2,0 мг. У детей потребность меньше и зависит от возраста: 0,5 мг в 1–3 года, 0,6 мг в 4–8 лет, 1,0 мг в 9–13 лет.",
            "Как видите, это доли миллиграмма. Поэтому если на этикетке указано 2 мг или 1,4 мг, это количество порядка суточной потребности, а не «высокая доза». Проблема обычно в другом: когда B6 принимают сразу из нескольких источников (мультивитамины, B-комплекс, «энергетик», отдельная таблетка B6), суммарное количество незаметно растёт.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda bor", ru: "В каких продуктах содержится" },
        paragraphs: {
          uz: [
            "B6 ham oʻsimlik, ham hayvon manbalarida uchraydi. NIH ODS eng yaxshi manbalar sifatida nuxat (bir piyola konservalangan nuxatda taxminan 1,1 mg), baliq (tuna, losos), parranda goʻshti, kartoshka va banan, shuningdek boyitilgan nonushta yormalarini koʻrsatadi. Oʻzbek dasturxonida nuxat, goʻsht, baliq va kartoshka tez-tez uchraydi, shuning uchun koʻpchilik uchun asosiy manba — oddiy taom.",
            "Vitamin issiqlik va yorugʻlikka chidamliligi oʻrtacha: uzoq pishirish va qayta-qayta isitish miqdorni kamaytirishi mumkin. Shuning uchun ratsionda butun, kam ishlov berilgan mahsulotlar boʻlishi foydali. Vegetarianlar uchun nuxat, kartoshka, banan va yongʻoqlar yaxshi tayanch; baliq va goʻsht yemaydiganlar uchun batafsil gap «Vegetarianlar uchun vitaminlar» maqolasida.",
          ],
          ru: [
            "B6 содержится и в растительных, и в животных продуктах. NIH ODS называет лучшими источниками нут (в чашке консервированного нута около 1,1 мг), рыбу (тунец, лосось), птицу, картофель и бананы, а также обогащённые хлопья для завтрака. На узбекском столе нут, мясо, рыба и картофель встречаются часто, поэтому для многих основной источник — обычная еда.",
            "Устойчивость витамина к нагреву и свету средняя: длительная готовка и многократный разогрев могут снижать его количество. Поэтому в рационе полезны цельные, мало обработанные продукты. Вегетарианцам хорошей опорой служат нут, картофель, бананы и орехи; подробнее — в статье «Витамины для вегетарианцев».",
          ],
        },
      },
      {
        heading: { uz: "Yuqori chegara: nega ortiqcha ichish yaxshi emas", ru: "Верхняя граница: почему избыток нежелателен" },
        paragraphs: {
          uz: [
            "Suvda eriydigan vitaminlarning ortigʻi siydik bilan chiqib ketadi, degan fikr B6 uchun toʻliq toʻgʻri emas. NIH ODS maʼlumotiga koʻra, B6 ni uzoq vaqt yuqori dozada qabul qilish sezuvchan nervlarga taʼsir qilishi mumkin: qoʻl va oyoqlarda uvishish, yurishda muvozanat buzilishi kabi belgilar yuzaga kelishi mumkin. Bunday holatlar odatda qoʻshimcha dozasi bilan bogʻliq boʻlib, ovqatdan olingan B6 bilan emas.",
            "NIH ODS kattalar uchun ruxsat etilgan yuqori chegarani (UL) kuniga 100 mg deb belgilagan. EFSA esa 2023 yilda baholashni yangilab, kattalar uchun chegarani kuniga 12 mg ga tushirdi: yangi maʼlumotlarga koʻra, nerv bilan bogʻliq holatlar past dozalarda ham uzoq qabul qilinganda xabar qilingan. Ikki tashkilot raqamlari farq qiladi, lekin xulosa bir: kunlik B6 ni qoʻshimchalardan yigʻindi sifatida hisoblab, kerak boʻlmaganda oshirmaslik maʼqul.",
            "Bu, masalan, 2 mg li tabletka xavfli degani emas — u chegaradan ancha past. Savol boshqacha: «bir kunda hammasidan qancha olyapman?». Batafsil mantiq va boshqa vitaminlarning chegaralari «Vitaminlarni ortiqcha ichish: yuqori chegaralar» maqolasida berilgan.",
          ],
          ru: [
            "Мнение, что излишки водорастворимых витаминов просто выводятся с мочой, для B6 верно не полностью. По данным NIH ODS, длительный приём B6 в высоких дозах может влиять на чувствительные нервы: возможны онемение и покалывание в руках и ногах, нарушение координации при ходьбе. Такие случаи обычно связаны с добавками, а не с B6 из пищи.",
            "NIH ODS установил для взрослых допустимый верхний уровень (UL) 100 мг в сутки. EFSA в 2023 году пересмотрела оценку и снизила верхнюю границу для взрослых до 12 мг в сутки: по новым данным, нарушения со стороны нервов описаны и при более низких дозах при длительном приёме. Цифры двух организаций различаются, но вывод один: стоит считать суточное количество B6 из добавок суммарно и не повышать его без необходимости.",
            "Это не значит, что, например, таблетка с 2 мг опасна: она намного ниже границы. Вопрос в другом: «сколько я получаю за день из всех источников вместе?». Логика и границы других витаминов разобраны в статье «Избыток витаминов: верхние границы».",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimcha tanlashda yorliqni qanday oʻqish", ru: "Как читать этикетку при выборе добавки" },
        paragraphs: {
          uz: [
            "Avval yorliqdagi miqdorni mg da toping va kunlik ehtiyoj (1,3–1,7 mg) bilan solishtiring. Keyin «bu mahsulotdan tashqari yana nima ichaman?» deb oʻylang: multivitamin, B-kompleks, magniy B6 tarkibli mahsulotlar ham B6 saqlaydi. Shu uch-toʻrt manbaning yigʻindisini hisoblash kifoya.",
            "Katalogdagi mahsulotlarda B6 miqdori yorliqdagi qiymatlar boʻyicha shunday: Dr. Frei Antistress Magniy B6 tarkibida bir tabletkada 2 mg B6 va 100 mg magniy bor; Swiss Energy Hair Nail & Skin kapsulasida 1,4 mg B6 (biotin, sink va boshqa komponentlar bilan birga); Swiss Energy NeuroForce — B1, B2, B3, B5, B6, B7, B9, B12 vitaminlari majmuasi, aniq miqdorlar qadoqda koʻrsatilgan. Hammasi umumiy qoʻshimcha sifatida, tayinlov emas.",
            "Bir nechta B6 saqlovchi mahsulotni bir vaqtda ichishdan oldin yigʻindini hisoblang yoki farmatsevt/shifokorga koʻrsating. Homilador, emizikli, bolalar va surunkali kasalligi bor odamlar uchun miqdorni shifokor bilan kelishish kerak.",
          ],
          ru: [
            "Сначала найдите на этикетке количество в мг и сравните с суточной потребностью (1,3–1,7 мг). Затем спросите себя: «что ещё я принимаю?» — B6 содержат мультивитамины, B-комплексы и продукты с магнием B6. Достаточно сложить эти три-четыре источника.",
            "В каталоге количество B6 по данным этикеток такое: в Dr. Frei Антистресс Магний B6 в одной таблетке 2 мг B6 и 100 мг магния; в капсуле Swiss Energy Hair Nail & Skin — 1,4 мг B6 (вместе с биотином, цинком и другими компонентами); Swiss Energy NeuroForce — комплекс витаминов B1, B2, B3, B5, B6, B7, B9, B12, точные количества указаны на упаковке. Всё это общие добавки, а не назначение.",
            "Прежде чем принимать одновременно несколько продуктов с B6, сложите суммарное количество или покажите состав фармацевту или врачу. Беременным, кормящим, детям и людям с хроническими заболеваниями количество нужно согласовывать с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Vitamin B6 va piridoksin bir narsami? Ha. Piridoksin — B6 ning eng keng tarqalgan qoʻshimcha shakli; yorliqda «piridoksin gidroxlorid» yoki «piridoksal-5-fosfat» deb yozilishi mumkin.",
            "B6 ni qachon ichgan maʼqul? Aniq «eng yaxshi soat» yoʻq. Odatda ovqat bilan ichish qulay; muhimi — bir kunda kerakli miqdordan oshirmaslik.",
            "Magniy bilan birga ichish kerakmi? Koʻp mahsulotlarda ular bitta tabletkada kelgan. Alohida B6 qoʻshish shart emas, aks holda yigʻindi oshib ketishi mumkin.",
            "Bolalarga B6 berish mumkinmi? Bolalar uchun chegara kattalarnikidan ancha past. Yoshga mos mahsulot va miqdorni pediatr bilan kelishing.",
            DISCLAIMER_UZ,
          ],
          ru: [
            "Витамин B6 и пиридоксин — одно и то же? Да. Пиридоксин — наиболее распространённая форма B6 в добавках; на этикетке может быть «пиридоксина гидрохлорид» или «пиридоксаль-5-фосфат».",
            "Когда лучше принимать B6? Однозначного «лучшего времени» нет. Обычно удобно принимать с едой; важнее не превышать нужное количество за день.",
            "Нужно ли принимать вместе с магнием? Во многих продуктах они уже в одной таблетке. Отдельно добавлять B6 не нужно, иначе суммарное количество может вырасти.",
            "Можно ли давать B6 детям? Верхняя граница для детей заметно ниже, чем для взрослых. Подходящий продукт и количество согласуйте с педиатром.",
            DISCLAIMER_RU,
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-neuroforce-30", "swiss-energy-hair-nail-skin-30"],
    relatedArticleSlugs: ["b-vitaminlari-nima-uchun-kerak", "vitaminlarni-ortiqcha-ichish-yuqori-chegaralar", "magniy-b6-va-magniy-sitrat-farqi"],
  },
  {
    slug: "magniy-qachon-ichiladi-ertalab-yoki-kechqurun",
    date: "2026-11-27",
    imageSeed: "bank-sleep-bed",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "nutrition",
    title: {
      uz: "Magniy qachon ichiladi: ertalabmi yoki kechqurunmi",
      ru: "Когда пить магний: утром или вечером",
    },
    excerpt: {
      uz: "Magniyni ertalab, kechqurun, ovqat bilan yoki undan keyin ichish: NIH va EFSA maʼlumotlari, kunlik meʼyor, yuqori chegara, dorilar bilan oraliq va shipuchi tabletkani toʻgʻri ichish.",
      ru: "Магний утром или вечером, с едой или после: данные NIH и EFSA, суточная норма, верхняя граница, интервал с лекарствами и как правильно принимать шипучую таблетку.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob: «eng yaxshi soat» yoʻq", ru: "Коротко: «лучшего часа» нет" },
        paragraphs: {
          uz: [
            "Magniy qoʻshimchasini ichish uchun ilmiy asoslangan yagona «eng yaxshi vaqt» yoʻq: ertalabmi, kechqurunmi — NIH Dietary Supplements ofisi (NIH ODS) va EFSA hujjatlarida bunday qoida berilmagan. Amalda uchta narsa muhimroq: ovqat bilan ichish (oshqozon uchun qulay), kunlik miqdorni oshirmaslik va bir vaqtda ichiladigan dorilar bilan oraliq qoldirish.",
            "Koʻpchilik odam magniyni kechqurun ichishni tanlaydi, chunki kunning oxirida eslab qolish oson va ayrim mahsulotlarning yoʻriqnomasida shunday yozilgan. Boshqalar esa ertalab nonushta bilan ichadi. Ikkala usul ham maʼqul: muhimi — har kuni bir xil vaqtda. Quyida bu qoidalar batafsil tushuntirilgan.",
            "Magniy tanqisligini oʻzingiz taxmin qilmang. Mushaklar tortishishi, charchoq yoki uyqu muammosi koʻp sabablardan boʻlishi mumkin: kam uxlash, kofein, suvsizlanish, temir yoki D vitamini yetishmasligi, dori taʼsiri. Magniy qoʻshimchasi bu savollarga «umumiy javob» emas. Agar belgilar uzoq davom etsa, avval shifokorga murojaat qilib, sababini aniqlash kerak; qoʻshimcha esa ratsionni toʻldirish uchun, tashxis oʻrniga emas.",
          ],
          ru: [
            "Научно обоснованного единственного «лучшего времени» для приёма магния нет: утром или вечером — в материалах Управления пищевых добавок NIH (NIH ODS) и EFSA такого правила не даётся. На практике важнее три вещи: принимать с едой (так мягче для желудка), не превышать суточное количество и выдерживать интервал с лекарствами, которые вы принимаете.",
            "Многие выбирают вечер: в конце дня проще запомнить, и в инструкциях некоторых продуктов указано именно так. Другие принимают магний утром с завтраком. Оба варианта приемлемы: главное — делать это каждый день в одно и то же время. Ниже эти правила разобраны подробнее.",
            "Не стоит самостоятельно предполагать дефицит магния. Судороги в мышцах, усталость или проблемы со сном могут иметь много причин: недосып, кофеин, обезвоживание, нехватка железа или витамина D, действие лекарств. Добавка магния — не «общий ответ» на эти вопросы. Если симптомы сохраняются, сначала обратитесь к врачу, чтобы выяснить причину; добавка нужна, чтобы дополнить рацион, а не вместо диагностики.",
          ],
        },
      },
      {
        heading: { uz: "Magniy nimaga hissa qoʻshadi", ru: "К чему имеет отношение магний" },
        paragraphs: {
          uz: [
            "EFSA ruxsat bergan formulalarga koʻra, magniy charchoq va holsizlikning kamayishiga, elektrolitlar muvozanatiga, normal energiya almashinuviga, asab tizimi va mushaklarning normal ishlashiga, normal psixologik faoliyatga, suyaklar va tishlarning normal holatini saqlashga hissa qoʻshadi.",
            "Muhim eslatma: uyqu yoki «tinchlanish» haqida ruxsat etilgan alohida formula yoʻq. Shuning uchun «kechqurun ichsangiz uxlab qolasiz» degan gap — mahsulot vaʼdasi boʻla olmaydi. Uyqu odatlari, yorugʻlik, ekran va kofein haqida «Magniy va uyqu» hamda «Telefon va uyqu» maqolalarida yozilgan.",
          ],
          ru: [
            "По разрешённым формулировкам EFSA, магний способствует снижению усталости и утомляемости, электролитному балансу, нормальному энергетическому обмену, нормальной работе нервной системы и мышц, нормальной психологической функции, поддержанию нормального состояния костей и зубов.",
            "Важное уточнение: отдельной разрешённой формулировки про сон или «успокоение» нет. Поэтому фраза «выпьете вечером — уснёте» не может быть обещанием продукта. О привычках сна, свете, экранах и кофеине написано в статьях «Магний и сон» и «Телефон и сон».",
          ],
        },
      },
      {
        heading: { uz: "Kuniga qancha kerak va yuqori chegara", ru: "Сколько нужно в день и верхняя граница" },
        paragraphs: {
          uz: [
            "NIH ODS ning tavsiya etilgan kunlik meʼyorlari (RDA): 19–30 yoshdagi erkaklar uchun 400 mg, 31 yoshdan oshganlar uchun 420 mg; ayollar uchun mos ravishda 310 va 320 mg; homiladorlikda 350–360 mg. Bu miqdor ovqat va qoʻshimchalarning yigʻindisi: koʻpchilik magniyni yorma, yongʻoq, urugʻ, dukkaklilar va yashil bargli sabzavotlardan oladi.",
            "Qoʻshimchadan olinadigan magniy uchun yuqori chegara bor: NIH ODS 9 yoshdan oshganlar uchun kuniga 350 mg, EFSA esa 250 mg (ovqatdagi magniy bu hisobga kirmaydi). Chegaradan oshganda eng koʻp uchraydigan natija — ich ketishi va qorin ogʻrigʻi. Shuning uchun yorliqdagi miqdorni koʻrib, bir kunda bir necha mahsulotdan magniy ichayotgan boʻlsangiz, yigʻindini hisoblang.",
            "Ratsiondan magniy olish ham oson: bir hovuch yongʻoq yoki urugʻ, bir kosa loviya yoki yorma boʻtqasi, yashil bargli sabzavotlar kunlik ehtiyojning muhim qismini beradi. Shuning uchun koʻp odamga qoʻshimcha «toʻldiruvchi» sifatida kerak boʻladi, asosiy manba sifatida emas. Qoʻshimchani boshlashdan oldin bir-ikki kun nima yeganingizni sanab chiqing — natija sizni hayratga solishi mumkin.",
          ],
          ru: [
            "Рекомендуемые суточные нормы (RDA) по данным NIH ODS: для мужчин 19–30 лет — 400 мг, старше 31 года — 420 мг; для женщин соответственно 310 и 320 мг; при беременности — 350–360 мг. Это суммарное количество из еды и добавок: большинство людей получает магний из круп, орехов, семян, бобовых и зелёных листовых овощей.",
            "Для магния из добавок есть верхняя граница: NIH ODS — 350 мг в сутки для людей старше 9 лет, EFSA — 250 мг (магний из пищи сюда не входит). При превышении чаще всего появляются жидкий стул и боль в животе. Поэтому смотрите на количество на этикетке, а если вы принимаете магний из нескольких продуктов, считайте сумму.",
            "Получить магний из рациона тоже несложно: горсть орехов или семян, тарелка фасоли или каши из цельных круп, зелёные листовые овощи дают заметную часть суточной потребности. Поэтому добавка многим нужна как «дополнение», а не как основной источник. Прежде чем начинать, на день-два запишите, что вы едите, — результат может удивить.",
          ],
        },
      },
      {
        heading: { uz: "Ovqat bilan yoki och qoringa", ru: "С едой или натощак" },
        paragraphs: {
          uz: [
            "Magniy qoʻshimchalari baʼzida oshqozonni bezovta qiladi, ayniqsa magniy oksidi va sitrat shakllari. Ovqat bilan yoki undan keyin ichish noqulaylikni kamaytirishi mumkin; bu NIH ODS da ham eslatiladi. Agar tabletka sizga ogʻir kelsa, miqdorni ikkiga boʻlib, ikki ovqat bilan ichish yoki boshqa shaklni tanlash mumkin.",
            "Magniy shakllari (oksid, sitrat, bisglitsinat va boshqalar) haqida batafsil «Magniy B6 va magniy sitrat farqi» maqolasida yozilgan. Shakl va ichish vaqti alohida masala: bitta shaklga «faqat shu vaqtda» degan qoida yoʻq.",
          ],
          ru: [
            "Добавки магния иногда раздражают желудок, особенно формы оксида и цитрата. Приём с едой или после неё может уменьшить дискомфорт; об этом упоминает и NIH ODS. Если таблетка переносится тяжело, можно разделить количество на два приёма с едой или выбрать другую форму.",
            "О формах магния (оксид, цитрат, бисглицинат и другие) подробно написано в статье «Магний B6 и магний цитрат: в чём разница». Форма и время приёма — разные вопросы: для одной формы нет правила «только в это время».",
          ],
        },
      },
      {
        heading: { uz: "Dorilar va boshqa minerallar bilan oraliq", ru: "Интервал с лекарствами и другими минералами" },
        paragraphs: {
          uz: [
            "NIH ODS maʼlumotiga koʻra, magniy baʼzi dorilarning soʻrilishini pasaytirishi mumkin: bisfosfonatlar (suyak uchun dorilar), baʼzi antibiotiklar (tetratsiklinlar, xinolonlar guruhi) va qalqonsimon bez uchun levotiroksin ular qatorida eslatiladi. Agar siz ulardan birini qabul qilsangiz, magniy bilan oraliq necha soat boʻlishini farmatsevt yoki shifokordan soʻrang — bu har dori uchun alohida.",
            "Minerallar oʻrtasida ham raqobat boʻlishi mumkin: NIH ODS ga koʻra, qoʻshimchadagi yuqori dozali sink magniy soʻrilishiga xalaqit berishi mumkin. Shuning uchun bir vaqtda kalsiy, temir, sink va magniyning katta dozalarini ichmaslik, ularni kun boʻyicha taqsimlash maʼqul. Kalsiy va D vitamini haqida «Kalsiy va vitamin D3 birga» maqolasida yozilgan.",
            "Buyrak faoliyati buzilgan odamlarda ortiqcha magniy organizmdan yaxshi chiqmaydi, shuning uchun ular magniy qoʻshimchasini faqat shifokor bilan kelishib ichishi kerak.",
          ],
          ru: [
            "По данным NIH ODS, магний может снижать всасывание некоторых лекарств: среди них упоминаются бисфосфонаты (препараты для костей), некоторые антибиотики (тетрациклины, группа хинолонов) и левотироксин для щитовидной железы. Если вы принимаете что-то из этого, спросите у фармацевта или врача, какой интервал выдерживать, — для каждого препарата он свой.",
            "Минералы тоже могут «конкурировать»: по данным NIH ODS, высокие дозы цинка из добавок способны мешать усвоению магния. Поэтому не стоит принимать большие количества кальция, железа, цинка и магния одновременно — лучше распределить их по времени суток. О кальции и витамине D написано в статье «Кальций и витамин D3 вместе».",
            "При нарушении функции почек избыток магния плохо выводится, поэтому магний в добавках таким людям можно принимать только по согласованию с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Shipuchi tabletkani qanday ichish", ru: "Как принимать шипучую таблетку" },
        paragraphs: {
          uz: [
            "Shipuchi shaklda tabletka suvda eritiladi va ichimlik sifatida ichiladi: ovqat bilan birga suyuqlik ham tushadi. Dr. Frei Antistress Magniy B6 uchun yoʻriqnomada 1 tabletkani 200 ml suvda eritib, kechqurun ovqatdan keyin ichish yozilgan. Bir tabletkada 100 mg magniy (kunlik meʼyorning 27 foizi, yorliq maʼlumoti), 2 mg vitamin B6, 100 mg taurin, vitamin C va K bor.",
            "Tabletkani toʻliq erishini kuting va tayyor eritmani darhol iching. Kunlik tavsiya etilgan miqdordan oshirmang. Agar kechqurun ichgandan keyin tez-tez uygʻonsangiz yoki qorin noqulayligi sezsangiz, ichish vaqtini ertalab/tushlikka koʻchirib koʻring — aniq qoida yoʻq, tanlov sizniki.",
            "Qoʻshimcha boshlaganingizdan keyin bir-ikki hafta davomida oʻzingizni kuzating: ovqat hazmi, najas va umumiy ahvolga eʼtibor bering. Kichik miqdordan boshlash va ovqat bilan ichish koʻpchilik uchun qulay. Yorliqdagi saqlash qoidalariga ham amal qiling: tabletka quruq joyda, qadoq yopiq holda turishi kerak.",
          ],
          ru: [
            "Шипучая таблетка растворяется в воде и принимается как напиток: вместе с едой поступает и жидкость. В инструкции Dr. Frei Антистресс Магний B6 указано: растворить 1 таблетку в 200 мл воды и принимать вечером после еды. В одной таблетке 100 мг магния (27% суточной нормы по данным этикетки), 2 мг витамина B6, 100 мг таурина, витамины C и K.",
            "Дождитесь полного растворения и выпейте готовый раствор сразу. Не превышайте рекомендуемое количество на день. Если после вечернего приёма вы часто просыпаетесь или чувствуете дискомфорт в животе, попробуйте перенести приём на утро или обед — чёткого правила нет, выбор за вами.",
            "После начала приёма понаблюдайте за собой одну-две недели: обращайте внимание на пищеварение, стул и общее самочувствие. Начинать с небольшого количества и принимать с едой удобно большинству людей. Соблюдайте и условия хранения на этикетке: таблетки должны храниться в сухом месте, в закрытой упаковке.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Magniyni kechqurun ichish shartmi? Yoʻq. Kechqurun ham, ertalab ham mumkin; muhimi — bir xil vaqtda va ovqat bilan.",
            "Magniyni qancha muddat ichish mumkin? Muddat mahsulot yoʻriqnomasida koʻrsatiladi; uzoq muddatli qabul haqida shifokor bilan maslahatlashing.",
            "Magniyni vitamin D yoki kalsiy bilan birga ichish mumkinmi? Odatda mumkin, lekin katta dozalarni kun boʻyicha taqsimlash maʼqul.",
            "Magniy ichgandan keyin ich ketsa nima qilish kerak? Miqdorni kamaytiring, ovqat bilan iching yoki shakl haqida farmatsevtdan soʻrang; belgilar davom etsa, shifokorga murojaat qiling.",
            DISCLAIMER_UZ,
          ],
          ru: [
            "Обязательно ли принимать магний вечером? Нет. Можно и вечером, и утром; важно принимать в одно и то же время и с едой.",
            "Сколько времени можно принимать магний? Срок указан в инструкции продукта; о длительном приёме проконсультируйтесь с врачом.",
            "Можно ли принимать магний вместе с витамином D или кальцием? Обычно можно, но большие дозы лучше распределить по времени суток.",
            "Что делать, если после магния появился жидкий стул? Уменьшите количество, принимайте с едой или спросите у фармацевта о другой форме; если симптомы сохраняются, обратитесь к врачу.",
            DISCLAIMER_RU,
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-calcivit-30"],
    relatedArticleSlugs: ["magniy-va-uyqu", "magniy-b6-va-magniy-sitrat-farqi", "stress-davrida-magniy-va-b-vitaminlari"],
  },
  {
    slug: "vitamin-d-bolalarga-qancha-va-qachon",
    date: "2026-11-27",
    imageSeed: "bank-kids-tea",
    category: { uz: "Bolalar", ru: "Дети" },
    categoryKey: "nutrition",
    title: {
      uz: "Vitamin D bolalarga: qancha va qachon kerak",
      ru: "Витамин D детям: сколько и когда нужно",
    },
    excerpt: {
      uz: "Bolalar uchun vitamin D meʼyori (NIH ODS), manbalari, qishda quyosh yetishmasligi, yuqori chegara va tomchi yoki tabletka tanlashda nimalarga eʼtibor berish: ota-onalar uchun umumiy maʼlumot.",
      ru: "Нормы витамина D для детей (NIH ODS), источники, нехватка солнца зимой, верхняя граница и на что смотреть при выборе капель или таблеток: общая информация для родителей.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob: bolaga qancha vitamin D kerak", ru: "Коротко: сколько витамина D нужно ребёнку" },
        paragraphs: {
          uz: [
            "NIH Dietary Supplements ofisi (NIH ODS) maʼlumotiga koʻra, bir yoshgacha chaqaloqlar uchun yetarli miqdor (AI) kuniga 10 mkg (400 XB), 1–18 yoshdagi bolalar va oʻsmirlar uchun tavsiya etilgan meʼyor (RDA) kuniga 15 mkg (600 XB). Bu raqamlar quyosh nuri hisobga olinmagan holda, ovqat va qoʻshimchalardan olinadigan umumiy miqdorga tegishli.",
            "Muhimi shuki, aniq doza va qoʻshimcha kerakmi-yoʻqmi — bolaning yoshi, ovqatlanishi, yashash joyi, yilning vaqti va sogʻligʻiga bogʻliq, shuning uchun bu savolni pediatr bilan hal qilish kerak. Quyida ota-ona uchun umumiy tushuntirish va yorliqni oʻqish qoidalari berilgan.",
          ],
          ru: [
            "По данным Управления пищевых добавок NIH (NIH ODS), для детей до года адекватное потребление (AI) — 10 мкг (400 МЕ) в сутки, а для детей и подростков 1–18 лет рекомендуемая норма (RDA) — 15 мкг (600 МЕ) в сутки. Эти цифры относятся к общему количеству из еды и добавок, без учёта солнечного света.",
            "Важно: точная доза и сама необходимость добавки зависят от возраста ребёнка, питания, места проживания, времени года и состояния здоровья, поэтому решать этот вопрос нужно вместе с педиатром. Ниже — общие пояснения для родителей и правила чтения этикетки.",
          ],
        },
      },
      {
        heading: { uz: "Bolalarga vitamin D nima uchun kerak", ru: "Зачем детям витамин D" },
        paragraphs: {
          uz: [
            "EFSA ruxsat bergan formulalarga koʻra, vitamin D kalsiy va fosforning normal soʻrilishi hamda qondagi normal darajasiga, suyaklar va tishlarning normal holatini saqlashga, mushaklarning normal ishlashiga, immun tizimining normal ishlashiga hissa qoʻshadi. Alohida formula bolalarga tegishli: vitamin D bolalarda suyaklarning normal oʻsishi va rivojlanishiga hissa qoʻshadi.",
            "Oʻsish davrida suyak toʻqimasi tez shakllanadi, shuning uchun bolalar ayniqsa D vitaminining yetarli kelishiga muhtoj. NIH ODS ga koʻra, bolalikda tanqislik uzoq davom etsa, suyaklar rivojlanishi buzilishi (raxit) mumkin; bu hozirgi kunda kam uchraydi, lekin xavf guruhlari bor.",
          ],
          ru: [
            "По разрешённым формулировкам EFSA, витамин D способствует нормальному усвоению кальция и фосфора и их нормальному уровню в крови, поддержанию нормального состояния костей и зубов, нормальной работе мышц и иммунной системы. Отдельная формулировка относится к детям: витамин D способствует нормальному росту и развитию костей у детей.",
            "В период роста костная ткань формируется быстро, поэтому детям особенно важно, чтобы витамин D поступал в достаточном количестве. По данным NIH ODS, длительный дефицит в детстве может нарушать развитие костей (рахит); сегодня это встречается редко, но группы риска существуют.",
          ],
        },
      },
      {
        heading: { uz: "Manbalar: quyosh, ovqat, qoʻshimcha", ru: "Источники: солнце, еда, добавки" },
        paragraphs: {
          uz: [
            "Vitamin D ning asosiy tabiiy manbai — terida quyosh nuri taʼsirida hosil boʻlishi. Qishda quyosh past turadi, kunlar qisqa, bolalar koʻproq yopiq xonada va qalin kiyimda boʻladi, shuning uchun sintez sezilarli kamayadi. Toʻq rangli teri, quyosh kremi va yopiq kiyim ham sintezni kamaytiradi. Bu haqda «Qishda vitamin D» maqolasida batafsil.",
            "Oʻzbekistonda qish uzoq va bulutli kunlar koʻp, shuning uchun bolalar uchun quyosh bilan yetarli vitamin D olish qishda qiyinlashadi. Yozda esa ochiq havoda oʻynash, sogʻlom ovqatlanish va tavsiya etilgan miqdorni inobatga olish muvozanatni saqlaydi.",
            "Ovqatdan vitamin D olish qiyinroq: u yogʻli baliqda (losos, skumbriya), tuxum sarigʻida va boyitilgan mahsulotlarda bor. Ona suti tarkibida vitamin D kam boʻladi, shuning uchun emizikli chaqaloqlarga koʻpincha pediatrlar D vitamini tomchilarini tavsiya qiladi; formula (sunʼiy aralashma) odatda boyitilgan, miqdorni yorliqdan tekshiring.",
            "Bolaga quyoshda uzoq turishni «vitamin uchun» tavsiya qilmang: teri kuyishi xavfli. Quyosh va qoʻshimcha masalasini pediatr bilan, bolaning yoshi va yashash sharoitiga qarab hal qilish xavfsizroq.",
            "Xavf guruhlari ham bor: NIH ODS ga koʻra, toʻq rangli teri, deyarli quyoshga chiqmaydigan yoki yopiq kiyimda yuradigan bolalar, shuningdek ayrim surunkali kasalliklari boʻlganlar va ovqat soʻrilishi buzilgan bolalar yetishmovchilikka koʻproq moyil. Agar bolangiz shu guruhlardan biriga kirsa, vitamin D masalasini pediatr bilan oldindan muhokama qilgan maʼqul.",
          ],
          ru: [
            "Главный естественный источник витамина D — его образование в коже под действием солнечного света. Зимой солнце стоит низко, дни короткие, дети больше времени проводят в помещении и в плотной одежде, поэтому синтез заметно снижается. Тёмная кожа, солнцезащитный крем и закрытая одежда также уменьшают выработку. Подробнее — в статье «Витамин D зимой».",
            "В Узбекистане зима долгая, много пасмурных дней, и получить достаточно витамина D от солнца зимой детям сложнее. Летом помогают прогулки на свежем воздухе, сбалансированное питание и учёт рекомендуемого количества.",
            "Получить витамин D из еды труднее: он есть в жирной рыбе (лосось, скумбрия), желтке яиц и обогащённых продуктах. В грудном молоке витамина D мало, поэтому педиатры нередко рекомендуют грудным детям капли с витамином D; детские смеси обычно обогащены, количество проверяйте по этикетке.",
            "Не следует «для витамина» держать ребёнка на солнце долго: ожоги опасны. Безопаснее решать вопрос солнца и добавки вместе с педиатром с учётом возраста ребёнка и условий жизни.",
            "Есть и группы риска: по данным NIH ODS, дефицит чаще возникает у детей с тёмной кожей, у тех, кто почти не бывает на солнце или носит закрытую одежду, а также у детей с некоторыми хроническими заболеваниями и нарушением всасывания. Если ваш ребёнок относится к одной из этих групп, вопрос о витамине D лучше заранее обсудить с педиатром.",
          ],
        },
      },
      {
        heading: { uz: "Yuqori chegara: ortiqcha doza xavfi", ru: "Верхняя граница: риск избытка" },
        paragraphs: {
          uz: [
            "Vitamin D yogʻda eriydi va organizmda toʻplanishi mumkin. NIH ODS belgilagan yuqori chegaralar (UL), kuniga: 0–6 oy — 25 mkg (1000 XB); 7–12 oy — 38 mkg (1500 XB); 1–3 yosh — 63 mkg (2500 XB); 4–8 yosh — 75 mkg (3000 XB); 9 yosh va undan katta — 100 mkg (4000 XB). EFSA raqamlari biroz boshqacha, lekin mantiq bir xil.",
            "Uzoq muddat bu chegaradan oshganda qonda kalsiy darajasi koʻtarilishi mumkin: koʻngil aynishi, qusish, ishtaha pasayishi, buyrak bilan bogʻliq muammolar. Koʻpincha sabab — bir necha manbaning yigʻindisi: tomchi, multivitamin va boyitilgan mahsulot. Birliklarni adashtirmang: 1 mkg = 40 XB; tomchi yorligʻida ikki xil birlik uchrashi mumkin.",
            "Tomchi bilan dozalashda ota-onalar koʻpincha «bir tomchi» va «bir mililitr»ni adashtiradi. Dozalash usulini yorliq va pediatr tushuntirishidan aniq oʻrganing, oʻzboshimchalik bilan oshirmang.",
            "Qoʻshimchani bolaning oʻzi olib qoʻymasligi uchun qadoqni bolalar yetmaydigan joyda saqlang: tomchi va shipuchi tabletkalar shirin taʼmli boʻlishi mumkin, bola ularni shirinlik deb oʻylashi mumkin. Har doim yorliqdagi yosh cheklovini tekshiring.",
          ],
          ru: [
            "Витамин D жирорастворим и может накапливаться в организме. Верхние допустимые уровни (UL) по NIH ODS, в сутки: 0–6 месяцев — 25 мкг (1000 МЕ); 7–12 месяцев — 38 мкг (1500 МЕ); 1–3 года — 63 мкг (2500 МЕ); 4–8 лет — 75 мкг (3000 МЕ); 9 лет и старше — 100 мкг (4000 МЕ). У EFSA цифры немного другие, но логика та же.",
            "При длительном превышении может повыситься уровень кальция в крови: тошнота, рвота, снижение аппетита, проблемы с почками. Часто причина — сумма нескольких источников: капли, мультивитамины и обогащённые продукты. Не путайте единицы: 1 мкг = 40 МЕ; на этикетке капель могут встречаться обе.",
            "При дозировании каплями родители нередко путают «одну каплю» и «один миллилитр». Способ дозирования выясните точно по этикетке и объяснению педиатра, не увеличивайте самостоятельно.",
            "Храните добавку в недоступном для детей месте: капли и шипучие таблетки могут быть сладкими на вкус, и ребёнок может принять их за сладость. Всегда проверяйте возрастное ограничение на этикетке.",
          ],
        },
      },
      {
        heading: { uz: "Mahsulot tanlashda nimalarga eʼtibor berish", ru: "На что смотреть при выборе продукта" },
        paragraphs: {
          uz: [
            "Birinchi navbatda bolaning yoshiga mos shaklni tanlang: chaqaloq va kichik yoshdagi bolalar uchun odatda tomchi, kattaroq bolalar uchun tabletka yoki shipuchi shakl. Yorliqdagi vitamin D miqdorini mkg yoki XB da topib, yuqoridagi jadval bilan solishtiring va boshqa manbalardan (multivitamin, boyitilgan sut) kelayotgan miqdorni qoʻshing.",
            "Halol eslatma: katalogimizda 0–7 yoshdagi bolalar uchun alohida vitamin D tomchilari hozircha yoʻq. 7 yoshdan katta bolalar uchun Dr. Frei Kids shipuchi multivitamini mavjud: tarkibida 2,3 mkg vitamin D3 (yorliqdagi kunlik qiymatning 46 foizi), kalsiy, A, C, E va B guruhi vitaminlari bor. Bu — D vitaminining kunlik ehtiyojini toʻliq yopuvchi alohida qoʻshimcha emas, balki umumiy multivitamin.",
            "Qoʻshimchani boshlashdan oldin bolada 25(OH)D tahlili kerakmi-yoʻqmi — pediatr hal qiladi; natijani oʻqish haqida «Vitamin D tahlili: 25(OH)D natijasini qanday oʻqish» maqolasida yozilgan. Bolalar uchun umumiy tanlov qoidalari «Bolalar uchun vitaminlar: yoshga qarab tanlash» maqolasida.",
          ],
          ru: [
            "Прежде всего выбирайте форму по возрасту: для младенцев и малышей обычно капли, для детей постарше — таблетки или шипучая форма. Найдите на этикетке количество витамина D в мкг или МЕ, сравните с таблицей выше и прибавьте то, что поступает из других источников (мультивитамины, обогащённое молоко).",
            "Честное уточнение: отдельных капель витамина D для детей 0–7 лет в нашем каталоге пока нет. Для детей старше 7 лет есть шипучие мультивитамины Dr. Frei Kids: в составе 2,3 мкг витамина D3 (46% суточного значения по этикетке), кальций, витамины A, C, E и группы B. Это не отдельная добавка, закрывающая суточную потребность в витамине D, а общий мультивитамин.",
            "Нужен ли ребёнку анализ 25(OH)D до начала приёма, решает педиатр; как читать результат, написано в статье «Анализ на витамин D: как читать результат 25(OH)D». Общие правила выбора для детей — в статье «Витамины для детей: выбор по возрасту».",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Bolaga vitamin D ni yil boʻyi berish kerakmi? Bu bolaning yoshi, quyosh va ovqatiga bogʻliq; muddatni pediatr belgilaydi.",
            "Vitamin D ni ovqat bilan ichish kerakmi? Vitamin D yogʻda eriydi, shuning uchun yogʻli ovqat bilan yaxshiroq soʻriladi; yoʻriqnomada boshqa talab boʻlsa, unga amal qiling.",
            "Vitamin D ni kalsiy bilan birga ichish kerakmi? Ikkalasi suyak uchun birga ishlaydi, lekin kalsiy miqdori ham chegaradan oshmasligi kerak. Batafsil «Kalsiy va vitamin D3 birga» maqolasida.",
            "Doza oʻtkazib yuborilsa nima qilinadi? Keyingi safar ikki barobar bermang; odatiy jadvalga qayting va pediatrdan soʻrang.",
            DISCLAIMER_UZ,
          ],
          ru: [
            "Нужно ли давать ребёнку витамин D круглый год? Это зависит от возраста ребёнка, солнца и питания; срок определяет педиатр.",
            "Нужно ли принимать витамин D с едой? Витамин D жирорастворим, поэтому лучше усваивается с жирной пищей; если в инструкции указано иное, следуйте ей.",
            "Нужно ли принимать витамин D вместе с кальцием? Они работают вместе для костей, но количество кальция тоже не должно превышать границу. Подробнее — в статье «Кальций и витамин D3 вместе».",
            "Что делать, если пропустили приём? В следующий раз не давайте двойную дозу; вернитесь к обычному графику и уточните у педиатра.",
            DISCLAIMER_RU,
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-kids-multivitamins-20", "swiss-energy-calcivit-30"],
    relatedArticleSlugs: ["bolalar-uchun-vitaminlar-yoshga-qarab", "qishda-vitamin-d", "vitamin-d-tahlili-25-oh-normasi"],
  },
];
