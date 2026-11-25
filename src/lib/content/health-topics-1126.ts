import type { RawHealthTopic } from "./health-topics";

/*
  Daily batch 2026-11-26: numbness and tingling, bleeding gums, period pain,
  cracked lips, vegetarian diet. Products only as their pack describes them;
  nutrient copy limited to EFSA-authorised "contributes to normal …" wording
  (claims.ts). Every page names the signs that need a doctor first.
*/

export const topics1126: RawHealthTopic[] = [
  {
    kind: "symptom",
    slug: "numbness",
    name: { uz: "Qoʻl-oyoq uvishishi", ru: "Онемение рук и ног" },
    headline: {
      uz: "Qoʻl va oyoq nega uvishadi va qachon shifokorga borish kerak",
      ru: "Почему немеют руки и ноги и когда идти к врачу",
    },
    intro: {
      uz: "Uvishish va «chumoli yurgandek» sezgi koʻpincha noqulay holatda uzoq oʻtirishdan keladi. Lekin tez-tez takrorlansa, sababini aniqlash kerak — jumladan, vitamin B12 yetishmovchiligini.",
      ru: "Онемение и «мурашки» чаще всего появляются после долгого сидения в неудобной позе. Но если это повторяется часто, причину нужно выяснить — в том числе дефицит витамина B12.",
    },
    sections: {
      uz: [
        {
          title: "Darhol 103 ga qoʻngʻiroq qiling",
          body: "Yuz, qoʻl yoki oyoqning bir tomoni toʻsatdan uvishsa yoki holsizlansa, nutq buzilsa, koʻrish yomonlashsa yoki muvozanat yoʻqolsa — bu insult belgisi boʻlishi mumkin. Kutmang, darhol 103 ga qoʻngʻiroq qiling.",
        },
        {
          title: "Koʻp uchraydigan sabablar",
          body: "Asabning bosilib qolishi (oyoqni chalishtirib oʻtirish, qoʻlni boshga qoʻyib uxlash), uzoq vaqt kompyuterda ishlash, sovuq. Bunday uvishish holat oʻzgargach bir necha daqiqada oʻtadi. Doimiy uvishish qandli diabet, umurtqa muammolari, qalqonsimon bez faoliyati yoki B12 yetishmovchiligi bilan bogʻliq boʻlishi mumkin.",
        },
        {
          title: "Vitamin B12 va boshqa moddalar",
          body: "Vitamin B12 asab tizimining normal ishlashiga, B6 va B1 ham asab tizimining normal faoliyatiga hissa qoʻshadi. B12 faqat hayvon mahsulotlarida tabiiy holda bor, shuning uchun vegetarianlar, 50 yoshdan oshganlar va metformin ichadiganlarda yetishmovchilik koʻproq uchraydi. Qondagi B12 darajasini tahlil bilan aniqlash mumkin.",
        },
        {
          title: "Qachon shifokorga borish kerak",
          body: "Uvishish bir necha kun davom etsa, tez-tez qaytalansa, ikkala oyoqda yoki qoʻlda boʻlsa, ogʻriq, holsizlik yoki yurishda qiyinchilik bilan kelsa — terapevt yoki nevrologga murojaat qiling. Sababni aniqlamay turib faqat vitamin ichish tavsiya etilmaydi.",
        },
      ],
      ru: [
        {
          title: "Сразу звоните 103",
          body: "Если внезапно онемела или ослабла одна сторона лица, рука или нога, нарушилась речь, ухудшилось зрение или потерялось равновесие — это может быть признаком инсульта. Не ждите, сразу звоните 103.",
        },
        {
          title: "Частые причины",
          body: "Сдавливание нерва (сидение нога на ногу, сон с рукой под головой), долгая работа за компьютером, холод. Такое онемение проходит за несколько минут после смены позы. Постоянное онемение может быть связано с сахарным диабетом, проблемами позвоночника, работой щитовидной железы или дефицитом B12.",
        },
        {
          title: "Витамин B12 и другие вещества",
          body: "Витамин B12 способствует нормальному функционированию нервной системы, B6 и B1 — тоже. В естественном виде B12 есть только в продуктах животного происхождения, поэтому дефицит чаще встречается у вегетарианцев, людей старше 50 лет и принимающих метформин. Уровень B12 в крови можно проверить анализом.",
        },
        {
          title: "Когда идти к врачу",
          body: "Если онемение держится несколько дней, часто возвращается, затрагивает обе ноги или руки, сопровождается болью, слабостью или трудностью при ходьбе — обратитесь к терапевту или неврологу. Принимать витамины, не выяснив причину, не рекомендуется.",
        },
      ],
    },
    bullets: {
      uz: ["Bir tomon toʻsatdan uvishsa — 103", "Holat oʻzgargach oʻtsa — xavfsiz", "B12 — asab tizimi uchun", "Doimiy boʻlsa — nevrologga"],
      ru: ["Внезапно онемела одна сторона — 103", "Прошло после смены позы — не опасно", "B12 — для нервной системы", "Если постоянно — к неврологу"],
    },
    ingredientSlugs: ["vitamin-b12", "magnesium"],
    productSlugs: ["swiss-energy-neuroforce-30", "dr-frei-antistress-magniy-20", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: [],
    relatedSlugs: ["vitamin-b12", "vitamin-b-complex", "muscle-cramps", "fatigue"],
    faq: {
      uz: [
        { question: "Kechasi qoʻlim uvishib uygʻonaman, bu xavflimi?", answer: "Koʻpincha qoʻl tana ostida qolganidan yoki bilakni bukib uxlashdan boʻladi va silkitgach oʻtadi. Har kecha takrorlansa yoki kunduzi ham boʻlsa, karpal kanal sindromini tekshirish uchun shifokorga boring." },
        { question: "B12 yetishmovchiligini qanday bilsa boʻladi?", answer: "Qon tahlili bilan. Charchoq, uvishish, tilda achishish va rangparlik belgilari boʻlishi mumkin, lekin ular boshqa sabablardan ham keladi." },
        { question: "NeuroForce tarkibida nima bor?", answer: "Qadoqda: B1, B2, B3, B5, B6, B7, B9 va B12 — sekin ajraladigan kapsulada. Qabul qilish tartibi qadoqda yozilgan." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, biologik faol qoʻshimcha. Uvishishning sababini shifokor aniqlaydi." },
      ],
      ru: [
        { question: "Просыпаюсь ночью с онемевшей рукой — это опасно?", answer: "Чаще всего это из-за того, что рука была под телом или запястье было согнуто во сне, и проходит, если ею потрясти. Если повторяется каждую ночь или бывает днём — проверьтесь у врача на синдром запястного канала." },
        { question: "Как понять, что не хватает B12?", answer: "По анализу крови. Возможны усталость, онемение, жжение языка и бледность, но эти признаки бывают и по другим причинам." },
        { question: "Что входит в NeuroForce?", answer: "На упаковке: B1, B2, B3, B5, B6, B7, B9 и B12 в капсуле с постепенным высвобождением. Способ приёма указан на упаковке." },
        { question: "Это лекарство?", answer: "Нет, биологически активная добавка. Причину онемения определяет врач." },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "bleeding-gums",
    name: { uz: "Milk qonashi", ru: "Кровоточивость дёсен" },
    headline: {
      uz: "Tish yuvganda milk nega qonaydi va nima qilish kerak",
      ru: "Почему кровоточат дёсны при чистке зубов и что делать",
    },
    intro: {
      uz: "Milk qonashining eng koʻp sababi — tish karashi va milk yalligʻlanishi. Toʻgʻri tish yuvish, stomatolog koʻrigi va vitamin C ning oʻrni haqida.",
      ru: "Самая частая причина кровоточивости дёсен — зубной налёт и воспаление дёсен. О правильной чистке зубов, осмотре у стоматолога и роли витамина C.",
    },
    sections: {
      uz: [
        {
          title: "Nega milk qonaydi",
          body: "Tish yonida qolgan karash milkni taʼsirlantiradi, u qizaradi, shishadi va tish yuvganda qonaydi. Qattiq choʻtka, chekish, homiladorlikdagi gormonal oʻzgarishlar va baʼzi dorilar ham qonashni kuchaytiradi. Vitamin C ning jiddiy yetishmovchiligi ham sabab boʻlishi mumkin, lekin bu kam uchraydi.",
        },
        {
          title: "Kundalik parvarish",
          body: "Tishni kuniga ikki marta, 2 daqiqa davomida yumshoq choʻtka bilan yuving. Tishlar orasini ip yoki choʻtkacha bilan tozalang. Qonash boʻlsa ham tish yuvishni toʻxtatmang — karash qolsa, yalligʻlanish kuchayadi.",
        },
        {
          title: "Vitamin C",
          body: "Vitamin C milklarning normal faoliyati uchun kollagen hosil boʻlishiga hissa qoʻshadi. Kuniga bir necha marta meva va sabzavot (qalampir, tsitrus, kivi, karam) yeyish koʻpchilik uchun yetarli. Ovqatlanish bir xil boʻlsa, qoʻshimcha qulay boʻlishi mumkin.",
        },
        {
          title: "Qachon shifokorga borish kerak",
          body: "Toʻgʻri parvarishga qaramay qonash ikki haftada kamaymasa, milk tishdan ajralayotgan, tish qimirlayotgan yoki ogʻizdan doimiy yoqimsiz hid kelsa — stomatologga boring. Milk koʻp qonasa, tanada sababsiz koʻkarishlar yoki burundan tez-tez qon ketsa — terapevtga murojaat qilib, qon tahlili topshiring.",
        },
      ],
      ru: [
        {
          title: "Почему кровоточат дёсны",
          body: "Налёт у края зубов раздражает десну: она краснеет, отекает и кровоточит при чистке. Кровоточивость усиливают жёсткая щётка, курение, гормональные изменения при беременности и некоторые лекарства. Причиной может быть и выраженный дефицит витамина C, но это встречается редко.",
        },
        {
          title: "Ежедневный уход",
          body: "Чистите зубы дважды в день по 2 минуты мягкой щёткой. Очищайте промежутки между зубами нитью или ёршиком. Не прекращайте чистку из-за крови — если налёт останется, воспаление усилится.",
        },
        {
          title: "Витамин C",
          body: "Витамин C способствует нормальному образованию коллагена для нормальной функции дёсен. Большинству достаточно несколько раз в день есть овощи и фрукты (перец, цитрусовые, киви, капуста). Если питание однообразное, добавка может быть удобна.",
        },
        {
          title: "Когда идти к врачу",
          body: "Если при правильном уходе кровоточивость не уменьшилась за две недели, десна отходит от зуба, зуб шатается или изо рта постоянно неприятно пахнет — идите к стоматологу. Если дёсны кровоточат сильно, на теле появляются синяки без причины или часто идёт кровь из носа — обратитесь к терапевту и сдайте анализ крови.",
        },
      ],
    },
    bullets: {
      uz: ["Asosiy sabab — karash", "Yumshoq choʻtka + tish ipi", "Vitamin C — milklar uchun", "2 haftada oʻtmasa — stomatologga"],
      ru: ["Главная причина — налёт", "Мягкая щётка + зубная нить", "Витамин C — для дёсен", "Не прошло за 2 недели — к стоматологу"],
    },
    ingredientSlugs: ["vitamin-c", "zinc"],
    productSlugs: ["swiss-energy-vitamin-c-20", "swiss-energy-immunovit-30", "dr-frei-multivitamins-biotin-20"],
    categorySlugs: [],
    relatedSlugs: ["vitamin-c", "immunity", "pregnancy"],
    faq: {
      uz: [
        { question: "Homiladorlikda milk qonashi normalmi?", answer: "Gormonal oʻzgarishlar sabab koʻp uchraydi. Parvarishni kuchaytiring va homiladorlik paytida ham stomatolog koʻrigidan oʻting — bu xavfsiz va tavsiya etiladi." },
        { question: "Vitamin C ichsam qonash toʻxtaydimi?", answer: "Agar sabab karash boʻlsa, faqat vitamin yordam bermaydi — tishni toʻgʻri tozalash va stomatologda karashni olib tashlash kerak. Vitamin C milklarning normal faoliyatiga hissa qoʻshadi." },
        { question: "Qanday choʻtka tanlash kerak?", answer: "Yumshoq (soft) choʻtka. Qattiq choʻtka va kuchli bosim milkni shikastlaydi." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, vitamin C shipuchi tabletkasi biologik faol qoʻshimcha. Milk kasalligi bilan stomatolog shugʻullanadi." },
      ],
      ru: [
        { question: "Кровоточивость дёсен при беременности — это нормально?", answer: "Из-за гормональных изменений это частое явление. Усильте уход и пройдите осмотр у стоматолога — во время беременности это безопасно и рекомендуется." },
        { question: "Если пить витамин C, кровь пройдёт?", answer: "Если причина в налёте, один витамин не поможет — нужна правильная чистка и удаление налёта у стоматолога. Витамин C способствует нормальной функции дёсен." },
        { question: "Какую щётку выбрать?", answer: "Мягкую (soft). Жёсткая щётка и сильное нажатие травмируют десну." },
        { question: "Это лекарство?", answer: "Нет, шипучий витамин C — биологически активная добавка. Заболеваниями дёсен занимается стоматолог." },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "period-pain",
    name: { uz: "Hayz ogʻrigʻi", ru: "Боль при месячных" },
    headline: {
      uz: "Hayz paytidagi ogʻriq: oʻzingizga qanday yordam berish va qachon shifokorga borish",
      ru: "Боль при месячных: как помочь себе и когда идти к врачу",
    },
    intro: {
      uz: "Hayzning birinchi kunlarida qorin pastida tortuvchi ogʻriq koʻp ayollarda boʻladi. Issiqlik, harakat, uyqu va ovqatlanish qanday yordam berishi va qaysi belgilar ginekolog koʻrigini talab qilishi haqida.",
      ru: "Тянущая боль внизу живота в первые дни месячных бывает у многих женщин. Как помогают тепло, движение, сон и питание и какие признаки требуют осмотра у гинеколога.",
    },
    sections: {
      uz: [
        {
          title: "Nega ogʻriydi",
          body: "Hayz paytida bachadon mushaklari qisqaradi, bunda prostaglandin moddalari ishtirok etadi. Odatda ogʻriq hayzdan biroz oldin yoki birinchi kuni boshlanib, 1–3 kunda kamayadi. Bunday ogʻriq yoshlarda koʻproq va koʻpincha yosh oʻtishi bilan yengillashadi.",
        },
        {
          title: "Uyda nima yordam beradi",
          body: "Qoringa iliq isitgich qoʻyish, iliq dush, yengil yurish yoki choʻzilish mashqlari, yetarli uyqu. Kofein va shoʻr ovqatni kamaytirish, koʻproq suv ichish ham koʻpchilikka yengillik beradi. Ogʻriq qoldiruvchi dorini faqat yoʻriqnomaga koʻra yoki shifokor aytganidek iching.",
        },
        {
          title: "Magniy va vitamin B6",
          body: "Magniy mushaklarning normal ishlashiga va charchoqni kamaytirishga hissa qoʻshadi, vitamin B6 esa gormonal faoliyatni tartibga solishga hissa qoʻshadi. Bu moddalar dukkaklilar, yongʻoq, toʻliq donli mahsulotlar va bananda bor. Antistress Magniy B6 shipuchi tabletkasida ikkalasi birga.",
        },
        {
          title: "Qachon ginekologga borish kerak",
          body: "Ogʻriq shunchalik kuchliki ishga yoki oʻqishga bora olmasangiz, ogʻriq qoldiruvchi yordam bermasa, hayz juda koʻp (soatiga prokladka toʻlib qolsa) yoki 7 kundan uzoq davom etsa, ogʻriq hayzdan tashqari kunlarda ham boʻlsa yoki isitma bilan kelsa — ginekologga boring. Homiladorlik ehtimoli boʻlsa va kuchli ogʻriq boshlansa — darhol shifokorga.",
        },
      ],
      ru: [
        {
          title: "Почему болит",
          body: "Во время месячных сокращаются мышцы матки, в этом участвуют простагландины. Обычно боль начинается незадолго до месячных или в первый день и уменьшается за 1–3 дня. Такая боль чаще бывает в юности и нередко ослабевает с возрастом.",
        },
        {
          title: "Что помогает дома",
          body: "Тёплая грелка на живот, тёплый душ, лёгкая прогулка или растяжка, достаточный сон. Многим становится легче, если меньше кофеина и солёного и больше воды. Обезболивающее принимайте только по инструкции или как сказал врач.",
        },
        {
          title: "Магний и витамин B6",
          body: "Магний способствует нормальной работе мышц и снижению усталости, а витамин B6 — регуляции гормональной активности. Эти вещества есть в бобовых, орехах, цельнозерновых продуктах и бананах. В шипучей таблетке Антистресс Магний B6 они вместе.",
        },
        {
          title: "Когда идти к гинекологу",
          body: "Если боль настолько сильная, что вы не можете пойти на работу или учёбу, обезболивающее не помогает, месячные очень обильные (прокладка наполняется за час) или длятся дольше 7 дней, боль бывает и вне месячных или сопровождается температурой — идите к гинекологу. Если возможна беременность и началась сильная боль — сразу к врачу.",
        },
      ],
    },
    bullets: {
      uz: ["Iliq isitgich va yengil harakat", "Kofein va tuzni kamaytirish", "Magniy, B6 — mushak va gormonlar uchun", "Kuchli ogʻriq — ginekologga"],
      ru: ["Тёплая грелка и лёгкое движение", "Меньше кофеина и соли", "Магний, B6 — для мышц и гормонов", "Сильная боль — к гинекологу"],
    },
    ingredientSlugs: ["magnesium", "iron"],
    productSlugs: ["dr-frei-antistress-magniy-20", "swiss-energy-neuroforce-30"],
    categorySlugs: [],
    relatedSlugs: ["women", "magnesium", "vitamin-b6", "stress"],
    faq: {
      uz: [
        { question: "Hayz paytida sport qilsa boʻladimi?", answer: "Ha, yengil yurish, yoga yoki choʻzilish mashqlari koʻpchilikka yengillik beradi. Oʻzingizni yomon his qilsangiz, ogʻir mashqni keyinga qoldiring." },
        { question: "Koʻp qon yoʻqotsam nima qilish kerak?", answer: "Koʻp va uzoq hayz temir yetishmovchiligiga olib kelishi mumkin. Ginekolog koʻrigidan oʻting va qon tahlili (gemoglobin, ferritin) topshiring." },
        { question: "Magniy B6 ni qachon ichish kerak?", answer: "Qabul qilish tartibi qadoqda yozilgan — tabletka suvda eritiladi. Buyrak kasalligi boʻlsa, oldin shifokor bilan maslahatlashing." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, biologik faol qoʻshimcha. U ogʻriq qoldiruvchi emas." },
      ],
      ru: [
        { question: "Можно ли заниматься спортом во время месячных?", answer: "Да, многим становится легче от лёгкой ходьбы, йоги или растяжки. Если чувствуете себя плохо, тяжёлую тренировку лучше отложить." },
        { question: "Что делать, если теряю много крови?", answer: "Обильные и длительные месячные могут привести к дефициту железа. Пройдите осмотр у гинеколога и сдайте анализ крови (гемоглобин, ферритин)." },
        { question: "Когда принимать Магний B6?", answer: "Способ приёма указан на упаковке — таблетку растворяют в воде. При болезни почек сначала посоветуйтесь с врачом." },
        { question: "Это лекарство?", answer: "Нет, биологически активная добавка. Это не обезболивающее." },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "cracked-lips",
    name: { uz: "Lab yorilishi", ru: "Трещины на губах" },
    headline: {
      uz: "Lablar va lab burchaklari nega yoriladi va qanday parvarish qilish kerak",
      ru: "Почему трескаются губы и уголки рта и как за ними ухаживать",
    },
    intro: {
      uz: "Qishda sovuq shamol va quruq havo lablarni quritadi. Lab burchaklaridagi yoriqlar esa baʼzan B guruhi vitaminlari yoki temir yetishmovchiligi bilan bogʻliq. Parvarish va qachon shifokorga borish haqida.",
      ru: "Зимой холодный ветер и сухой воздух сушат губы. А трещины в уголках рта иногда связаны с нехваткой витаминов группы B или железа. Об уходе и о том, когда идти к врачу.",
    },
    sections: {
      uz: [
        {
          title: "Nega lablar yoriladi",
          body: "Lab terisida yogʻ bezlari yoʻq, shuning uchun u tez quriydi. Sovuq, shamol, quyosh, isitilgan xona havosi va lablarni tez-tez yalash yorilishni kuchaytiradi. Lab burchaklaridagi yoriqlar (angulyar xeylit) soʻlak, zamburugʻ yoki bakteriya, baʼzan B2, B6, B12 va temir yetishmovchiligi bilan bogʻliq.",
        },
        {
          title: "Parvarish",
          body: "Lablarni yalamang — soʻlak bugʻlanib, ularni yanada quritadi. Tashqariga chiqishdan oldin va uxlashdan oldin gigiyenik lab balzamini suring, yozda SPF li balzam qulay. Qobiqlarni yulmang. Kun davomida yetarli suv iching, xonada namlagich ishlating.",
        },
        {
          title: "B vitaminlari va temir",
          body: "Riboflavin (B2) shilliq qavatlar va terining normal holatini saqlashga hissa qoʻshadi. B2 sut mahsulotlari, tuxum, goʻsht va bargli sabzavotlarda, temir goʻsht, jigar va dukkaklilarda bor. Ovqatlanish bir xil boʻlsa, B-kompleks yoki multivitamin qulay boʻlishi mumkin.",
        },
        {
          title: "Qachon shifokorga borish kerak",
          body: "Yoriqlar ikki haftada bitmasa, lab burchaklari doimiy yorilsa, oq qoplama, pufakchalar yoki yiring paydo boʻlsa, lablar shishsa — dermatolog yoki terapevtga boring. Yetishmovchilik borligini qon tahlili koʻrsatadi.",
        },
      ],
      ru: [
        {
          title: "Почему трескаются губы",
          body: "На коже губ нет сальных желёз, поэтому она быстро сохнет. Холод, ветер, солнце, сухой воздух в отапливаемой комнате и привычка облизывать губы усиливают трещины. Трещины в уголках рта (ангулярный хейлит) связаны со слюной, грибком или бактериями, иногда — с нехваткой B2, B6, B12 и железа.",
        },
        {
          title: "Уход",
          body: "Не облизывайте губы — слюна испаряется и сушит их ещё сильнее. Наносите гигиенический бальзам перед выходом на улицу и перед сном, летом удобен бальзам с SPF. Не сдирайте корочки. Пейте достаточно воды в течение дня, пользуйтесь увлажнителем воздуха.",
        },
        {
          title: "Витамины B и железо",
          body: "Рибофлавин (B2) способствует поддержанию нормального состояния слизистых оболочек и кожи. B2 есть в молочных продуктах, яйцах, мясе и листовых овощах, железо — в мясе, печени и бобовых. Если питание однообразное, может быть удобен B-комплекс или мультивитамин.",
        },
        {
          title: "Когда идти к врачу",
          body: "Если трещины не заживают две недели, уголки рта трескаются постоянно, появились белый налёт, пузырьки или гной, губы отекают — обратитесь к дерматологу или терапевту. Есть ли дефицит, покажет анализ крови.",
        },
      ],
    },
    bullets: {
      uz: ["Lablarni yalamang", "Balzam — chiqishdan va uxlashdan oldin", "B2 — shilliq qavat va teri uchun", "2 haftada bitmasa — shifokorga"],
      ru: ["Не облизывайте губы", "Бальзам — перед выходом и сном", "B2 — для слизистых и кожи", "Не зажило за 2 недели — к врачу"],
    },
    ingredientSlugs: ["vitamin-b12", "iron", "zinc"],
    productSlugs: ["swiss-energy-neuroforce-30", "dr-frei-multivitamins-biotin-20", "swiss-energy-hair-nail-skin-30"],
    categorySlugs: [],
    relatedSlugs: ["dry-skin", "vitamin-b-complex", "iron", "beauty"],
    faq: {
      uz: [
        { question: "Lab burchagi har qishda yoriladi, nima qilay?", answer: "Lablarni yalamaslik, balzam surtish va xonadagi namlikni oshirish koʻp hollarda yordam beradi. Har yili takrorlansa, temir va B12 darajasini tekshirish uchun terapevtga boring." },
        { question: "Vazelin yoki balzam — qaysi biri yaxshi?", answer: "Ikkalasi ham namlikni ushlab turadi. Hidsiz va boʻyoqsiz vositani tanlang — xushboʻy moddalar baʼzan taʼsirlantiradi." },
        { question: "Bolada lab burchagi yorilsa?", answer: "Koʻpincha soʻlak va lab yalashdan boʻladi. Ikki haftada bitmasa yoki oq qoplama boʻlsa, pediatrga koʻrsating." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, vitaminlar biologik faol qoʻshimcha. Xeylit bilan shifokor shugʻullanadi." },
      ],
      ru: [
        { question: "Каждую зиму трескаются уголки рта, что делать?", answer: "В большинстве случаев помогают отказ от облизывания губ, бальзам и увлажнение воздуха. Если повторяется каждый год, проверьте у терапевта уровень железа и B12." },
        { question: "Что лучше — вазелин или бальзам?", answer: "Оба удерживают влагу. Выбирайте средство без отдушек и красителей — ароматизаторы иногда раздражают." },
        { question: "У ребёнка трескаются уголки рта?", answer: "Чаще всего из-за слюны и облизывания губ. Если не заживает две недели или есть белый налёт, покажите педиатру." },
        { question: "Это лекарство?", answer: "Нет, витамины — биологически активная добавка. Хейлитом занимается врач." },
      ],
    },
  },
  {
    kind: "goal",
    slug: "vegetarian",
    name: { uz: "Vegetarian ovqatlanish", ru: "Вегетарианское питание" },
    headline: {
      uz: "Vegetarian ovqatlanishda qaysi moddalarga alohida eʼtibor berish kerak",
      ru: "На какие вещества обратить внимание при вегетарианском питании",
    },
    intro: {
      uz: "Goʻshtsiz ovqatlanish toʻgʻri tuzilsa, toʻyimli boʻladi. Lekin vitamin B12, temir, kalsiy, vitamin D, yod va omega-3 ni oldindan rejalashtirish kerak. Qayerdan olish va nimani tekshirish haqida.",
      ru: "Питание без мяса может быть полноценным, если его правильно составить. Но витамин B12, железо, кальций, витамин D, йод и омега-3 нужно планировать заранее. Где их брать и что проверять.",
    },
    sections: {
      uz: [
        {
          title: "Vitamin B12 — birinchi navbatda",
          body: "B12 tabiiy holda faqat hayvon mahsulotlarida bor. Sut va tuxum yeydigan vegetarianlar biroz oladi, vegan ovqatlanishda esa boyitilgan mahsulot yoki qoʻshimchasiz yetarli B12 olish qiyin. B12 asab tizimining normal ishlashiga va qizil qon tanachalari hosil boʻlishiga hissa qoʻshadi.",
        },
        {
          title: "Temir va kalsiy",
          body: "Oʻsimlikdagi temir (yasmiq, noʻxat, loviya, ismaloq, quritilgan oʻrik) goʻshtdagidan yomonroq soʻriladi. Uni vitamin C li mahsulot bilan birga yeyish, choy va qahvani ovqatdan keyin emas, oraliqda ichish soʻrilishni yaxshilaydi. Kalsiy sut mahsulotlari, kunjut, bodom va bargli sabzavotlardan olinadi.",
        },
        {
          title: "Vitamin D, yod va omega-3",
          body: "Vitamin D qishda quyosh kam boʻlganda hamma uchun muhim. Yod dengiz mahsulotlari va yodlangan tuzda bor — oshxonada yodlangan tuz ishlating. Omega-3 ning oʻsimlik shakli zigʻir urugʻi, chia va yongʻoqda; EPA va DHA esa asosan baliqda.",
        },
        {
          title: "Nimani tekshirish kerak",
          body: "Vegetarian ovqatlanishga oʻtgandan keyin yiliga bir marta qon tahlili topshirish foydali: umumiy tahlil, ferritin, vitamin B12 va vitamin D. Homiladorlik, emizish va bolalik davrida vegetarian ovqatlanishni shifokor bilan rejalashtiring.",
        },
      ],
      ru: [
        {
          title: "Витамин B12 — в первую очередь",
          body: "В естественном виде B12 есть только в продуктах животного происхождения. Вегетарианцы, которые едят молочное и яйца, получают немного, а при веганском питании без обогащённых продуктов или добавки получить достаточно B12 трудно. B12 способствует нормальной работе нервной системы и образованию эритроцитов.",
        },
        {
          title: "Железо и кальций",
          body: "Железо из растений (чечевица, нут, фасоль, шпинат, курага) усваивается хуже, чем из мяса. Его усвоение улучшается, если есть его вместе с продуктами с витамином C, а чай и кофе пить не сразу после еды, а между приёмами пищи. Кальций дают молочные продукты, кунжут, миндаль и листовые овощи.",
        },
        {
          title: "Витамин D, йод и омега-3",
          body: "Витамин D важен для всех зимой, когда мало солнца. Йод есть в морепродуктах и йодированной соли — используйте её на кухне. Растительная форма омега-3 — в льняном семени, чиа и грецких орехах; EPA и DHA — в основном в рыбе.",
        },
        {
          title: "Что проверять",
          body: "После перехода на вегетарианское питание полезно раз в год сдавать анализы: общий анализ крови, ферритин, витамин B12 и витамин D. При беременности, кормлении грудью и в детском возрасте планируйте вегетарианское питание вместе с врачом.",
        },
      ],
    },
    bullets: {
      uz: ["B12 — birinchi navbatda", "Temir + vitamin C birga", "Yodlangan tuz va vitamin D", "Yiliga bir marta tahlil"],
      ru: ["B12 — в первую очередь", "Железо вместе с витамином C", "Йодированная соль и витамин D", "Анализы раз в год"],
    },
    ingredientSlugs: ["vitamin-b12", "iron", "calcium", "vitamin-d3", "epa-dha"],
    productSlugs: ["swiss-energy-neuroforce-30", "dr-frei-multivitamins-biotin-20", "swiss-energy-calcivit-30"],
    categorySlugs: ["vitamins"],
    relatedSlugs: ["vitamin-b12", "iron", "calcium", "vitamin-d3"],
    faq: {
      uz: [
        { question: "Vegetarianga qaysi vitaminni ichish shart?", answer: "Eng muhimi — vitamin B12, ayniqsa sut va tuxum ham yemasangiz. Qolganini (temir, D, yod) tahlil natijasiga qarab shifokor bilan hal qiling." },
        { question: "Kapsulalar vegetarianlar uchun mosmi?", answer: "Kapsula qobigʻi jelatindan boʻlishi mumkin. Har bir mahsulotning tarkibini qadoqdan tekshiring yoki operatordan soʻrang." },
        { question: "Oʻsimlik oqsili yetarlimi?", answer: "Dukkaklilar, don mahsulotlari, yongʻoq, sut va tuxumni kun davomida aralashtirib yesangiz, koʻpchilik uchun yetarli." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, vitaminlar biologik faol qoʻshimcha. Ular xilma-xil ovqatlanishning oʻrnini bosmaydi." },
      ],
      ru: [
        { question: "Какой витамин вегетарианцу принимать обязательно?", answer: "Главный — витамин B12, особенно если вы не едите молочное и яйца. Остальное (железо, D, йод) решайте с врачом по результатам анализов." },
        { question: "Подходят ли капсулы вегетарианцам?", answer: "Оболочка капсулы может быть из желатина. Проверяйте состав каждого продукта на упаковке или спросите оператора." },
        { question: "Хватает ли растительного белка?", answer: "Если в течение дня сочетать бобовые, крупы, орехи, молочные продукты и яйца, большинству хватает." },
        { question: "Это лекарство?", answer: "Нет, витамины — биологически активная добавка. Они не заменяют разнообразное питание." },
      ],
    },
  },
];
