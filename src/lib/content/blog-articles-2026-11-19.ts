import type { RawArticle } from "./blog";

/*
  Daily SEO batch, 2026-11-19. Reference intakes and general guidance only, no promise of
  effect (blog.test.ts runs the claim checks). Sources: NIH Office of Dietary Supplements
  (B vitamins), EFSA authorised nutrient wording, NHS fever guidance for children,
  general dermatology advice for dry winter skin.
*/
export const articlesNov2026d: RawArticle[] = [
  {
    slug: "b-vitaminlari-nima-uchun-kerak",
    date: "2026-11-19",
    imageSeed: "bank-vitamin-capsule",
    category: { uz: "Vitaminlar", ru: "Витамины" },
    categoryKey: "vitamins",
    title: {
      uz: "B vitaminlari: qaysi biri nima uchun kerak",
      ru: "Витамины группы B: какой для чего нужен",
    },
    excerpt: {
      uz: "B1, B2, B3, B5, B6, B7, B9 va B12 vitaminlari organizmda qanday vazifa bajaradi, kunlik meʼyor qancha va B-kompleksni qanday tanlash kerak.",
      ru: "Какую роль в организме играют витамины B1, B2, B3, B5, B6, B7, B9 и B12, какова суточная норма и как выбрать B-комплекс.",
    },
    sections: [
      {
        heading: { uz: "B vitaminlari guruhi nima", ru: "Что такое группа витаминов B" },
        paragraphs: {
          uz: [
            "B vitaminlari — suvda eriydigan sakkizta vitamin guruhi: B1 (tiamin), B2 (riboflavin), B3 (niatsin), B5 (pantoten kislota), B6 (piridoksin), B7 (biotin), B9 (foliy kislota) va B12 (kobalamin). Ular alohida vitaminlar, lekin organizmda koʻpincha birga ishlaydi, shuning uchun ularni bitta guruh deb atashadi.",
            "Suvda eriydigan vitaminlar organizmda katta zaxira boʻlib toʻplanmaydi (B12 bundan istisno: u jigarda saqlanadi). Shu sababli ular ovqat bilan muntazam kelib turishi kerak. AQSH Milliy sogʻliqni saqlash institutlari qoshidagi Ovqat qoʻshimchalari boʻlimi (NIH ODS) har bir B vitamini boʻyicha batafsil maʼlumot varaqalarini eʼlon qiladi; quyidagi raqamlar oʻsha manbadan olingan.",
          ],
          ru: [
            "Витамины группы B — это восемь водорастворимых витаминов: B1 (тиамин), B2 (рибофлавин), B3 (ниацин), B5 (пантотеновая кислота), B6 (пиридоксин), B7 (биотин), B9 (фолиевая кислота) и B12 (кобаламин). Это отдельные витамины, но в организме они часто работают вместе, поэтому их объединяют в одну группу.",
            "Водорастворимые витамины не накапливаются в больших запасах (исключение — B12, он хранится в печени). Поэтому они должны регулярно поступать с пищей. Управление пищевых добавок Национальных институтов здоровья США (NIH ODS) публикует подробные справки по каждому витамину B; приведённые ниже цифры взяты оттуда.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi vitamin nima uchun kerak", ru: "Какой витамин для чего нужен" },
        paragraphs: {
          uz: [
            "B1, B2, B3, B5 va B7 ovqatdagi uglevod, yogʻ va oqsildan energiya olish jarayonida ishtirok etadi. Evropa xavfsizlik idorasi (EFSA) maʼqullagan formulaga koʻra, bu vitaminlar normal energiya almashinuviga hissa qoʻshadi. B1 va B6 yana asab tizimining normal ishlashi bilan bogʻliq.",
            "B6 oqsil almashinuvida va normal psixologik faoliyatda qatnashadi. B9 (foliy kislota) hujayralarning boʻlinishi va qon hosil boʻlishi uchun kerak, B12 esa qizil qon tanachalari va asab hujayralari faoliyatiga hissa qoʻshadi. Bu — taʼsir vaʼdasi emas, balki vitaminlarning oddiy fiziologik vazifasi: yetarli miqdorda boʻlsa, organizm bu jarayonlarni odatdagidek bajaradi.",
          ],
          ru: [
            "B1, B2, B3, B5 и B7 участвуют в получении энергии из углеводов, жиров и белков пищи. По формулировкам, одобренным Европейским агентством по безопасности продуктов питания (EFSA), эти витамины способствуют нормальному энергетическому обмену. B1 и B6 также связаны с нормальной работой нервной системы.",
            "B6 участвует в обмене белков и в нормальной психологической функции. B9 (фолиевая кислота) нужна для деления клеток и кроветворения, а B12 способствует нормальной работе красных кровяных клеток и нервных клеток. Это не обещание эффекта, а обычная физиологическая роль витаминов: при достаточном количестве организм выполняет эти процессы в обычном режиме.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor qancha", ru: "Какова суточная норма" },
        paragraphs: {
          uz: [
            "NIH ODS maʼlumotiga koʻra, kattalar uchun tavsiya etilgan kunlik miqdor taxminan quyidagicha: B1 — 1,1–1,2 mg, B2 — 1,1–1,3 mg, B3 — 14–16 mg, B6 — 1,3 mg (19–50 yosh), B9 — 400 mkg, B12 — 2,4 mkg. B5 uchun yetarli miqdor 5 mg, B7 uchun 30 mkg deb belgilangan. Meʼyor jinsi, yoshi va homiladorlikka qarab oʻzgaradi.",
            "Ovqat qoʻshimchalarida B vitaminlarining miqdori koʻpincha meʼyordan bir necha baravar yuqori boʻladi. Bu doim xavfli degani emas, lekin yuqori dozalar uchun yuqori chegaralar mavjud: masalan, B6 uchun AQSHda kattalar uchun yuqori chegara kuniga 100 mg deb belgilangan, EFSA esa 2023-yilda ancha past chegarani — kuniga 12 mg ni — belgilagan. Ehtiyotkor boʻlish uchun past chegarani eslab qoling: uzoq muddat undan koʻp qabul qilish asab uchlarida goʻyo chumoli yurgandek sezgi paydo qilishi mumkin. Shuning uchun qadoqdagi dozani oshirmang.",
            "Homilador ayollar, emizikli onalar, surunkali kasalligi borlar va doimiy dori ichadiganlar B-kompleksni boshlashdan oldin shifokor bilan maslahatlashgani maʼqul: ayrim vitaminlar dorilar bilan oʻzaro taʼsir qilishi mumkin. Qoʻshimchani ovqat oʻrniga emas, balanslangan ovqatlanishga qoʻshimcha sifatida koʻring.",
          ],
          ru: [
            "По данным NIH ODS, рекомендуемая суточная доза для взрослых примерно такова: B1 — 1,1–1,2 мг, B2 — 1,1–1,3 мг, B3 — 14–16 мг, B6 — 1,3 мг (19–50 лет), B9 — 400 мкг, B12 — 2,4 мкг. Для B5 установлено адекватное потребление 5 мг, для B7 — 30 мкг. Норма зависит от пола, возраста и беременности.",
            "В пищевых добавках количество витаминов B часто в несколько раз выше нормы. Это не всегда опасно, но для высоких доз есть верхние пределы: например, для B6 в США верхний предел для взрослых установлен на уровне 100 мг в сутки, а EFSA в 2023 году определило значительно более низкий предел — 12 мг в сутки. Ориентируйтесь на более осторожное значение: длительный приём большего количества может вызывать ощущение покалывания в конечностях. Поэтому не превышайте дозу, указанную на упаковке.",
            "Беременным и кормящим женщинам, людям с хроническими заболеваниями и постоянно принимающим лекарства лучше посоветоваться с врачом перед началом приёма B-комплекса: некоторые витамины могут взаимодействовать с лекарствами. Рассматривайте добавку не как замену еды, а как дополнение к сбалансированному питанию.",
          ],
        },
      },
      {
        heading: { uz: "Qaysi ovqatlarda bor", ru: "В каких продуктах они есть" },
        paragraphs: {
          uz: [
            "B vitaminlari turli ovqatlarda uchraydi: dukkaklilar, yormalar va non (B1, B3, B9), goʻsht va tuxum (B2, B6, B12), sut mahsulotlari (B2, B12), jigar (deyarli barchasi), yashil bargli sabzavotlar (B9), baliq (B3, B6, B12). Xilma-xil ovqatlanadigan odam odatda koʻp B vitaminini ovqatdan oladi.",
            "B12 faqat hayvon mahsulotlarida tabiiy holda uchraydi. Shuning uchun vegetarianlar va vegan ovqatlanadiganlar, shuningdek 50 yoshdan oshganlar (ularda B12 soʻrilishi pasayishi mumkin) bu vitaminni qoʻshimcha manba bilan olishni shifokor yoki dietolog bilan muhokama qilishi mumkin.",
          ],
          ru: [
            "Витамины группы B встречаются в разных продуктах: бобовые, крупы и хлеб (B1, B3, B9), мясо и яйца (B2, B6, B12), молочные продукты (B2, B12), печень (почти все), зелёные листовые овощи (B9), рыба (B3, B6, B12). Человек с разнообразным питанием обычно получает много витаминов B из еды.",
            "B12 в естественном виде есть только в продуктах животного происхождения. Поэтому вегетарианцам и веганам, а также людям старше 50 лет (у них усвоение B12 может снижаться) стоит обсудить с врачом или диетологом дополнительный источник этого витамина.",
          ],
        },
      },
      {
        heading: { uz: "B-kompleksni qanday tanlash kerak", ru: "Как выбрать B-комплекс" },
        paragraphs: {
          uz: [
            "Avvalo qadoqdagi tarkibni oʻqing: sakkizala vitamin bormi yoki faqat bir nechtasimi, har birining miqdori kunlik meʼyorning necha foizini tashkil etadi. Yorliqda «yuqori doza» yozilgani avtomatik ravishda yaxshiroq degani emas; muhimi — miqdor yuqori chegaradan oshmasligi va sizning ehtiyojingizga mosligi.",
            "Katalogimizda B vitaminlarini oʻz ichiga olgan mahsulotlar bor. Swiss Energy NeuroForce — sekin ajraladigan shakldagi B-kompleks (B1, B2, B3, B5, B6, B7, B9, B12), 30 kapsula. Dr. Frei Antistress shipuchi tabletkalarida magniy bilan birga B6 bor. Ikkalasi ham ovqat qoʻshimchasi hisoblanadi va dori vositasi emas.",
          ],
          ru: [
            "Прежде всего прочитайте состав на упаковке: есть ли все восемь витаминов или только несколько, какой процент суточной нормы составляет каждый. Надпись «высокая доза» не означает автоматически «лучше»; важно, чтобы количество не превышало верхний предел и соответствовало вашей потребности.",
            "В нашем каталоге есть продукты с витаминами B. Swiss Energy NeuroForce — B-комплекс (B1, B2, B3, B5, B6, B7, B9, B12) в форме замедленного высвобождения, 30 капсул. В шипучих таблетках Dr. Frei Антистресс вместе с магнием есть B6. Оба продукта — пищевые добавки, а не лекарства.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "B vitaminlarini qachon ichgan yaxshi? Koʻpchilik ularni ertalab, ovqat bilan ichadi: ovqat bilan qabul qilish oshqozonga yengilroq tushadi. Aniq vaqt qadoqdagi koʻrsatmada yoziladi.",
            "Siydik sariq boʻlib qolsa, bu xavflimi? B2 (riboflavin) siydikni yorqin sariq rangga boʻyashi mumkin. Bu odatda zararsiz, ortiqcha vitamin organizmdan chiqayotganini bildiradi.",
            "Foliy kislota va B12 nima uchun birga tilga olinadi? Yuqori dozadagi foliy kislota B12 tanqisligi belgilarini yashirib qoʻyishi mumkin, shuning uchun uzoq vaqt qabul qilishdan oldin shifokor bilan maslahatlashgan maʼqul. Homilador boʻlishni rejalashtirayotgan ayollar foliy kislotani shifokor tavsiyasiga koʻra ichadi.",
          ],
          ru: [
            "В какое время лучше принимать витамины B? Многие принимают их утром во время еды: с едой они легче переносятся желудком. Точное время указано в инструкции на упаковке.",
            "Опасно ли, если моча стала ярко-жёлтой? B2 (рибофлавин) может окрашивать мочу в яркий жёлтый цвет. Обычно это безвредно и означает, что избыток витамина выводится.",
            "Почему фолиевую кислоту и B12 упоминают вместе? Высокие дозы фолиевой кислоты могут маскировать признаки недостатка B12, поэтому перед длительным приёмом лучше посоветоваться с врачом. Женщины, планирующие беременность, принимают фолиевую кислоту по рекомендации врача.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-neuroforce-30", "dr-frei-antistress-magniy-20", "dr-frei-multivitamins-biotin-20"],
  },
  {
    slug: "bolada-isitma-uyda-nima-qilish",
    date: "2026-11-19",
    imageSeed: "bank-kids-tea",
    category: { uz: "Bolalar sogʻligʻi", ru: "Здоровье детей" },
    categoryKey: "kids",
    title: {
      uz: "Bolada isitma: uyda nima qilish va qachon shifokor",
      ru: "Температура у ребёнка: что делать и когда к врачу",
    },
    excerpt: {
      uz: "Bolada harorat koʻtarilganda uyda nima qilish mumkin, qachon shifokorga yoki tez yordamga murojaat qilish kerak va qaysi xatolardan saqlanish lozim.",
      ru: "Что можно делать дома при повышении температуры у ребёнка, когда нужно обратиться к врачу или вызвать скорую и каких ошибок стоит избегать.",
    },
    sections: [
      {
        heading: { uz: "Isitma nima va u har doim xavfli emasmi", ru: "Что такое температура и всегда ли она опасна" },
        paragraphs: {
          uz: [
            "Isitma — tana haroratining koʻtarilishi, odatda infeksiyaga organizmning javobi. Britaniya sogʻliqni saqlash xizmati (NHS) bolalarda 38 °C va undan yuqori haroratni isitma deb hisoblaydi. Kuz-qish mavsumida isitma koʻpincha shamollash va virusli infeksiyalar bilan keladi.",
            "Harorat oʻzi kasallik emas, balki belgi. Bolaning umumiy holati raqamdan koʻra muhimroq: u oʻynayaptimi, suv ichayaptimi, siz bilan gaplashayaptimi yoki juda holsiz va uyquchanmi. Shuning uchun ota-onaga raqamni emas, bolaning xulq-atvorini kuzatish tavsiya etiladi.",
            "Harorat kun davomida tabiiy ravishda oʻzgaradi: kechqurun odatda sal yuqori boʻladi. Shuning uchun har safar bir xil usul va bir xil vaqtda oʻlchab, natijalarni yozib borish shifokorga ham qulay maʼlumot beradi. Isitma bilan birga qusish, ich ketishi yoki quloq ogʻrigʻi boʻlsa, buni ham shifokorga aytish kerak.",
          ],
          ru: [
            "Температура — это повышение температуры тела, как правило, реакция организма на инфекцию. Британская служба здравоохранения (NHS) считает температурой у детей показатель 38 °C и выше. В осенне-зимний сезон температура часто сопровождает простуду и вирусные инфекции.",
            "Сама температура — не болезнь, а признак. Общее состояние ребёнка важнее цифры: играет ли он, пьёт ли воду, разговаривает ли с вами или очень вялый и сонный. Поэтому родителям рекомендуют следить не за цифрой, а за поведением ребёнка.",
            "Температура в течение дня естественно меняется: вечером она обычно немного выше. Поэтому измерения одним и тем же способом в одно и то же время с записью результатов дают врачу удобную информацию. Если вместе с температурой есть рвота, диарея или боль в ухе, об этом тоже нужно сказать врачу.",
          ],
        },
      },
      {
        heading: { uz: "Haroratni toʻgʻri oʻlchash", ru: "Как правильно измерять температуру" },
        paragraphs: {
          uz: [
            "Natija ishonchli boʻlishi uchun bola tinch holatda boʻlishi kerak: yugurgandan, yigʻlagandan yoki issiq kiyimda uzoq turgandan keyin harorat sal yuqori chiqishi mumkin. Oʻlchashdan oldin bolani 10–15 daqiqa tinch oʻtqazing, ortiqcha kiyimni yechib qoʻying.",
            "Termometr turini bola yoshiga qarab tanlang va qoʻllanmadagi joyga (qoʻltiq ostiga, quloqqa yoki peshonaga) qoʻying. Termometr turlarini taqqoslash haqida alohida maqolamiz bor: «Termometr tanlash: qaysi turi qulay». Dr. Frei T10 va T30 modellari katalogimizda mavjud.",
          ],
          ru: [
            "Чтобы результат был надёжным, ребёнок должен быть спокоен: после бега, плача или долгого пребывания в тёплой одежде температура может быть немного выше. Перед измерением посадите ребёнка на 10–15 минут в покое и снимите лишнюю одежду.",
            "Выбирайте тип термометра по возрасту ребёнка и прикладывайте его в месте, указанном в инструкции (под мышку, в ухо или ко лбу). О сравнении типов термометров у нас есть отдельная статья: «Как выбрать термометр». Модели Dr. Frei T10 и T30 есть в нашем каталоге.",
          ],
        },
      },
      {
        heading: { uz: "Uyda nima qilish mumkin", ru: "Что можно делать дома" },
        paragraphs: {
          uz: [
            "Eng muhimi — bolaning suyuqlik yoʻqotmasligi. 6 oydan katta bolaga tez-tez, oz-ozdan suv yoki odatiy ichimlik bering. 6 oygacha boʻlgan chaqaloqqa suv yoki choy bermang: unga ona suti yoki sut aralashmasi yetarli, uni odatdagidan tez-tez bering. Xona havosi salqin va sof boʻlsin, bola yengil kiyinsin: oʻrab tashlash haroratni yanada koʻtarishi mumkin.",
            "Bola dam olsin, majburan ovqatlantirmang. Hozirgi tavsiyalarga koʻra, sovuq suvga yoki spirtga botirilgan mato bilan artish tavsiya etilmaydi: bu bolani titratadi va noqulaylik tugʻdiradi. Isitma tushiruvchi dorilarni yosh va vazn boʻyicha dozasini shifokor yoki farmatsevt bilan kelishib bering va qoʻllanmaga amal qiling.",
            "Dorini hech qachon «koʻz bilan» dozalamang: bolaning vazni va yoshiga mos oʻlchov qoshigʻi yoki shpritsdan foydalaning, ikki xil dorida bir xil faol modda boʻlishi mumkinligini hisobga oling va qabul qilingan vaqtni yozib boring. Aspirinni 16 yoshgacha boʻlgan bolalarga shifokor tayinlamasa bermang.",
          ],
          ru: [
            "Самое важное — чтобы ребёнок не терял жидкость. Ребёнку старше 6 месяцев давайте воду или привычный напиток часто и понемногу. Младенцам до 6 месяцев воду и чай не давайте: им достаточно грудного молока или смеси, предлагайте их чаще обычного. В комнате должно быть прохладно и свежо, ребёнок должен быть одет легко: укутывание может ещё сильнее повысить температуру.",
            "Пусть ребёнок отдыхает, не заставляйте его есть. По современным рекомендациям, обтирание холодной водой или спиртом не советуют: оно вызывает озноб и дискомфорт. Жаропонижающие давайте, согласовав дозу по возрасту и весу с врачом или фармацевтом, и следуйте инструкции.",
            "Никогда не дозируйте лекарство «на глаз»: пользуйтесь мерной ложкой или шприцем, подходящим по возрасту и весу ребёнка, учитывайте, что в двух разных препаратах может быть одно и то же действующее вещество, и записывайте время приёма. Аспирин детям до 16 лет без назначения врача не давайте.",
          ],
        },
      },
      {
        heading: { uz: "Qachon zudlik bilan shifokorga murojaat qilish kerak", ru: "Когда нужно срочно обратиться к врачу" },
        paragraphs: {
          uz: [
            "NHS tavsiyalariga koʻra, 3 oygacha boʻlgan chaqaloqda 38 °C va undan yuqori harorat boʻlsa, 3–6 oylik bolada 39 °C va undan yuqori boʻlsa, darhol shifokorga murojaat qilish kerak. Shuningdek, isitma 5 kundan koʻp davom etsa ham shifokorga koʻrinish lozim.",
            "Quyidagi holatlarda tez yordam chaqiring yoki yaqin shifoxonaga boring: bola juda holsiz, uygʻotish qiyin, nafas olish qiyinlashgan yoki tez-tez nafas olmoqda, tanada toshma bor va bosganda yoʻqolmaydi, boʻyin qotgan, tutqanoq boʻlgan, bola ichmayapti yoki siydik chiqarmayapti. Shubha boʻlsa, kutmang.",
          ],
          ru: [
            "По рекомендациям NHS, если у младенца до 3 месяцев температура 38 °C и выше, а у ребёнка 3–6 месяцев — 39 °C и выше, нужно сразу обратиться к врачу. Также к врачу нужно обратиться, если температура держится дольше 5 дней.",
            "В следующих случаях вызывайте скорую или поезжайте в ближайшую больницу: ребёнок очень вялый, его трудно разбудить, ему трудно дышать или он дышит часто, на теле сыпь, которая не бледнеет при надавливании, затылок скован, были судороги, ребёнок не пьёт или не мочится. При сомнениях не ждите.",
          ],
        },
      },
      {
        heading: { uz: "Isitma paytida vitaminlar va qoʻshimchalar", ru: "Витамины и добавки при температуре" },
        paragraphs: {
          uz: [
            "Isitma paytida eng kerakli narsa — suyuqlik va dam, vitamin emas. Ovqat qoʻshimchalari isitmani tushirmaydi va dori vositasini almashtirmaydi. Bola sogʻlom boʻlganda uning ratsionini kuzatish va kerak boʻlsa, shifokor bilan yoshiga mos multivitamin haqida gaplashish mumkin; bu haqda «Bolalar uchun vitaminlar yoshga qarab» maqolamizni oʻqing.",
            "HIEW plastiri kabi mahsulotlar qadoqda koʻrsatilgan tarzda, teriga qoʻyib ishlatiladi. Ularni ishlatganda ham haroratni termometr bilan kuzatishni va ogohlantirish belgilarini nazoratdan chiqarmaslikni unutmang: plastir shifokor koʻrigini almashtirmaydi.",
          ],
          ru: [
            "При температуре главное — жидкость и отдых, а не витамины. Пищевые добавки не снижают температуру и не заменяют лекарства. Когда ребёнок здоров, можно следить за его рационом и при необходимости обсудить с врачом подходящий по возрасту мультивитамин; об этом читайте нашу статью «Витамины для детей по возрасту».",
            "Такие продукты, как пластырь HIEW, применяются наложением на кожу так, как указано на упаковке. Даже при их использовании продолжайте следить за температурой по термометру и не упускайте тревожные признаки: пластырь не заменяет осмотр врача.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Harorat necha darajadan boshlab tushirish kerak? Bitta raqam yoʻq. Bola oʻzini yaxshi his qilsa va suv ichsa, past isitmani tushirish shart emas; asosiy maqsad bolaning qulayligi. Qaror qabul qilishda shifokor maslahatiga tayaning.",
            "Antibiotik isitmani tushiradimi? Antibiotik faqat bakterial infeksiyaga qarshi dori va faqat shifokor tayinlaganda ichiladi; virusli infeksiyalarda u yordam bermaydi.",
            "Tishlash paytida isitma boʻlishi mumkinmi? Tish chiqishi bilan yengil noqulaylik boʻlishi mumkin, lekin 38 °C va undan yuqori harorat boshqa sababga ishora qilishi mumkin; shifokorga murojaat qiling.",
          ],
          ru: [
            "С какой температуры её нужно снижать? Единой цифры нет. Если ребёнок хорошо себя чувствует и пьёт, невысокую температуру снижать не обязательно; главная цель — комфорт ребёнка. При принятии решения ориентируйтесь на совет врача.",
            "Снижает ли антибиотик температуру? Антибиотик действует только на бактериальные инфекции и принимается только по назначению врача; при вирусных инфекциях он не помогает.",
            "Может ли быть температура при прорезывании зубов? При прорезывании возможен лёгкий дискомфорт, но температура 38 °C и выше может указывать на другую причину; обратитесь к врачу.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-thermometer-t10", "dr-frei-thermometer-t30", "hiew-cooling-plaster-16", "dr-frei-kids-multivitamins-20"],
  },
  {
    slug: "qishda-quruq-teri-parvarishi",
    date: "2026-11-19",
    imageSeed: "blog-hair",
    category: { uz: "Teri parvarishi", ru: "Уход за кожей" },
    categoryKey: "lifestyle",
    title: {
      uz: "Qishda quruq teri: parvarish qoidalari",
      ru: "Сухая кожа зимой: правила ухода",
    },
    excerpt: {
      uz: "Qishda teri nega quriydi, yuvinish va namlash qanday boʻlishi kerak, qachon dermatologga murojaat qilish lozim.",
      ru: "Почему зимой кожа сохнет, как правильно умываться и увлажнять, когда нужно обратиться к дерматологу.",
    },
    sections: [
      {
        heading: { uz: "Nega qishda teri quriydi", ru: "Почему зимой кожа сохнет" },
        paragraphs: {
          uz: [
            "Terining yuqori qatlami namlikni ushlab turuvchi himoya toʻsigʻi vazifasini bajaradi. Qishda sovuq havo tashqarida, quruq isitilgan havo xonada boʻlgani uchun terining namligi tezroq yoʻqoladi. Shamol va harorat oʻzgarishlari bu toʻsiqqa qoʻshimcha yuk beradi.",
            "Natijada teri tarang tortilishi, qipiqlanishi, qichishi va qizarishi mumkin. Eng koʻp qoʻllar, yuz, boldir va tirsaklar zarar koʻradi. Bu — juda keng tarqalgan holat va odatda oddiy parvarish bilan yengillashadi.",
            "Teri qurishiga yosh ham taʼsir qiladi: yoshi ulgʻaygan sari yogʻ bezlari faolligi kamayadi, shuning uchun 50 yoshdan oshganlarda quruqlik koʻproq uchraydi. Sovun, spirtli tozalovchilar va tez-tez qoʻl dezinfeksiyasi ham terini qoʻshimcha quritadi.",
          ],
          ru: [
            "Верхний слой кожи работает как защитный барьер, удерживающий влагу. Зимой на улице холодный воздух, а в помещении — сухой воздух от отопления, поэтому кожа быстрее теряет влагу. Ветер и перепады температуры создают дополнительную нагрузку на этот барьер.",
            "В результате кожа может стягиваться, шелушиться, зудеть и краснеть. Чаще всего страдают руки, лицо, голени и локти. Это очень распространённое состояние, и обычно его облегчает простой уход.",
            "На сухость кожи влияет и возраст: с годами активность сальных желёз снижается, поэтому у людей старше 50 лет сухость встречается чаще. Мыло, спиртовые очищающие средства и частая дезинфекция рук тоже дополнительно сушат кожу.",
          ],
        },
      },
      {
        heading: { uz: "Yuvinish qoidalari", ru: "Правила умывания и душа" },
        paragraphs: {
          uz: [
            "Juda issiq suv terining tabiiy yogʻ qatlamini yuvib ketadi. Iliq suvdan foydalaning, dush yoki vannani 5–10 daqiqadan oshirmang. Xushboʻy va kuchli koʻpik beruvchi vositalar terini quritishi mumkin: xushboʻysiz va yumshoq tozalovchilarni tanlang.",
            "Yuvingandan keyin terini ishqalamang, sochiq bilan yengil qoqing. Namlovchi vositani teri hali sal nam paytida, yuvingandan keyin bir necha daqiqa ichida surting: shunda namlik yaxshiroq ushlanadi.",
          ],
          ru: [
            "Слишком горячая вода смывает естественный жировой слой кожи. Пользуйтесь тёплой водой, не принимайте душ или ванну дольше 5–10 минут. Ароматизированные и сильно пенящиеся средства могут сушить кожу: выбирайте мягкие средства без отдушек.",
            "После мытья не растирайте кожу, а аккуратно промокните полотенцем. Увлажняющее средство наносите, пока кожа ещё слегка влажная, в течение нескольких минут после мытья: так влага удерживается лучше.",
          ],
        },
      },
      {
        heading: { uz: "Namlovchi vositani qanday tanlash kerak", ru: "Как выбрать увлажняющее средство" },
        paragraphs: {
          uz: [
            "Quruq teri uchun yengil losyondan koʻra quyuqroq krem yoki malham koʻpincha qulayroq: ularda yogʻli asos koʻproq boʻladi va namlikni ushlab turadi. Tarkibda glitserin, seramidlar, pantenol kabi namlovchi komponentlar boʻlishi mumkin; xushboʻy va spirtsiz variantlar sezgir teriga qulayroq.",
            "Katalogimizda dermatologik Peano krem-balzami (30 g) bor: qadoqda u xushboʻysiz va parabensiz deb koʻrsatilgan. Birinchi marta ishlatishdan oldin qoʻl ichki tomonida kichik sinov oʻtkazing. Kosmetik vosita dori vositasi emas.",
            "Qoʻl va oyoqlar uchun kechasi qalinroq qatlam surtib, paxta qoʻlqop kiyib yotish koʻpchilikka qulay. Yuz uchun kunduzi namlovchi krem ustidan qishda ham quyoshdan himoya vositasi surtish mumkin: qorda nur qaytishi terini quyoshga duchor qiladi.",
          ],
          ru: [
            "Для сухой кожи плотный крем или бальзам часто удобнее лёгкого лосьона: в них больше жировой основы, которая удерживает влагу. В составе могут быть увлажняющие компоненты, такие как глицерин, церамиды, пантенол; варианты без отдушек и спирта лучше подходят чувствительной коже.",
            "В нашем каталоге есть дерматологический крем-бальзам Peano (30 г): на упаковке он указан как не содержащий отдушек и парабенов. Перед первым применением сделайте небольшую пробу на внутренней стороне запястья. Косметическое средство — не лекарство.",
            "Для рук и ног многим удобно наносить на ночь более плотный слой и надевать хлопковые перчатки. Для лица днём поверх увлажняющего крема можно наносить средство с солнцезащитным фильтром и зимой: снег отражает лучи, и кожа всё равно получает солнечное излучение.",
          ],
        },
      },
      {
        heading: { uz: "Ichkaridan nima yordam beradi", ru: "Что помогает изнутри" },
        paragraphs: {
          uz: [
            "Terining holati ovqatlanish va suv ichish bilan ham bogʻliq, lekin hech bir vitamin yoki qoʻshimcha quruq terini bir kunda oʻzgartirmaydi. Xilma-xil ovqatlanish, yetarli suv va yogʻli baliq, yongʻoq, sabzavot kabi mahsulotlarni ratsionga kiritish umumiy yoʻnalish hisoblanadi.",
            "Vitamin A, C, E va sink terining normal holatini qoʻllab-quvvatlashga hissa qoʻshadi (EFSA formulasi). Agar ratsion cheklangan boʻlsa, Dr. Frei Gold kabi kompleks vitaminlar haqida shifokor bilan maslahatlashish mumkin. Boshqa maqolalarimizda ham koʻrib chiqilgan: biotin va kollagen haqida alohida yozganmiz.",
            "Alkogol, sigaret va uyqu yetishmasligi ham terining holatiga taʼsir qilishi mumkin, shuning uchun kundalik odatlarga eʼtibor bering. Parvarishni oddiy va izchil qiling: koʻp vosita aralashtirishdan koʻra, bir-ikki mos vositani muntazam ishlatish yaxshiroq.",
          ],
          ru: [
            "Состояние кожи связано и с питанием, и с питьевым режимом, но ни один витамин или добавка не изменит сухую кожу за один день. Общий ориентир — разнообразное питание, достаточное количество воды и включение в рацион жирной рыбы, орехов, овощей.",
            "Витамины A, C, E и цинк способствуют поддержанию нормального состояния кожи (формулировка EFSA). Если рацион ограничен, о комплексных витаминах вроде Dr. Frei Gold можно посоветоваться с врачом. В других наших статьях мы тоже писали об этом: отдельно о биотине и коллагене.",
            "Алкоголь, курение и недосып тоже могут влиять на состояние кожи, поэтому обратите внимание на повседневные привычки. Делайте уход простым и последовательным: лучше регулярно использовать одно-два подходящих средства, чем смешивать много разных.",
          ],
        },
      },
      {
        heading: { uz: "Qachon dermatologga murojaat qilish kerak", ru: "Когда обратиться к дерматологу" },
        paragraphs: {
          uz: [
            "Agar parvarishga qaramay teri bir necha hafta ichida yaxshilanmasa, qattiq qichisa, yoriqlar qonasa, toshma yoki yiringli joylar paydo boʻlsa, dermatologga koʻrining. Bunday belgilar oddiy qurishdan boshqa sabab, masalan, ekzema yoki allergiyaga ishora qilishi mumkin.",
            "Bolalar va qariyalarning terisi sezgirroq: ularda yangi vositani qoʻllashdan oldin shifokor yoki farmatsevt bilan maslahatlashgan yaxshi. Bunday hollarda mustaqil tajriba oʻrniga mutaxassis koʻrigi maʼqul.",
          ],
          ru: [
            "Если, несмотря на уход, кожа не улучшается в течение нескольких недель, сильно зудит, трещины кровоточат, появляется сыпь или гнойные участки, обратитесь к дерматологу. Такие признаки могут указывать не на простую сухость, а на другую причину, например экзему или аллергию.",
            "Кожа детей и пожилых людей более чувствительна: перед применением нового средства им лучше посоветоваться с врачом или фармацевтом. В таких случаях осмотр специалиста предпочтительнее самостоятельных попыток.",
          ],
        },
      },
      {
        heading: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
        paragraphs: {
          uz: [
            "Xonadagi havoni namlash foyda beradimi? Isitish mavsumida xona havosi juda quruq boʻlsa, namlagich yoki xonada nam sochiq teri uchun qulaylik yaratishi mumkin; namlik haddan oshib ketmasligini kuzating.",
            "Qoʻl terisi nega eng koʻp yoriladi? Qoʻllar tez-tez yuviladi va tashqarida sovuqda boʻladi, yogʻ bezlari esa kam. Qoʻl yuvgandan keyin krem surtish va sovuqda qoʻlqop kiyish yordam beradi.",
            "Namlovchi vositani kuniga necha marta surtish kerak? Koʻpchilik kuniga 1–2 marta va har yuvingandan keyin surtadi; teri holatiga qarab oʻzgartirish mumkin.",
          ],
          ru: [
            "Полезно ли увлажнять воздух в комнате? Если в отопительный сезон воздух очень сухой, увлажнитель или влажное полотенце в комнате могут сделать условия для кожи комфортнее; следите, чтобы влажность не стала чрезмерной.",
            "Почему кожа рук трескается чаще всего? Руки часто моют, они бывают на холоде, а сальных желёз на них мало. Помогает крем после мытья и перчатки на морозе.",
            "Сколько раз в день наносить увлажняющее средство? Многие наносят 1–2 раза в день и после каждого мытья; частоту можно менять в зависимости от состояния кожи.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["peano-balzam-30g", "dr-frei-gold-vitamins-20", "dr-frei-multivitamins-biotin-20"],
  },
];
