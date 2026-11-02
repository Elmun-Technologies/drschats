/* Edge-safe: the middleware reads the name without pulling in node:crypto or the database. */
export const SESSION_COOKIE = "govita_admin";
/** Password checked, authenticator code still to come (5 minutes). */
export const PENDING_2FA_COOKIE = "govita_admin_2fa";
/** Set by the middleware on every /admin request; requireAdmin reads the page's permission from it. */
export const ADMIN_PATH_HEADER = "x-govita-admin-path";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

/** Pages an anonymous visitor may open; everything else under /admin needs the session cookie. */
export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
