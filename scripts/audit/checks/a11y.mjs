import { context, MOBILE, routesFor, settle } from "../lib.mjs";

/*
  Four things that are cheap to check and expensive to miss: a control nobody
  can name, an image with no alt attribute at all, a heading level skipped, and
  a page that scrolls sideways on a phone.
*/

const AUDIT = `(() => {
  const out = { unnamed: [], alt: [], headings: [], overflow: null };

  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const nameOf = (el) => {
    const aria = el.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();
    const by = el.getAttribute('aria-labelledby');
    if (by) {
      const t = by.split(/\\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
      if (t) return t;
    }
    const title = el.getAttribute('title');
    if (title && title.trim()) return title.trim();
    const text = (el.textContent || '').trim();
    if (text) return text;
    const img = el.querySelector('img[alt]');
    if (img && img.getAttribute('alt').trim()) return img.getAttribute('alt').trim();
    return '';
  };

  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select, textarea')) {
    if (!visible(el)) continue;
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
      const id = el.id;
      const labelled = (id && document.querySelector('label[for="' + CSS.escape(id) + '"]')) || el.closest('label');
      if (labelled || nameOf(el) || el.getAttribute('placeholder')) continue;
      out.unnamed.push(el.tagName + ' ' + (el.className || '').toString().slice(0, 50));
      continue;
    }
    if (nameOf(el)) continue;
    out.unnamed.push(el.outerHTML.slice(0, 80));
  }

  // alt="" is a valid decorative marker; a missing attribute is not.
  for (const img of document.querySelectorAll('img')) {
    if (!visible(img)) continue;
    if (img.getAttribute('alt') === null) out.alt.push((img.currentSrc || img.src || '').slice(-60));
  }

  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
  const h1s = hs.filter(h => h.tagName === 'H1').length;
  if (h1s !== 1) out.headings.push('h1 count = ' + h1s);
  let prev = 0;
  for (const h of hs) {
    const lvl = +h.tagName[1];
    if (prev && lvl > prev + 1) {
      out.headings.push('h' + prev + ' -> h' + lvl + ': ' + h.textContent.trim().slice(0, 40));
    }
    prev = lvl;
  }

  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    out.overflow = document.documentElement.scrollWidth + ' > ' + window.innerWidth;
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
      await settle(page);
      const r = await page.evaluate(AUDIT);
      for (const kind of ["unnamed", "alt", "headings"]) {
        for (const item of r[kind]) findings.push(`${route} ${kind}: ${item}`);
      }
      if (r.overflow) findings.push(`${route} overflow: ${r.overflow}`);
    } catch (err) {
      findings.push(`${route} could not be checked: ${String(err).slice(0, 60)}`);
    }
  }

  await ctx.close();
  return findings;
}
