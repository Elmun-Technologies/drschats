"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { getEmailConfig } from "@/lib/email/config";
import { isIntegrationEncryptionConfigured } from "@/lib/integrations/crypto";
import { getRuntimeIntegrationSettings, saveIntegrationSettings, type IntegrationSettingUpdates } from "@/lib/integrations/settings";
import { SITE_SETTINGS_TAG, savePublicSettings, verificationCode } from "@/lib/integrations/site-settings";
import type { FormState } from "./catalog";

function formString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const botToken = z.string().trim().max(256).regex(/^$|^\d{5,}:[A-Za-z0-9_-]{20,}$/, "Telegram bot token formati notoʻgʻri.");
const chatId = z.string().trim().max(40).regex(/^$|-?\d{3,20}$/, "Chat ID raqamli Telegram ID boʻlishi kerak.");

const operatorSchema = z.object({
  botToken,
  chatId,
  clearBotToken: z.boolean(),
  clearChatId: z.boolean(),
}).superRefine((value, context) => {
  if (value.clearBotToken && value.botToken) context.addIssue({ code: "custom", message: "Tokenni kiriting yoki oʻchirishni tanlang — ikkalasini birga emas.", path: ["botToken"] });
  if (value.clearChatId && value.chatId) context.addIssue({ code: "custom", message: "Chat IDni kiriting yoki oʻchirishni tanlang — ikkalasini birga emas.", path: ["chatId"] });
});

function validSender(value: string): boolean {
  const match = value.match(/^(.+?)\s*<([^<>]+)>$/);
  const address = match ? match[2] : value;
  if (match && (!match[1].trim() || /[<>]/.test(match[1]))) return false;
  return z.string().email().safeParse(address).success;
}

const sender = z.string().trim().max(180).refine((value) => !value || validSender(value), "Yuboruvchi emaili yoki Ism <email> formatini kiriting.");
const replyTo = z.string().trim().max(254).refine((value) => !value || z.string().email().safeParse(value).success, "Javob emaili notoʻgʻri.");
const resendKey = z.string().trim().max(256).regex(/^$|^re_[A-Za-z0-9_-]{10,}$/, "Resend API kaliti re_ bilan boshlanishi kerak.");
const analyticsSchema = z.object({
  gtm: z.string().trim().max(40).regex(/^$|^GTM-[A-Z0-9]+$/i, "GTM ID GTM- bilan boshlansin."),
  ga4: z.string().trim().max(40).regex(/^$|^G-[A-Z0-9]+$/i, "GA4 ID G- bilan boshlansin."),
  metaPixel: z.string().trim().max(20).regex(/^$|^\d{5,20}$/, "Meta Pixel ID faqat raqamlardan iborat."),
  yandexMetrika: z.string().trim().max(20).regex(/^$|^\d{1,20}$/, "Yandex Metrika ID faqat raqamlardan iborat."),
});

const emailSchema = z.object({
  apiKey: resendKey,
  from: sender,
  replyTo,
  clearApiKey: z.boolean(),
  clearFrom: z.boolean(),
  clearReplyTo: z.boolean(),
}).superRefine((value, context) => {
  if (value.clearApiKey && value.apiKey) context.addIssue({ code: "custom", message: "API kalitini kiriting yoki oʻchirishni tanlang — ikkalasini birga emas.", path: ["apiKey"] });
  if (value.clearFrom && value.from) context.addIssue({ code: "custom", message: "Yuboruvchi manzilini kiriting yoki oʻchirishni tanlang — ikkalasini birga emas.", path: ["from"] });
  if (value.clearReplyTo && value.replyTo) context.addIssue({ code: "custom", message: "Javob manzilini kiriting yoki oʻchirishni tanlang — ikkalasini birga emas.", path: ["replyTo"] });
});

function saveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("INTEGRATION_ENCRYPTION_KEY")) {
    return "Deploy sozlamalarida INTEGRATION_ENCRYPTION_KEY ni 64 ta hex belgili maxfiy qiymat bilan sozlang.";
  }
  if (message.includes("DATABASE_URL")) return "Admin bazasi sozlanmagan.";
  return "Saqlab boʻlmadi. Database migratsiyasini tekshiring va qayta urinib koʻring.";
}

function integrationSettingsError(): FormState | null {
  if (!isIntegrationEncryptionConfigured()) {
    return { error: "Avval deploy sozlamalarida INTEGRATION_ENCRYPTION_KEY ni 64 ta hex belgili maxfiy qiymat bilan sozlang." };
  }
  return null;
}

