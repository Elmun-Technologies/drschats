import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return Response.json({ message: "Invalid secret" }, { status: 401 });
    }
    revalidateTag("sanity");
    return Response.json({ revalidated: true, at: new Date().toISOString() });
  } catch {
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }
}
