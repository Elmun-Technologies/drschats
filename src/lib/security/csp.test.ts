import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  REMOTE_IMAGE_HOSTS,
  buildContentSecurityPolicy,
  cspHeaderName,
  cspHeaders,
  cspMode,
} from "./csp";

/** Parses a policy into directive → sources, the way a browser would. */
function parse(policy: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const part of policy.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [name, ...values] = trimmed.split(/\s+/);
    out[name] = values;
  }
  return out;
}

const EMPTY: Record<string, string | undefined> = {};

describe("cspMode", () => {
  it("defaults to report-only", () => {
    // The default matters more than any other value here: an unset variable
    // must not silently produce an enforcing policy that breaks the storefront.
    expect(cspMode(undefined)).toBe("report-only");
    expect(cspMode("")).toBe("report-only");
  });

  it("accepts the three documented values, ignoring case and padding", () => {
    expect(cspMode("off")).toBe("off");
    expect(cspMode("ENFORCE")).toBe("enforce");
    expect(cspMode("  Report-Only  ")).toBe("report-only");
  });

  it("falls back rather than throwing on a typo", () => {
    // A deploy variable with a typo should not take the site down, and the safe
    // reading of "I meant to turn this on" is the mode that cannot break it.
    expect(cspMode("enforcing")).toBe("report-only");
    expect(cspMode("block")).toBe("report-only");
  });
});

describe("cspHeaderName", () => {
  it("uses a different header per mode", () => {
    expect(cspHeaderName("report-only")).toBe("Content-Security-Policy-Report-Only");
    expect(cspHeaderName("enforce")).toBe("Content-Security-Policy");
  });
});

describe("cspHeaders", () => {
  it("emits nothing when switched off", () => {
    expect(cspHeaders({ CSP_MODE: "off" })).toBeNull();
  });

  it("pairs the right name with the right mode", () => {
    // Getting this pairing wrong is either a silent no-op (enforcing policy
    // under the report-only header) or an outage (the reverse).
    expect(cspHeaders(EMPTY)?.key).toBe("Content-Security-Policy-Report-Only");
    expect(cspHeaders({ CSP_MODE: "enforce" })?.key).toBe("Content-Security-Policy");
  });

  it("adds report-uri only when one is configured", () => {
    expect(cspHeaders(EMPTY)?.value).not.toContain("report-uri");

    const withUri = cspHeaders({ CSP_REPORT_URI: "https://o1.ingest.example/csp" })?.value;
    expect(withUri).toMatch(/; report-uri https:\/\/o1\.ingest\.example\/csp$/);
  });

  it("ignores a blank report-uri", () => {
    expect(cspHeaders({ CSP_REPORT_URI: "   " })?.value).not.toContain("report-uri");
  });
});

