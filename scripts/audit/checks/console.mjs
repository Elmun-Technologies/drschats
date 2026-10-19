import { context, DESKTOP, routesFor } from "../lib.mjs";

/*
  What the browser says while the page loads.

  Every other check here measures the DOM, and a hydration mismatch often
  leaves the DOM looking exactly right: React throws away the server HTML and
  re-renders on the client, so the page "works" and only the console knows.
  #418/#423/#425 were chased by hand once; this is the check that keeps them
  from coming back.

  Two passes, because they answer different questions and cost different time:
  - hydration, on every route the a11y check visits, waiting only for the
    markup to arrive — the mismatch happens within the first frames;
  - every console error and uncaught exception, on the pages whose client
    components own clocks, carts and forms, after the network settles.

  One message is filtered, deliberately: Chromium objects that
  `upgrade-insecure-requests` is ignored inside a Report-Only policy. It is a
  statement about the header mode, not about a page, and it fires on every
  route; the day CSP_MODE=enforce it disappears. Filtering it by exact text
  keeps every other error visible.
*/

const CSP_REPORT_ONLY_NOISE = "The Content Security Policy directive 'upgrade-insecure-requests' is ignored when delivered in a report-only policy.";

const HYDRATION = [
  /Minified React error #(418|423|425)/,
  /Hydration failed/i,
  /Text content does not match/i,
  /server rendered HTML/i,
  /did not match\. Server:/i,
];

/** Exported so the matcher itself can be unit-tested (it is the whole check's judgement). */
export const hydrationFinding = (text) => HYDRATION.some((re) => re.test(text));

/** The one message the browser emits about our own header mode, not about a page. */
export const isReportOnlyNoise = (text) => text === CSP_REPORT_ONLY_NOISE;

/** Pages with a clock, a persisted store or a form: the ones a mismatch starts on. */
const INTERACTIVE = [
  "",
  "/product/swiss-energy-immunovit-30",
  "/sale",
  "/cart",
  "/checkout",
  "/search?q=vitamin",
  "/loyalty",
];

async function visit(browser, url, { waitUntil, settleMs }) {
  const ctx = await context(browser, DESKTOP);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(`uncaught: ${String(error)}`));
  try {
    await page.goto(url, { waitUntil });
    await page.waitForTimeout(settleMs);
  } catch (error) {
    errors.push(`navigation: ${String(error).slice(0, 160)}`);
  }
  await ctx.close();
  return errors;
}

export async function run(browser, locale) {
  const findings = [];

  for (const path of routesFor(locale)) {
    const errors = await visit(browser, `${process.env.BASE_URL}${path}`, { waitUntil: "domcontentloaded", settleMs: 900 });
    for (const text of errors.filter(hydrationFinding)) findings.push({ path, kind: "hydration", text: text.slice(0, 180) });
  }

  for (const path of INTERACTIVE) {
    const errors = await visit(browser, `${process.env.BASE_URL}/${locale}${path}`, { waitUntil: "networkidle", settleMs: 1200 });
    for (const text of errors) {
      if (isReportOnlyNoise(text) || hydrationFinding(text)) continue;
      findings.push({ path, kind: "console", text: text.slice(0, 180) });
    }
  }

  return findings;
}
