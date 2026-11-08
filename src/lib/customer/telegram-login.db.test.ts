import { beforeAll, describe, expect, it, vi } from "vitest";

/*
  The bot sign-in against a real Postgres (TEST_DATABASE_URL, migrated);
  skipped otherwise, like the other *.db.test.ts files.
*/
const url = process.env.TEST_DATABASE_URL;

vi.mock("server-only", () => ({}));

describe.skipIf(!url)("Telegram sign-in (Postgres)", () => {
  beforeAll(() => {
    process.env.DATABASE_URL = url;
  });

  it("asks for a contact, then confirms once and issues a session once", async () => {
    const login = await import("./telegram-login");
    const { readSession, sessionSecret } = await import("./session");
    const { loyaltySecret } = await import("@/lib/loyalty/otp");
    const { getDb } = await import("@/lib/db/client");
    const { telegramLinks } = await import("@/lib/db/schema");
    const chat = 7_000_000_000 + Math.floor(Math.random() * 1_000_000);
    const phone = `99890${String(chat).slice(-7)}`;

    const started = await login.createLogin({ locale: "ru", device: "Chrome, Windows" });
    const token = started.token;
    expect(await login.claimLogin(started.cookie)).toEqual({ status: "pending" });
    expect(await login.openLogin(token, chat)).toEqual({ state: "need_contact", locale: "ru" });
    expect(await login.confirmLogin(token, chat)).toEqual({ ok: false, error: "need_contact" });

    await getDb().insert(telegramLinks).values({ chatId: chat, phone, name: "Aziz Karimov" });
    expect(await login.openLogin(token, chat)).toMatchObject({ state: "confirm", device: "Chrome, Windows" });
    expect(await login.confirmLogin(token, chat)).toEqual({ ok: true, locale: "ru" });
    expect(await login.confirmLogin(token, chat)).toEqual({ ok: false, error: "expired" });

    // Another browser (wrong nonce) gets nothing.
    expect(await login.claimLogin(`${started.id}.${"x".repeat(32)}`)).toEqual({ status: "none" });

    const claimed = await login.claimLogin(started.cookie);
    expect(claimed.status).toBe("done");
    if (claimed.status !== "done") return;
    expect(readSession(claimed.cookie, sessionSecret(loyaltySecret()))).toMatchObject({ c: chat, p: phone.slice(-9), n: "Aziz" });
    expect(await login.claimLogin(started.cookie)).toEqual({ status: "none" });
    expect(await login.openLogin(token, chat)).toEqual({ state: "done" });
  });

  it("a denied or expired request never signs in", async () => {
    const login = await import("./telegram-login");
    const denied = await login.createLogin({ locale: "uz", device: "" });
    expect(await login.denyLogin(denied.token)).toBe(true);
    expect(await login.claimLogin(denied.cookie)).toEqual({ status: "denied" });

    const old = await login.createLogin({ locale: "uz", device: "", now: new Date(Date.now() - 11 * 60_000) });
    expect(await login.openLogin(old.token, 1)).toEqual({ state: "expired" });
    expect(await login.claimLogin(old.cookie)).toEqual({ status: "expired" });
    expect(await login.openLogin("a".repeat(32), 1)).toEqual({ state: "not_found" });
  });
});
