import { chromium } from "playwright";

/*
  Shared plumbing for the quality checks.

  These exist because "it looks fine" kept being wrong. Every number in
  CLAUDE.md's quality table comes from here, so the table stays true only for
  as long as this runs — which is why it lives in the repo and in CI rather
  than in someone's terminal history.
*/

export const LOCALES = ["uz", "ru"];

/** Routes worth checking. Representative, not exhaustive — CI time is finite. */
export const PATHS = [
  "",
  "/products",
  "/product/swiss-energy-immunovit-30",
  "/cart",
  "/checkout",
  "/goals",
  "/quiz",
  "/programs",
  "/blog",
  "/experts",
  "/about",
  "/contact",
  "/loyalty",
  "/ingredients",
  "/wishlist",
  "/reviews",
  "/brands",
];

export const routesFor = (locale) => PATHS.map((p) => `/${locale}${p}`);

export const MOBILE = { width: 390, height: 844 };
export const DESKTOP = { width: 1440, height: 900 };

export async function launch() {
  // Plain launch respects PLAYWRIGHT_BROWSERS_PATH, which is how CI and most
  // machines find the browser. The override is for images that ship Chromium
  // at a fixed location instead.
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  return chromium.launch({ executablePath });
}

/**
 * A context with the cookie banner already dismissed.
 *
 * It is a deliberate full-width overlay, so leaving it up makes every element
 * beneath it look like a spacing or overlap failure that isn't one.
 */
export async function context(browser, viewport) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript(() => localStorage.setItem("govita-cookie-consent", "1"));
  return ctx;
}

/** Walk the page so lazy sections mount and scroll reveals finish. */
export async function settle(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

export function report(name, findings, detail = (f) => JSON.stringify(f)) {
  const pass = findings.length === 0;
  console.log(`${pass ? "  ok  " : " FAIL "} ${name}: ${findings.length}`);
  for (const f of findings.slice(0, 12)) console.log(`         ${detail(f)}`);
  if (findings.length > 12) console.log(`         … and ${findings.length - 12} more`);
  return pass;
}
