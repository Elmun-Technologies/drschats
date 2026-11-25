import { articlesNov2026 } from "./blog-articles-2026-11";
import { articlesNov2026b } from "./blog-articles-2026-11b";
import { articlesNov2026c } from "./blog-articles-2026-11c";
import { articlesNov2026d } from "./blog-articles-2026-11-19";
import { articlesNov2026e } from "./blog-articles-2026-11-19b";
import { articlesNov2026f } from "./blog-articles-2026-11-20";
import { articlesNov2026g } from "./blog-articles-2026-11-24";
import { articlesNov2026h } from "./blog-articles-2026-11-24b";
import { articlesNov2026i } from "./blog-articles-2026-11-25";
import { articlesNov2026j } from "./blog-articles-2026-11-25b";
import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

interface ArticleSection {
  heading: L;
  paragraphs: L<string[]>;
}

export interface RawArticle {
  slug: string;
  date: string;
  imageSeed: string;
  category: L;
  categoryKey?: string;
  title: L;
  excerpt: L;
  sections: ArticleSection[];
  relatedProductSlugs: string[];
  /** Editorial "read next" picks, shown before the topical score. */
  relatedArticleSlugs?: string[];
}

export interface Article {
  slug: string;
  date: string;
  readingMinutes: number;
  image: string;
  category: string;
  categoryKey?: string;
  title: string;
  excerpt: string;
  sections: { heading: string; paragraphs: string[] }[];
  relatedProductSlugs: string[];
  relatedArticleSlugs?: string[];
}

/*
  Licensed stock photos (public/images/stock), one per article. An article
  without its own entry falls back to a neutral pack shot of capsules rather
  than a drawn placeholder.
*/
const IMAGES: Record<string, string> = {
  "blog-omega3": "/images/blog/omega3-capsules.webp",
  "blog-vitamind": "/images/blog/vitamin-d-sun-woman.webp",
  "blog-magnesium": "/images/blog/magnesium-capsules.webp",
  "blog-calcium": "/images/stock/st-aud-senior.webp",
  "blog-kids": "/images/stock/st-aud-child.webp",
  "blog-pregnancy": "/images/stock/st-aud-expectant.webp",
  "blog-collagen": "/images/stock/st-aud-woman.webp",
  "blog-tonometer": "/images/stock/st-range-devices.webp",
  "blog-inhaler": "/images/blog/inhaler-mother-son.webp",
  "blog-effervescent": "/images/stock/st-cat-citrus.webp",
  "blog-vitaminc": "/images/stock/st-cat-orange.webp",
  "blog-eyes": "/images/blog/eyes-tired-laptop.webp",
  "blog-hair": "/images/blog/hair-curly-woman.webp",
  "blog-men": "/images/stock/st-aud-man.webp",
  "blog-immunity": "/images/stock/st-aud-recovery.webp",
  "blog-bp": "/images/stock/st-range-devices.webp",
  "blog-thermo": "/images/stock/st-range-devices.webp",
  "blog-coffee": "/images/blog/coffee-cup-beans.webp",
  "bank-vitamin-spoon": "/images/blog/vitamin-supplement-spoon.webp",
  "bank-vitamin-capsule": "/images/blog/vitamin-capsule-wood.webp",
  "bank-citrus-halves": "/images/blog/citrus-orange-lemon-halves.webp",
  "bank-citrus-top": "/images/blog/citrus-top-view.webp",
  "bank-sleep-pillow": "/images/blog/sleep-woman-pillow.webp",
  "bank-sleep-bed": "/images/blog/sleep-woman-bed.webp",
  "bank-kids-tea": "/images/blog/kids-winter-tea.webp",
  "bank-family-snow": "/images/blog/family-winter-snow.webp",
  "bank-pregnancy-cooking": "/images/blog/pregnancy-healthy-cooking.webp",
  "bank-pregnancy-salad": "/images/blog/pregnancy-salad-sofa.webp",
  "bank-sport-running": "/images/blog/sport-woman-running.webp",
  "bank-sport-outdoor": "/images/blog/sport-woman-outdoor.webp",
  "bank-magnesium-capsules": "/images/blog/magnesium-capsules.webp",
  "bank-folate-spinach": "/images/blog/folate-spinach.webp",
  "bank-seeds-jars": "/images/blog/seeds-nuts-jars.webp",
  "bank-label-reading": "/images/blog/supplement-label-reading.webp",
  "bank-multivitamin-assorted": "/images/blog/multivitamin-assorted.webp",
  "bank-carrots-vitamin-a": "/images/blog/carrots-vitamin-a.webp",
  "bank-pumpkin-seeds-zinc": "/images/blog/pumpkin-seeds-zinc.webp",
  "bank-protein-foods-b12": "/images/blog/protein-foods-b12.webp",
  "bank-eyes-laptop": "/images/blog/eyes-tired-laptop.webp",
  "bank-inhaler-child": "/images/blog/inhaler-mother-son.webp",
  "bank-hair-woman": "/images/blog/hair-curly-woman.webp",
  "bank-coffee": "/images/blog/coffee-cup-beans.webp",
  "bank-omega3": "/images/blog/omega3-capsules.webp",
  "bank-vitamin-d-sun": "/images/blog/vitamin-d-sun-woman.webp",
  "bank2-ayran": "/images/bank/ayran-drink.webp",
  "bank2-fatigue": "/images/bank/woman-low-mood.webp",
  "bank2-seniors": "/images/bank/senior-couple-home.webp",
  "bank2-pill-organizer": "/images/bank/pill-organizer.webp",
  "bank2-hair-loss": "/images/bank/hair-loss-brush.webp",
  "bank2-stress": "/images/bank/stress-man-laptop.webp",
  "bank3-student": "/images/bank/student-exam-night.webp",
  "bank3-phone-bed": "/images/bank/phone-bed-night.webp",
  "bank3-cold-hands": "/images/bank/woman-cold-hands-winter.webp",
};
const img = (seed: string) => IMAGES[seed] ?? "/images/stock/st-cat-capsules.webp";

