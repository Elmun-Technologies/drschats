import type { Locale } from "@/lib/i18n/routing";

/*
  Where the products are sold over the counter.

  The client named eleven chains and said the whole range sits in all of their
  branches ("barcha setlarida bor"). What goes on the page is the chain list —
  that part is the client's own statement about their own distribution — plus,
  for the chains whose branches could be checked against public listings, a few
  real addresses and a link to the chain's live map.

  Deliberately NOT here: a hardcoded list of every branch. Pharmacy networks in
  Tashkent open and close branches constantly, and a stale address on a "where
  to buy" page sends a customer to a shuttered shop; the map links resolve to
  whatever the network runs today. Equally deliberately, no coordinates are
  invented for a map of our own — a pin needs a survey, not a guess.

  Addresses and district names are written in both scripts. A Russian page with
  an Uzbek street name on it is the same defect the client reported for the rest
  of the site, and a pharmacy address is the one string on the page a customer
  has to match against a sign.

  `PHARMACIES_VERIFIED_AT` is the date the addresses below were read from the
  sources noted beside them, so the next person knows how old the list is.
*/

type L<T = string> = Record<Locale, T>;

export interface PharmacyBranch {
  district: L;
  address: L;
}

export interface PharmacyChain {
  /** Chain name as customers see it on the sign — not translated. */
  name: string;
  /** Short note — coverage, phone or the trading name behind the sign. */
  note?: L;
  /** How many branches the network runs, when a public listing states it. */
  branches?: number;
  /** A few verified addresses; not the whole network. */
  addresses?: PharmacyBranch[];
  /** Deep link into the chain's live branch list on 2GIS. */
  mapUrl: string;
}

const map2gis = (term: string) => `https://2gis.uz/uz/tashkent/search/${encodeURIComponent(term)}`;

/** Date the addresses below were checked against public listings. */
export const PHARMACIES_VERIFIED_AT = "2026-10-04";

const D = {
  yakkasaroy: { uz: "Yakkasaroy", ru: "Яккасарайский" },
  chilonzor: { uz: "Chilonzor", ru: "Чиланзарский" },
  mirzoUlugbek: { uz: "Mirzo Ulug‘bek", ru: "Мирзо-Улугбекский" },
  sergeli: { uz: "Sergeli", ru: "Сергелийский" },
  yunusobod: { uz: "Yunusobod", ru: "Юнусабадский" },
  olmazor: { uz: "Olmazor", ru: "Алмазарский" },
  mirobod: { uz: "Mirobod", ru: "Мирабадский" },
  bektemir: { uz: "Bektemir", ru: "Бектемирский" },
} satisfies Record<string, L>;

export const PHARMACY_CHAINS: PharmacyChain[] = [
  {
    name: "City Pharm",
    note: {
      uz: "Go Vita assortimenti barcha filiallarida",
      ru: "Ассортимент Go Vita во всех филиалах",
    },
    branches: 64,
    addresses: [
      {
        district: D.yakkasaroy,
        address: { uz: "Sh. Rustaveli ko‘chasi, 53/27", ru: "ул. Ш. Руставели, 53/27" },
      },
      {
        district: D.chilonzor,
        address: { uz: "Kichik Halka Yo‘li ko‘chasi, 1/1", ru: "ул. Малая Кольцевая дорога, 1/1" },
      },
      { district: D.mirzoUlugbek, address: { uz: "Osiyo ko‘chasi, 17", ru: "ул. Осиё, 17" } },
      {
        district: D.sergeli,
        address: { uz: "Sergeli-2, Yangi Sergeli Yo‘li, 1/83", ru: "Сергели-2, ул. Янги Сергели йули, 1/83" },
      },
    ],
    mapUrl: map2gis("City pharm"),
  },
  {
    name: "Grandpharm",
    note: { uz: "MChJ Grand pharm trade", ru: "ООО Grand pharm trade" },
    branches: 75,
    addresses: [
      { district: D.yunusobod, address: { uz: "Yunusobod 7-kvartal, 1", ru: "Юнусабад, 7-й квартал, 1" } },
      { district: D.sergeli, address: { uz: "Sergeli-2 mavzesi, 1", ru: "массив Сергели-2, 1" } },
      { district: D.olmazor, address: { uz: "Ziyo ko‘chasi, 12", ru: "ул. Зиё, 12" } },
      { district: D.mirobod, address: { uz: "Nukus ko‘chasi, 83A", ru: "ул. Нукус, 83А" } },
    ],
    mapUrl: map2gis("Grandpharm"),
  },
  { name: "Effekt pharm", mapUrl: map2gis("Effekt pharm") },
  {
    name: "Vaksina",
    note: { uz: "Dorixonalar tarmog‘i", ru: "Аптечная сеть" },
    mapUrl: map2gis("Vaksina dorixona"),
  },
  {
    name: "Eko pharm",
    note: {
      uz: "Toshkent bo‘ylab 20 ta filial, tel: +998 71 207 73 00",
      ru: "20 филиалов по Ташкенту, тел: +998 71 207 73 00",
    },
    branches: 20,
    addresses: [
      {
        district: D.olmazor,
        address: { uz: "Qoraqamish 2/4-massiv, 20/37-uy", ru: "массив Каракамыш 2/4, д. 20/37" },
      },
      { district: D.bektemir, address: { uz: "Suvsoz ko‘chasi, 29", ru: "ул. Сувсоз, 29" } },
    ],
    mapUrl: map2gis("Eco pharma"),
  },
  { name: "Koinot", mapUrl: map2gis("Koinot dorixona") },
  { name: "Shox pharm", mapUrl: map2gis("Shox pharm") },
  {
    name: "Pharma Cosmos",
    note: { uz: "Pharma Cosmos MChJ", ru: "ООО Pharma Cosmos" },
    addresses: [
      {
        district: D.yakkasaroy,
        address: { uz: "Sh. Rustaveli ko‘chasi, 11/14", ru: "ул. Ш. Руставели, 11/14" },
      },
      { district: D.yunusobod, address: { uz: "Yunusobod-9 mavzesi", ru: "массив Юнусабад-9" } },
      {
        district: D.chilonzor,
        address: { uz: "Chilonzor-7, Lutfi ko‘chasi, 33", ru: "Чиланзар-7, ул. Лутфи, 33" },
      },
      { district: D.mirzoUlugbek, address: { uz: "Ziyolilar ko‘chasi, 4G", ru: "ул. Зиёлилар, 4Г" } },
    ],
    mapUrl: map2gis("Pharma Cosmos"),
  },
  {
    name: "Anvar pharm",
    note: { uz: "Anvar Farm Servis", ru: "Anvar Farm Servis" },
    addresses: [
      { district: D.mirzoUlugbek, address: { uz: "Osiyo ko‘chasi, 17A", ru: "ул. Осиё, 17А" } },
      {
        district: D.yakkasaroy,
        address: { uz: "A. Qahhor 7-o‘tish yo‘li, 3-uy", ru: "проезд А. Каххора 7-й, д. 3" },
      },
    ],
    mapUrl: map2gis("Anvar farm"),
  },
  { name: "Mega pharm", mapUrl: map2gis("Mega pharm") },
  { name: "Shavkat o‘g‘li", mapUrl: map2gis("Shavkat o‘g‘li dorixona") },
];
