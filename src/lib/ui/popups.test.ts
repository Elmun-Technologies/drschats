import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { popupAllowed, usePopups } from "./popups";

const DAY = 24 * 60 * 60 * 1000;

describe("marketing popups respect the admin's rules", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    usePopups.setState({ active: null });
    (globalThis as Record<string, unknown>).document = { querySelector: () => null };
  });

  it("never offers a popup that is switched off", () => {
    expect(popupAllowed("welcome", { enabled: true, cooldownDays: 30 })).toBe(true);
    expect(popupAllowed("welcome", { enabled: false, cooldownDays: 30 })).toBe(false);
    expect(usePopups.getState().request("exit", { enabled: false, cooldownDays: 3 })).toBe(false);
    expect(usePopups.getState().active).toBeNull();
    expect(usePopups.getState().request("exit", { enabled: true, cooldownDays: 3 })).toBe(true);
    expect(usePopups.getState().active).toBe("exit");
  });

  it("uses the configured cool-down instead of the built-in one", () => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.popups, JSON.stringify({ quiz: now - 2 * DAY }));
    // Default for the quiz card is 7 days: still cooling down.
    expect(popupAllowed("quiz", undefined, now)).toBe(false);
    expect(popupAllowed("quiz", { enabled: true, cooldownDays: 1 }, now)).toBe(true);
    expect(popupAllowed("quiz", { enabled: true, cooldownDays: 3 }, now)).toBe(false);
  });

  it("still shows at most one popup per session", () => {
    expect(usePopups.getState().request("welcome", { enabled: true, cooldownDays: 0 })).toBe(true);
    usePopups.getState().close();
    expect(usePopups.getState().request("quiz", { enabled: true, cooldownDays: 0 })).toBe(false);
  });
});
