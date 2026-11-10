import type { RawArticle } from "./blog";

/* Second half of the November set (docs/HOLAT.md → Trafik T2); same rules as blog-articles-2026-11.ts. */
export const articlesNov2026b: RawArticle[] = [
  {
    slug: "shipuchi-vitaminlar-qanday-ichiladi",
    date: "2026-11-10",
    imageSeed: "blog-effervescent",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Shipuchi vitaminlar: qanday ichiladi va kimga mos",
      ru: "Шипучие витамины: как принимать и кому подходят",
    },
    excerpt: {
      uz: "Shipuchi tabletka nima, oddiy tabletkadan farqi, toʻgʻri eritish qoidasi va natriy haqida bilish kerak boʻlgan narsalar.",
      ru: "Что такое шипучая таблетка, чем она отличается от обычной, как правильно растворять и что нужно знать о натрии.",
    },
    sections: [
      {
        heading: { uz: "Shipuchi tabletka nima", ru: "Что такое шипучая таблетка" },
        paragraphs: {
          uz: [
            "Shipuchi tabletka tarkibida vitaminlardan tashqari limon kislotasi va soda (natriy gidrokarbonat) boʻladi. Suvga tushganda ular reaksiyaga kirishib, karbonat angidrid pufakchalarini hosil qiladi — tabletka bir necha daqiqada toʻliq eriydi.",
            "Natijada vitamin ichimlik shaklida qabul qilinadi. Tabletkani yutish qiyin boʻlgan odamlar uchun bu qulay, koʻpchilik uchun esa kunlik suv ichish odatiga ham qoʻshiladi.",
          ],
          ru: [
            "Кроме витаминов, в шипучей таблетке есть лимонная кислота и сода (гидрокарбонат натрия). В воде они реагируют и образуют пузырьки углекислого газа — таблетка за несколько минут полностью растворяется.",
            "В итоге витамин принимается в виде напитка. Это удобно тем, кому трудно глотать таблетки, а многим помогает и выпить лишний стакан воды за день.",
          ],
        },
      },
      {
        heading: { uz: "Qanday toʻgʻri ichish kerak", ru: "Как правильно принимать" },
        paragraphs: {
          uz: [
            "Tabletkani bir stakan (taxminan 200 ml) xona haroratidagi suvga soling va toʻliq erishini kuting. Issiq suv vitamin C kabi moddalarga yaxshi taʼsir qilmaydi, shuning uchun qaynoq suvdan foydalanmang.",
            "Tabletkani tilga qoʻymang, chaynamang va butunligicha yutmang. Qadoqda yozilgan miqdordan oshirmang: koʻpincha bu kuniga bitta tabletka.",
          ],
          ru: [
            "Опустите таблетку в стакан (около 200 мл) воды комнатной температуры и дождитесь полного растворения. Горячая вода плохо сказывается на таких веществах, как витамин C, поэтому кипяток не используйте.",
            "Не кладите таблетку на язык, не разжёвывайте и не глотайте целиком. Не превышайте количество, указанное на упаковке: чаще всего это одна таблетка в день.",
          ],
        },
      },
      {
        heading: { uz: "Natriy va kimga ehtiyot boʻlish kerak", ru: "Натрий и кому быть осторожнее" },
        paragraphs: {
          uz: [
            "Shipuchi shakl uchun ishlatiladigan soda tufayli har bir tabletkada natriy boʻladi — miqdori qadoqda yozilgan. Tuz cheklangan parhezda boʻlganlar, yuqori qon bosimi yoki buyrak kasalligi bor odamlar buni hisobga olishi va shifokor bilan maslahatlashishi kerak.",
            "Shuningdek, shipuchi tabletkalar kislotali boʻladi: ichgandan keyin ogʻizni suv bilan chayqash tish emali uchun foydali odat.",
          ],
          ru: [
            "Из-за соды, нужной для шипучей формы, в каждой таблетке есть натрий — его количество указано на упаковке. Тем, кто на диете с ограничением соли, людям с повышенным давлением или заболеваниями почек стоит это учитывать и посоветоваться с врачом.",
            "Кроме того, шипучие таблетки кислые: после приёма полезно прополоскать рот водой — это бережёт зубную эмаль.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi biri kimga", ru: "Что кому подходит" },
        paragraphs: {
          uz: [
            "Dr. Frei liniyasida turli tarkiblar bor: Multivitamins + Biotin — A, B guruhi, C, D3, E va biotin; Antistress — magniy, B6, taurin, C va K vitaminlari; Gold — lyutein va A, C, E, sink; Kids — 7 yoshdan bolalar uchun. Swiss Energy Vitamin C — 550 mg vitamin C.",
            "Bir vaqtda bir nechta multivitamin ichmang: tarkiblar takrorlanib, ayrim vitaminlar meʼyordan oshib ketadi. Qaysi biri sizga mosligini shifokor yoki farmatsevt bilan aniqlang.",
          ],
          ru: [
            "В линейке Dr. Frei разные составы: Multivitamins + Biotin — A, группа B, C, D3, E и биотин; Antistress — магний, B6, таурин, витамины C и K; Gold — лютеин и A, C, E, цинк; Kids — для детей с 7 лет. Swiss Energy Vitamin C — 550 мг витамина C.",
            "Не принимайте несколько мультивитаминов одновременно: составы повторяются, и отдельные витамины превышают норму. Какой подходит вам — уточните у врача или фармацевта.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Ochligda ichsa boʻladimi? Mumkin, lekin oshqozoni sezgir odamlarga ovqatdan keyin ichish qulayroq.",
            "Erigan ichimlikni keyinroq ichsa boʻladimi? Yoʻq, uni darhol ichgan maʼqul: vaqt oʻtishi bilan ayrim vitaminlar parchalanadi.",
            "Tubani qanday saqlash kerak? Qopqogʻini mahkam yopib, quruq joyda. Namlik tushsa, tabletkalar oldindan «shipillab» buziladi.",
          ],
          ru: [
            "Можно ли пить натощак? Можно, но людям с чувствительным желудком удобнее после еды.",
            "Можно ли выпить раствор позже? Нет, лучше выпить сразу: со временем часть витаминов разрушается.",
            "Как хранить тубу? Плотно закрытой, в сухом месте. Если попадёт влага, таблетки заранее начнут шипеть и испортятся.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-multivitamins-biotin-20", "dr-frei-antistress-magniy-20", "swiss-energy-vitamin-c-20", "dr-frei-gold-vitamins-20"],
  },
  {
    slug: "vitamin-c-qancha-kerak",
    date: "2026-11-10",
    imageSeed: "blog-vitaminc",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Vitamin C: kuniga qancha kerak va qanday ichiladi",
      ru: "Витамин C: сколько нужно в день и как принимать",
    },
    excerpt: {
      uz: "Vitamin C kunlik meʼyori, ovqatdagi manbalari, katta dozalar haqida va 550 mg tabletka kimga mos kelishi.",
      ru: "Суточная норма витамина C, его источники в еде, что известно о больших дозах и кому подходит таблетка 550 мг.",
    },
    sections: [
      {
        heading: { uz: "Vitamin C nima uchun kerak", ru: "Зачем нужен витамин C" },
        paragraphs: {
          uz: [
            "Vitamin C (askorbin kislotasi) suvda eriydigan vitamin. Organizm uni oʻzi ishlab chiqarmaydi va katta zaxira ham qilmaydi, shuning uchun u har kuni ovqat bilan kelishi kerak.",
            "U immun tizimining meʼyoriy ishlashida, kollagen hosil boʻlishida va temirning oʻzlashtirilishida ishtirok etadi, shuningdek hujayralarni oksidlovchi stressdan himoya qilishga hissa qoʻshadi.",
          ],
          ru: [
            "Витамин C (аскорбиновая кислота) — водорастворимый витамин. Организм не вырабатывает его сам и не делает больших запасов, поэтому он должен поступать с едой каждый день.",
            "Он участвует в нормальной работе иммунной системы, образовании коллагена и усвоении железа, а также вносит вклад в защиту клеток от окислительного стресса.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor", ru: "Суточная норма" },
        paragraphs: {
          uz: [
            "Kattalar uchun tavsiya etilgan miqdor taxminan 75–90 mg (Yevropa yorliqlarida 80 mg). Chekadiganlarga kuniga taxminan 35 mg koʻproq kerak. Kattalar uchun xavfsiz yuqori chegara kuniga 2000 mg deb hisoblanadi.",
            "Bitta apelsin, yarim bulgʻor qalampiri yoki bir hovuch qulupnay kunlik meʼyorning katta qismini beradi. Kivi, karam, petrushka va itburun ham boy manbalar.",
          ],
          ru: [
            "Рекомендуемое количество для взрослых — около 75–90 мг (на европейских этикетках — 80 мг). Курящим нужно примерно на 35 мг в день больше. Безопасным верхним пределом для взрослых считается 2000 мг в день.",
            "Один апельсин, половина болгарского перца или горсть клубники дают большую часть суточной нормы. Богатые источники — также киви, капуста, петрушка и шиповник.",
          ],
        },
      },
      {
        heading: { uz: "550 mg tabletka kimga", ru: "Кому таблетка 550 мг" },
        paragraphs: {
          uz: [
            "550 mg — kunlik meʼyordan bir necha barobar koʻp, lekin xavfsiz chegaradan ancha past. Bunday dozani odatda meva-sabzavotni kam isteʼmol qiladiganlar, chekadiganlar yoki qishki mavsumda qoʻshimcha manba istaganlar tanlaydi.",
            "Katta dozada vitamin C ning soʻrilish ulushi kamayadi, ortiqchasi esa siydik bilan chiqadi. Shuning uchun «qancha koʻp boʻlsa, shuncha yaxshi» degan qoida bu yerda ishlamaydi.",
          ],
          ru: [
            "550 мг — это в несколько раз больше суточной нормы, но заметно ниже безопасного предела. Такую дозу обычно выбирают те, кто мало ест овощей и фруктов, курит или хочет дополнительный источник в зимний сезон.",
            "При больших дозах доля всасываемого витамина C снижается, а избыток выводится с мочой. Поэтому правило «чем больше, тем лучше» здесь не работает.",
          ],
        },
      },
      {
        heading: { uz: "Ehtiyot choralari", ru: "Меры предосторожности" },
        paragraphs: {
          uz: [
            "Katta dozalar ayrim odamlarda oshqozon bezovtaligi va ich ketishiga olib kelishi mumkin. Buyrakda tosh boʻlgan yoki boʻlgan odamlar, temir almashinuvi buzilgan (gemoxromatoz) bemorlar yuqori dozani shifokor bilan kelishib qabul qilishi kerak.",
          ],
          ru: [
            "Большие дозы у некоторых людей могут вызывать дискомфорт в желудке и диарею. Людям с камнями в почках (в том числе в прошлом) и с нарушением обмена железа (гемохроматозом) высокие дозы стоит принимать только по согласованию с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Qachon ichgan yaxshi? Kunning birinchi yarmida, ovqat paytida yoki undan keyin — oshqozon uchun yumshoqroq.",
            "Temir bilan birga ichsa boʻladimi? Ha, vitamin C oʻsimlik manbasidagi temirning soʻrilishiga yordam beradi. Faqat temir preparatining dozasi shifokor tavsiyasida boʻlsin.",
            "Bolalarga 550 mg berish mumkinmi? Yoʻq, bu kattalar dozasi. Bolalar uchun yoshiga mos mahsulot va doza pediatr bilan tanlanadi.",
          ],
          ru: [
            "Когда лучше принимать? В первой половине дня, во время или после еды — так мягче для желудка.",
            "Можно ли вместе с железом? Да, витамин C помогает усвоению железа из растительных источников. Только дозу железа пусть определит врач.",
            "Можно ли давать 550 мг детям? Нет, это взрослая доза. Для детей продукт и дозу по возрасту подбирают с педиатром.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-vitamin-c-20", "swiss-energy-immunovit-30", "dr-frei-multivitamins-biotin-20"],
  },
  {
    slug: "koz-uchun-vitaminlar-lyutein",
    date: "2026-11-10",
    imageSeed: "blog-eyes",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "Koʻz uchun vitaminlar: lyutein va zeaksantin nima",
      ru: "Витамины для глаз: что такое лютеин и зеаксантин",
    },
    excerpt: {
      uz: "Lyutein va zeaksantin koʻzning qaysi qismida boʻladi, ovqatdagi manbalari, A vitamini va sinkning roli hamda qanday ichish kerak.",
      ru: "Где в глазу находятся лютеин и зеаксантин, их источники в еде, роль витамина A и цинка и как их принимать.",
    },
    sections: [
      {
        heading: { uz: "Lyutein va zeaksantin", ru: "Лютеин и зеаксантин" },
        paragraphs: {
          uz: [
            "Lyutein va zeaksantin — karotinoidlar, yaʼni oʻsimliklardagi sariq pigmentlar. Koʻzda ular toʻr pardaning markaziy qismida — sariq dogʻda (makulada) toʻplanadi. Organizm ularni oʻzi ishlab chiqarmaydi, faqat ovqatdan oladi.",
            "Eng boy manbalar — ismaloq, karam, brokkoli, yashil noʻxat, makkajoʻxori va tuxum sarigʻi. Kundalik ovqatda koʻkatlar kam boʻlsa, bu moddalar ham kam keladi.",
          ],
          ru: [
            "Лютеин и зеаксантин — каротиноиды, жёлтые пигменты растений. В глазу они накапливаются в центральной части сетчатки — жёлтом пятне (макуле). Организм их не вырабатывает и получает только с едой.",
            "Самые богатые источники — шпинат, капуста, брокколи, зелёный горошек, кукуруза и яичный желток. Если в ежедневном меню мало зелени, этих веществ тоже поступает мало.",
          ],
        },
      },
      {
        heading: { uz: "A vitamini va sink", ru: "Витамин A и цинк" },
        paragraphs: {
          uz: [
            "A vitamini meʼyoriy koʻrish uchun zarur — u toʻr pardadagi yorugʻlikni sezuvchi pigment tarkibiga kiradi. Sink A vitamini almashinuvida ishtirok etadi va u ham meʼyoriy koʻrishni saqlashga hissa qoʻshadi.",
            "Shuning uchun koʻz uchun komplekslarda lyutein koʻpincha A, E vitaminlari va sink bilan birga keladi. Masalan, Swiss Energy Visiovit tarkibida lyutein 10 mg, zeaksantin 2 mg, chernika ekstrakti, A, E vitaminlari va sink bor.",
          ],
          ru: [
            "Витамин A необходим для нормального зрения — он входит в состав светочувствительного пигмента сетчатки. Цинк участвует в обмене витамина A и тоже вносит вклад в поддержание нормального зрения.",
            "Поэтому в комплексах для глаз лютеин часто сочетают с витаминами A, E и цинком. Например, в Swiss Energy Visiovit — лютеин 10 мг, зеаксантин 2 мг, экстракт черники, витамины A, E и цинк.",
          ],
        },
      },
      {
        heading: { uz: "Qanday ichish kerak", ru: "Как принимать" },
        paragraphs: {
          uz: [
            "Lyutein yogʻda eriydigan modda, shuning uchun uni tarkibida ozgina yogʻ boʻlgan ovqat bilan ichgan maʼqul — masalan, tushlik paytida. Natijani kutish uchun odatda bir necha oy muntazam qabul qilinadi.",
            "Chekuvchilar uchun beta-karotinli yuqori dozali komplekslar tavsiya etilmaydi — buni tarkibni tanlashda hisobga oling. A vitamini homiladorlikda ham alohida eʼtibor talab qiladi.",
          ],
          ru: [
            "Лютеин жирорастворим, поэтому его лучше принимать с едой, где есть немного жира, — например, в обед. Чтобы оценить эффект, его обычно принимают регулярно несколько месяцев.",
            "Курящим не рекомендуют комплексы с высокими дозами бета-каротина — учитывайте это при выборе состава. Витамин A требует отдельного внимания и при беременности.",
          ],
        },
      },
      {
        heading: { uz: "Ekran oldida koʻzni asrash odatlari", ru: "Привычки для глаз за экраном" },
        paragraphs: {
          uz: [
            "«20-20-20» qoidasi: har 20 daqiqada 20 soniya davomida 6 metr (20 fut) uzoqlikdagi narsaga qarang. Ekran yorqinligini xona yorugʻligiga moslang, koʻz quriganda tez-tez koʻz qisib turing.",
            "Koʻrish yomonlashsa, koʻz qizarsa, ogʻriq yoki «chivinlar» paydo boʻlsa — vitamin emas, oftalmolog koʻrigi kerak. Yiliga bir marta koʻz shifokorida tekshiruvdan oʻtish foydali.",
          ],
          ru: [
            "Правило «20-20-20»: каждые 20 минут на 20 секунд смотрите на предмет в 6 метрах (20 футах). Подстройте яркость экрана под освещение комнаты, при сухости чаще моргайте.",
            "Если зрение ухудшается, глаза краснеют, появились боль или «мушки» — нужны не витамины, а осмотр офтальмолога. Раз в год проверяться у окулиста полезно.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Chernika koʻzga foydalimi? Chernika tarkibida antotsianlar bor va u komplekslarga koʻp qoʻshiladi. Uni koʻrishni oʻzgartiradigan vosita deb hisoblamang — u umumiy ratsionning bir qismi.",
            "Bolalarga mumkinmi? Kattalar kompleksi bolalarga berilmaydi. Bola uchun har qanday qoʻshimcha pediatr bilan tanlanadi.",
            "Kontakt linza taqsam, ichsam boʻladimi? Ha, linzalar va lyutein bir-biriga taʼsir qilmaydi. Koʻz qurishida esa oftalmolog maslahatini oling.",
          ],
          ru: [
            "Полезна ли черника для глаз? В чернике есть антоцианы, её часто добавляют в комплексы. Не стоит считать её средством, меняющим зрение, — это часть общего рациона.",
            "Можно ли детям? Взрослый комплекс детям не дают. Любую добавку ребёнку подбирают с педиатром.",
            "Можно ли принимать при контактных линзах? Да, линзы и лютеин друг на друга не влияют. При сухости глаз посоветуйтесь с офтальмологом.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-visiovit-30", "dr-frei-gold-vitamins-20"],
  },
  {
    slug: "soch-va-tirnoq-uchun-biotin",
    date: "2026-11-10",
    imageSeed: "blog-hair",
    category: { uz: "Goʻzallik", ru: "Красота" },
    categoryKey: "nutrition",
    title: {
      uz: "Soch va tirnoq uchun biotin: kimga kerak",
      ru: "Биотин для волос и ногтей: кому он нужен",
    },
    excerpt: {
      uz: "Biotin, sink va boshqa moddalar soch va tirnoq uchun qanday rol oʻynaydi, soch toʻkilishining sabablari va tahlildan oldin nimani bilish kerak.",
      ru: "Какую роль биотин, цинк и другие вещества играют для волос и ногтей, причины выпадения волос и что важно знать перед анализами.",
    },
    sections: [
      {
        heading: { uz: "Biotin nima", ru: "Что такое биотин" },
        paragraphs: {
          uz: [
            "Biotin — B guruhiga kiruvchi vitamin (B7, ilgari H vitamini deb atalgan). U ovqatdagi yogʻ, uglevod va oqsillardan energiya olishda ishtirok etadi hamda meʼyoriy soch va terini saqlashga hissa qoʻshadi.",
            "Biotin tuxum sarigʻi, yongʻoq, urugʻlar, jigar, dukkaklilar va suli yormasida bor. Xilma-xil ovqatlanadigan odamlarda uning jiddiy yetishmasligi kam uchraydi.",
          ],
          ru: [
            "Биотин — витамин группы B (B7, раньше его называли витамином H). Он участвует в получении энергии из жиров, углеводов и белков пищи и вносит вклад в поддержание нормального состояния волос и кожи.",
            "Биотин есть в яичном желтке, орехах, семечках, печени, бобовых и овсянке. При разнообразном питании выраженный дефицит встречается редко.",
          ],
        },
      },
      {
        heading: { uz: "Sink, selen va oqsil", ru: "Цинк, селен и белок" },
        paragraphs: {
          uz: [
            "Sink meʼyoriy soch, tirnoq va terini saqlashda ishtirok etadi, selen esa meʼyoriy soch va tirnoq uchun kerak. Soch asosan keratin oqsilidan iborat, shuning uchun ovqatda yetarli oqsil boʻlishi ham muhim.",
            "Soch, tirnoq va teri uchun komplekslarda bu moddalar koʻpincha birga keladi. Masalan, Swiss Energy Hair Nail & Skin tarkibida biotin, sink, B guruhi vitaminlari, L-sistein va L-metionin bor.",
          ],
          ru: [
            "Цинк участвует в поддержании нормального состояния волос, ногтей и кожи, а селен нужен для нормальных волос и ногтей. Волосы в основном состоят из белка кератина, поэтому важно и достаточное количество белка в рационе.",
            "В комплексах для волос, ногтей и кожи эти вещества часто сочетают. Например, в Swiss Energy Hair Nail & Skin — биотин, цинк, витамины группы B, L-цистеин и L-метионин.",
          ],
        },
      },
      {
        heading: { uz: "Soch toʻkilishining sabablari", ru: "Причины выпадения волос" },
        paragraphs: {
          uz: [
            "Kuniga 50–100 tagacha soch toʻkilishi meʼyor hisoblanadi. Koʻproq toʻkilsa, sabab turlicha boʻlishi mumkin: temir yetishmasligi, qalqonsimon bez muammolari, kuchli stress, tugʻruqdan keyingi davr, qattiq parhez yoki irsiyat.",
            "Shuning uchun soch kuchli toʻkilganda avval sababni aniqlash kerak — terapevt yoki trixolog tahlil buyuradi. Vitamin kompleksi sabab topilgandan keyin yordamchi vosita boʻlishi mumkin.",
          ],
          ru: [
            "Выпадение до 50–100 волос в день считается нормой. Если больше, причины бывают разные: дефицит железа, проблемы со щитовидной железой, сильный стресс, послеродовой период, жёсткие диеты или наследственность.",
            "Поэтому при сильном выпадении сначала нужно найти причину — терапевт или трихолог назначит анализы. Витаминный комплекс может стать вспомогательным средством уже после этого.",
          ],
        },
      },
      {
        heading: { uz: "Muhim: biotin va qon tahlillari", ru: "Важно: биотин и анализы крови" },
        paragraphs: {
          uz: [
            "Biotin ayrim laboratoriya tahlillarining natijasini oʻzgartirishi mumkin — masalan, qalqonsimon bez gormonlari va troponin tahlillari. Tahlil topshirishdan oldin shifokorga biotin ichayotganingizni ayting; odatda tahlildan 2–3 kun oldin uni toʻxtatish tavsiya qilinadi.",
          ],
          ru: [
            "Биотин может искажать результаты некоторых лабораторных анализов — например, на гормоны щитовидной железы и тропонин. Перед сдачей анализов скажите врачу, что принимаете биотин; обычно его советуют прекратить за 2–3 дня до анализа.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Natija qachon koʻrinadi? Soch oyiga taxminan 1 sm oʻsadi, tirnoq ham sekin yangilanadi. Shuning uchun kurs odatda kamida 2–3 oy davom ettiriladi.",
            "Biotin va kollagenni birga ichsa boʻladimi? Ha, ular turli moddalar va bir-biriga xalaqit bermaydi. Faqat bir vaqtda bir nechta multivitamin ichmang.",
            "Erkaklarga mos keladimi? Ha, bu komplekslar jinsga bogʻliq emas.",
          ],
          ru: [
            "Когда будет виден результат? Волосы растут примерно на 1 см в месяц, ногти тоже обновляются медленно. Поэтому курс обычно продолжают не меньше 2–3 месяцев.",
            "Можно ли биотин вместе с коллагеном? Да, это разные вещества, они друг другу не мешают. Только не принимайте одновременно несколько мультивитаминов.",
            "Подходит ли мужчинам? Да, такие комплексы не зависят от пола.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-hair-nail-skin-30", "dr-frei-multivitamins-biotin-20", "swiss-energy-nature-collagen"],
  },
  {
    slug: "erkaklar-uchun-vitaminlar",
    date: "2026-11-10",
    imageSeed: "blog-men",
    category: { uz: "Erkaklar salomatligi", ru: "Мужское здоровье" },
    categoryKey: "lifestyle",
    title: {
      uz: "Erkaklar uchun vitaminlar: sink, D, magniy va B",
      ru: "Витамины для мужчин: цинк, D, магний и группа B",
    },
    excerpt: {
      uz: "Erkaklar organizmi uchun qaysi vitamin va minerallar muhim, ular qayerdan olinadi va kompleksni qanday tanlash kerak.",
      ru: "Какие витамины и минералы важны для мужского организма, где их взять и как выбрать комплекс.",
    },
    sections: [
      {
        heading: { uz: "Sink va selen", ru: "Цинк и селен" },
        paragraphs: {
          uz: [
            "Sink qonda testosteronning meʼyoriy darajasini saqlashda va meʼyoriy reproduktiv funksiyada ishtirok etadi. Selen meʼyoriy spermatogenez uchun kerak. Ikkalasi ham ovqatdan keladi: sink — goʻsht, dengiz mahsulotlari, kungaboqar va qovoq urugʻi; selen — baliq, tuxum, braziliya yongʻogʻi.",
            "Sink yuqori dozada uzoq ichilsa, misning oʻzlashtirilishini kamaytirishi mumkin — shuning uchun «koʻproq» emas, «yetarli» miqdor muhim.",
          ],
          ru: [
            "Цинк участвует в поддержании нормального уровня тестостерона в крови и нормальной репродуктивной функции. Селен нужен для нормального сперматогенеза. Оба поступают с едой: цинк — мясо, морепродукты, семена подсолнечника и тыквы; селен — рыба, яйца, бразильский орех.",
            "Длительный приём больших доз цинка может снижать усвоение меди — поэтому важно не «побольше», а «достаточно».",
          ],
        },
      },
      {
        heading: { uz: "D vitamini va magniy", ru: "Витамин D и магний" },
        paragraphs: {
          uz: [
            "Koʻp vaqtini ofisda oʻtkazadigan erkaklarda, ayniqsa qishda, D vitamini darajasi pasayishi mumkin. U suyak va mushaklarning meʼyoriy holati uchun kerak; darajani tahlil koʻrsatadi.",
            "Magniy mushak va asab tizimining meʼyoriy ishlashida ishtirok etadi va charchoq hissini kamaytirishga hissa qoʻshadi. Jismoniy yuklama va koʻp terlashda unga ehtiyoj oshadi. Dr. Frei Antistress shipuchi tabletkasi — magniy va B6 manbai.",
          ],
          ru: [
            "У мужчин, которые много времени проводят в офисе, особенно зимой, уровень витамина D может снижаться. Он нужен для нормального состояния костей и мышц; уровень покажет анализ.",
            "Магний участвует в нормальной работе мышц и нервной системы и вносит вклад в уменьшение усталости. При физических нагрузках и сильной потливости потребность в нём растёт. Шипучая таблетка Dr. Frei Antistress — источник магния и B6.",
          ],
        },
      },
      {
        heading: { uz: "B guruhi vitaminlari", ru: "Витамины группы B" },
        paragraphs: {
          uz: [
            "B guruhi vitaminlari ovqatdan energiya olishda va asab tizimining meʼyoriy ishlashida ishtirok etadi. B12 asosan hayvon mahsulotlarida boʻladi, shuning uchun goʻsht kam yeydiganlar unga alohida eʼtibor berishi kerak. Swiss Energy NeuroForce — B1 dan B12 gacha bir kapsulada.",
          ],
          ru: [
            "Витамины группы B участвуют в получении энергии из пищи и нормальной работе нервной системы. B12 содержится в основном в продуктах животного происхождения, поэтому тем, кто мало ест мяса, стоит уделить ему внимание. Swiss Energy NeuroForce — от B1 до B12 в одной капсуле.",
          ],
        },
      },
      {
        heading: { uz: "Kompleksni qanday tanlash", ru: "Как выбрать комплекс" },
        paragraphs: {
          uz: [
            "Erkaklar uchun komplekslar odatda sink, selen, D va B guruhi vitaminlari, baʼzan oʻsimlik ekstraktlari bilan chiqariladi. Masalan, Swiss Energy Potenton — kuniga bitta kapsula, 30 kunlik kurs. Tarkibni qadoqdan oʻqing va bir vaqtda ikkita kompleks ichmang.",
            "Doimiy dori ichsangiz, yurak yoki buyrak kasalligi boʻlsa — kompleksni shifokor bilan kelishib tanlang. Charchoq, uyqusizlik yoki kayfiyat oʻzgarishi uzoq davom etsa, sababi vitamin yetishmasligida boʻlmasligi mumkin — tekshiruvdan oʻting.",
          ],
          ru: [
            "Мужские комплексы обычно содержат цинк, селен, витамины D и группы B, иногда растительные экстракты. Например, Swiss Energy Potenton — одна капсула в день, курс 30 дней. Читайте состав на упаковке и не принимайте два комплекса одновременно.",
            "Если вы постоянно принимаете лекарства, есть болезни сердца или почек — выбирайте комплекс вместе с врачом. Если усталость, плохой сон или перепады настроения длятся долго, причина может быть не в нехватке витаминов — пройдите обследование.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Sport bilan shugʻullansam, vitamin koʻproq kerakmi? Yuklama oshganda magniy, B guruhi va suyuqlikka ehtiyoj ortadi. Lekin asos — yetarli ovqat va uyqu.",
            "Kursni qancha ichish kerak? Odatda qadoqdagi kurs (masalan, 30 kun), keyin tanaffus. Uzoq muddatli qabulni shifokor bilan kelishing.",
            "Spirtli ichimlik vitaminlarga taʼsir qiladimi? Ha, spirtli ichimlik B guruhi vitaminlari, magniy va sinkning oʻzlashtirilishini yomonlashtiradi.",
          ],
          ru: [
            "Нужно ли больше витаминов при занятиях спортом? При нагрузках растёт потребность в магнии, витаминах группы B и жидкости. Но основа — достаточное питание и сон.",
            "Сколько длится курс? Обычно курс по упаковке (например, 30 дней), затем перерыв. Длительный приём согласуйте с врачом.",
            "Влияет ли алкоголь на витамины? Да, алкоголь ухудшает усвоение витаминов группы B, магния и цинка.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-potenton-30", "swiss-energy-neuroforce-30", "dr-frei-antistress-magniy-20"],
  },
  {
    slug: "immunitet-uchun-vitaminlar-sink-va-c",
    date: "2026-11-10",
    imageSeed: "blog-immunity",
    category: { uz: "Immunitet", ru: "Иммунитет" },
    categoryKey: "vitamins",
    title: {
      uz: "Immunitet uchun vitaminlar: C, D, sink va selen",
      ru: "Витамины для иммунитета: C, D, цинк и селен",
    },
    excerpt: {
      uz: "Immun tizimining meʼyoriy ishlashi uchun qaysi vitamin va minerallar kerak, ular qayerda boʻladi va turmush tarzi nimani hal qiladi.",
      ru: "Какие витамины и минералы нужны для нормальной работы иммунной системы, где они содержатся и что решает образ жизни.",
    },
    sections: [
      {
        heading: { uz: "Qaysi moddalar ishtirok etadi", ru: "Какие вещества участвуют" },
        paragraphs: {
          uz: [
            "Immun tizimining meʼyoriy ishlashida C va D vitaminlari, sink, selen va A vitamini ishtirok etadi. Ularning hech biri «immunitetni koʻtaradigan» sehrli vosita emas — organizmga ular yetarli miqdorda kerak, ortiqchasi foyda bermaydi.",
            "Vitamin C — meva va sabzavotlarda, D — quyosh nuri taʼsirida terida va yogʻli baliqda, sink — goʻsht va urugʻlarda, selen — baliq va tuxumda, A — jigar, sabzi va qovoqda.",
          ],
          ru: [
            "В нормальной работе иммунной системы участвуют витамины C и D, цинк, селен и витамин A. Ни одно из них не волшебное средство, «поднимающее иммунитет», — организму они нужны в достаточном количестве, избыток пользы не даёт.",
            "Витамин C — в овощах и фруктах, D — образуется в коже на солнце и есть в жирной рыбе, цинк — в мясе и семечках, селен — в рыбе и яйцах, A — в печени, моркови и тыкве.",
          ],
        },
      },
      {
        heading: { uz: "Exinatseya va propolis", ru: "Эхинацея и прополис" },
        paragraphs: {
          uz: [
            "Exinatseya va propolis anʼanaviy ravishda sovuq mavsumda qabul qilinadi va koʻpincha C vitamini va sink bilan bitta kompleksga qoʻshiladi. Masalan, Swiss Energy ImmunoVit tarkibida exinatseya ekstrakti 100 mg, propolis 50 mg, vitamin C 80 mg va sink 10 mg bor.",
            "Asalari mahsulotlariga allergiyasi boʻlganlar propolisli mahsulotni ichmasligi kerak. Murakkabguldoshlar (masalan, romashka) oilasiga allergiya, autoimmun kasalliklar boʻlsa, exinatseyani shifokor bilan kelishing.",
          ],
          ru: [
            "Эхинацею и прополис традиционно принимают в холодный сезон и часто объединяют в одном комплексе с витамином C и цинком. Например, в Swiss Energy ImmunoVit — экстракт эхинацеи 100 мг, прополис 50 мг, витамин C 80 мг и цинк 10 мг.",
            "Людям с аллергией на продукты пчеловодства продукты с прополисом принимать нельзя. При аллергии на сложноцветные (например, ромашку) и аутоиммунных заболеваниях эхинацею согласуйте с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Turmush tarzi birinchi oʻrinda", ru: "Образ жизни — на первом месте" },
        paragraphs: {
          uz: [
            "Kuniga 7–9 soat uyqu, xilma-xil ovqat (har kuni sabzavot va meva), muntazam jismoniy faollik, qoʻllarni tez-tez yuvish va chekmaslik — immun tizimi uchun eng muhim asos. Vitaminlar shu asosga qoʻshimcha, uning oʻrnini bosmaydi.",
            "Shifokor tavsiya qilgan emlashlar ham himoyaning muhim qismi. Tez-tez kasallansangiz, buning sababini terapevt bilan aniqlang.",
          ],
          ru: [
            "Сон 7–9 часов, разнообразное питание (овощи и фрукты каждый день), регулярная физическая активность, частое мытьё рук и отказ от курения — главная основа для иммунной системы. Витамины дополняют эту основу, но не заменяют её.",
            "Прививки по рекомендации врача — тоже важная часть защиты. Если вы часто болеете, причину стоит выяснить с терапевтом.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Kasal boʻlib qolganda vitaminni koʻpaytirish kerakmi? Dozani oʻzboshimchalik bilan oshirmang. Isitma yoki ahvol yomonlashsa, shifokorga murojaat qiling.",
            "Kursni qachon boshlash kerak? Koʻpincha kuz-qish mavsumida, odatda 1 oylik kurs bilan. Qadoqdagi koʻrsatmaga amal qiling.",
            "Bolalarga ham beriladimi? Kattalar kompleksi bolalarga berilmaydi. Bolalar uchun mahsulotni pediatr bilan tanlang.",
          ],
          ru: [
            "Нужно ли увеличивать дозу, если заболел? Не повышайте дозу самостоятельно. При температуре или ухудшении состояния обратитесь к врачу.",
            "Когда начинать курс? Чаще всего в осенне-зимний сезон, обычно курсом на 1 месяц. Следуйте инструкции на упаковке.",
            "Можно ли детям? Взрослый комплекс детям не дают. Продукт для ребёнка подбирайте с педиатром.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-immunovit-30", "swiss-energy-vitamin-c-20", "swiss-energy-calcivit-30"],
  },
];
