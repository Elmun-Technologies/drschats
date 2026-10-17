import { afterEach, describe, expect, it, vi } from "vitest";
import { SWEEP_THRESHOLD, bucketCount, clientIp, rateLimitSpent, withinRateLimit } from "./rate-limit";

describe("clientIp", () => {
  it("prefers fly-client-ip over everything", () => {
    const h = new Headers({ "fly-client-ip": "1.1.1.1", "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" });
    expect(clientIp(h)).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" }))).toBe("2.2.2.2");
  });

  it("uses the last X-Forwarded-For entry, not the client-supplied first one", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "6.6.6.6, 10.0.0.1, 4.4.4.4" }))).toBe("4.4.4.4");
  });

  it("returns unknown without any header", () => {
    expect(clientIp(new Headers())).toBe("unknown");
    expect(clientIp(new Headers({ "x-forwarded-for": " , " }))).toBe("unknown");
  });
});

describe("withinRateLimit", () => {
  afterEach(() => vi.useRealTimers());

  it("blocks after the limit and resets after the window", () => {
    vi.useFakeTimers();
    const rule = { limit: 2, windowMs: 1000 };
    expect(withinRateLimit("t-limit", "a", rule)).toBe(true);
    expect(withinRateLimit("t-limit", "a", rule)).toBe(true);
    expect(withinRateLimit("t-limit", "a", rule)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(withinRateLimit("t-limit", "a", rule)).toBe(true);
  });

  it("drops expired buckets once the scope grows past the threshold", () => {
    vi.useFakeTimers();
    const rule = { limit: 1, windowMs: 1000 };
    for (let i = 0; i < SWEEP_THRESHOLD; i++) withinRateLimit("t-sweep", `ip-${i}`, rule);
    expect(bucketCount("t-sweep")).toBe(SWEEP_THRESHOLD);
    vi.advanceTimersByTime(1001);
    withinRateLimit("t-sweep", "fresh", rule);
    expect(bucketCount("t-sweep")).toBe(1);
  });
});

describe("rateLimitSpent", () => {
  afterEach(() => vi.useRealTimers());

  it("reports a spent budget without counting an attempt", () => {
    vi.useFakeTimers();
    const rule = { limit: 2, windowMs: 1000 };
    expect(rateLimitSpent("t-spent", "a", rule)).toBe(false);
    withinRateLimit("t-spent", "a", rule);
    expect(rateLimitSpent("t-spent", "a", rule)).toBe(false);
    expect(rateLimitSpent("t-spent", "a", rule)).toBe(false);
    withinRateLimit("t-spent", "a", rule);
    expect(rateLimitSpent("t-spent", "a", rule)).toBe(true);
    vi.advanceTimersByTime(1001);
    expect(rateLimitSpent("t-spent", "a", rule)).toBe(false);
  });
});
