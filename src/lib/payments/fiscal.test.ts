import { describe, expect, it } from "vitest";
import { fiscalDetail, missingFiscalCodes, type FiscalInput } from "./fiscal";

const MX = "10399001001000000";
const base: FiscalInput = {
  lines: [
    { name: "Vitamin D3", unitPrice: 79_000, quantity: 2, mxik: MX, packageCode: "1500" },
    { name: "Omega-3", unitPrice: 120_000, quantity: 1, upsellDiscountPercent: 15, mxik: MX, packageCode: "1500" },
  ],
  total: 0,
  shipping: 0,
  shippingMxik: "",
  shippingPackage: "",
  vatPercent: 12,
};
const sum = (d: NonNullable<ReturnType<typeof fiscalDetail>>) => d.items.reduce((a, i) => a + i.price * i.count - (i.discount ?? 0), 0);

describe("fiscalDetail", () => {
  it("adds up to the order total with line offers", () => {
    const total = 79_000 * 2 + 102_000;
    const d = fiscalDetail({ ...base, total })!;
    expect(sum(d)).toBe(total * 100);
    expect(d.items[1]).toMatchObject({ price: 12_000_000, count: 1, discount: 1_800_000, vat_percent: 12, code: MX });
    expect(d.items[0].discount).toBeUndefined();
  });

  it("spreads an order-level discount and adds shipping with its own code", () => {
    const total = 79_000 * 2 + 102_000 - 26_001 + 25_000;
    const d = fiscalDetail({ ...base, total, shipping: 25_000, shippingMxik: MX, shippingPackage: "1" })!;
    expect(sum(d)).toBe(total * 100);
    expect(d.items.at(-1)).toMatchObject({ title: "Yetkazib berish", price: 2_500_000, count: 1 });
  });

  it("is omitted when a code is missing, and names what is missing", () => {
    const lines = [{ ...base.lines[0], mxik: null }];
    expect(fiscalDetail({ ...base, lines, total: 158_000 })).toBeNull();
    expect(missingFiscalCodes({ lines, shipping: 25_000, shippingMxik: "", shippingPackage: "" })).toEqual(["Vitamin D3", "Yetkazib berish"]);
  });

  it("is omitted when the lines cannot make up the total", () => {
    expect(fiscalDetail({ ...base, total: 999_999 })).toBeNull();
  });
});
