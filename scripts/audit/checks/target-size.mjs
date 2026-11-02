import { context, MOBILE, routesFor } from "../lib.mjs";

/*
  WCAG 2.2 target size, with the Spacing exception actually applied.

  Counting every control under 24px reports ~50 failures on this site and all
  but a couple are inline links the spec explicitly permits. The exception says
  an undersized target passes if a 24px-diameter circle centred on it doesn't
  intersect another target's circle — so that is what gets measured, and the
  number it produces is one worth acting on.

  The design rule is stricter — every control ≥ 44px on touch layouts.
  `TARGET_SIZE=44 npm run audit` measures that instead: any control under
  44px in either direction that is not inline text fails, spacing or not.
  It is opt-in while the remaining small controls are worked through.
*/

const STRICT = process.env.TARGET_SIZE === "44";

const AUDIT = (strict) => `(() => {
  const strict = ${strict};
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const nameOf = (el) => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 34);

  // Which layer a target lives on. A fixed bar floats over the page: at any
  // given scroll offset it sits on top of unrelated content, and pairing the
  // two measures the scroll position rather than the layout. Content trapped
  // under that bar is a real defect, but it is the bottom-edge check's to
  // report — and it reports it at max scroll, where the answer is stable.
  const layerOf = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).position === 'fixed') return n;
    }
    return null;
  };

  const targets = [];
  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    targets.push({ el, layer: layerOf(el), name: nameOf(el), x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height });
  }

  const fails = [];
  for (const t of targets) {
    const min = strict ? 44 : 24;
    if (t.w >= min && t.h >= min) continue;

    // Inline text inside a sentence is exempt.
    const p = t.el.closest('p');
    if (p && p.textContent.trim().length > t.name.length + 12) continue;

    let crowdedBy = strict ? '(under 44px)' : null;
    if (!strict) for (const o of targets) {
      if (o === t) continue;
      if (o.layer !== t.layer) continue;
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
      for (const f of await page.evaluate(AUDIT(STRICT))) {
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
