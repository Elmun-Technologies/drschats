import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { locales, type Locale } from "@/lib/i18n/routing";
import { siteOrigin } from "@/lib/email/config";
import { sendCampaign } from "@/lib/email/send";
import { buildCampaign, type Campaign } from "@/lib/email/campaigns";
import { fetchDueMessages, isMarketingApiConfigured, markMessagesSent, type DueMessage } from "@/lib/marketing/api";
import { notifyCustomer, notifyOperator } from "@/lib/notifications/operator";

/*
  The daily send.

  Two halves, deliberately split. The backend owns the *decision* — it holds
  the birthdays, the household, the subscriptions and the log of what has
  already gone out, so it is the only place that can answer "who is due
  something today, and have they already had it". This route owns the
  *delivery* — it holds the templates, the provider key and the Telegram
  token, and it is deployed.

  So the cron pulls a queue, sends it, and reports back. Nothing is decided
  here; nothing is stored here. A message that fails is reported as failed and
  the backend offers it again tomorrow rather than losing it.

  Schedule it with Vercel Cron (vercel.json) once a day. Running it more often
  is harmless — the reminder ids are stable per occurrence, and the backend
  will not hand out the same one twice.
*/

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Cap per run: a cron that cannot finish inside its function timeout is a cron that half-sends. */
const BATCH = 50;

const dueSchema = z.object({
  reminderId: z.string().min(1).max(200),
  channel: z.enum(["email", "telegram"]),
  campaign: z.string().min(1).max(64),
  locale: z.enum(locales),
  email: z.string().email().optional(),
  telegramChatId: z.string().max(64).optional(),
  name: z.string().max(120).optional(),
  data: z.record(z.unknown()).default({}),
});

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret configured means the route stays shut rather than open: an
  // unauthenticated endpoint that sends email to real people is not a default.
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

/**
 * Turn a queued row into a campaign this codebase knows how to render.
 *
 * The backend decides *who* and *when*; the shape of *what* is owned here, so
 * anything it sends that does not match a known campaign is skipped rather
 * than half-rendered.
 */
function toCampaign(message: DueMessage, locale: Locale): Campaign | null {
  const data = message.data as Record<string, string | number | undefined>;
  const shopUrl = `${siteOrigin()}/${locale}/products`;

  switch (message.campaign) {
    case "birthday":
      return {
        type: "birthday",
        name: message.name,
        memberName: typeof data.memberName === "string" ? data.memberName : undefined,
        promoCode: typeof data.promoCode === "string" ? data.promoCode : undefined,
        shopUrl,
      };
    case "child-season":
      return {
        type: "child-season",
        childName: typeof data.childName === "string" ? data.childName : undefined,
        shopUrl,
      };
    case "reorder":
      return {
        type: "reorder",
        productName: typeof data.productName === "string" ? data.productName : undefined,
        productUrl:
          typeof data.productSlug === "string"
            ? `${siteOrigin()}/${locale}/product/${data.productSlug}`
            : shopUrl,
        daysLeft: typeof data.daysLeft === "number" ? data.daysLeft : 0,
      };
    case "subscription-upcoming":
      return {
        type: "subscription-upcoming",
        items: Array.isArray(message.data.items)
          ? (message.data.items as { name: string; url: string; price?: string }[])
          : [],
        deliveryDate: typeof data.deliveryDate === "string" ? data.deliveryDate : "",
        daysUntil: typeof data.daysUntil === "number" ? data.daysUntil : 0,
        manageUrl: `${siteOrigin()}/${locale}/account`,
      };
    case "abandoned-cart":
      return {
        type: "abandoned-cart",
        name: message.name,
        items: Array.isArray(message.data.items)
          ? (message.data.items as { name: string; url: string; price?: string }[])
          : [],
        cartUrl: `${siteOrigin()}/${locale}/cart`,
      };
    default:
      return null;
  }
}

/** Telegram gets the same words as the email, without the HTML. */
function toTelegramText(campaign: Campaign, locale: Locale): string {
  const { subject, blocks } = buildCampaign(campaign, locale);
  return [subject, "", ...blocks.paragraphs, blocks.cta ? `\n${blocks.cta.label}: ${blocks.cta.url}` : ""]
    .filter(Boolean)
    .join("\n");
}

async function deliver(message: DueMessage): Promise<boolean> {
  const parsed = dueSchema.safeParse(message);
  if (!parsed.success) return false;

  const queued = parsed.data;
  const campaign = toCampaign(queued, queued.locale);
  if (!campaign) return false;

  if (queued.channel === "email") {
    if (!queued.email) return false;
    const result = await sendCampaign({ to: queued.email, locale: queued.locale, campaign });
    return result.ok;
  }

  if (!queued.telegramChatId) return false;
  return notifyCustomer(queued.telegramChatId, toTelegramText(campaign, queued.locale));
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isMarketingApiConfigured()) {
    // Not an error: this is the normal state until the accounts API is
    // deployed, and a cron that alerts every night for a known gap is a cron
    // people learn to ignore.
    return NextResponse.json({ ok: true, skipped: "marketing-api-not-configured" });
  }

  const due = await fetchDueMessages(BATCH);
  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0 });
  }

  const results: { reminderId: string; channel: string; ok: boolean }[] = [];
  // Sequential on purpose: a mail provider's rate limit is easier to respect
  // than to recover from, and 50 messages is not a latency problem.
  for (const message of due) {
    results.push({
      reminderId: message.reminderId,
      channel: message.channel,
      ok: await deliver(message),
    });
  }

  await markMessagesSent(results);

  const failed = results.filter((r) => !r.ok).length;
  if (failed > 0) {
    await notifyOperator(`⚠️ Marketing dispatch: ${failed} ta xabar yuborilmadi (${results.length} tadan)`);
  }

  return NextResponse.json({ ok: true, sent: results.length - failed, failed });
}
