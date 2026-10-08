import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/*
  Design: InfoNavV3. Every information page sits in one layout: a sidebar of
  the two groups on the left from lg, a scrolling chip row above the content on
  a phone (DeliveryMobileV3).
*/
const GROUPS = [
  { key: "buyers", items: ["delivery", "payment", "guarantee", "loyalty"] },
  { key: "company", items: ["about", "licenses", "partners", "blog", "contact"] },
] as const;

export type InfoSection = (typeof GROUPS)[number]["items"][number];

const HREF: Record<InfoSection, string> = {
  delivery: "/delivery",
  payment: "/payment",
  guarantee: "/guarantee",
  loyalty: "/loyalty",
  about: "/about",
  licenses: "/licenses",
  partners: "/partners",
  blog: "/blog",
  contact: "/contact",
};

export async function InfoShell({
  active,
  crumb,
  children,
}: {
  /** Omit on pages outside the menu (requisites, offer, privacy). */
  active?: InfoSection;
  crumb: string;
  children: ReactNode;
}) {
  const t = await getTranslations("pages.v3");
  const all = GROUPS.flatMap((g) => g.items);

  return (
    <div className="wrap pb-10 pt-3 lg:pb-20 lg:pt-6">
      <nav aria-label={t("nav.home")} className="mb-5 hidden text-sm text-ink-2 lg:block">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink">{t("nav.home")}</Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">{crumb}</li>
        </ol>
      </nav>

      <nav aria-label={t("nav.sections")} className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {all.map((key) => (
          <Link
            key={key}
            href={HREF[key]}
            aria-current={key === active ? "page" : undefined}
            className={cn(
              "inline-flex h-11 shrink-0 items-center rounded-sm px-4 text-[15px] font-medium",
              key === active ? "bg-ink text-white" : "bg-tile text-ink",
            )}
          >
            {t(`nav.${key}Short`)}
          </Link>
        ))}
      </nav>

      <div className="grid items-start gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-6 lg:flex">
          <nav aria-label={t("nav.sections")} className="flex flex-col gap-5">
            {GROUPS.map((group) => (
              <div key={group.key} className="flex flex-col gap-1">
                <span className="px-3.5 pb-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
                  {t(`nav.${group.key}`)}
                </span>
                {group.items.map((key) => (
                  <Link
                    key={key}
                    href={HREF[key]}
                    aria-current={key === active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center rounded-sm px-3.5 text-base hover:bg-tile",
                      key === active && "bg-tile font-bold",
                    )}
                  >
                    {t(`nav.${key}`)}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="flex flex-col gap-1.5 rounded-[20px] bg-dark-panel p-5 text-white">
            <span className="text-[17px] font-bold">{t("help.title")}</span>
            <span className="text-sm leading-5 text-on-dark-2">{t("help.text")}</span>
            <a href={`tel:${BRAND.contact.phoneHref}`} className="mt-1.5 inline-flex min-h-11 items-center text-lg font-bold hover:underline">
              {BRAND.contact.phone}
            </a>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-8 lg:gap-10">{children}</div>
      </div>
    </div>
  );
}

/** Page title and lead, same on every info page. */
export function InfoHeader({ title, lead, leadShort }: { title: string; lead?: string; leadShort?: string }) {
  return (
    <header className="flex flex-col gap-2 lg:gap-3">
      <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{title}</h1>
      {lead && (
        <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">
          {leadShort ? (
            <>
              <span className="hidden lg:inline">{lead}</span>
              <span className="lg:hidden">{leadShort}</span>
            </>
          ) : (
            lead
          )}
        </p>
      )}
    </header>
  );
}

/** "Savol-javob" — plain question/answer list, every answer visible. */
export function InfoFaq({ title, items }: { title: string; items: { question: string; answer: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="info-faq" className="flex flex-col gap-2">
      <h2 id="info-faq" className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{title}</h2>
      <dl className="flex flex-col">
        {items.map((item) => (
          <div key={item.question} className="flex flex-col gap-1.5 border-b border-line py-4 lg:py-5">
            <dt className="text-base font-bold lg:text-[17px]">{item.question}</dt>
            <dd className="text-[15px] leading-[22px] text-ink-2 lg:text-base lg:leading-6">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
