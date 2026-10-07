import { cspMode } from "@/lib/security/csp";

/**
 * Runs once when the server process starts.
 *
 * Its only job is to close a gap that is otherwise invisible. The
 * Content-Security-Policy is built in next.config.ts, which Next resolves at
 * **build** time and bakes into the routes manifest — so the mode in force is
 * the mode that was set when the build ran, not the one in the environment the
 * server was started with. `CSP_BUILD_MODE` carries the build-time value into
 * the bundle; this compares it against the live `CSP_MODE` and speaks up when
 * they differ.
 *
 * Why that matters more than a log line usually does: setting a variable that
 * silently does nothing is the failure mode this codebase deliberately avoids
 * everywhere else. `main.py` refuses to boot on a placeholder secret, the
 * storefront 404s rather than serving a demo cabinet, and the dependency audit
 * fails when its baseline goes stale. A CSP toggle that appears to work and
 * does not would be the one exception, and the dangerous direction — a build
 * that *enforces* while the operator believes it is only reporting — can take
 * analytics or a checkout integration down with nothing in the logs to explain
 * it.
 *
 * In this repository's deployment the two always agree: the storefront is on
 * Vercel, which rebuilds every deploy, and docker-compose.yml holds only
 * postgres, redis, meilisearch and the FastAPI backend — no storefront image.
 * The check exists for whoever self-hosts `next start` or adds one later, where
 * "change CSP_MODE and restart" is the obvious thing to try and would silently
 * do nothing.
 */
export async function register() {
  // register() is called for every runtime the app is compiled into. The
  // comparison belongs to the Node server process, which is the one that reads
  // the environment it was started with.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const built = process.env.CSP_BUILD_MODE;
  const runtime = cspMode(process.env.CSP_MODE);

  if (!built) {
    // Not stamped, so this build predates the check. Say nothing rather than
    // guess: a warning that cannot be trusted is worse than none.
    return;
  }

  if (built === "off") {
    if (runtime !== "off") {
      console.warn(
        `[csp] This build was made with CSP off and serves no Content-Security-Policy header. ` +
          `CSP_MODE is "${runtime}" at runtime, which has no effect — the policy is chosen at build time. Rebuild with CSP_MODE=${runtime} to change it.`,
      );
    }
    return;
  }

  if (built === runtime) {
    console.log(`[csp] ${built === "enforce" ? "enforcing" : "report-only"} (build-time mode, as expected)`);
    return;
  }

  // The two directions are not equally bad, so they do not get the same message.
  const detail =
    built === "enforce"
      ? `This build BLOCKS violations. Anything the policy does not allow is already being refused for real visitors.`
      : `This build only REPORTS violations; nothing is blocked yet.`;

  console.warn(
    `[csp] CSP_MODE at runtime is "${runtime}" but this build was made with CSP_MODE="${built}", and the build-time value is the one in force. ${detail} ` +
      `The policy is baked in at build time — set CSP_MODE before building, then rebuild.`,
  );
}
