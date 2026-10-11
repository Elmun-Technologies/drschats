import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import uz from "./uz.json";
import ru from "./ru.json";

/*
  A key that is missing renders as its own path ("common.savings") — next-intl
  does not throw in production. This walks every translator in src/ and
  checks each literal key it reads exists in both locales.
*/

type Tree = { [k: string]: unknown };

function has(tree: Tree, path: string): boolean {
  let node: unknown = tree;
  for (const part of path.split(".")) {
    if (!node || typeof node !== "object" || !(part in node)) return false;
    node = (node as Tree)[part];
  }
  return true;
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

const NS = String.raw`(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*?namespace:\s*)?"([\w.]+)"`;
const SINGLE = new RegExp(String.raw`(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?` + NS, "g");
const DESTRUCTURED = /(?:const|let)\s+\[([\w\s,]+)\]\s*=\s*await\s+Promise\.all\(\[/g;

/** Elements of the array literal opening at `from`, split on its own commas. */
function topLevel(src: string, from: number): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = from;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) {
      if (depth === 0) {
        parts.push(src.slice(start, i).trim());
        break;
      }
      depth--;
    } else if (c === "," && depth === 0) {
      parts.push(src.slice(start, i).trim());
      start = i + 1;
    }
  }
  return parts.filter(Boolean);
}

interface Decl {
  at: number;
  name: string;
  ns: string;
}

function declarations(src: string): Decl[] {
  const out: Decl[] = [];
  for (const m of src.matchAll(SINGLE)) out.push({ at: m.index!, name: m[1], ns: m[2] });
  for (const m of src.matchAll(DESTRUCTURED)) {
    const names = m[1].split(",").map((s) => s.trim());
    topLevel(src, m.index! + m[0].length).forEach((element, i) => {
      const call = element.match(new RegExp("^" + NS));
      if (names[i] && call) out.push({ at: m.index!, name: names[i], ns: call[1] });
    });
  }
  return out;
}

function missingKeys(): string[] {
  const missing: string[] = [];
  for (const file of files(join(__dirname, ".."))) {
    const src = readFileSync(file, "utf8");
    const decls = declarations(src);
    for (const name of new Set(decls.map((d) => d.name))) {
      const call = new RegExp(String.raw`(?<![\w.])` + name + String.raw`(?:\.rich|\.raw|\.markup)?\(\s*"([\w.]+)"`, "g");
      for (const m of src.matchAll(call)) {
        const decl = decls.filter((d) => d.name === name && d.at < m.index!).at(-1);
        if (!decl) continue;
        const key = `${decl.ns}.${m[1]}`;
        for (const [locale, tree] of [["uz", uz], ["ru", ru]] as const) {
          if (!has(tree as Tree, key)) missing.push(`${file.replace(/.*\/src\//, "src/")}: ${key} (${locale})`);
        }
      }
    }
  }
  return missing;
}

describe("translation keys used in code", () => {
  it("exist in uz and ru", () => {
    expect(missingKeys()).toEqual([]);
  });
});
