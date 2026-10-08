import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { isApiConfigured } from "@/lib/api/client";
import { accountAreaAvailable } from "@/lib/config/demo";
import { ONLINE_PROVIDERS } from "@/lib/config/payments";
import { CARD_BRANDS, type PaymentBrandId } from "@/lib/config/payment-brands";
import { PaymentMarks } from "@/components/ui/PaymentMarks";
import { isNavigable } from "@/lib/content/nav-sections";
import type { Category } from "@/lib/shopflow/types";
import { HEALTH_LINKS, SALE_HREF } from "./nav-links";
import { ICONS } from "./header-item";
import { Logo } from "./Logo";
import { FooterAccordion } from "./FooterAccordion";
import { isStocked } from "@/lib/shop/categories";

interface FooterLink {
  href: string;
  label: string;
}

/*
  Design: FooterV3 (md and up) and FooterMobileV3 (columns as an accordion).

  Payment pills list only providers that can take a payment today
  (lib/config/payments) plus cash/card on delivery, and the club card goes to
  the bot when one is configured, the channel otherwise — the same rule the
  home page's club block follows.
*/
export function Footer({
  categories = [],
  topicPaths = [],
}: {
  categories?: Category[];
  topicPaths?: string[];
}) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const news = useTranslations("pages.news");
  const hasNews = (news.raw("items") as unknown[]).length > 0;
  const header = useTranslations("header");
  const contact = useTranslations("contact");
  const legal = useTranslations("legal");
  const year = new Date().getFullYear();

  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  const clubHref = bot ? `https://t.me/${bot}` : BRAND.social.telegram;

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t("catalog"),
      links: [
        ...categories.filter(isStocked).slice(0, 6).map((c) => ({ href: `/products/${c.slug}`, label: c.name })),
        { href: SALE_HREF, label: nav("topDeals") },
        { href: "/brands", label: nav("brands") },
        { href: "/ingredients", label: nav("ingredients") },
      ],
    },
    {
      title: t("customers"),
      links: [
        { href: "/delivery", label: t("delivery") },
        { href: "/payment", label: t("paymentMethods") },
        { href: "/guarantee", label: header("guarantee") },
        { href: "/loyalty", label: header("loyalty") },
        // The design lists the quiz here; the other health journeys follow it.
        ...HEALTH_LINKS.filter((l) => isNavigable(l.href, topicPaths)).map((l) => ({ href: l.href, label: nav(l.key) })),
        ...(accountAreaAvailable(isApiConfigured()) ? [{ href: "/account", label: nav("account") }] : []),
        { href: "/profile", label: nav("profile") },
      ],
    },
    {
      title: nav("about"),
      links: [
        { href: "/about", label: nav("aboutUs") },
        { href: "/licenses", label: nav("licenses") },
        { href: "/blog", label: nav("blog") },
        ...(hasNews ? [{ href: "/news", label: nav("news") }] : []),
        { href: "/partners", label: header("forPharmacies") },
        { href: "/where-to-buy", label: nav("whereToBuy") },
        { href: "/contact", label: nav("contact") },
      ],
    },
  ];

  // Online providers appear once they can take a payment; the cards are what the courier terminal accepts.
  const payments: PaymentBrandId[] = [...ONLINE_PROVIDERS.map((p) => p.id), ...CARD_BRANDS];

  return (
    <footer className="bg-tile pb-[var(--bottom-nav)] text-ink">
      {/* pb-16 clears the back-to-top button (0.75rem + 36px above the tab bar),
          which floats over the right edge where the legal links wrap to. */}
      <div className="wrap flex flex-col gap-6 pb-16 pt-7 md:gap-10 md:pt-12">
        <div className="grid gap-6 md:gap-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-5">
            <Link href="/" aria-label={header("homeLabel")} className="self-start">
              <Logo className="text-[32px] md:text-[40px]" />
            </Link>
            <p className="hidden max-w-[340px] text-body text-ink-2 md:block">{t("about")}</p>
            <div className="flex flex-col gap-1">
              <a href={`tel:${BRAND.contact.phoneHref}`} className="text-[26px] font-bold leading-8 md:text-[28px] md:leading-[34px]">
                {BRAND.contact.phone}
              </a>
              <span className="text-[15px] text-ink-2">{contact("workHours")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={BRAND.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-ink px-6 text-button font-semibold text-white transition-colors hover:bg-black md:flex-none"
              >
                <Icon d={ICONS.telegram} />
                {t("writeTelegram")}
              </a>
              <Link
                href="/contact"
                className="hidden h-12 items-center justify-center rounded-sm border-[1.5px] border-line-strong px-[22px] text-button font-semibold transition-colors hover:border-ink md:inline-flex"
              >
                {t("allContacts")}
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.2fr)]">
            {/* Mobile: the club card leads, then the columns fold. */}
            <ClubCard
              href={clubHref}
              eyebrow={t("clubEyebrow")}
              title={t("clubTitle")}
              text={t("clubText")}
              cta={t("clubCta")}
              className="order-first md:order-last"
            />
            {columns.map((col) => (
              <FooterColumn key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 border-line-strong md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-10 md:border-t md:pt-7">
          <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-3">
            <span className="text-[15px] font-semibold md:mr-1">{t("paymentMethods")}</span>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <PaymentMarks ids={payments} label={t("paymentMethods")} />
              <span className="inline-flex h-10 items-center rounded-[10px] bg-bg px-3 text-[15px] font-bold">{t("cash")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="mr-1.5 hidden text-[15px] font-semibold md:inline">{t("social")}</span>
            <SocialLink href={BRAND.social.telegram} label="Telegram" d={ICONS.telegram} />
            <SocialLink href={BRAND.social.instagram} label="Instagram" d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM17 7h.01" />
            <SocialLink href={BRAND.social.facebook} label="Facebook" d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.7 1.8-1.7H18V2.7A24 24 0 0 0 15.4 2.5C12.9 2.5 11 4 11 6.9v2.6H8V13h3v8" />
          </div>
        </div>

        <div className="flex flex-col gap-3 text-[13px] leading-[19px] text-ink-2 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-8 md:text-sm md:leading-5">
          <p className="max-w-[760px] md:flex-[1_1_520px]">
            © {year} Go Vita. {t("importer", { name: BRAND.legal.importer })} {legal("footer")}
          </p>
          <span className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/offer" className="underline-offset-2 hover:underline">{t("offer")}</Link>
            <Link href="/privacy" className="underline-offset-2 hover:underline">{t("privacy")}</Link>
            <Link href="/requisites" className="underline-offset-2 hover:underline">{nav("requisites")}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <>
      <nav aria-label={title} className="hidden flex-col gap-3.5 md:flex">
        <span className="text-[17px] font-bold">{title}</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-[15px] leading-5 text-ink-2 hover:text-black hover:underline">
            {l.label}
          </Link>
        ))}
      </nav>
      <FooterAccordion title={title} links={links} />
    </>
  );
}

function ClubCard({
  href,
  eyebrow,
  title,
  text,
  cta,
  className,
}: {
  href: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("flex flex-col gap-2.5 self-start rounded-[20px] bg-ink p-5 text-white md:p-[22px]", className)}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.04em] text-on-dark-2 md:text-[13px]">
        {eyebrow}
      </span>
      <span className="text-lg font-bold leading-[23px] md:text-[19px] md:leading-6">{title}</span>
      <span className="text-sm leading-5 text-on-dark-2">{text}</span>
      <span className="mt-1 hidden h-11 items-center self-start whitespace-nowrap rounded-[14px] bg-bg px-[18px] text-[15px] font-semibold text-ink md:inline-flex">
        {cta}
      </span>
    </a>
  );
}

function SocialLink({ href, label, d }: { href: string; label: string; d: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-bg transition-colors hover:bg-ink hover:text-white"
    >
      <Icon d={d} />
    </a>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
