import { districtName } from "./regions";

/*
  The structured courier address (2026-11). The form asks the courier's
  questions one by one — district, street, house, flat, landmark — and the
  order keeps both: the parts, for whoever needs them separately, and one
  composed line in `delivery.address`, which every older reader (the
  operator's Telegram message, the admin, CSV export, the bot) already shows.
  The line is composed on the server from the parts, so it reads the same
  whichever language the order was placed in.
*/
export interface AddressParts {
  district?: string;
  street?: string;
  house?: string;
  apartment?: string;
  landmark?: string;
}

const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();

export function hasAddressParts(parts: AddressParts): boolean {
  return Boolean(clean(parts.street) || clean(parts.house) || clean(parts.district));
}

/** "Chilonzor, Bunyodkor koʻchasi, uy 12, xonadon 45. Moʻljal: …" */
export function composeAddress(parts: AddressParts): string {
  const line = [
    districtName(clean(parts.district)),
    clean(parts.street),
    clean(parts.house) && `uy ${clean(parts.house)}`,
    clean(parts.apartment) && `xonadon ${clean(parts.apartment)}`,
  ]
    .filter(Boolean)
    .join(", ");
  const landmark = clean(parts.landmark);
  return landmark ? `${line}. Moʻljal: ${landmark}` : line;
}
