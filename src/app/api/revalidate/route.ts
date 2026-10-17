import { revalidateTag } from "next/cache";
import { matchesSecret } from "@/lib/security/safe-equal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!matchesSecret(body?.secret, process.env.SANITY_REVALIDATE_SECRET)) {
      return Response.json({ message: "Invalid secret" }, { status: 401 });
    }
    revalidateTag("sanity");
    return Response.json({ revalidated: true, at: new Date().toISOString() });
  } catch {
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }
}
