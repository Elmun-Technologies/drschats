import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { REMOTE_IMAGE_HOSTS, adminCspHeader, cspHeaders, cspMode, framingHeaders, reportingHeaders } from "./src/lib/security/csp";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

/*
  The demo switches show invented data (sample reviews and purchase toasts, a
  cabinet that signs anyone in as somebody else). They exist for preview
  deployments; a production build with either one on is refused outright, so a
  copied .env cannot put fabricated data in front of real customers.
*/
if (process.env.VERCEL_ENV === "production" || process.env.GOVITA_PRODUCTION === "1") {
  const on = ["NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF", "NEXT_PUBLIC_ACCOUNT_DEMO"].filter((k) => process.env[k] === "on");
  if (on.length > 0) {
    throw new Error(`Demo flags must be off in production: ${on.join(", ")}`);
  }
}

/*
  One host for search engines: the bare domain answers with a permanent
  redirect to the www host the canonical tags already name. Derived from
  NEXT_PUBLIC_SITE_URL, so a deploy without a www host gets no rule at all.
  *.fly.dev is not redirected — the team opens /admin/setup there — but it is
  kept out of the index by the X-Robots-Tag rule in headers() below.
*/
function apexRedirects() {
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.govita.uz");
  if (!site.hostname.startsWith("www.")) return [];
  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: site.hostname.slice(4) }],
      destination: `${site.origin}/:path*`,
      permanent: true,
    },
  ];
}

/*
  One permanent hop for the two URLs a crawler meets without a locale:
  - `/` → `/uz`: next-intl answered with a 307 picked per visitor, which search
    engines treat as temporary and keep `/` as the indexed URL;
  - `/en/...`: there is no English site, and next-intl prefixed it to
    `/uz/en/...` (a 307 into a 404). Old or mistyped links land on the same
    path in Uzbek instead.
*/
function localeRedirects() {
  return [
    { source: "/", destination: "/uz", permanent: true },
    { source: "/en", destination: "/uz", permanent: true },
    { source: "/en/:path*", destination: "/uz/:path*", permanent: true },
  ];
}

