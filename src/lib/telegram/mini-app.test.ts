import { afterEach, describe, expect, it, vi } from "vitest";
import { captureInitData, isMiniApp, telegramInitData } from "./mini-app";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/*
  The launch hash is the only trustworthy source: the shell stores it, the
  checkout reads it, and neither may depend on the other having run first.
*/
function launch(hash: string, stored: string | null = null) {
  sessionStorage.clear();
  if (stored) sessionStorage.setItem(STORAGE_KEYS.telegram, stored);
  vi.stubGlobal("window", { location: { hash }, parent: {}, setTimeout: () => 0, clearTimeout: () => {} });
}

describe("Mini App initData", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("takes initData from the launch hash and keeps it for the tab", () => {
    launch("#tgWebAppData=user%3D1%26hash%3Dabc");
    expect(captureInitData()).toBe("user=1&hash=abc");
    expect(sessionStorage.getItem(STORAGE_KEYS.telegram)).toBe("user=1&hash=abc");
  });

  it("falls back to what an earlier page in the tab stored", () => {
    launch("", "user=2&hash=def");
    expect(captureInitData()).toBe("user=2&hash=def");
    expect(telegramInitData()).toBe("user=2&hash=def");
    expect(isMiniApp()).toBe(true);
  });

  it("is empty and harmless in a plain browser", () => {
    launch("#something=else");
    expect(telegramInitData()).toBeUndefined();
    expect(isMiniApp()).toBe(false);
  });

  it("ignores a hash that is not Telegram's", () => {
    launch("#utm_source=tg");
    expect(captureInitData()).toBeNull();
  });
});
