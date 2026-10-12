import { isDbConfigured } from "@/lib/db/client";
import { isBotCaller } from "@/lib/bot/auth";
import { handleBotApi } from "@/lib/bot/api";

/*
  Server-to-server API for the club bot (src/lib/bot/api.ts). Closed unless
  BOT_API_KEY (≥ 32 chars) and the database are configured.
*/

export const dynamic = "force-dynamic";

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (!isDbConfigured || !isBotCaller(req.headers.get("authorization"))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { path } = await ctx.params;
  let body: unknown = undefined;
  if (req.method !== "GET") {
    try {
      body = await req.json();
    } catch {
      body = undefined;
    }
  }
  try {
    const res = await handleBotApi(req.method, path, body, new URL(req.url).searchParams);
    return Response.json(res.body, { status: res.status, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[bot-api]", req.method, path[0], (err as Error).message);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}

export { handle as GET, handle as POST, handle as PATCH };
