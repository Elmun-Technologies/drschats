/**
 * True on the deployment real customers use (Vercel production, or a
 * self-hosted build started with GOVITA_PRODUCTION=1). Previews and local
 * `next start` are not live, so they can be exercised without real channels.
 */
export function isLiveDeployment(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.GOVITA_PRODUCTION === "1";
}
