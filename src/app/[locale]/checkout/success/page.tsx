import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { PurchaseTracker } from "@/components/personalization/PurchaseTracker";

export const metadata: Metadata = { robots: { index: false } };

/*
  Design: OrderSuccessV3 / OrderSuccessMobileV3.

  The page knows the order number and nothing else — the cart is cleared
  before the redirect — so it shows what it can stand behind. The design's
  "Payme · toʻlandi" card and a first step saying the payment went through
  are left out: a cash-on-delivery order has not been paid, and an online
  one is confirmed by the provider, not by this page.
*/
export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("checkout.success");
  const tv = await getTranslations("cart.v3");

  const shortOrder = order ? order.slice(-8).toUpperCase() : null;
  const steps = [
    { title: tv("step1Title"), text: tv("step1") },
    { title: tv("step2Title"), text: tv("step2") },
    { title: tv("step3Title"), text: tv("step3") },
  ];

  return (
    <div className="wrap pb-9 pt-4 lg:pb-[72px] lg:pt-10">
      <div className="flex max-w-[860px] flex-col gap-5 lg:gap-7">
        <PurchaseTracker />
        <div className="flex flex-col gap-3 lg:gap-3.5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white lg:h-[72px] lg:w-[72px]">
            <svg viewBox="0 0 24 24" aria-hidden className="h-8 w-8 lg:h-9 lg:w-9" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-10" />
            </svg>
          </span>
          <h1 className="text-[30px] font-bold leading-9 lg:text-[44px] lg:leading-[50px]">{t("title")}</h1>
          <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("subtitle")}</p>
          {shortOrder && (
            <span className="mt-1 flex flex-col gap-0.5 self-start rounded-[16px] bg-tile px-4 py-3.5 lg:px-5">
              <span className="text-[13px] text-muted">{t("orderId")}</span>
              <span className="text-lg font-bold tabular-nums lg:text-xl">№ {shortOrder}</span>
            </span>
          )}
        </div>
  
        <section aria-labelledby="next-steps" className="flex flex-col gap-4 rounded-[20px] border border-line p-5 lg:gap-5 lg:p-8">
          <h2 id="next-steps" className="text-[19px] font-bold lg:text-2xl">{tv("nextSteps")}</h2>
          <ol className="flex flex-col gap-4 lg:gap-5">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3.5 lg:gap-4">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold lg:h-9 lg:w-9 lg:text-base",
                    i === 0 ? "bg-ink text-white" : "bg-chip-strong text-ink",
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex flex-col gap-0.5 lg:gap-1 lg:pt-1">
                  <span className="text-base font-bold lg:text-[17px]">{s.title}</span>
                  <span className="text-sm leading-[19px] text-ink-2 lg:text-base lg:leading-6">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
  
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-2.5">
          <a
            href={BRAND.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants("primary", "lg"), "h-[52px] rounded-[14px] lg:h-14")}
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4L3 11l6 2 2 6 3-4 5 4zM9 13l12-9" />
            </svg>
            {tv("telegram")}
          </a>
          <Link href="/products" className={cn(buttonVariants("light", "lg"), "h-[52px] rounded-[14px] lg:h-14")}>
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
