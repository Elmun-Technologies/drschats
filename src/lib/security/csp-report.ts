/*
  Reading a CSP violation report — pure, for /api/csp-report and its tests.

  Two formats arrive: the legacy `report-uri` body
  ({"csp-report": {"violated-directive", "blocked-uri", …}}) and the
  Reporting API's `report-to` batch ([{type: "csp-violation", body: {
  effectiveDirective, blockedURL, …}}]). Only the directive and the blocked
  origin are kept — never the page URL (it can carry a query, a token, an
  order number), a script sample or the visitor's address.
*/

export interface CspViolation {
  directive: string;
  blocked: string;
}

const KEYWORDS = new Set(["inline", "eval", "data", "blob", "self", "wasm-eval", "trusted-types-policy", "trusted-types-sink"]);

/** "https://evil.example/x.js?y" → "https://evil.example"; keywords kept as they are. */
export function blockedOrigin(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "unknown";
  const value = raw.trim().slice(0, 300);
  if (KEYWORDS.has(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "data:" || url.protocol === "blob:") return url.protocol.slice(0, -1);
    return url.origin === "null" ? url.protocol : url.origin;
  } catch {
    return /^[a-z-]{1,30}$/.test(value) ? value : "other";
  }
}

function directiveOf(raw: unknown): string {
  if (typeof raw !== "string") return "unknown";
  const name = raw.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return /^[a-z-]{2,40}$/.test(name) ? name : "unknown";
}

/** The violations in a report body (either format); at most 20. */
export function parseCspReport(body: unknown): CspViolation[] {
  const out: CspViolation[] = [];
  const push = (directive: unknown, blocked: unknown) => {
    if (out.length < 20) out.push({ directive: directiveOf(directive), blocked: blockedOrigin(blocked) });
  };
  if (Array.isArray(body)) {
    for (const item of body) {
      const r = item as { type?: unknown; body?: Record<string, unknown> };
      if (r?.type !== "csp-violation" || !r.body) continue;
      push(r.body.effectiveDirective ?? r.body.violatedDirective, r.body.blockedURL ?? r.body.blockedURI);
    }
    return out;
  }
  const legacy = (body as { "csp-report"?: Record<string, unknown> } | null)?.["csp-report"];
  if (legacy) push(legacy["effective-directive"] ?? legacy["violated-directive"], legacy["blocked-uri"]);
  return out;
}
