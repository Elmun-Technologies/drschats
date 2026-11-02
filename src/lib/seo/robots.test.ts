import { describe, expect, it } from "vitest";
import { robotsTxt } from "./robots";

describe("robots.txt", () => {
  const txt = robotsTxt("https://www.govita.uz");

  it("keeps the rules the Next metadata route used to emit", () => {
    expect(txt).toContain(
      [
        "User-Agent: *",
        "Allow: /",
        "Disallow: /*/cart",
        "Disallow: /*/checkout",
        "Disallow: /*/stop/",
        "Disallow: /studio",
        "Disallow: /admin",
        "Disallow: /r/",
        "Disallow: /s/",
      ].join("\n"),
    );
    expect(txt).toMatch(/\n\nSitemap: https:\/\/www\.govita\.uz\/sitemap\.xml\n$/);
  });

  it("tells Yandex the ad and analytics markers do not change a page", () => {
    expect(txt).toContain(
      "Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&gclid&yclid&fbclid&ttclid\n",
    );
  });

  it("is the only robots source", async () => {
    const { existsSync } = await import("node:fs");
    // A src/app/robots.ts next to the route handler is a build-time route conflict.
    expect(existsSync("src/app/robots.ts")).toBe(false);
  });
});
