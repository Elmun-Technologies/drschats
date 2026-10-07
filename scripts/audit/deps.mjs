import { execFileSync } from "node:child_process";

/*
  Dependency audit, with an honest baseline.

  `npm audit --audit-level=high` cannot go in CI as it stands: it would fail on
  the first run and stay failing, and a check that is always red teaches
  everyone to ignore it. But no check at all is how a critical framework
  advisory sat unpatched here in the first place.

  So this separates the two things an audit result actually contains:

  1. Advisories that can be fixed now. Any high or critical among these fails
     the build. There is no excuse and no list to hide behind.
  2. Advisories whose only fix is a major upgrade of a package this app runs
     on. Those are listed below with the reason and the upgrade that closes
     them, and they are allowed — for now.

  The baseline ratchets in one direction only. An entry that stops appearing
  in the audit is a failure too, because that means the upgrade happened (or
  the package left the tree) and the entry is now dead weight that would let a
  *new* advisory through under an old name. Baselines rot by accretion; this
  is what stops it.
*/

const SEVERITIES = new Set(["high", "critical"]);

/**
 * Package name -> why it is tolerated and what closes it.
 *
 * Everything here traces to one decision: `sanity` 3.x pulls in the Sanity CLI
 * and its deploy toolchain (`@sanity/runtime-cli` -> `@architect/*` -> `adm-zip`
 * / `decompress`), and the only published fix is `sanity` 6.x. That is a major
 * CMS migration, not a patch, and it is not something to attempt blind on the
 * way out the door.
 *
 * These are build and administration tools. They do not run in the served
 * storefront: `next-sanity` is the runtime dependency (it provides
 * `createClient` and `groq` for src/sanity/), while the CLI chain exists so
 * `sanity deploy` works from a terminal. That is the reason this is tolerable
 * at all rather than merely unfixed.
 */
const BASELINE = new Map(
  Object.entries({
    sanity: "only fix is sanity@6 — major CMS migration; see docs/QOLGAN-ISHLAR.md",
    "next-sanity": "only fix is next-sanity@13 — major; tracked with the sanity@6 migration",
    "@sanity/cli": "Sanity CLI, build/admin only — closed by sanity@6",
    "@sanity/codegen": "Sanity CLI chain, build/admin only — closed by sanity@6",
    "@sanity/runtime-cli": "Sanity CLI chain, build/admin only — closed by sanity@6",
    "@architect/hydrate": "pulled in by @sanity/runtime-cli — closed by sanity@6",
    "@architect/inventory": "pulled in by @sanity/runtime-cli — closed by sanity@6",
    "@architect/utils": "pulled in by @sanity/runtime-cli — closed by sanity@6",
    "adm-zip": "pulled in by the Sanity CLI chain — closed by sanity@6",
    decompress: "pulled in by the Sanity CLI chain — closed by sanity@6",
    braces: "pulled in by the Sanity CLI chain — closed by sanity@6",
    chokidar: "pulled in by the Sanity CLI chain — closed by sanity@6",
    "fast-glob": "pulled in by the Sanity CLI chain — closed by sanity@6",
    "find-yarn-workspace-root2": "pulled in by the Sanity CLI chain — closed by sanity@6",
    glob: "pulled in by the Sanity CLI chain — closed by sanity@6",
    globby: "pulled in by the Sanity CLI chain — closed by sanity@6",
    micromatch: "pulled in by the Sanity CLI chain — closed by sanity@6",
    "preferred-pm": "pulled in by the Sanity CLI chain — closed by sanity@6",
    postcss: "only fix is next@16 — major framework upgrade",
  }),
);

function readAudit() {
  const out = execFileSync("npm", ["audit", "--omit=dev", "--json"], {
    encoding: "utf8",
    // npm exits 1 when it finds anything, which is the normal case here.
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
  });
  return JSON.parse(out);
}

let audit;
try {
  audit = readAudit();
} catch (err) {
  // execFileSync throws on a non-zero exit; npm audit exits non-zero when it
  // reports vulnerabilities, so the payload is on the error object.
  if (!err.stdout) {
    console.error("npm audit could not run:", err.message);
    process.exit(1);
  }
  audit = JSON.parse(err.stdout);
}

const vulns = audit.vulnerabilities ?? {};
const found = Object.entries(vulns).filter(([, v]) => SEVERITIES.has(v.severity));

const actionable = [];
const baselined = [];
for (const [name, v] of found) {
  if (BASELINE.has(name)) baselined.push([name, v.severity]);
  else actionable.push([name, v.severity]);
}

const reported = new Set(Object.keys(vulns));
const stale = [...BASELINE.keys()].filter((name) => !reported.has(name));

console.log(`dependency audit (production tree)\n`);
console.log(`  high/critical found : ${found.length}`);
console.log(`  actionable          : ${actionable.length}`);
console.log(`  baselined           : ${baselined.length}`);
console.log(`  stale baseline rows : ${stale.length}\n`);

let ok = true;

if (actionable.length > 0) {
  ok = false;
  console.log("FAIL — fixable now, not on the baseline:");
  for (const [name, severity] of actionable.sort()) {
    const fix = vulns[name].fixAvailable;
    const how =
      fix === true
        ? "npm audit fix"
        : fix && typeof fix === "object"
          ? `${fix.name}@${fix.version}${fix.isSemVerMajor ? " (major)" : ""}`
          : "no published fix";
    console.log(`  ${severity.padEnd(8)} ${name.padEnd(30)} ${how}`);
  }
  console.log("");
}

if (stale.length > 0) {
  ok = false;
  console.log("FAIL — baseline entries no longer reported by npm audit:");
  console.log("       the upgrade landed or the package left the tree. Delete the row,");
  console.log("       otherwise a new advisory hides behind an old name.");
  for (const name of stale.sort()) console.log(`  ${name}`);
  console.log("");
}

if (baselined.length > 0) {
  console.log(`tolerated (${baselined.length}) — major upgrade required, tracked, not ignored:`);
  for (const [name, severity] of baselined.sort()) {
    console.log(`  ${severity.padEnd(8)} ${name.padEnd(30)} ${BASELINE.get(name)}`);
  }
  console.log("");
}

const counts = audit.metadata?.vulnerabilities ?? {};
console.log(
  ok
    ? `clean — nothing actionable (moderate/low not gated: ${counts.moderate ?? 0} moderate, ${counts.low ?? 0} low)`
    : "FAILURES ABOVE",
);

process.exit(ok ? 0 : 1);
