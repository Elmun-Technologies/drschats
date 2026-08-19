import { context, MOBILE, routesFor } from "../lib.mjs";

/*
  Content trapped under the bottom-anchored bars.

  The mobile tab bar, the back-to-top button and the toasts all float over the
  page. Whatever they cover at a given scroll offset is not a defect — you
  scroll and it comes out. What is a defect is content that stays covered at
  the very bottom of the page, because there is no further scroll to free it:
  the last rows of the footer become permanently untappable.

  So this measures at max scroll, where the answer is stable, and that is also
  why the target-size check refuses to pair a fixed target with one in normal
  flow. That pairing measures the scroll position; this measures the layout.

  The zero in CLAUDE.md's table for this row used to rest on a one-off script
  in a temp directory. This is what re-checks it.
*/

const AUDIT = `(() => {
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  };

  // The floating layer: anything fixed that reaches into the bottom third.
  const bars = [];
  for (const el of document.querySelectorAll('body *')) {
    if (getComputedStyle(el).position !== 'fixed' || !vis(el)) continue;
    if (el.closest('[role="dialog"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < innerHeight * 0.66 || r.top > innerHeight) continue;
    bars.push({ el, r, name: (el.getAttribute('aria-label') || el.className || el.tagName).toString().slice(0, 40) });
  }
  if (bars.length === 0) return [];

  const overlaps = (a, b) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select')) {
    if (!vis(el)) continue;

    // Skip anything living on the floating layer itself — bars are allowed to
    // contain their own controls, and are allowed to sit on each other.
    let floating = false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).position === 'fixed') { floating = true; break; }
    }
    if (floating) continue;

    const r = el.getBoundingClientRect();
    for (const bar of bars) {
      if (!overlaps(r, bar.r)) continue;
      const name = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 34);
      const key = name + '|' + bar.name;
      if (seen.has(key)) break;
      seen.add(key);
      out.push({ name, bar: bar.name });
      break;
    }
  }
  return out;
})()`;

export async function run(browser, locale) {
  const ctx = await context(browser, MOBILE);
  const page = await ctx.newPage();
  const findings = [];

  for (const route of routesFor(locale)) {
    try {
      await page.goto(process.env.BASE_URL + route, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(400);
      /*
        Scroll until the bottom stops moving. One jump is not enough: the
        deferred rails mount as they come into view, the page grows underneath
        the scroll, and the "bottom" measured a moment ago is now the middle —
        which reports whatever the bar happens to be covering there. That
        artifact is exactly what this check exists to not do.
      */
      let previous = -1;
      for (let i = 0; i < 8; i++) {
        const height = await page.evaluate(() => {
          scrollTo(0, document.documentElement.scrollHeight);
          return document.documentElement.scrollHeight;
        });
        await page.waitForTimeout(500);
        if (height === previous) break;
        previous = height;
      }
      // The back-to-top button only appears once the page has been scrolled.
      await page.waitForTimeout(400);
      for (const f of await page.evaluate(AUDIT)) {
        findings.push(`${route} "${f.name}" trapped under ${f.bar}`);
      }
    } catch {
      /* reported by the a11y check */
    }
  }

  await ctx.close();
  return findings;
}
