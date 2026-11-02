import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import uz from "./uz.json";
import ru from "./ru.json";

/*
  The reverse of keys-used.test.ts: every message must be read somewhere. A
  key nobody reads is copy nobody reviews — the audit found an "over ten
  years" claim, a phone number and a certificate promise sitting in the
  files long after the components that showed them were gone.

  A key counts as read when code
  - calls a translator with it as a literal (`t("title")`), or with a
    template or concatenation whose static head reaches it
    (`t(\`steps.${i}\`)` reads all of `steps`);
  - calls a translator with anything else (`t(item.key)`), or hands the
    translator to other code (`format={t}`): the whole namespace counts,
    because the key cannot be known from here;
  - reads the JSON directly (`uz.common.notFoundTitle`);
  - writes the full dotted path as a string (`"home.v3.slides"`), the way
    config tables name keys for a translator elsewhere.
*/

type Tree = { [k: string]: unknown };

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

function leaves(node: unknown, path: string[] = [], out: string[] = []): string[] {
  if (node && typeof node === "object" && !Array.isArray(node)) {
    for (const [k, v] of Object.entries(node as Tree)) leaves(v, [...path, k], out);
  } else {
    out.push(path.join("."));
  }
  return out;
}

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

const NS_CALL = String.raw`(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*?namespace:\s*)?(?:"([\w.]*)")?[^)]*\)`;
const TOP = new Set(Object.keys(uz));

function readPrefixes(): Set<string> {
  const used = new Set<string>();
  for (const file of files(join(__dirname, ".."))) {
    const src = readFileSync(file, "utf8");

    for (const m of src.matchAll(/\b(?:uz|ru|messages)((?:\.\w+)+)/g)) used.add(m[1].slice(1));
    // A full dotted path written as data (a config table, a default namespace
    // parameter) — not a call's argument, which the translator rules read.
    for (const m of src.matchAll(/["'`]([a-z]\w*(?:\.[\w-]+)+)["'`]/g)) {
      if (!TOP.has(m[1].split(".")[0])) continue;
      if (/(?:[\w$]\(\s*|namespace:\s*)$/.test(src.slice(Math.max(0, m.index! - 30), m.index!))) continue;
      used.add(m[1]);
    }

    const names: { name: string; ns: string }[] = [];
    const declared: [number, number][] = [];
    for (const m of src.matchAll(new RegExp(String.raw`(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?` + NS_CALL, "g"))) {
      names.push({ name: m[1], ns: m[2] ?? "" });
      declared.push([m.index!, m.index! + m[0].length]);
    }
    for (const m of src.matchAll(/(?:const|let)\s+\[([\w\s,]+)\]\s*=\s*await\s+Promise\.all\(\[/g)) {
      const vars = m[1].split(",").map((v) => v.trim());
      const parts = topLevel(src, m.index! + m[0].length);
      parts.forEach((part, i) => {
        const call = part.match(new RegExp("^" + NS_CALL));
        if (call && vars[i]) names.push({ name: vars[i], ns: call[1] ?? "" });
      });
      declared.push([m.index!, m.index! + m[0].length + parts.join(",").length]);
    }
    const inDeclaration = (at: number) => declared.some(([a, b]) => at >= a && at < b);

    for (const { name, ns } of names) {
      const full = (key: string) => (ns ? (key ? `${ns}.${key}` : ns) : key);
      const use = new RegExp(String.raw`(?<![\w.$])${name}(?:\.(?:rich|raw|markup|has))?(?![\w$])`, "g");
      for (const m of src.matchAll(use)) {
        if (inDeclaration(m.index!)) continue;
        const after = src.slice(m.index! + m[0].length);
        const call = after.match(/^\s*\(\s*(["`])?([\w.]*)/);
        if (call) {
          // A literal, or the static head of a template or a concatenation.
          if (call[1]) used.add(full(call[2].replace(/\.$/, "")));
          else used.add(ns);
          continue;
        }
        // The translator handed to other code (`fn(t)`, `t={t}`, `{ t }`): any key in it may be read.
        if (/^\s*[,)}\]]/.test(after) && !/^\s*\)\s*=>/.test(after)) used.add(ns);
      }
    }
  }
  return used;
}

function unread(messages: Tree): string[] {
  const used = readPrefixes();
  return leaves(messages).filter((key) => {
    const parts = key.split(".");
    for (let i = parts.length; i > 0; i--) {
      if (used.has(parts.slice(0, i).join("."))) return false;
    }
    return true;
  });
}

describe("translation keys", () => {
  it("are all read by code (uz)", () => {
    expect(unread(uz as Tree)).toEqual([]);
  });

  it("are all read by code (ru)", () => {
    expect(unread(ru as Tree)).toEqual([]);
  });
});
