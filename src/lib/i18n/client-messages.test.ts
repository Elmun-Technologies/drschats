import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import uz from "@/messages/uz.json";
import ru from "@/messages/ru.json";
import { CLIENT_MESSAGE_PATHS, pickMessages } from "./client-messages";

/*
  A client component whose namespace is missing from the provider renders the
  key path instead of the text. This follows the import graph from every
  "use client" module (stopping at "use server" actions, which run on the
  server) and checks each `useTranslations` namespace it can reach is sent.
*/

const SRC = join(__dirname, "..", "..");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (/\.tsx?$/.test(candidate) && existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const IMPORT = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
const hasDirective = (src: string, directive: string) =>
  new RegExp(String.raw`^(?:\s|//[^\n]*\n|/\*[\s\S]*?\*/)*["']${directive}["']`).test(src);

function clientModules(): string[] {
  const seen = new Set<string>();
  const stack = files(SRC).filter((f) => hasDirective(readFileSync(f, "utf8"), "use client"));
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    const src = readFileSync(file, "utf8");
    if (hasDirective(src, "use server")) continue;
    seen.add(file);
    for (const m of src.matchAll(IMPORT)) {
      if (m[1]) continue;
      const next = resolveImport(file, m[2] ?? m[3]);
      if (next) stack.push(next);
    }
  }
  return [...seen];
}

const covered = (ns: string) => CLIENT_MESSAGE_PATHS.some((p) => ns === p || ns.startsWith(`${p}.`));

describe("client message slice", () => {
  const modules = clientModules();

  it("finds the client graph", () => {
    expect(modules.length).toBeGreaterThan(50);
  });

  it("sends every namespace a client module translates with", () => {
    const missing: string[] = [];
    for (const file of modules) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/useTranslations\(([^)]*)\)/g)) {
        const arg = m[1].trim();
        const literal = arg.match(/^"([\w.]+)"$/);
        if (!literal) missing.push(`${relative(SRC, file)}: useTranslations(${arg}) — use a literal namespace`);
        else if (!covered(literal[1])) missing.push(`${relative(SRC, file)}: "${literal[1]}"`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("names paths that exist in both locales", () => {
    for (const path of CLIENT_MESSAGE_PATHS) {
      for (const messages of [uz, ru]) {
        const leaf = path.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);
        expect(leaf, path).toBeTypeOf("object");
      }
    }
  });

  it("keeps sub-trees whole and leaves the rest out", () => {
    const picked = pickMessages(uz) as Record<string, Record<string, unknown>>;
    expect(picked.cart).toEqual(uz.cart);
    expect(Object.keys(picked.pages)).toEqual(["v3"]);
    expect(Object.keys(picked.pages.v3 as object).sort()).toEqual(["contact", "partners"]);
    expect(picked.meta).toBeUndefined();
  });
});
