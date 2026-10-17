import {
  LADDER_PERCENT_CHOICES,
  LIMITS,
  POPUP_IDS,
  normalizeCutoff,
  validLadderPercents,
  type CommerceSection,
  type CommerceSettings,
  type LocalizedText,
  type PopupRule,
} from "./settings";
import { thousands } from "@/lib/config/commerce";

/*
  The /admin/commerce forms → one validated section. Pure, so the rules are
  tested without a request; the server action only adds the session and the
  write. Unlike `coerceCommerceSettings` (which quietly falls back on a bad
  stored value), a bad form answer is an error the admin sees.
*/

export type SectionResult<K extends CommerceSection> = { ok: true; value: CommerceSettings[K] } | { ok: false; error: string };

type Form = Record<string, string | undefined>;

class FormError extends Error {}

function whole(form: Form, name: string, label: string, { min, max }: { min: number; max: number }): number {
  const raw = (form[name] ?? "").replace(/[\s ]/g, "");
  const n = Number(raw);
  if (raw === "" || !/^\d+$/.test(raw) || !Number.isInteger(n) || n < min || n > max) {
    throw new FormError(`${label}: ${thousands(min)} dan ${thousands(max)} gacha butun son kiriting.`);
  }
  return n;
}

const checked = (form: Form, name: string) => form[name] === "on";

function text(form: Form, name: string, label: string): LocalizedText {
  const pick = (lang: "uz" | "ru") => {
    const value = (form[`${name}.${lang}`] ?? "").trim();
    if (value.length > LIMITS.text) throw new FormError(`${label} (${lang}): ${LIMITS.text} belgidan oshmasin.`);
    return value;
  };
  return { uz: pick("uz"), ru: pick("ru") };
}

function delivery(form: Form): CommerceSettings["delivery"] {
  const cutoff = normalizeCutoff(form.cutoff ?? "");
  if (cutoff === null) throw new FormError("Bugun yetkazish chegarasi SS:DD koʻrinishida boʻlsin (masalan 16:00) yoki boʻsh qoldiring.");
  return {
    freeShippingOver: whole(form, "freeShippingOver", "Bepul yetkazish chegarasi", LIMITS.freeShippingOver),
    courierFee: whole(form, "courierFee", "Kuryer narxi", LIMITS.courierFee),
    regionsNote: text(form, "regionsNote", "Viloyatlar muddati"),
    cutoff,
  };
}

function ladder(form: Form): CommerceSettings["ladder"] {
  const percents = [form.p1, form.p2, form.p3].map((v) => Number(v));
  if (!validLadderPercents(percents)) {
    throw new FormError(
      `Zinapoya foizlari ${LADDER_PERCENT_CHOICES.join(", ")} dan tanlanadi va har bir qadam oldingisidan katta boʻlsin.`,
    );
  }
  return { enabled: checked(form, "enabled"), percents, freeGift: checked(form, "freeGift") };
}

function subscription(form: Form): CommerceSettings["subscription"] {
  const firstPercent = whole(form, "firstPercent", "Birinchi yetkazish chegirmasi", LIMITS.subscriptionPercent);
  const recurringPercent = whole(form, "recurringPercent", "Keyingi yetkazishlar chegirmasi", LIMITS.subscriptionPercent);
  if (recurringPercent < firstPercent) throw new FormError("Keyingi yetkazishlar chegirmasi birinchisidan kam boʻlmasin.");
  return { firstPercent, recurringPercent };
}

function cart(form: Form): CommerceSettings["cart"] {
  return { gapWindow: whole(form, "gapWindow", "Savat takliflari chegarasi", LIMITS.gapWindow) };
}

const POPUP_LABEL: Record<(typeof POPUP_IDS)[number], string> = { welcome: "Xush kelibsiz", exit: "Chiqishda", quiz: "Test taklifi" };

function popups(form: Form): CommerceSettings["popups"] {
  const one = (id: (typeof POPUP_IDS)[number]): PopupRule => ({
    enabled: checked(form, `${id}.enabled`),
    delaySeconds: whole(form, `${id}.delaySeconds`, `${POPUP_LABEL[id]} — kechikish`, LIMITS.delaySeconds),
    cooldownDays: whole(form, `${id}.cooldownDays`, `${POPUP_LABEL[id]} — qayta koʻrsatish`, LIMITS.cooldownDays),
    title: text(form, `${id}.title`, `${POPUP_LABEL[id]} — sarlavha`),
    body: text(form, `${id}.body`, `${POPUP_LABEL[id]} — matn`),
  });
  return { welcome: one("welcome"), exit: one("exit"), quiz: one("quiz") };
}

const PARSERS: { [K in CommerceSection]: (form: Form) => CommerceSettings[K] } = { delivery, ladder, subscription, cart, popups };

export function isCommerceSection(value: unknown): value is CommerceSection {
  return typeof value === "string" && value in PARSERS;
}

export function parseCommerceSection<K extends CommerceSection>(section: K, form: Form): SectionResult<K> {
  try {
    return { ok: true, value: PARSERS[section](form) };
  } catch (err) {
    if (err instanceof FormError) return { ok: false, error: err.message };
    throw err;
  }
}
