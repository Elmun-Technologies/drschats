import { launch, LOCALES, report } from "./lib.mjs";
import * as a11y from "./checks/a11y.mjs";
import * as contrast from "./checks/contrast.mjs";
import * as targetSize from "./checks/target-size.mjs";
import * as clipped from "./checks/clipped.mjs";
import * as states from "./checks/states.mjs";

/*
  The quality bar, as something that runs.

  CLAUDE.md claims a table of zeros. That claim is only worth anything if
  something re-checks it, so this is what does — and why it exits non-zero
  rather than printing a summary nobody reads.

  Usage:  BASE_URL=http://localhost:3000 npm run audit
  The server must already be serving a production build; a dev build measures
  different CSS and different timing.
*/

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
process.env.BASE_URL = BASE_URL;

// Overlay states are locale-independent in structure, so checking them once
// keeps CI honest without tripling its runtime.
const PER_LOCALE = [
  ["accessible names, alt text, heading order, overflow", a11y],
  ["colour contrast", contrast],
  ["target size (WCAG 2.2 spacing exception applied)", targetSize],
  ["text clipped inside its own box", clipped],
];

const ONCE = [["overlays: names, dialog semantics, Escape", states]];

const started = Date.now();
console.log(`auditing ${BASE_URL}\n`);

const browser = await launch();
let ok = true;

for (const locale of LOCALES) {
  console.log(`── ${locale} ──`);
  for (const [name, check] of PER_LOCALE) {
    const findings = await check.run(browser, locale);
    ok = report(name, findings) && ok;
  }
  console.log("");
}

console.log("── interactive states ──");
for (const [name, check] of ONCE) {
  const findings = await check.run(browser, LOCALES[0]);
  ok = report(name, findings) && ok;
}

await browser.close();

const seconds = Math.round((Date.now() - started) / 1000);
console.log(`\n${ok ? "clean" : "FAILURES ABOVE"} — ${seconds}s`);
process.exit(ok ? 0 : 1);
