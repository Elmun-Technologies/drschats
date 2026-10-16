import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("online payment availability", () => {
  it("does not enable checkout from merchant IDs alone", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYME_MERCHANT_ID", "payme-merchant");
    vi.stubEnv("NEXT_PUBLIC_CLICK_MERCHANT_ID", "click-merchant");
    vi.stubEnv("NEXT_PUBLIC_UZUM_MERCHANT_ID", "uzum-merchant");
    vi.resetModules();

    const payments = await import("./payments");

    expect(payments.PAYMENT_PROVIDERS.map(({ merchantIdConfigured, configured }) => ({ merchantIdConfigured, configured }))).toEqual([
      { merchantIdConfigured: true, configured: false },
      { merchantIdConfigured: true, configured: false },
      { merchantIdConfigured: true, configured: false },
    ]);
    expect(payments.ONLINE_PROVIDERS).toEqual([]);
    expect(payments.onlinePaymentAvailable()).toBe(false);
    expect(payments.isOnlineProviderAvailable("payme")).toBe(false);
    expect(payments.ONLINE_PAYMENT_MARKS).toEqual([]);
  });

  it("keeps providers unavailable when merchant IDs are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYME_MERCHANT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_CLICK_MERCHANT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_UZUM_MERCHANT_ID", "");
    vi.resetModules();

    const payments = await import("./payments");

    expect(payments.PAYMENT_PROVIDERS.every((provider) => !provider.merchantIdConfigured && !provider.configured)).toBe(true);
    expect(payments.isOnlineProviderAvailable("click")).toBe(false);
  });
});
