import { describe, expect, it } from "vitest";
import uz from "@/messages/uz.json";
import ru from "@/messages/ru.json";
import { thousands } from "@/lib/config/commerce";
import { DEFAULT_COMMERCE_SETTINGS } from "./settings";

/*
  The free-shipping threshold and the courier fee are admin settings now, so a
  translation that writes "300 000" out by hand goes stale the moment an admin
  changes it. Copy quotes them through placeholders ({amount}, {free}, {fee})
  filled from the effective settings. This replaces the old
  `audit:consistency` idea with a test that runs on every `npm test`.

  ALLOWED lists strings no page renders today; each says why.
*/
const ALLOWED = new Set([
  // Not read by any component (keys-used.test.ts would list it). Kept verbatim
  // because the announcement bar being built in parallel may adopt it with its
  // own, admin-managed text.
  "topbar.announcement",
]);

function walk(value: unknown, path: string[], out: [string, string][]) {
  if (typeof value === "string") out.push([path.join("."), value]);
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...path, String(i)], out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, [...path, k], out);
}

describe("translations quote commerce numbers through placeholders", () => {
  const amounts = [DEFAULT_COMMERCE_SETTINGS.delivery.freeShippingOver, DEFAULT_COMMERCE_SETTINGS.delivery.courierFee].map((n) =>
    new RegExp(`(^|\\D)${thousands(n).replace(/ /g, "[\\s\\u00a0]?")}(\\D|$)`),
  );

  for (const [locale, messages] of [["uz", uz], ["ru", ru]] as const) {
    it(`${locale}: no hard-coded threshold or courier fee`, () => {
      const strings: [string, string][] = [];
      walk(messages, [], strings);
      const stale = strings.filter(([key, text]) => !ALLOWED.has(key) && amounts.some((re) => re.test(text))).map(([key]) => key);
      expect(stale).toEqual([]);
    });
  }

  it("the delivery FAQ fills its threshold from the settings", () => {
    const answer = (m: typeof uz) => (m.pages.deliveryFaq as { answer: string }[])[1].answer;
    expect(answer(uz)).toContain("{amount}");
    expect(answer(ru as typeof uz)).toContain("{amount}");
  });
});
