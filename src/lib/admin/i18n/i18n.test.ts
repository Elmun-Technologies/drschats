import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NAV_GROUPS } from "@/components/admin/AdminNav";
import { ROLE_LABEL } from "@/lib/admin/roles";
import { DELIVERY_LABEL, LOCALE_LABEL, PAYMENT_LABEL, PAYMENT_STATE_LABEL, PAYMENT_STATUS_LABEL, STATUS_LABEL } from "@/lib/admin/order-labels";
import { ORDER_PERIODS } from "@/lib/admin/queries";
import { RU } from "./dict-ru";
import { translate } from "./shared";

/*
  Every t("…") in the admin has a Russian entry. A missing one is not an error
  on the page (it shows in Uzbek), which is exactly why it has to fail here.
*/
function adminSources(): string[] {
  const roots = ["src/app/admin", "src/components/admin", "src/lib/admin"];
  return roots.flatMap((root) => globSync(`${root}/**/*.{ts,tsx}`)).filter((f) => !f.includes(".test.") && !f.includes("/i18n/"));
}

const CALL = /(?<![\w.])t\(("(?:[^"\\]|\\.)*")/g;

describe("admin Russian translation", () => {
  it("has an entry for every t(\"…\") in the admin", () => {
    const missing = new Set<string>();
    for (const file of adminSources()) {
      for (const match of readFileSync(file, "utf8").matchAll(CALL)) {
        const key = JSON.parse(match[1]) as string;
        if (!(key in RU)) missing.add(`${file}: ${key}`);
      }
    }
    expect([...missing]).toEqual([]);
  });

  it("has an entry for the label tables read through t()", () => {
    const tables: string[] = [];
    for (const group of NAV_GROUPS) tables.push(group.label, ...group.items.map((i) => i.label));
    for (const table of [ROLE_LABEL, STATUS_LABEL, DELIVERY_LABEL, PAYMENT_LABEL, LOCALE_LABEL, PAYMENT_STATUS_LABEL, PAYMENT_STATE_LABEL]) tables.push(...Object.values(table));
    tables.push(...Object.values(ORDER_PERIODS), "Savdo", "Buyurtmalar", "Tashriflar", "soʻm", "ta", "kishi");
    expect(tables.filter((label) => !(label in RU))).toEqual([]);
  });

  it("keeps every {placeholder} of the Uzbek text in the Russian one", () => {
    const names = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const broken = Object.entries(RU).filter(([uz, ru]) => names(uz).join() !== names(ru).join());
    expect(broken).toEqual([]);
  });

  it("writes the Uzbek ʻ (U+02BB) in keys, never an ASCII apostrophe", () => {
    expect(Object.keys(RU).filter((key) => /[og]'/i.test(key))).toEqual([]);
  });

  it("translates by the Uzbek text and falls back to it", () => {
    expect(translate("ru", "Buyurtmalar")).toBe("Заказы");
    expect(translate("uz", "Buyurtmalar")).toBe("Buyurtmalar");
    expect(translate("ru", "Hali tarjima qilinmagan matn")).toBe("Hali tarjima qilinmagan matn");
    expect(translate("ru", "{n} ta mijoz", { n: 5 })).toBe("Клиентов: 5");
  });
});
