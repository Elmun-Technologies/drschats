import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/*
  The (panel) layout's requireAdmin() is not a guard on its own: Next renders a
  layout and its page in parallel, so the page's data was streamed in the body
  of the very 307 that sent an anonymous visitor to /admin/login (orders,
  customers, addresses). Every admin page therefore checks the session itself,
  before it reads anything.
*/
const ROOT = join(process.cwd(), "src/app/admin");
const PUBLIC = new Set(["login/page.tsx", "login/verify/page.tsx", "setup/page.tsx"]);

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pages(path);
    return name === "page.tsx" ? [path] : [];
  });
}

function defaultExportBody(src: string): string {
  const head = /export default async function \w+\s*\(/.exec(src);
  if (!head) return "";
  let depth = 0;
  let i = head.index + head[0].length - 1;
  for (; i < src.length; i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")" && --depth === 0) break;
  }
  return src.slice(src.indexOf("{", i) + 1);
}

describe("admin pages", () => {
  const files = pages(ROOT).map((path) => ({ path, rel: relative(ROOT, path).replace(/\\/g, "/") }));

  it("finds the admin pages", () => {
    expect(files.length).toBeGreaterThan(40);
  });

  for (const { path, rel } of files.filter((f) => !PUBLIC.has(f.rel))) {
    it(`${rel} checks the session before its first await`, () => {
      const body = defaultExportBody(readFileSync(path, "utf8"));
      const firstAwait = /await\s+([\w.]+)\s*\(/.exec(body);
      expect(firstAwait?.[1], "first awaited call").toBe("requireAdmin");
    });
  }
});
