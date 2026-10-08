import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { COMMERCE } from "@/lib/config/commerce";
import { BRAND } from "@/lib/brand";
import { getQuizQuestions } from "@/lib/quiz/questions";
import { AUDIENCE_PHOTOS, audienceSubtitleKey } from "@/lib/content/audience";
import { categoryCutout, productCutout } from "@/lib/content/product-cutouts";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/routing";
import type { Category, Product, Promotion } from "@/lib/shopflow/types";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { chipClass } from "@/components/ui/Chip";
import { SALE_HREF } from "@/components/layout/nav-links";

/*
  The home page blocks of HomeV3 / HomeMobileV3 that need no state. Phones get
  the mobile artboard's subset: trust row, origin cards and news are desktop
  only there, as in the design.
*/

const ARROW_UP_RIGHT = "M7 17L17 7M9 7h8v8";

export function SectionHead({
  id,
  title,
  href,
  label,
  shortLabel,
}: {
  id?: string;
  title: string;
  href?: string;
  label?: string;
  shortLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <h2 id={id} className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">
        {title}
      </h2>
      {href && label && (
        <Link href={href} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold hover:underline lg:text-base">
          <span className="lg:hidden">{shortLabel ?? label}</span>
          <span className="hidden lg:inline">{label}</span>
          <Icon d="M5 12h14M13 6l6 6-6 6" className="hidden h-[18px] w-[18px] lg:block" />
        </Link>
      )}
    </div>
  );
}

