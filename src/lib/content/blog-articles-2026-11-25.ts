import type { RawArticle } from "./blog";

/*
  SEO batch, 2026-11-25. Reference intakes and general guidance only, no promise of effect
  (blog.test.ts runs the claim checks). Sources: NIH Office of Dietary Supplements fact sheets
  (vitamin D, calcium, iron, zinc, magnesium, vitamin B6, B12, biotin, vitamin A, selenium),
  EFSA authorised health claims (magnesium, zinc, biotin, selenium, B vitamins: normal hair,
  normal psychological function, normal nervous system), WHO on diet and mental well-being.
  Photos: Adobe Stock bank, docs/IMAGE-BANK.md.
*/
export const articlesNov2026i: RawArticle[] = [
  {
    slug: "vitaminlarni-qachon-ichish-kerak",
    date: "2026-11-25",
    imageSeed: "bank2-pill-organizer",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Vitaminlarni qachon ichish: ertalab yoki kechqurun",
      ru: "Когда пить витамины: утром или вечером",
    },
    excerpt: {
      uz: "Yogʻda eriydigan va suvda eriydigan vitaminlar, temir, kalsiy, magniy va sinkni ovqatdan oldin yoki keyin ichish, bir-biriga xalaqit beradigan juftliklar va choy-qahva qoidasi.",
      ru: "Жирорастворимые и водорастворимые витамины, железо, кальций, магний и цинк: до или после еды, какие пары мешают друг другу и правило про чай и кофе.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob", ru: "Короткий ответ" },
        paragraphs: {
          uz: [
            "Koʻpchilik vitaminlar uchun «eng toʻgʻri soat» yoʻq: muhimi ularni har kuni, bir xil odat bilan, odatda ovqat bilan ichishdir. Yogʻda eriydigan vitaminlar (A, D, E, K) tarkibida yogʻ boʻlgan ovqat bilan yaxshiroq soʻriladi, suvda eriydigan vitaminlar (C va B guruhi) esa kunning istalgan vaqtida ichilishi mumkin.",
            "Istisnolar asosan minerallarga tegishli: temir, kalsiy, magniy va sink bir-biriga yoki baʼzi dorilarga xalaqit berishi mumkin, shuning uchun ularni ajratib ichish foydali. Quyida buni oddiy qoidalar bilan koʻrib chiqamiz.",
          ],
          ru: [
            "Для большинства витаминов «идеального часа» не существует: важнее принимать их каждый день, по привычке и, как правило, во время еды. Жирорастворимые витамины (A, D, E, K) лучше усваиваются вместе с едой, содержащей жиры, а водорастворимые (C и группа B) можно принимать в любое время дня.",
            "Исключения в основном касаются минералов: железо, кальций, магний и цинк могут мешать друг другу или некоторым лекарствам, поэтому их полезно разносить по времени. Ниже разберём это простыми правилами.",
          ],
        },
      },
      {
        heading: { uz: "Yogʻda eriydigan vitaminlar: ovqat bilan", ru: "Жирорастворимые витамины: вместе с едой" },
        paragraphs: {
          uz: [
            "A, D, E va K vitaminlari ichakda yogʻ bilan birga soʻriladi. AQSh Milliy sogʻliqni saqlash institutlari ovqat qoʻshimchalari boʻlimi (NIH ODS) maʼlumotiga koʻra, vitamin D yogʻli ovqat bilan ichilganda yaxshiroq soʻriladi. Amalda bu shuni anglatadi: bosh qoringa, bir stakan suv bilan ichgandan koʻra, tuxum, qatiq, goʻsht yoki yongʻoqli nonushta bilan ichish maʼqul.",
            "Shuning uchun kuniga bir marta ichiladigan vitamin D yoki multivitamin uchun eng katta ovqat — koʻpincha tushlik yoki kechki ovqat — qulay vaqt. Soat ahamiyatsiz: asosiysi, ovqatda yogʻ boʻlsin va qoʻshimcha unutilmasin.",
            "Ovqatdagi yogʻ miqdori koʻp boʻlishi shart emas: bir osh qoshiq oʻsimlik moyi, bir hovuch yongʻoq, tuxum yoki qatiq ham yetarli. Aksincha, faqat bir stakan choy yoki yengil meva bilan ichilgan vitamin D yoki E yaxshi soʻrilmasligi mumkin. Kechki ovqati yengil boʻlganlar qoʻshimchani tushlikka koʻchirsa boʻladi.",
            "Vitamin A, D va K ning yuqori dozalari organizmda toʻplanishi mumkin, shuning uchun yorliqdagi dozadan oshirmang. Qon suyultiruvchi dori (masalan, varfarin) ichadiganlar K vitaminini faqat shifokor bilan kelishib qabul qiladi.",
          ],
          ru: [
            "Витамины A, D, E и K усваиваются в кишечнике вместе с жирами. По данным Управления пищевых добавок Национальных институтов здоровья США (NIH ODS), витамин D лучше усваивается при приёме с жирной едой. На практике это значит: вместо приёма натощак со стаканом воды удобнее пить его во время завтрака с яйцом, катыком, мясом или орехами.",
            "Поэтому для витамина D или мультивитамина, который принимают раз в день, удобное время — самый плотный приём пищи, чаще обед или ужин. Час не важен: главное, чтобы в еде были жиры и чтобы добавку не забывать.",
            "Жиров в еде не обязательно много: достаточно столовой ложки растительного масла, горсти орехов, яйца или катыка. Напротив, если принять витамин D или E только с чаем или лёгким фруктом, он может усвоиться хуже. Тем, у кого ужин лёгкий, добавку можно перенести на обед.",
            "Высокие дозы витаминов A, D и K могут накапливаться в организме, поэтому не превышайте дозу на этикетке. Тем, кто принимает разжижающие кровь препараты (например, варфарин), витамин K принимают только по согласованию с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Suvda eriydigan vitaminlar: C va B guruhi", ru: "Водорастворимые витамины: C и группа B" },
        paragraphs: {
          uz: [
            "C vitamini va B guruhi vitaminlari suvda eriydi, organizmda katta zaxira boʻlib toʻplanmaydi (B12 bundan mustasno) va yogʻ talab qilmaydi. Ularni ovqat bilan ham, ovqatdan oldin ham ichish mumkin. Agar bosh qoringa ichganda koʻngil aynisa, ovqat bilan ichishni tanlang.",
            "Koʻpchilik B vitaminli qoʻshimchani ertalab yoki kunning birinchi yarmida ichishni afzal koʻradi: bu shunchaki qulay odat, aniq soat talab qiladigan qoida emas. Agar kechqurun ichganda oʻzingizni noqulay his qilsangiz, vaqtni oʻzgartiring.",
            "Suvda eriydigan vitaminlarning ortigʻi odatda siydik bilan chiqib ketadi, lekin bu «istagancha ichish mumkin» degani emas: B6 va niatsin kabi baʼzi moddalarning yuqori chegarasi bor. Yorliqda koʻrsatilgan miqdor va ichish usuliga qarab ish tuting.",
            "Eruvchi (shipuchi) tabletkalarni toʻliq erib ketgandan keyin ichish kerak, ularni bir stakan suvda tayyorlab, ovqat bilan yoki ovqatdan keyin ichish qulayroq. Eruvchi shakl kunlik meʼyordan oshib ketmasligi uchun yorliqdagi miqdorni tekshiring.",
          ],
          ru: [
            "Витамин C и витамины группы B растворяются в воде, не накапливаются в организме большими запасами (исключение — B12) и не требуют жиров. Их можно принимать и с едой, и до еды. Если натощак возникает тошнота, выберите приём во время еды.",
            "Многие предпочитают принимать добавки с B-витаминами утром или в первой половине дня: это просто удобная привычка, а не правило с точным временем. Если вечерний приём вас не устраивает, поменяйте время.",
            "Излишек водорастворимых витаминов обычно выводится с мочой, но это не значит, что их можно принимать в любом количестве: у некоторых веществ, например B6 и ниацина, есть верхний допустимый уровень. Ориентируйтесь на количество и способ приёма, указанные на этикетке.",
            "Шипучие таблетки нужно пить после полного растворения; удобнее готовить их в стакане воды и пить во время еды или после неё. Проверьте количество на этикетке, чтобы суточная норма не оказалась превышена.",
          ],
        },
      },
      {
        heading: { uz: "Temir, kalsiy, magniy va sink", ru: "Железо, кальций, магний и цинк" },
        paragraphs: {
          uz: [
            "Temir NIH ODS maʼlumotiga koʻra bosh qoringa yaxshiroq soʻriladi, lekin koʻpchilikda bu oshqozonni bezovta qiladi; shuning uchun ovqat bilan ichish ham maqbul. Temirning soʻrilishini C vitamini oshiradi, choy, qahva va kalsiy esa kamaytiradi. Shu sababli temirni choy yoki qahva bilan ichmang, ulardan taxminan bir soat oraliq qoldiring.",
            "Kalsiy bir vaqtda kam miqdorda yaxshi soʻriladi: NIH ODS koʻrsatishicha, bir qabulda 500 mg dan oshmagani maʼqul, katta dozani ikkiga boʻlish mumkin. Kalsiy karbonat ovqat bilan, kalsiy sitrat esa ovqatdan qatʼiy nazar ichiladi. Kalsiy va temirni bir-biridan alohida ichish yaxshi.",
            "Magniyni koʻpchilik kechqurun ichadi, chunki u qulay odat boʻladi, ammo ovqat bilan ichish ham mumkin; yuqori dozada ich ketishi mumkin. Sink bosh qoringa koʻngil aynishini keltirib chiqaradi, shuning uchun uni ovqat bilan ichgan maʼqul. Sink va temir ham bir-biri bilan raqobatlashadi, kamida bir necha soat oraliq bering.",
          ],
          ru: [
            "По данным NIH ODS, железо лучше усваивается натощак, но у многих это раздражает желудок, поэтому приём во время еды тоже допустим. Усвоение железа повышает витамин C, а снижают чай, кофе и кальций. Поэтому не запивайте железо чаем или кофе и оставляйте между ними примерно час.",
            "Кальций лучше усваивается небольшими порциями: по NIH ODS, за один приём лучше не превышать 500 мг, а большую дозу можно разделить на две. Карбонат кальция принимают с едой, цитрат кальция — независимо от еды. Кальций и железо лучше принимать отдельно.",
            "Магний многие пьют вечером просто для удобства, но можно и с едой; в высокой дозе возможно послабление стула. Цинк натощак может вызывать тошноту, поэтому его лучше принимать с едой. Цинк и железо тоже конкурируют друг с другом: оставляйте между ними хотя бы несколько часов.",
          ],
        },
      },
      {
        heading: { uz: "Dorilar bilan vaqtni ajratish", ru: "Разнос по времени с лекарствами" },
        paragraphs: {
          uz: [
            "Kalsiy, temir va magniy baʼzi antibiotiklar, qalqonsimon bez gormoni va suyak uchun dorilarning soʻrilishini kamaytiradi. Bunday dorilarni ichadiganlar qoʻshimchani dori bilan bir vaqtda emas, yoʻriqnomada yozilgan oraliq bilan ichishi kerak; aniq oraliqni shifokor yoki farmatsevt aytadi.",
            "Bir vaqtda bir nechta mahsulot ichsangiz, bir xil modda ikki marta kelib qolishi mumkin: multivitamin va alohida kalsiy, vitamin D yoki sink. Barcha yorliqlarni yonma-yon qoʻyib, har bir moddaning umumiy miqdorini hisoblang.",
            "Qoʻshimchani yangi ichishni boshlasangiz, birinchi haftada oshqozon, ich yoki uyquda oʻzgarish boʻlsa, vaqtni yoki ovqat bilan ichishni oʻzgartirib koʻring. Belgilar davom etsa, qabulni toʻxtatib, shifokor yoki farmatsevtga murojaat qiling.",
          ],
          ru: [
            "Кальций, железо и магний снижают усвоение некоторых антибиотиков, гормона щитовидной железы и препаратов для костей. Тем, кто принимает такие лекарства, добавку пьют не одновременно с препаратом, а с интервалом из инструкции; точный интервал подскажет врач или фармацевт.",
            "Если вы пьёте сразу несколько продуктов, одно и то же вещество может прийти дважды: например, мультивитамин и отдельный кальций, витамин D или цинк. Положите этикетки рядом и сложите общее количество каждого вещества.",
            "Если вы только начали принимать добавку и в первую неделю меняется самочувствие желудка, стула или сна, попробуйте поменять время или принимать её во время еды. Если симптомы не проходят, прекратите приём и обратитесь к врачу или фармацевту.",
          ],
        },
      },
      {
        heading: { uz: "Oddiy kunlik tartib", ru: "Простой распорядок на день" },
        paragraphs: {
          uz: [
            "Odatiy qulay variant: nonushtada suvda eriydigan vitaminlar yoki multivitamin, tushlikda yogʻli ovqat bilan vitamin D, kechqurun magniy. Kalsiy va temir esa turli vaqtga qoʻyiladi. Boshqa tartib ham yaxshi, agar siz uni har kuni bajara olsangiz.",
            "Haftalik tabletka qutisi unutmaslikka yordam beradi va nima ichganingizni koʻrsatib turadi. Biologik faol qoʻshimcha dori vositasi emas; qabul qilishdan oldin mutaxassis bilan maslahatlashing.",
          ],
          ru: [
            "Типичный удобный вариант: за завтраком — водорастворимые витамины или мультивитамин, в обед с жирной едой — витамин D, вечером — магний. Кальций и железо ставят на разное время. Подойдёт и другой порядок, если вы можете соблюдать его каждый день.",
            "Недельный органайзер помогает не забывать и показывает, что вы уже приняли. Биологически активная добавка — не лекарство; перед приёмом посоветуйтесь со специалистом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Multivitaminni ertalab ichish kerakmi? Qatʼiy qoida yoʻq: odatda uni ovqat bilan ichish tavsiya etiladi, chunki yogʻda eriydigan vitaminlar yaxshiroq soʻriladi va oshqozon kamroq bezovta boʻladi. Vaqtni oʻzingizga qulay qilib tanlang.",
            "Vitaminni unutsam, ikki baravar ichsam boʻladimi? Yoʻq, keyingi qabulni odatdagi miqdorda ichib, davom eting. Ikki baravar doza ayniqsa yogʻda eriydigan vitaminlar va minerallar uchun yaxshi emas.",
            "Vitaminlarni kofe bilan ichsam boʻladimi? Suvda eriydigan vitaminlar uchun bu muammo emas, lekin kofe va choy temirning soʻrilishini kamaytiradi, shuning uchun temirni ulardan alohida ichgan maʼqul.",
            "Bolalarga ham xuddi shunday qoidami? Umumiy qoidalar bir xil, lekin dozani yosh boʻyicha yorliq yoki pediatr belgilaydi: kattalar mahsulotini bolaga bermang.",
          ],
          ru: [
            "Нужно ли принимать мультивитамин утром? Строгого правила нет: обычно рекомендуют принимать его с едой, потому что жирорастворимые витамины лучше усваиваются, а желудок меньше раздражается. Выберите удобное время.",
            "Если забыл принять витамин, можно ли выпить двойную порцию? Нет, просто продолжайте в обычной дозе со следующего приёма. Двойная доза особенно нежелательна для жирорастворимых витаминов и минералов.",
            "Можно ли запивать витамины кофе? Для водорастворимых витаминов это не проблема, но кофе и чай снижают усвоение железа, поэтому железо лучше принимать отдельно от них.",
            "Те же правила для детей? Общие принципы такие же, но дозу по возрасту определяет этикетка или педиатр: не давайте ребёнку продукты для взрослых.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-multivitamins-biotin-20", "swiss-energy-calcivit-30", "dr-frei-gold-vitamins-20"],
    relatedArticleSlugs: ["multivitamin-qanday-tanlash", "kalsiy-va-vitamin-d3-birga", "temir-nima-uchun-kerak"],
  },
  {
    slug: "soch-tokilishi-qaysi-vitaminlar-muhim",
    date: "2026-11-25",
    imageSeed: "bank2-hair-loss",
    category: { uz: "Soch va teri", ru: "Волосы и кожа" },
    categoryKey: "beauty",
    title: {
      uz: "Soch toʻkilishi: qaysi vitamin va minerallar muhim",
      ru: "Выпадение волос: какие витамины и минералы важны",
    },
    excerpt: {
      uz: "Biotin, temir, sink, vitamin D va selenning soch uchun roli, ortiqcha dozaning zarari, tahlil nimani koʻrsatadi va qaysi holatda shifokorga borish kerak.",
      ru: "Роль биотина, железа, цинка, витамина D и селена для волос, чем опасна избыточная доза, что показывают анализы и когда нужен врач.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob", ru: "Короткий ответ" },
        paragraphs: {
          uz: [
            "Soch toʻkilishining sabablari koʻp: stress, hayz davri va tugʻruqdan keyingi oʻzgarishlar, qalqonsimon bez, dorilar, ovqatlanish va irsiyat. Vitamin va minerallar bu sabablardan faqat biri. Biotin, temir, sink, selen va vitamin D sochning meʼyoriy holatini qoʻllab-quvvatlashga hissa qoʻshadi, lekin ular yetarli boʻlgan odamga qoʻshimcha ichish sochni qalinlashtirishiga kafolat yoʻq.",
            "Eng samarali birinchi qadam — «nima yetishmayapti» deb oʻzboshimchalik bilan taxmin qilish emas, balki ovqatlanishni baholash va kerak boʻlsa tahlil topshirish. Quyida har bir moddaning nimasi bilan muhimligi va qayerda ehtiyot boʻlish kerakligi yozilgan.",
          ],
          ru: [
            "Причин выпадения волос много: стресс, гормональные изменения после родов, щитовидная железа, лекарства, питание и наследственность. Витамины и минералы — лишь одна из них. Биотин, железо, цинк, селен и витамин D способствуют поддержанию нормального состояния волос, но если этих веществ в организме достаточно, добавка не гарантирует, что волосы станут гуще.",
            "Самый разумный первый шаг — не гадать «чего мне не хватает», а оценить питание и при необходимости сдать анализы. Ниже — чем важно каждое вещество и где нужна осторожность.",
          ],
        },
      },
      {
        heading: { uz: "Biotin: eng mashhur, lekin ehtiyot boʻling", ru: "Биотин: самый известный, но нужна осторожность" },
        paragraphs: {
          uz: [
            "Biotin (B7 vitamini) sochning meʼyoriy holatini saqlashga hissa qoʻshadi — bu Yevropa xavfsizlik idorasi (EFSA) tasdiqlagan taʼrif. Kattalar uchun yetarli kunlik miqdor 30 mkg (NIH ODS). Biotin tuxum sarigʻi, jigar, yongʻoq, urugʻlar, dukkaklilar va goʻshtda bor, shuning uchun xilma-xil ovqatlanadiganlarda tanqislik kam uchraydi.",
            "NIH ODS maʼlumotiga koʻra, biotin yetishmasligi nodir holat, sochning yupqalashishi esa uning belgilaridan biri. Tanqisligi boʻlmagan odamlarda sochni qalinlashtirish uchun yuqori dozali biotinning samarasi yetarlicha oʻrganilmagan.",
            "Muhim ogohlantirish: yuqori dozali biotin baʼzi laboratoriya tahlillari natijasini buzishi mumkin (masalan, qalqonsimon bez gormonlari va yurak belgilari testlari). Tahlil topshirishdan oldin biotin ichayotganingizni laborant va shifokorga ayting.",
          ],
          ru: [
            "Биотин (витамин B7) способствует поддержанию нормального состояния волос — это формулировка, одобренная Европейским органом по безопасности продуктов питания (EFSA). Адекватное суточное потребление для взрослых — 30 мкг (NIH ODS). Биотин есть в яичном желтке, печени, орехах, семенах, бобовых и мясе, поэтому при разнообразном питании дефицит встречается редко.",
            "По данным NIH ODS, дефицит биотина — редкость, а истончение волос — один из его признаков. Для людей без дефицита эффект высоких доз биотина на густоту волос изучен недостаточно.",
            "Важное предупреждение: высокие дозы биотина могут искажать результаты некоторых лабораторных анализов (например, гормонов щитовидной железы и маркеров сердца). Перед сдачей анализов сообщите лаборанту и врачу, что принимаете биотин.",
          ],
        },
      },
      {
        heading: { uz: "Temir va vitamin D", ru: "Железо и витамин D" },
        paragraphs: {
          uz: [
            "Temir qonda kislorod tashishda qatnashadi va hujayralarning meʼyoriy boʻlinishiga hissa qoʻshadi; EFSA ham temirni shu soha bilan bogʻlaydi. Temir zaxirasi past boʻlgan odamlarda (ayniqsa hayz davri koʻp, vegetarian ovqatlanishda) soch holati ham yomonlashishi mumkin, lekin buni faqat belgilarga qarab aniqlab boʻlmaydi: shifokor odatda gemoglobin va ferritinni tekshiradi.",
            "Temirni oʻzboshimchalik bilan koʻp ichmang: kattalar uchun yuqori chegara kuniga 45 mg (NIH ODS), ortiqchasi ichni bezovta qiladi va baʼzi holatlarda xavfli. Vitamin D esa qishda yetishmasligi mumkin; kattalarga tavsiya etilgan miqdor kuniga 600 XB (15 mkg), 70 yoshdan keyin 800 XB (20 mkg). Tahlilsiz yuqori doza tanlamang.",
          ],
          ru: [
            "Железо участвует в переносе кислорода кровью и способствует нормальному делению клеток; EFSA связывает его с этими функциями. У людей с низкими запасами железа (особенно при обильных менструациях, вегетарианском питании) состояние волос тоже может ухудшаться, но определить это только по симптомам нельзя: врач обычно проверяет гемоглобин и ферритин.",
            "Не принимайте железо в больших количествах самостоятельно: верхний допустимый уровень для взрослых — 45 мг в день (NIH ODS), избыток раздражает кишечник и в ряде состояний опасен. Витамина D зимой может не хватать; рекомендуемая норма для взрослых — 600 МЕ (15 мкг) в день, после 70 лет — 800 МЕ (20 мкг). Не выбирайте высокие дозы без анализа.",
          ],
        },
      },
      {
        heading: { uz: "Sink va selen: kerak, lekin meʼyorida", ru: "Цинк и селен: нужны, но в норме" },
        paragraphs: {
          uz: [
            "Sink sochning meʼyoriy holatini saqlashga hissa qoʻshadi (EFSA). Kattalar uchun tavsiya etilgan miqdor ayollarga 8 mg, erkaklarga 11 mg (NIH ODS); manbalar — goʻsht, dukkaklilar, yongʻoq, qovoq urugʻi. Yuqori chegara — kuniga 40 mg; uzoq muddat undan koʻp ichilsa, mis soʻrilishi buziladi.",
            "Sinkni ovqatdan olish oson: bir hovuch qovoq urugʻi, goʻsht yoki dukkakli taom kunlik ehtiyotning katta qismini beradi. Oʻsimlik mahsulotlaridagi sink goʻshtdagiga qaraganda kamroq soʻriladi, shuning uchun vegetarianlarga ehtiyoj bir oz yuqori boʻladi.",
            "Selen ham sochning meʼyoriy holati uchun kerak, lekin uning foydali va ortiqcha miqdori orasidagi farq tor: kattalar uchun tavsiya 55 mkg, yuqori chegara 400 mkg. NIH ODS selenning ortiqchasi soch toʻkilishi va tirnoq moʻrtligiga olib kelishi mumkinligini koʻrsatadi. Braziliya yongʻogʻi juda koʻp selen saqlaydi, shuning uchun uni har kuni koʻp yemang.",
          ],
          ru: [
            "Цинк способствует поддержанию нормального состояния волос (EFSA). Рекомендуемое количество для взрослых — 8 мг для женщин и 11 мг для мужчин (NIH ODS); источники — мясо, бобовые, орехи, тыквенные семечки. Верхний допустимый уровень — 40 мг в день; при длительном превышении нарушается усвоение меди.",
            "Цинк легко получить из еды: горсть тыквенных семечек, мясо или блюдо из бобовых покрывают большую часть суточной потребности. Цинк из растительных продуктов усваивается хуже, чем из мяса, поэтому вегетарианцам потребность немного выше.",
            "Селен также нужен для нормального состояния волос, но разница между полезным и избыточным количеством невелика: рекомендуемая норма для взрослых — 55 мкг, верхний уровень — 400 мкг. NIH ODS указывает, что избыток селена может сопровождаться выпадением волос и ломкостью ногтей. Бразильский орех содержит очень много селена, поэтому не ешьте его много каждый день.",
          ],
        },
      },
      {
        heading: { uz: "Ortiqcha dozaning ham sochga zarari bor", ru: "Избыток тоже вредит волосам" },
        paragraphs: {
          uz: [
            "Koʻpchilik «koʻproq — yaxshiroq» deb oʻylaydi, lekin sochning toʻkilishi baʼzan aynan ortiqcha qoʻshimchadan boshlanadi. NIH ODS maʼlumotiga koʻra, vitamin A ning tayyor shakli (retinol) uzoq muddat yuqori miqdorda qabul qilinsa, soch toʻkilishiga olib kelishi mumkin; kattalar uchun yuqori chegara 3000 mkg RAE. Shuningdek, bir vaqtda bir nechta mahsulot ichilganda bir xil modda ikki marta kelib qoladi.",
            "Shuning uchun yangi qoʻshimcha qoʻshishdan oldin oʻzingiz ichayotgan hamma mahsulot yorliqlarini yonma-yon qoʻying va A vitamini, sink, selen hamda biotin umumiy miqdorini hisoblang.",
            "Soch toʻkilishi baʼzan yangi qoʻshimchani boshlagandan keyin emas, balki tez vazn tashlash, qattiq parhez yoki oqsilning keskin kamayishidan keyin ham boshlanadi. Bunday holatlarda organizm zaxirani sochdan emas, muhimroq vazifalarga yoʻnaltiradi, ovqatlanish tiklanganda esa soch ham asta-sekin oʻz holiga qaytadi.",
          ],
          ru: [
            "Многие думают «чем больше, тем лучше», но выпадение волос иногда как раз начинается из-за лишней добавки. По данным NIH ODS, готовая форма витамина A (ретинол) при длительном приёме в высоких количествах может сопровождаться выпадением волос; верхний уровень для взрослых — 3000 мкг RAE. Кроме того, при одновременном приёме нескольких продуктов одно вещество приходит дважды.",
            "Поэтому перед новой добавкой положите рядом этикетки всего, что вы уже принимаете, и сложите общее количество витамина A, цинка, селена и биотина.",
            "Выпадение волос иногда начинается не после новой добавки, а после быстрой потери веса, жёсткой диеты или резкого снижения белка в рационе. В таких случаях организм направляет ресурсы на более важные функции, а когда питание налаживается, волосы тоже постепенно приходят в обычное состояние.",
          ],
        },
      },
      {
        heading: { uz: "Qachon shifokorga borish kerak", ru: "Когда нужен врач" },
        paragraphs: {
          uz: [
            "Soch birdan va koʻp toʻkilsa, boshda dumaloq yalangʻoch joylar paydo boʻlsa, teri qichisa yoki qizarsa, shuningdek charchoq, vazn oʻzgarishi, hayz tartibining buzilishi yoki sovuqqa chidamsizlik qoʻshilsa — bu qoʻshimcha tanlash emas, shifokorga borish uchun sabab. Dermatolog yoki terapevt kerakli tahlillarni (gemoglobin, ferritin, qalqonsimon bez, kerak boʻlsa vitamin D) belgilaydi.",
            "Oziq-ovqat tomondan esa quyidagilar yordam beradi: yetarli oqsil, tuxum, baliq, dukkaklilar, yongʻoq, yashil bargli sabzavotlar. Soch bir necha oyda oʻzgaradi, shuning uchun har qanday ovqatlanish oʻzgarishini kamida 3 oy kuzating.",
            "Natijani baholash uchun suratga olib borish foydali: bir xil yorugʻlikda, har oyda bir marta.",
            "Tashqi parvarish ham muhim: issiq fen va tez-tez boʻyashni kamaytirish, sochni qattiq tortmaslik, yumshoq shampun tanlash singan sochni kamaytiradi, lekin oziqa yetishmovchiligini almashtirmaydi.",
            "Biologik faol qoʻshimcha dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.",
          ],
          ru: [
            "Если волосы выпадают внезапно и сильно, появляются круглые участки облысения, кожа головы чешется или краснеет, а также если добавляются усталость, изменение веса, сбои цикла или непереносимость холода — это повод идти к врачу, а не выбирать добавку. Дерматолог или терапевт назначит нужные анализы (гемоглобин, ферритин, щитовидная железа, при необходимости витамин D).",
            "Со стороны питания помогают достаточное количество белка, яйца, рыба, бобовые, орехи, зелёные листовые овощи. Волосы меняются месяцами, поэтому наблюдайте за любыми изменениями в питании не менее 3 месяцев.",
            "Для оценки результата полезно фотографировать пробор в одном и том же освещении раз в месяц.",
            "Важен и внешний уход: меньше горячего фена и частого окрашивания, нетугие причёски, мягкий шампунь уменьшают ломкость волос, но не заменяют нехватку питательных веществ.",
            "Биологически активная добавка — не лекарство. Перед приёмом посоветуйтесь со специалистом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Kuniga necha tola soch toʻkilishi normal? Har kuni bir necha oʻnlab tola toʻkilishi oddiy holat, chunki soch doimiy yangilanadi. Tarashda yoki yuvishda toʻkilish sezilarli ortgan yoki soch yupqalashgan boʻlsa, sababini aniqlash kerak.",
            "Biotin ichsam, soch tezroq oʻsadimi? Biotin yetishmovchiligi boʻlmaganlarda bunday natija yetarlicha oʻrganilmagan. Uning yuqori dozasi laboratoriya tahlillariga xalaqit berishi mumkin.",
            "Soch uchun qaysi vitamin eng muhim? Bitta «eng muhim» vitamin yoʻq: soch xilma-xil moddalarga, shu jumladan oqsil, temir, sink va biotinga muhtoj. Eng yaxshi boshlangʻich nuqta — toʻliq ovqatlanish va tahlil.",
            "Qoʻshimchani qancha ichish kerak? Yorliqdagi muddat va miqdorga rioya qiling; natijani baholash uchun kamida bir necha oy kerak. Shifokor boshqacha koʻrsatma bergan boʻlsa, unga amal qiling.",
          ],
          ru: [
            "Сколько волос в день выпадает нормально? Несколько десятков волос в день — обычное явление, так как волосы постоянно обновляются. Если при расчёсывании или мытье выпадение заметно усилилось или волосы поредели, нужно искать причину.",
            "Если принимать биотин, волосы растут быстрее? У людей без дефицита такой эффект изучен недостаточно. Высокая доза может влиять на результаты лабораторных анализов.",
            "Какой витамин для волос самый важный? Одного «самого важного» витамина нет: волосам нужны разные вещества, включая белок, железо, цинк и биотин. Лучшая отправная точка — полноценное питание и анализы.",
            "Как долго принимать добавку? Соблюдайте срок и количество с этикетки; для оценки результата нужно как минимум несколько месяцев. Если врач дал другие указания, следуйте им.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-hair-nail-skin-30", "dr-frei-multivitamins-biotin-20"],
    relatedArticleSlugs: ["soch-va-tirnoq-uchun-biotin", "sink-nima-uchun-kerak-teri-soch", "temir-nima-uchun-kerak"],
  },
  {
    slug: "stress-davrida-magniy-va-b-vitaminlari",
    date: "2026-11-25",
    imageSeed: "bank2-stress",
    category: { uz: "Asab tizimi", ru: "Нервная система" },
    categoryKey: "nutrition",
    title: {
      uz: "Stress davrida magniy va B vitaminlari",
      ru: "Магний и витамины группы B в период стресса",
    },
    excerpt: {
      uz: "Magniy, B6, B12, B1 va foliy kislotaning asab tizimi va ruhiy holatdagi roli, kunlik meʼyor, yuqori chegara, ovqatdagi manbalar va qachon shifokorga borish kerak.",
      ru: "Роль магния, B6, B12, B1 и фолиевой кислоты для нервной системы и психологического состояния, суточные нормы, верхние пределы, источники в еде и когда нужен врач.",
    },
    sections: [
      {
        heading: { uz: "Qisqa javob", ru: "Короткий ответ" },
        paragraphs: {
          uz: [
            "Magniy va B guruhi vitaminlari (B1, B6, B12, foliy kislota) asab tizimining meʼyoriy ishlashiga va ruhiy faoliyatga hissa qoʻshadi — bu Yevropa xavfsizlik idorasi (EFSA) tasdiqlagan taʼriflar. Magniy bundan tashqari charchoq va holsizlikni kamaytirishga hissa qoʻshadi. Ammo bu ular stress yoki xavotirga chora degani emas: qoʻshimcha faqat ovqatdagi yetishmovchilikni toʻldirishi mumkin.",
            "Stressli kunlarda koʻpchilik kam uxlaydi, tartibsiz ovqatlanadi, koʻp qahva ichadi. Shu sababli oʻzgarish koʻpincha qoʻshimchadan emas, uyqu, ovqat va kun tartibidan boshlanadi. Quyida har bir moddaning nimasi muhimligi, qancha kerakligi va qayergacha xavfsizligi bayon etilgan.",
            "Bu maqola faqat umumiy maʼlumot: u tashxis qoʻymaydi va shifokor tavsiyasini almashtirmaydi.",
          ],
          ru: [
            "Магний и витамины группы B (B1, B6, B12, фолиевая кислота) способствуют нормальной работе нервной системы и нормальной психологической функции — это формулировки, одобренные Европейским органом по безопасности продуктов питания (EFSA). Магний также способствует снижению усталости и утомляемости. Но это не значит, что они справляются со стрессом или тревогой: добавка может лишь восполнить нехватку в рационе.",
            "В напряжённые дни многие меньше спят, едят нерегулярно и пьют больше кофе. Поэтому перемены чаще начинаются не с добавки, а со сна, питания и режима дня. Ниже — чем важно каждое вещество, сколько его нужно и где предел безопасности.",
            "Эта статья — только общая информация: она не ставит диагноз и не заменяет рекомендаций врача.",
          ],
        },
      },
      {
        heading: { uz: "Magniy: qancha kerak va qayerdan olinadi", ru: "Магний: сколько нужно и где его взять" },
        paragraphs: {
          uz: [
            "NIH ODS maʼlumotiga koʻra, kattalar uchun tavsiya etilgan kunlik miqdor ayollarga taxminan 310–320 mg, erkaklarga 400–420 mg. Magniy yongʻoq, urugʻlar, butun don, dukkaklilar, yashil bargli sabzavotlar va ovqatdagi bir qator mahsulotlarda bor. Oʻrtacha ratsionda magniy yetishmasligi mumkin, ayniqsa tozalangan don mahsulotlari koʻp yeyilganda.",
            "Qoʻshimcha magniy uchun yuqori chegara kuniga 350 mg (faqat qoʻshimcha va dorilardan, ovqatdan emas). Undan oshsa, ich ketishi, qorin ogʻrigʻi va koʻngil aynishi mumkin. Buyrak kasalligi borlar magniyni faqat shifokor bilan kelishib qabul qilishi kerak. Magniy shakllari (sitrat, bisglitsinat, oksid) farqi haqida batafsil maʼlumot «Magniy B6 va magniy sitrat farqi» maqolasida.",
          ],
          ru: [
            "По данным NIH ODS, рекомендуемое суточное количество магния для взрослых — примерно 310–320 мг для женщин и 400–420 мг для мужчин. Магний есть в орехах, семенах, цельном зерне, бобовых, зелёных листовых овощах и ряде других продуктов. В среднем рационе магния может не хватать, особенно если много очищенных зерновых продуктов.",
            "Верхний допустимый уровень для магния из добавок и лекарств — 350 мг в день (без учёта пищи). При превышении возможны послабление стула, боль в животе и тошнота. Людям с заболеваниями почек магний принимают только по согласованию с врачом. О различиях форм магния (цитрат, бисглицинат, оксид) подробно — в статье «Магний B6 и магний цитрат: в чём разница».",
          ],
        },
      },
      {
        heading: { uz: "B6, B12, B1 va foliy kislota", ru: "B6, B12, B1 и фолиевая кислота" },
        paragraphs: {
          uz: [
            "B vitaminlari oʻzaro bogʻliq ishlaydi: ular ovqatdan energiya olishda va asab hujayralari faoliyatida qatnashadi. B6 uchun kattalarga tavsiya etilgan miqdor kuniga 1,3 mg (19–50 yosh), B12 uchun 2,4 mkg, foliy kislota uchun 400 mkg (NIH ODS). B1 (tiamin) uchun ayollarga 1,1 mg, erkaklarga 1,2 mg.",
            "B6 uchun ehtiyot boʻlish kerak: NIH ODS maʼlumotiga koʻra, uzoq vaqt yuqori dozada (kuniga 100 mg dan koʻp) ichilganda qoʻl va oyoqda uvishish va nerv shikastlanishi kuzatilgan, shuning uchun yuqori chegara 100 mg qilib belgilangan. B12 deyarli faqat hayvon mahsulotlarida bor, shuning uchun vegetarianlar, keksalar va metformin ichuvchilar uni tekshirib turishi foydali.",
            "B vitaminlari goʻsht, jigar, tuxum, sut, dukkaklilar, don va yashil bargli sabzavotlarda bor. Ovqatlanish xilma-xil boʻlsa, koʻpchilik kishi ularni yetarli oladi.",
            "Masalan, bir kunlik oddiy menyuda tuxumli nonushta, tushlikda goʻsht yoki dukkakli osh, kechqurun yongʻoq va sabzavot salati B guruhi vitaminlari va magniyning anchagina qismini beradi. Tozalangan un, shirinlik va tez tayyorlanadigan ovqatga tayanadigan ratsionda esa ular kamroq boʻladi.",
          ],
          ru: [
            "Витамины группы B работают во взаимосвязи: они участвуют в получении энергии из пищи и в деятельности нервных клеток. Рекомендуемое количество для взрослых: B6 — 1,3 мг в день (19–50 лет), B12 — 2,4 мкг, фолиевая кислота — 400 мкг (NIH ODS). B1 (тиамин) — 1,1 мг для женщин и 1,2 мг для мужчин.",
            "С B6 нужна осторожность: по данным NIH ODS, при длительном приёме высоких доз (более 100 мг в день) наблюдались онемение рук и ног и повреждение нервов, поэтому верхний допустимый уровень установлен в 100 мг. B12 есть почти только в продуктах животного происхождения, поэтому вегетарианцам, пожилым людям и принимающим метформин полезно контролировать его уровень.",
            "Витамины группы B есть в мясе, печени, яйцах, молоке, бобовых, злаках и зелёных листовых овощах. При разнообразном питании большинство людей получает их достаточно.",
            "Например, обычное дневное меню с яичным завтраком, мясом или блюдом из бобовых на обед и орехами с салатом из овощей вечером даёт заметную часть витаминов группы B и магния. В рационе, где преобладают очищенная мука, сладкое и быстрая еда, их меньше.",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimcha qachon mantiqli", ru: "Когда добавка уместна" },
        paragraphs: {
          uz: [
            "Qoʻshimcha asosan ratsion bir xil va kam boʻlganda, vegetarian yoki vegan ovqatlanishda (B12), homiladorlikda (foliy kislota — shifokor bilan) yoki shifokor tahlil asosida tanqislikni aniqlaganda mantiqli. Yorliqda har bir moddaning miqdori kunlik meʼyorga nisbati bilan yozilgan boʻlsin, hamda B6 100 mg dan oshmasin.",
            "Magniy va B6 ni bitta mahsulotda ichish qulay, lekin multivitamin bilan birga ichsangiz, umumiy miqdorni hisoblang: B6 va magniy ikki marta kelib qolishi mumkin. Magniy baʼzi antibiotiklar va suyak uchun dorilar soʻrilishini kamaytiradi, shuning uchun ular orasida oraliq qoldiring.",
            "Qoʻshimcha tanlayotganda mahsulot nomidagi chiroyli vaʼdalarga emas, tarkib jadvaliga qarang: moddaning shakli, mg yoki mkg dagi miqdori va kunlik meʼyorga nisbati yozilgan boʻlishi kerak. Yangi qoʻshimchani bir vaqtda bir nechta boshlamang: bittasini tanlab, bir necha hafta kuzatish oʻzingizni qanday his qilishingizni tushunishga yordam beradi.",
          ],
          ru: [
            "Добавка уместна в основном при однообразном и скудном рационе, при вегетарианском или веганском питании (B12), при беременности (фолиевая кислота — по согласованию с врачом) или если врач по анализам выявил дефицит. На этикетке должно быть количество каждого вещества и его доля от суточной нормы, а B6 не должен превышать 100 мг.",
            "Магний и B6 удобно принимать в одном продукте, но если вы пьёте ещё и мультивитамин, посчитайте общее количество: B6 и магний могут прийти дважды. Магний снижает усвоение некоторых антибиотиков и препаратов для костей, поэтому между ними нужен интервал.",
            "При выборе добавки смотрите не на красивые обещания в названии, а на таблицу состава: форма вещества, количество в мг или мкг и доля от суточной нормы должны быть указаны.",
          ],
        },
      },
      {
        heading: { uz: "Qoʻshimchadan oldin nimalarni sinab koʻrish kerak", ru: "Что стоит сделать до добавок" },
        paragraphs: {
          uz: [
            "Jahon sogʻliqni saqlash tashkiloti (JSST) ruhiy salomatlik uchun sogʻlom ovqatlanish, harakat va yetarli uyquni tavsiya etadi. Amalda bu kuniga bir necha marta tartibli ovqatlanish, kofeinni tushdan keyin kamaytirish, kechqurun ekranni oʻchirish va yengil yurish demakdir.",
            "Magniyga boy ovqat (yongʻoq, urugʻlar, oatmeal) va B vitaminli ovqat (tuxum, dukkaklilar, baliq) kunlik ratsionga osongina qoʻshiladi. Qoʻshimcha shu asosga qoʻshimcha sifatida qaraladi, uning oʻrnini bosmaydi.",
            "Kunlik tartib ham muhim: bir vaqtda yotish va uygʻonish, tushlikdan keyin qisqa sayr, ish orasida tanaffus va ekran vaqtini cheklash uyqu sifatini yaxshilashga yordam beradi. Bu odatlar qoʻshimchadan koʻra koʻproq taʼsir qilishi mumkin.",
            "Qahva va energetik ichimliklar uyquni buzishi mumkin; EFSA kattalar uchun kuniga 400 mg gacha kofeinni xavfsiz deb hisoblaydi, bu taxminan toʻrt kichik piyola qahva. Koʻproq kofein ichgan odamda bezovtalik va yurak urishining tezlashishi kuchayishi mumkin.",
          ],
          ru: [
            "Всемирная организация здравоохранения (ВОЗ) для психического благополучия рекомендует здоровое питание, движение и достаточный сон. На практике это регулярное питание несколько раз в день, меньше кофеина после обеда, отключение экранов вечером и лёгкие прогулки.",
            "Продукты, богатые магнием (орехи, семена, овсянка), и продукты с витаминами группы B (яйца, бобовые, рыба) легко добавить в ежедневный рацион. Добавку стоит рассматривать как дополнение к этому, а не замену.",
            "Важен и распорядок дня: сон и подъём в одно время, короткая прогулка после обеда, перерывы в работе и ограничение времени у экрана помогают качеству сна.",
            "Кофе и энергетики могут нарушать сон; EFSA считает безопасным для взрослых до 400 мг кофеина в день, это около четырёх небольших чашек кофе. При большем количестве кофеина беспокойство и учащённое сердцебиение могут усиливаться.",
          ],
        },
      },
      {
        heading: { uz: "Qachon shifokorga borish kerak", ru: "Когда нужен врач" },
        paragraphs: {
          uz: [
            "Xavotir, past kayfiyat, uyqusizlik yoki bezovtalik ikki haftadan koʻproq davom etsa, kundalik hayotga xalaqit bersa, yurak urishi tezlashishi, nafas qisilishi, ishtaha yoki vaznning keskin oʻzgarishi qoʻshilsa — bu ovqat qoʻshimchasi bilan hal qilinadigan masala emas. Terapevt, nevrolog yoki psixolog bilan maslahatlashing.",
            "Biologik faol qoʻshimcha dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.",
          ],
          ru: [
            "Если тревога, подавленное настроение, бессонница или беспокойство длятся больше двух недель, мешают повседневной жизни или к ним добавляются учащённое сердцебиение, одышка, резкие изменения аппетита или веса, это не вопрос пищевых добавок. Обратитесь к терапевту, неврологу или психологу.",
            "Биологически активная добавка — не лекарство. Перед приёмом посоветуйтесь со специалистом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Magniy va B6 ni birga ichsa boʻladimi? Ha, koʻpchilik tayyor mahsulotlarda ular birga uchraydi. Asosiysi, yorliqdagi miqdorga rioya qilish va B6 ni kuniga 100 mg dan oshirmaslik.",
            "Magniyni qachon ichish yaxshi? Qatʼiy soat yoʻq: koʻpchilik kechqurun ichadi, lekin ovqat bilan ichsa oshqozon kamroq bezovta boʻladi.",
            "B12 ni qoʻshimcha sifatida ichish kerakmi? Hayvon mahsulotlarini muntazam yeydiganlarda odatda yetarli. Vegetarianlar, keksalar va ayrim dori ichuvchilarga shifokor tahlil asosida maslahat beradi.",
            "Qancha vaqtdan keyin farq seziladi? Bu har kimda turlicha va qoʻshimcha natija kafolatlamaydi. Agar bir necha hafta ichida oʻzgarish boʻlmasa, sababni shifokor bilan aniqlang.",
          ],
          ru: [
            "Можно ли принимать магний и B6 вместе? Да, во многих готовых продуктах они идут вместе. Главное — соблюдать количество на этикетке и не превышать для B6 100 мг в день.",
            "Когда лучше принимать магний? Строгого часа нет: многие пьют его вечером, но во время еды желудок раздражается меньше.",
            "Нужен ли B12 в виде добавки? Тем, кто регулярно ест продукты животного происхождения, его обычно хватает. Вегетарианцам, пожилым людям и некоторым принимающим лекарства врач посоветует по анализу.",
            "Через сколько времени заметна разница? У всех по-разному, и добавка не гарантирует результат. Если за несколько недель ничего не изменилось, причину стоит искать вместе с врачом.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-neuroforce-30"],
    relatedArticleSlugs: ["magniy-va-uyqu", "magniy-b6-va-magniy-sitrat-farqi", "b-vitaminlari-nima-uchun-kerak"],
  },
];
