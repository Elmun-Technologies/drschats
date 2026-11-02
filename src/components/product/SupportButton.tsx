import { getTranslations } from "next-intl/server";
import { BRAND } from "@/lib/brand";

/*
  A way to ask before buying, on the product page and the cart: the shop's
  Telegram, where the operator answers in working hours. Pinned above the tab
  bar (and the product page's buy bar) through `--bottom-nav`, on the left so
  it never meets the scroll-to-top button; hidden while the cookie bar holds
  the bottom edge, and inside the Telegram Mini App, which is the chat already.
*/
export async function SupportButton({ about }: { about?: string }) {
  const [t, tc] = await Promise.all([getTranslations("common.support"), getTranslations("contact")]);
  return (
    <a
      href={BRAND.social.telegram}
      target="_blank"
      rel="noopener noreferrer"
      data-miniapp-hide
      aria-label={about ? t("labelAbout", { name: about }) : t("label")}
      title={t("hours", { hours: tc("workHours") })}
      className="fixed bottom-[calc(var(--bottom-nav)+0.75rem)] left-3 z-30 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-bg px-4 text-[15px] font-semibold text-ink shadow-md transition-colors hover:bg-tile lg:bottom-6 lg:left-6 [:root:has([data-cookie-bar])_&]:hidden"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16v11H9l-5 4z" />
      </svg>
      {t("cta")}
    </a>
  );
}
