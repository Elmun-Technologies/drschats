import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

interface ArticleSection {
  heading: L;
  paragraphs: L<string[]>;
}

interface RawArticle {
  slug: string;
  date: string;
  readingMinutes: number;
  imageSeed: string;
  category: L;
  title: L;
  excerpt: L;
  sections: ArticleSection[];
  relatedProductSlugs: string[];
}

export interface Article {
  slug: string;
  date: string;
  readingMinutes: number;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  sections: { heading: string; paragraphs: string[] }[];
  relatedProductSlugs: string[];
}

const img = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `/placeholders/p${(h % 6) + 1}.svg`;
};

const rawArticles: RawArticle[] = [
  {
    slug: "omega-3-nima-uchun-kerak",
    date: "2026-05-20",
    readingMinutes: 6,
    imageSeed: "blog-omega3",
    category: { uz: "Yurak sog'lig'i", ru: "Здоровье сердца" },
    title: {
      uz: "Omega-3 nima uchun kerak va qanday tanlash kerak",
      ru: "Зачем нужна омега-3 и как её выбрать",
    },
    excerpt: {
      uz: "EPA va DHA — yurak, miya va ko'z uchun zarur yog' kislotalari. Sifatli omega-3 ni qanday tanlashni o'rganing.",
      ru: "EPA и DHA — жирные кислоты для сердца, мозга и зрения. Узнайте, как выбрать качественную омегу-3.",
    },
    sections: [
      {
        heading: { uz: "EPA va DHA nima?", ru: "Что такое EPA и DHA?" },
        paragraphs: {
          uz: [
            "Omega-3 — bu organizm o'zi ishlab chiqara olmaydigan to'yinmagan yog' kislotalari. Asosiy ikkitasi — EPA va DHA — baliq yog'ida ko'p bo'ladi.",
            "DHA miya va to'r parda hujayralarining qurilish bloki, EPA esa yallig'lanishni muvozanatlashga yordam beradi.",
          ],
          ru: [
            "Омега-3 — это ненасыщенные жирные кислоты, которые организм не вырабатывает сам. Две главные — EPA и DHA — содержатся в рыбьем жире.",
            "DHA — строительный блок клеток мозга и сетчатки, а EPA помогает балансировать воспаление.",
          ],
        },
      },
      {
        heading: { uz: "Sifatli mahsulotni qanday tanlash", ru: "Как выбрать качественный продукт" },
        paragraphs: {
          uz: [
            "Yorliqdagi EPA va DHA umumiy miqdoriga e'tibor bering — bu baliq yog'ining umumiy og'irligidan muhimroq.",
            "Molekulyar distillash va IFOS sertifikati og'ir metallardan tozalanganini bildiradi. Hidsiz formula sifatdan dalolat beradi.",
          ],
          ru: [
            "Смотрите на суммарное количество EPA и DHA на этикетке — это важнее общего веса рыбьего жира.",
            "Молекулярная дистилляция и сертификат IFOS означают очистку от тяжёлых металлов. Отсутствие запаха — признак качества.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["omega-3-premium", "multivitamin-daily"],
  },
  {
    slug: "qishda-vitamin-d",
    date: "2026-05-12",
    readingMinutes: 5,
    imageSeed: "blog-vitamind",
    category: { uz: "Immunitet", ru: "Иммунитет" },
    title: {
      uz: "Qishda vitamin D: nega ko'pchilikda yetishmaydi",
      ru: "Витамин D зимой: почему его не хватает многим",
    },
    excerpt: {
      uz: "Quyosh kam bo'lgan oylarda vitamin D darajasi pasayadi. Bu kayfiyat, suyak va immunitetga qanday ta'sir qiladi?",
      ru: "В месяцы нехватки солнца уровень витамина D падает. Как это влияет на настроение, кости и иммунитет?",
    },
    sections: [
      {
        heading: { uz: "Quyosh va vitamin D", ru: "Солнце и витамин D" },
        paragraphs: {
          uz: [
            "Terimiz quyosh nuri ta'sirida vitamin D ishlab chiqaradi. Kuz va qishda nur kamayadi, shuning uchun daraja pasayadi.",
            "Vitamin D yetishmovchiligi charchoq, kayfiyat pasayishi va tez-tez shamollash bilan namoyon bo'lishi mumkin.",
          ],
          ru: [
            "Кожа вырабатывает витамин D под действием солнца. Осенью и зимой света меньше, поэтому уровень падает.",
            "Дефицит витамина D может проявляться усталостью, снижением настроения и частыми простудами.",
          ],
        },
      },
      {
        heading: { uz: "Nega K2 bilan birga?", ru: "Почему вместе с K2?" },
        paragraphs: {
          uz: [
            "Vitamin K2 kalsiyni qon tomirlaridan suyaklarga yo'naltiradi. Shuning uchun D3 + K2 juftligi ideal hisoblanadi.",
          ],
          ru: [
            "Витамин K2 направляет кальций из сосудов в кости. Поэтому пара D3 + K2 считается идеальной.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["vitamin-d3-k2", "immuno-complex"],
  },
  {
    slug: "magniy-va-uyqu",
    date: "2026-04-28",
    readingMinutes: 4,
    imageSeed: "blog-magnesium",
    category: { uz: "Uyqu va stress", ru: "Сон и стресс" },
    title: {
      uz: "Magniy va uyqu: tinchlik minerali",
      ru: "Магний и сон: минерал спокойствия",
    },
    excerpt: {
      uz: "Magniy asab tizimini tinchlantiradi va mushak tirishishini yumshatadi. Uyqu sifatiga qanday yordam beradi?",
      ru: "Магний успокаивает нервную систему и смягчает судороги. Как он помогает качеству сна?",
    },
    sections: [
      {
        heading: { uz: "Nega magniy muhim", ru: "Почему магний важен" },
        paragraphs: {
          uz: [
            "Magniy yuzlab fermentativ reaksiyalarda ishtirok etadi, jumladan asab va mushak ishini boshqarishda.",
            "Kechqurun qabul qilingan magniy organizmni dam olishga tayyorlaydi va uyquga kirishni osonlashtiradi.",
          ],
          ru: [
            "Магний участвует в сотнях ферментативных реакций, в том числе в работе нервов и мышц.",
            "Принятый вечером магний готовит тело к отдыху и облегчает засыпание.",
          ],
        },
      },
    ],
    relatedProductSlugs: ["magnesium-b6", "collagen-beauty"],
  },
];

function resolve(a: RawArticle, locale: Locale): Article {
  return {
    slug: a.slug,
    date: a.date,
    readingMinutes: a.readingMinutes,
    image: img(a.imageSeed),
    category: a.category[locale],
    title: a.title[locale],
    excerpt: a.excerpt[locale],
    sections: a.sections.map((s) => ({
      heading: s.heading[locale],
      paragraphs: s.paragraphs[locale],
    })),
    relatedProductSlugs: a.relatedProductSlugs,
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
