import { describe, expect, it } from "vitest";
import uz from "@/messages/uz.json";
import ru from "@/messages/ru.json";
import { rawProducts } from "@/lib/shopflow/mock";
import { firstFitting, TITLE_MAX } from "@/lib/seo/page-meta";
import { PRODUCT_KEYWORDS } from "./product-keywords";

const MESSAGES = { uz, ru } as const;

describe("product search keywords", () => {
  it("belong to products of the catalogue", () => {
    const slugs = new Set(rawProducts.map((p) => p.slug));
    for (const slug of Object.keys(PRODUCT_KEYWORDS)) expect(slugs.has(slug), slug).toBe(true);
  });

  it("name the composition or form, never an effect", () => {
    const banned = /davolaydi|kamaytiradi|yaxshilaydi|kuchaytiradi|100%|лечит|снижает|улучшает|укрепляет|повышает/i;
    for (const [slug, k] of Object.entries(PRODUCT_KEYWORDS)) {
      expect(k.uz, slug).not.toMatch(banned);
      expect(k.ru, slug).not.toMatch(banned);
      expect(k.uz, slug).not.toMatch(/[og]'/i);
    }
  });

  // The search title leads with the keyword and still fits a result line for every built-in product.
  it.each(Object.entries(MESSAGES))("%s: product titles with a keyword fit in 70 characters", (locale, m) => {
    for (const p of rawProducts) {
      const keyword = PRODUCT_KEYWORDS[p.slug]?.[locale as "uz" | "ru"];
      if (!keyword) continue;
      const name = p.name[locale as "uz" | "ru"] ?? p.slug;
      const fill = (template: string) => template.replace("{keyword}", keyword).replace("{name}", name);
      const title = firstFitting([
        fill(m.meta.seo.productKeyword),
        fill(m.meta.seo.productKeywordPrice),
        fill(m.meta.seo.productKeywordShort),
        `${keyword} — ${name}`,
      ]);
      expect(title.length, title).toBeLessThanOrEqual(TITLE_MAX);
      expect(title.startsWith(keyword), title).toBe(true);
    }
  });
});
