/*
  A request id for every request (set in middleware.ts), so a log line, an
  error page's digest and a customer's complaint can be matched up. Edge-safe
  and pure; the server half that reads it from the request is
  lib/request-id-server.ts.

  An id sent by the client (or by Fly's proxy) is kept only when it looks like
  one — never a free-form string that could forge log lines.
*/
export const REQUEST_ID_HEADER = "x-request-id";

const VALID = /^[A-Za-z0-9._-]{8,64}$/;

export function requestIdFrom(given: string | null | undefined): string {
  const value = given?.trim();
  if (value && VALID.test(value)) return value;
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
