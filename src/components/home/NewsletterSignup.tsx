import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { BRAND } from "@/lib/brand";

/*
  The VIP club, as a Telegram bot.

  The block used to be an email capture form headed "👑 VIP Salomatlik Klubi ·
  10% chegirma va shifokorlar maslahatini oling" — three claims, none of them
  true: the crown was decoration, the 10% was the ordinary first-order discount
  every visitor already gets, and no doctor consultation existed behind the
  address. It also asked for an email address as the price of joining, when the
  channel this shop actually talks to customers on is Telegram — every order
  confirmation already goes there.

  So: one button, the real bot, and a promise the bot can keep (order status,
  intake reminders, club offers). Email stays available on its own page for
  people who prefer it, at the same price and with the same opt-in rules.
*/
export async function NewsletterSignup() {
  const t = await getTranslations("home.newsletter");
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const href = bot ? `https://t.me/${bot.replace(/^@/, "")}` : BRAND.social.telegram;

  return (
    <section className="section-y bg-ink">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-brand-deep p-8 text-white sm:p-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white/80">
                {t("eyebrow")}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t("title")}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-surface-2/85">
                {t("subtitle")}
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-7">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-brand-deep shadow-lg transition-transform duration-300 hover:scale-[1.02] active:scale-95"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.608c-.15.675-.546.84-1.107.522l-3.063-2.257-1.478 1.42c-.163.163-.3.3-.617.3l.22-3.118 5.67-5.12c.247-.22-.054-.342-.383-.122L7.04 14.572l-3.007-.94c-.653-.204-.666-.653.137-.966l11.732-4.522c.545-.197 1.02.133.66.104z" />
                </svg>
                {t("telegramCta")}
              </a>
              <p className="mt-4 text-[11px] leading-relaxed text-white/55">{t("privacyNote")}</p>
              <Link
                href="/email/preferences"
                className="mt-3 inline-block text-[11px] font-semibold text-white/70 underline underline-offset-2 transition-colors hover:text-white"
              >
                {t("emailPreferences")}
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-surface-2/80">
              {t("firstOrderNote")}
            </p>
            <Link
              href="/products"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white transition-colors hover:bg-white/20"
            >
              {t("catalogCta")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