/** Phones only: the shelves as a row of chips above the hero. */
export function QuickChips({ categories, saleLabel, label }: { categories: Category[]; saleLabel: string; label: string }) {
  return (
    <nav aria-label={label} className="no-scrollbar flex gap-2 overflow-x-auto px-4 lg:hidden">
      <Link href={SALE_HREF} className={cn(chipClass(), "font-semibold text-red")}>
        {saleLabel}
      </Link>
      {categories.slice(0, 6).map((c) => (
        <Link key={c.id} href={`/products/${c.slug}`} className={chipClass()}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

export async function HomeCategories({ categories }: { categories: Category[] }) {
  const t = await getTranslations("home");
  // Shelves with a pack shot first, so the tiles read as products, not icons.
  const tiles = [...categories].sort((a, b) => Number(!categoryCutout(a.slug)) - Number(!categoryCutout(b.slug))).slice(0, 9);

  return (
    <section aria-labelledby="home-categories" className="wrap flex flex-col gap-3.5 lg:-mt-6">
      <div className="lg:hidden">
        <SectionHead id="home-categories" title={t("categories.title")} href="/products" label={t("v3.all")} />
      </div>
      <h2 className="sr-only max-lg:hidden">{t("categories.title")}</h2>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-5 lg:gap-4">
        {tiles.map((c, i) => {
          const img = categoryCutout(c.slug);
          return (
            <Link
              key={c.id}
              href={`/products/${c.slug}`}
              className={cn(
                "relative flex h-[132px] flex-col overflow-hidden rounded-[18px] bg-tile p-3 pb-0 transition-colors hover:bg-tile-hover lg:h-[210px] lg:rounded-3xl lg:p-[22px] lg:pb-0",
                i >= 6 && "max-lg:hidden",
              )}
            >
              <span className="relative z-10 text-sm font-semibold leading-[17px] lg:text-[19px] lg:leading-6">{c.name}</span>
              {img && (
                <span className="absolute bottom-0.5 right-0.5 h-[82px] w-[82px] lg:bottom-1.5 lg:right-2 lg:h-[150px] lg:w-[150px]">
                  <Image src={img} alt="" fill sizes="(max-width: 1024px) 82px, 150px" className="object-contain" />
                </span>
              )}
            </Link>
          );
        })}
        <Link
          href="/products"
          className="hidden h-[210px] flex-col justify-between rounded-3xl bg-tile p-[22px] transition-colors hover:bg-tile-hover lg:flex"
        >
          <span className="text-[19px] font-semibold leading-6">{t("categories.viewAll")}</span>
          <ArrowCircle className="self-end bg-bg" />
        </Link>
      </div>
    </section>
  );
}

const TRUST_ICONS = [
  "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  "M6 3h8l4 4v14H6zM14 3v4h4M9 13l2 2 4-4",
  "M20 12l-8 8-9-9V4h7zM7.5 7.5h.01",
  "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
];

export async function HomeTrust() {
  const t = await getTranslations("home.v3");
  const items = t.raw("trust") as { title: string; text: string }[];
  return (
    <section className="wrap hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <div key={item.title} className="flex items-start gap-3.5">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-tile">
            <Icon d={TRUST_ICONS[i] ?? TRUST_ICONS[0]} className="h-6 w-6" />
          </span>
          <span className="flex flex-col gap-1 pt-0.5">
            <span className="text-[17px] font-bold">{item.title}</span>
            <span className="text-sm leading-5 text-ink-2">
              {item.text.replace("{hours}", String(COMMERCE.delivery.tashkent.hours))}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}

/** Phones: a horizontal rail of 160px cards. Desktop: the design's auto-fill grid. */
export function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(188px,1fr))] md:gap-x-3 md:gap-y-6 md:overflow-visible md:px-0">
      {products.map((p, i) => (
        <div key={p.id} className="h-full w-40 shrink-0 md:w-auto">
          <ProductCard product={p} index={i} />
        </div>
      ))}
    </div>
  );
}

export function ProductGrid({ products, mobileLimit }: { products: Product[]; mobileLimit: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-[repeat(auto-fill,minmax(188px,1fr))] md:gap-x-3 md:gap-y-6">
      {products.map((p, i) => (
        <div key={p.id} className={cn("h-full", i >= mobileLimit && "max-md:hidden")}>
          <ProductCard product={p} index={i} />
        </div>
      ))}
    </div>
  );
}

/*
  The buy-two-get-one banner, drawn only while the catalogue actually runs a
  buy_x_get_y promotion — its title and wording come from that promotion.
*/
export async function PromoBanner({ promo }: { promo: Promotion | undefined }) {
  if (!promo) return null;
  const t = await getTranslations("home.v3.promo");
  return (
    <section className="wrap">
      <Link
        href="/products"
        className="flex items-center gap-4 rounded-3xl bg-yellow-banner p-5 lg:gap-9 lg:rounded-[28px] lg:px-11 lg:py-8"
      >
        <span aria-hidden className="shrink-0 text-5xl font-bold leading-[46px] tracking-[-0.03em] lg:text-[96px] lg:leading-[90px] lg:tracking-[-0.04em]">
          2+1
        </span>
        <span className="flex flex-1 flex-col gap-1 lg:gap-1.5">
          <span className="text-lg font-bold lg:text-h-section">{promo.title}</span>
          <span className="text-sm leading-[19px] text-ink-2 lg:text-[17px] lg:leading-[25px]">{promo.description}</span>
        </span>
        <span className="hidden h-14 shrink-0 items-center rounded-[14px] bg-ink px-8 text-[17px] font-semibold text-white lg:inline-flex">
          {t("cta")}
        </span>
      </Link>
    </section>
  );
}

/*
  The doors are the consultant's first question, read from the quiz so the two
  cannot drift; each deep-links into the quiz with that answer filled in.
*/
export async function HomeAudience({ locale }: { locale: Locale }) {
  const t = await getTranslations("home");
  const who = getQuizQuestions(locale).find((q) => q.id === "who");
  if (!who) return null;
  return (
    <section aria-labelledby="home-audience" className="wrap flex flex-col gap-3.5 lg:gap-6">
      <SectionHead id="home-audience" title={t("v3.audience.title")} href="/quiz" label={t("v3.audience.quiz")} shortLabel={t("v3.audience.short")} />
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:px-0">
        {who.options.map((o) => {
          const photo = AUDIENCE_PHOTOS[o.id];
          return (
            <Link
              key={o.id}
              href={{ pathname: "/quiz", query: { who: o.id } }}
              className="flex w-[136px] shrink-0 flex-col gap-2 lg:w-auto lg:gap-2.5"
            >
              <span className="relative block h-[170px] overflow-hidden rounded-[18px] bg-tile lg:aspect-[4/5] lg:h-auto lg:rounded-[20px]">
                {photo && (
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 136px, 200px"
                    className="object-cover"
                    style={{ objectPosition: photo.position }}
                  />
                )}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold lg:text-lg">{o.label}</span>
                <span className="hidden text-sm leading-[19px] text-ink-2 lg:block">
                  {t(`audience.${audienceSubtitleKey(o.id)}`)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export async function HomeServices() {
  const t = await getTranslations("home.v3");
  const copy = t.raw("services") as { title: string; text: string; short: string }[];
  const values: Record<string, string> = {
    "{first}": String(COMMERCE.discounts.subscriptionFirstPercent),
    "{recurring}": String(COMMERCE.discounts.subscriptionRecurringPercent),
    "{hours}": String(COMMERCE.delivery.tashkent.hours),
    "{free}": formatNumber(COMMERCE.freeShippingOver),
  };
  const fill = (s: string) => s.replace(/\{\w+\}/g, (k) => values[k] ?? k);
  const tiles = [
    { href: "/quiz", image: "/images/stock/st-cat-capsules.webp", pack: false },
    { href: "/loyalty", image: productCutout("swiss-energy-immunovit-30") ?? null, pack: true },
    { href: "/delivery", image: "/images/stock/st-delivery-door.webp", pack: false },
    { href: "/where-to-buy", image: "/images/stock/st-pharmacist-shelf.webp", pack: false },
  ];

  return (
    <section className="wrap grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
      {tiles.map((tile, i) => {
        const c = copy[i];
        if (!c) return null;
        return (
          <Link
            key={tile.href}
            href={tile.href}
            className="relative flex min-h-[168px] flex-col gap-1.5 overflow-hidden rounded-[20px] bg-tile p-4 transition-colors hover:bg-tile-hover lg:min-h-[280px] lg:gap-3 lg:rounded-3xl lg:p-7"
          >
            <span className="relative z-10 text-[17px] font-bold leading-[21px] lg:text-[26px] lg:leading-[31px]">{c.title}</span>
            <span className="relative z-10 text-[13px] leading-[17px] text-ink-2 lg:hidden">{fill(c.short)}</span>
            <span className="relative z-10 hidden max-w-[260px] text-base leading-[23px] text-ink-2 lg:block">{fill(c.text)}</span>
            {tile.image &&
              (tile.pack ? (
                <span className="absolute bottom-2 right-2 hidden h-[180px] w-[180px] lg:block">
                  <Image src={tile.image} alt="" fill sizes="180px" className="object-contain" />
                </span>
              ) : (
                <span className="absolute bottom-0 right-0 hidden h-[150px] w-[210px] overflow-hidden rounded-tl-[20px] lg:block">
                  <Image src={tile.image} alt="" fill sizes="210px" className="object-cover" />
                </span>
              ))}
            <ArrowCircle className="relative z-10 mt-auto h-10 w-10 bg-bg lg:h-12 lg:w-12 lg:bg-chip-strong" />
          </Link>
        );
      })}
    </section>
  );
}

export async function HomeOrigin() {
  const t = await getTranslations("home");
  const keys = ["absorb", "tested", "transparent"] as const;
  return (
    <section aria-labelledby="home-origin" className="wrap hidden flex-col gap-6 lg:flex">
      <SectionHead id="home-origin" title={t("science.title")} href="/licenses" label={t("v3.origin.link")} />
      <div className="grid grid-cols-3 gap-4">
        {keys.map((k, i) => (
          <div key={k} className="flex flex-col gap-3 rounded-[20px] border border-line p-7">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-base font-bold text-white">{i + 1}</span>
            <span className="mt-1.5 text-title font-bold">{t(`science.points.${k}.title`)}</span>
            <span className="text-body text-ink-2">{t(`science.points.${k}.description`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const NEWS_IMAGES = [
  "/images/stock/st-cat-orange.webp",
  "/images/stock/st-pharmacist-shelf.webp",
  "/images/stock/st-pharmacist-help.webp",
];

export async function HomeNews({ locale }: { locale: Locale }) {
  const t = await getTranslations("home.v3.news");
  const nav = await getTranslations("nav");
  const news = await getTranslations("pages.news");
  const items = (news.raw("items") as { title: string; text: string; meta: string }[]).slice(0, 3);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="home-news" className="wrap hidden flex-col gap-6 lg:flex">
      <SectionHead id="home-news" title={nav("news")} href="/news" label={t("all")} />
      <div className="grid grid-cols-3 gap-5">
        {items.map((n, i) => (
          <Link key={n.title} href="/news" className="flex flex-col gap-3">
            <span className="relative block aspect-[3/2] overflow-hidden rounded-[20px] bg-tile">
              <Image src={NEWS_IMAGES[i % NEWS_IMAGES.length]} alt="" fill sizes="400px" className="object-cover" />
            </span>
            <span className="flex items-center justify-between">
              <span className="inline-flex h-[26px] items-center rounded-pill bg-chip-strong px-2.5 text-[13px] font-semibold">{t("tag")}</span>
              <span className="text-[13px] text-muted">{formatDate(n.meta, locale)}</span>
            </span>
            <span className="text-[21px] font-bold leading-[27px]">{n.title}</span>
            <span className="text-body text-ink-2">{n.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function HomeFaqHelp() {
  const t = await getTranslations("home");
  const footer = await getTranslations("footer");
  const items = t.raw("faq.items") as { question: string; answer: string }[];
  return (
    <section className="wrap grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-10">
      {Array.isArray(items) && items.length > 0 && (
        <div className="flex flex-col">
          <JsonLd data={faqLd(items)} />
          <h2 className="mb-1.5 text-[22px] font-bold leading-7 lg:mb-3 lg:text-h-section lg:leading-9">{t("faq.title")}</h2>
          <FaqAccordion items={items} defaultOpen={null} />
        </div>
      )}
      <div className="flex flex-col gap-2.5 rounded-3xl bg-dark-panel p-5 text-white lg:gap-3.5 lg:rounded-[28px] lg:p-8">
        <span className="text-xl font-bold lg:text-[26px] lg:leading-8">{t("v3.help.title")}</span>
        <span className="hidden text-base leading-6 text-on-dark-2 lg:block">{t("v3.help.text")}</span>
        <a href={`tel:${BRAND.contact.phoneHref}`} className="text-2xl font-bold lg:mt-1 lg:text-[28px]">
          {BRAND.contact.phone}
        </a>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={BRAND.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-[14px] bg-bg px-6 text-base font-semibold text-ink lg:h-[52px] lg:flex-none lg:text-[17px]"
          >
            {footer("writeTelegram")}
          </a>
          <Link
            href="/quiz"
            className="hidden h-[52px] items-center justify-center rounded-[14px] bg-ink-2 px-6 text-[17px] font-semibold text-white lg:inline-flex"
          >
            {t("v3.help.quiz")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function HomeSeo() {
  const t = await getTranslations("home.v3.seo");
  const text = t
    .raw("text")
    .toString()
    .replace("{hours}", String(COMMERCE.delivery.tashkent.hours))
    .replace("{free}", formatNumber(COMMERCE.freeShippingOver));
  return (
    <section className="wrap">
      <div className="flex max-w-[1000px] flex-col gap-2.5">
        <h2 className="text-title font-bold">{t("title")}</h2>
        <p className="text-body text-ink-2">{text}</p>
      </div>
    </section>
  );
}

export function ArrowCircle({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chip-strong", className)}>
      <Icon d={ARROW_UP_RIGHT} className="h-5 w-5" />
    </span>
  );
}

function Icon({ d, className }: { d: string; className?: string }): ReactNode {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
