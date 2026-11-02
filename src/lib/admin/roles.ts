/*
  What each admin role may open and do. One table for the menu, the pages and
  the server actions: a page checks the permission of its path, an action
  names its own (an action can be posted to any admin URL, so its permission
  must not depend on where it was posted from).

  Pure module — read by the middleware-free page guard, the menu and tests.
*/
import type { AdminRole } from "@/lib/db/schema";

export const PERMISSIONS = [
  "dashboard",
  "orders",
  "customers",
  "waitlist",
  "support",
  "analytics",
  "marketing",
  "catalog",
  "content",
  "commerce",
  "integrations",
  "users",
  "audit",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const OPERATOR: Permission[] = ["dashboard", "orders", "customers", "waitlist", "support"];
const MANAGER: Permission[] = [...OPERATOR, "analytics", "marketing", "catalog", "content", "commerce"];

export const ROLE_PERMISSIONS: Record<AdminRole, ReadonlySet<Permission>> = {
  owner: new Set(PERMISSIONS),
  manager: new Set(MANAGER),
  operator: new Set(OPERATOR),
};

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Egasi",
  manager: "Menejer",
  operator: "Operator",
};

export const ROLE_HINT: Record<AdminRole, string> = {
  owner: "Hamma narsa: administratorlar, integratsiya kalitlari, audit jurnali.",
  manager: "Doʻkon: katalog, marketing, savdo qoidalari, analitika. Administratorlar va kalitlarsiz.",
  operator: "Buyurtmalar, mijozlar, kutayotganlar va Telegram murojaatlari.",
};

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/* Longest prefix wins; anything not listed is owner-only, so a new page is closed until it is placed here. */
const PATHS: [string, Permission][] = [
  ["/admin/security", "dashboard"],
  ["/admin/print/orders", "orders"],
  ["/admin/orders", "orders"],
  ["/admin/customers", "customers"],
  ["/admin/waitlist", "waitlist"],
  ["/admin/subscriptions", "orders"],
  ["/admin/reviews", "marketing"],
  ["/admin/bot/tickets", "support"],
  ["/admin/bot", "marketing"],
  ["/admin/messages", "marketing"],
  ["/admin/analytics", "analytics"],
  ["/admin/visitors", "analytics"],
  ["/admin/funnel", "analytics"],
  ["/admin/search", "orders"],
  ["/admin/segments", "marketing"],
  ["/admin/storefront", "marketing"],
  ["/admin/promotions", "marketing"],
  ["/admin/promocodes", "marketing"],
  ["/admin/loyalty", "marketing"],
  ["/admin/campaigns", "marketing"],
  ["/admin/flows", "marketing"],
  ["/admin/marketing", "marketing"],
  ["/admin/products", "catalog"],
  ["/admin/categories", "catalog"],
  ["/admin/brands", "catalog"],
  ["/admin/content", "content"],
  ["/admin/commerce", "commerce"],
  ["/admin/integrations", "integrations"],
  ["/admin/users", "users"],
  ["/admin/audit", "audit"],
];

export function permissionForPath(pathname: string): Permission {
  const path = pathname.replace(/\/+$/, "") || "/admin";
  if (path === "/admin") return "dashboard";
  let best: [string, Permission] | null = null;
  for (const entry of PATHS) {
    const [prefix] = entry;
    if ((path === prefix || path.startsWith(`${prefix}/`)) && (!best || prefix.length > best[0].length)) best = entry;
  }
  return best ? best[1] : "users";
}

export function canOpen(role: AdminRole, pathname: string): boolean {
  return can(role, permissionForPath(pathname));
}

export function isAdminRole(value: unknown): value is AdminRole {
  return value === "owner" || value === "manager" || value === "operator";
}
