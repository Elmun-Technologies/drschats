import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["sanity", "next-sanity", "@sanity/ui", "@sanity/vision"],
  async headers() {
    return [
      {
        source: "/((?!studio).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
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
    remotePatterns: [
      // Placeholder/CDN sources — real Shopflow product image host is added here later.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.uzum.uz" },
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "shop-flow.uz" },
      { protocol: "https", hostname: "**.shop-flow.uz" },
    ],
  },
};

export default withNextIntl(nextConfig);
