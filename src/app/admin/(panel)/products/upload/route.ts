import { requireAdmin } from "@/lib/admin/session";
import { auditLog } from "@/lib/admin/audit";
import { MAX_UPLOAD_BYTES, isStorageConfigured, uploadImage } from "@/lib/admin/storage";

export const dynamic = "force-dynamic";

/*
  Product photo upload. A route handler, not a server action, so the 5 MB
  body is accepted here alone and every server action keeps Next's 1 MB
  limit (next.config.ts) — a big body to any action was a cheap way to make
  the server buffer megabytes before the action could even check the session.

  The session cookie is SameSite=Strict and the Origin must be this site, so
  another site cannot post here with an admin's browser.
*/
const MAX_BODY = MAX_UPLOAD_BYTES + 64 * 1024;

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin("catalog");
  if (!sameOrigin(request)) return Response.json({ error: "Soʻrov boshqa saytdan keldi." }, { status: 403 });
  if (!isStorageConfigured) return Response.json({ error: "Rasm saqlash (Tigris) sozlanmagan — URL manzilini qoʻlda kiriting." }, { status: 400 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return Response.json({ error: "Fayl 5 MB dan katta." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return Response.json({ error: "Fayl tanlanmagan." }, { status: 400 });
  try {
    const url = await uploadImage(file, "products");
    await auditLog(admin, "product.image_upload", null, { bytes: file.size });
    return Response.json({ ok: "Yuklandi.", url });
  } catch (err) {
    const code = (err as Error).message;
    const error = code === "too-large" ? "Fayl 5 MB dan katta." : code === "unsupported-type" ? "Faqat JPG, PNG, WebP yoki AVIF." : "Yuklab boʻlmadi.";
    return Response.json({ error }, { status: 400 });
  }
}
