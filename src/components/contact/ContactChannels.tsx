import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/animation/Reveal";
import { BRAND, WHATSAPP_URL } from "@/lib/brand";

const TELEGRAM = BRAND.social.telegram;
const WHATSAPP = WHATSAPP_URL;

/*
  One page, several audiences: a customer chasing an order, a pharmacy asking
  about wholesale and a company ordering for staff all land here and all need
  a different door. Each channel names its own route rather than funnelling
  everyone through a single phone number.
*/
const CHANNELS = [
  {
    key: "orders",
    href: `tel:${BRAND.contact.phoneHref}`,
    action: BRAND.contact.phone,
    tone: "accent",
    icon: "M3 5a2 2 0 012-2h2l2 5-2 1a12 12 0 005 5l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z",
  },
  {
    key: "support",
    href: TELEGRAM,
    action: "Telegram",
    tone: "blue",
    external: true,
    icon: "M12 2L2 12l4 1.5L18 6l-9 9.5.5 5 3-3.5 4 3 3.5-18z",
  },
  {
    key: "whatsapp",
    href: WHATSAPP,
    action: "WhatsApp",
    tone: "accent",
    external: true,
    icon: "M20.5 3.5A11 11 0 003.2 17.1L2 22l5-1.2A11 11 0 1020.5 3.5zM12 20a8 8 0 01-4.1-1.1l-.3-.2-3 .7.8-2.9-.2-.3A8 8 0 1112 20z",
  },
  {
    key: "pharmacy",
    href: `mailto:${BRAND.contact.b2bEmail}?subject=Pharmacy`,
    action: BRAND.contact.b2bEmail,
    tone: "gold",
    icon: "M9 3h6l1 4h3a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a1 1 0 011-1h3l1-4z",
  },
  {
    key: "distributor",
    href: `mailto:${BRAND.contact.b2bEmail}?subject=Distribution`,
    action: BRAND.contact.b2bEmail,
    tone: "gold",
    icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z",
  },
  {
    key: "corporate",
    href: `mailto:${BRAND.contact.b2bEmail}?subject=Corporate`,
    action: BRAND.contact.b2bEmail,
    tone: "blue",
    icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
  },
] as const;

const TONES: Record<string, string> = {
  accent: "bg-accent-soft text-accent-strong",
  blue: "bg-blue-soft text-blue",
  gold: "bg-gold/15 text-gold-ink",
};

export async function ContactChannels() {
  const t = await getTranslations("contact.channels");

  return (
    <section aria-labelledby="contact-channels" className="mt-16">
      <h2 id="contact-channels" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {CHANNELS.map((channel, i) => (
          <Reveal key={channel.key} index={Math.min(i, 4)} as="li" className="h-full">
            <a
              href={channel.href}
              {...("external" in channel && channel.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group flex h-full gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[channel.tone]}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={channel.icon} />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold text-fg group-hover:text-accent-strong">
                  {t(`${channel.key}.title`)}
                </span>
                <span className="mt-1 block text-sm text-muted">{t(`${channel.key}.description`)}</span>
                <span className="mt-2 block truncate text-sm font-semibold text-accent-strong">
                  {channel.action}
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
