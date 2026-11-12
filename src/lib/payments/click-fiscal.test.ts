import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { clickAuthHeader, clickOfdAccepted, clickOfdBody, vatOf } from "./click-fiscal";
import { fiscalDetail } from "./fiscal";

describe("Click fiscal receipt", () => {
  it("signs the Auth header as merchant_user_id:sha1(timestamp + secret):timestamp", () => {
    const header = clickAuthHeader("123", "s3cret", 1_700_000_000_999);
    const digest = createHash("sha1").update("1700000000s3cret").digest("hex");
    expect(header).toBe(`123:${digest}:1700000000`);
  });

  it("maps the Payme receipt lines to submit_items and pays the order total by card", () => {
    const detail = fiscalDetail({
      lines: [
        { name: "Calcivit", unitPrice: 276_000, quantity: 1, mxik: "02106999028000000", packageCode: "1500" },
        { name: "Visiovit", unitPrice: 276_000, quantity: 2, upsellDiscountPercent: 10, mxik: "02106999028000000", packageCode: "1500" },
      ],
      total: 30_000 + 276_000 + 496_800,
      shipping: 30_000,
      shippingMxik: "10112006002000000",
      shippingPackage: "1209",
      vatPercent: 12,
    });
    expect(detail).not.toBeNull();
    const body = clickOfdBody({ serviceId: 111, paymentId: 987654, detail: detail!, tin: "123456789" });
    expect(body).toMatchObject({ service_id: 111, payment_id: 987654, received_cash: 0, received_ecash: 0 });
    expect(body.items).toHaveLength(3);
    expect(body.items[1]).toMatchObject({ Name: "Visiovit", SPIC: "02106999028000000", PackageCode: "1500", GoodPrice: 27_600_000, Price: 55_200_000, Amount: 2, Discount: 5_520_000, VATPercent: 12, CommissionInfo: { TIN: "123456789" } });
    expect(body.items[1].VAT).toBe(vatOf(55_200_000 - 5_520_000, 12));
    expect(body.received_card).toBe((30_000 + 276_000 + 496_800) * 100);
  });

  it("keeps names within Click's 63 characters and counts no VAT at 0%", () => {
    expect(vatOf(1_000_000, 0)).toBe(0);
    const body = clickOfdBody({
      serviceId: 1,
      paymentId: 1,
      tin: "123456789",
      detail: { receipt_type: 0, items: [{ title: "x".repeat(100), price: 100, count: 1, code: "1".repeat(17), package_code: "1", vat_percent: 0 }] },
    });
    expect(body.items[0].Name).toHaveLength(63);
    expect(body.items[0].VAT).toBe(0);
    expect(body.items[0]).not.toHaveProperty("Discount");
  });

  it("accepts only a 2xx answer without an error code", () => {
    expect(clickOfdAccepted(200, { error_code: 0, error_note: "Success" })).toBe(true);
    expect(clickOfdAccepted(200, {})).toBe(true);
    expect(clickOfdAccepted(200, { error_code: -5, error_note: "Payment not found" })).toBe(false);
    expect(clickOfdAccepted(401, null)).toBe(false);
  });
});
