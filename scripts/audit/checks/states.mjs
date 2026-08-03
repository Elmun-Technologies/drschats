import { context, DESKTOP, MOBILE } from "../lib.mjs";

/*
  The overlays, opened.

  This check exists because a keyboard trap in the upsell modal survived every
  other audit here: they all looked at freshly loaded pages, and an overlay is
  never in the initial DOM. Accessible names and Escape handling go missing
  exactly where nothing was looking.

  An audit only covers the states it reaches.
*/

const INSPECT = `(() => {
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return false;
    const r = el.getBoundingClientRect();
    return r.width > 3 && r.height > 3;
  };
  const named = (el) => {
    const n = (el.getAttribute('aria-label') || el.textContent || '').trim();
    return n.length > 0;
  };

  const unnamed = [];
  for (const el of document.querySelectorAll('a[href], button, [role="button"]')) {
    if (!vis(el) || named(el)) continue;
    unnamed.push((el.className || '').toString().slice(0, 44));
  }

  const dialogs = [...document.querySelectorAll('[role="dialog"]')].filter(vis).map((d) => ({
    modal: d.getAttribute('aria-modal'),
    labelled: !!(d.getAttribute('aria-label') || d.getAttribute('aria-labelledby')),
  }));

  // A full-screen fixed layer that declares no dialog semantics: keyboard users
  // get no announcement and usually no way out.
  const bare = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' || +cs.opacity < 0.1) continue;
    const r = el.getBoundingClientRect();
    if (r.width < innerWidth * 0.9 || r.height < innerHeight * 0.9) continue;
    if (el.closest('[role="dialog"]') || el.querySelector('[role="dialog"]')) continue;
    if (el.hasAttribute('aria-hidden')) continue;
    bare.push((el.className || '').toString().slice(0, 44));
  }

  return { unnamed, dialogs, bare };
})()`;

const STATES = [
  {
    name: "catalogue mega-menu",
    viewport: DESKTOP,
    path: "",
    open: (page) => page.locator('button:has-text("Kategoriyalar"), button:has-text("категор")').first().click(),
  },
  {
    name: "search suggestions",
    viewport: DESKTOP,
    path: "",
    open: async (page) => {
      const box = page.locator('input[role="combobox"]').first();
      await box.click();
      await box.fill("vitamin");
      await page.waitForTimeout(1400);
    },
  },
  {
    name: "mobile menu",
    viewport: MOBILE,
    path: "",
    // Located by position rather than label: the label is translated, and a
    // check that only works in one locale is a check that will rot. Buttons
    // inside a form are skipped — the mobile search row put its submit button
    // last in the header and this quietly started clicking that instead.
    open: (page) =>
      page.evaluate(() => {
        const visible = [...document.querySelectorAll("header button")].filter((b) => {
          if (b.closest("form")) return false;
          const r = b.getBoundingClientRect();
          return r.width > 4 && r.height > 4;
        });
        visible.at(-1)?.click();
      }),
  },
  {
    name: "cart drawer",
    viewport: DESKTOP,
    path: "",
    open: (page) =>
      page.evaluate(() => {
        const el = [...document.querySelectorAll("button, a")].find((e) =>
          /savat|cart|корзин/i.test(e.getAttribute("aria-label") || ""),
        );
        el?.click();
      }),
  },
  {
    name: "upsell modal",
    viewport: DESKTOP,
    path: "/products",
    open: async (page) => {
      const btn = page.locator('button:has-text("Savatga"), button:has-text("корзину")').first();
      await btn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100);
      await btn.click();
      await page.waitForTimeout(1600);
    },
  },
];

export async function run(browser, locale) {
  const findings = [];

  for (const state of STATES) {
    const ctx = await context(browser, state.viewport);
    const page = await ctx.newPage();
    try {
      await page.goto(`${process.env.BASE_URL}/${locale}${state.path}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await page.waitForTimeout(700);
      const before = await page.evaluate(INSPECT);

      await state.open(page);
      await page.waitForTimeout(900);
      const after = await page.evaluate(INSPECT);

      const fresh = after.unnamed.filter((c) => !before.unnamed.includes(c));
      for (const c of fresh) findings.push(`${state.name}: unnamed control ${c}`);

      for (const d of after.dialogs) {
        if (d.modal !== "true") findings.push(`${state.name}: dialog without aria-modal`);
        if (!d.labelled) findings.push(`${state.name}: dialog without a label`);
      }

      const opened = after.bare.length > before.bare.length || after.dialogs.length > 0;
      if (after.bare.length > before.bare.length) {
        findings.push(`${state.name}: full-screen overlay with no dialog semantics`);
      }

      if (opened) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(800);
        const post = await page.evaluate(INSPECT);
        const stillOpen =
          post.dialogs.length > 0 || post.bare.length > before.bare.length;
        if (stillOpen) findings.push(`${state.name}: Escape does not dismiss it`);
      }
    } catch (err) {
      findings.push(`${state.name}: could not be opened — ${String(err).slice(0, 60)}`);
    }
    await ctx.close();
  }

  return findings;
}
