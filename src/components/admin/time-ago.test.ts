import { describe, expect, it } from "vitest";
import { timeAgo } from "./ui";

const NOW = Date.parse("2026-11-02T12:00:00Z");
const ago = (seconds: number) => timeAgo(new Date(NOW - seconds * 1000), NOW);

describe("timeAgo", () => {
  it("speaks Uzbek without ICU", () => {
    expect(ago(10)).toBe("hozirgina");
    expect(ago(5 * 60)).toBe("5 daqiqa oldin");
    expect(ago(3 * 3600)).toBe("3 soat oldin");
    expect(ago(86400)).toBe("kecha");
    expect(ago(4 * 86400)).toBe("4 kun oldin");
    expect(ago(90 * 86400)).toBe("3 oy oldin");
    expect(ago(800 * 86400)).toBe("2 yil oldin");
  });

  it("handles the future and no date", () => {
    expect(ago(-2 * 3600)).toBe("2 soatdan keyin");
    expect(ago(-86400)).toBe("ertaga");
    expect(timeAgo(null)).toBe("—");
  });
});
