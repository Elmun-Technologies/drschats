import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { describe, expect, it } from "vitest";

/*
  What is allowed to be served from /public.

  Everything under public/ is reachable by anyone at a guessable URL, with no
  authentication and no middleware in front of it — src/middleware.ts matches
  everything *except* paths containing a dot, precisely so that assets are
  served straight off disk. That makes it the one directory where a stray file
  is a published file.

  It happened: 46 MB of supplier photo archives sat in public/products and were
  downloadable at /products/напитки.rar. Nothing noticed, because nothing
  looked. This looks.
*/

const ROOT = join(__dirname, "..", "..");
const PUBLIC = join(ROOT, "public");

/** Delivery vehicles and working files, not site assets. */
const FORBIDDEN_EXT = new Set([
  ".rar",
  ".zip",
  ".7z",
  ".tar",
  ".gz",
  ".tgz",
  ".psd",
  ".ai",
  ".fig",
  ".sketch",
  ".sql",
  ".db",
  ".sqlite",
  ".env",
  ".pem",
  ".key",
  ".log",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

describe("public/ is only what the site serves", () => {
  const files = walk(PUBLIC).map((f) => relative(PUBLIC, f));

  it("holds no archives, design sources, databases or credentials", () => {
    const offenders = files.filter((f) => FORBIDDEN_EXT.has(extname(f).toLowerCase()));
    expect(offenders, `remove these from public/ — they are publicly downloadable: ${offenders.join(", ")}`).toEqual([]);
  });

  it("has no dotfiles that could leak configuration", () => {
    // .gitkeep is the one deliberate exception: it exists to keep an empty
    // directory in Git and carries no content.
    const dots = files.filter((f) => f.split("/").some((part) => part.startsWith(".") && part !== ".gitkeep"));
    expect(dots).toEqual([]);
  });

  it("keeps the service worker caching only its own origins", () => {
    /*
      sw.js runs with the page's privileges and outlives the deploy that
      shipped it. A cache list that reaches for a third-party origin, or a
      fetch handler that forwards anything, would be a way to serve someone
      else's content under this domain.
    */
    const sw = readFileSync(join(PUBLIC, "sw.js"), "utf8");
    expect(sw).not.toMatch(/\beval\s*\(/);
    expect(sw).not.toMatch(/new Function\s*\(/);
    const absolute = [...sw.matchAll(/["'`](https?:\/\/[^"'`]+)["'`]/g)].map((m) => m[1]);
    expect(absolute, `sw.js references external origins: ${absolute.join(", ")}`).toEqual([]);
  });

  it("ships a manifest whose icons exist", () => {
    /*
      A PWA prompt that fails on a missing icon is silent: the browser simply
      never offers to install, and nothing in the build reports why.
    */
    const manifest = JSON.parse(readFileSync(join(PUBLIC, "manifest.json"), "utf8"));
    const missing = (manifest.icons ?? [])
      .map((i: { src: string }) => i.src.replace(/^\//, ""))
      .filter((src: string) => !files.includes(src));
    expect(missing, `manifest icons not present in public/: ${missing.join(", ")}`).toEqual([]);
  });
});
