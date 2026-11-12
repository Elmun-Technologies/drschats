import { NextResponse, after } from "next/server";
import { clickEndpoint } from "@/lib/payments/click-server";
import { submitClickFiscalFor } from "@/lib/payments/click-fiscal-server";

export const dynamic = "force-dynamic";

/** Click SHOP API — Complete URL, registered in merchant.click.uz → service settings. */
export async function POST(request: Request) {
  const body = await request.text();
  const answer = await clickEndpoint("complete", body.slice(0, 16_000));
  // A performed payment owes Click its fiscal receipt; sent once the answer is out,
  // and again by the worker until Click accepts it.
  if (answer.error === 0 && answer.merchant_trans_id) {
    const order = String(answer.merchant_trans_id);
    after(() => submitClickFiscalFor(order).catch((err: Error) => console.error("[click] fiscal receipt failed:", err.message)));
  }
  return NextResponse.json(answer);
}
