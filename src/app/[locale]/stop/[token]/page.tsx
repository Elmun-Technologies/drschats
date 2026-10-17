import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/lib/i18n/navigation";
import { verifyStopToken } from "@/lib/messaging/tokens";
import { stopMarketingMessages } from "@/app/actions/marketingOptOut";
import { firstParam } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "emailPreferences" });
  // Carries a signed token in the path: never indexed, never followed.
  return { title: t("stop.title"), robots: { index: false, follow: false } };
}

/** "••• •• 45 67" — enough for the reader to recognise their own number. */
function maskedPhone(phone9: string): string {
  return `+998 •• ••• ${phone9.slice(5, 7)} ${phone9.slice(7)}`;
}

export default async function StopMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; token: string }>;
  searchParams: Promise<{ done?: string | string[]; error?: string | string[] }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const payload = verifyStopToken(token);
  if (!payload) notFound();
  const query = await searchParams;
  const done = firstParam(query.done);
  const failed = firstParam(query.error) === "1";
  const t = await getTranslations("emailPreferences");
  const channel = t(payload.channel === "sms" ? "stop.channelSms" : "stop.channelTelegram");

  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <h1 className="text-[28px] font-bold leading-[34px] text-ink lg:text-[36px] lg:leading-[42px]">{t("stop.title")}</h1>
        <p className="mt-3 text-[16px] leading-6 text-ink-2">
          {t("stop.lead", { phone: maskedPhone(payload.phone9), channel })}
        </p>

        {done ? (
          <p role="status" className="mt-6 rounded-[20px] bg-tile px-5 py-4 text-[15px] leading-6 text-ink">
            {done === "all" ? t("stop.doneAll") : t("stop.done", { channel })}
          </p>
        ) : (
          <form action={stopMarketingMessages} className="mt-8 flex flex-col gap-3 rounded-[20px] border border-line p-6">
            {failed && <p role="alert" className="text-[15px] text-ink">{t("error")}</p>}
            <input type="hidden" name="token" value={token} />
            <button type="submit" name="scope" value="channel" className={buttonVariants("primary", "md")}>
              {t("stop.button", { channel })}
            </button>
            <button type="submit" name="scope" value="all" className={buttonVariants("secondary", "md")}>
              {t("stop.buttonAll")}
            </button>
            <p className="text-[14px] leading-5 text-muted">{t("stop.note")}</p>
          </form>
        )}

        <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-[15px] font-semibold text-ink underline-offset-4 hover:underline">
          {t("stop.home")}
        </Link>
      </div>
    </Container>
  );
}
