import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { auditLog } from "@/lib/admin/audit";
import { t } from "@/lib/admin/i18n/server";
import { hitRateLimit } from "@/lib/rate-limit-store";
import { isAllowedImageUrl } from "@/lib/security/csp";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { MAX_IMAGE_BASE64, MAX_IMAGES, MAX_USER_TURNS, assistantModelOf, usageCostUsd } from "@/lib/assistant/config";
import { rejectedResult, runAgent, runApprovedAction, type Message } from "@/lib/assistant/agent";
import { createConversation, getConversation, saveConversation } from "@/lib/assistant/store";
import { chatView, userTurns } from "@/lib/assistant/view";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/*
  One chat step for /admin/assistant: a new message, or the admin's answer
  to a pending write. Same guard as the photo upload route — session cookie
  (SameSite=Strict), Origin must be this site — and every tool inside checks
  the admin's own permission again.
*/

const body = z.object({
  conversationId: z.number().int().positive().optional(),
  message: z.string().trim().max(4000).optional(),
  images: z
    .array(
      z.object({
        mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        data: z.string().min(1).max(MAX_IMAGE_BASE64).regex(/^[A-Za-z0-9+/=]+$/),
        url: z.string().url().max(500).optional(),
      }),
    )
    .max(MAX_IMAGES)
    .default([]),
  decision: z.enum(["approve", "reject"]).optional(),
});

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

const fail = (error: string, status = 400) => Response.json({ error }, { status });

function apiErrorMessage(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return t("Anthropic API kaliti notoʻgʻri yoki oʻchirilgan. Integratsiyalar sahifasida yangilang.");
  if (err instanceof Anthropic.RateLimitError) return t("Anthropic limiti tugadi — bir daqiqadan keyin qayta urinib koʻring yoki hisobdagi balansni tekshiring.");
  if (err instanceof Anthropic.BadRequestError) return t("Soʻrov qabul qilinmadi. Yangi suhbat boshlab koʻring.");
  if (err instanceof Anthropic.APIConnectionError) return t("Anthropic serveriga ulanib boʻlmadi. Birozdan keyin qayta urinib koʻring.");
  return t("Yordamchi javob bera olmadi. Qayta urinib koʻring.");
}

export async function POST(request: Request) {
  const admin = await requireAdmin("dashboard");
  if (!sameOrigin(request)) return fail(t("Soʻrov boshqa saytdan keldi."), 403);
  if (!(await hitRateLimit("assistant", String(admin.id), { limit: 40, windowMs: 10 * 60_000 }))) return fail(t("Juda koʻp soʻrov. Bir necha daqiqadan keyin davom eting."), 429);

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(t("Soʻrov notoʻgʻri."));
  const { conversationId, message, images, decision } = parsed.data;
  if (!decision && !message && images.length === 0) return fail(t("Xabar boʻsh."));
  if (images.some((i) => i.url && !isAllowedImageUrl(i.url))) return fail(t("Rasm manzili ruxsat etilmagan."));

  const settings = await getRuntimeIntegrationSettings();
  const apiKey = settings.assistant.apiKey;
  if (!apiKey) return fail(t("Anthropic API kaliti kiritilmagan. Integratsiyalar → «AI yordamchi» boʻlimida kiriting."));
  const model = assistantModelOf(settings.assistant.model);

  let conversation = conversationId ? await getConversation(admin.id, conversationId) : null;
  if (conversationId && !conversation) return fail(t("Suhbat topilmadi."), 404);

  const messages: Message[] = [...(conversation?.messages ?? [])];
  let pending = conversation?.pending ?? null;

  if (decision) {
    if (!conversation || !pending) return fail(t("Tasdiqlanadigan amal yoʻq."));
    const result = decision === "approve" ? await runApprovedAction(pending, admin) : rejectedResult(pending);
    messages.push({ role: "user", content: [result] });
    await auditLog(admin, decision === "approve" ? "assistant.approve" : "assistant.reject", pending.name, { ok: !result.is_error });
    pending = null;
  } else {
    if (conversation && userTurns(messages) >= MAX_USER_TURNS) return fail(t("Suhbat juda uzun. Yangi suhbat boshlang — bu arzonroq va tezroq."));
    const content: Anthropic.ContentBlockParam[] = [];
    // A new message while a write waits counts as «no»: the tool call must be answered before anything else.
    if (pending) content.push(rejectedResult(pending));
    pending = null;
    for (const img of images) content.push({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.data } });
    const urls = images.map((i) => i.url).filter(Boolean);
    const note = images.length === 0 ? "" : urls.length > 0 ? `\n[Rasm URL: ${urls.join(", ")}]` : "\n[Rasm saqlanmadi — mahsulot rasmi sifatida ishlatib boʻlmaydi]";
    content.push({ type: "text", text: `${message || t("(rasm)")}${note}` });
    messages.push({ role: "user", content });
    conversation ??= await createConversation(admin.id, message || t("Rasm bilan suhbat"), model);
  }

  try {
    const result = await runAgent({ apiKey, model, admin, messages });
    await saveConversation(admin.id, conversation.id, result.messages, result.pending, result.usage, model);
    return Response.json({
      conversationId: conversation.id,
      items: chatView(result.messages),
      pending: result.pending ? { name: result.pending.name, preview: result.pending.preview } : null,
      note:
        result.stopNote === "refusal"
          ? t("Model bu soʻrovga javob bermadi. Boshqacha soʻrab koʻring.")
          : result.stopNote === "max_steps"
            ? t("Juda koʻp qadam ketdi — natijani tekshiring va kerak boʻlsa davom ettirishni soʻrang.")
            : result.stopNote === "max_tokens"
              ? t("Javob uzun boʻlib kesildi. Qisqaroq soʻrang.")
              : null,
      costUsd: usageCostUsd(model, result.usage),
    });
  } catch (err) {
    console.error("[assistant] turn failed:", (err as Error).name, (err as Error).message);
    // The approved action already ran: keep its result so the history stays valid for the next message.
    if (decision) await saveConversation(admin.id, conversation.id, messages, null, { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, model);
    return fail(apiErrorMessage(err), 502);
  }
}
