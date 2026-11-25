import Image from "next/image";
import type { Locale } from "@/lib/i18n/routing";
import type { TopicWorld, WorldAccent } from "@/lib/content/topic-worlds";
import type { Product } from "@/lib/shopflow/types";
import { cutoutOf } from "@/lib/catalog/product-facts";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import { cn, formatMoney } from "@/lib/utils";
import { BundleAddAll } from "./BundleAddAll";

/* Literal class names per accent, so Tailwind sees them. */
const ACCENT: Record<WorldAccent, { bg: string; text: string }> = {
  sport: { bg: "bg-world-sport", text: "text-world-sport" },
};

const H2 = "text-[26px] font-extrabold leading-[30px] tracking-[-0.02em] lg:text-[40px] lg:leading-[44px]";

export function WorldHero({
  world,
  name,
  headline,
  intro,
}: {
  world: TopicWorld;
  name: string;
  headline: string;
  intro: string;
}) {
  const a = ACCENT[world.accent];
  return (
    <section className="overflow-hidden rounded-[28px] bg-dark-panel text-white">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        <div className="order-2 flex flex-col gap-3 p-5 pb-6 lg:order-1 lg:gap-5 lg:p-12">
          <span className={cn("self-start rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-[0.06em] text-ink", a.bg)}>
            {world.eyebrow}
          </span>
          <h1 className="text-[32px] font-extrabold leading-[36px] tracking-[-0.03em] lg:text-[56px] lg:leading-[60px]">{name}</h1>
          <p className="text-[17px] font-semibold leading-[24px] lg:text-[20px] lg:leading-[28px]">{headline}</p>
          <p className="text-[15px] leading-[22px] text-on-dark-2 lg:text-lead">{intro}</p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <a href="#world-bundle" className={cn(buttonVariants("primary", "lg"), a.bg, "text-ink hover:bg-white hover:text-ink")}>
              {world.ctaBundle}
            </a>
            <a href="#world-day" className={cn(buttonVariants("primary", "lg"), "border border-white/40 bg-transparent text-white hover:bg-white/10")}>
              {world.ctaDay}
            </a>
          </div>
        </div>
        <div className="relative order-1 aspect-[16/11] lg:order-2 lg:aspect-auto lg:min-h-[480px]">
          <Image
            src={world.hero.src}
            alt={world.hero.alt}
            fill
            priority
            sizes="(min-width: 1296px) 560px, (min-width: 1024px) 45vw, calc(100vw - 32px)"
            className="object-cover"
            style={world.hero.position ? { objectPosition: world.hero.position } : undefined}
          />
        </div>
      </div>
      <ul className="grid border-t border-white/15 sm:grid-cols-3">
        {world.stats.map((s) => (
          <li key={s.value} className="flex flex-col gap-1 border-white/15 px-5 py-4 max-sm:border-t max-sm:first:border-t-0 sm:border-l sm:first:border-l-0 lg:px-12 lg:py-7">
            <span className={cn("text-[30px] font-extrabold leading-[34px] tracking-[-0.02em] lg:text-[40px] lg:leading-[44px]", a.text)}>{s.value}</span>
            <span className="text-[15px] leading-[21px] text-on-dark-2">{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorldDay({ world, products, locale }: { world: TopicWorld; products: Product[]; locale: Locale }) {
  const a = ACCENT[world.accent];
  return (
    <section id="world-day" aria-labelledby="world-day-title" className="flex scroll-mt-[calc(var(--header-sticky)+16px)] flex-col gap-5 lg:gap-8">
      <header className="flex max-w-[760px] flex-col gap-2">
        <h2 id="world-day-title" className={H2}>{world.dayTitle}</h2>
        <p className="text-[15px] leading-[22px] text-ink-2 lg:text-lead">{world.dayIntro}</p>
      </header>
      <ol className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {world.steps.map((step, i) => {
          const product = step.productSlug ? products.find((p) => p.slug === step.productSlug) : undefined;
          const cutout = product ? cutoutOf(product) : undefined;
          return (
            <li key={step.title} className="flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-line sm:w-auto">
              <div className="relative aspect-[4/3] bg-dark-panel">
                {step.image ? (
                  <Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <span aria-hidden className={cn("absolute inset-0 flex items-center justify-center text-[96px] font-extrabold leading-none", a.text)}>
                    {i + 1}
                  </span>
                )}
                <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[13px] font-bold text-ink", a.bg)}>
                  {i + 1} · {step.time}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="text-[17px] font-bold leading-[22px]">{step.title}</h3>
                <p className="text-[15px] leading-[21px] text-ink-2">{step.body}</p>
                {product && (
                  <Link
                    href={`/product/${product.slug}`}
                    className="mt-auto flex min-h-11 items-center gap-3 rounded-[14px] bg-tile p-2 pt-2 transition-colors hover:bg-tile-hover"
                  >
                    {cutout && (
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-bg">
                        <Image src={cutout} alt="" fill sizes="48px" className="object-contain p-1" />
                      </span>
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="line-clamp-2 text-[13px] font-semibold leading-[17px]">{product.name}</span>
                      <span className="text-[14px] font-extrabold">{formatMoney(product.price, locale)}</span>
                    </span>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function WorldBundle({ world, products, locale, list }: { world: TopicWorld; products: Product[]; locale: Locale; list: string }) {
  const a = ACCENT[world.accent];
  const set = world.bundle.slugs.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is Product => !!p);
  const available = set.filter((p) => p.inStock);
  if (available.length < 2) return null;
  const total = available.reduce((sum, p) => sum + p.price, 0);

  return (
    <section
      id="world-bundle"
      aria-labelledby="world-bundle-title"
      className={cn("scroll-mt-[calc(var(--header-sticky)+16px)] rounded-[28px] p-4 text-ink lg:p-10", a.bg)}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div className="flex max-w-[640px] flex-col gap-2 px-1">
            <h2 id="world-bundle-title" className={H2}>{world.bundle.title}</h2>
            <p className="text-[15px] font-medium leading-[22px] lg:text-[17px] lg:leading-[25px]">{world.bundle.text}</p>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:gap-3">
            {set.map((p, i) => (
              <div key={p.id} className="h-full w-[46%] shrink-0 snap-start md:w-auto">
                <ProductCard product={p} index={i} onCard />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 self-start rounded-[20px] bg-ink p-5 text-white lg:sticky lg:top-[calc(var(--header-sticky)+16px)] lg:p-6">
          <span className="text-[15px] text-on-dark-2">
            {world.bundle.total} · {available.length}
          </span>
          <span className="text-[34px] font-extrabold leading-[38px] tracking-[-0.02em]">{formatMoney(total, locale)}</span>
          <BundleAddAll products={available} label={world.bundle.cta} list={list} className={cn(a.bg, "text-ink hover:bg-white hover:text-ink")} />
        </div>
      </div>
    </section>
  );
}
