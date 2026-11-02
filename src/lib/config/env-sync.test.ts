import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkEnv, serverEnvSchema } from "./env";

/*
  .env.example is the list of everything a deploy can set. A variable the
  code reads that the example does not list is invisible to whoever sets up
  the next deploy — it happened with ~20 of them (2026-10). This test keeps
  the two in step.
*/
const ROOT = process.cwd();

/* Set by the platform, the build or the test runner — not by whoever deploys. */
const PLATFORM = new Set([
  "NODE_ENV",
  "NEXT_RUNTIME",
  "VERCEL",
  "VERCEL_ENV",
  "FLY_APP_NAME",
  "PORT",
  "HOSTNAME",
  "CI",
  "BUILD_STANDALONE",
  "CSP_BUILD_MODE",
  "ANALYTICS_CSP_BUILD_ENABLED",
  "TEST_DATABASE_URL",
  // Read only to warn that it is no longer read (lib/shopflow/index.ts).
  "SHOPFLOW_MODE",
]);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx|mjs)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

function namesReadByCode(): Set<string> {
  const out = new Set<string>();
  for (const path of [...files(join(ROOT, "src")), join(ROOT, "next.config.ts")]) {
    const text = readFileSync(path, "utf8");
    for (const m of text.matchAll(/process\.env\.([A-Z][A-Z0-9_]+)|process\.env\[["']([A-Z][A-Z0-9_]+)["']\]/g)) out.add(m[1] ?? m[2]);
  }
  return out;
}

function namesInExample(): Set<string> {
  const text = readFileSync(join(ROOT, ".env.example"), "utf8");
  return new Set([...text.matchAll(/^#?\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]));
}

describe(".env.example", () => {
  const example = namesInExample();

  it("lists every variable the code reads", () => {
    const missing = [...namesReadByCode()].filter((name) => !example.has(name) && !PLATFORM.has(name)).sort();
    expect(missing, "add these to .env.example with a one-line comment").toEqual([]);
  });

  it("lists every variable lib/config/env.ts checks", () => {
    const missing = Object.keys(serverEnvSchema.shape).filter((name) => !example.has(name) && !PLATFORM.has(name));
    expect(missing).toEqual([]);
  });
});

describe("checkEnv", () => {
  it("names a short secret without printing it", () => {
    const result = checkEnv({ ADMIN_SESSION_SECRET: "short-secret-value" });
    expect(result.issues.join(" ")).toContain("ADMIN_SESSION_SECRET");
    expect(result.issues.join(" ")).not.toContain("short-secret-value");
  });

  it("reads blanks as unset", () => {
    expect(checkEnv({ DATABASE_URL: "  ", RESEND_API_KEY: "" }).env).toMatchObject({ DATABASE_URL: undefined, RESEND_API_KEY: undefined });
  });
});
