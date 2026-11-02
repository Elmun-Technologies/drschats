import { NextResponse } from "next/server";
import { paymeEndpoint } from "@/lib/payments/payme-server";

export const dynamic = "force-dynamic";

/*
  Payme Merchant API endpoint — register this URL in Payme Business
  (Kassa → Settings → endpoint). Always HTTP 200: Payme reads the JSON-RPC
  `error`, not the status code.
*/
export async function POST(request: Request) {
  const body = await request.text();
  const response = await paymeEndpoint(body.slice(0, 64_000), request.headers.get("authorization"));
  return NextResponse.json(response, { status: 200 });
}
