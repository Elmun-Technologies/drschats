/**
 * The Content-Security-Policy, derived from what the site is actually
 * configured to load rather than from a list someone once wrote down.
 *
 * Two decisions drive the shape of this file.
 *
 * **Why the policy is computed, not constant.** Every third-party origin in it
 * is conditional on the integration that needs it: an analytics host appears
 * only when its ID is set, the API origin only when `NEXT_PUBLIC_API_URL` is.
 * A hardcoded policy either allows origins nothing uses (a wider attack surface
 * for no benefit) or breaks the day someone pastes in a GTM ID. Deriving it
 * means the policy is exactly as tight as the current configuration and widens
 * by itself, correctly, when the configuration does.
 *
 * **Why it ships report-only.** The storefront renders 1000+ inline `<script>`
 * tags per page (Next.js streams the RSC payload inline) and hundreds of inline
 * `style=` attributes, so `script-src` and `style-src` both need
 * `'unsafe-inline'` and a nonce-based policy is not available without moving
 * the whole document into middleware. That is worth saying plainly: this CSP
 * does not stop an injected inline script. What it does stop is an injected
 * script *from somewhere else*, plus clickjacking, `<base>` hijacking, plugins
 * and form exfiltration — which is most of the practical value, and it is real.
 *
 * The reason it starts report-only anyway is the part that cannot be measured
 * from here: GTM, Meta Pixel and Yandex Metrika each inject further resources
 * of their own at runtime, and none of those IDs are configured yet. Turning
 * enforcement on before anyone has watched a report with real tags loaded would
 * be guessing. Flip `CSP_MODE=enforce` once the console has been quiet for a
 * few days with analytics enabled.
 *
 * **This is evaluated at build time, and for the analytics part that is not a
 * compromise.** `headers()` in next.config.ts is resolved when the build runs
 * and baked into the routes manifest, so changing `CSP_MODE` on a running
 * server does nothing until the next build. Measured rather than assumed:
 * building with `CSP_MODE=enforce NEXT_PUBLIC_GTM_ID=…` and then starting the
 * server with no environment at all still served the enforcing header and the
 * GTM origin.
 *
 * That coupling is right for the analytics origins, because `NEXT_PUBLIC_*`
 * values are inlined into the client bundle at build time too — the tag itself
 * only renders if its ID was present during the build. Policy and rendered tags
 * come from one snapshot and so cannot disagree. It is a trap only for
 * `CSP_MODE`, which looks like a runtime switch and is not one:
 * src/instrumentation.ts compares the two at boot and says so out loud.
 *
 * In this repository's actual deployment that trap is closed: the storefront
 * runs on Vercel, which rebuilds on every deploy, and docker-compose.yml
 * contains only postgres, redis, meilisearch and the FastAPI backend — there is
 * no storefront image and no root Dockerfile. The warning earns its place
 * anyway, because "restart with a different CSP_MODE" is exactly what someone
 * self-hosting `next start` would try, and a variable that appears to work and
 * does not is the one failure mode this codebase refuses to leave silent.
 */

/** What the policy is allowed to do. `off` emits no header at all. */
export type CspMode = "off" | "report-only" | "enforce";

/**
 * Hosts product imagery may come from.
 *
 * This is the single source for both `images.remotePatterns` in next.config.ts
 * and `img-src` below, so the two cannot drift — a host the optimiser is
 * allowed to fetch but the policy forbids would fail in a way that looks like a
 * broken image rather than a security rule.
 *
 * A `**.` prefix means "this host and any subdomain", matching the convention
 * next/image already uses; `toCspSource()` translates it to CSP's `*.` form.
 */
function storageCdnHost(): string[] {
  const raw = process.env.STORAGE_PUBLIC_URL?.trim();
  if (!raw) return [];
  try {
    return [new URL(raw).hostname];
  } catch {
    return [];
  }
}

export const REMOTE_IMAGE_HOSTS: readonly string[] = [
  "**.uzum.uz",
  "cdn.sanity.io",
  "shop-flow.uz",
  "**.shop-flow.uz",
  // Admin-uploaded product photos (Tigris object storage on Fly.io).
  "**.fly.storage.tigris.dev",
  // …or the CDN in front of it, when one is configured.
  ...storageCdnHost(),
];

/**
 * Whether an image URL can be rendered: a file the site serves itself, or an
 * https URL on a host above. The admin panel stores only URLs that pass — an
 * unlisted host would make next/image reject the page at render time.
 */
export function isAllowedImageUrl(url: string): boolean {
  if (/^\/(?!\/)\S+$/.test(url)) return true;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return REMOTE_IMAGE_HOSTS.some((h) =>
    h.startsWith("**.") ? parsed.hostname === h.slice(3) || parsed.hostname.endsWith(h.slice(2)) : parsed.hostname === h,
  );
}

/**
 * Analytics providers, keyed by the env var that switches each one on.
 *
 * Mirrors `src/components/analytics/Analytics.tsx`: a tag is rendered only when
 * its ID is set, so its origins belong in the policy only then too. The origins
 * per provider are the ones that tag is known to touch — the loader script, the
 * hosts it beacons to, and the hosts it draws pixels from.
 */
const ANALYTICS_PROVIDERS = {
  NEXT_PUBLIC_GTM_ID: ["https://www.googletagmanager.com"],
  NEXT_PUBLIC_GA4_ID: [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
  ],
  NEXT_PUBLIC_META_PIXEL_ID: [
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "https://facebook.com",
  ],
  NEXT_PUBLIC_YANDEX_METRIKA_ID: [
    "https://mc.yandex.ru",
    "https://mc.yandex.com",
    "https://mc.yandex.uz",
  ],
} as const;