/*
  The Fly app host (govita.fly.dev) serves the whole shop and stays reachable
  for /admin/setup. Search engines get noindex there for everything but the
  admin (which is not crawlable anyway), so the shop has one indexed host.
*/
const FLY_HOST_NOINDEX = {
  source: "/((?!admin).*)",
  has: [{ type: "host" as const, value: ".*\\.fly\\.dev" }],
  headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /*
    The Docker image (Fly.io) runs the self-contained server Next traces into
    .next/standalone. Only that build asks for it, so `npm run build` in CI and
    elsewhere is unchanged.
  */
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  // Arena proxies development previews through per-session *.e2b.app origins.
  // Permit those origins so Next's dev asset requests work without warnings.
  allowedDevOrigins: ["*.e2b.app"],
  // Harmless header, free information for anyone fingerprinting the stack.
  poweredByHeader: false,
  transpilePackages: ["sanity", "next-sanity", "@sanity/ui", "@sanity/vision"],
  experimental: {
    /*
      Lets app/global-not-found.tsx own the document for locale-less 404s. The
      root layout stays a passthrough — which is what makes per-locale <html
      lang> possible — so without this flag those responses have no lang at all.
      Nested not-found boundaries are unaffected: a notFound() inside [locale]
      still renders that segment's page.
    */
    globalNotFound: true,
    // Every server action keeps Next's 1 MB body limit; product photos (5 MB) go to a route handler
    // (app/admin/(panel)/products/upload/route.ts).
    serverActions: { bodySizeLimit: "1mb" },
  },
  async redirects() {
    return [...apexRedirects(), ...localeRedirects()];
  },
  async headers() {
    const routes: { source: string; has?: typeof FLY_HOST_NOINDEX.has; headers: { key: string; value: string }[] }[] = [
      {
        source: "/((?!studio|admin/content/studio).*)",
        headers: [
          // X-Frame-Options, or frame-ancestors when the Telegram Mini App is on.
          ...framingHeaders(process.env),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          /*
            The site carries a checkout form. Vercel terminates TLS, but without
            HSTS an http:// visit is only redirected — it is not pinned, so a
            first-visit downgrade is still possible. includeSubDomains stays on;
            `preload` deliberately does not, since it is effectively permanent
            and belongs to a domain decision, not a code change.
          */
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];

    /*
      CSP is appended rather than listed above because the header *name* depends
      on the mode: report-only and enforcing are two different headers, and
      emitting the wrong one is either a silent no-op or an outage.
      src/lib/security/csp.ts builds the value from configuration. Analytics
      origins follow build-time IDs by default; ADMIN_ANALYTICS_CSP=on opts in to
      the supported vendor list for panel-managed runtime IDs. `/studio` and
      `/admin/content/studio` are excluded from this CSP rule because Sanity
      Studio needs its own policy. The admin route still receives baseline
      security headers below and is protected by `requireAdmin()`.
    */
    const csp = cspHeaders(process.env);
    if (csp) routes[0].headers.push(csp, ...reportingHeaders(process.env));

    // The admin panel's own, enforced policy (stricter than the storefront's; see csp.ts adminCspHeader).
    routes.push({ source: "/admin", headers: [adminCspHeader(process.env)] });
    routes.push({ source: "/admin/((?!content/studio).*)", headers: [adminCspHeader(process.env)] });

    // Sanity needs to own its CSP, but the admin-mounted Studio still gets the
    // non-CSP baseline headers. X-Frame-Options permits same-origin embedding
    // inside the authenticated admin shell, not a third-party site.
    routes.push({
      source: "/admin/content/studio/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      ],
    });

    // Self-hosted font files are versioned by folder (public/fonts/README.md),
    // so a file at a given URL never changes.
    routes.push({
      source: "/fonts/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    });

    routes.push(FLY_HOST_NOINDEX);

    return routes;
  },
  /*
    Stamps the mode this build's policy was made with, so the server can tell at
    boot whether the CSP_MODE it was started with is the one actually in force.

    `headers()` above is resolved at build time and baked into the routes
    manifest, so setting CSP_MODE on a running server changes nothing. Without
    this stamp that is invisible: an operator flips the variable, restarts, sees
    no difference and has no idea why. instrumentation.ts reads the stamp
    (inlined here at build) next to the runtime value and warns when they
    differ. The name is deliberately not CSP_MODE, which would override the
    runtime variable everywhere instead of recording it.
  */
  env: {
    CSP_BUILD_MODE: cspMode(process.env.CSP_MODE),
    ANALYTICS_CSP_BUILD_ENABLED: process.env.ADMIN_ANALYTICS_CSP === "on" ? "on" : "off",
  },
  images: {
    /*
      A supplement catalogue is almost entirely product photography, so the
      image bytes dwarf the JS. AVIF typically lands 20–30% under WebP at the
      same perceived quality; Next negotiates per request and falls back to
      WebP for browsers that cannot take it. The extra encode cost is paid once
      per size and then cached.
    */
    formats: ["image/avif", "image/webp"],
    // Product shots are served from the catalogue for a year — they are
    // immutable once published.
    minimumCacheTTL: 31536000,
    /*
      SVGs bypass the optimiser: next/image serves an .svg src as-is
      (unoptimized) while this stays off. Keeping it off closes the optimiser's
      SVG path entirely (GHSA-2464-fhr4-w9xw: RCE through SVG on next<=15.5.27).
      The two lines below still harden anything the optimiser does serve.
    */
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    /*
      Built from the same list the CSP's img-src uses, so the optimiser and the
      policy can never disagree about which hosts are legitimate. Adding a host
      in one place and not the other fails as a broken image, which reads as a
      content bug rather than a security rule — the kind of thing that gets
      "fixed" by widening whatever was in the way.
      Placeholder/CDN sources; the real Shopflow product image host is already
      covered by the shop-flow.uz entries.
    */
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default withNextIntl(nextConfig);
