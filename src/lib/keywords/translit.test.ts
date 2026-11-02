import { describe, expect, it } from "vitest";
import { uzLatinToCyrillic } from "./translit";

describe("uzLatinToCyrillic", () => {
  it("handles the Uzbek letters and digraphs", () => {
    expect(uzLatinToCyrillic("vitamin narxi")).toBe("витамин нархи");
    expect(uzLatinToCyrillic("soch to'kilishi")).toBe("соч тўкилиши");
    expect(uzLatinToCyrillic("bo'g'imlar uchun")).toBe("бўғимлар учун");
    expect(uzLatinToCyrillic("sotib olish")).toBe("сотиб олиш");
    expect(uzLatinToCyrillic("energiya")).toBe("энергия");
    expect(uzLatinToCyrillic("yetishmasligi")).toBe("етишмаслиги");
    expect(uzLatinToCyrillic("homiladorlar")).toBe("ҳомиладорлар");
    expect(uzLatinToCyrillic("magniy b6")).toBe("магний б6");
    expect(uzLatinToCyrillic("vitamin c")).toBe("витамин с");
  });
});
