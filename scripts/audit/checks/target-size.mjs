import { context, MOBILE, routesFor } from "../lib.mjs";

/*
  WCAG 2.2 target size, with the Spacing exception actually applied.

  Counting every control under 24px reports ~50 failures on this site and all
  but a couple are inline links the spec explicitly permits. The exception says
  an undersized target passes if a 24px-diameter circle centred on it doesn't
  intersect another target's circle — so that is what gets measured, and the
  number it produces is one worth acting on.
*/

const AUDIT = `(() => {
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const nameOf = (el) => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 34);

  const targets = [];
  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    targets.push({ el, name: nameOf(el), x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height });
  }

  const fails = [];
  for (const t of targets) {
    if (t.w >= 24 && t.h >= 24) continue;

    // Inline text inside a sentence is exempt.
    const p = t.el.closest('p');
    if (p && p.textContent.trim().length > t.name.length + 12) continue;

    let crowdedBy = null;
    for (const o of targets) {
      if (o === t) continue;
      if (Math.hypot(t.x - o.x, t.y - o.y) < 24) { crowdedBy = o.name; break; }
    }
    if (!crowdedBy) continue;

    fails.push({
      name: t.name,
      size: Math.round(t.w) + 'x' + Math.round(t.h),
      crowdedBy,
      cls: (el => (el.className || '').toString().slice(0, 44))(t.el),
    });
  }
  return fails;
})()`;

export async function run(browser, locale) {
  const ctx = await context(browser, MOBILE);
  const page = await ctx.newPage();
  const seen = new Map();

  for (const route of routesFor(locale)) {
    try {
      await page.goto(process.env.BASE_URL + route, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(400);
      for (const f of await page.evaluate(AUDIT)) {
        const key = `${f.name}|${f.cls}`;
        if (!seen.has(key)) seen.set(key, { ...f, route });
      }
    } catch {
      /* reported by the a11y check */
    }
  }

  await ctx.close();
  return [...seen.values()].map(
    (f) => `${f.size} "${f.name}" crowded by "${f.crowdedBy}" — ${f.route}`,
  );
}
