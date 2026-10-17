import { describe, expect, it } from "vitest";
import { redactUrl } from "./redact-url";

describe("redactUrl", () => {
  it("drops token, email and phone but keeps the rest", () => {
    expect(redactUrl("/uz/email/preferences", "?status=unsubscribed&token=abc.def&email=a%40b.uz")).toBe(
      "/uz/email/preferences?status=unsubscribed",
    );
    expect(redactUrl("/uz/products", "?brand=a&phone=998901234567&page=2")).toBe("/uz/products?brand=a&page=2");
  });

  it("returns the bare path when nothing is left", () => {
    expect(redactUrl("/ru/email/preferences", "?token=x")).toBe("/ru/email/preferences");
    expect(redactUrl("/ru", "")).toBe("/ru");
  });
});
