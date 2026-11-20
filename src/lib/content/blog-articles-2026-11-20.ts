import type { RawArticle } from "./blog";

/*
  Daily SEO batch, 2026-11-20. Reference intakes and general guidance only, no promise of
  effect (blog.test.ts runs the claim checks). Sources: NIH Office of Dietary Supplements
  fact sheets (vitamin A, zinc, vitamin B12), EFSA authorised nutrient wording, EFSA 2014
  zinc upper level opinion. Photos: Adobe Stock, see public/images/blog/SOURCES.md.
*/
export const articlesNov2026f: RawArticle[] = [
  {
    slug: "vitamin-a-nima-uchun-kerak",
    date: "2026-11-20",
    imageSeed: "bank-carrots-vitamin-a",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Vitamin A: nima uchun kerak va yuqori chegarasi",
      ru: "Витамин A: для чего нужен и какой предел",
    },
    excerpt: {
      uz: "Retinol va beta-karotin farqi, kunlik meʼyor, qaysi ovqatlarda bor va nima uchun vitamin A ni dozasini oshirib yubormaslik kerak.",
      ru: "Чем отличаются ретинол и бета-каротин, какая суточная норма, в каких продуктах есть витамин A и почему его нельзя принимать сверх меры.",
    },
    sections: [
      {
        heading: { uz: "Vitamin A nima va qanday shakllari bor", ru: "Что такое витамин A и какие у него формы" },
        paragraphs: {
          uz: [
            "Vitamin A — yogʻda eriydigan vitamin. Aslida bu bitta modda emas, balki bir guruh birikmalar: tayyor (oldindan shakllangan) vitamin A, yaʼni retinol va uning hosilalari, hamda organizm vitamin A ga aylantira oladigan oʻsimlik pigmentlari — karotinoidlar, eng mashhuri beta-karotin. Ular bir xil emas, shuning uchun oʻzini tutishi ham, xavfsizlik chegarasi ham farq qiladi.",
            "Yogʻda eriydigan vitaminlar organizmda, asosan jigarda, zaxira sifatida saqlanadi. Bu ularni suvda eriydigan vitaminlardan (masalan, C yoki B guruhi) farqlaydi: ortiqcha miqdor siydik bilan tez chiqib ketmaydi. Shu sababli vitamin A haqida gap ketganda «koʻproq — yaxshiroq» qoidasi ishlamaydi.",
            "Amalda bu quyidagicha koʻrinadi: bir kishi jigar yeydi va ustiga retinolli qoʻshimcha ichadi, boshqasi sabzi va qovoqni koʻp isteʼmol qiladi. Birinchisida jami retinol yuqori chegaraga yaqinlashishi mumkin, ikkinchisida esa bunday xavf deyarli yoʻq. Shuning uchun qoʻshimchani tanlashdan oldin odatiy ovqatlanishingizni oʻylab koʻring: qaysi manbalarni qanchalik tez-tez isteʼmol qilasiz.",
          ],
          ru: [
            "Витамин A — жирорастворимый витамин. На самом деле это не одно вещество, а группа соединений: готовый (преформированный) витамин A, то есть ретинол и его производные, и растительные пигменты — каротиноиды, самый известный из которых бета-каротин, — которые организм может превращать в витамин A. Они не одинаковы, поэтому и ведут себя, и имеют предел безопасности по-разному.",
            "Жирорастворимые витамины хранятся в организме, главным образом в печени. Этим они отличаются от водорастворимых (например, C или группы B): лишнее не уходит быстро с мочой. Поэтому для витамина A правило «чем больше, тем лучше» не работает.",
            "На практике это выглядит так: один человек ест печень и дополнительно принимает добавку с ретинолом, другой много ест морковь и тыкву. У первого суммарное количество ретинола может приблизиться к верхнему пределу, у второго такого риска практически нет. Поэтому перед выбором добавки подумайте о своём обычном питании: какие источники и как часто вы едите.",
          ],
        },
      },
      {
        heading: { uz: "Organizmda qanday vazifa bajaradi", ru: "Какую роль выполняет в организме" },
        paragraphs: {
          uz: [
            "Yevropa Ittifoqida ruxsat etilgan formulalarga koʻra (EFSA ilmiy bahosi asosida), vitamin A normal koʻrishni, teri va shilliq pardalarning meʼyoriy holatini, immunitet tizimining normal ishlashini hamda temir almashinuvini saqlashga hissa qoʻshadi. Bular vitaminning oddiy fiziologik vazifalari: yetarli miqdorda boʻlsa, organizm bu jarayonlarni odatdagidek bajaradi.",
            "Koʻrish bilan aloqasi ayniqsa mashhur: retinol koʻzning toʻr pardasidagi yorugʻlikni sezuvchi pigmentning qismi. Biroq bu qoʻshimcha ichish koʻrishni yaxshilaydi degani emas. Agar ovqat bilan yetarli kelayotgan boʻlsa, qoʻshimcha vitamin A qoʻshimcha foyda bermaydi.",
            "Ovqatlanishda vitamin A yetishmasligi iqtisodiy rivojlangan mintaqalarda kam uchraydi, chunki ovqat ratsioni odatda yetarli. Xavf guruhlariga ovqati juda cheklangan odamlar, soʻrilish buzilishi bor kasalliklarga chalinganlar va yogʻ soʻrilishi susaygan odamlar kiradi. Bunday holatda tashxis va miqdorni shifokor aniqlaydi, oʻzboshimchalik bilan ichish tavsiya etilmaydi.",
            "Qon tahlilida B12 darajasi pastligi aniqlansa, sababni topish kerak: ovqatmi, soʻrilishmi yoki dori taʼsirimi. Faqat shundan keyin shifokor miqdor va qabul qilish shaklini (kapsula, tabletka yoki boshqa) tanlaydi. Oʻzboshimchalik bilan yuqori dozalarni ichish bu bosqichni oʻtkazib yuboradi.",
          ],
          ru: [
            "По формулировкам, разрешённым в ЕС на основе оценки EFSA, витамин A способствует поддержанию нормального зрения, нормального состояния кожи и слизистых оболочек, нормальной работы иммунной системы, а также нормального обмена железа. Это обычные физиологические функции витамина: при достаточном количестве организм выполняет эти процессы в обычном режиме.",
            "Связь со зрением особенно известна: ретинол входит в состав светочувствительного пигмента сетчатки глаза. Но это не значит, что добавка улучшит зрение. Если витамина A с едой поступает достаточно, дополнительное количество пользы не добавит.",
            "Недостаток витамина A из-за питания в экономически развитых регионах встречается редко, потому что рацион обычно достаточен. К группам риска относятся люди с очень ограниченным питанием, с заболеваниями, при которых нарушено всасывание, и с нарушенным всасыванием жиров. В таком случае диагноз и дозу определяет врач, самостоятельный приём не рекомендуется.",
            "Если анализ показал низкий уровень B12, нужно найти причину: питание, усвоение или влияние лекарств. Только после этого врач подбирает дозу и форму приёма (капсулы, таблетки или другое). Самостоятельный приём высоких доз пропускает этот этап.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor qancha", ru: "Какова суточная норма" },
        paragraphs: {
          uz: [
            "AQSH Milliy sogʻliqni saqlash institutlari qoshidagi Ovqat qoʻshimchalari boʻlimi (NIH ODS) maʼlumotiga koʻra, kattalar uchun tavsiya etilgan kunlik miqdor erkaklarda 900 mkg RAE, ayollarda 700 mkg RAE (RAE — retinol aktivlik ekvivalenti). Homiladorlikda 770 mkg, emizish davrida 1300 mkg RAE. Bolalar uchun meʼyor yoshiga qarab ancha past.",
            "Qadoqlarda vitamin A koʻpincha XB (xalqaro birlik, IU) bilan yoziladi. Oʻtkazish koeffitsiyenti vitamin shakliga bogʻliq, shuning uchun yorliqdagi sonni oʻzingiz taxmin qilib oʻtkazmang: ishlab chiqaruvchi odatda mkg RAE yoki foizni ham koʻrsatadi, yoʻq boʻlsa farmatsevtdan soʻrang.",
            "Sinkka ehtiyoj yoshga qarab oʻzgaradi: bolalarda meʼyor kattalardan past, oʻsmirlarda esa erkaklar va ayollar orasida farq paydo boʻladi. Bola uchun alohida mahsulot kerak boʻlsa, kattalar uchun moʻljallangan kompleksni berib yubormang, chunki bolalarning yuqori chegarasi ancha past.",
          ],
          ru: [
            "По данным Управления пищевых добавок Национальных институтов здоровья США (NIH ODS), рекомендуемая суточная доза для взрослых — 900 мкг RAE у мужчин и 700 мкг RAE у женщин (RAE — эквивалент активности ретинола). При беременности 770 мкг, при кормлении грудью 1300 мкг RAE. Для детей норма заметно ниже и зависит от возраста.",
            "На упаковках витамин A часто указывают в МЕ (международных единицах). Коэффициент пересчёта зависит от формы витамина, поэтому не переводите цифры на этикетке сами: производитель обычно указывает и мкг RAE, или процент от нормы, а если нет — спросите фармацевта.",
            "Потребность в цинке меняется с возрастом: у детей норма ниже, чем у взрослых, а у подростков появляется различие между мальчиками и девочками. Если нужен продукт для ребёнка, не давайте ему комплекс для взрослых, потому что верхний предел для детей заметно ниже.",
          ],
        },
      },
      {
        heading: { uz: "Yuqori chegara: nima uchun ehtiyot boʻlish kerak", ru: "Верхний предел: почему нужна осторожность" },
        paragraphs: {
          uz: [
            "NIH ODS kattalar uchun tayyor vitamin A (retinol) ning qabul qilinadigan yuqori chegarasini kuniga 3000 mkg RAE deb belgilagan. Bu chegara ovqatdagi va qoʻshimchadagi retinolning yigʻindisiga tegishli. Karotinoidlar (beta-karotin) bu chegaraga kirmaydi, chunki organizm ularni oʻzi kerakligicha aylantiradi.",
            "Uzoq vaqt chegaradan koʻp retinol qabul qilish jigarga va suyaklarga salbiy taʼsir qilishi mumkin, bosh ogʻrigʻi va koʻngil aynishi ham uchraydi. Alohida ehtiyotkorlik homiladorlikka tegishli: homiladorlik davrida retinolning ortiqcha miqdori bola rivojlanishiga zarar yetkazishi mumkinligi maʼlum. Shuning uchun homilador boʻlishni rejalashtirayotgan yoki homilador ayol vitamin A tutgan har qanday qoʻshimchani faqat shifokor bilan kelishib ichadi. Chekuvchilarga esa yuqori dozali beta-karotin qoʻshimchalari tavsiya etilmaydi.",
          ],
          ru: [
            "NIH ODS установило допустимый верхний предел для взрослых по готовому витамину A (ретинолу) — 3000 мкг RAE в сутки. Этот предел относится к сумме ретинола из пищи и добавок. Каротиноиды (бета-каротин) в него не входят, поскольку организм превращает их ровно в том количестве, которое нужно.",
            "Длительный приём ретинола выше этого предела может неблагоприятно сказываться на печени и костях, возможны также головная боль и тошнота. Особая осторожность нужна при беременности: избыток ретинола в этот период может повредить развитию ребёнка. Поэтому женщина, которая планирует беременность или уже беременна, принимает любую добавку с витамином A только по согласованию с врачом. Курильщикам не рекомендуют добавки с высокими дозами бета-каротина.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda bor", ru: "В каких продуктах он есть" },
        paragraphs: {
          uz: [
            "Tayyor vitamin A hayvon mahsulotlarida uchraydi: jigar (eng boyi, shuning uchun uni har kuni yemaslik kerak), tuxum sarigʻi, sut va sariyogʻ, yogʻli baliq. Karotinoidlar oʻsimliklarda: sabzi, qovoq, shirin kartoshka, ismaloq, sholgʻomning yashil barglari, oʻrik va qovun.",
            "Karotinoidlar yogʻ bilan yaxshiroq soʻriladi, shuning uchun sabzini oʻsimlik moyi bilan dimlash yoki salatga bir osh qoshiq moy qoʻshish maʼqul. Xilma-xil ovqatlanadigan odamning ehtiyoji odatda ovqatning oʻzidan qoplanadi.",
            "Misol uchun, oʻrta kattalikdagi pishirilgan sabzi yoki bir piyola qovoq pyuresi kunlik meʼyorning katta qismini karotinoidlar shaklida berishi mumkin; aniq miqdor navga va pishirish usuliga bogʻliq. Ovqatni xilma-xil qilish — eng oddiy yoʻl: bir kunda sabzi, boshqa kuni ismaloq, haftada bir marta tuxum yoki baliq.",
          ],
          ru: [
            "Готовый витамин A содержится в продуктах животного происхождения: печень (самый богатый источник, поэтому есть её каждый день не стоит), яичный желток, молоко и сливочное масло, жирная рыба. Каротиноиды — в растениях: морковь, тыква, батат, шпинат, зелёные листья, курага и дыня.",
            "Каротиноиды лучше усваиваются вместе с жиром, поэтому морковь удобно тушить с растительным маслом или добавить ложку масла в салат. Потребность человека с разнообразным питанием обычно покрывается самой едой.",
            "Например, средняя варёная морковь или тарелка тыквенного пюре могут дать значительную часть суточной нормы в виде каротиноидов; точное количество зависит от сорта и способа приготовления. Разнообразить питание проще всего: в один день морковь, в другой шпинат, раз в неделю яйца или рыба.",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimchani qanday tanlash kerak", ru: "Как выбрать добавку" },
        paragraphs: {
          uz: [
            "Avvalo yorliqda vitamin A qaysi shaklda (retinol yoki beta-karotin) va qancha miqdorda ekanini tekshiring, kunlik porsiyadagi miqdorni boshqa qoʻshimchalardagi miqdorga qoʻshib hisoblang: multivitamin, koʻz uchun kompleks va baliq moyi birgalikda yuqori chegaradan oshib ketishi mumkin.",
            "Katalogimizda vitamin A kompleks tarkibida boʻlgan mahsulotlar bor: Swiss Energy Visiovit (lyutein, zeaksantin, chernika ekstrakti, A, E vitaminlari va sink, 30 kapsula) va Dr. Frei Gold (lyutein bilan A, C, E vitaminlari va sink, 20 shipuchi tabletka, 14 yoshdan). Aniq miqdorlar qadoqdagi yorliqda koʻrsatilgan. Ular ovqat oʻrnini bosmaydi va dori vositasi emas.",
            "Qoʻshimchani ichayotganda bir vaqtning oʻzida bir nechta vitamin kompleksini qoʻshmang. Ayniqsa kuz-qish mavsumida odamlar immunitet, koʻz va soch uchun alohida mahsulotlar ichadi va ularning har birida vitamin A boʻlishi mumkin. Har bir yorliqni oʻqib, jami miqdorni bir varaqqa yozib chiqish yetarli.",
          ],
          ru: [
            "Прежде всего проверьте на этикетке, в какой форме указан витамин A (ретинол или бета-каротин) и в каком количестве, и суммируйте дозу из разных добавок: мультивитамины, комплекс для глаз и рыбий жир вместе могут превысить верхний предел.",
            "В нашем каталоге есть продукты, в составе которых есть витамин A: Swiss Energy Visiovit (лютеин, зеаксантин, экстракт черники, витамины A и E и цинк, 30 капсул) и Dr. Frei Gold (лютеин с витаминами A, C, E и цинком, 20 шипучих таблеток, с 14 лет). Точные количества указаны на этикетке. Они не заменяют питание и не являются лекарством.",
            "Не принимайте одновременно несколько витаминных комплексов. Особенно в осенне-зимний сезон люди принимают отдельные продукты для иммунитета, глаз и волос, и в каждом из них может быть витамин A. Достаточно прочитать каждую этикетку и записать общее количество на листок.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Sabzi koʻp yeyilsa, vitamin A ortiqcha boʻlib qoladimi? Karotinoidlar organizmda kerakligicha aylantiriladi, shuning uchun sabzidan retinol zaharlanishi kutilmaydi. Teri vaqtincha sargʻish tusga kirishi mumkin, bu zararsiz va miqdor kamaygach oʻtadi.",
            "Vitamin A ni qachon ichgan yaxshi? Yogʻda eriydigani uchun uni yogʻli ovqat bilan qabul qilish soʻrilishga yordam beradi. Aniq tartib qadoqdagi koʻrsatmada yoziladi.",
            "Bolalarga vitamin A berish mumkinmi? Bolalar uchun yuqori chegara kattalardan ancha past, shuning uchun faqat bolalarga moʻljallangan mahsulotni va qadoqdagi dozani oshirmasdan bering, avval shifokor yoki farmatsevt bilan maslahatlashing.",
          ],
          ru: [
            "Если есть много моркови, не будет ли избытка витамина A? Каротиноиды превращаются в организме в нужном количестве, поэтому отравления ретинолом от моркови не ожидается. Кожа может временно приобрести желтоватый оттенок: это безвредно и проходит при уменьшении количества.",
            "Когда лучше принимать витамин A? Он жирорастворим, поэтому приём с жирной пищей помогает усвоению. Точный порядок указан в инструкции на упаковке.",
            "Можно ли давать витамин A детям? Для детей верхний предел заметно ниже, чем для взрослых, поэтому давайте только продукт, предназначенный для детей, не превышая дозу на упаковке, и сначала посоветуйтесь с врачом или фармацевтом.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-visiovit-30", "dr-frei-gold-vitamins-20"],
  },
  {
    slug: "sink-nima-uchun-kerak-teri-soch",
    date: "2026-11-20",
    imageSeed: "bank-pumpkin-seeds-zinc",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Sink nima uchun kerak: teri, soch va tirnoq",
      ru: "Цинк: для чего нужен коже, волосам и ногтям",
    },
    excerpt: {
      uz: "Sink organizmda qanday vazifa bajaradi, kunlik meʼyor qancha, qaysi ovqatlarda koʻp va nima uchun uni meʼyoridan oshirib yubormaslik kerak.",
      ru: "Какую роль цинк играет в организме, какая суточная норма, в каких продуктах его много и почему не стоит превышать дозу.",
    },
    sections: [
      {
        heading: { uz: "Sink nima va nega muhim", ru: "Что такое цинк и почему он важен" },
        paragraphs: {
          uz: [
            "Sink — mikroelement, yaʼni organizmga oz miqdorda, lekin muntazam kerak boʻladigan mineral. U yuzlab fermentlarning tarkibida ishtirok etadi, hujayra boʻlinishi va oqsil hamda DNK sintezi bilan bogʻliq. Organizm sinkni katta zaxira sifatida saqlamaydi, shuning uchun u ovqat bilan har kuni kelib turishi kerak.",
            "Sink haqidagi qidiruvlar koʻpincha immunitet bilan bogʻlanadi, ammo uning vazifalari kengroq: teri, soch va tirnoq, taʼm va hid sezgisi, jarohat bitish jarayoni. Immunitet jihatini alohida maqolamizda yozganmiz; bu yerda teri va soch mavzusiga eʼtibor beramiz.",
            "Sinkning yetishmasligi kam ovqatlanadigan, ovqati bir xil yoki oʻsimlik mahsulotlariga tayanadigan, shuningdek soʻrilish buzilgan odamlarda uchraydi. Belgilari juda umumiy boʻlgani uchun (ishtaha pasayishi, taʼm sezgisining oʻzgarishi, jarohatning sekin bitishi) uni faqat shifokor tekshiruv asosida aniqlay oladi. Shu sababli oʻzingizga sink yetishmayapti deb xulosa qilmang.",
          ],
          ru: [
            "Цинк — микроэлемент, то есть минерал, который нужен организму в малых количествах, но регулярно. Он входит в состав сотен ферментов и связан с делением клеток, синтезом белка и ДНК. Организм не хранит цинк в больших запасах, поэтому он должен поступать с едой каждый день.",
            "Запросы про цинк часто связывают с иммунитетом, но его роль шире: кожа, волосы и ногти, вкус и обоняние, процесс заживления ран. Иммунитету мы посвятили отдельную статью; здесь остановимся на коже и волосах.",
            "Недостаток цинка встречается у людей, которые мало едят, питаются однообразно или опираются на растительные продукты, а также при нарушенном всасывании. Признаки очень общие (сниженный аппетит, изменение вкуса, медленное заживление ран), поэтому определить его может только врач по обследованию. Не делайте вывод сами, что вам не хватает цинка.",
          ],
        },
      },
      {
        heading: { uz: "Teri, soch va tirnoq bilan aloqasi", ru: "Связь с кожей, волосами и ногтями" },
        paragraphs: {
          uz: [
            "Yevropa Ittifoqida ruxsat etilgan formulalarga koʻra (EFSA ilmiy bahosi asosida), sink terining, sochning va tirnoqning normal holatini saqlashga hissa qoʻshadi. Shuningdek u normal immunitet faoliyati, DNK sintezi, hujayra boʻlinishi, taʼm va koʻrish hamda normal uglevod almashinuvi bilan bogʻliq.",
            "Bu — vaʼda emas, oddiy fiziologik vazifa. Sochning toʻkilishi, terining quruqligi yoki tirnoqning sinishi koʻp sabablarga ega: ovqatlanish, gormonal holat, temir va boshqa moddalar yetishmasligi, tashqi parvarish, kasalliklar. Agar bu belgilar uzoq davom etsa yoki keskin kuchaysa, qoʻshimchani oʻzboshimchalik bilan tanlamasdan, shifokorga murojaat qiling.",
            "Terini parvarishlashda sink tez-tez uchraydi: u krem va malhamlarda tashqi tarzda ham ishlatiladi. Biroq ichga qabul qilinadigan qoʻshimcha va tashqi vosita bir xil narsa emas. Qoʻshimcha ichish bilan birga soch va teriga mos shampun, namlantiruvchi vositalar, quyoshdan himoya va yetarli uyqu kabi oddiy odatlar ham muhim.",
          ],
          ru: [
            "По формулировкам, разрешённым в ЕС на основе оценки EFSA, цинк способствует поддержанию нормального состояния кожи, волос и ногтей. Он также связан с нормальной работой иммунной системы, синтезом ДНК, делением клеток, вкусом, зрением и нормальным обменом углеводов.",
            "Это не обещание эффекта, а обычная физиологическая роль. У выпадения волос, сухости кожи или ломкости ногтей много причин: питание, гормональный фон, нехватка железа и других веществ, уход, заболевания. Если эти признаки долго не проходят или резко усиливаются, не подбирайте добавку наугад, а обратитесь к врачу.",
            "Цинк часто встречается в уходе за кожей: его используют и наружно, в кремах и мазях. Но добавка для приёма внутрь и наружное средство — не одно и то же. Помимо добавки важны простые привычки: подходящий шампунь, увлажняющие средства, защита от солнца и достаточный сон.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor qancha", ru: "Какова суточная норма" },
        paragraphs: {
          uz: [
            "NIH ODS maʼlumotiga koʻra, kattalar uchun tavsiya etilgan kunlik miqdor erkaklarda 11 mg, ayollarda 8 mg. Homiladorlikda 11 mg, emizish davrida 12 mg. Vegetarianlarga ehtiyoj taxminan 50 foizga yuqoriroq boʻlishi mumkin, chunki oʻsimlik ovqatidagi fitatlar sinkning soʻrilishini kamaytiradi.",
            "Ovqatdagi sink miqdori ham, qoʻshimchadagi miqdor ham milligrammda koʻrsatiladi. Qoʻshimchalarda sink turli tuz shaklida (sitrat, glyukonat, oksid, pikolinat) boʻladi: yorliqda nafaqat birikma, balki sof sink miqdori yozilganini tekshiring.",
          ],
          ru: [
            "По данным NIH ODS, рекомендуемая суточная доза для взрослых — 11 мг у мужчин и 8 мг у женщин. При беременности 11 мг, при кормлении грудью 12 мг. Вегетарианцам потребность может быть примерно на 50 процентов выше, потому что фитаты растительной пищи снижают усвоение цинка.",
            "Количество цинка и в еде, и в добавках указывают в миллиграммах. В добавках цинк бывает в виде разных солей (цитрат, глюконат, оксид, пиколинат): проверьте, что на этикетке указано не только соединение, но и количество чистого цинка.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda koʻp", ru: "В каких продуктах его много" },
        paragraphs: {
          uz: [
            "Sinkka eng boy manba — ustritsa, lekin u har kuni ovqat emas. Oddiy ovqatlar orasida goʻsht (mol goʻshti, qoʻy goʻshti), parranda goʻshti, dukkaklilar (loviya, nohut, yasmiq), qovoq urugʻi, yongʻoq (anakardiya, bodom), sut mahsulotlari va butun donli mahsulotlar sinkni beradi.",
            "Qovoq urugʻi va dukkaklilar oʻsimlik manbalari, lekin ularda fitat bor. Dukkaklilarni ivitish, nonni xamirturush bilan pishirish fitat miqdorini kamaytiradi va sinkning soʻrilishini yaxshilaydi. Goʻshtdan sink odatda yaxshiroq soʻriladi.",
            "Bir kunlik menyuga misol: nonushtada yogʻsiz yoki past yogʻli sut mahsulotlari va bir hovuch yongʻoq, tushlikda loviya yoki nohutli shoʻrva, kechki ovqatda goʻsht yoki parranda goʻshti. Shu odatiy ovqatning oʻzi koʻpchilik kattalar uchun tavsiya etilgan miqdorga yaqinlashtiradi.",
          ],
          ru: [
            "Самый богатый источник цинка — устрицы, но это не ежедневная еда. Среди обычных продуктов цинк дают мясо (говядина, баранина), птица, бобовые (фасоль, нут, чечевица), тыквенные семечки, орехи (кешью, миндаль), молочные продукты и цельнозерновые.",
            "Тыквенные семечки и бобовые — растительные источники, но в них есть фитаты. Замачивание бобовых и выпечка хлеба на закваске снижают количество фитатов и улучшают усвоение цинка. Из мяса цинк обычно усваивается лучше.",
            "Пример дневного меню: на завтрак молочные продукты и горсть орехов, на обед суп с фасолью или нутом, на ужин мясо или птица. Такое обычное питание само приближает к рекомендуемому количеству большинство взрослых.",
          ],
        },
      },
      {
        heading: { uz: "Yuqori chegara va qoʻshimchani tanlash", ru: "Верхний предел и выбор добавки" },
        paragraphs: {
          uz: [
            "Kattalar uchun sinkning qabul qilinadigan yuqori chegarasi kuniga 40 mg (NIH ODS); Yevropada EFSA esa kattalar uchun 25 mg chegarasini belgilagan, shuning uchun ehtiyot uchun pastroq raqamga eʼtibor bering. Uzoq vaqt koʻp sink qabul qilish misning soʻrilishini kamaytirib, mis yetishmasligiga olib kelishi mumkin; koʻngil aynishi va qusish ham uchraydi. Sink pastilkalari va boshqa qoʻshimchalarni birga ichsangiz, jami miqdorni hisoblang.",
            "Katalogimizda sink kompleks tarkibida boʻlgan mahsulotlar bor: Swiss Energy ImmunoVit (exinatseya, propolis, vitamin C va sink, 30 kapsula), Dr. Frei Gold (lyutein, A, C, E vitaminlari va sink, shipuchi tabletka) va Swiss Energy Calcivit (kalsiy, D3, K2 va sink, mis, marganets, 30 kapsula). Dori qabul qiluvchilar, homilador va emizikli ayollar avval shifokor bilan maslahatlashsin.",
            "Qoʻshimchani boshlashdan oldin oʻzingizdan soʻrang: ovqatim xilma-xilmi, goʻsht, dukkaklilar va yongʻoqni muntazam yeymanmi? Agar shunday boʻlsa, qoʻshimcha sinkka ehtiyoj kam boʻladi. Agar qoʻshimcha ichsangiz, qadoqda koʻrsatilgan kunlik porsiyadan oshirmang va kursni oʻzboshimchalik bilan uzaytirmang. Biror noqulaylik sezsangiz, qabul qilishni toʻxtatib, shifokorga murojaat qiling.",
          ],
          ru: [
            "Допустимый верхний предел цинка для взрослых — 40 мг в сутки (NIH ODS); в Европе EFSA установило 25 мг, поэтому для осторожности ориентируйтесь на меньшую цифру. Длительный приём больших количеств цинка снижает усвоение меди и может привести к её нехватке; бывают также тошнота и рвота. Если вы принимаете пастилки с цинком и другие добавки, суммируйте общее количество.",
            "В нашем каталоге есть продукты, в составе которых есть цинк: Swiss Energy ImmunoVit (эхинацея, прополис, витамин C и цинк, 30 капсул), Dr. Frei Gold (лютеин, витамины A, C, E и цинк, шипучие таблетки) и Swiss Energy Calcivit (кальций, D3, K2 и цинк, медь, марганец, 30 капсул). Тем, кто принимает лекарства, а также беременным и кормящим женщинам лучше сначала посоветоваться с врачом.",
            "Перед началом приёма спросите себя: разнообразно ли я питаюсь, регулярно ли ем мясо, бобовые и орехи? Если да, потребность в добавочном цинке невелика. Если вы принимаете добавку, не превышайте суточную порцию, указанную на упаковке, и не продлевайте курс самостоятельно. При любом дискомфорте прекратите приём и обратитесь к врачу.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Sinkni bosh qoringa ichsa boʻladimi? Koʻpchilik uchun bu koʻngil aynishiga sabab boʻladi, shuning uchun uni ovqat bilan ichish tavsiya etiladi. Aniq tartib qadoqdagi koʻrsatmada yoziladi.",
            "Sink va temirni birga ichish mumkinmi? Yuqori dozalarda ular bir-birining soʻrilishiga xalaqit berishi mumkin, shuning uchun alohida vaqtda ichish ham, tarkibida ikkalasi bor kompleksni shifokor bilan kelishish ham maʼqul.",
            "Sochim toʻkilsa, sink ichsam yordam beradimi? Sochning toʻkilishi turli sabablardan boʻlishi mumkin. Sink faqat uning yetishmasligi boʻlgan holatda mavzuga aloqador, buni esa shifokor tekshiruv orqali aniqlaydi.",
          ],
          ru: [
            "Можно ли принимать цинк натощак? Для многих это вызывает тошноту, поэтому цинк рекомендуют принимать во время еды. Точный порядок указан в инструкции на упаковке.",
            "Можно ли принимать цинк и железо вместе? В высоких дозах они могут мешать усвоению друг друга, поэтому лучше принимать их в разное время, а комплекс с обоими веществами согласовать с врачом.",
            "Если выпадают волосы, поможет ли цинк? У выпадения волос бывают разные причины. Цинк имеет отношение к теме лишь при его недостатке, а это определяет врач по обследованию.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-immunovit-30", "dr-frei-gold-vitamins-20", "swiss-energy-calcivit-30"],
  },
  {
    slug: "vitamin-b12-kimlarga-kerak",
    date: "2026-11-20",
    imageSeed: "bank-protein-foods-b12",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Vitamin B12: kimlarga va nima uchun kerak",
      ru: "Витамин B12: кому и для чего он нужен",
    },
    excerpt: {
      uz: "B12 qaysi ovqatlarda bor, vegetarianlar va 50 yoshdan oshganlar nega alohida eʼtibor berishi kerak, kunlik meʼyor va shakllari.",
      ru: "В каких продуктах есть B12, почему вегетарианцам и людям старше 50 лет стоит быть внимательнее, суточная норма и формы витамина.",
    },
    sections: [
      {
        heading: { uz: "Vitamin B12 nima", ru: "Что такое витамин B12" },
        paragraphs: {
          uz: [
            "Vitamin B12 (kobalamin) — suvda eriydigan vitamin, tarkibida kobalt mineral bor, shuning uchun shunday nomlanadi. U B guruhining boshqa vitaminlaridan bir narsasi bilan ajralib turadi: organizm uni jigarda bir necha yilga yetadigan miqdorda zaxira qiladi. Shuning uchun yetishmovchilik odatda asta-sekin, oylar va yillar davomida yuzaga keladi.",
            "Umumiy B-kompleks haqida alohida maqolamiz bor; bu yerda faqat B12 ga eʼtibor beramiz, chunki unga bogʻliq savollar boshqacha: manba, soʻrilish va xavf guruhlari haqida.",
            "B12 ning oʻziga xos tomoni — soʻrilish jarayoni. Ovqatdagi B12 avval oqsildan ajralishi, keyin oshqozonda ishlab chiqariladigan maxsus oqsil (ichki omil) bilan birikib, ingichka ichakda qonga oʻtishi kerak. Qoʻshimchadagi B12 oqsilga bogʻlanmagan boʻladi va bu bosqichning bir qismini oʻtkazib yuboradi.",
          ],
          ru: [
            "Витамин B12 (кобаламин) — водорастворимый витамин, в составе которого есть минерал кобальт, отсюда и название. От других витаминов группы B он отличается тем, что организм запасает его в печени в количестве, которого хватает на несколько лет. Поэтому дефицит обычно развивается постепенно, месяцами и годами.",
            "Об общем B-комплексе у нас есть отдельная статья; здесь мы говорим только о B12, потому что вопросы к нему другие: источники, усвоение и группы, которым стоит быть внимательнее.",
            "Особенность B12 — процесс усвоения. B12 из пищи должен сначала отделиться от белка, затем соединиться со специальным белком (внутренним фактором), который вырабатывается в желудке, и только потом всасывается в кровь в тонком кишечнике. B12 из добавки не связан с белком и пропускает часть этого этапа.",
          ],
        },
      },
      {
        heading: { uz: "Organizmda qanday vazifa bajaradi", ru: "Какую роль выполняет в организме" },
        paragraphs: {
          uz: [
            "Yevropa Ittifoqida ruxsat etilgan formulalarga koʻra (EFSA ilmiy bahosi asosida), vitamin B12 normal energiya almashinuviga, asab tizimining normal ishlashiga, normal psixologik faoliyatga, qizil qon tanachalarining normal hosil boʻlishiga, normal immunitet faoliyatiga hamda charchoq va holsizlikni kamaytirishga hissa qoʻshadi. U gomosistein almashinuvi va hujayra boʻlinishida ham ishtirok etadi.",
            "Bu — vitaminning oddiy fiziologik vazifalari. Charchoqning sabablari juda koʻp: uyqu, ish yuki, kamqonlik, qalqonsimon bez, depressiya va boshqalar. Shuning uchun «charchadim» degani «B12 yetishmayapti» degani emas, buni faqat qon tahlili aniqlaydi.",
          ],
          ru: [
            "По формулировкам, разрешённым в ЕС на основе оценки EFSA, витамин B12 способствует нормальному энергетическому обмену, нормальной работе нервной системы, нормальной психологической функции, нормальному образованию красных кровяных клеток, нормальной работе иммунной системы. Он участвует также в обмене гомоцистеина и делении клеток.",
            "Это обычные физиологические функции витамина. У усталости очень много причин: сон, нагрузка, малокровие, щитовидная железа, депрессия и другие. Поэтому «я устал» не означает «мне не хватает B12»: это определяет только анализ крови.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor va manbalar", ru: "Суточная норма и источники" },
        paragraphs: {
          uz: [
            "NIH ODS maʼlumotiga koʻra, 14 yoshdan boshlab kattalar uchun tavsiya etilgan kunlik miqdor 2,4 mkg, homiladorlikda 2,6 mkg, emizish davrida 2,8 mkg. B12 uchun qabul qilinadigan yuqori chegara belgilanmagan, ammo bu «ixtiyoriy yuqori doza ichish mumkin» degani emas: doza qadoqda va shifokor koʻrsatmasida yozilgandek boʻlsin.",
            "B12 tabiiy holda deyarli faqat hayvon mahsulotlarida bor: jigar va dengiz mollyuskalari (eng boy), goʻsht, baliq, tuxum, sut va pishloq. Ayrim nonushta donlari va oʻsimlik ichimliklari B12 bilan boyitilgan, yorliqda yozilgan boʻladi. Oʻsimlik mahsulotlarida B12 tabiiy holda boʻlmaydi.",
            "Misol uchun, bir stakan sut yoki bir dona tuxum kunlik meʼyorning ancha qismini beradi, 100 gramm baliq esa koʻpincha butun kunlik meʼyordan koʻproqni. Aniq raqamlar mahsulotga bogʻliq, shuning uchun ovqat jadvallariga yoki qadoq yorligʻiga qarang. Xilma-xil ovqatlanadigan kishi odatda bu miqdorni osongina oladi.",
          ],
          ru: [
            "По данным NIH ODS, рекомендуемая суточная доза для взрослых и подростков с 14 лет — 2,4 мкг, при беременности 2,6 мкг, при кормлении грудью 2,8 мкг. Допустимый верхний предел для B12 не установлен, но это не значит, что можно принимать любые высокие дозы: доза должна быть такой, как указано на упаковке и в назначении врача.",
            "В естественном виде B12 есть почти только в продуктах животного происхождения: печень и моллюски (самые богатые источники), мясо, рыба, яйца, молоко и сыр. Некоторые готовые завтраки и растительные напитки обогащены B12, это указано на этикетке. В растительных продуктах B12 естественно не содержится.",
            "Например, стакан молока или одно яйцо дают заметную часть суточной нормы, а порция рыбы нередко больше, чем вся суточная норма. Точные цифры зависят от продукта, поэтому смотрите таблицы питательности или этикетку. Человек с разнообразным питанием обычно легко получает это количество.",
          ],
        },
      },
      {
        heading: { uz: "Kimlar alohida eʼtibor berishi kerak", ru: "Кому стоит быть внимательнее" },
        paragraphs: {
          uz: [
            "Birinchi guruh — vegetarianlar va vegan ovqatlanadiganlar: ularda B12 manbai faqat boyitilgan mahsulot yoki qoʻshimcha boʻlishi mumkin. Ikkinchi guruh — 50 yoshdan oshganlar: yoshga qarab oshqozon kislotaliligi pasayishi mumkin, bu esa ovqatdagi B12 ni oqsildan ajratishni qiyinlashtiradi. Shuning uchun ularga boyitilgan ovqat yoki qoʻshimcha shaklidagi B12 koʻproq soʻriladi.",
            "Uchinchi guruh — oshqozon-ichak kasalliklari bor yoki oshqozon operatsiyasini oʻtkazganlar, shuningdek uzoq vaqt metformin yoki oshqozon kislotasini kamaytiruvchi dorilar (protonli nasos ingibitorlari) ichadiganlar: NIH ODS ular B12 soʻrilishini pasaytirishi mumkinligini qayd etadi. Bu guruhlarga B12 darajasini shifokor bilan tekshirib turish maʼqul.",
            "Vegetarianlar uchun amaliy maslahat: boyitilgan mahsulotlarning yorligʻini oʻqing, B12 miqdori mkg bilan yozilganini tekshiring va hech boʻlmaganda yilda bir marta shifokor bilan qon tahlilini muhokama qiling. Homiladorlikni rejalashtirayotgan vegan ayollar bu masalani oldindan koʻrib chiqishi ayniqsa muhim.",
          ],
          ru: [
            "Первая группа — вегетарианцы и веганы: источником B12 для них могут быть только обогащённые продукты или добавка. Вторая — люди старше 50 лет: с возрастом кислотность желудка может снижаться, и B12 хуже отделяется от белка в пище. Поэтому B12 из обогащённых продуктов или добавок усваивается у них лучше.",
            "Третья группа — люди с заболеваниями желудочно-кишечного тракта или перенёсшие операции на желудке, а также те, кто долго принимает метформин или препараты, снижающие кислотность желудка (ингибиторы протонной помпы): NIH ODS отмечает, что они могут снижать усвоение B12. Этим группам стоит проверять уровень B12 вместе с врачом.",
            "Практический совет вегетарианцам: читайте этикетки обогащённых продуктов, проверяйте, что количество B12 указано в мкг, и хотя бы раз в год обсуждайте с врачом анализ крови. Веганкам, которые планируют беременность, особенно важно продумать этот вопрос заранее.",
          ],
        },
      },
      {
        heading: { uz: "Shakllari va qoʻshimchani tanlash", ru: "Формы и выбор добавки" },
        paragraphs: {
          uz: [
            "Qoʻshimchalarda B12 asosan siankobalamin va metilkobalamin shaklida uchraydi. Ularning taqqoslanishi boʻyicha ilmiy tadqiqotlar mavjud, lekin NIH ODS shaklni tanlash boʻyicha aniq ustunlik koʻrsatmaydi: asosiy narsa yetarli dozada muntazam qabul qilish. Yorliqda mkg miqdori va ulushi koʻrsatilganini tekshiring.",
            "Katalogimizda B12 B-kompleks tarkibida boʻlgan Swiss Energy NeuroForce (B1, B2, B3, B5, B6, B7, B9, B12, sekin ajraladigan shakl, 30 kapsula) va Dr. Frei Multivitamins + Biotin bor. Aniq miqdorlar yorliqda yozilgan. Yuqori dozadagi foliy kislota B12 tanqisligi belgilarini yashirib qoʻyishi mumkin, shuning uchun uzoq muddat qabul qilishdan oldin shifokor bilan maslahatlashing. Dori qabul qiluvchilar va homilador ayollar uchun bu ayniqsa muhim.",
            "B12 qoʻshimchalari kapsula, tabletka, til ostiga qoʻyiladigan pastilka va ineksiya shaklida boʻladi. Ineksiyani faqat shifokor buyuradi. Ichga qabul qilinadigan shakllar orasida tanlov koʻpincha qulaylikka bogʻliq: muhimi dozani qadoqdagidek qabul qilish va muntazamlikni saqlash. Dori qabul qilsangiz, qoʻshimcha ichishdan oldin farmatsevt bilan oʻzaro taʼsirini tekshiring.",
          ],
          ru: [
            "В добавках B12 встречается в основном в виде цианокобаламина и метилкобаламина. Их сравнивают в исследованиях, но NIH ODS не указывает явного преимущества какой-либо формы: главное — регулярный приём в достаточной дозе. Проверьте, что на этикетке указаны количество в мкг и доля от нормы.",
            "В нашем каталоге B12 есть в составе B-комплекса Swiss Energy NeuroForce (B1, B2, B3, B5, B6, B7, B9, B12, форма замедленного высвобождения, 30 капсул) и в Dr. Frei Multivitamins + Biotin. Точные количества указаны на этикетке. Высокие дозы фолиевой кислоты могут маскировать признаки недостатка B12, поэтому перед длительным приёмом посоветуйтесь с врачом. Это особенно важно тем, кто принимает лекарства, и беременным.",
            "Добавки B12 бывают в виде капсул, таблеток, пастилок под язык и инъекций. Инъекции назначает только врач. Среди форм для приёма внутрь выбор часто зависит от удобства: важно принимать дозу так, как указано на упаковке, и соблюдать регулярность. Если вы принимаете лекарства, перед добавкой проверьте с фармацевтом возможное взаимодействие.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "B12 yetishmayotganini qanday bilsa boʻladi? Qonda B12 miqdori tahlil bilan oʻlchanadi; shifokor zarur boʻlsa qoʻshimcha koʻrsatkichlarni ham buyuradi. Tez charchash yoki qoʻl-oyoqda uvishish boshqa sabablarga ham bogʻliq, shuning uchun oʻz-oʻzidan tashxis qoʻymang.",
            "B12 ni qachon ichgan yaxshi? Koʻpchilik ertalab ovqat bilan ichadi. Aniq vaqt qadoqdagi koʻrsatmada yoziladi.",
            "Goʻsht yeydigan odamga B12 qoʻshimchasi kerakmi? Xilma-xil ovqatlanadigan va soʻrilish muammosi yoʻq kattalarning ehtiyoji odatda ovqatning oʻzidan qoplanadi. Qoʻshimcha qaror shifokor bilan, yaxshisi tahlil asosida qabul qilinadi.",
          ],
          ru: [
            "Как узнать, что B12 не хватает? Уровень B12 в крови измеряют анализом; при необходимости врач назначит дополнительные показатели. Быстрая утомляемость или онемение рук и ног связаны и с другими причинами, поэтому не ставьте себе диагноз сами.",
            "Когда лучше принимать B12? Многие принимают его утром во время еды. Точное время указано в инструкции на упаковке.",
            "Нужна ли добавка B12, если я ем мясо? Потребность взрослого с разнообразным питанием и без проблем с усвоением обычно покрывается самой едой. Решение о добавке лучше принимать с врачом, желательно по анализу.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-neuroforce-30", "dr-frei-multivitamins-biotin-20"],
  },
];
