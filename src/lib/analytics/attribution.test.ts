import { describe, expect, it } from "vitest";
import { describeAttribution, touchFromLocation } from "./attribution";

describe("touchFromLocation", () => {
  it("reads utm parameters and ad click ids", () => {
    const t = touchFromLocation("?utm_source=instagram&utm_medium=cpc&utm_campaign=autumn&fbclid=abc", "/uz/lp/autumn", undefined, 1);
    expect(t).toMatchObject({ utmSource: "instagram", utmMedium: "cpc", utmCampaign: "autumn", clickId: "fbclid:abc", landing: "/uz/lp/autumn" });
  });

  it("counts an outside referrer as a touch", () => {
    expect(touchFromLocation("", "/ru", "google.com", 1)).toMatchObject({ referrer: "google.com" });
  });

  it("ignores internal navigation", () => {
    expect(touchFromLocation("?sort=price_asc", "/uz/products", undefined, 1)).toBeNull();
  });
});

describe("describeAttribution", () => {
  it("names the campaign and the first source", () => {
    expect(describeAttribution({ utmSource: "instagram", utmMedium: "cpc", utmCampaign: "autumn", firstSource: "google.com" })).toBe(
      "instagram / cpc / autumn · birinchi: google.com",
    );
    expect(describeAttribution({ clickId: "gclid:xyz" })).toBe("gclid");
    expect(describeAttribution(undefined)).toBe("");
  });
});
