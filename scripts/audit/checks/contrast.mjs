import { context, DESKTOP, routesFor } from "../lib.mjs";

/*
  WCAG contrast, computed rather than eyeballed.

  Backgrounds are composited down the ancestor chain onto white so a colour
  written as fg/60 is measured as it actually paints. Elements sitting on a
  gradient or image are skipped rather than guessed at — a wrong number here
  would be worse than no number.
*/

const AUDIT = `(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const bgOf = (el) => {
    const layers = [];
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a === 1) break; }
      n = n.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  };

  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.textContent || !el.textContent.trim()) continue;
    // Only elements whose own text is a direct child, or every container
    // reports its descendants' text as its own.
    const own = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;

    const fg = parse(cs.color);
    const bg = bgOf(el);
    if (!fg || !bg) continue;

    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const r = ratio(over(fg, bg), bg);

    if (r < need) {
      out.push({
        text: el.textContent.trim().slice(0, 30),
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 50),
        color: cs.color,
        bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')',
        ratio: Math.round(r * 100) / 100,
        need,
      });
    }
  }
  return out;
})()`;

export async function run(browser, locale) {
  const ctx = await context(browser, DESKTOP);
  const page = await ctx.newPage();
  const seen = new Map();

  for (const route of routesFor(locale)) {
    try {
      await page.goto(process.env.BASE_URL + route, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(400);
      for (const issue of await page.evaluate(AUDIT)) {
        // One entry per distinct style, not per occurrence: a failing token
        // repeated forty times is one thing to fix.
        const key = `${issue.cls}|${issue.color}|${issue.bg}`;
        if (!seen.has(key)) seen.set(key, { ...issue, route });
      }
    } catch {
      /* a route that will not load is the a11y check's problem to report */
    }
  }

  await ctx.close();
  return [...seen.values()].map(
    (i) => `${i.ratio}:1 (needs ${i.need}) ${i.color} on ${i.bg} — "${i.text}" ${i.route}`,
  );
}
