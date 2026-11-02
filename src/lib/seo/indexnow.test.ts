import { afterEach, describe, expect, it, vi } from "vitest";
import { indexNowBody, indexNowKey, localizedUrls, pingIndexNow } from "./indexnow";

describe("indexNowKey", () => {
  it("accepts only a key the protocol allows", () => {
    expect(indexNowKey({ INDEXNOW_KEY: "abcd-1234-EFGH" })).toBe("abcd-1234-EFGH");
    expect(indexNowKey({ INDEXNOW_KEY: "short" })).toBeNull();
    expect(indexNowKey({ INDEXNOW_KEY: "has space in it" })).toBeNull();
    expect(indexNowKey({})).toBeNull();
  });
});

describe("indexNowBody", () => {
  it("names the host, the key file and every language version once", () => {
    const urls = localizedUrls("/product/x", "https://www.govita.uz");
    expect(urls).toEqual(["https://www.govita.uz/ru/product/x", "https://www.govita.uz/uz/product/x"]);
    expect(indexNowBody("k".repeat(16), [...urls, urls[0]], "https://www.govita.uz")).toEqual({
      host: "www.govita.uz",
      key: "k".repeat(16),
      keyLocation: "https://www.govita.uz/indexnow-key.txt",
      urlList: urls,
    });
  });
});

describe("pingIndexNow", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("does nothing without a key", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    const fetchImpl = vi.fn();
    expect(await pingIndexNow(["/product/x"], fetchImpl as unknown as typeof fetch)).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts the URLs and never throws", async () => {
    vi.stubEnv("INDEXNOW_KEY", "abcdefgh12345678");
    const ok = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    expect(await pingIndexNow(["/product/x"], ok as unknown as typeof fetch)).toBe(true);
    expect(JSON.parse(ok.mock.calls[0][1].body).urlList).toHaveLength(2);
    const down = vi.fn().mockRejectedValue(new Error("offline"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await pingIndexNow(["/product/x"], down as unknown as typeof fetch)).toBe(false);
  });
});
