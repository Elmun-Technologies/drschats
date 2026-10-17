import { describe, expect, it } from "vitest";
import { inWindow, liveAnnouncements, parseAnnouncements, safeHref, scheduleStatus, tashkentEndOfDay } from "./model";

const now = Date.parse("2026-10-17T10:00:00Z");
const at = (h: number) => new Date(now + h * 3_600_000).toISOString();

describe("schedule windows", () => {
  it("is open between start and end, either side optional", () => {
    expect(inWindow({ startsAt: null, endsAt: null }, now)).toBe(true);
    expect(inWindow({ startsAt: at(-1), endsAt: at(1) }, now)).toBe(true);
    expect(inWindow({ startsAt: at(1), endsAt: null }, now)).toBe(false);
    expect(inWindow({ startsAt: null, endsAt: at(0) }, now)).toBe(false);
    expect(inWindow({ startsAt: new Date(now - 1), endsAt: new Date(now + 1) }, now)).toBe(true);
  });

  it("labels a banner for the panel", () => {
    expect(scheduleStatus({ active: false, startsAt: null, endsAt: null }, now)).toBe("off");
    expect(scheduleStatus({ active: true, startsAt: at(2), endsAt: null }, now)).toBe("scheduled");
    expect(scheduleStatus({ active: true, startsAt: null, endsAt: at(-2) }, now)).toBe("ended");
    expect(scheduleStatus({ active: true, startsAt: at(-2), endsAt: at(2) }, now)).toBe("live");
  });
});

describe("safeHref", () => {
  it("allows site paths and https links only", () => {
    expect(safeHref("/product/omega-3")).toBe("/product/omega-3");
    expect(safeHref(" /products?sale=1 ")).toBe("/products?sale=1");
    expect(safeHref("/")).toBe("/");
    expect(safeHref("https://t.me/govita")).toBe("https://t.me/govita");
    expect(safeHref("//evil.example")).toBeNull();
    expect(safeHref("/\\evil.example")).toBeNull();
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("http://plain.example")).toBeNull();
    expect(safeHref("data:text/html,x")).toBeNull();
    expect(safeHref("")).toBeNull();
  });
});

describe("tashkentEndOfDay", () => {
  it("is 23:59 of the Tashkent day, also just after local midnight", () => {
    expect(tashkentEndOfDay(now).toISOString()).toBe("2026-10-17T18:59:00.000Z");
    // 20:30 UTC is already 01:30 on the 18th in Tashkent.
    expect(tashkentEndOfDay(Date.parse("2026-10-17T20:30:00Z")).toISOString()).toBe("2026-10-18T18:59:00.000Z");
  });
});

describe("announcements", () => {
  const raw = JSON.stringify([
    { id: "a", text: { uz: "Bepul yetkazish", ru: "Бесплатная доставка" }, href: "/delivery", endsAt: null, showCountdown: false, active: true },
    { id: "b", text: { uz: "Aksiya", ru: "" }, href: null, endsAt: at(3), showCountdown: true, active: true },
    { id: "c", text: { uz: "Tugagan", ru: "Закончилось" }, href: null, endsAt: at(-1), showCountdown: true, active: true },
    { id: "d", text: { uz: "Oʻchiq", ru: "Выкл" }, href: null, endsAt: null, showCountdown: false, active: false },
    { id: "e", text: { uz: "Xavfli", ru: "Опасно" }, href: "javascript:alert(1)", endsAt: null, showCountdown: false, active: true },
  ]);

  it("reads garbage as none", () => {
    expect(parseAnnouncements(null)).toEqual([]);
    expect(parseAnnouncements("{not json")).toEqual([]);
    expect(parseAnnouncements('{"a":1}')).toEqual([]);
  });

  it("shows lines that are on, written in this language and not past their end", () => {
    const items = parseAnnouncements(raw);
    expect(liveAnnouncements(items, "uz", now).map((a) => a.id)).toEqual(["a", "b", "e"]);
    expect(liveAnnouncements(items, "ru", now).map((a) => a.id)).toEqual(["a", "e"]);
  });

  it("counts down only to a real end and drops unsafe links", () => {
    const [a, b, e] = liveAnnouncements(parseAnnouncements(raw), "uz", now);
    expect(a.countdownTo).toBeNull();
    expect(b.countdownTo).toBe(at(3));
    expect(e.href).toBeNull();
  });
});