describe("buildContentSecurityPolicy", () => {
  it("produces a policy a browser can parse", () => {
    const directives = parse(buildContentSecurityPolicy(EMPTY));

    // No empty directive and no stray separators: either would be a syntax
    // error, and browsers respond to a malformed policy by ignoring the part
    // they could not read.
    for (const [name, values] of Object.entries(directives)) {
      expect(name, `directive ${name} has no value`).toBeTruthy();
      if (name !== "upgrade-insecure-requests") {
        expect(values.length, `${name} is empty`).toBeGreaterThan(0);
      }
    }
    expect(buildContentSecurityPolicy(EMPTY)).not.toMatch(/;;/);
    expect(buildContentSecurityPolicy(EMPTY)).not.toMatch(/^;|;$/);
  });

  it("locks down the directives that have no reason to be open", () => {
    const d = parse(buildContentSecurityPolicy(EMPTY));

    expect(d["default-src"]).toEqual(["'self'"]);
    expect(d["object-src"]).toEqual(["'none'"]);
    expect(d["base-uri"]).toEqual(["'self'"]);
    expect(d["frame-ancestors"]).toEqual(["'self'"]);
    expect(d["form-action"]).toEqual(["'self'"]);
    expect(d["manifest-src"]).toEqual(["'self'"]);
  });

  it("allows no wildcard origin anywhere", () => {
    /*
      `*`, or a bare `https:`, as a source would hand the policy back to
      whoever is injecting content — the one thing it exists to restrict.
      Wildcards are acceptable only as a subdomain of a named host.
    */
    const policy = buildContentSecurityPolicy({
      NEXT_PUBLIC_GTM_ID: "GTM-XXXX",
      NEXT_PUBLIC_API_URL: "https://api.govita.uz",
    });

    for (const [name, values] of Object.entries(parse(policy))) {
      for (const value of values) {
        expect(value, `${name} allows everything`).not.toBe("*");
        expect(value, `${name} allows every https origin`).not.toBe("https:");
        expect(value, `${name} allows every http origin`).not.toBe("http:");
        if (value.startsWith("*")) {
          throw new Error(`${name} has a leading bare wildcard: ${value}`);
        }
      }
    }
  });

  it("carries no third-party origin when nothing is configured", () => {
    // Measured state of the site today: no analytics ID is set, so no analytics
    // host belongs in the policy.
    const policy = buildContentSecurityPolicy(EMPTY);

    expect(policy).not.toContain("googletagmanager");
    expect(policy).not.toContain("facebook");
    expect(policy).not.toContain("yandex");
    expect(policy).not.toContain("google-analytics");
  });

  it("adds each analytics provider only when its own ID is set", () => {
    const gtm = parse(buildContentSecurityPolicy({ NEXT_PUBLIC_GTM_ID: "GTM-ABC" }));
    expect(gtm["script-src"]).toContain("https://www.googletagmanager.com");
    expect(gtm["connect-src"]).toContain("https://www.googletagmanager.com");
    expect(gtm["script-src"]).not.toContain("https://connect.facebook.net");

    const pixel = parse(buildContentSecurityPolicy({ NEXT_PUBLIC_META_PIXEL_ID: "123" }));
    expect(pixel["script-src"]).toContain("https://connect.facebook.net");
    // The pixel beacons and draws 1x1 images, so it needs both.
    expect(pixel["connect-src"]).toContain("https://www.facebook.com");
    expect(pixel["img-src"]).toContain("https://www.facebook.com");
    expect(pixel["script-src"]).not.toContain("https://mc.yandex.ru");

    const metrika = parse(buildContentSecurityPolicy({ NEXT_PUBLIC_YANDEX_METRIKA_ID: "9" }));
    expect(metrika["script-src"]).toContain("https://mc.yandex.ru");
    expect(metrika["script-src"]).not.toContain("https://connect.facebook.net");

    const ga4 = parse(buildContentSecurityPolicy({ NEXT_PUBLIC_GA4_ID: "G-1" }));
    expect(ga4["connect-src"]).toContain("https://www.google-analytics.com");
  });

  it("treats a blank ID as unset", () => {
    // `.env.example` ships these as empty strings, which is the same trap the
    // Sanity client had: `?? ` does not guard against "".
    const d = parse(
      buildContentSecurityPolicy({
        NEXT_PUBLIC_GTM_ID: "",
        NEXT_PUBLIC_META_PIXEL_ID: "   ",
      }),
    );
    expect(d["script-src"]).not.toContain("https://www.googletagmanager.com");
    expect(d["script-src"]).not.toContain("https://connect.facebook.net");
  });

  it("puts the account API in connect-src as an origin only", () => {
    const d = parse(buildContentSecurityPolicy({ NEXT_PUBLIC_API_URL: "https://api.govita.uz/v1" }));

    expect(d["connect-src"]).toContain("https://api.govita.uz");
    // A path in a CSP source is ignored by browsers, so including one would
    // read as a restriction that does not exist.
    expect(d["connect-src"].some((v) => v.includes("/v1"))).toBe(false);
    // The API is fetched, not scripted or framed.
    expect(d["script-src"]).not.toContain("https://api.govita.uz");
    expect(d["frame-src"]).not.toContain("https://api.govita.uz");
  });

  it("does not list origins that only appear in links and metadata", () => {
    /*
      A crawl of the rendered HTML turns up instagram.com, t.me, schema.org and
      www.govita.uz. Measured on /uz/products, each of them sits in an
      `<a href>`, a `<link href>` (canonical/hreflang), a `<meta content>`
      (og:url) or JSON-LD text — none is a resource the browser fetches, and CSP
      governs neither navigation nor metadata.

      Worth pinning because the mistake is easy to make in the other direction:
      someone greps the HTML, sees a third-party domain, and widens the policy
      "to be safe". Every origin added that way is attack surface bought for
      nothing. facebook.com is deliberately absent here — it is covered above
      under the Pixel case, which is a different reason for the same answer.
    */
    const policy = buildContentSecurityPolicy(EMPTY);

    for (const host of [
      "instagram.com",
      "t.me",
      "schema.org",
      "www.govita.uz",
      "govita.uz",
    ]) {
      expect(policy).not.toContain(host);
    }
  });

  it("ignores an unusable API URL rather than emitting garbage", () => {
    for (const bad of ["not a url", "ftp://example.com", "//api.govita.uz"]) {
      const d = parse(buildContentSecurityPolicy({ NEXT_PUBLIC_API_URL: bad }));
      expect(d["connect-src"]).toEqual(["'self'"]);
    }
  });

  it("keeps server-side hosts out of connect-src", () => {
    /*
      Resend, Telegram and the Shopflow catalogue are called from the server.
      CSP governs the browser, so listing them would widen the policy for a
      request no browser ever makes.

      Checked through connect-src specifically rather than the whole header:
      shop-flow.uz and cdn.sanity.io legitimately appear in img-src, so a
      `not.toContain` against the policy string would either fail or be so
      narrow as to assert nothing.
    */
    const d = parse(
      buildContentSecurityPolicy({
        RESEND_API_KEY: "re_1",
        TELEGRAM_BOT_TOKEN: "1:AA",
        SHOPFLOW_API_URL: "https://api.shop-flow.uz",
        NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123",
        NEXT_PUBLIC_API_URL: "https://api.govita.uz",
      }),
    );

    const connect = d["connect-src"].join(" ");
    expect(connect).not.toContain("resend.com");
    expect(connect).not.toContain("api.telegram.org");
    expect(connect).not.toContain("shop-flow.uz");
    expect(connect).not.toContain("api.sanity.io");
    // The one browser-facing API is still allowed.
    expect(d["connect-src"]).toContain("https://api.govita.uz");
  });

  it("allows video embeds in frame-src only", () => {
    const d = parse(buildContentSecurityPolicy(EMPTY));

    expect(d["frame-src"]).toContain("https://www.youtube-nocookie.com");
    expect(d["script-src"]).not.toContain("https://www.youtube-nocookie.com");
  });

  it("requires inline script and style, and says so", () => {
    /*
      Pinned because it is the weakest part of the policy and the part most
      likely to be "improved" by someone deleting it — which would break every
      page, since Next.js streams the RSC payload as inline <script>.
    */
    const d = parse(buildContentSecurityPolicy(EMPTY));

    expect(d["script-src"]).toContain("'unsafe-inline'");
    expect(d["style-src"]).toContain("'unsafe-inline'");
    expect(d["script-src"]).toContain("'self'");
  });

  it("never repeats a source within a directive", () => {
    // GTM and GA4 share an origin; a duplicate is harmless but makes the header
    // harder to read in DevTools, which is where it gets debugged.
    const d = parse(
      buildContentSecurityPolicy({ NEXT_PUBLIC_GTM_ID: "GTM-1", NEXT_PUBLIC_GA4_ID: "G-1" }),
    );

    for (const [name, values] of Object.entries(d)) {
      expect(new Set(values).size, `${name} has duplicates`).toBe(values.length);
    }
  });

  it("translates the image hosts into CSP form", () => {
    const d = parse(buildContentSecurityPolicy(EMPTY));
    const img = d["img-src"];

    expect(img).toContain("'self'");
    expect(img).toContain("data:");
    expect(img).toContain("https://cdn.sanity.io");
    // next/image's `**.` convention becomes CSP's `*.`
    expect(img).toContain("https://*.uzum.uz");
    expect(img).toContain("https://*.shop-flow.uz");
    expect(img.some((v) => v.includes("**"))).toBe(false);

    for (const host of REMOTE_IMAGE_HOSTS) {
      const expected = `https://${host.replace(/^\*\*\./, "*.")}`;
      expect(img, `${host} missing from img-src`).toContain(expected);
    }
  });

  it("applies upgrade-insecure-requests", () => {
    const policy = buildContentSecurityPolicy(EMPTY);
    expect(policy).toContain("upgrade-insecure-requests");
    // It takes no value, so it must come last and carry none.
    expect(policy.trim().endsWith("upgrade-insecure-requests")).toBe(true);
  });
});

describe("next.config.ts shares the image host list", () => {
  const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

  it("builds remotePatterns from REMOTE_IMAGE_HOSTS", () => {
    expect(config).toContain("REMOTE_IMAGE_HOSTS.map");
  });

  it("does not hardcode a second copy of the hostnames", () => {
    /*
      The point of the shared constant is that the optimiser and the policy
      cannot disagree. A literal `hostname: "cdn.sanity.io"` back in the config
      would reintroduce exactly the drift it exists to prevent.
    */
    expect(config).not.toMatch(/hostname:\s*"/);
  });

  it("wires the CSP header in", () => {
    expect(config).toContain("cspHeaders(");
  });
});
