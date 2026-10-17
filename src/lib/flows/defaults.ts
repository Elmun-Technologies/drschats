import { COURSE_DAYS, REORDER_LEAD_DAYS } from "@/lib/profile/reminders";
import type { FlowStep, FlowTrigger } from "./types";

/*
  The five playbook flows, seeded once and **inactive**: nothing is sent until
  the team reads the texts and switches a flow on in /admin/flows. Texts carry
  no health claims (Reklama toʻgʻrisidagi qonun, 35-modda) — only the cart,
  the course, the date and the code. The opt-out line is appended by the
  sender, not written here.
*/

const H = 60;
const D = 24 * H;

export interface DefaultFlow {
  id: string;
  name: string;
  trigger: FlowTrigger;
  steps: FlowStep[];
}

export const DEFAULT_FLOWS: DefaultFlow[] = [
  {
    id: "cart-abandoned",
    name: "Tashlab ketilgan savat",
    trigger: "cart_abandoned",
    steps: [
      {
        delayMinutes: 1 * H,
        channel: "telegram_then_sms",
        link: "/cart",
        promo: null,
        text: {
          uz: "{ism}, savatingizda {savat} qoldi. Buyurtmani yakunlash: {havola}",
          ru: "{ism}, в корзине осталось: {savat}. Оформить заказ: {havola}",
        },
      },
      {
        delayMinutes: 24 * H,
        channel: "telegram_then_sms",
        link: "/cart",
        promo: null,
        text: {
          uz: "{ism}, savatingiz saqlangan ({summa}). Savol boʻlsa, javob beramiz. Davom etish: {havola}",
          ru: "{ism}, ваша корзина сохранена ({summa}). Есть вопросы — ответим. Продолжить: {havola}",
        },
      },
      {
        delayMinutes: 72 * H,
        channel: "telegram_then_sms",
        link: "/cart",
        promo: { kind: "percent", value: 7, ttlHours: 48, minSubtotal: null },
        text: {
          uz: "{ism}, savatingiz uchun shaxsiy −7% kod: {kod}. {muddat} gacha amal qiladi: {havola}",
          ru: "{ism}, персональный код −7% на вашу корзину: {kod}. Действует до {muddat}: {havola}",
        },
      },
    ],
  },
  {
    id: "first-purchase",
    name: "Birinchi xariddan keyin",
    trigger: "first_order_delivered",
    steps: [
      {
        delayMinutes: 2 * H,
        channel: "telegram_then_sms",
        link: "/blog",
        promo: null,
        text: {
          uz: "{ism}, buyurtmangiz yetib keldi — rahmat! Qabul qilish tartibi qadoqda yozilgan, savol boʻlsa yozing. Maslahatlar: {havola}",
          ru: "{ism}, заказ доставлен — спасибо! Способ приёма указан на упаковке, с вопросами пишите. Советы: {havola}",
        },
      },
      {
        delayMinutes: 7 * D,
        channel: "telegram_then_sms",
        link: "/quiz",
        promo: null,
        text: {
          uz: "{ism}, sizga mos mahsulotlarni 2 daqiqalik testda tanlab beramiz: {havola}",
          ru: "{ism}, подберём подходящие вам продукты за 2 минуты: {havola}",
        },
      },
      {
        delayMinutes: 21 * D,
        channel: "telegram_then_sms",
        link: "/products",
        promo: { kind: "percent", value: 10, ttlHours: 7 * 24, minSubtotal: null },
        text: {
          uz: "{ism}, keyingi buyurtmangiz uchun −10% shaxsiy kod: {kod}. {muddat} gacha: {havola}",
          ru: "{ism}, персональный код −10% на следующий заказ: {kod}. До {muddat}: {havola}",
        },
      },
    ],
  },
  {
    id: "course-ending",
    name: "Kurs tugayapti",
    trigger: "course_ending",
    steps: [
      {
        delayMinutes: (COURSE_DAYS - REORDER_LEAD_DAYS) * D,
        channel: "telegram_then_sms",
        link: "/products",
        promo: null,
        text: {
          uz: "{ism}, {savat} kursingiz taxminan {kun} kunda tugaydi. Uzilib qolmasligi uchun takroriy buyurtma: {havola}".replace("{kun}", String(REORDER_LEAD_DAYS)),
          ru: "{ism}, курс {savat} закончится примерно через {kun} дней. Повторить заказ: {havola}".replace("{kun}", String(REORDER_LEAD_DAYS)),
        },
      },
      {
        delayMinutes: COURSE_DAYS * D,
        channel: "telegram_then_sms",
        link: "/products",
        promo: null,
        text: {
          uz: "{ism}, {savat} kursingiz bugun tugaydi. Takroriy buyurtma: {havola}",
          ru: "{ism}, курс {savat} заканчивается сегодня. Повторить заказ: {havola}",
        },
      },
    ],
  },
  {
    id: "lapsed",
    name: "Qaytarish (60+ kun)",
    trigger: "lapsed",
    steps: [
      {
        delayMinutes: 60 * D,
        channel: "telegram_then_sms",
        link: "/sale",
        promo: null,
        text: {
          uz: "{ism}, Go Vitaʼda yangi mahsulotlar va aksiyalar bor: {havola}",
          ru: "{ism}, в Go Vita новые продукты и акции: {havola}",
        },
      },
      {
        delayMinutes: 75 * D,
        channel: "telegram_then_sms",
        link: "/products",
        promo: { kind: "percent", value: 15, ttlHours: 72, minSubtotal: null },
        text: {
          uz: "{ism}, sizni sogʻindik! Shaxsiy −15% kod: {kod}, {muddat} gacha: {havola}",
          ru: "{ism}, мы скучали! Персональный код −15%: {kod}, до {muddat}: {havola}",
        },
      },
    ],
  },
  {
    id: "restock",
    name: "Omborga keldi",
    trigger: "restock",
    steps: [
      {
        delayMinutes: 0,
        channel: "telegram_then_sms",
        link: "",
        promo: null,
        text: {
          uz: "{ism}, siz kutgan {mahsulot} yana sotuvda: {havola}",
          ru: "{ism}, {mahsulot}, который вы ждали, снова в продаже: {havola}",
        },
      },
    ],
  },
];
