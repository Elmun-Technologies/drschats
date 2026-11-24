import type { RawHealthTopic } from "./health-topics";

/*
  Daily batch 2026-11-25: dry skin, eye strain, fever at home, blood pressure
  at home, menopause. Products only as their pack describes them; nutrient copy
  limited to EFSA-authorised "contributes to normal …" wording (claims.ts).
  Devices are described as measuring tools, never as a remedy.
*/

export const topics1125: RawHealthTopic[] = [
  {
    kind: "symptom",
    slug: "dry-skin",
    name: { uz: "Quruq teri", ru: "Сухая кожа" },
    headline: {
      uz: "Qishda teri nega quriydi va parvarishda nimaga eʼtibor berish kerak",
      ru: "Почему кожа сохнет зимой и на что обратить внимание в уходе",
    },
    intro: {
      uz: "Quruq teri koʻpincha sovuq havo, isitish moslamalari va tez-tez yuvinish bilan bogʻliq. Kundalik parvarish, ovqatlanish va teri uchun muhim moddalar haqida.",
      ru: "Сухость кожи чаще всего связана с холодным воздухом, отоплением и частым мытьём. О ежедневном уходе, питании и веществах, важных для кожи.",
    },
    sections: {
      uz: [
        {
          title: "Nega teri quriydi",
          body: "Qishda havo quruq, isitish esa xonadagi namlikni yanada pasaytiradi. Issiq suv va tez-tez sovun bilan yuvish terining himoya yogʻ qatlamini kamaytiradi. Natijada teri tortishadi, qipiqlanadi va qichishi mumkin.",
        },
        {
          title: "Kundalik parvarish",
          body: "Qisqa va iliq (issiq emas) dush qiling, yuvingandan keyin 3 daqiqa ichida namlantiruvchi krem yoki balzam suring. Xonada namlagich ishlating, sovuqda qoʻlqop kiying, kun davomida yetarli suv iching.",
        },
        {
          title: "Teri uchun muhim moddalar",
          body: "Biotin, niatsin, sink va vitamin A terining normal holatini saqlashga hissa qoʻshadi. Ular tuxum, yongʻoq, goʻsht, dukkaklilar va sabzavotlarda bor. Hair Nail & Skin kapsulasida biotin, niatsin va sink bitta kapsulada.",
        },
        {
          title: "Qachon shifokorga borish kerak",
          body: "Teri yorilib qonasa, qizarish, toshma yoki kuchli qichishish boʻlsa, parvarishdan keyin ham ikki haftada yaxshilanmasa — dermatologga murojaat qiling. Bu ekzema yoki boshqa teri kasalligi belgisi boʻlishi mumkin.",
        },
      ],
      ru: [
        {
          title: "Почему кожа сохнет",
          body: "Зимой воздух сухой, а отопление ещё сильнее снижает влажность в помещении. Горячая вода и частое мытьё с мылом уменьшают защитный липидный слой кожи. В итоге кожа стягивается, шелушится и может зудеть.",
        },
        {
          title: "Ежедневный уход",
          body: "Принимайте короткий тёплый (не горячий) душ, в течение 3 минут после мытья наносите увлажняющий крем или бальзам. Пользуйтесь увлажнителем воздуха, на холоде надевайте перчатки, в течение дня пейте достаточно воды.",
        },
        {
          title: "Вещества, важные для кожи",
          body: "Биотин, ниацин, цинк и витамин A способствуют поддержанию нормального состояния кожи. Они есть в яйцах, орехах, мясе, бобовых и овощах. В капсуле Hair Nail & Skin — биотин, ниацин и цинк вместе.",
        },
        {
          title: "Когда идти к врачу",
          body: "Если кожа трескается до крови, появились покраснение, сыпь или сильный зуд, если за две недели ухода лучше не стало — обратитесь к дерматологу. Это может быть признаком экземы или другого заболевания кожи.",
        },
      ],
    },
    bullets: {
      uz: ["Iliq dush, keyin darhol krem", "Xonada namlagich", "Biotin, niatsin, sink — teri uchun", "Yorilish, toshma — dermatologga"],
      ru: ["Тёплый душ, сразу после — крем", "Увлажнитель в комнате", "Биотин, ниацин, цинк — для кожи", "Трещины, сыпь — к дерматологу"],
    },
    ingredientSlugs: ["biotin", "zinc", "collagen"],
    productSlugs: ["swiss-energy-hair-nail-skin-30", "peano-balzam-30g", "dr-frei-multivitamins-biotin-20", "swiss-energy-nature-collagen"],
    categorySlugs: ["skin", "beauty"],
    relatedSlugs: ["beauty", "biotin", "zinc", "collagen"],
    faq: {
      uz: [
        { question: "Qishda yuz terisi quriyapti, nima qilay?", answer: "Yuvinish uchun yumshoq vosita va iliq suv ishlating, keyin namlantiruvchi krem suring. Tashqariga chiqishdan oldin yogʻliroq krem qulay. Xonadagi namlikni oshiring." },
        { question: "Vitamin quruq terini yoʻqotadimi?", answer: "Biotin, niatsin va sink terining normal holatini saqlashga hissa qoʻshadi, lekin tashqi parvarish va xonadagi namlikning oʻrnini bosmaydi. Yetishmovchilik borligini shifokor bilan aniqlang." },
        { question: "Peano balzamni yuzga surtsa boʻladimi?", answer: "Ishlab chiqaruvchi yuz terisiga ham mos deydi, lekin koʻzdan uzoq saqlang. Toza teriga kuniga 2–3 marta yupqa qatlam bilan suriladi." },
        { question: "Bu dori vositasimi?", answer: "Kapsulalar biologik faol qoʻshimcha, dori vositasi emas. Teri kasalligida dermatolog tavsiyasiga amal qiling." },
      ],
      ru: [
        { question: "Зимой сохнет кожа лица, что делать?", answer: "Умывайтесь мягким средством и тёплой водой, затем наносите увлажняющий крем. Перед выходом на улицу удобен более плотный крем. Повысьте влажность в комнате." },
        { question: "Уберут ли витамины сухость кожи?", answer: "Биотин, ниацин и цинк способствуют поддержанию нормального состояния кожи, но не заменяют внешний уход и влажность воздуха. Есть ли дефицит, выясните с врачом." },
        { question: "Можно ли наносить бальзам Peano на лицо?", answer: "Производитель указывает, что он подходит и для кожи лица, но держите подальше от глаз. Наносится тонким слоем на чистую кожу 2–3 раза в день." },
        { question: "Это лекарство?", answer: "Капсулы — биологически активная добавка, не лекарство. При заболевании кожи следуйте рекомендациям дерматолога." },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "eye-strain",
    name: { uz: "Koʻz charchashi", ru: "Усталость глаз" },
    headline: {
      uz: "Ekran oldida koʻp oʻtirganda koʻzga qanday gʻamxoʻrlik qilish kerak",
      ru: "Как беречь глаза, если много времени у экрана",
    },
    intro: {
      uz: "Kompyuter va telefon oldida uzoq oʻtirish koʻzni quritadi va charchatadi. Oddiy odatlar, ish joyini sozlash va koʻrish uchun muhim moddalar haqida.",
      ru: "Долгая работа за компьютером и телефоном сушит и утомляет глаза. О простых привычках, настройке рабочего места и веществах, важных для зрения.",
    },
    sections: {
      uz: [
        {
          title: "Nega koʻz charchaydi",
          body: "Ekranga qaraganda odam kamroq pirpiratadi, koʻz yuzasi quriydi. Yaqin masofaga uzoq vaqt qarash koʻz mushaklarini taranglashtiradi. Natijada achishish, qizarish, xiralashish va bosh ogʻrigʻi paydo boʻlishi mumkin.",
        },
        {
          title: "20-20-20 qoidasi va ish joyi",
          body: "Har 20 daqiqada 20 soniya davomida taxminan 6 metr uzoqlikka qarang. Ekranni koʻzdan bir qoʻl uzunligida va koʻz darajasidan biroz pastda joylashtiring, yorqinligini xona yorugʻligiga moslang. Ataylab tez-tez pirpirating, xonani shamollating.",
        },
        {
          title: "Koʻrish uchun muhim moddalar",
          body: "Vitamin A va sink normal koʻrishni saqlashga hissa qoʻshadi. Lutein va zeaksantin — koʻzning toʻr pardasida toʻplanadigan karotinoidlar, ular ismaloq, karam, makkajoʻxori va tuxum sarigʻida bor. Visiovit va Gold tarkibida lutein, A, E va sink bor.",
        },
        {
          title: "Qachon shifokorga borish kerak",
          body: "Koʻrish birdan yomonlashsa, koʻzda ogʻriq, kuchli qizarish, nur atrofida halqalar yoki «chivinlar» paydo boʻlsa — darhol oftalmologga boring. Koʻzoynak yoki linzangiz yangilanmagan boʻlsa, koʻrishni tekshirtiring.",
        },
      ],
      ru: [
        {
          title: "Почему устают глаза",
          body: "Глядя на экран, человек моргает реже, поверхность глаза пересыхает. Долгий взгляд вблизи напрягает глазные мышцы. В итоге могут появиться жжение, покраснение, затуманивание и головная боль.",
        },
        {
          title: "Правило 20-20-20 и рабочее место",
          body: "Каждые 20 минут на 20 секунд смотрите вдаль, примерно на 6 метров. Расположите экран на расстоянии вытянутой руки и чуть ниже уровня глаз, подстройте яркость под освещение комнаты. Специально чаще моргайте, проветривайте помещение.",
        },
        {
          title: "Вещества, важные для зрения",
          body: "Витамин A и цинк способствуют поддержанию нормального зрения. Лютеин и зеаксантин — каротиноиды, которые накапливаются в сетчатке; они есть в шпинате, капусте, кукурузе и яичном желтке. В Visiovit и Gold есть лютеин, A, E и цинк.",
        },
        {
          title: "Когда идти к врачу",
          body: "Если зрение резко ухудшилось, появились боль в глазу, сильное покраснение, круги вокруг света или «мушки» — сразу идите к офтальмологу. Если очки или линзы давно не обновлялись, проверьте зрение.",
        },
      ],
    },
    bullets: {
      uz: ["Har 20 daqiqada — 20 soniya uzoqqa", "Ekran — bir qoʻl uzunligida", "A va sink — normal koʻrish uchun", "Ogʻriq, keskin xiralik — oftalmologga"],
      ru: ["Каждые 20 минут — 20 секунд вдаль", "Экран — на вытянутую руку", "A и цинк — для нормального зрения", "Боль, резкое ухудшение — к офтальмологу"],
    },
    ingredientSlugs: ["zinc", "epa-dha"],
    productSlugs: ["swiss-energy-visiovit-30", "dr-frei-gold-vitamins-20"],
    categorySlugs: [],
    relatedSlugs: ["eyes", "lutein", "vitamin-a", "zinc"],
    faq: {
      uz: [
        { question: "Telefondan koʻz charchasa nima qilish kerak?", answer: "Tanaffus qiling, 20-20-20 qoidasiga amal qiling, ekran yorqinligini pasaytiring va tez-tez pirpirating. Quruqlik davom etsa, oftalmolog bilan maslahatlashing." },
        { question: "Lutein qanday ichiladi?", answer: "Visiovit — kuniga 1 kapsula, Gold — kuniga 1 shipuchi tabletka (14 yoshdan). Ikkalasini birga ichmang: tarkibi takrorlanadi." },
        { question: "Vitaminlar koʻzoynakni almashtiradimi?", answer: "Yoʻq. Vitamin A va sink normal koʻrishni saqlashga hissa qoʻshadi, lekin koʻzoynak, linza yoki oftalmolog tavsiyasining oʻrnini bosmaydi." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, bu biologik faol qoʻshimcha: dori vositasi emas va toʻliq ovqatlanishning oʻrnini bosmaydi." },
      ],
      ru: [
        { question: "Что делать, если глаза устают от телефона?", answer: "Делайте перерывы, соблюдайте правило 20-20-20, уменьшите яркость экрана и чаще моргайте. Если сухость не проходит, посоветуйтесь с офтальмологом." },
        { question: "Как принимать лютеин?", answer: "Visiovit — 1 капсула в день, Gold — 1 шипучая таблетка в день (с 14 лет). Не принимайте их вместе: состав повторяется." },
        { question: "Заменят ли витамины очки?", answer: "Нет. Витамин A и цинк способствуют поддержанию нормального зрения, но не заменяют очки, линзы или рекомендации офтальмолога." },
        { question: "Это лекарство?", answer: "Нет, это биологически активная добавка: не лекарственное средство и не замена полноценному питанию." },
      ],
    },
  },
  {
    kind: "symptom",
    slug: "fever",
    name: { uz: "Isitma: uyda harorat oʻlchash", ru: "Температура: как измерять дома" },
    headline: {
      uz: "Haroratni qanday toʻgʻri oʻlchash va qachon shifokorga qoʻngʻiroq qilish kerak",
      ru: "Как правильно измерить температуру и когда звонить врачу",
    },
    intro: {
      uz: "Isitma — organizmning infeksiyaga javobi. Uyda haroratni toʻgʻri oʻlchash, bolada nimaga eʼtibor berish va qanday belgilarda darhol yordam chaqirish kerakligi haqida.",
      ru: "Температура — ответ организма на инфекцию. Как правильно измерить её дома, на что обратить внимание у ребёнка и при каких признаках сразу вызывать помощь.",
    },
    sections: {
      uz: [
        {
          title: "Qanday harorat isitma hisoblanadi",
          body: "Qoʻltiq ostidagi harorat ichki (rektal) haroratdan biroz past chiqadi. Kattalarda qoʻltiq ostida 37,2 °C dan yuqori koʻrsatkich — koʻtarilgan, 38 °C va undan yuqori — isitma hisoblanadi. Harorat kun davomida oʻzgaradi: kechqurun biroz yuqoriroq boʻladi. Yugurish, issiq vanna yoki issiq ovqatdan keyin 20–30 daqiqa kutib oʻlchang.",
        },
        {
          title: "Elektron termometr bilan oʻlchash",
          body: "Qoʻltiq ostini quruq artib, termometr uchini qoʻltiq markaziga qoʻying va qoʻlni tanaga bosing. Signal chalinguncha kuting va natijani yozib qoʻying. Elektron termometrda simob yoʻq — sinib qolsa xavfsiz. Bolalar uchun egiluvchan uchli model qulay.",
        },
        {
          title: "Isitmali odamga uyda qanday yordam",
          body: "Koʻp suyuqlik bering, xonani shamollating, ortiqcha kiyim va adyolni oling. Sovutuvchi plastir peshonani sovutadi va bolaga qulaylik beradi, lekin haroratni tushiruvchi dori oʻrnini bosmaydi. Isitma tushiruvchi dorini faqat yosh va vaznga mos dozada, shifokor yoki qadoq koʻrsatmasi boʻyicha bering.",
        },
        {
          title: "Qachon darhol yordam chaqirish kerak",
          body: "3 oygacha chaqaloqda har qanday isitma (qoʻltiq ostida 37,2 °C dan yuqori yoki rektal 38 °C va undan yuqori); har qanday yoshda tutqanoq, bosilganda yoʻqolmaydigan toshma, nafas olish qiyinlashishi, uyquchanlik va uygʻotish qiyinligi, suyuqlik ichmaslik; isitma 3 kundan uzoq davom etsa — shifokorga murojaat qiling yoki 103 ga qoʻngʻiroq qiling.",
        },
      ],
      ru: [
        {
          title: "Какая температура считается повышенной",
          body: "Температура под мышкой немного ниже внутренней (ректальной). У взрослых показатель под мышкой выше 37,2 °C — повышенный, 38 °C и выше — лихорадка. В течение дня она меняется: вечером немного выше. После бега, горячей ванны или горячей еды подождите 20–30 минут.",
        },
        {
          title: "Как мерить электронным термометром",
          body: "Насухо протрите подмышку, поставьте наконечник в её центр и прижмите руку к телу. Дождитесь сигнала и запишите результат. В электронном термометре нет ртути — если он разобьётся, это безопасно. Детям удобна модель с гибким наконечником.",
        },
        {
          title: "Как помочь дома",
          body: "Давайте много жидкости, проветривайте комнату, снимите лишнюю одежду и одеяло. Охлаждающий пластырь охлаждает лоб и даёт ребёнку комфорт, но не заменяет жаропонижающее. Жаропонижающее давайте только в дозе по возрасту и весу, по указанию врача или инструкции.",
        },
        {
          title: "Когда сразу вызывать помощь",
          body: "Любая повышенная температура у младенца до 3 месяцев (под мышкой выше 37,2 °C или ректально 38 °C и выше); в любом возрасте судороги, сыпь, которая не исчезает при надавливании, затруднённое дыхание, вялость и трудно разбудить, отказ от питья; температура держится больше 3 дней — обратитесь к врачу или звоните 103.",
        },
      ],
    },
    bullets: {
      uz: ["Qoʻltiq ostida 37,2 °C dan yuqori — koʻtarilgan", "Elektron termometr — simobsiz", "Koʻp suyuqlik, shamollatish", "3 oygacha chaqaloqda isitma — darhol shifokor"],
      ru: ["Под мышкой выше 37,2 °C — повышенная", "Электронный термометр — без ртути", "Много жидкости, проветривание", "Температура у младенца до 3 месяцев — сразу к врачу"],
    },
    ingredientSlugs: ["vitamin-c", "vitamin-d3"],
    productSlugs: ["dr-frei-thermometer-t30", "dr-frei-thermometer-t10", "hiew-cooling-plaster-16"],
    categorySlugs: ["devices"],
    relatedSlugs: ["kids", "frequent-colds", "immunity"],
    faq: {
      uz: [
        { question: "Bolada haroratni qayerdan oʻlchash kerak?", answer: "Uyda koʻpincha qoʻltiq ostida oʻlchanadi. Kichik bolalar uchun egiluvchan uchli elektron termometr qulay. Qaysi usul toʻgʻri kelishini pediatr bilan aniqlang." },
        { question: "Sovutuvchi plastir isitmani tushiradimi?", answer: "Plastir peshonani sovutadi va qulaylik beradi, lekin isitma tushiruvchi dori emas. Haroratni termometr bilan kuzatib boring." },
        { question: "Necha darajada shifokorga qoʻngʻiroq qilish kerak?", answer: "3 oygacha chaqaloqda har qanday isitma bilan — darhol (qoʻltiq ostida 37,2 °C dan yuqori ham). Kattaroq bolada esa harorat raqamidan tashqari holatiga qarang: holsizlik, toshma, nafas qiyinlashishi yoki 3 kundan uzoq isitma — shifokorga." },
        { question: "Elektron termometr aniqmi?", answer: "Toʻgʻri ishlatilganda aniq: quruq qoʻltiq, uchi markazda, signalgacha kutish. Batareya kuchsizlansa natija ishonchsiz boʻlishi mumkin." },
      ],
      ru: [
        { question: "Где мерить температуру ребёнку?", answer: "Дома чаще всего под мышкой. Маленьким детям удобен электронный термометр с гибким наконечником. Какой способ подходит, уточните у педиатра." },
        { question: "Снижает ли температуру охлаждающий пластырь?", answer: "Пластырь охлаждает лоб и даёт комфорт, но это не жаропонижающее. Следите за температурой термометром." },
        { question: "При какой температуре звонить врачу?", answer: "У младенца до 3 месяцев — сразу при любой повышенной температуре (под мышкой выше 37,2 °C тоже). У ребёнка постарше смотрите не только на цифру, но и на состояние: вялость, сыпь, затруднённое дыхание или температура дольше 3 дней — к врачу." },
        { question: "Точен ли электронный термометр?", answer: "При правильном использовании — да: сухая подмышка, наконечник в центре, ждать сигнала. При слабой батарейке результат может быть ненадёжным." },
      ],
    },
  },
  {
    kind: "goal",
    slug: "blood-pressure",
    name: { uz: "Qon bosimini uyda nazorat qilish", ru: "Контроль давления дома" },
    headline: {
      uz: "Bosimni toʻgʻri oʻlchash, kundalik yuritish va kundalik odatlar",
      ru: "Как правильно измерять давление, вести дневник и какие привычки важны",
    },
    intro: {
      uz: "Yuqori qon bosimi koʻpincha hech qanday belgisiz kechadi, shuning uchun uni muntazam oʻlchash muhim. Uyda toʻgʻri oʻlchash qoidalari, meʼyor va qachon yordam chaqirish kerakligi haqida.",
      ru: "Повышенное давление часто протекает без симптомов, поэтому его важно регулярно измерять. Правила измерения дома, нормы и когда вызывать помощь.",
    },
    sections: {
      uz: [
        {
          title: "Qanday raqamlar meʼyor",
          body: "Kattalarda 120/80 mm sim. ust. dan past bosim meʼyor hisoblanadi. JSST maʼlumotiga koʻra bir necha kun takroriy oʻlchovlarda 140/90 va undan yuqori boʻlsa — bu yuqori qon bosimi, shifokor koʻrigi kerak. Bitta yuqori natija tashxis emas.",
        },
        {
          title: "Uyda toʻgʻri oʻlchash",
          body: "Oʻlchashdan 30 daqiqa oldin qahva ichmang, chekmang va jismoniy mashq qilmang. 5 daqiqa tinch oʻtiring, oyoqlarni chalishtirmang, orqani suyang. Manjetni yalangʻoch yelkaga, yurak darajasida taqing. 1 daqiqa oraliq bilan 2 marta oʻlchab, ikkalasini ham yozing.",
        },
        {
          title: "Kundalik yuriting",
          body: "Har kuni bir vaqtda — ertalab va kechqurun — oʻlchang va sana, vaqt, natija hamda puls bilan yozib boring. Qabulda shifokor bitta raqamga emas, bir necha haftalik kundalikka qarab xulosa qiladi.",
        },
        {
          title: "Bosim uchun foydali odatlar",
          body: "JSST tuzni kuniga 5 grammdan kam isteʼmol qilishni tavsiya qiladi. Koʻproq sabzavot va meva, muntazam piyoda yurish, meʼyoriy vazn, yetarli uyqu va chekmaslik — bosimni nazorat qilishning asosi. Kaliy qon bosimining normal darajasini saqlashga hissa qoʻshadi; u banan, dukkaklilar, kartoshka va quruq oʻrikda bor.",
        },
      ],
      ru: [
        {
          title: "Какие цифры считаются нормой",
          body: "У взрослых нормой считается давление ниже 120/80 мм рт. ст. По данным ВОЗ, если при повторных измерениях в разные дни давление 140/90 и выше — это повышенное давление, нужен осмотр врача. Один высокий результат — не диагноз.",
        },
        {
          title: "Как правильно измерять дома",
          body: "За 30 минут до измерения не пейте кофе, не курите и не занимайтесь спортом. Посидите спокойно 5 минут, не скрещивайте ноги, обопритесь спиной. Манжету наденьте на обнажённое плечо на уровне сердца. Измерьте 2 раза с интервалом 1 минута и запишите оба результата.",
        },
        {
          title: "Ведите дневник",
          body: "Измеряйте каждый день в одно время — утром и вечером — и записывайте дату, время, результат и пульс. На приёме врач делает выводы не по одной цифре, а по дневнику за несколько недель.",
        },
        {
          title: "Полезные привычки",
          body: "ВОЗ рекомендует меньше 5 граммов соли в день. Больше овощей и фруктов, регулярная ходьба, нормальный вес, достаточный сон и отказ от курения — основа контроля давления. Калий способствует поддержанию нормального кровяного давления; он есть в бананах, бобовых, картофеле и кураге.",
        },
      ],
    },
    bullets: {
      uz: ["Meʼyor — 120/80 dan past", "5 daqiqa tinchlik, keyin oʻlchash", "2 marta, 1 daqiqa oraliq bilan", "Kundalik — har kuni bir vaqtda"],
      ru: ["Норма — ниже 120/80", "5 минут покоя, потом измерение", "2 раза с интервалом 1 минута", "Дневник — каждый день в одно время"],
    },
    ingredientSlugs: ["magnesium", "epa-dha"],
    productSlugs: ["dr-frei-tonometr-a20"],
    categorySlugs: ["devices"],
    relatedSlugs: ["heart", "seniors", "magnesium", "omega-3"],
    faq: {
      uz: [
        { question: "Qaysi tonometr yaxshi: mexanik yoki elektron?", answer: "Ikkalasi ham toʻgʻri ishlatilganda aniq. Mexanik tonometr tok va batareyaga bogʻliq emas, lekin fonendoskop bilan ishlashni oʻrganish kerak. Qaysi biri sizga qulayligini shifokor bilan muhokama qiling." },
        { question: "Bosim qachon xavfli?", answer: "180/120 va undan yuqori chiqsa, 1 daqiqadan keyin qayta oʻlchang. Yana shunday boʻlsa-yu, hech qanday belgi boʻlmasa — shu kuni shifokorga murojaat qiling. Koʻkrak ogʻrigʻi, nafas qisishi, bel ogʻrigʻi, qoʻl-oyoqda holsizlik, nutq yoki koʻrish buzilishi boʻlsa — darhol 103 ga qoʻngʻiroq qiling." },
        { question: "Bosimni qaysi qoʻlda oʻlchash kerak?", answer: "Birinchi marta ikkala qoʻlda oʻlchang. Keyin doim yuqoriroq natija bergan qoʻlda oʻlchang va buni kundalikda belgilang." },
        { question: "Vitaminlar bosimni tushiradimi?", answer: "Qoʻshimcha bosim dorisining oʻrnini bosmaydi. Shifokor buyurgan dorini oʻz-oʻzidan toʻxtatmang; har qanday qoʻshimchani shifokor bilan kelishing." },
      ],
      ru: [
        { question: "Какой тонометр лучше: механический или электронный?", answer: "Оба точны при правильном использовании. Механический не зависит от сети и батареек, но с фонендоскопом нужно научиться работать. Какой удобнее вам, обсудите с врачом." },
        { question: "Когда давление опасно?", answer: "Если 180/120 и выше, через минуту измерьте повторно. Если снова так, но симптомов нет — в тот же день обратитесь к врачу. При боли в груди, одышке, боли в спине, слабости в руке или ноге, нарушении речи или зрения — сразу звоните 103." },
        { question: "На какой руке мерить давление?", answer: "В первый раз измерьте на обеих руках. Дальше всегда мерьте на той, где результат был выше, и отметьте это в дневнике." },
        { question: "Снижают ли витамины давление?", answer: "Добавка не заменяет лекарства от давления. Не отменяйте назначенные врачом препараты сами; любую добавку согласуйте с врачом." },
      ],
    },
  },
  {
    kind: "goal",
    slug: "menopause",
    name: { uz: "Menopauza davrida ayol salomatligi", ru: "Здоровье женщины в менопаузе" },
    headline: {
      uz: "45 yoshdan keyin: suyaklar, energiya, uyqu va shifokor bilan muloqot",
      ru: "После 45: кости, энергия, сон и разговор с врачом",
    },
    intro: {
      uz: "Menopauza — ayol hayotidagi tabiiy davr. Bu yillarda suyaklar, uyqu va kayfiyatga koʻproq eʼtibor kerak. Ovqatlanish, harakat va muhim moddalar haqida.",
      ru: "Менопауза — естественный период в жизни женщины. В эти годы костям, сну и настроению нужно больше внимания. О питании, движении и важных веществах.",
    },
    sections: {
      uz: [
        {
          title: "Bu davrda nima oʻzgaradi",
          body: "Menopauza odatda 45–55 yosh orasida boshlanadi. Estrogen kamayishi bilan issiqlik toʻlqinlari, terlash, uyqu buzilishi, kayfiyat oʻzgarishi boʻlishi mumkin. Suyak toʻqimasi yoʻqolishi ham tezlashadi, shuning uchun suyaklarga eʼtibor muhim.",
        },
        {
          title: "Suyaklar: kalsiy, D va K",
          body: "Kalsiy, vitamin D va vitamin K normal suyaklarni saqlashga hissa qoʻshadi. 51 yoshdan oshgan ayollarga kuniga 1200 mg kalsiy tavsiya etiladi (NIH) — avval sut mahsulotlari va kunjutdan oling. Calcivit — kalsiy, D3 va K2 bitta kapsulada.",
        },
        {
          title: "Energiya va asab tizimi",
          body: "Vitamin B6 gormonal faollikni boshqarishga, magniy va B6 asab tizimining normal ishlashiga, magniy esa charchoqni kamaytirishga hissa qoʻshadi. Antistress Magniy shipuchi tabletkasida magniy va B6 bor.",
        },
        {
          title: "Shifokor bilan gaplashing",
          body: "Issiqlik toʻlqinlari, uyqusizlik yoki kayfiyat tushkunligi hayotga xalaqit bersa, ginekolog bilan gaplashing — yordam usulini faqat shifokor tanlaydi. 45 yoshdan keyin suyak zichligi, qon bosimi va qand miqdorini muntazam tekshirtirib turing.",
        },
      ],
      ru: [
        {
          title: "Что меняется в этот период",
          body: "Менопауза обычно наступает в 45–55 лет. Со снижением эстрогенов могут появиться приливы, потливость, нарушения сна, перепады настроения. Потеря костной ткани ускоряется, поэтому костям нужно особое внимание.",
        },
        {
          title: "Кости: кальций, D и K",
          body: "Кальций, витамин D и витамин K способствуют поддержанию нормального состояния костей. Женщинам старше 51 года рекомендуют 1200 мг кальция в день (NIH) — сначала из молочных продуктов и кунжута. Calcivit — кальций, D3 и K2 в одной капсуле.",
        },
        {
          title: "Энергия и нервная система",
          body: "Витамин B6 способствует регуляции гормональной активности, магний и B6 — нормальной работе нервной системы, а магний — уменьшению усталости. В шипучей таблетке Antistress Магний есть магний и B6.",
        },
        {
          title: "Поговорите с врачом",
          body: "Если приливы, бессонница или подавленное настроение мешают жить, поговорите с гинекологом — способы помощи выбирает только врач. После 45 регулярно проверяйте плотность костей, давление и уровень сахара.",
        },
      ],
    },
    bullets: {
      uz: ["51 yoshdan: 1200 mg kalsiy kuniga", "Kalsiy + D3 + K2 — suyaklar uchun", "Magniy va B6 — asab tizimi uchun", "Issiqlik toʻlqinlari — ginekologga"],
      ru: ["С 51 года: 1200 мг кальция в день", "Кальций + D3 + K2 — для костей", "Магний и B6 — для нервной системы", "Приливы — к гинекологу"],
    },
    ingredientSlugs: ["calcium", "vitamin-d3", "vitamin-k2", "magnesium"],
    productSlugs: ["swiss-energy-calcivit-30", "dr-frei-antistress-magniy-20", "swiss-energy-nature-collagen", "dr-frei-tonometr-a20"],
    categorySlugs: [],
    relatedSlugs: ["women", "joints", "calcium", "magnesium"],
    faq: {
      uz: [
        { question: "Menopauzada qaysi vitaminlar kerak?", answer: "Koʻpincha kalsiy, vitamin D va K (suyaklar uchun), magniy va B6 (asab tizimi uchun) haqida gapiriladi. Tahlil natijasiga qarab nima kerakligini shifokor bilan aniqlang." },
        { question: "Vitaminlar issiqlik toʻlqinlarini toʻxtatadimi?", answer: "Bunday vaʼda bermaymiz. Issiqlik toʻlqinlari bezovta qilsa, ginekolog bilan gaplashing — yordam usulini shifokor tanlaydi." },
        { question: "Kalsiyni qancha ichish kerak?", answer: "51 yoshdan oshgan ayollarga jami 1200 mg kuniga tavsiya etiladi — bunga ovqatdagi kalsiy ham kiradi. Ortiqcha kalsiy foyda bermaydi." },
        { question: "Bu dori vositasimi?", answer: "Yoʻq, bu biologik faol qoʻshimcha: dori vositasi emas va toʻliq ovqatlanishning oʻrnini bosmaydi." },
      ],
      ru: [
        { question: "Какие витамины нужны в менопаузе?", answer: "Чаще всего говорят о кальции, витаминах D и K (для костей), магнии и B6 (для нервной системы). Что нужно именно вам, решите с врачом по анализам." },
        { question: "Остановят ли витамины приливы?", answer: "Такого обещания мы не даём. Если приливы беспокоят, поговорите с гинекологом — способ помощи выбирает врач." },
        { question: "Сколько нужно кальция?", answer: "Женщинам старше 51 года рекомендуют всего 1200 мг в день — включая кальций из еды. Лишний кальций пользы не даёт." },
        { question: "Это лекарство?", answer: "Нет, это биологически активная добавка: не лекарственное средство и не замена полноценному питанию." },
      ],
    },
  },
];
