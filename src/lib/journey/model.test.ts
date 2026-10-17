import { describe, expect, it } from "vitest";
import { channelOf, deviceOf, furthestStage, isBotAgent, safePath, touchOf } from "./model";

describe("journey model", () => {
  it("only moves the stage forward", () => {
    expect(furthestStage("visit", [{ type: "page_view" }, { type: "add_to_cart" }])).toBe("cart");
    expect(furthestStage("checkout", [{ type: "view_item" }])).toBe("checkout");
    expect(furthestStage("visit", [{ type: "search" }])).toBe("visit");
  });

  it("drops private query parameters from stored paths", () => {
    expect(safePath("/uz/email/preferences?token=abc&email=a@b.uz&tab=1")).toBe("/uz/email/preferences?tab=1");
    expect(safePath("https://www.govita.uz/ru/products?brand=x")).toBe("/ru/products?brand=x");
  });

  it("reads utm, click ids and outside referrers, and treats the rest as direct", () => {
    expect(touchOf("https://www.govita.uz/uz?utm_source=instagram&utm_campaign=okt", "", "www.govita.uz")).toEqual({
      source: "instagram",
      campaign: "okt",
      landing: "/uz?utm_source=instagram&utm_campaign=okt",
    });
    expect(touchOf("https://www.govita.uz/uz?gclid=123", "", "govita.uz")?.clickId).toBe("gclid:123");
    expect(touchOf("https://www.govita.uz/uz", "https://www.google.com/", "www.govita.uz")?.referrer).toBe("google.com");
    expect(touchOf("https://www.govita.uz/uz", "https://govita.uz/ru", "www.govita.uz")).toBeNull();
  });

  it("names channels", () => {
    expect(channelOf(null)).toBe("Bevosita");
    expect(channelOf({ referrer: "google.com" })).toBe("Google qidiruv");
    expect(channelOf({ clickId: "gclid:1" })).toBe("Google Ads");
    expect(channelOf({ referrer: "yandex.ru" })).toBe("Yandex qidiruv");
    expect(channelOf({ source: "instagram" })).toBe("Instagram");
    expect(channelOf({ referrer: "t.me" })).toBe("Telegram");
  });

  it("classifies devices and bots", () => {
    expect(deviceOf("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe("mobile");
    expect(deviceOf("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
    expect(deviceOf("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
    expect(isBotAgent("Googlebot/2.1")).toBe(true);
    expect(isBotAgent("")).toBe(true);
    expect(isBotAgent("Mozilla/5.0 (Windows NT 10.0)")).toBe(false);
  });
});
