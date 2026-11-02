import { describe, expect, it } from "vitest";
import { shelfRoute } from "./shelf-rewrite";

const route = (url: string) => {
  const u = new URL(url, "https://example.test");
  return shelfRoute(u.pathname, u.searchParams);
};

describe("shelfRoute", () => {
  it("leaves clean shelves static", () => {
    expect(route("/uz/products")).toBeNull();
    expect(route("/ru/products/vitamins")).toBeNull();
    expect(route("/uz/products/vitamins/")).toBeNull();
  });

  it("keeps tracking-only and empty queries on the static page", () => {
    expect(route("/uz/products?utm_source=ig&gclid=1")).toBeNull();
    expect(route("/uz/products?sort=")).toBeNull();
    expect(route("/uz/products?foo=bar")).toBeNull();
  });

  it("rewrites sort, search, page and filters", () => {
    expect(route("/uz/products?sort=price-asc")).toEqual({ kind: "rewrite", pathname: "/uz/products-filtered" });
    expect(route("/ru/products/vitamins?page=2&utm_source=x")).toEqual({ kind: "rewrite", pathname: "/ru/products-filtered/vitamins" });
    expect(route("/uz/products?brand=a&brand=b")).toEqual({ kind: "rewrite", pathname: "/uz/products-filtered" });
  });

  it("sends a direct hit on the internal route back to the public URL", () => {
    expect(route("/uz/products-filtered/vitamins?sort=new")).toEqual({ kind: "redirect", pathname: "/uz/products/vitamins" });
    expect(route("/ru/products-filtered")).toEqual({ kind: "redirect", pathname: "/ru/products" });
  });

  it("ignores other paths and nested product routes", () => {
    expect(route("/uz/product/abc?sort=new")).toBeNull();
    expect(route("/uz/products/a/b?sort=new")).toBeNull();
    expect(route("/en/products?sort=new")).toBeNull();
  });
});
