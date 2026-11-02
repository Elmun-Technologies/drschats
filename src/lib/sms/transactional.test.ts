import { describe, expect, it } from "vitest";
import { orderSmsTemplates, orderSmsText, parseTransactionalSms, smsHasLink, smsWanted } from "./transactional";

describe("order SMS settings", () => {
  it("is off unless switched on", () => {
    expect(parseTransactionalSms(undefined)).toEqual({ orderPlaced: false, statusChanged: false });
    expect(parseTransactionalSms("not json")).toEqual({ orderPlaced: false, statusChanged: false });
    expect(parseTransactionalSms('{"orderPlaced":true,"statusChanged":"yes"}')).toEqual({ orderPlaced: true, statusChanged: false });
  });

  it("sends the receipt and the status changes on their own switches", () => {
    const placedOnly = { orderPlaced: true, statusChanged: false };
    expect(smsWanted("new", placedOnly)).toBe(true);
    expect(smsWanted("shipped", placedOnly)).toBe(false);
    expect(smsWanted("cancelled", { orderPlaced: false, statusChanged: true })).toBe(true);
  });
});

describe("order SMS texts", () => {
  it("fills the number and the phone, leaving {havola} for the outbox", () => {
    expect(orderSmsText("new", { number: "GV-000123", phone: "+998 71 200 70 80" }, "uz")).toBe(
      "Go Vita: buyurtma GV-000123 qabul qilindi. Operator ish vaqtida qoʻngʻiroq qilib tasdiqlaydi. Holati: {havola}",
    );
    expect(orderSmsText("cancelled", { number: "GV-000123", phone: "+998 71 200 70 80" }, "ru")).toBe("Go Vita: заказ GV-000123 отменён. Вопросы: +998 71 200 70 80");
  });

  it("carries a link exactly when the template has one", () => {
    for (const tpl of orderSmsTemplates()) {
      expect(tpl.uz.includes("{havola}")).toBe(smsHasLink(tpl.status));
      expect(tpl.ru.includes("{havola}")).toBe(smsHasLink(tpl.status));
    }
  });

  it("has no marketing in it: no promo code placeholders and no STOP line", () => {
    for (const tpl of orderSmsTemplates()) {
      for (const text of [tpl.uz, tpl.ru]) {
        expect(text).not.toMatch(/\{kod\}|\{muddat\}|STOP/);
        expect(text.length).toBeLessThan(140);
      }
    }
  });
});
