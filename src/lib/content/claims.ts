/*
  These are food supplements, not medicines. Copy may say a nutrient supports
  or contributes to a normal body function; it may not say it treats, prevents,
  protects against or shortens a disease, or that it works fast or is proven.
  Shared by the claim tests of health topics, ingredients and blog articles.
*/

const NOT_LETTER = "(?<![\\p{L}\\u02BB\\u02BC])";
const word = (stem: string) => new RegExp(`${NOT_LETTER}${stem}`, "iu");

export const BANNED_CLAIMS: RegExp[] = [
  word("davola"),
  word("profilakti"),
  word("isbotlan"),
  word("tezkor"),
  word("tiklaydi"),
  word("oldini\\s+ol"),
  /viruslarga\s+qarshi/iu,
  /qarshi\s+kurash/iu,
  /(?:xavotir|stress|yallig[ʻ'‘’]lanish)ni\s+kamaytir/iu,
  /100% natija/iu,
  word("лечит"),
  word("лечени[еяю]"),
  word("излечива"),
  word("вылечи"),
  word("предотвра"),
  word("блокиру"),
  word("профилакти"),
  word("доказан"),
  word("восстанавлива"),
  word("против\\s"),
  /снижает\s+продолжительность/iu,
  word("борьб"),
];
