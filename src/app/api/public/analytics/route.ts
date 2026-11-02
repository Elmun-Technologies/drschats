import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";

export const dynamic = "force-dynamic";

/*
  The public analytics IDs the browser loads its tags with. Every page view
  asks, so the answer is cached: in the server (the settings tag, dropped
  when /admin/integrations saves) and in the browser for a minute. Only public
  vendor IDs leave the server.
*/
const readPublicIds = unstable_cache(
  async () => {
    const { analytics, webvisor } = await getRuntimeIntegrationSettings();
    return { ...analytics, webvisor };
  },
  ["public-analytics-v1"],
  { tags: [SITE_SETTINGS_TAG], revalidate: 300 },
);

export async function GET() {
  return NextResponse.json(await readPublicIds(), {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
