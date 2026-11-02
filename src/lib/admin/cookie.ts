/* Edge-safe: the middleware reads the name without pulling in node:crypto or the database. */
export const SESSION_COOKIE = "govita_admin";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

/** Pages an anonymous visitor may open; everything else under /admin needs the session cookie. */
export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
