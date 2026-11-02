import { describe, expect, it } from "vitest";
import { buildPageMetadata, brandedTitle } from "./metadata";

describe("buildPageMetadata", () => {
  const base = { locale: "uz" as const, path: "/products", title: "Katalog", description: "D" };

  it("names the brand once, as an absolute title", () => {
    expect(buildPageMetadata(base).title).toEqual({ absolute: "Katalog — Go Vita" });
    expect(brandedTitle("Katalog | Go Vita")).toBe("Katalog | Go Vita");
  });

  it("gives an indexable page its canonical and hreflang", () => {
    expect(buildPageMetadata(base).alternates?.canonical).toMatch(/\/uz\/products$/);
  });

  it("gives a noindex variant no canonical to contradict it", () => {
    const meta = buildPageMetadata({ ...base, noindex: true });
    expect(meta.alternates).toBeUndefined();
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it("claims the 1200×630 size only for the shared card", () => {
    const own = buildPageMetadata({ ...base, image: "https://x/y.jpg" }).openGraph?.images as { width?: number }[];
    expect(own[0].width).toBeUndefined();
    const shared = buildPageMetadata(base).openGraph?.images as { width?: number }[];
    expect(shared[0].width).toBe(1200);
  });
});
