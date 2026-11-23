import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Link } from "@/lib/i18n/navigation";
import { shopflow } from "@/lib/shopflow";
import { getCommerceSettings } from "@/lib/commerce/server";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { cutoutOf } from "@/lib/catalog/product-facts";
import { CLUB_BOT_USERNAME } from "@/lib/config/telegram-login";
import { subscriptionPricing } from "@/lib/subscription/plans";
import { BOX_SLUG, CARE_PHOTO, CARE_PHOTO_FIT, KIT_DEFAULT, KIT_SLUGS, careCopy, fillPercents, type CareKind, type CareStageTile } from "@/lib/care/content";
import { formatMoney, cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { HomeTrust } from "@/components/home/HomeBlocks";
import { chipClass } from "@/components/ui/Chip";
import { CareTracker } from "./CareTracker";
import { BoxPanel } from "./BoxPanel";
import { KitBuilder } from "./KitBuilder";

const H2 = "text-[22px] font-bold leading-7 lg:text-h-section";
const POOL = 100;

/*
  /care/mom and /care/baby (design: the "Ona va Bola" canvas). One template,
  two copies: hero with the dark panel beside it, stage tiles, the tracker,
  products by stage, the box (mom) or the home kit (baby), the cross-link to
  the other page, guides, privacy, FAQ and the SEO paragraph.
*/
export async function CareTemplate({ kind, locale }: { kind: CareKind; locale: Locale }) {
  const copy = careCopy(kind, locale);
  const prod = await getTranslations("product");
  const [pool, commerce, topics] = await Promise.all([
    shopflow.getProducts({ locale, pageSize: POOL }),
    getCommerceSettings(),
    getHealthTopics(locale).catch(() => []),
  ]);
  const bySlug = new Map(pool.items.map((p) => [p.slug, p]));
  const pick = (slugs: readonly string[]) => slugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));
  const percents = { firstPercent: commerce.subscription.firstPercent, recurringPercent: commerce.subscription.recurringPercent };
  const clubHref = CLUB_BOT_USERNAME ? `https://t.me/${CLUB_BOT_USERNAME}` : undefined;
  const clubLabel = locale === "ru" ? "Telegram-клуб govita" : "govita Telegram klubi";

  const box = kind === "mom" ? bySlug.get(BOX_SLUG) : undefined;
  const boxPrice = box ? subscriptionPricing(box.price, percents) : null;
  const kit = kind === "baby" ? pick(KIT_SLUGS) : [];
  const kitDefault = kit.filter((p) => (KIT_DEFAULT as readonly string[]).includes(p.slug));
  const guides = copy.guides
    .map((g) => topics.find((t) => t.slug === g.slug && t.kind === g.kind))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const faq = copy.faq.map((f) => ({ question: f.question, answer: fillPercents(f.answer, percents) }));
  const sections = copy.sections.map((s) => ({ ...s, products: pick(s.slugs) })).filter((s) => s.products.length > 0);

  return (
    <div className="wrap flex flex-col gap-8 pb-9 pt-1 lg:gap-14 lg:pb-[72px] lg:pt-5">
      <div className="flex flex-col gap-3 lg:gap-5">
        <nav aria-label={prod("breadcrumb")} className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted lg:text-sm">
          <Link href="/" className="inline-flex min-h-6 items-center hover:text-ink">{prod("breadcrumbHome")}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-ink">{copy.breadcrumb}</span>
        </nav>
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex max-w-[820px] flex-col gap-2">
            <h1 className="text-[28px] font-extrabold leading-[34px] lg:text-h-page">{copy.h1}</h1>
            <p className="text-[15px] leading-[22px] text-ink-2 lg:text-lead">{copy.lead}</p>
          </div>
          <nav aria-label={copy.breadcrumb} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0">
            <a href="#kuzatuv" className={chipClass()}>{copy.tracker.title}</a>
            <a href="#mahsulotlar" className={chipClass()}>{copy.sections[0]?.title}</a>
            <a href={copy.panel.href} className={chipClass()}>{copy.panel.title}</a>
            <a href="#savollar" className={chipClass()}>{prod("faq")}</a>
          </nav>
        </header>
      </div>

      {/* Hero: banner with the photo, the dark panel beside it. */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] lg:gap-4">
        <div className={cn("grid overflow-hidden rounded-[20px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:rounded-[28px]", kind === "mom" ? "bg-tile" : "bg-yellow-banner")}>
          <div className="flex flex-col justify-center gap-4 p-5 lg:gap-5 lg:p-12">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-bg px-3 py-1.5 text-[13px] font-semibold">
              <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", kind === "mom" ? "bg-yellow" : "bg-ink")} />
              {copy.heroBadge}
            </span>
            <p className="text-[30px] font-extrabold leading-[34px] tracking-[-0.025em] lg:text-[44px] lg:leading-[48px]">{copy.heroTitle}</p>
            <p className={cn("text-[15px] leading-[22px] lg:text-lead", kind === "mom" ? "text-ink-2" : "text-ink-1")}>{copy.heroText}</p>
            <div className="flex flex-wrap gap-2.5">
              <a href="#kuzatuv" className="inline-flex h-[52px] items-center rounded-sm bg-ink px-6 text-base font-semibold text-white transition-opacity hover:opacity-90">
                {copy.heroCta}
              </a>
              <a href={copy.heroCta2Href} className="inline-flex h-[52px] items-center rounded-sm bg-bg px-6 text-base font-semibold transition-colors hover:bg-tile-hover">
                {copy.heroCta2}
              </a>
            </div>
          </div>
          <div className="relative h-[240px] lg:h-auto lg:min-h-[420px]">
            <Image src={CARE_PHOTO[kind]} alt={copy.photoAlt} fill priority sizes="(max-width: 1023px) 100vw, 480px" className={CARE_PHOTO_FIT[kind] === "contain" ? "object-contain p-4 lg:p-8" : "object-cover"} />
          </div>
        </div>

        <aside className="flex flex-col gap-3.5 rounded-[20px] bg-dark-panel p-5 text-white lg:rounded-[28px] lg:p-7">
          <span className="text-[13px] text-on-dark-2">{copy.panel.eyebrow}</span>
          <h2 className="text-[22px] font-bold leading-7 lg:text-2xl">{copy.panel.title}</h2>
          <div className="grid h-[170px] grid-cols-2 gap-1 rounded-[20px] bg-bg p-2">
            {(kind === "mom" && box ? [box] : kitDefault).map((p) => (
              <span key={p.slug} className={cn("relative", kind === "mom" && "col-span-2")}>
                <Image src={cutoutOf(p) ?? p.images[0]?.url ?? ""} alt={p.name} fill sizes="160px" className="object-contain" />
              </span>
            ))}
          </div>
          <p className="text-sm leading-[21px] text-on-dark-2">{copy.panel.text}</p>
          {boxPrice && (
            <div className="flex items-baseline justify-between gap-3 text-sm text-on-dark-2">
              <span>{fillPercents(copy.box!.first, percents)}</span>
              <span className="text-xl font-bold text-white">{formatMoney(boxPrice.firstPrice, locale)}</span>
            </div>
          )}
          {kind === "baby" && kitDefault.length > 0 && (
            <div className="flex items-baseline justify-between gap-3 text-sm text-on-dark-2">
              <span>
                {kitDefault.length} {copy.kit!.count}
              </span>
              <span className="text-xl font-bold text-white">{formatMoney(kitDefault.reduce((s, p) => s + p.price, 0), locale)}</span>
            </div>
          )}
          <a href={copy.panel.href} className="mt-auto flex h-12 items-center justify-center rounded-sm bg-bg text-base font-semibold text-ink transition-colors hover:bg-tile">
            {copy.panel.cta}
          </a>
        </aside>
      </section>

      {/* Stages */}
      <section aria-label={copy.tracker.title} className="-mt-4 lg:-mt-8">
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:grid lg:auto-cols-fr lg:grid-flow-col lg:gap-4 lg:px-0">
          {copy.stages.map((s) => (
            <StageTile key={s.title} tile={s} href="#kuzatuv" />
          ))}
          <StageTile tile={copy.nextTile} href={copy.nextTile.href.startsWith("#") ? copy.nextTile.href : undefined} link={copy.nextTile.href.startsWith("/") ? copy.nextTile.href : undefined} dark />
        </div>
      </section>

      <HomeTrust />

      <section id="kuzatuv" aria-labelledby="care-tracker" className="flex scroll-mt-[calc(var(--header-sticky)+16px)] flex-col gap-3.5 lg:gap-6">
        <div className="flex flex-col gap-1">
          <h2 id="care-tracker" className={H2}>{copy.tracker.title}</h2>
          <p className="text-[15px] leading-[22px] text-ink-2">{copy.tracker.lead}</p>
        </div>
        <CareTracker mode={kind === "mom" ? "pregnancy" : "child"} copy={copy.tracker} clubHref={clubHref} clubLabel={clubLabel} />
      </section>

      <div id="mahsulotlar" className="flex scroll-mt-[calc(var(--header-sticky)+16px)] flex-col gap-8 lg:gap-12">
        {sections.map((s) => (
          <section key={s.id} aria-labelledby={`care-${s.id}`} className="flex flex-col gap-3.5 lg:gap-6">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <div className="flex flex-col gap-1">
                <h2 id={`care-${s.id}`} className={H2}>{s.title}</h2>
                <p className="text-[15px] leading-[22px] text-ink-2">{s.lead}</p>
              </div>
              <Link href="/products" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold hover:underline">
                {copy.allProducts}
                <Arrow />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-3 md:gap-x-3 md:gap-y-6 xl:grid-cols-6 xl:gap-x-4">
              {s.products.map((p, i) => (
                <div key={p.id} className="h-full">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
              {s.products.length < 6 && (
                <a
                  href={copy.panel.href}
                  style={{ gridColumn: `span ${6 - s.products.length} / span ${6 - s.products.length}` }}
                  className="hidden flex-col justify-between gap-4 rounded-3xl bg-tile p-7 transition-colors hover:bg-tile-hover xl:flex"
                >
                  <span className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-muted">{copy.panel.eyebrow}</span>
                    <span className="text-[28px] font-extrabold leading-[34px] tracking-[-0.02em]">{copy.panel.title}</span>
                    <span className="max-w-[420px] text-[15px] leading-[22px] text-ink-2">{copy.panel.text}</span>
                  </span>
                  <span className="inline-flex h-12 items-center gap-2 self-start rounded-sm bg-ink px-5 text-base font-semibold text-white">
                    {copy.panel.cta}
                    <Arrow />
                  </span>
                </a>
              )}
            </div>
          </section>
        ))}
        {copy.waitlist && (
          <div className="flex flex-col gap-4 rounded-[20px] border border-dashed border-control p-5 lg:flex-row lg:items-center lg:gap-6 lg:rounded-3xl lg:p-8">
            <div className="flex flex-1 flex-col gap-1.5">
              <h2 className="text-xl font-bold leading-[26px]">{copy.waitlist.title}</h2>
              <p className="text-[15px] leading-[22px] text-ink-2">{copy.waitlist.text}</p>
            </div>
            {clubHref && (
              <a href={clubHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-sm bg-ink px-6 text-base font-semibold text-white transition-opacity hover:opacity-90">
                {copy.waitlist.cta}
              </a>
            )}
          </div>
        )}
      </div>

      {/* The box (mom) or the home kit (baby). */}
      {(box && copy.box) || (kit.length > 0 && copy.kit) ? (
        <section
          id={kind === "mom" ? "quti" : "aptechka"}
          aria-labelledby="care-offer"
          className="grid grid-cols-1 scroll-mt-[calc(var(--header-sticky)+16px)] gap-6 rounded-[20px] bg-dark-panel p-5 text-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-10 lg:rounded-[28px] lg:p-10"
        >
          {kind === "mom" && box && copy.box ? (
            <>
              <div className="flex flex-col gap-4">
                <span className="text-[13px] text-on-dark-2">{copy.box.eyebrow}</span>
                <h2 id="care-offer" className="text-[24px] font-bold leading-[30px] lg:text-[32px] lg:leading-[38px]">{copy.box.title}</h2>
                <ol className="flex flex-col gap-3.5">
                  {copy.box.steps.map(([t, d], i) => (
                    <li key={t} className="flex items-start gap-3.5">
                      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg font-extrabold text-ink">{i + 1}</span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-base font-bold">{t}</span>
                        <span className="text-sm leading-[21px] text-on-dark-2">{fillPercents(d, percents)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <BoxPanel product={box} image={cutoutOf(box) ?? box.images[0]?.url ?? ""} copy={copy.box} percents={percents} locale={locale} meta={box.tagline} />
            </>
          ) : copy.kit ? (
            <>
              <div className="flex flex-col gap-4">
                <span className="text-[13px] text-on-dark-2">{copy.kit.eyebrow}</span>
                <h2 id="care-offer" className="text-[24px] font-bold leading-[30px] lg:text-[32px] lg:leading-[38px]">{copy.kit.title}</h2>
                <p className="text-[15px] leading-[23px] text-on-dark-2">{copy.kit.text}</p>
                <ul className="flex flex-wrap gap-2.5">
                  {copy.kit.tags.map((tag) => (
                    <li key={tag} className="rounded-sm bg-ink-1 px-3.5 py-2.5 text-sm">{tag}</li>
                  ))}
                </ul>
              </div>
              <KitBuilder
                items={kit.map((p) => ({
                  product: p,
                  image: cutoutOf(p) ?? p.images[0]?.url ?? "",
                  note: p.slug === "hiew-cooling-plaster-16" ? copy.kit!.subscribable : p.tagline,
                }))}
                initial={kitDefault.map((p) => p.slug)}
                copy={copy.kit}
                locale={locale}
              />
            </>
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-col gap-4 rounded-[20px] bg-yellow-banner p-5 lg:flex-row lg:items-center lg:gap-7 lg:rounded-[28px] lg:px-9 lg:py-7">
        <span aria-hidden className="text-[44px] font-extrabold leading-[44px] tracking-[-0.03em] lg:text-[56px] lg:leading-[56px]">{copy.cross.big}</span>
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="text-xl font-bold leading-[26px] lg:text-[22px] lg:leading-7">{copy.cross.title}</h2>
          <p className="text-[15px] leading-[22px] text-ink-1">{copy.cross.text}</p>
        </div>
        <Link href={copy.cross.href} className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-sm bg-ink px-6 text-base font-semibold text-white transition-opacity hover:opacity-90">
          {copy.cross.cta}
        </Link>
      </section>

      {guides.length > 0 && (
        <section aria-labelledby="care-guides" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="care-guides" className={H2}>{copy.guidesTitle}</h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`${TOPIC_BASE_PATH[g.kind]}/${g.slug}`}
                className="flex flex-col justify-between gap-4 rounded-[20px] border border-line p-5 transition-colors hover:bg-tile lg:min-h-[180px] lg:rounded-3xl lg:p-6"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="text-[17px] font-bold leading-[23px]">{g.name}</span>
                  <span className="line-clamp-3 text-sm leading-[21px] text-ink-2">{g.headline}</span>
                </span>
                <Arrow />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-1.5 rounded-[20px] bg-tile p-5 lg:max-w-[820px] lg:rounded-3xl lg:p-7">
        <h2 className="text-xl font-bold leading-[26px]">{copy.privacy.title}</h2>
        <p className="text-[15px] leading-[22px] text-ink-2">{copy.privacy.text}</p>
      </section>

      <section id="savollar" aria-labelledby="care-faq" className="flex max-w-[820px] scroll-mt-[calc(var(--header-sticky)+16px)] flex-col gap-3.5 lg:gap-6">
        <h2 id="care-faq" className={H2}>{prod("faq")}</h2>
        <FaqAccordion items={faq} />
      </section>

      <section className="flex max-w-[820px] flex-col gap-2.5">
        <h2 className="text-xl font-bold leading-[26px] lg:text-[22px] lg:leading-7">{copy.seoTitle}</h2>
        <p className="text-[15px] leading-[22px] text-ink-2">{copy.seoText}</p>
      </section>

      <Disclaimer variant="product" />
    </div>
  );
}

function StageTile({ tile, href, link, dark = false }: { tile: CareStageTile; href?: string; link?: string; dark?: boolean }) {
  const inner = (
    <>
      <span className="flex items-baseline gap-1.5">
        <span className="whitespace-nowrap text-[32px] font-extrabold leading-[34px] tracking-[-0.03em] xl:text-[36px] xl:leading-[38px]">{tile.big}</span>
        <span className={cn("text-[13px]", dark ? "text-on-dark-2" : "text-muted")}>{tile.small}</span>
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-base font-bold leading-[21px] lg:text-[17px] lg:leading-[22px]">{tile.title}</span>
        <span className={cn("text-[13px] leading-[17px]", dark ? "text-on-dark-2" : "text-ink-2")}>{tile.sub}</span>
      </span>
    </>
  );
  const className = cn(
    "flex min-h-[150px] w-[164px] shrink-0 flex-col justify-between gap-3 rounded-[20px] p-4 transition-colors lg:min-h-[168px] lg:w-auto lg:rounded-3xl lg:p-5",
    dark ? "bg-dark-panel text-white hover:opacity-95" : "bg-tile hover:bg-tile-hover",
  );
  return link ? (
    <Link href={link} className={className}>{inner}</Link>
  ) : (
    <a href={href} className={className}>{inner}</a>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
