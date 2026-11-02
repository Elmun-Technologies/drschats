import { describe, expect, it } from "vitest";
import { paymentMarks } from "./payments";
import { readyProviders, type ProviderSettings } from "@/lib/payments/ready";

const off: ProviderSettings = {
  payme: { enabled: false, testMode: false, merchantId: "", key: "", testKey: "" },
  click: { enabled: false, serviceId: "", merchantId: "", secretKey: "" },
};

describe("online payment availability", () => {
  it("offers nothing until a provider is switched on with its keys", () => {
    expect(readyProviders(off, true)).toEqual([]);
    expect(readyProviders({ ...off, payme: { ...off.payme, enabled: true, merchantId: "m" } }, true)).toEqual([]);
    expect(readyProviders({ ...off, click: { enabled: true, serviceId: "1", merchantId: "2", secretKey: "" } }, true)).toEqual([]);
  });

  it("offers Payme with the live key, or the sandbox key in test mode", () => {
    const payme = { enabled: true, testMode: false, merchantId: "m", key: "live", testKey: "" };
    expect(readyProviders({ ...off, payme }, true)).toEqual(["payme"]);
    expect(readyProviders({ ...off, payme: { ...payme, testMode: true } }, true)).toEqual([]);
    expect(readyProviders({ ...off, payme: { ...payme, testMode: true, testKey: "test" } }, true)).toEqual(["payme"]);
  });

  it("needs orders in our database: a payment has to find its order", () => {
    const both: ProviderSettings = {
      payme: { enabled: true, testMode: false, merchantId: "m", key: "k", testKey: "" },
      click: { enabled: true, serviceId: "1", merchantId: "2", secretKey: "s" },
    };
    expect(readyProviders(both, true)).toEqual(["payme", "click"]);
    expect(readyProviders(both, false)).toEqual([]);
  });

  it("shows card marks only next to a working provider", () => {
    expect(paymentMarks([])).toEqual([]);
    expect(paymentMarks(["click"])[0]).toBe("click");
    expect(paymentMarks(["click"]).length).toBeGreaterThan(1);
  });
});