/** Video embeds. See `src/lib/content/stories.sanity.ts`. */
const FRAME_HOSTS = ["https://www.youtube-nocookie.com"];

const MODES: readonly CspMode[] = ["off", "report-only", "enforce"];

/**
 * Reads `CSP_MODE`, defaulting to report-only.
 *
 * An unrecognised value falls back rather than throwing: a typo in a deploy
 * variable should not take the storefront down, and report-only is the safe
 * reading of "I meant to turn this on".
 */
export function cspMode(raw: string | undefined): CspMode {
  const value = (raw ?? "").trim().toLowerCase();
  return (MODES as readonly string[]).includes(value) ? (value as CspMode) : "report-only";
}

/** The header name for a mode. Report-Only and enforcing are different headers. */
export function cspHeaderName(mode: CspMode): string {
  return mode === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
}

/** `**.uzum.uz` → `https://*.uzum.uz`; `cdn.sanity.io` → `https://cdn.sanity.io`. */
function toCspSource(host: string): string {
  return `https://${host.replace(/^\*\*\./, "*.")}`;
}

/** The origin part of a URL, as a CSP source. Returns null for anything unusable. */
function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

/** Deduplicate while keeping order, so the header stays readable in DevTools. */
function unique(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * Builds the policy for a given configuration.
 *
 * `env` is passed in rather than read from `process.env` so a test can ask what
 * the policy would be for any configuration without mutating global state — and
 * so next.config.ts can call it with whatever it has at build time.
 */
export function buildContentSecurityPolicy(
  env: Record<string, string | undefined> = process.env,
): string {
  // Every analytics origin this deployment actually needs, and only those.
  const analytics: string[] = [];
  for (const [variable, origins] of Object.entries(ANALYTICS_PROVIDERS)) {
    if (env[variable]?.trim()) analytics.push(...origins);
  }

  // The account API is called straight from the browser, so it needs
  // connect-src. Server-side calls (Resend, Telegram, Shopflow, Sanity queries)
  // are not governed by CSP at all and deliberately do not appear here.
  const apiOrigin = originOf(env.NEXT_PUBLIC_API_URL);

  const directives: Record<string, string[]> = {
    // Anything not named below must come from us.
    "default-src": ["'self'"],

    /*
      'unsafe-inline' is required, not preferred: Next.js streams the RSC
      payload as inline <script>self.__next_f.push(…)</script>, and every
      analytics tag in Analytics.tsx is an inline snippet. Removing it needs
      per-request nonces threaded through middleware, which is a larger change
      than this file. The origin allowlist is what still does work here — an
      injected <script src="https://evil.example"> is blocked even though an
      injected inline one is not.
    */
    "script-src": ["'self'", "'unsafe-inline'", ...analytics],

    // Inline style= attributes are used throughout (410 on a catalogue page).
    "style-src": ["'self'", "'unsafe-inline'"],

    /*
      Product imagery reaches the browser as /_next/image?url=… — the optimiser
      fetches the remote host server-side — so in principle 'self' alone would
      do today. The remote hosts are listed anyway because a plain <img> that
      skips the optimiser is an easy thing to write, and because this list is
      shared with remotePatterns and so cannot disagree with it.
    */
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      ...REMOTE_IMAGE_HOSTS.map(toCspSource),
      ...analytics,
    ],

    "font-src": ["'self'", "data:"],

    /*
      Fetches the browser makes: our own API routes, the account API when it is
      deployed, and analytics beacons. Nothing else — no third party gets to
      receive a request from a visitor's browser unless it is configured.
    */
    "connect-src": [
      "'self'",
      ...(apiOrigin ? [apiOrigin] : []),
      ...analytics,
    ],

    "frame-src": ["'self'", ...FRAME_HOSTS],
    // Supersedes X-Frame-Options, which stays for older clients.
    "frame-ancestors": ["'self'"],
    "object-src": ["'none'"],
    // A <base> tag would rewrite every relative URL on the page.
    "base-uri": ["'self'"],
    // Forms post to us only; stops a hijacked form exfiltrating to a third party.
    "form-action": ["'self'"],
    "manifest-src": ["'self'"],
    // public/sw.js is registered from /sw.js.
    "worker-src": ["'self'", "blob:"],
  };

  const parts = Object.entries(directives)
    .map(([name, values]) => `${name} ${unique(values).join(" ")}`)
    // Applied last: it only affects http: subresources and the site is https:
    // in production, so it is a backstop against mixed content rather than a
    // rule that changes anything on a correctly served page.
    .concat(["upgrade-insecure-requests"]);

  return parts.join("; ");
}

/**
 * The header pair for a configuration, or null when CSP is switched off.
 *
 * Returned as a pair because the name changes with the mode, and a caller that
 * had to remember which name goes with which value would eventually get it
 * wrong — emitting an enforcing policy under the Report-Only header is a
 * silent no-op, and the reverse is an outage.
 */
export function cspHeaders(
  env: Record<string, string | undefined> = process.env,
): { key: string; value: string } | null {
  const mode = cspMode(env.CSP_MODE);
  if (mode === "off") return null;

  const value = buildContentSecurityPolicy(env);

  /*
    A report endpoint is only wired when one is given. Browsers surface
    violations in the DevTools console regardless, which is enough to watch a
    report-only policy; CSP_REPORT_URI exists for deployments that collect them
    server-side (Sentry, a logging endpoint) and is left unset by default
    because an endpoint that receives unauthenticated POSTs from every visitor
    is not something to enable casually.
  */
  const reportUri = env.CSP_REPORT_URI?.trim();
  return {
    key: cspHeaderName(mode),
    value: reportUri ? `${value}; report-uri ${reportUri}` : value,
  };
}
