import { describe, expect, it } from "vitest";
import uz from "@/messages/uz.json";
import ru from "@/messages/ru.json";
import { REGION_KEYS, REGION_NAMES, regionName } from "./regions";
import { composeAddress, hasAddressParts } from "./address";

describe("regions", () => {
  it("names every region as the order form does, in both languages", () => {
    for (const key of REGION_KEYS) {
      expect(REGION_NAMES[key].uz).toBe((uz.checkout.regions as Record<string, string>)[key]);
      expect(REGION_NAMES[key].ru).toBe((ru.checkout.regions as Record<string, string>)[key]);
    }
  });

  it("reads a stored key, and an older order's stored name as it is", () => {
    expect(regionName("samarkand")).toBe("Samarqand viloyati");
    expect(regionName("samarkand", "ru")).toBe("Самаркандская область");
    expect(regionName("Самаркандская область")).toBe("Самаркандская область");
    expect(regionName(undefined)).toBe("");
  });
});

describe("composeAddress", () => {
  it("builds the courier line from the parts", () => {
    expect(composeAddress({ district: "chilonzor", street: " Bunyodkor  koʻchasi ", house: "12", apartment: "45", landmark: "maktab yonida" })).toBe(
      "Chilonzor, Bunyodkor koʻchasi, uy 12, xonadon 45. Moʻljal: maktab yonida",
    );
    expect(composeAddress({ district: "Samarqand shahri", street: "Registon", house: "3" })).toBe("Samarqand shahri, Registon, uy 3");
  });

  it("knows when there are no parts (older clients send one address line)", () => {
    expect(hasAddressParts({})).toBe(false);
    expect(hasAddressParts({ street: "Bobur" })).toBe(true);
  });
});