export async function saveAnalyticsIntegration(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  if (process.env.NODE_ENV === "production" && process.env.ANALYTICS_CSP_BUILD_ENABLED !== "on") {
    return { error: "Bu build analitika hostlarini CSPʼda ochmagan. Deployʼda ADMIN_ANALYTICS_CSP=on bilan qayta build qiling (fly.tomlʼda allaqachon yoqilgan — keyingi deployʼdan keyin ishlaydi)." };
  }
  const parsed = analyticsSchema.safeParse({
    gtm: formString(form, "gtm"),
    ga4: formString(form, "ga4"),
    metaPixel: formString(form, "metaPixel"),
    yandexMetrika: formString(form, "yandexMetrika"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Analitika IDʼlarini tekshiring." };

  try {
    await savePublicSettings(
      {
        "analytics.gtmId": parsed.data.gtm.toUpperCase() || null,
        "analytics.ga4Id": parsed.data.ga4.toUpperCase() || null,
        "analytics.metaPixelId": parsed.data.metaPixel || null,
        "analytics.yandexMetrikaId": parsed.data.yandexMetrika || null,
        "analytics.webvisor": form.get("webvisor") === "on" ? "on" : "off",
      },
      admin.id,
    );
    // Older builds kept these encrypted; clear them so one place holds the truth.
    if (isIntegrationEncryptionConfigured()) {
      await saveIntegrationSettings({ "analytics.gtmId": null, "analytics.ga4Id": null, "analytics.metaPixelId": null, "analytics.yandexMetrikaId": null }, admin.id).catch(() => {});
    }
  } catch {
    return { error: "Saqlab boʻlmadi. Bazada 0006 migratsiyasi qoʻllanganini tekshiring." };
  }
  revalidateTag(SITE_SETTINGS_TAG);
  revalidatePath("/admin/integrations");
  return { ok: "Saqlandi. Saytning keyingi sahifa yuklanishlari yangi teglar bilan ishlaydi." };
}

const verificationSchema = z.object({ google: z.string().max(400), yandex: z.string().max(400), bing: z.string().max(400) });

export async function saveVerificationCodes(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = verificationSchema.safeParse({ google: formString(form, "google"), yandex: formString(form, "yandex"), bing: formString(form, "bing") });
  if (!parsed.success) return { error: "Kodlar juda uzun." };
  const codes = { google: verificationCode(parsed.data.google), yandex: verificationCode(parsed.data.yandex), bing: verificationCode(parsed.data.bing) };
  for (const key of ["google", "yandex", "bing"] as const) {
    if (parsed.data[key] && !codes[key]) return { error: `${key === "google" ? "Google" : key === "yandex" ? "Yandex" : "Bing"} kodi notoʻgʻri. Meta tegni toʻliq yoki faqat content="…" qiymatini joylang.` };
  }
  try {
    await savePublicSettings({ "verify.google": codes.google || null, "verify.yandex": codes.yandex || null, "verify.bing": codes.bing || null }, admin.id);
  } catch {
    return { error: "Saqlab boʻlmadi. Bazada 0006 migratsiyasi qoʻllanganini tekshiring." };
  }
  revalidateTag(SITE_SETTINGS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/integrations");
  return { ok: "Saqlandi. Tasdiqlash meta-tegi saytning barcha sahifalarida chiqadi — endi Search Console / Webmasterʼda «Tasdiqlash» tugmasini bosing." };
}

export async function saveOperatorIntegration(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = operatorSchema.safeParse({
    botToken: formString(form, "botToken"),
    chatId: formString(form, "chatId"),
    clearBotToken: form.get("clearBotToken") === "on",
    clearChatId: form.get("clearChatId") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Telegram sozlamalarini tekshiring." };
  const unavailable = integrationSettingsError();
  if (unavailable) return unavailable;

  const updates: IntegrationSettingUpdates = {};
  if (parsed.data.clearBotToken) updates["operator.botToken"] = null;
  else if (parsed.data.botToken) updates["operator.botToken"] = parsed.data.botToken;
  if (parsed.data.clearChatId) updates["operator.chatId"] = null;
  else if (parsed.data.chatId) updates["operator.chatId"] = parsed.data.chatId;
  if (Object.keys(updates).length === 0) return { error: "Saqlash uchun qiymat kiriting yoki oʻchirish belgisini tanlang." };

  try {
    await saveIntegrationSettings(updates, admin.id);
  } catch (error) {
    return { error: saveErrorMessage(error) };
  }
  revalidatePath("/admin/integrations");
  revalidatePath("/admin/marketing");
  return { ok: "Telegram operator sozlamalari saqlandi. Yangi xabarlar shu konfiguratsiyadan foydalanadi." };
}

export async function saveEmailIntegration(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = emailSchema.safeParse({
    apiKey: formString(form, "apiKey"),
    from: formString(form, "from"),
    replyTo: formString(form, "replyTo"),
    clearApiKey: form.get("clearApiKey") === "on",
    clearFrom: form.get("clearFrom") === "on",
    clearReplyTo: form.get("clearReplyTo") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Email sozlamalarini tekshiring." };
  const unavailable = integrationSettingsError();
  if (unavailable) return unavailable;

  const updates: IntegrationSettingUpdates = {};
  if (parsed.data.clearApiKey) updates["email.apiKey"] = null;
  else if (parsed.data.apiKey) updates["email.apiKey"] = parsed.data.apiKey;
  if (parsed.data.clearFrom) updates["email.from"] = null;
  else if (parsed.data.from) updates["email.from"] = parsed.data.from;
  if (parsed.data.clearReplyTo) updates["email.replyTo"] = null;
  else if (parsed.data.replyTo) updates["email.replyTo"] = parsed.data.replyTo;
  if (Object.keys(updates).length === 0) return { error: "Saqlash uchun qiymat kiriting yoki oʻchirish belgisini tanlang." };

  try {
    await saveIntegrationSettings(updates, admin.id);
  } catch (error) {
    return { error: saveErrorMessage(error) };
  }
  revalidatePath("/admin/integrations");
  revalidatePath("/admin/marketing");
  return { ok: "Email sozlamalari saqlandi. Yangi xatlar ushbu server konfiguratsiyasidan foydalanadi." };
}

/** Validates both the bot token and that the bot can resolve the operator chat. */
export async function testOperatorTelegramConnection(_: FormState, _form: FormData): Promise<FormState> {
  await requireAdmin();
  const { operatorBotToken: token, operatorChatId: chatId } = await getRuntimeIntegrationSettings();
  if (!token || !chatId) return { error: "Avval Telegram bot tokeni va operator chat IDʼni saqlang." };

  try {
    const botResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`, { signal: AbortSignal.timeout(5000) });
    const bot = await botResponse.json().catch(() => null) as { ok?: boolean; result?: { username?: string } } | null;
    if (!botResponse.ok || !bot?.ok) return { error: "Telegram bot tokeni qabul qilinmadi. Tokenni tekshirib qayta saqlang." };

    const chatResponse = await fetch(`https://api.telegram.org/bot${token}/getChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId }),
      signal: AbortSignal.timeout(5000),
    });
    const chat = await chatResponse.json().catch(() => null) as { ok?: boolean } | null;
    if (!chatResponse.ok || !chat?.ok) return { error: "Bot tokeni toʻgʻri, ammo Telegram shu chat IDʼni topmadi yoki bot chatni koʻra olmaydi." };
    const botName = bot.result?.username ? `@${bot.result.username}` : "bot";
    return { ok: `${botName} va operator chat Telegramʼda topildi. Bu tekshiruv xabar yuborish ruxsatini sinamaydi.` };
  } catch {
    return { error: "Telegram API bilan bogʻlanib boʻlmadi; token oshkor qilinmadi. Keyinroq qayta urinib koʻring." };
  }
}

const testEmailSchema = z.string().trim().email("Test uchun toʻgʻri email manzilini kiriting.").max(254);

/** Sends one explicit, non-marketing test message to the recipient entered by the admin. */
export async function sendResendTestEmail(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsedRecipient = testEmailSchema.safeParse(formString(form, "testRecipient"));
  if (!parsedRecipient.success) return { error: parsedRecipient.error.issues[0]?.message ?? "Email manzilini tekshiring." };

  const email = await getEmailConfig();
  if (!email.apiKey) return { error: "Resend API key sozlanmagan. Avval uni saqlang." };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${email.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: email.from,
        to: [parsedRecipient.data],
        reply_to: email.replyTo,
        subject: "Go Vita admin — test xabari",
        text: "Bu Go Vita admin panelidan yuborilgan test xabari. Marketing yoki reklama mazmuni yoʻq.",
        html: "<p>Bu Go Vita admin panelidan yuborilgan test xabari.</p><p>Marketing yoki reklama mazmuni yoʻq.</p>",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      if (response.status === 401) return { error: "Resend API key qabul qilinmadi. Kalitni tekshiring." };
      if (response.status === 403 || response.status === 422) return { error: "Resend soʻrovni rad etdi. From domeni tasdiqlangani va sender sozlamalarini tekshiring." };
      return { error: `Resend test xatini qabul qilmadi (HTTP ${response.status}).` };
    }
    const result = await response.json().catch(() => null) as { id?: string } | null;
    return { ok: `Resend test soʻrovini qabul qildi${result?.id ? ` (${result.id})` : ""}. Xat inboxga yetganini qabul qiluvchi manzilda tekshiring.` };
  } catch {
    return { error: "Resend API bilan bogʻlanib boʻlmadi. Keyinroq qayta urinib koʻring." };
  }
}
