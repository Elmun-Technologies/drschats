import type { Locale } from "@/lib/i18n/routing";

/*
  Editorial copy under each catalogue shelf — the text a category page ranks
  with. Without it every shelf was a product grid plus one templated sentence,
  and sixteen near-identical pages compete with each other instead of with
  other shops.

  Rules the copy follows (CLAUDE.md «Qatʼiy qoidalar»): no medical promise —
  it explains what the shelf holds and how to choose, never what a product
  cures; Uzbek uses ʻ (U+02BB). Kept here rather than in the catalogue so it
  survives the switch to the Shopflow API, which has no field for it. A shelf
  without an entry falls back to the templated sentence.
*/
type Copy = Record<Locale, string[]>;

export const CATEGORY_SEO: Record<string, Copy> = {
  vitamins: {
    uz: [
      "Vitaminlar boʻlimida kundalik ratsionni toʻldirish uchun mono-vitaminlar va komplekslar jamlangan: koʻz, asab tizimi, homiladorlik davri va erkaklar uchun moʻljallangan formulalar. Har bir mahsulot sahifasida tarkib, bir kapsula yoki tabletkadagi miqdor va ishlab chiqaruvchining qoʻllash yoʻriqnomasi berilgan.",
      "Tanlashda avval maqsadni aniqlang, keyin tarkibdagi dozani kundalik meʼyor bilan solishtiring. Bir nechta kompleksni birga ichish ortiqcha dozaga olib kelishi mumkin — shubha boʻlsa, shifokor bilan maslahatlashing yoki 2 daqiqalik testdan oʻting.",
    ],
    ru: [
      "В разделе «Витамины» собраны моновитамины и комплексы для восполнения ежедневного рациона: формулы для зрения, нервной системы, периода беременности и для мужчин. На странице каждого товара указаны состав, количество в одной капсуле или таблетке и инструкция производителя.",
      "При выборе сначала определите цель, затем сравните дозировку с суточной нормой. Одновременный приём нескольких комплексов может привести к избытку — если сомневаетесь, проконсультируйтесь с врачом или пройдите 2-минутный тест.",
    ],
  },
  immunity: {
    uz: [
      "Immunitet boʻlimida mavsumiy davr uchun vitamin C, sink, D vitamini va oʻsimlik ekstraktlari bor komplekslar toʻplangan. Ular ratsionda yetishmaydigan moddalarni toʻldirish uchun moʻljallangan va dori vositasi emas.",
      "Kompleks tanlaganda tarkibdagi har bir moddaning miqdoriga va qabul qilish kursining davomiyligiga eʼtibor bering. Surunkali kasallik yoki doimiy dori qabul qilsangiz, kursni boshlashdan oldin shifokor bilan maslahatlashing.",
    ],
    ru: [
      "В разделе «Иммунитет» — комплексы с витамином C, цинком, витамином D и растительными экстрактами на сезонный период. Они предназначены для восполнения нутриентов, которых не хватает в рационе, и не являются лекарством.",
      "Выбирая комплекс, обращайте внимание на количество каждого вещества и длительность курса. При хронических заболеваниях или постоянном приёме лекарств перед курсом проконсультируйтесь с врачом.",
    ],
  },
  beauty: {
    uz: [
      "Goʻzallik boʻlimida soch, teri va tirnoq uchun komplekslar hamda kollagen mahsulotlari jamlangan. Odatda ularning tarkibida biotin, sink, kremniy, C vitamini va kollagen peptidlari boʻladi — aniq miqdor har bir mahsulot sahifasida koʻrsatilgan.",
      "Bunday mahsulotlar kurs bilan qabul qilinadi, shuning uchun bir oylik qadoq narxini va kunlik dozani solishtirib tanlash qulay. Natija ratsion, uyqu va parvarishga ham bogʻliq.",
    ],
    ru: [
      "В разделе «Красота» — комплексы для волос, кожи и ногтей и продукты с коллагеном. В их составе обычно биотин, цинк, кремний, витамин C и пептиды коллагена — точное количество указано на странице каждого товара.",
      "Такие продукты принимают курсом, поэтому удобно сравнивать цену упаковки на месяц и суточную дозу. Результат зависит также от рациона, сна и ухода.",
    ],
  },
  kids: {
    uz: [
      "Bolalar uchun boʻlimida faqat bolalarga moʻljallangan vitaminlar va qoʻshimchalar bor: yoshiga mos doza, chaynaladigan yoki suvda eriydigan shakllar. Kattalar uchun mahsulotni bolaga berish tavsiya etilmaydi — doza boshqacha.",
      "Har bir mahsulot sahifasida qaysi yoshdan ruxsat etilgani va kunlik miqdor yozilgan. Bolaga qoʻshimcha berishdan oldin pediatr bilan maslahatlashing.",
    ],
    ru: [
      "В разделе «Детям» — только витамины и добавки, предназначенные для детей: дозировка по возрасту, жевательные или растворимые формы. Давать ребёнку продукт для взрослых не рекомендуется — у него другая дозировка.",
      "На странице каждого товара указано, с какого возраста он разрешён, и суточное количество. Перед приёмом добавок проконсультируйтесь с педиатром.",
    ],
  },
  effervescent: {
    uz: [
      "Shipuchi tabletkalar suvda eritib ichiladi: kapsula yutish noqulay boʻlganlar uchun qulay shakl. Boʻlimda C vitamini, multivitaminlar va magniyli shipuchi tabletkalar jamlangan.",
      "Bitta tabletkani bir stakan suvda toʻliq eritib ichish kerak. Tarkibida shirinlashtiruvchi va natriy boʻlishi mumkin — tuzsiz parhezda yoki qandli diabetda yorliqni oʻqing.",
    ],
    ru: [
      "Шипучие таблетки растворяют в воде — удобная форма для тех, кому неудобно глотать капсулы. В разделе собраны шипучие таблетки с витамином C, мультивитаминами и магнием.",
      "Одну таблетку нужно полностью растворить в стакане воды. В составе могут быть подсластители и натрий — при бессолевой диете или диабете читайте этикетку.",
    ],
  },
  devices: {
    uz: [
      "Tibbiy jihozlar boʻlimida uy uchun tonometrlar, elektron termometrlar va ingalyatorlar va sovutuvchi plastirlar bor. Kafolat shartlari va qoʻllanma har bir mahsulot sahifasida koʻrsatilgan.",
      "Tonometr tanlaganda manjet oʻlchamiga, termometrda — oʻlchash vaqti va aniqligiga, ingalyatorda — qanday dori shakllari bilan ishlashiga qarang. Texnik xususiyatlar mahsulot sahifasida.",
    ],
    ru: [
      "В разделе «Медицинские устройства» — тонометры, электронные термометры, ингаляторы и охлаждающие пластыри для дома. Условия гарантии и инструкция указаны на странице каждого товара.",
      "При выборе тонометра смотрите на размер манжеты, термометра — на время и точность измерения, ингалятора — на то, с какими формами препаратов он работает. Технические характеристики — на странице товара.",
    ],
  },
  coffee: {
    uz: [
      "Qahva boʻlimida Swiss Energy brendining qahvalari: arabika, arabika va robusta aralashmasi, mokka. 250 g va 500 g qadoqlar mavjud.",
      "Yumshoq taʼm uchun arabikani, kuchli va qaymoqli ichimlik uchun robusta qoʻshilgan aralashmani tanlang. Ochilgan qadoqni yopiq idishda, quyosh tushmaydigan joyda saqlang.",
    ],
    ru: [
      "В разделе «Кофе» — кофе бренда Swiss Energy: арабика, смесь арабики с робустой, мокка. Есть упаковки 250 г и 500 г.",
      "Для мягкого вкуса выбирайте арабику, для крепкого напитка с пенкой — смесь с робустой. Открытую упаковку храните в закрытой ёмкости вдали от солнца.",
    ],
  },
  "clinical-nutrition": {
    uz: [
      "Tibbiy ovqatlanish boʻlimida kichik hajmda koʻp kaloriya va oqsil beradigan ixtisoslashgan ichimliklar jamlangan. Ular ishtaha past boʻlganda, kasallik yoki operatsiyadan keyingi davrda ovqatlanishni toʻldirish uchun ishlatiladi.",
      "Bunday mahsulotlar shifokor yoki dietolog tavsiyasi bilan qabul qilinadi. Bir xil tarkibda bir nechta taʼm bor — kunlik miqdor va kaloriya mahsulot sahifasida koʻrsatilgan.",
    ],
    ru: [
      "В разделе «Специализированное питание» — напитки, которые дают много калорий и белка в небольшом объёме. Их используют для восполнения питания при сниженном аппетите, после болезни или операции.",
      "Такие продукты принимают по рекомендации врача или диетолога. Один и тот же состав выпускается с разными вкусами — суточное количество и калорийность указаны на странице товара.",
    ],
  },
  minerals: {
    uz: [
      "Minerallar boʻlimida magniy, kalsiy, sink va temir saqlovchi qoʻshimchalar bor. Mineralning shakli (sitrat, xelat, karbonat) uning qanday soʻrilishiga taʼsir qiladi — shakl har bir mahsulot tarkibida yozilgan.",
      "Kalsiy va temirni bir vaqtda ichmang: ular bir-birining soʻrilishiga xalaqit beradi. Kunlik dozani ratsiondan keladigan miqdorni hisobga olib tanlang.",
    ],
    ru: [
      "В разделе «Минералы» — добавки с магнием, кальцием, цинком и железом. Форма минерала (цитрат, хелат, карбонат) влияет на его усвоение — она указана в составе каждого товара.",
      "Не принимайте кальций и железо одновременно: они мешают усвоению друг друга. Суточную дозу выбирайте с учётом того, что поступает с едой.",
    ],
  },
  skin: {
    uz: [
      "Teri parvarishi boʻlimida tashqi qoʻllash uchun balzamlar va boshqa vositalar jamlangan: quruq, yorilgan va taʼsirlangan teri parvarishi uchun.",
      "Yangi vositani avval terining kichik qismida sinab koʻring. Ochiq yaraga surtishdan oldin yoʻriqnomani oʻqing.",
    ],
    ru: [
      "В разделе «Уход за кожей» — бальзамы и другие средства для наружного применения: для ухода за сухой, потрескавшейся и раздражённой кожей.",
      "Новое средство сначала проверьте на небольшом участке кожи. Перед нанесением на открытые раны прочитайте инструкцию.",
    ],
  },
  herbal: {
    uz: [
      "Oʻsimlik vositalari boʻlimida oʻsimlik ekstraktlari asosidagi siroplar va qoʻshimchalar bor. Tabiiy tarkib nojoʻya taʼsir yoʻqligini anglatmaydi — tarkibdagi har bir oʻsimlik mahsulot sahifasida sanab oʻtilgan.",
      "Allergiyaga moyil boʻlsangiz yoki boshqa dori qabul qilsangiz, oʻsimlik vositasini boshlashdan oldin shifokor bilan maslahatlashing.",
    ],
    ru: [
      "В разделе «Растительные средства» — сиропы и добавки на основе растительных экстрактов. Натуральный состав не означает отсутствия побочных эффектов — каждое растение в составе перечислено на странице товара.",
      "Если вы склонны к аллергии или принимаете другие лекарства, перед началом приёма проконсультируйтесь с врачом.",
    ],
  },
  collagen: {
    uz: [
      "Kollagen boʻlimida kollagen peptidlari bor kukunlar, kapsulalar va komplekslar jamlangan. Odatda ular C vitamini bilan birga chiqariladi — u organizmda kollagen hosil boʻlishida ishtirok etadi.",
      "Tanlashda bir porsiyadagi kollagen miqdoriga, uning turiga va qadoq necha kunga yetishiga qarang. Kollagen kurs bilan qabul qilinadi.",
    ],
    ru: [
      "В разделе «Коллаген» — порошки, капсулы и комплексы с пептидами коллагена. Обычно их выпускают вместе с витамином C, который участвует в образовании коллагена в организме.",
      "При выборе смотрите на количество коллагена в порции, его тип и то, на сколько дней хватит упаковки. Коллаген принимают курсом.",
    ],
  },
  omega: {
    uz: [
      "Omega va baliq yogʻi boʻlimida omega-3 yogʻ kislotalari (EPA va DHA) saqlovchi kapsulalar jamlangan. Yorliqdagi «baliq yogʻi» miqdori emas, EPA va DHA miqdori muhim — u har bir mahsulot tarkibida alohida koʻrsatilgan.",
      "Omega-3 ovqat bilan birga ichilganda yaxshiroq qabul qilinadi. Qon suyultiruvchi dori ichsangiz, shifokor bilan maslahatlashing.",
    ],
    ru: [
      "В разделе «Омега и рыбий жир» — капсулы с омега-3 жирными кислотами (ЭПК и ДГК). Важно не количество «рыбьего жира» на этикетке, а количество ЭПК и ДГК — оно указано в составе каждого товара отдельно.",
      "Омега-3 лучше принимать во время еды. Если вы принимаете препараты, разжижающие кровь, проконсультируйтесь с врачом.",
    ],
  },
  sport: {
    uz: [
      "Sport va fitnes boʻlimida faol turmush tarzi uchun qoʻshimchalar va komplekslar jamlangan. Tarkib va kunlik doza har bir mahsulot sahifasida koʻrsatilgan.",
      "Mashgʻulotdagi yuklama va ratsionga qarab tanlang. Sport qoʻshimchalari muvozanatli ovqatlanishning oʻrnini bosmaydi.",
    ],
    ru: [
      "В разделе «Спорт и фитнес» — добавки и комплексы для активного образа жизни. Состав и суточная доза указаны на странице каждого товара.",
      "Выбирайте с учётом нагрузки на тренировках и рациона. Спортивные добавки не заменяют сбалансированное питание.",
    ],
  },
  joints: {
    uz: [
      "Boʻgʻimlar boʻlimida glyukozamin, xondroitin, kollagen, kalsiy va D vitamini bor komplekslar jamlangan. Har bir moddaning miqdori mahsulot tarkibida yozilgan.",
      "Bunday qoʻshimchalar uzoq kurs bilan qabul qilinadi. Boʻgʻimlarda doimiy ogʻriq boʻlsa, avval shifokorga murojaat qiling — qoʻshimcha tekshiruv va davolanish oʻrnini bosmaydi.",
    ],
    ru: [
      "В разделе «Суставы» — комплексы с глюкозамином, хондроитином, коллагеном, кальцием и витамином D. Количество каждого вещества указано в составе товара.",
      "Такие добавки принимают длительным курсом. При постоянной боли в суставах сначала обратитесь к врачу — добавка не заменяет обследование и лечение.",
    ],
  },
};

export function categorySeoCopy(slug: string, locale: Locale): string[] {
  return CATEGORY_SEO[slug]?.[locale] ?? [];
}
