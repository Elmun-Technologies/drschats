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
