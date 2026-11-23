import type { RawArticle } from "./blog";

/*
  Daily SEO batch, 2026-11-24. Reference intakes and general guidance only, no promise of
  effect (blog.test.ts runs the claim checks). Sources: NIH Office of Dietary Supplements
  fact sheets (iron, vitamin K, selenium), EFSA authorised nutrient wording, WHO guidance on
  iron and folic acid in pregnancy. Photos: existing licensed Adobe Stock bank images,
  see public/images/blog/SOURCES.md.
*/
export const articlesNov2026g: RawArticle[] = [
  {
    slug: "temir-nima-uchun-kerak",
    date: "2026-11-24",
    imageSeed: "bank-protein-foods-b12",
    category: { uz: "Minerallar", ru: "Минералы" },
    categoryKey: "vitamins",
    title: {
      uz: "Temir nima uchun kerak va kunlik meʼyor qancha",
      ru: "Железо: для чего нужно и какая суточная норма",
    },
    excerpt: {
      uz: "Temir organizmda nima qiladi, kimlarga koʻproq kerak, qaysi ovqatlarda bor, qanday soʻriladi va qoʻshimchani nima uchun tahlilsiz ichmaslik kerak.",
      ru: "Что делает железо в организме, кому его нужно больше, в каких продуктах оно есть, как усваивается и почему добавку не стоит принимать без анализов.",
    },
    sections: [
      {
        heading: { uz: "Temir nima va nega kerak", ru: "Что такое железо и зачем оно нужно" },
        paragraphs: {
          uz: [
            "Temir — organizmga muntazam kerak boʻladigan mineral. Uning asosiy qismi qizil qon tanachalaridagi gemoglobin tarkibida: gemoglobin kislorodni oʻpkadan toʻqimalarga olib boradi. Temirning yana bir qismi mushaklardagi miyoglobinda va koʻplab fermentlarda ishtirok etadi.",
            "Yevropa Ittifoqida ruxsat etilgan formulalarga koʻra (EFSA ilmiy bahosi asosida), temir kislorodning normal tashilishiga, qizil qon tanachalari va gemoglobinning normal hosil boʻlishiga, normal energiya almashinuviga, meʼyoriy bilish faoliyatiga, immunitet tizimining normal ishlashiga va hujayralarning normal boʻlinishiga hissa qoʻshadi. Shuningdek u charchoq va holsizlikni kamaytirishga hissa qoʻshadigan moddalar qatoriga kiradi. Bular vitaminning oddiy fiziologik vazifalari: yetarli miqdorda boʻlsa, organizm bu jarayonlarni odatdagidek bajaradi.",
            "Muhim nuqta: charchoq, rangning oqarishi yoki bosh aylanishi faqat temirga bogʻliq boʻlmaydi. Bu belgilar uyqu yetishmasligi, ovqatlanish, qalqonsimon bez, boshqa vitaminlar yoki kasalliklar bilan ham kelishi mumkin. Shu sababli «charchayapman, demak temir yetmayapti» degan xulosa chiqarish va oʻzboshimchalik bilan qoʻshimcha ichish tavsiya etilmaydi — avval tahlil.",
          ],
          ru: [
            "Железо — минерал, который нужен организму регулярно. Основная его часть входит в состав гемоглобина эритроцитов: гемоглобин переносит кислород из лёгких к тканям. Ещё одна часть железа участвует в работе миоглобина в мышцах и многих ферментов.",
            "По формулировкам, разрешённым в ЕС на основе оценки EFSA, железо способствует нормальному транспорту кислорода, нормальному образованию эритроцитов и гемоглобина, нормальному энергетическому обмену, нормальной когнитивной функции, нормальной работе иммунной системы и нормальному делению клеток. Оно также относится к веществам, которые способствуют снижению усталости и утомляемости. Это обычные физиологические функции: при достаточном количестве организм выполняет эти процессы в обычном режиме.",
            "Важно помнить: усталость, бледность или головокружение не всегда связаны только с железом. Эти признаки бывают при недосыпании, особенностях питания, проблемах со щитовидной железой, нехватке других витаминов или заболеваниях. Поэтому вывод «я устаю, значит, мне не хватает железа» и самостоятельный приём добавки не рекомендуются — сначала анализы.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor: kimga qancha kerak", ru: "Суточная норма: кому сколько нужно" },
        paragraphs: {
          uz: [
            "AQSH Milliy sogʻliqni saqlash institutlari qoshidagi Ovqat qoʻshimchalari boʻlimi (NIH ODS) maʼlumotiga koʻra, kattalar uchun tavsiya etilgan kunlik miqdor erkaklarda 8 mg. Ayollarda 19–50 yoshda 18 mg, 51 yoshdan keyin esa 8 mg. Homiladorlikda 27 mg, emizish davrida 9 mg. Bolalar va oʻsmirlar uchun meʼyor yoshiga qarab farq qiladi.",
            "Ayollarda reproduktiv yoshda meʼyor yuqoriroq boʻlishining sababi — oylik qon yoʻqotish. Homiladorlikda qon hajmi oshadi va temirga ehtiyoj sezilarli koʻpayadi. Jahon sogʻliqni saqlash tashkiloti (JSST) homilador ayollar uchun kunlik temir va foliy kislota qabul qilishni umumiy tavsiya sifatida keltiradi, lekin aniq miqdorni shifokor qon tahliliga qarab belgilaydi.",
            "Vegetarianlar va vegan ovqatlanadiganlar uchun NIH ODS ehtiyojni taxminan 1,8 baravar yuqori deb hisoblaydi: oʻsimlik manbalaridagi temir kamroq soʻriladi. Muntazam qon topshiradigan donorlar va intensiv sport bilan shugʻullanuvchilarda ham temir sarfi koʻproq boʻlishi mumkin.",
          ],
          ru: [
            "По данным Управления пищевых добавок Национальных институтов здоровья США (NIH ODS), рекомендуемая суточная доза для взрослых мужчин — 8 мг. У женщин в возрасте 19–50 лет — 18 мг, после 51 года — 8 мг. При беременности — 27 мг, при кормлении грудью — 9 мг. Для детей и подростков норма зависит от возраста.",
            "Более высокая норма у женщин репродуктивного возраста связана с ежемесячной кровопотерей. При беременности объём крови растёт, и потребность в железе заметно увеличивается. Всемирная организация здравоохранения (ВОЗ) приводит как общую рекомендацию ежедневный приём железа и фолиевой кислоты беременными, но точное количество определяет врач по анализу крови.",
            "Для вегетарианцев и веганов NIH ODS считает потребность примерно в 1,8 раза выше: железо из растительных источников усваивается хуже. Больше железа могут расходовать и регулярные доноры крови, и люди, интенсивно занимающиеся спортом.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda temir bor", ru: "В каких продуктах есть железо" },
        paragraphs: {
          uz: [
            "Ovqatdagi temir ikki xil: gem va gemsiz. Gem temir hayvon mahsulotlarida boʻladi — qizil goʻsht, jigar, parranda goʻshti, baliq. U yaxshiroq soʻriladi: NIH ODS maʼlumotiga koʻra, gem temirning taxminan 15–35 foizi, gemsiz temirning esa 2–20 foizi soʻriladi. Gemsiz temir oʻsimliklarda boʻladi: loviya, yasmiq, nohut, ismaloq, qovoq urugʻi, yongʻoq va temir bilan boyitilgan don mahsulotlari.",
            "Soʻrilishga ovqatning tarkibi taʼsir qiladi. Vitamin C (limon, shirin qalampir, karam, sitruslar) gemsiz temirning soʻrilishini yaxshilaydi, shuning uchun loviya yoki yasmiq taomiga yangi sabzavot salatini qoʻshish oʻrinli. Aksincha, choy va qahvadagi polifenollar, fitatlar (butun don va dukkaklilarda) hamda kalsiy soʻrilishni pasaytirishi mumkin. Shu sababli temirga boy ovqat bilan bir vaqtda qatiq yoki qora choy ichmaslik maʼqul.",
            "Oddiy ovqatlanishda koʻpchilik sogʻlom kattalar uchun temirning katta qismi ovqatdan keladi. Misol uchun, tushlikda yasmiq shoʻrvasi va limonli salat, kechki ovqatda goʻsht yoki parranda — bu tavsiya etilgan miqdorga yaqinlashtiradi. Aniq miqdor mahsulotga va tayyorlash usuliga bogʻliq.",
          ],
          ru: [
            "Железо в еде бывает двух видов: гемовое и негемовое. Гемовое железо содержится в продуктах животного происхождения — красном мясе, печени, птице, рыбе. Оно усваивается лучше: по данным NIH ODS, усваивается примерно 15–35 процентов гемового железа и 2–20 процентов негемового. Негемовое железо есть в растениях: фасоли, чечевице, нуте, шпинате, тыквенных семечках, орехах и обогащённых железом зерновых продуктах.",
            "На усвоение влияет состав еды. Витамин C (лимон, сладкий перец, капуста, цитрусовые) улучшает усвоение негемового железа, поэтому к блюду из фасоли или чечевицы уместно добавить салат из свежих овощей. Полифенолы чая и кофе, фитаты (в цельных зёрнах и бобовых) и кальций, напротив, могут снижать усвоение. Поэтому с богатой железом едой лучше не пить одновременно кефир или крепкий чёрный чай.",
            "При обычном питании большинство здоровых взрослых получает основную часть железа из еды. Например, суп из чечевицы и салат с лимоном на обед и мясо или птица на ужин приближают к рекомендуемому количеству. Точная цифра зависит от продукта и способа приготовления.",
          ],
        },
      },
      {
        heading: { uz: "Temir yetishmasligi va tahlil", ru: "Нехватка железа и анализы" },
        paragraphs: {
          uz: [
            "Temir tanqisligi dunyoda eng keng tarqalgan ovqatlanish muammolaridan biri hisoblanadi (JSST). Xavf guruhlariga homilador ayollar, ogʻir hayz koʻradigan ayollar, bolalar va oʻsmirlar, vegetarianlar, soʻrilishi buzilgan kasalliklarga chalinganlar kiradi.",
            "Tanqislikni faqat belgilarga qarab aniqlab boʻlmaydi. Buning uchun shifokor odatda umumiy qon tahlili (gemoglobin) va ferritin darajasini tekshiradi. Natijaga qarab ovqatlanishni oʻzgartirish yoki temir preparatini buyurish haqida qaror qabul qilinadi. Kamqonlik tashxisi va uning sababini aniqlash — shifokor ishi; bu maqola oddiy ovqatlanish haqidagi umumiy maʼlumotdir.",
          ],
          ru: [
            "Дефицит железа относится к самым распространённым проблемам питания в мире (ВОЗ). К группам риска относятся беременные женщины, женщины с обильными менструациями, дети и подростки, вегетарианцы, люди с заболеваниями, нарушающими всасывание.",
            "Определить дефицит только по самочувствию нельзя. Для этого врач обычно проверяет общий анализ крови (гемоглобин) и уровень ферритина. По результатам решают, менять ли питание или назначать препарат железа. Диагноз анемии и выявление её причины — дело врача; эта статья — общая информация об обычном питании.",
          ],
        },
      },
      {
        heading: { uz: "Yuqori chegara va ehtiyot choralari", ru: "Верхний предел и меры предосторожности" },
        paragraphs: {
          uz: [
            "NIH ODS kattalar uchun temirning qabul qilinadigan yuqori chegarasini kuniga 45 mg deb belgilagan (ovqat va qoʻshimchalar yigʻindisi). Koʻp miqdorda temir ichish qabziyat, koʻngil aynishi va oshqozon ogʻrigʻiga olib kelishi mumkin. Gemoxromatoz kabi holatlarda temir organizmda toʻplanib qoladi, shuning uchun bunday tashxisi borlar temir qoʻshimchasini faqat shifokor nazoratida oladi.",
            "Alohida ogohlantirish: bolalarda temir qoʻshimchasini oshirib yuborish ogʻir zaharlanishga olib kelishi mumkin. Temir tutgan har qanday qoʻshimchani bolalar qoʻli yetmaydigan joyda saqlang. Temir ayrim dorilar bilan (masalan, qalqonsimon bez dorilari va ayrim antibiotiklar) bir vaqtda ichilsa, ularning soʻrilishiga xalaqit berishi mumkin; shuning uchun dori ichayotgan odam shifokor yoki farmatsevtdan vaqt oraligʻini soʻrasin.",
          ],
          ru: [
            "NIH ODS установило допустимый верхний предел железа для взрослых — 45 мг в сутки (сумма из еды и добавок). Большие количества могут вызывать запор, тошноту и боль в желудке. При нарушениях обмена, например гемохроматозе, железо накапливается, поэтому людям с таким диагнозом добавки с железом можно принимать только под наблюдением врача.",
            "Отдельное предупреждение: передозировка железа у детей может привести к тяжёлому отравлению. Храните любые добавки с железом в недоступном для детей месте. Железо может мешать усвоению некоторых лекарств (например, препаратов для щитовидной железы и ряда антибиотиков), поэтому тем, кто принимает лекарства, стоит уточнить у врача или фармацевта, какой интервал соблюдать.",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimchani qanday tanlash kerak", ru: "Как выбрать добавку" },
        paragraphs: {
          uz: [
            "Avvalo yorliqda temir qanday birikma shaklida (sulfat, glyukonat, bisglitsinat va boshqalar) va qancha miqdorda ekanini, shuningdek kunlik porsiya nechta kapsula ekanini tekshiring. Bir nechta vitamin kompleksini birga ichsangiz, temir miqdorini qoʻshib hisoblang.",
            "Katalogimizda temir kompleks tarkibida boʻlgan Swiss Energy Prenatal Forte bor: unda 14 mg temir, 400 mkg folat va boshqa vitamin hamda minerallar (jami 20 ta), 60 kapsula. U homiladorlik uchun moʻljallangan kompleks; uni qabul qilish va qoʻshimcha temir kerakligini homiladorlikni olib borayotgan shifokor bilan kelishing. Boshqa holatlarda qoʻshimchani qon tahlilidan keyin shifokor tavsiyasi bilan tanlang.",
          ],
          ru: [
            "Прежде всего проверьте на этикетке, в какой форме указано железо (сульфат, глюконат, бисглицинат и другие), в каком количестве и сколько капсул составляют суточную порцию. Если вы принимаете несколько витаминных комплексов, суммируйте количество железа.",
            "В нашем каталоге есть комплекс, в состав которого входит железо, — Swiss Energy Prenatal Forte: 14 мг железа, 400 мкг фолата и другие витамины и минералы (всего 20), 60 капсул. Это комплекс для периода беременности; его приём и необходимость дополнительного железа согласуйте с врачом, ведущим беременность. В остальных случаях добавку выбирайте после анализа крови и по рекомендации врача.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Temirni qachon ichgan yaxshi? Koʻpchilik ovqatdan oldin yoki ovqat bilan ichadi; bosh qoringa ichilsa, ayrimlarda koʻngil aynishi boʻladi. Aniq tartib qadoqdagi koʻrsatmada yoziladi, dori qabul qiluvchilar esa shifokor bilan kelishadi.",
            "Temirni choy yoki qahva bilan ichsa boʻladimi? Yaxshisi emas: choy va qahvadagi polifenollar soʻrilishni pasaytirishi mumkin. Odatda temirli ovqat yoki qoʻshimcha bilan bir soat atrofida bu ichimliklardan voz kechiladi.",
            "Temir ichgandan keyin axlat qorayishi normalmi? Temir qoʻshimchalarida bu tez-tez uchraydi va odatda xavfsiz, lekin kuchli ogʻriq yoki qora, yopishqoq axlat boʻlsa shifokorga murojaat qiling.",
            "Kamqonlik boʻlsa, faqat ovqat bilan davom etsa boʻladimi? Buni tahlil natijasiga qarab shifokor hal qiladi. Maqolada keltirilgan ovqatlanish maslahatlari tashxis oʻrnini bosmaydi.",
          ],
          ru: [
            "Когда лучше принимать железо? Многие принимают его до еды или во время еды; натощак у некоторых возникает тошнота. Точный порядок указан в инструкции на упаковке, а тем, кто принимает лекарства, его согласуют с врачом.",
            "Можно ли запивать железо чаем или кофе? Лучше не стоит: полифенолы чая и кофе могут снижать усвоение. Обычно эти напитки откладывают примерно на час от еды или добавки с железом.",
            "Нормально ли, что стул темнеет после железа? Для добавок с железом это частое явление и обычно оно безопасно, но при сильной боли или чёрном, липком стуле обратитесь к врачу.",
            "Если есть анемия, можно ли обойтись только питанием? Это решает врач по результатам анализов. Советы по питанию в статье не заменяют диагностику.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-prenatal-forte-60"],
    relatedArticleSlugs: ["homiladorlikda-qaysi-vitaminlar-kerak", "foliy-kislota-nima-uchun-kerak"],
  },
  {
    slug: "vitamin-k2-nima-uchun-kerak",
    date: "2026-11-24",
    imageSeed: "bank-seeds-jars",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Vitamin K2 nima uchun kerak va qayerdan olinadi",
      ru: "Витамин K2: для чего нужен и где его взять",
    },
    excerpt: {
      uz: "Vitamin K1 va K2 farqi, kunlik meʼyor, qaysi ovqatlarda bor, kalsiy va D3 bilan aloqasi va qon suyultiruvchi dori ichadiganlar nimaga eʼtibor berishi kerak.",
      ru: "Чем отличаются витамины K1 и K2, какая суточная норма, в каких продуктах они есть, как связаны с кальцием и D3 и на что обратить внимание тем, кто принимает разжижающие кровь лекарства.",
    },
    sections: [
      {
        heading: { uz: "Vitamin K nima va K1 bilan K2 qanday farq qiladi", ru: "Что такое витамин K и чем K1 отличается от K2" },
        paragraphs: {
          uz: [
            "Vitamin K — yogʻda eriydigan vitaminlar guruhi. Ikki asosiy tabiiy shakli bor: K1 (filloxinon) va K2 (menaxinonlar). K1 asosan yashil bargli sabzavotlarda boʻladi. K2 esa bakteriyalar tomonidan hosil qilinadi va fermentlangan mahsulotlarda, ayrim pishloqlarda, tuxum sarigʻida va goʻshtda uchraydi. K2 ning bir nechta ichki shakli bor (MK-4, MK-7 va boshqalar), ular zanjiri uzunligi bilan farq qiladi.",
            "Oddiy ovqatlanishda kattalar vitamin K ning katta qismini K1 shaklida oladi. Shu sababli «vitamin K2» qidiruvi koʻpincha qoʻshimchalar bilan bogʻliq: K2 kalsiy va D3 bilan birga kompleksda uchraydi. Bu maqola K2 ni oddiy tilda tushuntiradi va uni mahsulot yorligʻida qanday oʻqishni koʻrsatadi.",
            "Muhim eslatma: Yevropa Ittifoqida ruxsat etilgan formulalar (EFSA bahosi asosida) umuman vitamin K uchun beriladi, K2 ning alohida shakllari uchun emas. Shuning uchun quyida vitaminning umumiy vazifalari haqida gap boradi.",
            "Yorliqni oʻqiyotganda shunga eʼtibor bering: ayrim mahsulotlarda faqat «vitamin K» deb yozilgan boʻladi, boshqalarida esa «K2 (MK-7)» kabi aniq shakl koʻrsatiladi. Shakl nomi va mkg dagi miqdor yonma-yon turgan yorliq ishonchliroq: shunda ichayotgan narsangizni aniq bilasiz va kunlik meʼyor bilan solishtira olasiz.",
          ],
          ru: [
            "Витамин K — группа жирорастворимых витаминов. У него две основные природные формы: K1 (филлохинон) и K2 (менахиноны). K1 в основном содержится в зелёных листовых овощах. K2 вырабатывают бактерии, и он встречается в ферментированных продуктах, некоторых сырах, желтке яиц и мясе. У K2 несколько внутренних форм (MK-4, MK-7 и другие), они отличаются длиной цепи.",
            "При обычном питании взрослые получают большую часть витамина K в форме K1. Поэтому запрос «витамин K2» чаще связан с добавками: K2 встречается в комплексах вместе с кальцием и D3. Эта статья объясняет K2 простым языком и показывает, как читать его на этикетке.",
            "Важное уточнение: разрешённые в ЕС формулировки (на основе оценки EFSA) относятся к витамину K в целом, а не к отдельным формам K2. Поэтому ниже речь идёт об общих функциях витамина.",
            "Читая этикетку, обратите внимание: на некоторых продуктах написано просто «витамин K», на других указана точная форма, например «K2 (MK-7)». Надёжнее та этикетка, где рядом указаны название формы и количество в мкг: тогда вы точно знаете, что принимаете, и можете сравнить с суточной нормой.",
          ],
        },
      },
      {
        heading: { uz: "Organizmda qanday vazifa bajaradi", ru: "Какую роль выполняет в организме" },
        paragraphs: {
          uz: [
            "EFSA ilmiy bahosi asosida ruxsat etilgan formulalarga koʻra, vitamin K qonning normal ivishiga va suyaklarning meʼyoriy holatini saqlashga hissa qoʻshadi. Bu ikki vazifa organizmdagi maxsus oqsillarning ishlashi bilan bogʻliq: ularning ishlashi uchun vitamin K kerak.",
            "Suyaklar bilan aloqasi tufayli K2 koʻpincha kalsiy va vitamin D3 bilan birga tilga olinadi. D3 kalsiyning ichakdan soʻrilishiga hissa qoʻshadi, kalsiy esa suyak va tishlarning tarkibiy qismi, vitamin K esa suyaklarning meʼyoriy holatini saqlashda ishtirok etadi. Bular bir-birini toʻldiruvchi ovqatlanish omillari; ular birgalikda suyaklarni «mustahkamlaydi» deb vaʼda qilish esa toʻgʻri emas — bu uzoq muddatli ovqatlanish, harakat va umumiy salomatlikka bogʻliq.",
            "Vitamin K yetishmasligi sogʻlom kattalarda kam uchraydi. Xavf guruhiga yogʻ soʻrilishi buzilgan kasalliklarga chalinganlar va ayrim dorilarni uzoq vaqt qabul qiluvchilar kiradi. Bunday holatda tashxis va tavsiyani shifokor beradi.",
          ],
          ru: [
            "По формулировкам, разрешённым на основе научной оценки EFSA, витамин K способствует нормальному свёртыванию крови и поддержанию нормального состояния костей. Обе функции связаны с работой особых белков в организме: для их работы нужен витамин K.",
            "Из-за связи с костями K2 часто упоминают вместе с кальцием и витамином D3. D3 способствует усвоению кальция из кишечника, кальций — часть костей и зубов, а витамин K участвует в поддержании нормального состояния костей. Это взаимодополняющие факторы питания, но обещать, что вместе они «укрепят» кости, неверно: это зависит от питания в течение многих лет, движения и общего состояния здоровья.",
            "Недостаток витамина K у здоровых взрослых встречается редко. К группам риска относятся люди с заболеваниями, нарушающими всасывание жиров, и те, кто длительно принимает некоторые лекарства. В таком случае диагноз и рекомендации даёт врач.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor qancha", ru: "Какова суточная норма" },
        paragraphs: {
          uz: [
            "NIH ODS vitamin K uchun yetarli miqdor (AI) ni belgilagan: kattalar erkaklarda kuniga 120 mkg, ayollarda 90 mkg. Homiladorlikda va emizish davrida (19 yoshdan katta) ham 90 mkg. Bu K1 va K2 ni birga hisoblagan umumiy raqam. NIH ODS vitamin K uchun yuqori chegarani belgilamagan, chunki ovqat yoki qoʻshimchadan toksiklik holatlari maʼlum emas, lekin bu qoʻshimchani cheksiz ichish mumkin degani emas.",
            "Yorliqda vitamin K2 odatda mkg bilan yoziladi. Agar mahsulotda miqdor yozilmagan boʻlsa («yorliq boʻyicha»), ishlab chiqaruvchining toʻliq maʼlumotiga qarang yoki farmatsevtdan soʻrang. Miqdorni oʻzingiz taxmin qilmang.",
          ],
          ru: [
            "NIH ODS установило для витамина K адекватное потребление (AI): для взрослых мужчин 120 мкг в сутки, для женщин 90 мкг. При беременности и кормлении грудью (старше 19 лет) — тоже 90 мкг. Это общая цифра по K1 и K2 вместе. Верхний предел для витамина K NIH ODS не устанавливало, поскольку случаи токсичности от еды или добавок неизвестны, но это не значит, что добавку можно принимать без ограничений.",
            "На этикетке витамин K2 обычно указывают в мкг. Если количество не указано («по этикетке»), посмотрите полную информацию производителя или спросите фармацевта. Не угадывайте количество сами.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda bor", ru: "В каких продуктах он есть" },
        paragraphs: {
          uz: [
            "K1 ning boy manbalari — ismaloq, karam, brokkoli, petrushka va boshqa yashil bargli sabzavotlar, shuningdek oʻsimlik moylari. Bir piyola pishirilgan yashil bargli sabzavot kunlik miqdorning bir necha baravarini berishi mumkin. K2 manbalari: fermentlangan mahsulotlar (yapon natto — eng boy manba), ayrim qattiq pishloqlar, tuxum sarigʻi, jigar va goʻsht. Anʼanaviy qatiq va qimiz kabi mahsulotlarda K2 miqdori ishlab chiqarish usuliga qarab farq qiladi.",
            "Vitamin K yogʻda eriydi, shuning uchun ovqatga bir osh qoshiq oʻsimlik moyi qoʻshilgan salat yoki dimlangan sabzavot yaxshiroq soʻriladi. Xilma-xil ovqatlanadigan odamda vitamin K odatda yetarli boʻladi.",
          ],
          ru: [
            "Богатые источники K1 — шпинат, капуста, брокколи, петрушка и другие зелёные листовые овощи, а также растительные масла. Чашка варёных зелёных листовых овощей может дать несколько суточных норм. Источники K2: ферментированные продукты (японский натто — самый богатый источник), некоторые твёрдые сыры, желток яиц, печень и мясо. В традиционных кисломолочных продуктах количество K2 зависит от способа производства.",
            "Витамин K жирорастворим, поэтому салат или тушёные овощи с ложкой растительного масла усваиваются лучше. У человека с разнообразным питанием витамина K обычно достаточно.",
          ],
        },
      },
      {
        heading: { uz: "Qon suyultiruvchi dori ichadiganlar uchun muhim", ru: "Важно для тех, кто принимает разжижающие кровь лекарства" },
        paragraphs: {
          uz: [
            "Vitamin K qon ivishida ishtirok etgani uchun u varfarin kabi antikoagulyant dorilar bilan oʻzaro taʼsirlashadi. Bunday dori ichadigan odam vitamin K ni tahlilsiz va shifokorga aytmasdan qoʻshimcha sifatida qabul qilmasligi kerak. NIH ODS bunday bemorlarga vitamin K isteʼmolini barqaror ushlab turishni va shifokor bilan maslahatlashishni tavsiya etadi: bir kunda keskin koʻp, boshqa kunda kam yashil sabzavot yeyish dorining taʼsirini oʻzgartirishi mumkin.",
            "Ayni shu sabab K2 tutgan har qanday qoʻshimchani (jumladan kalsiy va D3 kompleksini) boshlashdan oldin antikoagulyant ichayotganlar, homilador va emizikli ayollar hamda surunkali kasalligi borlar shifokorga murojaat qilishi kerak.",
          ],
          ru: [
            "Поскольку витамин K участвует в свёртывании крови, он взаимодействует с антикоагулянтами, например варфарином. Человеку, принимающему такие лекарства, нельзя начинать добавку с витамином K без ведома врача. NIH ODS рекомендует таким пациентам поддерживать стабильное потребление витамина K и советоваться с врачом: если в один день съесть много зелёных овощей, а в другой мало, действие лекарства может измениться.",
            "По этой же причине перед началом любой добавки с K2 (в том числе комплекса с кальцием и D3) пациентам, принимающим антикоагулянты, беременным и кормящим женщинам и людям с хроническими заболеваниями нужно проконсультироваться с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimchani qanday tanlash kerak", ru: "Как выбрать добавку" },
        paragraphs: {
          uz: [
            "Yorliqda vitamin K ning qaysi shakli (K1 yoki K2, MK-4 yoki MK-7) va qancha mkg ekanini, kunlik porsiya nechta kapsula ekanini tekshiring. Kalsiy va D3 bilan birga kompleksda boʻlsa, uchala komponentning miqdorini alohida koʻrib chiqing va boshqa vitamin komplekslaridagi miqdorni qoʻshib hisoblang.",
            "Katalogimizda vitamin K2 tarkibida boʻlgan ikkita mahsulot bor: Swiss Energy Calcivit (kalsiy, D3, K2, sink, mis, marganets, B vitaminlari, 30 kapsula, sekin ajraladigan shakl) va homiladorlar uchun moʻljallangan Swiss Energy Prenatal Forte (20 vitamin va mineral, 60 kapsula). Aniq miqdor har bir qadoqdagi yorliqda koʻrsatilgan. Koʻp hollarda kalsiy qoʻshimchasini ovqat bilan ichish maʼqul; batafsil tartib uchun qadoqdagi koʻrsatmaga qarang.",
          ],
          ru: [
            "Проверьте на этикетке, какая форма витамина K указана (K1 или K2, MK-4 или MK-7), сколько мкг и сколько капсул составляют суточную порцию. Если он в комплексе с кальцием и D3, оцените количество каждого компонента отдельно и суммируйте с другими витаминными комплексами.",
            "В нашем каталоге есть два продукта с витамином K2: Swiss Energy Calcivit (кальций, D3, K2, цинк, медь, марганец, витамины группы B, 30 капсул, форма замедленного высвобождения) и Swiss Energy Prenatal Forte для периода беременности (20 витаминов и минералов, 60 капсул). Точное количество указано на этикетке каждой упаковки. Во многих случаях добавку с кальцием лучше принимать во время еды; подробный порядок смотрите в инструкции на упаковке.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "K2 ni D3 bilan birga ichish kerakmi? Ular alohida vitaminlar; koʻp qoʻshimchalarda birga uchraydi, chunki ikkalasi ham suyaklarning meʼyoriy holati mavzusiga tegishli. Alohida yoki birga ichish haqida qaror ovqatlanishingiz, tahlillaringiz va shifokor tavsiyasiga bogʻliq.",
            "Vitamin K2 ni qachon ichgan yaxshi? U yogʻda eriydi, shuning uchun yogʻli ovqat bilan ichish soʻrilishga yordam beradi. Aniq vaqtni qadoqdagi koʻrsatma belgilaydi.",
            "Bolalarga K2 berish mumkinmi? Bolalar uchun alohida miqdor kerak va oddiy kattalar kompleksini bolalarga bermang. Shifokor yoki bolalar uchun moʻljallangan mahsulotdagi koʻrsatma bilan ish tuting.",
          ],
          ru: [
            "Нужно ли принимать K2 вместе с D3? Это отдельные витамины; во многих добавках они встречаются вместе, потому что оба относятся к теме нормального состояния костей. Принимать их отдельно или вместе, зависит от питания, анализов и рекомендации врача.",
            "Когда лучше принимать витамин K2? Он жирорастворим, поэтому приём с жирной едой помогает усвоению. Точное время определяет инструкция на упаковке.",
            "Можно ли давать K2 детям? Детям нужна отдельная дозировка, обычные комплексы для взрослых детям давать нельзя. Ориентируйтесь на рекомендацию врача или на инструкцию к продукту, предназначенному для детей.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-calcivit-30", "swiss-energy-prenatal-forte-60"],
    relatedArticleSlugs: ["kalsiy-va-vitamin-d3-birga", "qishda-vitamin-d"],
  },
  {
    slug: "selen-nima-uchun-kerak",
    date: "2026-11-24",
    imageSeed: "bank-seeds-jars",
    category: { uz: "Minerallar", ru: "Минералы" },
    categoryKey: "vitamins",
    title: {
      uz: "Selen nima uchun kerak: meʼyor va yuqori chegara",
      ru: "Селен: для чего нужен, норма и верхний предел",
    },
    excerpt: {
      uz: "Selen qalqonsimon bez, soch va tirnoq bilan qanday bogʻliq, kunlik meʼyor qancha, qaysi ovqatlarda bor va nima uchun uni oshirib yubormaslik kerak.",
      ru: "Как селен связан со щитовидной железой, волосами и ногтями, какая суточная норма, в каких продуктах он есть и почему его нельзя принимать сверх меры.",
    },
    sections: [
      {
        heading: { uz: "Selen nima va nega oz miqdorda kerak", ru: "Что такое селен и почему он нужен в малых количествах" },
        paragraphs: {
          uz: [
            "Selen — mikroelement: organizmga juda oz miqdorda, lekin muntazam kerak boʻladi. U selenoproteinlar deb ataladigan oqsillar tarkibiga kiradi; ular hujayralardagi koʻplab jarayonlarda ishtirok etadi, jumladan qalqonsimon bez gormonlari almashinuvida va oksidlovchi jarayonlar muvozanatida.",
            "Selenning xususiyati — «foydali miqdor» bilan «ortiqcha miqdor» orasidagi masofa tor. Shu sababli selen haqida gap ketganda eng muhim savol «qancha kerak» emas, balki «qancha yetarli va qayergacha xavfsiz». Bu maqolada ikkala chegara ham keltirilgan. Shuningdek, ovqatda selen qanday manbalardan keladi va yorliqdagi raqamni qanday oʻqish kerakligi ham tushuntirilgan, shunda qoʻshimcha kerak yoki kerak emasligini oʻzingiz xotirjam baholay olasiz.",
            "Ovqatdagi selen miqdori tuproqqa bogʻliq: oʻsimliklar selenga boy yoki kambagʻal tuproqda oʻssa, ularning tarkibi ham shunga qarab farq qiladi. Shuning uchun bir xil mahsulotdagi selen turli mintaqalarda turlicha boʻlishi mumkin.",
            "Amalda bu shuni anglatadi: «mening ovqatimda selen yetarlimi?» degan savolga aniq javobni faqat ovqat jadvallari bermaydi. Shu sababli asosiy qoida oddiy: ovqatlanishni xilma-xil qiling, baliq, tuxum, goʻsht va don mahsulotlarini muntazam isteʼmol qiling, qoʻshimchani esa faqat zarurat boʻlganda va yorliqdagi miqdorga qarab tanlang.",
          ],
          ru: [
            "Селен — микроэлемент: организму нужны очень малые, но регулярные количества. Он входит в состав белков, которые называют селенопротеинами; они участвуют во многих процессах в клетках, в том числе в обмене гормонов щитовидной железы и в балансе окислительных процессов.",
            "Особенность селена в том, что расстояние между «полезным количеством» и «избытком» небольшое. Поэтому главный вопрос про селен — не только «сколько нужно», но и «сколько достаточно и до какого предела безопасно». В статье приведены обе границы.",
            "Количество селена в еде зависит от почвы: если растения выросли на богатой или бедной селеном почве, их состав различается. Поэтому в одном и том же продукте из разных регионов селена может быть разное количество.",
            "На практике это значит, что на вопрос «хватает ли селена в моей еде?» таблицы продуктов точного ответа не дают. Поэтому основное правило простое: питайтесь разнообразно, регулярно ешьте рыбу, яйца, мясо и зерновые продукты, а добавку выбирайте только при необходимости и ориентируясь на количество на этикетке.",
          ],
        },
      },
      {
        heading: { uz: "Organizmda qanday vazifa bajaradi", ru: "Какую роль выполняет в организме" },
        paragraphs: {
          uz: [
            "Yevropa Ittifoqida ruxsat etilgan formulalarga koʻra (EFSA ilmiy bahosi asosida), selen sochning va tirnoqning normal holatini saqlashga, immunitet tizimining normal ishlashiga, qalqonsimon bezning normal faoliyatiga hamda erkaklarda urugʻ hujayralarining normal hosil boʻlishiga hissa qoʻshadi. Shuningdek u hujayralarni oksidlovchi stressdan himoya qilishda ishtirok etuvchi modda sifatida koʻrsatiladi.",
            "Bular vaʼda emas, oddiy fiziologik vazifalar: selen yetarli boʻlsa, organizm bu jarayonlarni odatdagidek bajaradi. Sochning toʻkilishi, tirnoqning sinishi yoki qalqonsimon bez bilan bogʻliq shikoyatlar koʻp sabablarga ega, shuning uchun «selen ichaman» degan qaror oʻrniga sababni shifokor bilan aniqlash maʼqul. Qalqonsimon bez kasalliklarida qoʻshimchalarni shifokorga aytmasdan qabul qilish tavsiya etilmaydi.",
            "Sogʻlom, xilma-xil ovqatlanadigan kattalarda selen yetishmasligi odatda kam uchraydi. Xavf tuprogʻi selenga juda kambagʻal mintaqalarda, ovqati bir xil boʻlgan va soʻrilishi buzilgan kasalliklarga chalingan odamlarda yuqoriroq.",
          ],
          ru: [
            "По формулировкам, разрешённым в ЕС на основе оценки EFSA, селен способствует поддержанию нормального состояния волос и ногтей, нормальной работе иммунной системы, нормальной функции щитовидной железы, а у мужчин — нормальному образованию сперматозоидов. Его также называют веществом, участвующим в защите клеток от окислительного стресса.",
            "Это не обещание эффекта, а обычные физиологические функции: при достаточном количестве селена организм выполняет эти процессы в обычном режиме. У выпадения волос, ломкости ногтей и проблем со щитовидной железой много причин, поэтому вместо решения «буду принимать селен» лучше выяснить причину вместе с врачом. При заболеваниях щитовидной железы принимать добавки без ведома врача не рекомендуется.",
            "У здоровых взрослых с разнообразным питанием дефицит селена встречается редко. Риск выше в регионах с очень бедной селеном почвой, у людей с однообразным питанием и при заболеваниях, нарушающих всасывание.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor qancha", ru: "Какова суточная норма" },
        paragraphs: {
          uz: [
            "AQSH Milliy sogʻliqni saqlash institutlari qoshidagi Ovqat qoʻshimchalari boʻlimi (NIH ODS) maʼlumotiga koʻra, kattalar uchun tavsiya etilgan kunlik miqdor 55 mkg. Homiladorlikda 60 mkg, emizish davrida 70 mkg. Bolalar uchun meʼyor yoshiga qarab ancha past: masalan, 1–3 yoshda 20 mkg.",
            "Yorliqda selen mkg bilan yoziladi. Qoʻshimchalarda u odatda selenit, selenat yoki selenga boy xamirturush, yaʼni selenometionin shaklida boʻladi. NIH ODS maʼlumotiga koʻra, turli shakllar turlicha soʻriladi, shuning uchun faqat soʻzlar bilan emas, balki yorliqdagi raqam bilan solishtirish kerak.",
          ],
          ru: [
            "По данным Управления пищевых добавок Национальных институтов здоровья США (NIH ODS), рекомендуемая суточная доза для взрослых — 55 мкг. При беременности — 60 мкг, при кормлении грудью — 70 мкг. Для детей норма заметно ниже и зависит от возраста: например, в 1–3 года — 20 мкг.",
            "На этикетке селен указывают в мкг. В добавках он обычно бывает в виде селенита, селената или селенсодержащих дрожжей, то есть селенометионина. По данным NIH ODS, разные формы усваиваются по-разному, поэтому сравнивать нужно не названия, а цифру на этикетке.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda selen koʻp", ru: "В каких продуктах много селена" },
        paragraphs: {
          uz: [
            "NIH ODS jadvaliga koʻra, selenga eng boy ovqat — braziliya yongʻogʻi: 28 g (6–8 dona) taxminan 544 mkg beradi, yaʼni bitta yongʻoq ham kunlik miqdorning bir necha baravariga yaqin boʻlishi mumkin. Shu sababli uni har kuni koʻp yeb boʻlmaydi. Boshqa manbalar: tunets (85 g taxminan 92 mkg), boshqa dengiz baliqlari va dengiz mahsulotlari, goʻsht, parranda goʻshti, tuxum (bitta katta tuxum taxminan 15 mkg), non va don mahsulotlari.",
            "Misol uchun, tushlikda baliq yoki tuxumli taom, kechki ovqatda goʻsht yoki parranda, kun davomida non va don mahsulotlari — koʻpchilik kattalar uchun tavsiya etilgan miqdorga yaqinlashtiradi. Aniq miqdor mahsulot kelib chiqishiga bogʻliq. Selenni ichish mumkin boʻlgan eng yuqori chegara yaqinidan uzoq turish uchun braziliya yongʻogʻini meʼyorida, masalan haftasiga bir necha dona isteʼmol qilish maʼqul.",
          ],
          ru: [
            "По таблице NIH ODS, самый богатый селеном продукт — бразильский орех: 28 г (6–8 штук) дают примерно 544 мкг, то есть даже один орех может быть близок к нескольким суточным нормам. Поэтому есть его ежедневно в большом количестве нельзя. Другие источники: тунец (85 г — около 92 мкг), другая морская рыба и морепродукты, мясо, птица, яйца (одно крупное яйцо — около 15 мкг), хлеб и зерновые продукты.",
            "Например, рыба или блюдо с яйцом на обед, мясо или птица на ужин и хлеб и крупы в течение дня приближают большинство взрослых к рекомендуемому количеству. Точное количество зависит от происхождения продукта. Чтобы держаться подальше от верхнего предела, бразильский орех лучше есть умеренно — например, несколько штук в неделю.",
          ],
        },
      },
      {
        heading: { uz: "Yuqori chegara: nima uchun ehtiyot boʻlish kerak", ru: "Верхний предел: почему нужна осторожность" },
        paragraphs: {
          uz: [
            "NIH ODS kattalar uchun selenning qabul qilinadigan yuqori chegarasini kuniga 400 mkg deb belgilagan (ovqat va qoʻshimchalar yigʻindisi). Uzoq vaqt bundan koʻp qabul qilish selenoz holatiga olib kelishi mumkin: nafasda sarimsoq hidi, ogʻizda metall taʼm, sochning toʻkilishi, tirnoqning moʻrtlashishi, oshqozon-ichak buzilishi, holsizlik va asabiylashish.",
            "Shu sababli bir nechta vitamin-mineral kompleksini bir vaqtda ichmang: ularning har birida selen boʻlishi mumkin va yigʻindi kutilmagan darajada oshib ketadi. Koʻp miqdordagi braziliya yongʻogʻini muntazam yeyish ham shunga olib kelishi mumkin. Homilador va emizikli ayollar, qalqonsimon bez kasalligi borlar va dori qabul qiluvchilar selen qoʻshimchasini boshlashdan oldin shifokor bilan maslahatlashsin.",
          ],
          ru: [
            "NIH ODS установило допустимый верхний предел селена для взрослых — 400 мкг в сутки (сумма из еды и добавок). Длительный приём большего количества может привести к селенозу: чесночный запах изо рта, металлический привкус, выпадение волос, ломкость ногтей, расстройства желудочно-кишечного тракта, слабость и раздражительность.",
            "Поэтому не принимайте одновременно несколько витаминно-минеральных комплексов: в каждом может быть селен, и сумма неожиданно вырастет. К тому же результату может привести и регулярное употребление большого количества бразильских орехов. Беременным и кормящим женщинам, людям с заболеваниями щитовидной железы и тем, кто принимает лекарства, перед началом добавки с селеном стоит проконсультироваться с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimchani qanday tanlash kerak", ru: "Как выбрать добавку" },
        paragraphs: {
          uz: [
            "Yorliqda selenning qaysi shaklda va necha mkg ekanini hamda kunlik porsiya nechta kapsula ekanini tekshiring. Alohida selen mahsulotlari oʻrniga koʻpchilik kattalar uchun selenni vitamin-mineral kompleks tarkibida boʻlganini tanlash oddiyroq, chunki bunda miqdor kunlik meʼyor atrofida boʻladi.",
            "Katalogimizda selen kompleks tarkibida boʻlgan Swiss Energy Prenatal Forte bor: bu homiladorlik davri uchun moʻljallangan 20 vitamin va mineraldan iborat kompleks (folat 400 mkg, temir 14 mg, selen va boshqalar; 60 kapsula). Uni qabul qilish va boshqa selenli qoʻshimcha bilan birga ichmaslik masalasini homiladorlikni olib borayotgan shifokor bilan kelishing. Homiladorlik bilan bogʻliq boʻlmagan hollarda esa avval ovqatlanishingizni baholang.",
          ],
          ru: [
            "Проверьте на этикетке, в какой форме указан селен, сколько в нём мкг и сколько капсул составляют суточную порцию. Большинству взрослых проще выбирать селен в составе витаминно-минерального комплекса, чем отдельную добавку: так количество остаётся около суточной нормы.",
            "В нашем каталоге есть комплекс, в состав которого входит селен, — Swiss Energy Prenatal Forte: это комплекс из 20 витаминов и минералов для периода беременности (фолат 400 мкг, железо 14 мг, селен и другие; 60 капсул). Его приём и вопрос о том, не принимать ли параллельно другую добавку с селеном, согласуйте с врачом, ведущим беременность. Если речь не о беременности, сначала оцените своё питание.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Sochim toʻkilsa, selen ichsam yordam beradimi? Sochning toʻkilishi koʻp sabablarga ega. Selen faqat uning yetishmasligi boʻlgan holatda mavzuga aloqador, buni esa shifokor tekshiruv orqali aniqlaydi. Koʻp selen ichish esa aksincha, sochning toʻkilishiga sabab boʻlishi mumkin.",
            "Selenni qachon ichgan yaxshi? Odatda ovqat bilan ichiladi. Aniq tartib qadoqdagi koʻrsatmada yoziladi.",
            "Braziliya yongʻogʻini har kuni yesa boʻladimi? Bitta yongʻoqda ham kunlik miqdordan ancha koʻp selen boʻlishi mumkin, shuning uchun uni har kuni koʻp emas, meʼyorida yeyish maʼqul.",
          ],
          ru: [
            "Если выпадают волосы, поможет ли селен? У выпадения волос много причин. Селен имеет отношение к теме лишь при его недостатке, а это определяет врач по обследованию. Избыток селена, напротив, может сам вызывать выпадение волос.",
            "Когда лучше принимать селен? Обычно его принимают во время еды. Точный порядок указан в инструкции на упаковке.",
            "Можно ли есть бразильские орехи каждый день? Даже в одном орехе может быть заметно больше суточной нормы селена, поэтому лучше есть их умеренно, а не помногу каждый день.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-prenatal-forte-60"],
    relatedArticleSlugs: ["sink-nima-uchun-kerak-teri-soch", "homiladorlikda-qaysi-vitaminlar-kerak"],
  },
];
