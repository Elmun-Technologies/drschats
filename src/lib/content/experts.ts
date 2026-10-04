import type { Locale } from "@/lib/i18n/routing";

type L<T = string> = Record<Locale, T>;

interface RawExpert {
  id: string;
  slug: string;
  name: string;
  /**
   * Marks a record as a layout placeholder rather than a person.
   *
   * The client asked for the expert section to be filled with demo profiles
   * for the presentation, so the design can be seen with content in it. A demo
   * record is treated differently everywhere it matters:
   *
   *  - its title carries "(namuna profili)" / "(демо-профиль)", so no screen
   *    can show the name without the label;
   *  - the expert pages print a banner saying the record is a placeholder;
   *  - `reviewerForKey()` refuses to return one, so a demo profile can never
   *    be printed as the medical reviewer of a product or an article.
   *
   * Removing the flag and dropping in the real record is the whole upgrade
   * path — see docs/GOVITA-TAVSIYALAR.md §3.
   */
  demo?: boolean;
  /** Path in /public — the person's own photograph, with written consent on file. */
  photo?: string;
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
  /** Placeholder profile — see RawExpert.demo. */
  isDemo: boolean;
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

/*
  The review board is empty on purpose.

  This file used to ship three complete experts — "Dr. Jasur Alimov", "Dr.
  Nodira Karimova", "Dr. Bekzod Yusupov" — with invented credentials, an
  invented 15-year biography each, LinkedIn and PubMed profile URLs that
  belonged to nobody, and a generated portrait. `reviewerForKey()` then assigned
  one of them, deterministically, as the medical reviewer of every product and
  every article on the site, and the product page printed their name under
  "Tekshirilgan".

  That is a fabricated medical endorsement, attached to pages about how a
  person should take supplements, in a country where the advertising law
  (art. 35) is explicit about supplement claims. It also cannot be fixed by
  rewriting the copy — the whole point of the block is that a named, reachable
  professional stands behind the content.

  So the list is empty until real ones exist, and everything downstream already
  degrades to "no reviewer shown" (the components take an optional expert, and
  the JSON-LD omits reviewedBy/author rather than pointing at a stranger). The
  moment Sanity holds a real person — a real name, a real photo of them, a
  speciality, a place of work and their written consent — they appear here
  again, unchanged, by adding the record.

  See docs/GOVITA-TAVSIYALAR.md §Ekspertlar for exactly what each record needs.
*/
const rawExperts: RawExpert[] = [
  /*
    Two demo profiles, with portraits generated for the layout (see
    /public/images/experts). They contain no invented degrees, no invented
    years of experience and no profile links: the "credentials" below are the
    checklist of what the real record must contain, printed where the real
    credentials will be. A third portrait is still being generated.
  */
  {
    id: "demo-therapist",
    slug: "namuna-terapevt",
    demo: true,
    name: "Dr. Malika Yusupova",
    photo: "/images/experts/demo-1.jpg",
    photoSeed: "demo-therapist",
    title: {
      uz: "Terapevt (namuna profili)",
      ru: "Терапевт (демо-профиль)",
    },
    bio: {
      uz: "Bu — namuna profil: ekspertlar bo'limi qanday ko'rinishini ko'rsatish uchun qo'yilgan. Haqiqiy mutaxassis kelganda shu yerga uning ismi, mutaxassisligi, ish joyi va mahsulot tavsiflarini ko'rib chiqqani haqidagi yozma roziligi qo'yiladi. Shu sababli bu profil mahsulot sahifalarida «tekshirgan mutaxassis» sifatida ko'rinmaydi.",
      ru: "Это демо-профиль: он показывает, как будет выглядеть раздел экспертов. Когда появится реальный специалист, здесь будут его имя, специальность, место работы и письменное согласие на проверку описаний продуктов. Поэтому данный профиль не отображается на страницах продуктов как «проверивший специалист».",
    },
    credentials: {
      uz: [
        "Diplom va mutaxassislik sertifikati — hujjat kutilmoqda",
        "Ish joyi va lavozim — tasdiqlanmagan",
        "Ko'rib chiqilgan materiallar ro'yxati — kutilmoqda",
      ],
      ru: [
        "Диплом и сертификат специальности — документ ожидается",
        "Место работы и должность — не подтверждены",
        "Перечень проверенных материалов — ожидается",
      ],
    },
    worksFor: "",
    sameAs: [],
  },
  {
    id: "demo-pharmacist",
    slug: "namuna-farmatsevt",
    demo: true,
    name: "Dr. Rustam Abdullayev",
    photo: "/images/experts/demo-2.jpg",
    photoSeed: "demo-pharmacist",
    title: {
      uz: "Klinik farmatsevt (namuna profili)",
      ru: "Клинический фармацевт (демо-профиль)",
    },
    bio: {
      uz: "Bu ham namuna profil. Farmatsevt mahsulotni tavsiya qilishdan oldin uning tarkibi, dozasi va mosligini ko'rib chiqadi — shu rol uchun ajratilgan joy. Haqiqiy mutaxassis ma'lumotlari, fotosi va yozma roziligi olinishi bilan profil almashtiriladi.",
      ru: "Это также демо-профиль. Фармацевт проверяет состав, дозировку и совместимость продукта перед рекомендацией — место отведено под эту роль. Профиль будет заменён, как только появятся данные реального специалиста, его фото и письменное согласие.",
    },
    credentials: {
      uz: [
        "Diplom va litsenziya — hujjat kutilmoqda",
        "Ish joyi va lavozim — tasdiqlanmagan",
        "Ko'rib chiqilgan materiallar ro'yxati — kutilmoqda",
      ],
      ru: [
        "Диплом и лицензия — документ ожидается",
        "Место работы и должность — не подтверждены",
        "Перечень проверенных материалов — ожидается",
      ],
    },
    worksFor: "",
    sameAs: [],
  },
  {
    id: "demo-nutritionist",
    slug: "namuna-nutriyent-mutaxassisi",
    demo: true,
    name: "Dr. Nilufar Sattorova",
    photo: "/images/experts/demo-3.jpg",
    photoSeed: "demo-nutritionist",
    title: {
      uz: "Nutriyent mutaxassisi (namuna profili)",
      ru: "Специалист по нутриентам (демо-профиль)",
    },
    bio: {
      uz: "Uchinchi namuna profil — parhez va nutriyentlar bo'yicha maslahat roli uchun. Bu yerda haqiqiy mutaxassisning ta'lim ma'lumotlari, ish joyi va ko'rib chiqqan materiallari ro'yxati turadi; hozircha ular kutilmoqda, shuning uchun profil mahsulot tavsiflarida ko'rinmaydi.",
      ru: "Третий демо-профиль — место для специалиста по питанию и нутриентам. Здесь будут сведения об образовании, месте работы и списке проверенных материалов реального специалиста; пока они ожидаются, поэтому профиль не отображается в описаниях продуктов.",
    },
    credentials: {
      uz: [
        "Ta'lim va malaka hujjatlari — kutilmoqda",
        "Ish joyi va lavozim — tasdiqlanmagan",
        "Ko'rib chiqilgan materiallar ro'yxati — kutilmoqda",
      ],
      ru: [
        "Документы об образовании и квалификации — ожидаются",
        "Место работы и должность — не подтверждены",
        "Перечень проверенных материалов — ожидается",
      ],
    },
    worksFor: "",
    sameAs: [],
  },
];

function resolve(e: RawExpert, locale: Locale): Expert {
  /*
    One photo per person, from one source.

    The old map held three portraits of people who had never worked here; it is
    gone. A record carries its own `photo` file name, so the same face appears
    on the expert page, in the product review block and in the article byline —
    which was the client's actual complaint: different photos of the same name
    in different places.
  */
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    isDemo: Boolean(e.demo),
    image: e.photo ?? img(e.photoSeed),
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

/**
 * The reviewer of a page, when there is a review board to draw from.
 *
 * Returns null while the board is empty so callers hide the block instead of
 * printing an empty name — see the comment above `rawExperts`.
 */
export function reviewerForKey(key: string, locale: Locale): Expert | null {
  // Demo profiles are excluded: a placeholder may show the shape of the
  // section, but it must never be printed as the person who checked a page
  // about how to take a supplement.
  const real = rawExperts.filter((e) => !e.demo);
  if (real.length === 0) return null;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return resolve(real[h % real.length], locale);
}
