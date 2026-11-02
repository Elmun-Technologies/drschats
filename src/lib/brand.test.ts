import { describe, expect, it } from "vitest";
import { BRAND } from "./brand";

/*
  BRAND's strings reach the footer, the requisites page, JSON-LD and the
  receipts, so they follow the copy rule the message files follow: oʻ/gʻ with
  U+02BB and the tutuq with U+02BC — never an ASCII, curly or back-tick
  apostrophe between letters.
*/
function strings(node: unknown, path: string, out: [string, string][]): [string, string][] {
  if (typeof node === "string") out.push([path, node]);
  else if (Array.isArray(node)) node.forEach((v, i) => strings(v, `${path}.${i}`, out));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) strings(v, `${path}.${k}`, out);
  return out;
}

describe("BRAND copy", () => {
  it("writes Uzbek apostrophes as ʻ (U+02BB) and ʼ (U+02BC)", () => {
    const hits = strings(BRAND, "BRAND", [])
      .filter(([, text]) => !/^(https?:|mailto:|tel:|\/)/.test(text))
      .filter(([, text]) => /\p{L}['‘’`]\p{L}/u.test(text));
    expect(hits).toEqual([]);
  });
});
