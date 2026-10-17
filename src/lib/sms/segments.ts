/*
  How many SMS a text costs, and how to keep it cheap.

  An SMS is 140 bytes. In the GSM-7 alphabet that is 160 characters (153 per
  part once a message is split, the rest is the joining header); one
  character outside it — Cyrillic, the Uzbek ʻ, an em dash — switches the
  whole message to UCS-2: 70 characters, 67 per part. Eskiz bills per part,
  so the editors show the count while the text is typed, and Uzbek-Latin
  messages can trade ʻ for a plain apostrophe to stay in GSM-7 (setting
  `sms.transliterate`).

  Pure and shared by the admin editors (client) and the sender (server).
*/

const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Characters that take an escape plus themselves — two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€\f";

const BASIC = new Set(GSM_BASIC);
const EXTENDED = new Set(GSM_EXTENDED);

export type SmsEncoding = "GSM-7" | "UCS-2";

export interface SmsCount {
  encoding: SmsEncoding;
  /** Units the text uses: septets for GSM-7, UTF-16 code units for UCS-2. */
  length: number;
  parts: number;
  /** Units left before the next part starts. */
  remaining: number;
  /** Units per part at the current size. */
  perPart: number;
}

export function isGsm7(text: string): boolean {
  for (const ch of text) if (!BASIC.has(ch) && !EXTENDED.has(ch)) return false;
  return true;
}

export function countSms(text: string): SmsCount {
  if (isGsm7(text)) {
    let length = 0;
    for (const ch of text) length += EXTENDED.has(ch) ? 2 : 1;
    const perPart = length <= 160 ? 160 : 153;
    const parts = length === 0 ? 0 : Math.ceil(length / perPart);
    return { encoding: "GSM-7", length, parts, perPart, remaining: Math.max(0, parts * perPart - length) };
  }
  const length = text.length;
  const perPart = length <= 70 ? 70 : 67;
  const parts = Math.ceil(length / perPart);
  return { encoding: "UCS-2", length, parts, perPart, remaining: Math.max(0, parts * perPart - length) };
}

/*
  Typography that silently costs a message its GSM-7 status. Replaced always:
  nobody reads the difference between – and - on a phone, everybody pays for it.
*/
const ALWAYS: [RegExp, string][] = [
  [/[‘’‛′]/g, "'"],
  [/[“”„«»]/g, '"'],
  [/[–—−]/g, "-"],
  [/…/g, "..."],
  [/[   ]/g, " "],
];

/** Uzbek modifier letters (oʻ, gʻ, tutuq ʼ) as a plain apostrophe. */
const UZBEK_APOSTROPHES = /[ʻʼʽ]/g;

export function prepareSmsText(text: string, { transliterate }: { transliterate: boolean }): string {
  let out = text;
  for (const [pattern, replacement] of ALWAYS) out = out.replace(pattern, replacement);
  if (transliterate) out = out.replace(UZBEK_APOSTROPHES, "'");
  return out.trim();
}
