import { context, MOBILE, routesFor } from "../lib.mjs";

/*
  Text clipped inside its own box.

  Russian runs 20–30% longer than the Uzbek the layout was built against, and
  that doesn't surface as page overflow — it surfaces as a word cut off inside
  a button or a nav item. Deliberate truncation (line-clamp, an explicit
  ellipsis, a horizontal scroller) is left alone; the rest is a layout that
  cannot hold its own translation.
*/

const AUDIT = `(() => {
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const own = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 6) continue;

    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') continue;
    if (cs.textOverflow === 'ellipsis') continue;

    let scroller = false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const p = getComputedStyle(n);
      if (p.overflowX === 'auto' || p.overflowX === 'scroll') { scroller = true; break; }
    }
    if (scroller) continue;

    const overX = el.scrollWidth - el.clientWidth;
    const overY = el.scrollHeight - el.clientHeight;
    const clipsX = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
    const clipsY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
    if (!((overX > 2 && clipsX) || (overY > 2 && clipsY))) continue;

    const text = el.textContent.replace(/\\s+/g, ' ').trim().slice(0, 36);
    const key = text + '|' + (el.className || '').toString().slice(0, 36);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text, over: Math.max(overX, overY), cls: (el.className || '').toString().slice(0, 44) });
  }
  return out;
})()`;

export async function run(browser, locale) {
  const findings = [];

  // Mobile only: this is where a longer translation runs out of room first,
  // and doubling the page loads to confirm it again at 1440px is CI time spent
  // on a case the narrow viewport already catches.
  for (const viewport of [MOBILE]) {
    const ctx = await context(browser, viewport);
    const page = await ctx.newPage();
    for (const route of routesFor(locale)) {
      try {
        await page.goto(process.env.BASE_URL + route, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(400);
        for (const c of await page.evaluate(AUDIT)) {
          findings.push(`${route}@${viewport.width} "${c.text}" clipped by ${c.over}px`);
        }
      } catch {
        /* reported by the a11y check */
      }
    }
    await ctx.close();
  }

  return findings;
}
