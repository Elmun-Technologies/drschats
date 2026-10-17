import type { VisitorEventType } from "@/lib/db/schema";

export const EVENT_LABEL: Record<VisitorEventType, string> = {
  page_view: "Sahifani ochdi",
  view_item: "Mahsulotni koʻrdi",
  add_to_cart: "Savatga qoʻshdi",
  remove_from_cart: "Savatdan olib tashladi",
  view_cart: "Savatni ochdi",
  begin_checkout: "Rasmiylashtirishni boshladi",
  purchase: "Buyurtma berdi",
  search: "Qidirdi",
  add_to_wishlist: "Sevimlilarga qoʻshdi",
  quiz_complete: "Testni yakunladi",
};

/** Events that move the journey, drawn heavier in the timeline. */
export const KEY_EVENTS = new Set<VisitorEventType>(["add_to_cart", "begin_checkout", "purchase"]);

export const DEVICE_LABEL: Record<string, string> = { mobile: "Telefon", tablet: "Planshet", desktop: "Kompyuter" };
