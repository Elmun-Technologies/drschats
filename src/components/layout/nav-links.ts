/*
  Shared by the client menus and the server footer. A constant exported from
  a "use client" module reaches a server component as a client reference, not
  as the value — so these live in a plain module.
*/
export const HEALTH_LINKS = [
  { key: "quiz", href: "/quiz" },
  { key: "goals", href: "/goals" },
  { key: "symptoms", href: "/symptoms" },
  { key: "vitamins", href: "/vitamins" },
  { key: "programs", href: "/programs" },
  { key: "careMom", href: "/care/mom" },
  { key: "careBaby", href: "/care/baby" },
] as const;

/** The two care hubs, lit up in the desktop category row (docs/ONA-BOLA.md). */
export const CARE_LINKS = [
  { key: "careMom", href: "/care/mom" },
  { key: "careBaby", href: "/care/baby" },
] as const;

/** The sale page (design: SaleV3). The catalogue still filters with ?sale=1. */
export const SALE_HREF = "/sale";
