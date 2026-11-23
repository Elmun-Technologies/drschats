import type { RawHealthTopic } from "./health-topics";

/*
  Vitamin guides written from the demand report (/admin/keywords, Planner
  export 2026-11-02): the substance is searched for, the shop sells a pack that
  contains it, and until now no page answered the query.

  Every product listed here carries the substance on its label — amounts are
  quoted only where the catalogue states them. Copy says a nutrient
  "contributes to" a normal function and never that it treats or prevents
  anything (claims.ts, health-claims.test.ts).
*/

export const demandVitaminTopics: RawHealthTopic[] = [
  {
    kind: "vitamin",
    slug: "folic-acid",
    name: { uz: "Foliy kislotasi (B9)", ru: "Фолиевая кислота (B9)" },
    headline: {
      uz: "B9 vitamini: qon hosil boʻlishi va hujayralarning boʻlinishi uchun",
      ru: "Витамин B9: кроветворение и деление клеток",
    },
    intro: {
      uz: "Foliy kislotasi (folat, B9) qon hosil boʻlishi va hujayralar boʻlinishida ishtirok etadi. Shakllari va tanlash qoidalari bilan tanishing.",
      ru: "Фолиевая кислота (фолат, B9) участвует в кроветворении и делении клеток. Разбираем, чем различаются формы и как выбрать добавку.",
    },
    sections: {
      uz: [
        {
          title: "Foliy kislotasi nima uchun kerak",
          body: "Folat normal qon hosil boʻlishiga, aminokislotalar sintezi va hujayralar boʻlinishiga hissa qoʻshadi. Shuningdek, immun tizimining normal ishlashiga va charchoqni kamaytirishga hissa qoʻshadi.",
        },
        {
          title: "Foliy kislotasi, folat va metilfolat: farqi nimada",
          body: "Folat — oziq-ovqatdagi tabiiy shakl (koʻk bargli sabzavotlar, dukkaklilar, jigar). Foliy kislotasi — qoʻshimchalarda ishlatiladigan sintetik shakl. Metilfolat organizm foydalanadigan faol shakldir. Qadoqda qaysi shakl va necha mkg borligi yozilgan boʻladi — shuni oʻqing.",
        },
        {
          title: "Kimlar uchun dolzarb mavzu",
          body: "Homiladorlikni rejalashtirayotgan va homilador ayollar foliy kislotasi miqdorini shifokor bilan kelishadi: kerakli doza har kimda har xil. Swiss Energy Prenatal Forte 60 tarkibida 400 mkg folat bor.",
        },
      ],
      ru: [
        {
          title: "Для чего нужна фолиевая кислота",
          body: "Фолат способствует нормальному кроветворению, синтезу аминокислот и делению клеток. Также он способствует нормальной работе иммунной системы и снижению усталости.",
        },
        {
          title: "Фолиевая кислота, фолат и метилфолат: в чём разница",
          body: "Фолат — природная форма из пищи (зелёные листовые овощи, бобовые, печень). Фолиевая кислота — синтетическая форма, которую используют в добавках. Метилфолат — активная форма, которую организм использует напрямую. На упаковке указано, какая форма и сколько мкг в одной дозе — смотрите на это.",
        },
        {
          title: "Для кого тема особенно актуальна",
          body: "Женщины, которые планируют беременность или уже беременны, согласуют количество фолиевой кислоты с врачом: нужная доза у каждой своя. В Swiss Energy Prenatal Forte 60 содержится 400 мкг фолата.",
        },
      ],
    },
    bullets: {
      uz: [
        "Normal qon hosil boʻlishiga hissa",
        "Hujayralarning normal boʻlinishida ishtirok",
        "Immun tizimining normal ishlashiga hissa",
        "Charchoqni kamaytirishga hissa",
      ],
      ru: [
        "Вклад в нормальное кроветворение",
        "Участие в нормальном делении клеток",
        "Вклад в нормальную работу иммунной системы",
        "Вклад в снижение усталости",
      ],
    },
    ingredientSlugs: ["iron", "vitamin-b12"],
    productSlugs: ["swiss-energy-prenatal-forte-60", "swiss-energy-neuroforce-30", "dr-frei-kids-multivitamins-20"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["iron", "vitamin-b12", "vitamin-b-complex", "fatigue"],
    faq: {
      uz: [
        {
          question: "Foliy kislotasi va B9 vitamini bir narsami?",
          answer: "Ha. B9 — vitaminning nomi, foliy kislotasi uning sintetik shakli, folat esa oziq-ovqatdagi tabiiy shakli.",
        },
        {
          question: "Foliy kislotasini qachon ichish kerak?",
          answer: "Odatda ovqat bilan yoki ovqatdan keyin ichiladi. Miqdor va muddatni qadoqdagi koʻrsatma yoki shifokor belgilaydi.",
        },
        {
          question: "Homiladorlikda foliy kislotasi kerakmi?",
          answer: "Bu savolni shifokor bilan kelishing: miqdor va muddat har bir ayolda har xil. Biologik faol qoʻshimcha dori emas va shifokor tayinlovini almashtirmaydi.",
        },
      ],
      ru: [
        {
          question: "Фолиевая кислота и витамин B9 — это одно и то же?",
          answer: "Да. B9 — название витамина, фолиевая кислота — его синтетическая форма, а фолат — природная форма из продуктов.",
        },
        {
          question: "Когда принимать фолиевую кислоту?",
          answer: "Обычно во время еды или после неё. Дозу и срок определяют по инструкции на упаковке или врач.",
        },
        {
          question: "Нужна ли фолиевая кислота при беременности?",
          answer: "Этот вопрос лучше обсудить с врачом: доза и срок у каждой женщины свои. БАД не является лекарством и не заменяет назначение врача.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-a",
    name: { uz: "Vitamin A (retinol)", ru: "Витамин А (ретинол)" },
    headline: {
      uz: "Koʻrish, teri va immun tizimi uchun vitamin",
      ru: "Витамин для зрения, кожи и иммунной системы",
    },
    intro: {
      uz: "Vitamin A (retinol) normal koʻrishni, teri va shilliq qavatlarni saqlashga hissa qoʻshadi. Manbalari va qabul qilish qoidalari.",
      ru: "Витамин А (ретинол) способствует поддержанию нормального зрения, кожи и слизистых оболочек. Источники и правила приёма.",
    },
    sections: {
      uz: [
        {
          title: "Vitamin A nima uchun kerak",
          body: "Vitamin A normal koʻrishni, teri va shilliq qavatlarning holatini saqlashga, immun tizimining normal ishlashiga hissa qoʻshadi. U temir almashinuvida ham ishtirok etadi.",
        },
        {
          title: "Qayerdan olinadi",
          body: "Retinol hayvon mahsulotlarida (jigar, tuxum sarigʻi, sut mahsulotlari) uchraydi. Sabzi va qovoqdagi beta-karotin organizmda A vitaminiga aylanadi. Muvozanatli ovqatlanish koʻp odamlar uchun yetarli manba boʻladi.",
        },
        {
          title: "Miqdorga eʼtibor bering",
          body: "A vitamini yogʻda eriydi va ortiqcha miqdorda toʻplanishi mumkin, shuning uchun kunlik miqdor qadoqdagi koʻrsatmadan oshirilmaydi. Homilador ayollar va ayrim kasalliklarda qabul qilish shifokor bilan kelishiladi.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен витамин А",
          body: "Витамин А способствует поддержанию нормального зрения, состояния кожи и слизистых оболочек, а также нормальной работе иммунной системы. Он участвует и в обмене железа.",
        },
        {
          title: "Где его взять",
          body: "Ретинол есть в продуктах животного происхождения (печень, яичный желток, молочные продукты). Бета-каротин из моркови и тыквы превращается в организме в витамин А. При разнообразном питании многим людям этих источников хватает.",
        },
        {
          title: "Следите за количеством",
          body: "Витамин А жирорастворимый и при избытке может накапливаться, поэтому суточную дозу не превышают. Беременным и при некоторых заболеваниях приём согласуют с врачом.",
        },
      ],
    },
    bullets: {
      uz: [
        "Normal koʻrishni saqlashga hissa",
        "Teri va shilliq qavatlarni saqlashga hissa",
        "Immun tizimining normal ishlashiga hissa",
        "Temir almashinuvida ishtirok",
      ],
      ru: [
        "Вклад в поддержание нормального зрения",
        "Вклад в поддержание кожи и слизистых",
        "Вклад в нормальную работу иммунной системы",
        "Участие в обмене железа",
      ],
    },
    ingredientSlugs: ["zinc", "vitamin-c"],
    productSlugs: [
      "swiss-energy-visiovit-30",
      "dr-frei-gold-vitamins-20",
      "dr-frei-multivitamins-biotin-20",
      "dr-frei-kids-multivitamins-20",
    ],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-e", "vitamin-a-e", "lutein", "multivitamins"],
    faq: {
      uz: [
        {
          question: "Vitamin A va retinol bir narsami?",
          answer: "Retinol — vitamin A ning hayvon manbalaridagi shakli. Oʻsimliklardagi beta-karotin organizmda A vitaminiga aylanadi.",
        },
        {
          question: "Vitamin A ni qachon ichish yaxshi?",
          answer: "Yogʻda eriydigan vitamin boʻlgani uchun uni ovqat bilan ichish qulay. Miqdorni qadoq koʻrsatmasidan oshirmang.",
        },
        {
          question: "Homiladorlikda vitamin A ichsa boʻladimi?",
          answer: "Bu holatda A vitamini miqdori shifokor bilan kelishiladi, chunki ortiqcha miqdor tavsiya etilmaydi.",
        },
      ],
      ru: [
        {
          question: "Витамин А и ретинол — это одно и то же?",
          answer: "Ретинол — форма витамина А из продуктов животного происхождения. Бета-каротин из растений превращается в организме в витамин А.",
        },
        {
          question: "Когда лучше принимать витамин А?",
          answer: "Он жирорастворимый, поэтому удобнее принимать его во время еды. Не превышайте дозу из инструкции на упаковке.",
        },
        {
          question: "Можно ли принимать витамин А при беременности?",
          answer: "В этом случае количество витамина А согласуют с врачом: избыток не рекомендуется.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-e",
    name: { uz: "Vitamin E (tokoferol)", ru: "Витамин Е (токоферол)" },
    headline: {
      uz: "Hujayralarni oksidlovchi stressdan himoyalashga hissa qoʻshadigan vitamin",
      ru: "Витамин, который вносит вклад в защиту клеток от окислительного стресса",
    },
    intro: {
      uz: "Vitamin E (tokoferol) hujayralarni oksidlovchi stressdan himoyalashga hissa qoʻshadi. Manbalari va qabul qilish tartibi.",
      ru: "Витамин Е (токоферол) вносит вклад в защиту клеток от окислительного стресса. Источники и порядок приёма.",
    },
    sections: {
      uz: [
        {
          title: "Vitamin E nima uchun kerak",
          body: "Tokoferol antioksidant vitamin: u hujayralarni oksidlovchi stressdan himoyalashga hissa qoʻshadi. Yogʻda eriydi va hujayra membranalarida joylashadi.",
        },
        {
          title: "Qayerdan olinadi",
          body: "Vitamin E oʻsimlik moylarida, yongʻoqlarda, urugʻlarda va koʻk bargli sabzavotlarda koʻp. Kundalik ovqatlanishda bu mahsulotlar yetarli boʻlsa, qoʻshimcha kerak boʻlmasligi mumkin.",
        },
        {
          title: "Qanday qabul qilinadi",
          body: "Yogʻda eriydigan vitamin sifatida ovqat bilan ichish qulay. Dr. Frei Multivitamins + Biotin, Dr. Frei Gold Vitaminlar va Swiss Energy Visiovit tarkibida bir dozada 12 mg vitamin E bor.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен витамин Е",
          body: "Токоферол — антиоксидантный витамин: он вносит вклад в защиту клеток от окислительного стресса. Растворяется в жирах и встраивается в мембраны клеток.",
        },
        {
          title: "Где его взять",
          body: "Много витамина Е в растительных маслах, орехах, семенах и зелёных листовых овощах. Если в рационе есть эти продукты, добавка может и не понадобиться.",
        },
        {
          title: "Как принимать",
          body: "Как жирорастворимый витамин, удобнее принимать его во время еды. В Dr. Frei Multivitamins + Biotin, Dr. Frei Gold Vitamins и Swiss Energy Visiovit в одной дозе содержится 12 мг витамина Е.",
        },
      ],
    },
    bullets: {
      uz: [
        "Hujayralarni oksidlovchi stressdan himoyalashga hissa",
        "Yogʻda eriydigan antioksidant vitamin",
        "Oʻsimlik moylari va yongʻoqlarda uchraydi",
        "Multivitamin komplekslarining tarkibida",
      ],
      ru: [
        "Вклад в защиту клеток от окислительного стресса",
        "Жирорастворимый антиоксидантный витамин",
        "Содержится в растительных маслах и орехах",
        "Входит в состав мультивитаминных комплексов",
      ],
    },
    ingredientSlugs: ["vitamin-c"],
    productSlugs: [
      "dr-frei-multivitamins-biotin-20",
      "dr-frei-gold-vitamins-20",
      "swiss-energy-visiovit-30",
      "dr-frei-kids-multivitamins-20",
    ],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-a", "vitamin-a-e", "vitamin-c", "multivitamins"],
    faq: {
      uz: [
        {
          question: "Vitamin E va tokoferol bir narsami?",
          answer: "Ha, tokoferol — vitamin E ning kimyoviy nomi.",
        },
        {
          question: "Vitamin E ni qachon ichish kerak?",
          answer: "Yogʻda eriydigani uchun ovqat bilan ichish qulay. Miqdorni qadoqdagi koʻrsatma boʻyicha qabul qiling.",
        },
        {
          question: "Vitamin E ni A vitamini bilan birga ichsa boʻladimi?",
          answer: "Koʻp komplekslarda ular birga uchraydi. Alohida qoʻshimchalarni birlashtirsangiz, umumiy miqdor kunlik meʼyordan oshmasligini tekshiring.",
        },
      ],
      ru: [
        {
          question: "Витамин Е и токоферол — это одно и то же?",
          answer: "Да, токоферол — химическое название витамина Е.",
        },
        {
          question: "Когда принимать витамин Е?",
          answer: "Он жирорастворимый, поэтому удобнее принимать его во время еды. Дозу берите по инструкции на упаковке.",
        },
        {
          question: "Можно ли принимать витамин Е вместе с витамином А?",
          answer: "Во многих комплексах они входят вместе. Если сочетаете отдельные добавки, проверьте, чтобы суммарное количество не превышало суточную норму.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-a-e",
    name: { uz: "Vitamin A + E (Aevit)", ru: "Витамины А + Е (аевит)" },
    headline: {
      uz: "A va E vitaminlari birga: qaysi qoʻshimchalarda bor",
      ru: "Витамины А и Е вместе: в каких добавках они есть",
    },
    intro: {
      uz: "Aevit — A va E vitaminlarining qoʻshilmasi. Bu sahifada ularning vazifasi va A + E saqlovchi biologik faol qoʻshimchalar haqida.",
      ru: "Аевит — сочетание витаминов А и Е. Здесь — зачем нужны эти витамины и в каких БАД они содержатся вместе.",
    },
    sections: {
      uz: [
        {
          title: "Aevit nima",
          body: "Aevit — dorixonalarda sotiladigan A va E vitaminlari kombinatsiyasining nomi, u dori vositasi hisoblanadi. Biz dori sotmaymiz: pastda A va E vitaminlari bor biologik faol qoʻshimchalar koʻrsatilgan.",
        },
        {
          title: "A va E vitaminlari nima uchun birga uchraydi",
          body: "Ikkalasi ham yogʻda eriydi. Vitamin A normal koʻrish, teri va immun tizimiga hissa qoʻshadi, vitamin E esa hujayralarni oksidlovchi stressdan himoyalashga hissa qoʻshadi.",
        },
        {
          title: "Qabul qilish qoidalari",
          body: "Yogʻda eriydigan vitaminlar ovqat bilan ichiladi. A vitaminining ortiqcha miqdori toʻplanishi mumkin, shuning uchun kunlik miqdorni oshirmang. Homiladorlikda va surunkali kasalliklarda shifokor bilan kelishing.",
        },
      ],
      ru: [
        {
          title: "Что такое аевит",
          body: "Аевит — название аптечной комбинации витаминов А и Е, это лекарственное средство. Мы лекарства не продаём: ниже — БАД, в составе которых есть витамины А и Е.",
        },
        {
          title: "Почему витамины А и Е часто идут вместе",
          body: "Оба жирорастворимы. Витамин А способствует нормальному зрению, состоянию кожи и работе иммунной системы, а витамин Е вносит вклад в защиту клеток от окислительного стресса.",
        },
        {
          title: "Правила приёма",
          body: "Жирорастворимые витамины принимают во время еды. Избыток витамина А может накапливаться, поэтому суточную дозу не превышают. При беременности и хронических заболеваниях приём согласуют с врачом.",
        },
      ],
    },
    bullets: {
      uz: [
        "A va E vitaminlari bir qadoqda",
        "Ikkalasi ham yogʻda eriydi",
        "Ovqat bilan ichish qulay",
        "Aevit — dori; bu yerda esa biologik faol qoʻshimchalar",
      ],
      ru: [
        "Витамины А и Е в одной упаковке",
        "Оба витамина жирорастворимые",
        "Удобнее принимать во время еды",
        "Аевит — лекарство; здесь — биологически активные добавки",
      ],
    },
    ingredientSlugs: ["zinc"],
    productSlugs: ["swiss-energy-visiovit-30", "dr-frei-gold-vitamins-20", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-a", "vitamin-e", "lutein", "multivitamins"],
    faq: {
      uz: [
        {
          question: "Aevit va bu yerdagi qoʻshimchalar bir narsami?",
          answer: "Yoʻq. Aevit — dori vositasi. Bu yerdagi mahsulotlar biologik faol qoʻshimcha boʻlib, A va E vitaminlari boshqa moddalar bilan birga keladi.",
        },
        {
          question: "A va E vitaminlarini birga ichish mumkinmi?",
          answer: "Koʻp komplekslarda ular birga uchraydi. Alohida mahsulotlarni qoʻshganda umumiy miqdor kunlik meʼyordan oshmasin.",
        },
      ],
      ru: [
        {
          question: "Аевит и эти добавки — одно и то же?",
          answer: "Нет. Аевит — лекарственное средство. Здесь представлены БАД, где витамины А и Е входят вместе с другими веществами.",
        },
        {
          question: "Можно ли принимать витамины А и Е вместе?",
          answer: "Во многих комплексах они входят вместе. Если сочетаете отдельные продукты, следите, чтобы общее количество не превышало суточную норму.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "biotin",
    name: { uz: "Biotin (B7, H vitamini)", ru: "Биотин (B7, витамин H)" },
    headline: {
      uz: "Soch, teri va energiya almashinuvi uchun B7 vitamini",
      ru: "Витамин B7 для волос, кожи и энергетического обмена",
    },
    intro: {
      uz: "Biotin (B7) sochning, terining normal holatini saqlashga va energiya almashinuviga hissa qoʻshadi. Dozalari va tanlash qoidalari.",
      ru: "Биотин (B7) способствует поддержанию нормального состояния волос и кожи и энергетическому обмену. Дозировки и как выбрать.",
    },
    sections: {
      uz: [
        {
          title: "Biotin nima uchun kerak",
          body: "Biotin sochning va terining normal holatini saqlashga, energiya almashinuviga va asab tizimining normal ishlashiga hissa qoʻshadi. Natija bir kunda emas, muntazam qabul qilgandan keyin baholanadi.",
        },
        {
          title: "Dozalar: qadoqda nima yozilgan",
          body: "Swiss Energy Hair, Nail & Skin 30 tarkibida bir dozada 150 mkg biotin bor, Dr. Frei Multivitamins + Biotin 20 da — 50 mkg, Dr. Frei Kids Multivitamins 20 da — 70 mkg. Biotin B guruhi komplekslariga ham kiradi (Swiss Energy NeuroForce 30).",
        },
        {
          title: "Soch va tirnoq uchun komplekslar",
          body: "Biotin odatda boshqa moddalar bilan birga beriladi: Hair, Nail & Skin tarkibida sink, B5, B3, B6, L-sistein va L-metionin ham bor. Soch toʻkilishi kuchaygan boʻlsa, avval shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен биотин",
          body: "Биотин способствует поддержанию нормального состояния волос и кожи, энергетическому обмену и нормальной работе нервной системы. Оценивать результат стоит после регулярного приёма, а не за один день.",
        },
        {
          title: "Дозировки: что указано на упаковке",
          body: "В Swiss Energy Hair, Nail & Skin 30 в одной дозе 150 мкг биотина, в Dr. Frei Multivitamins + Biotin 20 — 50 мкг, в Dr. Frei Kids Multivitamins 20 — 70 мкг. Биотин входит и в комплексы витаминов группы B (Swiss Energy NeuroForce 30).",
        },
        {
          title: "Комплексы для волос и ногтей",
          body: "Обычно биотин сочетают с другими веществами: в Hair, Nail & Skin также есть цинк, B5, B3, B6, L-цистеин и L-метионин. Если выпадение волос усилилось, сначала обратитесь к врачу.",
        },
      ],
    },
    bullets: {
      uz: [
        "Sochning normal holatini saqlashga hissa",
        "Terining normal holatini saqlashga hissa",
        "Normal energiya almashinuviga hissa",
        "Asab tizimining normal ishlashiga hissa",
      ],
      ru: [
        "Вклад в поддержание нормального состояния волос",
        "Вклад в поддержание нормального состояния кожи",
        "Вклад в нормальный энергетический обмен",
        "Вклад в нормальную работу нервной системы",
      ],
    },
    ingredientSlugs: ["biotin"],
    productSlugs: [
      "swiss-energy-hair-nail-skin-30",
      "dr-frei-multivitamins-biotin-20",
      "dr-frei-kids-multivitamins-20",
      "swiss-energy-neuroforce-30",
    ],
    categorySlugs: ["beauty", "vitamins"],
    relatedSlugs: ["beauty", "hair-loss", "collagen", "zinc"],
    faq: {
      uz: [
        {
          question: "Biotin qancha vaqtdan keyin taʼsir qiladi?",
          answer: "Biotin tez natija beradigan vosita emas: soch va tirnoq asta-sekin yangilanadi, shuning uchun muntazam qabul qilish kerak. Muddatni qadoq koʻrsatmasi belgilaydi.",
        },
        {
          question: "Biotin tahlil natijasiga taʼsir qiladimi?",
          answer: "Biotin ayrim laboratoriya tahlillari natijasini buzishi mumkin. Tahlil topshirishdan oldin shifokor yoki laborantga biotin ichayotganingizni ayting.",
        },
        {
          question: "Biotinni qachon ichish kerak?",
          answer: "Odatda kuniga bir marta, ovqat bilan. Aniq tartib mahsulot qadogʻida yozilgan.",
        },
      ],
      ru: [
        {
          question: "Через сколько проявляется эффект биотина?",
          answer: "Биотин не даёт быстрого результата: волосы и ногти обновляются постепенно, поэтому его принимают регулярно. Срок указан в инструкции на упаковке.",
        },
        {
          question: "Влияет ли биотин на результаты анализов?",
          answer: "Биотин может исказить результаты некоторых лабораторных анализов. Перед сдачей анализов сообщите врачу или лаборанту, что принимаете биотин.",
        },
        {
          question: "Когда принимать биотин?",
          answer: "Обычно один раз в день во время еды. Точная схема указана на упаковке продукта.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "selenium",
    name: { uz: "Selen", ru: "Селен" },
    headline: {
      uz: "Soch, tirnoq, qalqonsimon bez va immun tizimi uchun mineral",
      ru: "Микроэлемент для волос, ногтей, щитовидной железы и иммунитета",
    },
    intro: {
      uz: "Selen — mikroelement: sochning va tirnoqning normal holatini, qalqonsimon bez va immun tizimi ishini saqlashga hissa qoʻshadi.",
      ru: "Селен — микроэлемент: способствует поддержанию нормального состояния волос и ногтей, работе щитовидной железы и иммунной системы.",
    },
    sections: {
      uz: [
        {
          title: "Selen nima uchun kerak",
          body: "Selen sochning va tirnoqlarning normal holatini saqlashga, qalqonsimon bez va immun tizimining normal ishlashiga hissa qoʻshadi. Shuningdek, hujayralarni oksidlovchi stressdan himoyalashga hissa qoʻshadi.",
        },
        {
          title: "Qayerdan olinadi",
          body: "Selen baliq va dengiz mahsulotlarida, goʻshtda, tuxumda, yongʻoqlarda (ayniqsa Braziliya yongʻogʻida) va don mahsulotlarida uchraydi. Tuproqdagi miqdorga qarab oziq-ovqatdagi selen turlicha boʻladi.",
        },
        {
          title: "Miqdorga ehtiyot boʻling",
          body: "Selenning foydali va ortiqcha miqdori orasidagi farq kichik, shuning uchun kunlik miqdorni qadoqdagi koʻrsatmadan oshirmang. Bir nechta komplekslarni birga ichsangiz, umumiy miqdorni hisoblang. Swiss Energy Prenatal Forte 60 tarkibida selen bor.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен селен",
          body: "Селен способствует поддержанию нормального состояния волос и ногтей, нормальной работе щитовидной железы и иммунной системы. Кроме того, он вносит вклад в защиту клеток от окислительного стресса.",
        },
        {
          title: "Где его взять",
          body: "Селен есть в рыбе и морепродуктах, мясе, яйцах, орехах (особенно в бразильском) и зерновых. Количество селена в продуктах зависит от почвы, на которой они выросли.",
        },
        {
          title: "Осторожно с количеством",
          body: "Разница между полезным и избыточным количеством селена небольшая, поэтому не превышайте суточную дозу из инструкции. Если принимаете несколько комплексов, считайте общее количество. В Swiss Energy Prenatal Forte 60 селен входит в состав.",
        },
      ],
    },
    bullets: {
      uz: [
        "Sochning normal holatini saqlashga hissa",
        "Tirnoqlarning normal holatini saqlashga hissa",
        "Qalqonsimon bezning normal ishlashiga hissa",
        "Immun tizimining normal ishlashiga hissa",
      ],
      ru: [
        "Вклад в поддержание нормального состояния волос",
        "Вклад в поддержание нормального состояния ногтей",
        "Вклад в нормальную работу щитовидной железы",
        "Вклад в нормальную работу иммунной системы",
      ],
    },
    ingredientSlugs: ["zinc"],
    productSlugs: ["swiss-energy-prenatal-forte-60"],
    categorySlugs: ["minerals", "vitamins"],
    relatedSlugs: ["zinc", "hair-loss", "immunity", "beauty"],
    faq: {
      uz: [
        {
          question: "Selenni qaysi mahsulotlardan olish mumkin?",
          answer: "Baliq, dengiz mahsulotlari, goʻsht, tuxum, yongʻoq va don mahsulotlaridan. Muvozanatli ovqatlanishda koʻp odamlarga yetarli boʻladi.",
        },
        {
          question: "Selenni har kuni ichsa boʻladimi?",
          answer: "Faqat qadoqdagi kunlik miqdor doirasida. Ortiqcha selen zararli, shuning uchun bir nechta qoʻshimchalarni birga ichsangiz, umumiy miqdorni tekshiring.",
        },
      ],
      ru: [
        {
          question: "В каких продуктах есть селен?",
          answer: "В рыбе, морепродуктах, мясе, яйцах, орехах и зерновых. При разнообразном питании многим людям его хватает.",
        },
        {
          question: "Можно ли принимать селен каждый день?",
          answer: "Только в рамках суточной дозы с упаковки. Избыток селена вреден, поэтому при приёме нескольких добавок проверяйте общее количество.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-k2",
    name: { uz: "Vitamin K2", ru: "Витамин K2" },
    headline: {
      uz: "Suyaklar va qon ivishi uchun; D3 va kalsiy bilan birga",
      ru: "Для костей и свёртывания крови; вместе с D3 и кальцием",
    },
    intro: {
      uz: "Vitamin K normal qon ivishiga va suyaklarning normal holatini saqlashga hissa qoʻshadi. K2 koʻpincha D3 va kalsiy bilan birga beriladi.",
      ru: "Витамин K способствует нормальной свёртываемости крови и поддержанию костей. K2 часто сочетают с D3 и кальцием.",
    },
    sections: {
      uz: [
        {
          title: "Vitamin K2 nima uchun kerak",
          body: "Vitamin K normal qon ivishiga va suyaklarning normal holatini saqlashga hissa qoʻshadi. K2 (menaxinon) — shu vitaminning shakllaridan biri, u fermentlangan mahsulotlarda va hayvon manbalarida uchraydi.",
        },
        {
          title: "Nega D3 va kalsiy bilan birga",
          body: "D3 vitamini kalsiyning normal oʻzlashtirilishiga hissa qoʻshadi, kalsiy esa suyaklarning mineral asosi. Shu uchun K2, D3 va kalsiy koʻpincha bir kompleksda uchraydi. Swiss Energy Calcivit 30 tarkibida kalsiy, D3, K2, sink va B guruhi vitaminlari bor.",
        },
        {
          title: "Kimlar shifokor bilan kelishadi",
          body: "Vitamin K qon ivishiga taʼsir qiladi, shuning uchun qon suyultiruvchi dori qabul qilayotganlar K vitaminli qoʻshimchani faqat shifokor bilan kelishgan holda ichadi.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен витамин K2",
          body: "Витамин K способствует нормальной свёртываемости крови и поддержанию нормального состояния костей. K2 (менахинон) — одна из форм этого витамина, она есть в ферментированных продуктах и источниках животного происхождения.",
        },
        {
          title: "Почему его сочетают с D3 и кальцием",
          body: "Витамин D3 способствует нормальному усвоению кальция, а кальций — минеральная основа костей. Поэтому K2, D3 и кальций часто встречаются в одном комплексе. В Swiss Energy Calcivit 30 есть кальций, D3, K2, цинк и витамины группы B.",
        },
        {
          title: "Кому нужно согласовать приём с врачом",
          body: "Витамин K влияет на свёртываемость крови, поэтому тем, кто принимает препараты для разжижения крови, добавки с витамином K можно принимать только по согласованию с врачом.",
        },
      ],
    },
    bullets: {
      uz: [
        "Normal qon ivishiga hissa",
        "Suyaklarning normal holatini saqlashga hissa",
        "D3 va kalsiy bilan birga beriladi",
        "Qon suyultiruvchi dori ichsangiz — shifokor bilan kelishing",
      ],
      ru: [
        "Вклад в нормальную свёртываемость крови",
        "Вклад в поддержание нормального состояния костей",
        "Сочетается с D3 и кальцием",
        "Если принимаете препараты для разжижения крови — согласуйте с врачом",
      ],
    },
    ingredientSlugs: ["vitamin-k2", "vitamin-d3", "calcium"],
    productSlugs: ["swiss-energy-calcivit-30", "swiss-energy-prenatal-forte-60"],
    categorySlugs: ["minerals", "vitamins"],
    relatedSlugs: ["vitamin-d3", "calcium", "joints", "magnesium"],
    faq: {
      uz: [
        {
          question: "D3 va K2 ni birga ichish kerakmi?",
          answer: "Koʻp komplekslarda ular birga uchraydi, chunki D3 kalsiyning oʻzlashtirilishiga, K esa suyaklarning normal holatiga hissa qoʻshadi. Alohida ichish ham mumkin; miqdorni qadoqdan oling.",
        },
        {
          question: "K2 ni qachon ichish yaxshi?",
          answer: "Yogʻda eriydigan vitamin boʻlgani uchun uni ovqat bilan ichish qulay.",
        },
        {
          question: "K2 va K1 farqi nimada?",
          answer: "Ikkalasi ham K vitaminining shakllari: K1 koʻk bargli sabzavotlarda, K2 fermentlangan mahsulotlarda va hayvon manbalarida koʻproq.",
        },
      ],
      ru: [
        {
          question: "Нужно ли принимать D3 и K2 вместе?",
          answer: "Во многих комплексах они идут вместе: D3 способствует усвоению кальция, а K — нормальному состоянию костей. Можно принимать и по отдельности; дозу берите с упаковки.",
        },
        {
          question: "Когда лучше принимать K2?",
          answer: "Это жирорастворимый витамин, поэтому удобнее принимать его во время еды.",
        },
        {
          question: "Чем K2 отличается от K1?",
          answer: "Это формы витамина K: K1 больше в зелёных листовых овощах, K2 — в ферментированных продуктах и источниках животного происхождения.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "multivitamins",
    name: { uz: "Multivitaminlar", ru: "Мультивитамины" },
    headline: {
      uz: "Bir qadoqda vitaminlar kompleksi: qanday tanlash kerak",
      ru: "Комплекс витаминов в одной упаковке: как выбрать",
    },
    intro: {
      uz: "Multivitaminlar bir qadoqda bir nechta vitamin va mineral beradi. Tarkib, miqdor va format boʻyicha tanlash qoidalari.",
      ru: "Мультивитамины дают несколько витаминов и минералов в одной упаковке. Как выбрать по составу, дозировке и формату.",
    },
    sections: {
      uz: [
        {
          title: "Multivitamin kimga kerak",
          body: "Multivitamin xilma-xil ovqatlanishni almashtirmaydi, uni toʻldiradi. Ratsion cheklangan boʻlsa yoki mavsumda vitamin kam tushsa, kunlik meʼyor atrofidagi komplekslar qulay.",
        },
        {
          title: "Tarkibni qanday oʻqish kerak",
          body: "Qadoqdagi har bir vitamin yonida kunlik meʼyorga nisbatan foiz yoziladi. 100% atrofidagi miqdor odatiy kunlik ehtiyojga mos keladi; juda yuqori dozalardan ehtiyot boʻling va bir necha qoʻshimchani birga ichganda umumiy miqdorni hisoblang.",
        },
        {
          title: "Format va yosh",
          body: "Dr. Frei Multivitamins + Biotin 20 va Dr. Frei Gold Vitaminlar — shipuchi tabletkalar, Multivitamins + Biotin 14 yoshdan boshlab. Dr. Frei Kids Multivitamins 20 bolalar uchun, Swiss Energy Prenatal Forte 60 esa 20 vitamin va mineral saqlaydi. Yosh chegarasini qadoqdan tekshiring.",
        },
      ],
      ru: [
        {
          title: "Кому подходят мультивитамины",
          body: "Мультивитамины не заменяют разнообразное питание, а дополняют его. Если рацион ограничен или в сезон витаминов поступает меньше, удобны комплексы с дозами около суточной нормы.",
        },
        {
          title: "Как читать состав",
          body: "Рядом с каждым витамином на упаковке указан процент от суточной нормы. Количество около 100% соответствует обычной суточной потребности; осторожнее с очень высокими дозами, а при приёме нескольких добавок считайте общее количество.",
        },
        {
          title: "Формат и возраст",
          body: "Dr. Frei Multivitamins + Biotin 20 и Dr. Frei Gold Vitamins — шипучие таблетки, Multivitamins + Biotin — с 14 лет. Dr. Frei Kids Multivitamins 20 — для детей, а Swiss Energy Prenatal Forte 60 содержит 20 витаминов и минералов. Возрастные ограничения проверяйте на упаковке.",
        },
      ],
    },
    bullets: {
      uz: [
        "Bir qadoqda bir nechta vitamin va mineral",
        "Xilma-xil ovqatlanishni toʻldiradi",
        "Shipuchi va boshqa formatlar",
        "Katta yoshlilar, bolalar va homilador ayollar uchun alohida variantlar",
      ],
      ru: [
        "Несколько витаминов и минералов в одной упаковке",
        "Дополняют разнообразное питание",
        "Шипучие и другие форматы",
        "Отдельные варианты для взрослых, детей и беременных",
      ],
    },
    ingredientSlugs: ["vitamin-c", "vitamin-d3", "zinc"],
    productSlugs: [
      "dr-frei-multivitamins-biotin-20",
      "dr-frei-gold-vitamins-20",
      "dr-frei-kids-multivitamins-20",
      "swiss-energy-prenatal-forte-60",
    ],
    categorySlugs: ["vitamins", "effervescent"],
    relatedSlugs: ["immunity", "energy", "vitamin-c", "vitamin-d3"],
    faq: {
      uz: [
        {
          question: "Multivitaminni har kuni ichsa boʻladimi?",
          answer: "Kunlik qabul uchun moʻljallangan komplekslarni qadoqdagi koʻrsatma boʻyicha ichish mumkin. Miqdorni oshirmang.",
        },
        {
          question: "Multivitaminni qachon ichish yaxshi?",
          answer: "Koʻpincha ertalab, ovqat bilan yoki ovqatdan keyin. Aniq tartib har bir mahsulot qadogʻida yozilgan.",
        },
        {
          question: "Multivitamin ovqatlanishni almashtiradimi?",
          answer: "Yoʻq. U xilma-xil ovqatlanishni toʻldiradi, lekin uning oʻrnini bosmaydi.",
        },
      ],
      ru: [
        {
          question: "Можно ли принимать мультивитамины каждый день?",
          answer: "Комплексы, рассчитанные на ежедневный приём, принимают по инструкции на упаковке. Дозу не увеличивайте.",
        },
        {
          question: "Когда лучше принимать мультивитамины?",
          answer: "Чаще всего утром, во время еды или после неё. Точная схема указана на упаковке каждого продукта.",
        },
        {
          question: "Заменяют ли мультивитамины питание?",
          answer: "Нет. Они дополняют разнообразное питание, но не заменяют его.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-b-complex",
    name: { uz: "B guruhi vitaminlari", ru: "Витамины группы B" },
    headline: {
      uz: "Energiya almashinuvi va asab tizimi uchun B vitaminlari kompleksi",
      ru: "Комплекс витаминов B для энергетического обмена и нервной системы",
    },
    intro: {
      uz: "B guruhi vitaminlari energiya almashinuvi va asab tizimining normal ishlashiga hissa qoʻshadi. Komplekslar va tanlash qoidalari.",
      ru: "Витамины группы B способствуют энергетическому обмену и нормальной работе нервной системы. Комплексы и правила выбора.",
    },
    sections: {
      uz: [
        {
          title: "B guruhiga qaysi vitaminlar kiradi",
          body: "B1 (tiamin), B2 (riboflavin), B3 (niatsin), B5 (pantoten kislota), B6 (piridoksin), B7 (biotin), B9 (folat) va B12 (kobalamin). Ular suvda eriydi, organizmda zaxira boʻlib toʻplanmaydi va ovqat bilan muntazam tushib turishi kerak.",
        },
        {
          title: "B vitaminlari nima uchun kerak",
          body: "B guruhi vitaminlari normal energiya almashinuviga, asab tizimining normal ishlashiga va psixologik funksiyalarga hissa qoʻshadi. Bir qancha B vitaminlari charchoqni kamaytirishga ham hissa qoʻshadi.",
        },
        {
          title: "Qaysi komplekslar bor",
          body: "Swiss Energy NeuroForce 30 tarkibida B1, B2, B3, B5, B6, B7, B9 va B12 bor. B vitaminlari Dr. Frei Multivitamins + Biotin 20 va Swiss Energy Hair, Nail & Skin 30 tarkibiga ham kiradi.",
        },
      ],
      ru: [
        {
          title: "Какие витамины входят в группу B",
          body: "B1 (тиамин), B2 (рибофлавин), B3 (ниацин), B5 (пантотеновая кислота), B6 (пиридоксин), B7 (биотин), B9 (фолат) и B12 (кобаламин). Они водорастворимы, не накапливаются в запас и должны регулярно поступать с пищей.",
        },
        {
          title: "Для чего нужны витамины B",
          body: "Витамины группы B способствуют нормальному энергетическому обмену, нормальной работе нервной системы и психологическим функциям. Ряд витаминов B также способствует снижению усталости.",
        },
        {
          title: "Какие комплексы есть",
          body: "В Swiss Energy NeuroForce 30 входят B1, B2, B3, B5, B6, B7, B9 и B12. Витамины B есть также в Dr. Frei Multivitamins + Biotin 20 и Swiss Energy Hair, Nail & Skin 30.",
        },
      ],
    },
    bullets: {
      uz: [
        "Normal energiya almashinuviga hissa",
        "Asab tizimining normal ishlashiga hissa",
        "Normal psixologik funksiyalarga hissa",
        "Charchoqni kamaytirishga hissa",
      ],
      ru: [
        "Вклад в нормальный энергетический обмен",
        "Вклад в нормальную работу нервной системы",
        "Вклад в нормальные психологические функции",
        "Вклад в снижение усталости",
      ],
    },
    ingredientSlugs: ["vitamin-b12", "biotin"],
    productSlugs: [
      "swiss-energy-neuroforce-30",
      "dr-frei-multivitamins-biotin-20",
      "swiss-energy-hair-nail-skin-30",
      "dr-frei-kids-multivitamins-20",
    ],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-b12", "vitamin-b6", "vitamin-b1", "energy", "fatigue", "brain"],
    faq: {
      uz: [
        {
          question: "B vitaminlarini qachon ichish yaxshi?",
          answer: "Koʻpincha ertalab yoki kunning birinchi yarmida, ovqat bilan. Aniq tartib qadoqda yozilgan.",
        },
        {
          question: "B kompleksni har kuni ichsa boʻladimi?",
          answer: "Kunlik qabul uchun moʻljallangan mahsulotlarni qadoqdagi koʻrsatma boʻyicha ichish mumkin. Miqdorni oshirmang.",
        },
        {
          question: "B vitaminlari nega birga beriladi?",
          answer: "Ular organizmda bir-biriga bogʻliq jarayonlarda ishtirok etadi, shuning uchun koʻpincha kompleks tarzida ishlab chiqariladi.",
        },
      ],
      ru: [
        {
          question: "Когда лучше принимать витамины B?",
          answer: "Чаще всего утром или в первой половине дня, во время еды. Точная схема указана на упаковке.",
        },
        {
          question: "Можно ли принимать комплекс B каждый день?",
          answer: "Продукты, рассчитанные на ежедневный приём, принимают по инструкции на упаковке. Дозу не увеличивайте.",
        },
        {
          question: "Почему витамины B часто идут комплексом?",
          answer: "Они участвуют во взаимосвязанных процессах организма, поэтому их часто выпускают в виде комплекса.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-b6",
    name: { uz: "Vitamin B6 (piridoksin)", ru: "Витамин B6 (пиридоксин)" },
    headline: {
      uz: "Asab tizimi, oqsil almashinuvi va qon hosil boʻlishi uchun",
      ru: "Для нервной системы, белкового обмена и образования крови",
    },
    intro: {
      uz: "Vitamin B6 asab tizimining normal ishlashiga, oqsil almashinuviga va qizil qon tanachalari hosil boʻlishiga hissa qoʻshadi.",
      ru: "Витамин B6 способствует нормальной работе нервной системы, белковому обмену и образованию эритроцитов.",
    },
    sections: {
      uz: [
        {
          title: "Vitamin B6 nima uchun kerak",
          body: "Piridoksin oqsil va glikogen almashinuviga, qizil qon tanachalarining normal hosil boʻlishiga va asab tizimining normal ishlashiga hissa qoʻshadi. U charchoqni kamaytirishga va gormonal faollikni tartibga solishga ham hissa qoʻshadi.",
        },
        {
          title: "B6 va magniy: nega birga",
          body: "B6 va magniy koʻpincha bir mahsulotda beriladi. Dr. Frei Antistress Magniy B6 20 tarkibida bir dozada 100 mg magniy, 2 mg vitamin B6, 100 mg taurin, 80 mg vitamin C va 30 mkg vitamin K bor. B6 Swiss Energy Hair, Nail & Skin 30 va NeuroForce 30 tarkibiga ham kiradi.",
        },
        {
          title: "Miqdorni oshirmang",
          body: "B6 vitaminini uzoq muddat yuqori dozada ichish tavsiya etilmaydi. Kunlik miqdorni qadoqdagi koʻrsatmadan oshirmang va bir nechta B6 saqlovchi mahsulotni birga ichsangiz, umumiy miqdorni hisoblang.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен витамин B6",
          body: "Пиридоксин способствует белковому и гликогеновому обмену, нормальному образованию эритроцитов и нормальной работе нервной системы. Он также способствует снижению усталости и регуляции гормональной активности.",
        },
        {
          title: "B6 и магний: почему вместе",
          body: "B6 и магний часто входят в один продукт. В Dr. Frei Antistress Magniy B6 20 в одной дозе 100 мг магния, 2 мг витамина B6, 100 мг таурина, 80 мг витамина C и 30 мкг витамина K. B6 также есть в Swiss Energy Hair, Nail & Skin 30 и NeuroForce 30.",
        },
        {
          title: "Не превышайте дозу",
          body: "Длительный приём витамина B6 в высоких дозах не рекомендуется. Не превышайте суточную дозу из инструкции, а при приёме нескольких продуктов с B6 считайте общее количество.",
        },
      ],
    },
    bullets: {
      uz: [
        "Asab tizimining normal ishlashiga hissa",
        "Oqsil va glikogen almashinuviga hissa",
        "Qizil qon tanachalarining normal hosil boʻlishiga hissa",
        "Charchoqni kamaytirishga hissa",
      ],
      ru: [
        "Вклад в нормальную работу нервной системы",
        "Вклад в белковый и гликогеновый обмен",
        "Вклад в нормальное образование эритроцитов",
        "Вклад в снижение усталости",
      ],
    },
    ingredientSlugs: ["magnesium", "vitamin-b12"],
    productSlugs: [
      "dr-frei-antistress-magniy-20",
      "swiss-energy-hair-nail-skin-30",
      "swiss-energy-neuroforce-30",
      "dr-frei-multivitamins-biotin-20",
    ],
    categorySlugs: ["vitamins", "minerals"],
    relatedSlugs: ["magnesium", "vitamin-b-complex", "stress", "sleep"],
    faq: {
      uz: [
        {
          question: "B6 va magniyni birga ichish mumkinmi?",
          answer: "Ha, ular koʻpincha bir mahsulotda birga beriladi. Dr. Frei Antistress Magniy B6 20 shunday kompleks; miqdorni qadoqdan oling.",
        },
        {
          question: "B6 ni qachon ichish yaxshi?",
          answer: "Odatda ovqat bilan, kunning birinchi yarmida. Aniq tartib qadoqda yozilgan.",
        },
        {
          question: "B6 ni koʻp ichsa nima boʻladi?",
          answer: "Uzoq muddat yuqori dozada qabul qilish tavsiya etilmaydi. Kunlik miqdorni oshirmang, shubha tugʻilsa shifokorga murojaat qiling.",
        },
      ],
      ru: [
        {
          question: "Можно ли принимать B6 и магний вместе?",
          answer: "Да, они часто входят в один продукт. Dr. Frei Antistress Magniy B6 20 — такой комплекс; дозу берите с упаковки.",
        },
        {
          question: "Когда лучше принимать B6?",
          answer: "Обычно во время еды, в первой половине дня. Точная схема указана на упаковке.",
        },
        {
          question: "Что будет, если принимать много B6?",
          answer: "Длительный приём в высоких дозах не рекомендуется. Не превышайте суточную дозу, а при сомнениях обратитесь к врачу.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "vitamin-b1",
    name: { uz: "Vitamin B1 (tiamin)", ru: "Витамин B1 (тиамин)" },
    headline: {
      uz: "Energiya almashinuvi, asab va yurak faoliyati uchun",
      ru: "Для энергетического обмена, нервной системы и работы сердца",
    },
    intro: {
      uz: "Vitamin B1 (tiamin) normal energiya almashinuviga, asab tizimi va yurakning normal ishlashiga hissa qoʻshadi. Manbalari va qadoqdagi dozalar.",
      ru: "Витамин B1 (тиамин) способствует энергетическому обмену, нормальной работе нервной системы и сердца. Источники и дозы на упаковках.",
    },
    sections: {
      uz: [
        {
          title: "Vitamin B1 nima uchun kerak",
          body: "Tiamin uglevodlardan energiya hosil boʻlishida ishtirok etadi. U normal energiya almashinuviga, asab tizimining va yurakning normal ishlashiga hissa qoʻshadi.",
        },
        {
          title: "Qayerdan olinadi",
          body: "Tiamin toʻliq donli mahsulotlarda, dukkaklilarda, goʻshtda (ayniqsa choʻchqa goʻshtida) va yongʻoqlarda uchraydi. Suvda eriydi va zaxira boʻlib toʻplanmaydi, shuning uchun muntazam tushishi kerak.",
        },
        {
          title: "Qaysi mahsulotlarda bor",
          body: "Bir dozada B1 miqdori: Swiss Energy Hair, Nail & Skin 30 — 1,1 mg, Dr. Frei Kids Multivitamins 20 — 1,25 mg. B1 shuningdek Swiss Energy NeuroForce 30 va Dr. Frei Multivitamins + Biotin 20 tarkibiga kiradi.",
        },
      ],
      ru: [
        {
          title: "Для чего нужен витамин B1",
          body: "Тиамин участвует в получении энергии из углеводов. Он способствует нормальному энергетическому обмену, нормальной работе нервной системы и сердца.",
        },
        {
          title: "Где его взять",
          body: "Тиамин есть в цельнозерновых продуктах, бобовых, мясе (особенно свинине) и орехах. Он водорастворим и не накапливается в запас, поэтому должен поступать регулярно.",
        },
        {
          title: "В каких продуктах он есть",
          body: "Количество B1 в одной дозе: Swiss Energy Hair, Nail & Skin 30 — 1,1 мг, Dr. Frei Kids Multivitamins 20 — 1,25 мг. B1 также входит в Swiss Energy NeuroForce 30 и Dr. Frei Multivitamins + Biotin 20.",
        },
      ],
    },
    bullets: {
      uz: [
        "Normal energiya almashinuviga hissa",
        "Asab tizimining normal ishlashiga hissa",
        "Yurakning normal ishlashiga hissa",
        "Suvda eriydi, muntazam tushishi kerak",
      ],
      ru: [
        "Вклад в нормальный энергетический обмен",
        "Вклад в нормальную работу нервной системы",
        "Вклад в нормальную работу сердца",
        "Водорастворим, должен поступать регулярно",
      ],
    },
    ingredientSlugs: ["vitamin-b12"],
    productSlugs: [
      "swiss-energy-neuroforce-30",
      "swiss-energy-hair-nail-skin-30",
      "dr-frei-multivitamins-biotin-20",
      "dr-frei-kids-multivitamins-20",
    ],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-b-complex", "vitamin-b6", "energy", "fatigue"],
    faq: {
      uz: [
        {
          question: "Vitamin B1 va tiamin bir narsami?",
          answer: "Ha, tiamin — vitamin B1 ning kimyoviy nomi.",
        },
        {
          question: "B1 ni qachon ichish kerak?",
          answer: "Odatda ovqat bilan, kunning birinchi yarmida. Aniq tartib qadoqda yozilgan.",
        },
      ],
      ru: [
        {
          question: "Витамин B1 и тиамин — это одно и то же?",
          answer: "Да, тиамин — химическое название витамина B1.",
        },
        {
          question: "Когда принимать B1?",
          answer: "Обычно во время еды, в первой половине дня. Точная схема указана на упаковке.",
        },
      ],
    },
  },
  {
    kind: "vitamin",
    slug: "lutein",
    name: { uz: "Lutein (koʻz uchun)", ru: "Лютеин (для глаз)" },
    headline: {
      uz: "Koʻz torpardasida uchraydigan karotinoid: qanday tanlash kerak",
      ru: "Каротиноид, который есть в сетчатке глаза: как выбрать",
    },
    intro: {
      uz: "Lutein — koʻz toʻr pardasida uchraydigan karotinoid. Komplekslarda u A vitamini, sink va zeaksantin bilan birga beriladi.",
      ru: "Лютеин — каротиноид, который содержится в сетчатке глаза. В комплексах он идёт вместе с витамином А, цинком и зеаксантином.",
    },
    sections: {
      uz: [
        {
          title: "Lutein nima",
          body: "Lutein va zeaksantin — oʻsimliklardagi sariq-toʻq sariq karotinoidlar, ular koʻz toʻr pardasining markaziy qismida uchraydi. Organizm ularni oʻzi hosil qilmaydi, ular ovqat bilan tushadi: koʻk bargli sabzavotlar, makkajoʻxori, tuxum sarigʻi.",
        },
        {
          title: "Komplekslardagi boshqa moddalar",
          body: "Luteinning oʻziga qoʻshimcha rasmiy tasdiqlangan taʼsir daʼvosi yoʻq, shuning uchun biz uni aytmaymiz. Komplekslardagi vitamin A va sink esa normal koʻrishni saqlashga hissa qoʻshadi.",
        },
        {
          title: "Qaysi mahsulotlarda bor",
          body: "Swiss Energy Visiovit 30 tarkibida 10 mg lutein, 2 mg zeaksantin, 80 mg qoraqat (chernika) ekstrakti, 800 mkg vitamin A, 12 mg vitamin E va 10 mg sink bor. Dr. Frei Gold Vitaminlar 20 tarkibida 6 mg lutein, A, C, E vitaminlari va sink bor.",
        },
      ],
      ru: [
        {
          title: "Что такое лютеин",
          body: "Лютеин и зеаксантин — жёлто-оранжевые каротиноиды растений, они находятся в центральной части сетчатки глаза. Организм сам их не вырабатывает, они поступают с пищей: зелёные листовые овощи, кукуруза, яичный желток.",
        },
        {
          title: "Другие вещества в комплексах",
          body: "У самого лютеина нет официально подтверждённого заявления о влиянии на организм, поэтому мы его не приписываем. А витамин А и цинк в составе комплексов способствуют поддержанию нормального зрения.",
        },
        {
          title: "В каких продуктах он есть",
          body: "В Swiss Energy Visiovit 30 — 10 мг лютеина, 2 мг зеаксантина, 80 мг экстракта черники, 800 мкг витамина А, 12 мг витамина Е и 10 мг цинка. В Dr. Frei Gold Vitamins 20 — 6 мг лютеина, витамины А, С, Е и цинк.",
        },
      ],
    },
    bullets: {
      uz: [
        "Koʻz toʻr pardasida uchraydigan karotinoid",
        "Vitamin A va sink normal koʻrishni saqlashga hissa qoʻshadi",
        "Zeaksantin va qoraqat ekstrakti bilan komplekslar",
        "Ekranda koʻp ishlaydiganlar uchun komplekslar",
      ],
      ru: [
        "Каротиноид, который есть в сетчатке глаза",
        "Витамин А и цинк способствуют поддержанию нормального зрения",
        "Комплексы с зеаксантином и экстрактом черники",
        "Комплексы для тех, кто много работает за экраном",
      ],
    },
    ingredientSlugs: ["zinc"],
    productSlugs: ["swiss-energy-visiovit-30", "dr-frei-gold-vitamins-20"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-a", "vitamin-e", "vitamin-a-e", "zinc"],
    faq: {
      uz: [
        {
          question: "Luteinni qachon ichish yaxshi?",
          answer: "Lutein yogʻda eriydi, shuning uchun ovqat bilan ichish qulay. Aniq tartib qadoqda yozilgan.",
        },
        {
          question: "Koʻzim oʻzgarsa, lutein ichsam boʻladimi?",
          answer: "Koʻrish sezilarli oʻzgargan boʻlsa, avval oftalmologga murojaat qiling. Biologik faol qoʻshimcha dori emas va tekshiruvni almashtirmaydi.",
        },
      ],
      ru: [
        {
          question: "Когда лучше принимать лютеин?",
          answer: "Лютеин жирорастворим, поэтому удобнее принимать его во время еды. Точная схема указана на упаковке.",
        },
        {
          question: "Если зрение изменилось, можно ли просто принимать лютеин?",
          answer: "Если зрение заметно изменилось, сначала обратитесь к офтальмологу. БАД не является лекарством и не заменяет обследование.",
        },
      ],
    },
  },
];
