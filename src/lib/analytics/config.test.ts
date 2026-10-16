import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsIds } from "./config";

describe("sanitizeAnalyticsIds", () => {
  it("accepts only provider-shaped identifiers", () => {
    expect(sanitizeAnalyticsIds({
      gtm: "GTM-ABC123",
      ga4: "G-1AB2C3",
      metaPixel: "1234567890",
      yandexMetrika: "987654321",
    })).toEqual({ gtm: "GTM-ABC123", ga4: "G-1AB2C3", metaPixel: "1234567890", yandexMetrika: "987654321" });
  });

  it("drops invalid values rather than embedding them into scripts", () => {
    expect(sanitizeAnalyticsIds({
      gtm: "');alert(1);//",
      ga4: "https://evil.example/script.js",
      metaPixel: "12<script>",
      yandexMetrika: "-1",
    })).toEqual({ gtm: "", ga4: "", metaPixel: "", yandexMetrika: "" });
  });

  it("trims valid IDs and treats non-string input as unset", () => {
    expect(sanitizeAnalyticsIds({ gtm: " GTM-ab12 ", ga4: 42 })).toEqual({ gtm: "GTM-ab12", ga4: "", metaPixel: "", yandexMetrika: "" });
  });
});
