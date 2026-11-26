import type { Locale } from "@/lib/i18n/routing";

/*
  Copy of the 18+ "for couples" page (/couples) and its age gate, uz + ru.
  The page is about a couple's peace of mind, not about sex: no explicit
  wording or imagery. Claims are only what the shop itself does (official
  distributor, the black package, what it keeps out of ads and history);
  product facts come from the pack. Checked by adult.test.ts.
*/

type L = Record<Locale, string>;

const COPY = {
  gate: {
    title: { uz: "Sizga 18 yosh toʻlganmi?", ru: "Вам уже есть 18 лет?" },
    text: {
      uz: "Bu boʻlimda faqat voyaga yetganlar uchun mahsulotlar bor. Davom etish orqali 18 yoshdan katta ekaningizni tasdiqlaysiz.",
      ru: "В этом разделе товары только для взрослых. Продолжая, вы подтверждаете, что вам больше 18 лет.",
    },
    yes: { uz: "Ha, 18 yoshdan kattaman", ru: "Да, мне есть 18" },
    no: { uz: "Yoʻq, chiqish", ru: "Нет, выйти" },
  },
  eyebrow: { uz: "18+ · Juftliklar uchun", ru: "18+ · Для пар" },
  title: { uz: "Prezervativlar va juftlik xotirjamligi", ru: "Презервативы и спокойствие пары" },
  headline: {
    uz: "Dolphi — Oʻzbekistondagi rasmiy distributordan. Ichida nima borligini hech kim bilmaydigan qora qadoqda yetkazamiz.",
    ru: "Dolphi — от официального дистрибьютора в Узбекистане. Привозим в чёрной упаковке: никто не узнает, что внутри.",
  },
  intro: {
    uz: "Ishonch, xotirjamlik va bir-biriga gʻamxoʻrlik — er-xotin munosabatlarining asosi. Toʻgʻri tanlangan himoya vositasi ham shu xotirjamlikning bir qismi.",
    ru: "Доверие, спокойствие и забота друг о друге — основа отношений пары. Правильно выбранное средство защиты — тоже часть этого спокойствия.",
  },
  ctaShop: { uz: "Assortiment", ru: "Ассортимент" },
  ctaPack: { uz: "Qanday yetkaziladi", ru: "Как доставляем" },
  tags: [
    { uz: "Yozuvsiz", ru: "Без надписей" },
    { uz: "Shaffof emas", ru: "Непрозрачно" },
    { uz: "Faqat siz ochasiz", ru: "Откроете только вы" },
  ],
  why: [
    {
      title: { uz: "Rasmiy distributor", ru: "Официальный дистрибьютор" },
      text: {
        uz: "govita — Dolphi brendining Oʻzbekistondagi rasmiy hamkori. Mahsulot ishlab chiqaruvchidan toʻgʻridan-toʻgʻri keladi.",
        ru: "govita — официальный партнёр бренда Dolphi в Узбекистане. Товар поступает напрямую от производителя.",
      },
    },
    {
      title: { uz: "Qora qadoq", ru: "Чёрная упаковка" },
      text: {
        uz: "Buyurtma qora, shaffof boʻlmagan qadoqda keladi. Ustida mahsulot nomi ham, toifasi ham yozilmaydi.",
        ru: "Заказ приходит в чёрной непрозрачной упаковке. На ней нет ни названия товара, ни категории.",
      },
    },
    {
      title: { uz: "Iz qolmaydi", ru: "Без следов" },
      text: {
        uz: "Bu boʻlimda koʻrganlaringiz «yaqinda koʻrilgan» roʻyxatiga, tavsiyalarga va reklama auditoriyalariga tushmaydi.",
        ru: "То, что вы смотрите здесь, не попадает в «недавно просмотренные», рекомендации и рекламные аудитории.",
      },
    },
  ],
  shopTitle: { uz: "Dolphi assortimenti", ru: "Ассортимент Dolphi" },
  shopEmpty: {
    uz: "Assortiment saytga qoʻshilmoqda. Hozir buyurtma berish uchun qoʻngʻiroq qiling yoki Telegramga yozing — xuddi shunday maxfiy qadoqda yetkazamiz.",
    ru: "Ассортимент добавляется на сайт. Чтобы заказать сейчас, позвоните или напишите в Telegram — доставим так же, в анонимной упаковке.",
  },
  call: { uz: "Qoʻngʻiroq qilish", ru: "Позвонить" },
  telegram: { uz: "Telegramga yozish", ru: "Написать в Telegram" },
  packTitle: { uz: "Qop-qora qadoq. Hech qanday yozuvsiz.", ru: "Чёрная упаковка. Никаких надписей." },
  packIntro: {
    uz: "Bunday mahsulotni ochiq qoʻlda yetkazib berish — noqulay. Shuning uchun biz boshqacha qilamiz.",
    ru: "Привозить такой товар в открытую — неловко. Поэтому мы делаем иначе.",
  },
  packSteps: [
    {
      title: { uz: "Buyurtma", ru: "Заказ" },
      text: {
        uz: "Savatda 18+ mahsulot boʻlsa, buyurtma oʻzi maxfiy qadoq belgisini oladi — alohida soʻrash shart emas.",
        ru: "Если в корзине товар 18+, заказ сам получает отметку об анонимной упаковке — просить отдельно не нужно.",
      },
    },
    {
      title: { uz: "Qadoqlash", ru: "Упаковка" },
      text: {
        uz: "Qora, shaffof boʻlmagan qadoq. Ustida na mahsulot nomi, na rasm, na toifa.",
        ru: "Чёрная непрозрачная упаковка. На ней ни названия, ни картинки, ни категории.",
      },
    },
    {
      title: { uz: "Yetkazish", ru: "Доставка" },
      text: {
        uz: "Buyurtma haqidagi SMS va Telegram xabarlarida mahsulot nomi yozilmaydi — faqat buyurtma raqami va holati.",
        ru: "В SMS и Telegram о заказе нет названия товара — только номер заказа и статус.",
      },
    },
  ],
  faqTitle: { uz: "Koʻp soʻraladigan savollar", ru: "Частые вопросы" },
  faq: [
    {
      q: { uz: "Qanday qadoqda yetkaziladi?", ru: "В какой упаковке привозят?" },
      a: {
        uz: "Qora, shaffof boʻlmagan qadoqda. Ustida mahsulot nomi va toifasi yozilmaydi.",
        ru: "В чёрной непрозрачной упаковке. На ней нет названия товара и категории.",
      },
    },
    {
      q: { uz: "Oʻlchamni qanday tanlash kerak?", ru: "Как выбрать размер?" },
      a: {
        uz: "Har bir qadoqda nominal kenglik (mm) yozilgan — shunga qarab tanlang. Savol boʻlsa, operatorga yozing.",
        ru: "На каждой упаковке указана номинальная ширина (мм) — ориентируйтесь на неё. Если есть вопросы, напишите оператору.",
      },
    },
    {
      q: { uz: "Lateksga allergiya boʻlsa-chi?", ru: "А если аллергия на латекс?" },
      a: {
        uz: "Tarkib qadoqda yozilgan. Allergiya boʻlsa, tanlashdan oldin shifokor bilan maslahatlashing.",
        ru: "Состав указан на упаковке. При аллергии посоветуйтесь с врачом до выбора.",
      },
    },
    {
      q: { uz: "Bu boʻlimni kim koʻradi?", ru: "Кто видит этот раздел?" },
      a: {
        uz: "Faqat 18 yoshdan kattaligini tasdiqlagan foydalanuvchi. Tasdiq brauzeringizda 30 kun saqlanadi.",
        ru: "Только тот, кто подтвердил, что ему больше 18 лет. Подтверждение хранится в вашем браузере 30 дней.",
      },
    },
  ],
  note: {
    uz: "Tibbiy buyum. Qoʻllashdan oldin qadoqdagi yoʻriqnomani oʻqing. 18 yoshgacha boʻlganlarga sotilmaydi.",
    ru: "Медицинское изделие. Перед применением прочитайте инструкцию на упаковке. Лицам до 18 лет не продаётся.",
  },
} as const;

type Deep<T> = T extends Record<Locale, string> ? string : T extends readonly (infer U)[] ? Deep<U>[] : { [K in keyof T]: Deep<T[K]> };

function pick<T>(value: T, locale: Locale): Deep<T> {
  if (Array.isArray(value)) return value.map((v) => pick(v, locale)) as Deep<T>;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if ("uz" in o && "ru" in o && typeof o.uz === "string") return o[locale] as Deep<T>;
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, pick(v, locale)])) as Deep<T>;
  }
  return value as Deep<T>;
}

export type AdultCopy = Deep<typeof COPY>;

export function adultCopy(locale: Locale): AdultCopy {
  return pick(COPY, locale);
}

/** Every string, both languages — for the claims test. */
export function allAdultStrings(): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(COPY);
  return out;
}

export type { L as AdultText };
