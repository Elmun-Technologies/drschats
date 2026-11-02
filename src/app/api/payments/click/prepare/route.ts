import { NextResponse } from "next/server";
import { clickEndpoint } from "@/lib/payments/click-server";

export const dynamic = "force-dynamic";

/** Click SHOP API — Prepare URL, registered in merchant.click.uz → service settings. */
export async function POST(request: Request) {
  const body = await request.text();
  return NextResponse.json(await clickEndpoint("prepare", body.slice(0, 16_000)));
}
