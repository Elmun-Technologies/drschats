import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { internalTokenMatches } from "@/lib/ops/revalidate";

export const dynamic = "force-dynamic";

/*
  The worker's way to invalidate the page cache (lib/ops/revalidate.ts).
  Only this process knows the token, so the route answers 404 to anyone else.
*/
const schema = z.object({
  tags: z.array(z.string().min(1).max(64)).max(10).optional(),
  paths: z.array(z.tuple([z.string().startsWith("/").max(200), z.enum(["layout", "page"])])).max(10).optional(),
});

export async function POST(request: Request) {
  if (!internalTokenMatches(request.headers.get("x-internal-token"))) return new Response(null, { status: 404 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  for (const tag of parsed.data.tags ?? []) revalidateTag(tag);
  for (const [path, type] of parsed.data.paths ?? []) revalidatePath(path, type);
  return Response.json({ ok: true });
}
