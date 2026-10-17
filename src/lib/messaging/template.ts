/*
  Message templates: {ism}, {savat}, {summa}, {kod}, {muddat}, {havola},
  {mahsulot}. One renderer for the flow editor's live preview, campaigns and
  the sender, so what the admin sees is what goes out.

  Rendering happens twice. When a message is queued, everything known then
  (name, cart, sum) is filled in; {kod}, {muddat} and {havola} need the send
  moment — the code is issued and the short link minted only when the message
  actually leaves — so they stay as placeholders until `finalizeText`.
*/

export const PLACEHOLDERS = ["ism", "savat", "summa", "mahsulot", "kod", "muddat", "havola"] as const;
export type Placeholder = (typeof PLACEHOLDERS)[number];
export type TemplateVars = Partial<Record<Placeholder, string>>;
export type MessageLocale = "uz" | "ru";

export const PLACEHOLDER_LABELS: Record<Placeholder, string> = {
  ism: "Mijoz ismi",
  savat: "Savatdagi mahsulotlar",
  summa: "Savat summasi",
  mahsulot: "Mahsulot nomi",
  kod: "Shaxsiy promokod",
  muddat: "Kod amal qilish muddati",
  havola: "Qisqa havola",
};

const PATTERN = /\{(ism|savat|summa|mahsulot|kod|muddat|havola)\}/g;

/** Fills the placeholders `vars` has a value for; the rest stay as they are. */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(PATTERN, (whole, key: Placeholder) => (vars[key] !== undefined ? vars[key]! : whole));
}

/** The text that goes out: every placeholder filled, missing ones removed cleanly. */
export function finalizeText(template: string, vars: TemplateVars): string {
  return renderTemplate(template, vars)
    .replace(PATTERN, "")
    .replace(/[ \t]+([,.!?:;)])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +\n/g, "\n")
    .trim();
}

export function usedPlaceholders(template: string): Placeholder[] {
  return [...new Set([...template.matchAll(PATTERN)].map((m) => m[1] as Placeholder))];
}

const FALLBACK_NAME: Record<MessageLocale, string> = { uz: "doʻstim", ru: "друг" };

export function firstName(name: string | null | undefined, locale: MessageLocale): string {
  const first = name?.trim().split(/\s+/)[0] ?? "";
  return first && first.length <= 40 ? first : FALLBACK_NAME[locale];
}

function groupThousands(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatSum(value: number, locale: MessageLocale): string {
  return `${groupThousands(value)} ${locale === "ru" ? "сум" : "soʻm"}`;
}

/** "Omega-3, Vitamin D3 va yana 2 ta" — short enough for an SMS. */
export function cartSummary(items: { name: string }[], locale: MessageLocale): string {
  const names = items.map((i) => i.name.trim()).filter(Boolean);
  if (names.length === 0) return "";
  const shown = names.slice(0, 2).map((n) => (n.length > 40 ? `${n.slice(0, 39)}…` : n));
  const rest = names.length - shown.length;
  if (rest <= 0) return shown.join(", ");
  return locale === "ru" ? `${shown.join(", ")} и ещё ${rest}` : `${shown.join(", ")} va yana ${rest} ta`;
}

/** "19.10, 23:59" in Tashkent time. */
export function formatExpiry(date: Date): string {
  const local = new Date(date.getTime() + 5 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(local.getUTCDate())}.${pad(local.getUTCMonth() + 1)}, ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
}

/** Example values for the editor preview — clearly fake, never a real customer's. */
export function sampleVars(locale: MessageLocale): Required<TemplateVars> {
  return locale === "ru"
    ? { ism: "Малика", savat: "Omega-3, Vitamin D3", summa: formatSum(245000, "ru"), mahsulot: "Magniy B6", kod: "GV-7K3P9Q", muddat: "19.10, 23:59", havola: "govita.uz/r/1a2b-Xy3Zq1" }
    : { ism: "Malika", savat: "Omega-3, Vitamin D3", summa: formatSum(245000, "uz"), mahsulot: "Magniy B6", kod: "GV-7K3P9Q", muddat: "19.10, 23:59", havola: "govita.uz/r/1a2b-Xy3Zq1" };
}

/** Every marketing message ends with a way out. */
export function withOptOut(text: string, channel: "sms" | "telegram", stopUrl: string, locale: MessageLocale): string {
  if (channel === "sms") return `${text}\nSTOP: ${stopUrl}`;
  return `${text}\n\n${locale === "ru" ? "Отписаться" : "Xabarlarni oʻchirish"}: ${stopUrl}`;
}

/** A sample opt-out line of realistic length, for counting SMS parts in the editors. */
export const SAMPLE_STOP_URL = "govita.uz/s/AbCdEfGhIjKlMnO";
