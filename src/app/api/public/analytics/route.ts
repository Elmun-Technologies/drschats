import { NextResponse } from "next/server";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Only public vendor IDs are returned; secrets and server settings never leave the server. */
export async function GET() {
  const { analytics, webvisor } = await getRuntimeIntegrationSettings();
  return NextResponse.json({ ...analytics, webvisor }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
