/*
  Payment brand marks shown on the site (footer, cart, product page, /payment).

  Card networks accepted at delivery (courier terminal): Uzcard, Humo, Visa,
  Mastercard — the files in public/images/payments/ are the networks' own
  marks. Payme, Click and Uzum have no official file in the repo yet, so they
  render as a plain name chip; drop the provider's brand-kit SVG into
  public/images/payments/ and set `src` here — every surface switches at once.

  `h` is the mark's display height inside a 40px chip, tuned so the four
  marks read at the same optical weight.
*/
export type PaymentBrandId = "payme" | "click" | "uzum" | "uzcard" | "humo" | "visa" | "mastercard";

export interface PaymentBrand {
  label: string;
  src: string | null;
  /** Intrinsic aspect ratio (width / height) of the file. */
  ratio: number;
  /** Display height in px inside a 40px chip. */
  h: number;
}

export const PAYMENT_BRANDS: Record<PaymentBrandId, PaymentBrand> = {
  payme: { label: "Payme", src: null, ratio: 0, h: 0 },
  click: { label: "Click", src: null, ratio: 0, h: 0 },
  uzum: { label: "Uzum", src: null, ratio: 0, h: 0 },
  uzcard: { label: "Uzcard", src: "/images/payments/uzcard.png", ratio: 529 / 96, h: 12 },
  humo: { label: "Humo", src: "/images/payments/humo.png", ratio: 214 / 72, h: 22 },
  visa: { label: "Visa", src: "/images/payments/visa.svg", ratio: 24 / 7.8, h: 14 },
  mastercard: { label: "Mastercard", src: "/images/payments/mastercard.svg", ratio: 152.4 / 108, h: 22 },
};

/** Cards the courier terminal takes on delivery. */
export const CARD_BRANDS: PaymentBrandId[] = ["uzcard", "humo", "visa", "mastercard"];