const rawArticles: RawArticle[] = [
  ...articlesNov2026,
  ...articlesNov2026b,
  ...articlesNov2026c,
  ...articlesNov2026d,
  ...articlesNov2026e,
  ...articlesNov2026f,
  ...articlesNov2026g,
  ...articlesNov2026h,
  ...articlesNov2026i,
  ...articlesNov2026j,
  {
    slug: "omega-3-nima-uchun-kerak",
    date: "2026-05-20",
    imageSeed: "blog-omega3",
    category: { uz: "Yurak sogʻligʻi", ru: "Здоровье сердца" },
    categoryKey: "nutrition",
    title: {
      uz: "Omega-3 nima uchun kerak va qanday tanlash kerak",
      ru: "Зачем нужна омега-3 и как её выбрать",
    },
    excerpt: {
      uz: "EPA, DHA va ALA nima, kunlik meʼyor qancha, qaysi ovqatlarda bor va sifatli omega-3 ni yorliqqa qarab qanday tanlash mumkin.",
      ru: "Что такое EPA, DHA и ALA, какая суточная норма, в каких продуктах они есть и как выбрать качественную омегу-3 по этикетке.",
    },
    sections: [
      {
        heading: { uz: "Omega-3 nima", ru: "Что такое омега-3" },
        paragraphs: {
          uz: [
            "Omega-3 — koʻp toʻyinmagan yogʻ kislotalari guruhi. Organizm ularni yetarli miqdorda oʻzi ishlab chiqara olmaydi, shuning uchun ular ovqat bilan kelishi kerak. Uchta asosiy shakli bor: ALA (alfa-linolen kislota), EPA (eykozapentaen kislota) va DHA (dokozageksaen kislota).",
            "ALA oʻsimliklarda boʻladi: zigʻir urugʻi, chia, yongʻoq va ularning moyi. EPA va DHA esa asosan yogʻli dengiz baligʻida va dengiz suvoʻtlarida uchraydi. Organizm ALA ning kichik qismini — odatda 10 foizdan kamini — EPA va DHA ga aylantiradi, shuning uchun oʻsimlik manbalari baliqni toʻliq almashtirmaydi.",
          ],
          ru: [
            "Омега-3 — группа полиненасыщенных жирных кислот. Организм не может вырабатывать их в достаточном количестве, поэтому они должны поступать с едой. Основных форм три: ALA (альфа-линоленовая кислота), EPA (эйкозапентаеновая) и DHA (докозагексаеновая).",
            "ALA содержится в растениях: семенах льна и чиа, грецких орехах и их маслах. EPA и DHA — в основном в жирной морской рыбе и морских водорослях. Организм превращает в EPA и DHA лишь небольшую часть ALA — обычно меньше 10 процентов, поэтому растительные источники не заменяют рыбу полностью.",
          ],
        },
      },
      {
        heading: { uz: "EPA va DHA organizmda nima qiladi", ru: "Что делают EPA и DHA в организме" },
        paragraphs: {
          uz: [
            "EPA va DHA har bir hujayra membranasining tarkibiy qismi. Kuniga kamida 250 mg EPA va DHA yurakning meʼyoriy ishlashiga hissa qoʻshadi. DHA miya va koʻzning toʻr pardasida ayniqsa koʻp: kuniga 250 mg DHA miyaning meʼyoriy faoliyati va meʼyoriy koʻrishni saqlashga hissa qoʻshadi.",
            "Homiladorlik va emizish davrida DHA ga ehtiyoj ortadi — u bolaning miyasi va koʻzi rivojlanishida ishtirok etadi. Bu davrda har qanday qoʻshimchani shifokor bilan kelishib qabul qilish kerak.",
          ],
          ru: [
            "EPA и DHA входят в состав мембраны каждой клетки. Не менее 250 мг EPA и DHA в день способствуют нормальной работе сердца. DHA особенно много в мозге и сетчатке глаза: 250 мг DHA в день способствуют поддержанию нормальной работы мозга и нормального зрения.",
            "Во время беременности и кормления грудью потребность в DHA растёт — она участвует в развитии мозга и глаз ребёнка. В этот период любую добавку стоит согласовать с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Ovqatdan qancha olsa boʻladi", ru: "Сколько можно получить из еды" },
        paragraphs: {
          uz: [
            "Haftasiga 1–2 marta yogʻli baliq (losos, skumbriya, seld, sardina) yeyish odatda kattalar uchun tavsiya qilinadigan miqdorni beradi. Oʻzbekistonda dengiz baligʻi har kuni ham, arzon ham emas, daryo baligʻida esa EPA va DHA kamroq — shuning uchun koʻpchilik omega-3 ni qoʻshimcha sifatida tanlaydi.",
            "ALA uchun kuniga bir osh qoshiq zigʻir urugʻi yoki bir hovuch yongʻoq yetarli. Zigʻir urugʻini maydalab yeyish kerak: butun urugʻ hazm boʻlmay chiqib ketadi.",
          ],
          ru: [
            "Жирная рыба (лосось, скумбрия, сельдь, сардины) 1–2 раза в неделю обычно даёт взрослому рекомендуемое количество. В Узбекистане морская рыба есть не каждый день и стоит недёшево, а в речной рыбе EPA и DHA меньше — поэтому многие выбирают омегу-3 в виде добавки.",
            "Для ALA достаточно столовой ложки семян льна или горсти грецких орехов в день. Лён лучше есть молотым: целые семена выходят непереваренными.",
          ],
        },
      },
      {
        heading: { uz: "Yorliqqa qarab qanday tanlash", ru: "Как выбрать по этикетке" },
        paragraphs: {
          uz: [
            "Birinchi navbatda bir kapsuladagi EPA va DHA miqdoriga qarang, «baliq yogʻi 1000 mg» degan umumiy raqamga emas. 1000 mg baliq yogʻida EPA va DHA 300 mg ham, 700 mg ham boʻlishi mumkin — kunlik dozani shu raqam belgilaydi.",
            "Shakli ham muhim: triglitserid va etil efir shakllari keng tarqalgan, ikkalasi ham ovqat bilan ichilganda yaxshi soʻriladi. Ishlab chiqaruvchi ogʻir metallar va oksidlanish boʻyicha tozalikni tekshirgani (masalan, IFOS yoki GOED standarti) yozilgan boʻlsa — bu qoʻshimcha ishonch belgisi.",
            "Yaroqlilik muddatini tekshiring va ochilgan qutini salqin, quyoshdan uzoq joyda saqlang. Kapsulani ovqat paytida ichish baliq taʼmi bilan kekirishni kamaytiradi.",
          ],
          ru: [
            "Смотрите в первую очередь на количество EPA и DHA в одной капсуле, а не на общую цифру «рыбий жир 1000 мг». В 1000 мг рыбьего жира EPA и DHA может быть и 300 мг, и 700 мг — суточную дозу определяет именно эта цифра.",
            "Важна и форма: распространены триглицеридная и этиловая, обе хорошо усваиваются, если принимать их с едой. Если производитель указывает проверку чистоты от тяжёлых металлов и окисления (например, стандарт IFOS или GOED), — это дополнительный признак доверия.",
            "Проверьте срок годности и храните открытую упаковку в прохладном месте вдали от солнца. Капсула во время еды реже даёт отрыжку со вкусом рыбы.",
          ],
        },
      },
      {
        heading: { uz: "Kimlar ehtiyot boʻlishi kerak", ru: "Кому нужна осторожность" },
        paragraphs: {
          uz: [
            "Qon suyultiruvchi dori ichadigan, operatsiyaga tayyorlanayotgan yoki baliqqa allergiyasi bor odamlar omega-3 ni faqat shifokor bilan kelishib qabul qilishi kerak. Kattalar uchun kuniga 5 grammgacha EPA va DHA xavfsiz deb hisoblanadi, ammo odatiy qoʻshimcha dozasi bundan ancha kam.",
          ],
          ru: [
            "Людям, которые принимают препараты для разжижения крови, готовятся к операции или имеют аллергию на рыбу, омегу-3 стоит принимать только по согласованию с врачом. Для взрослых безопасным считается до 5 граммов EPA и DHA в день, но обычная доза добавок намного меньше.",
          ],
        },
      },
    ],
    // The catalogue carries no omega-3 yet; an unrelated pack is not a "related product".
    relatedProductSlugs: [],
  },
  {
    slug: "qishda-vitamin-d",
    date: "2026-05-12",
    imageSeed: "blog-vitamind",
    category: { uz: "Immunitet", ru: "Иммунитет" },
    categoryKey: "vitamins",
    title: {
      uz: "Qishda vitamin D: nega koʻpchilikda yetishmaydi",
      ru: "Витамин D зимой: почему его не хватает многим",
    },
    excerpt: {
      uz: "Kuz va qishda quyosh kam, vitamin D esa asosan terida quyosh taʼsirida hosil boʻladi. Kimda yetishmaslik xavfi yuqori, kunlik meʼyor va qanday ichish haqida.",
      ru: "Осенью и зимой солнца мало, а витамин D в основном образуется в коже под его действием. У кого выше риск нехватки, суточная норма и как принимать.",
    },
    sections: [
      {
        heading: { uz: "Quyosh va vitamin D", ru: "Солнце и витамин D" },
        paragraphs: {
          uz: [
            "Vitamin D ning asosiy qismi terida quyoshning UVB nurlari taʼsirida hosil boʻladi. Noyabrdan fevralgacha Toshkentda kun qisqa, quyosh past turadi va nurning bu qismi kam yetib keladi. Ustiga qishki kiyim terining katta qismini yopadi — natijada koʻpchilikda bahorga kelib daraja pasayadi.",
            "Ovqatda vitamin D kam: yogʻli baliq (losos, skumbriya, sardina), tuxum sarigʻi, jigar va vitamin D bilan boyitilgan mahsulotlar. Odatiy ratsiondan kunlik ehtiyojning kichik qismigina keladi.",
          ],
          ru: [
            "Большая часть витамина D образуется в коже под действием солнечных лучей UVB. С ноября по февраль в Ташкенте день короткий, солнце стоит низко, и этих лучей доходит мало. К тому же зимняя одежда закрывает большую часть кожи — в итоге у многих к весне уровень снижается.",
            "В еде витамина D мало: жирная рыба (лосось, скумбрия, сардины), яичный желток, печень и продукты, обогащённые витамином D. Обычный рацион покрывает лишь небольшую часть суточной потребности.",
          ],
        },
      },
      {
        heading: { uz: "Vitamin D nima uchun kerak", ru: "Зачем нужен витамин D" },
        paragraphs: {
          uz: [
            "Vitamin D ichakda kalsiy va fosforning meʼyoriy soʻrilishiga hissa qoʻshadi va suyak hamda tishlarning meʼyoriy holatini saqlashda ishtirok etadi. U mushaklarning meʼyoriy ishlashi va immun tizimining meʼyoriy faoliyati uchun ham kerak.",
            "Yetishmovchilik koʻpincha hech qanday belgisiz kechadi. Baʼzan charchoq, mushak va suyaklarda noqulaylik bilan namoyon boʻladi, ammo bu belgilar boshqa sabablardan ham boʻlishi mumkin — shuning uchun oʻzingizga tashxis qoʻymang.",
          ],
          ru: [
            "Витамин D способствует нормальному всасыванию кальция и фосфора в кишечнике и участвует в поддержании нормального состояния костей и зубов. Он также нужен для нормальной работы мышц и иммунной системы.",
            "Нехватка часто протекает без каких-либо признаков. Иногда она проявляется усталостью, дискомфортом в мышцах и костях, но такие признаки бывают и по другим причинам — поэтому не ставьте себе диагноз сами.",
          ],
        },
      },
      {
        heading: { uz: "Kimda xavf yuqori", ru: "У кого риск выше" },
        paragraphs: {
          uz: [
            "Koʻp vaqtini xonada oʻtkazadiganlar, keksalar (yosh bilan terida vitamin D kamroq hosil boʻladi), terisini toʻliq yopib yuradiganlar, ortiqcha vazni borlar, homilador va emizikli ayollar, faqat ona suti bilan oziqlanadigan chaqaloqlar.",
            "Darajani bilishning yagona ishonchli yoʻli — qonda 25(OH)D tahlili. Natijaga qarab shifokor dozani va qancha vaqt ichishni belgilaydi.",
          ],
          ru: [
            "Те, кто много времени проводит в помещении; пожилые люди (с возрастом кожа вырабатывает меньше витамина D); те, кто полностью закрывает кожу одеждой; люди с лишним весом; беременные и кормящие женщины; младенцы на исключительно грудном вскармливании.",
            "Единственный надёжный способ узнать уровень — анализ крови на 25(OH)D. По результату врач подбирает дозу и длительность приёма.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor va qanday ichish", ru: "Суточная норма и как принимать" },
        paragraphs: {
          uz: [
            "Kattalar uchun tavsiya qilinadigan miqdor odatda kuniga 15 mkg (600 XB), 70 yoshdan keyin — 20 mkg (800 XB). Shifokor tavsiyasisiz kuniga 100 mkg (4000 XB) dan oshirmaslik kerak: vitamin D yogʻda eriydi va organizmda toʻplanadi, ortiqchasi qonda kalsiy oshishiga olib kelishi mumkin.",
            "Vitamin D yogʻda eriydi, shuning uchun uni tarkibida biroz yogʻ bor ovqat bilan ichgan maʼqul. D3 (xolekalsiferol) shakli darajani D2 ga qaraganda yaxshiroq koʻtaradi — koʻp qoʻshimchalar aynan shu shaklda.",
          ],
          ru: [
            "Рекомендуемое количество для взрослых обычно 15 мкг (600 МЕ) в день, после 70 лет — 20 мкг (800 МЕ). Без рекомендации врача не стоит превышать 100 мкг (4000 МЕ) в день: витамин D жирорастворимый, накапливается в организме, и его избыток может повышать кальций в крови.",
            "Витамин D растворяется в жирах, поэтому его лучше принимать с едой, в которой есть немного жира. Форма D3 (холекальциферол) повышает уровень лучше, чем D2, — большинство добавок выпускают именно в ней.",
          ],
        },
      },
      {
        heading: { uz: "Kalsiy va K2 bilan birga", ru: "Вместе с кальцием и K2" },
        paragraphs: {
          uz: [
            "Kalsiy, D3 va K2 koʻpincha bitta kompleksda chiqariladi: D3 kalsiyning soʻrilishiga, K vitamini esa suyaklarning meʼyoriy holatini saqlashga hissa qoʻshadi. Qon suyultiruvchi dori (masalan, varfarin) ichadiganlar K vitaminini faqat shifokor bilan kelishib qabul qilishi kerak.",
          ],
          ru: [
            "Кальций, D3 и K2 часто выпускают одним комплексом: D3 способствует всасыванию кальция, а витамин K — поддержанию нормального состояния костей. Тем, кто принимает препараты для разжижения крови (например, варфарин), витамин K можно принимать только по согласованию с врачом.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["swiss-energy-calcivit-30", "dr-frei-multivitamins-biotin-20"],
  },
  {
    slug: "magniy-va-uyqu",
    date: "2026-04-28",
    imageSeed: "blog-magnesium",
    category: { uz: "Uyqu va stress", ru: "Сон и стресс" },
    categoryKey: "lifestyle",
    title: {
      uz: "Magniy va uyqu: tinchlik minerali",
      ru: "Магний и сон: минерал спокойствия",
    },
    excerpt: {
      uz: "Magniy asab va mushaklarning meʼyoriy ishlashi uchun kerak. Kunlik meʼyor, qaysi ovqatlarda bor, kimda yetishmaydi, B6 bilan nega birga va uyqu haqida nimani bilish kerak.",
      ru: "Магний нужен для нормальной работы нервов и мышц. Суточная норма, в каких продуктах он есть, у кого его не хватает, зачем он вместе с B6 и что важно знать о сне.",
    },
    sections: [
      {
        heading: { uz: "Magniy nima uchun kerak", ru: "Зачем нужен магний" },
        paragraphs: {
          uz: [
            "Kattalar organizmida taxminan 25 g magniy bor, uning yarmidan koʻpi suyaklarda. Magniy 300 dan ortiq fermentativ reaksiyada ishtirok etadi: energiya almashinuvi, oqsil hosil boʻlishi, asab impulslari va mushak qisqarishi.",
            "Magniy asab tizimining meʼyoriy ishlashiga, meʼyoriy psixologik faoliyatga va mushaklarning meʼyoriy ishlashiga hissa qoʻshadi, shuningdek charchoq va holsizlikni kamaytirishga yordam beradi.",
          ],
          ru: [
            "В организме взрослого около 25 г магния, больше половины — в костях. Магний участвует более чем в 300 ферментативных реакциях: энергетический обмен, синтез белка, передача нервных импульсов и сокращение мышц.",
            "Магний способствует нормальной работе нервной системы, нормальной психологической функции и нормальной работе мышц, а также помогает уменьшить усталость и утомляемость.",
          ],
        },
      },
      {
        heading: { uz: "Kunlik meʼyor va ovqatdagi manbalar", ru: "Суточная норма и источники в еде" },
        paragraphs: {
          uz: [
            "Kattalar uchun tavsiya qilinadigan miqdor erkaklarda kuniga taxminan 400–420 mg, ayollarda 310–320 mg. Yorliqlarda koʻpincha 375 mg ga nisbatan foiz koʻrsatiladi — bu Yevropa maʼlumot qiymati.",
            "Magniyga boy ovqatlar: qovoq urugʻi, bodom, yeryongʻoq, kunjut, ismaloq, loviya, noʻxat, mosh, grechka, toʻliq donli non va qora shokolad. Oʻzbek dasturxonidagi mosh, noʻxat va yongʻoq — yaxshi manba.",
          ],
          ru: [
            "Рекомендуемое количество для взрослых — около 400–420 мг в день у мужчин и 310–320 мг у женщин. На этикетках процент часто считают от 375 мг — это европейское референсное значение.",
            "Продукты, богатые магнием: тыквенные семечки, миндаль, арахис, кунжут, шпинат, фасоль, нут, маш, гречка, цельнозерновой хлеб и тёмный шоколад. Маш, нут и орехи из узбекской кухни — хороший источник.",
          ],
        },
      },
      {
        heading: { uz: "Kimda yetishmasligi mumkin", ru: "У кого его может не хватать" },
        paragraphs: {
          uz: [
            "Ratsionda sabzavot, dukkakli va don kam boʻlsa, spirtli ichimlik muntazam ichilsa, siydik haydovchi yoki oshqozon kislotasini kamaytiruvchi dorilar uzoq vaqt qabul qilinsa, 2-tur qandli diabetda va keksa yoshda magniy kamroq soʻriladi yoki koʻproq chiqib ketadi.",
            "Qondagi magniy tahlili organizmdagi umumiy zaxirani toʻliq koʻrsatmaydi, shuning uchun shubha boʻlsa shifokor bilan gaplashing.",
          ],
          ru: [
            "Магний хуже усваивается или сильнее выводится, если в рационе мало овощей, бобовых и злаков, при регулярном употреблении алкоголя, при длительном приёме мочегонных или препаратов, снижающих кислотность желудка, при диабете 2 типа и в пожилом возрасте.",
            "Анализ крови на магний не полностью показывает общий запас в организме, поэтому при сомнениях поговорите с врачом.",
          ],
        },
      },
      {
        heading: { uz: "Magniy va uyqu: nimani bilish kerak", ru: "Магний и сон: что важно знать" },
        paragraphs: {
          uz: [
            "Magniy asab tizimining meʼyoriy ishlashi uchun kerak, shuning uchun koʻpchilik uni kechki odatga qoʻshadi. Ammo magniy uyqu dori emas: uyqu sifati boʻyicha tadqiqotlar natijasi har xil, va yaxshi uyquning asosi — odatlar.",
            "Har kuni bir vaqtda yotish va turish, kunduzi tabiiy yorugʻlik, soat 14:00 dan keyin kofe va choyni kamaytirish, yotishdan bir soat oldin telefon va ekrandan uzoqlashish, salqin va qorongʻi xona. Uyqusizlik ikki-uch haftadan uzoq davom etsa, shifokorga murojaat qiling.",
          ],
          ru: [
            "Магний нужен для нормальной работы нервной системы, поэтому многие добавляют его в вечерний ритуал. Но магний — не снотворное: результаты исследований о качестве сна разные, а основа хорошего сна — привычки.",
            "Ложиться и вставать в одно время, днём бывать на дневном свету, после 14:00 меньше кофе и крепкого чая, за час до сна отложить телефон и экраны, прохладная и тёмная спальня. Если бессонница длится дольше двух-трёх недель, обратитесь к врачу.",
          ],
        },
      },
      {
        heading: { uz: "B6 bilan nega birga va qanday ichish", ru: "Зачем вместе с B6 и как принимать" },
        paragraphs: {
          uz: [
            "Vitamin B6 ham asab tizimining meʼyoriy ishlashiga va charchoqni kamaytirishga hissa qoʻshadi, shuning uchun magniy koʻpincha B6 bilan birga chiqariladi. Sitrat va boshqa organik shakllar oksiddan yaxshiroq soʻriladi; shipuchi tabletka suvda eriydi va yutish oson.",
            "Yuqori dozada ich ketishi mumkin — yorliqdagi dozadan oshirmang. Buyrak kasalligida magniyni faqat shifokor bilan kelishib qabul qiling. Magniy baʼzi antibiotiklar (tetratsiklinlar, ftorxinolonlar) va suyak uchun dorilarning soʻrilishini kamaytiradi: odatda antibiotik magniydan kamida 2 soat oldin yoki 4–6 soat keyin ichiladi. Aniq oraliqni dori yoʻriqnomasidan yoki farmatsevtdan biling.",
          ],
          ru: [
            "Витамин B6 тоже способствует нормальной работе нервной системы и уменьшению усталости, поэтому магний часто выпускают вместе с B6. Цитрат и другие органические формы усваиваются лучше оксида; шипучая таблетка растворяется в воде, её легко принимать.",
            "В высоких дозах магний может ослаблять стул — не превышайте дозу на этикетке. При заболеваниях почек принимайте магний только по согласованию с врачом. Магний снижает всасывание некоторых антибиотиков (тетрациклинов, фторхинолонов) и препаратов для костей: обычно антибиотик принимают минимум за 2 часа до магния или через 4–6 часов после. Точный интервал уточните в инструкции к лекарству или у фармацевта.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["dr-frei-antistress-magniy-20"],
    relatedArticleSlugs: ["magniy-b6-va-magniy-sitrat-farqi"],
  },
];

/*
  Reading time from the words the reader actually gets, at ~200 words a
  minute. The hard-coded 6/5/4 minutes promised a long read for articles of
  about a hundred words.
*/
export const WORDS_PER_MINUTE = 200;

export function readingMinutes(
  article: Pick<Article, "excerpt" | "sections">,
  wpm = WORDS_PER_MINUTE,
): number {
  const text = [article.excerpt, ...article.sections.flatMap((s) => [s.heading, ...s.paragraphs])].join(" ");
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.round(words / wpm));
}

function resolve(a: RawArticle, locale: Locale): Article {
  const sections = a.sections.map((s) => ({
    heading: s.heading[locale],
    paragraphs: s.paragraphs[locale],
  }));
  const excerpt = a.excerpt[locale];
  return {
    slug: a.slug,
    date: a.date,
    readingMinutes: readingMinutes({ excerpt, sections }),
    image: img(a.imageSeed),
    category: a.category[locale],
    categoryKey: a.categoryKey,
    title: a.title[locale],
    excerpt,
    sections,
    relatedProductSlugs: a.relatedProductSlugs,
    relatedArticleSlugs: a.relatedArticleSlugs,
  };
}

export function getArticles(locale: Locale): Article[] {
  return rawArticles
    .map((a) => resolve(a, locale))
    .sort((x, y) => (x.date < y.date ? 1 : -1));
}

export function getArticle(slug: string, locale: Locale): Article | null {
  const raw = rawArticles.find((a) => a.slug === slug);
  return raw ? resolve(raw, locale) : null;
}

export function listArticleSlugs(): string[] {
  return rawArticles.map((a) => a.slug);
}
