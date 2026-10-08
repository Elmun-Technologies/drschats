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
] as const;

/** Until /sale exists (stage 8) the catalogue filtered to real discounts is the sale page. */
export const SALE_HREF = "/products?sale=1&sort=deals";
