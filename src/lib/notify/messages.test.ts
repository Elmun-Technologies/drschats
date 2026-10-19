import { describe, expect, it } from "vitest";
import { operatorCallList, waitlistSmsText, waitlistText, waitlistUrl } from "./messages";
import type { WaitMessage } from "./types";

const base: WaitMessage = {
  requestId: 7,
  kind: "restock",
  locale: "uz",
  phone: "998901234567",
  phone9: "901234567",
  chatId: null,
  productName: "Omega-3",
  slug: "omega-3",
  price: 129_000,
  before: null,
  url: "https://www.govita.uz/uz/product/omega-3?utm_source=telegram&utm_medium=restock&utm_campaign=restock",
};

describe("waitlist messages", () => {
  it("tags the link with the channel and the kind", () => {
    const url = waitlistUrl("https://www.govita.uz/", "ru", "omega-3", "price_drop", "telegram");
    expect(url).toBe("https://www.govita.uz/ru/product/omega-3?utm_source=telegram&utm_medium=restock&utm_campaign=price_drop");
  });

  it("restock: the product, its real price and the link — in the customer's language", () => {
    const uz = waitlistText(base);
    expect(uz).toContain("«Omega-3» yana sotuvda");
    expect(uz).toContain("129 000 soʻm");
    expect(uz).toContain(base.url);
    const ru = waitlistText({ ...base, locale: "ru" });
    expect(ru).toContain("снова в продаже");
  });

  it("price drop shows the price they saw and the new one", () => {
    const text = waitlistText({ ...base, kind: "price_drop", before: 149_000 });
    expect(text).toContain("149 000 soʻm → 129 000 soʻm");
  });

  it("makes no urgency claims", () => {
    for (const locale of ["uz", "ru"] as const) {
      for (const kind of ["restock", "price_drop"] as const) {
        expect(waitlistText({ ...base, locale, kind, before: 150_000 })).not.toMatch(/shoshiling|tez orada tugaydi|спешите|осталось/i);
      }
    }
  });

  it("the operator's list carries every number to call and an operator-tagged link", () => {
    const text = operatorCallList([base, { ...base, requestId: 8, phone: "998911112233", locale: "ru" }]);
    expect(text).toContain("+998901234567 (uz)");
    expect(text).toContain("+998911112233 (ru)");
    expect(text).toContain("utm_source=operator");
  });

  it("SMS: no emoji and no long URL — the short link placeholder the outbox fills", () => {
    for (const kind of ["restock", "price_drop"] as const) {
      for (const locale of ["uz", "ru"] as const) {
        const text = waitlistSmsText({ ...base, kind, locale, before: 149_000 });
        expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
        expect(text).not.toContain("http");
        expect(text).toContain("{havola}");
        expect(text).toContain("Omega-3");
      }
    }
    expect(waitlistSmsText({ ...base, kind: "price_drop", before: 149_000 })).toContain("endi 129 000 soʻm (avval 149 000 soʻm)");
  });
});
