import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { REMOTE_IMAGE_HOSTS, cspHeaders, cspMode } from "./src/lib/security/csp";

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

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  },
  async headers() {
    const routes = [
      {
        source: "/((?!studio).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
      src/lib/security/csp.ts builds the value from the same configuration that
      switches each integration on, so an analytics origin appears only once its
      ID is set. `/studio` is excluded along with the other headers — Sanity
      Studio needs a policy of its own, and it is already gated off in
      production.
    */
    const csp = cspHeaders(process.env);
    if (csp) routes[0].headers.push(csp);

    // Self-hosted font files are versioned by folder (public/fonts/README.md),
    // so a file at a given URL never changes.
    routes.push({
      source: "/fonts/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    });

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
    // Allow our own on-brand gradient placeholder SVGs (same-origin, /public).
    dangerouslyAllowSVG: true,
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
