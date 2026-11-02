import { beforeEach, describe, expect, it } from "vitest";
import { selfCancelVerdict } from "./cancel-rules";
import { forgetOrder, readOrders, rememberOrder } from "./last-order";
import { averageRating, reviewInputSchema } from "@/lib/reviews/rules";
import { factsToForm, formToFacts } from "@/lib/admin/product-form";

describe("self-cancel on the tracking page", () => {
  it("is offered while the order is being prepared and unpaid", () => {
    expect(selfCancelVerdict("new", "unpaid")).toBe("ok");
    expect(selfCancelVerdict("confirmed", "pending")).toBe("ok");
  });

  it("sends a paid order to the operator, and refuses once it has left", () => {
    expect(selfCancelVerdict("new", "paid")).toBe("paid");
    expect(selfCancelVerdict("confirmed", "refunded")).toBe("paid");
    expect(selfCancelVerdict("shipped", "unpaid")).toBe("too_late");
    expect(selfCancelVerdict("delivered", "unpaid")).toBe("too_late");
    expect(selfCancelVerdict("cancelled", "unpaid")).toBe("too_late");
  });
});

describe("«Buyurtmalarim» in the browser", () => {
  beforeEach(() => localStorage.clear());
  const entry = (order: string) => ({ order, track: `${order}.abcdefghijkl`, total: 100_000, at: "2026-11-01T10:00:00Z", items: [{ name: "Omega-3", quantity: 1 }] });

  it("keeps the newest first, once per order, and forgets on request", () => {
    rememberOrder(entry("GV-000001"));
    rememberOrder(entry("GV-000002"));
    rememberOrder(entry("GV-000001"));
    expect(readOrders().map((o) => o.order)).toEqual(["GV-000001", "GV-000002"]);
    forgetOrder("GV-000001");
    expect(readOrders().map((o) => o.order)).toEqual(["GV-000002"]);
  });

  it("ignores what is not a remembered order", () => {
    localStorage.setItem("govita-orders", JSON.stringify([{ order: 1 }, "x", entry("GV-000003")]));
    expect(readOrders().map((o) => o.order)).toEqual(["GV-000003"]);
  });
});

describe("reviews", () => {
  it("averages approved ratings to one decimal, nothing when there are none", () => {
    expect(averageRating([])).toBe(0);
    expect(averageRating([5, 4, 4])).toBe(4.3);
  });

  it("takes an Uzbek phone and a real text only", () => {
    const base = { slug: "omega-3", rating: 5, author: "Dilnoza", text: "Yaxshi mahsulot, tavsiya qilaman", phone: "90 123 45 67", locale: "uz" as const };
    expect(reviewInputSchema.parse(base).phone).toBe("+998901234567");
    expect(reviewInputSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
    expect(reviewInputSchema.safeParse({ ...base, text: "ok" }).success).toBe(false);
    expect(reviewInputSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
  });
});

describe("package facts form", () => {
  it("stores only what was filled, and round-trips", () => {
    expect(formToFacts({ "uz.storage": "  " })).toBeNull();
    const facts = formToFacts({ "uz.storage": "25 °C dan past", "ru.storage": "Ниже 25 °C", "uz.shelfLife": "24 oy" });
    expect(facts).toEqual({ storage: { uz: "25 °C dan past", ru: "Ниже 25 °C" }, shelfLife: { uz: "24 oy", ru: "" } });
    expect(formToFacts(factsToForm(facts))).toEqual(facts);
  });
});
