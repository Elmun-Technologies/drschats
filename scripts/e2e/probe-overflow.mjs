import { BASE, openBrowser, newPage, summary, check } from "./lib.mjs";

/*
  Finds what makes a page wider than the viewport at 390 px: every element
  whose right edge sits past the visual viewport (or whose scrollWidth does),
  with its tag, classes and text, innermost first.
*/

const PATH = process.env.PATH_TO_CHECK ?? "/uz";

const browser = await openBrowser();
try {
  const { page, ctx } = await newPage(browser, { width: 390, height: 844 });
  await page.goto(`${BASE}${PATH}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const report = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    // Elements inside their own horizontal scroller (chip rows, carousels) are
    // meant to be wider than the screen; only what overflows the page counts.
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (["hidden", "auto", "scroll"].includes(s.overflowX)) return true;
      }
      return false;
    };
    for (const el of document.querySelectorAll("body *")) {
      if (clipped(el)) continue;
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (style.position === "fixed" && style.visibility === "hidden") continue;
      const overRight = Math.round(r.right - vw);
      const overLeft = Math.round(-r.left);
      const wide = el.scrollWidth - el.clientWidth > 1 && el.clientWidth > 0;
      if (overRight > 1 || overLeft > 1) {
        out.push({
          overRight,
          overLeft,
          wide,
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 120),
          text: (el.textContent || "").trim().slice(0, 60),
          w: Math.round(r.width),
        });
      }
    }
    return { vw, scrollWidth: document.documentElement.scrollWidth, out: out.slice(0, 40) };
  });
  console.log(`viewport ${report.vw}, document ${report.scrollWidth}`);
  for (const o of report.out) {
    console.log(`${o.tag} r+${o.overRight} l+${o.overLeft} w=${o.w}${o.wide ? " wide" : ""} .${o.cls} :: ${o.text}`);
  }
  check("no overflow", report.scrollWidth <= report.vw, `${report.scrollWidth - report.vw}px`);
  await ctx.close();
} finally {
  await browser.close();
}
process.exit(summary() ? 0 : 1);
