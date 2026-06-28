import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

interface RawExpert {
  id: string;
  slug: string;
  name: string;
  photoSeed: string;
  title: L;
  bio: L;
  credentials: L<string[]>;
  worksFor: string;
  sameAs: string[];
}

export interface Expert {
  id: string;
  slug: string;
  name: string;
  image: string;
  title: string;
  bio: string;
  credentials: string[];
  worksFor: string;
  sameAs: string[];
}

const img = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `/placeholders/p${(h % 6) + 1}.svg`;
};

const rawExperts: RawExpert[] = [
  {
    id: "exp-alimov",
    slug: "dr-jasur-alimov",
    name: "Dr. Jasur Alimov",
    photoSeed: "exp-alimov",
    title: {
      uz: "Klinik farmakolog, tibbiyot fanlari nomzodi",
      ru: "Клинический фармаколог, кандидат медицинских наук",
    },
    bio: {
      uz: "15 yildan ortiq klinik farmakologiya tajribasi. Biologik faol qo'shimchalarning xavfsizligi va o'zaro ta'siri bo'yicha mutaxassis.",
      ru: "Более 15 лет в клинической фармакологии. Специалист по безопасности и взаимодействию биологически активных добавок.",
    },
    credentials: {
      uz: ["Tibbiyot fanlari nomzodi (PhD)", "Klinik farmakologiya bo'yicha sertifikat", "O'zbekiston shifokorlar reyestrida"],
      ru: ["Кандидат медицинских наук (PhD)", "Сертификат по клинической фармакологии", "В реестре врачей Узбекистана"],
    },
    worksFor: "Alimkhanov Medical Review Board",
    sameAs: ["https://pubmed.ncbi.nlm.nih.gov/", "https://www.linkedin.com/"],
  },
  {
    id: "exp-karimova",
    slug: "dr-nodira-karimova",
    name: "Dr. Nodira Karimova",
    photoSeed: "exp-karimova",
    title: {
      uz: "Klinik diyetolog, nutritsiolog (RDN)",
      ru: "Клинический диетолог, нутрициолог (RDN)",
    },
    bio: {
      uz: "Vitamin va mineral yetishmovchiligi, sport ovqatlanishi bo'yicha amaliyotchi diyetolog.",
      ru: "Практикующий диетолог по дефицитам витаминов и минералов и спортивному питанию.",
    },
    credentials: {
      uz: ["Ro'yxatdan o'tgan diyetolog-nutritsiolog (RDN)", "Sport ovqatlanishi sertifikati"],
      ru: ["Зарегистрированный диетолог-нутрициолог (RDN)", "Сертификат по спортивному питанию"],
    },
    worksFor: "Alimkhanov Medical Review Board",
    sameAs: ["https://pubmed.ncbi.nlm.nih.gov/", "https://www.linkedin.com/"],
  },
  {
    id: "exp-yusupov",
    slug: "dr-bekzod-yusupov",
    name: "Dr. Bekzod Yusupov",
    photoSeed: "exp-yusupov",
    title: {
      uz: "Farmatsevt (PharmD)",
      ru: "Фармацевт (PharmD)",
    },
    bio: {
      uz: "Dori va qo'shimchalar sifati nazorati, GMP standartlari bo'yicha mutaxassis.",
      ru: "Специалист по контролю качества препаратов и добавок, стандартам GMP.",
    },
    credentials: {
      uz: ["Farmatsevtika doktori (PharmD)", "GMP audit sertifikati"],
      ru: ["Доктор фармацевтики (PharmD)", "Сертификат GMP-аудитора"],
    },
    worksFor: "Alimkhanov Medical Review Board",
    sameAs: ["https://pubmed.ncbi.nlm.nih.gov/", "https://www.linkedin.com/"],
  },
];

function resolve(e: RawExpert, locale: Locale): Expert {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    image: img(e.photoSeed),
    title: e.title[locale],
    bio: e.bio[locale],
    credentials: e.credentials[locale],
    worksFor: e.worksFor,
    sameAs: e.sameAs,
  };
}

export function getExperts(locale: Locale): Expert[] {
  return rawExperts.map((e) => resolve(e, locale));
}

export function getExpert(slug: string, locale: Locale): Expert | null {
  const raw = rawExperts.find((e) => e.slug === slug);
  return raw ? resolve(raw, locale) : null;
}

export function getExpertById(id: string, locale: Locale): Expert | null {
  const raw = rawExperts.find((e) => e.id === id);
  return raw ? resolve(raw, locale) : null;
}

export function listExpertSlugs(): string[] {
  return rawExperts.map((e) => e.slug);
}

export function reviewerForKey(key: string, locale: Locale): Expert {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return resolve(rawExperts[h % rawExperts.length], locale);
}
