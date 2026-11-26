import Image from "next/image";
import type { Locale } from "@/lib/i18n/routing";
import type { TopicWorld, WorldAccent, WorldStep } from "@/lib/content/topic-worlds";
import type { Product } from "@/lib/shopflow/types";
import { cutoutOf } from "@/lib/catalog/product-facts";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import { cn, formatMoney } from "@/lib/utils";
import { BundleAddAll } from "./BundleAddAll";

type Tone = { bg: string; title: string; body: string };

interface Palette {
  hero: string;
  heroBody: string;
  chip: string;
  cta: string;
  ctaGhost: string;
  shapeA: string;
  shapeB: string;
  /** The hero's own colour, for the border that cuts the round photo out of it. */
  cut: string;
  stats: [Tone, Tone, Tone];
  steps: Tone[];
  stepChip: string;
  bundle: Tone;
  bundleCta: string;
}

const LIGHT_GHOST = "border border-ink/30 bg-transparent text-ink hover:bg-bg hover:text-ink";
const DARK_GHOST = "border border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white";
const CLOUD: Tone = { bg: "bg-pantone-cloud", title: "text-ink", body: "text-ink-2" };
const PEACH: Tone = { bg: "bg-pantone-peach", title: "text-ink", body: "text-ink" };
const SUN: Tone = { bg: "bg-pantone-sun", title: "text-ink", body: "text-ink" };

/* Pantone colours per audience. Literal class names so Tailwind sees them; every pairing passes the contrast audit. */
const PALETTE: Record<WorldAccent, Palette> = {
  sport: {
    hero: "bg-dark-panel text-white",
    heroBody: "text-on-dark-2",
    chip: "bg-pantone-flame text-ink",
    cta: "bg-pantone-flame text-ink hover:bg-white hover:text-ink",
    ctaGhost: DARK_GHOST,
    shapeA: "bg-pantone-flame",
    shapeB: "bg-pantone-cloud",
    cut: "border-dark-panel",
    stats: [{ bg: "bg-pantone-flame", title: "text-ink", body: "text-ink" }, { bg: "bg-ink", title: "text-white", body: "text-on-dark-2" }, CLOUD],
    steps: [CLOUD],
    stepChip: "bg-pantone-flame text-ink",
    bundle: { bg: "bg-pantone-flame", title: "text-ink", body: "text-ink" },
    bundleCta: "bg-pantone-flame text-ink hover:bg-white hover:text-ink",
  },
  kids: {
    hero: "bg-pantone-peri text-white",
    heroBody: "text-white",
    chip: "bg-pantone-sun text-ink",
    cta: "bg-white text-ink hover:bg-pantone-sun hover:text-ink",
    ctaGhost: DARK_GHOST,
    shapeA: "bg-pantone-sun",
    shapeB: "bg-pantone-peach",
    cut: "border-pantone-peri",
    stats: [PEACH, SUN, CLOUD],
    steps: [PEACH, SUN, CLOUD],
    stepChip: "bg-pantone-peri text-white",
    bundle: PEACH,
    bundleCta: "bg-pantone-sun text-ink hover:bg-white hover:text-ink",
  },
  women: {
    hero: "bg-pantone-peach text-ink",
    heroBody: "text-ink-2",
    chip: "bg-pantone-magenta text-white",
    cta: "",
    ctaGhost: LIGHT_GHOST,
    shapeA: "bg-pantone-magenta",
    shapeB: "bg-pantone-mocha",
    cut: "border-pantone-peach",
    stats: [{ bg: "bg-pantone-magenta", title: "text-white", body: "text-white" }, { bg: "bg-pantone-mocha", title: "text-ink", body: "text-ink" }, CLOUD],
    steps: [CLOUD],
    stepChip: "bg-pantone-magenta text-white",
    bundle: { bg: "bg-pantone-magenta", title: "text-white", body: "text-white" },
    bundleCta: "bg-pantone-peach text-ink hover:bg-white hover:text-ink",
  },
  men: {
    hero: "bg-ink text-white",
    heroBody: "text-on-dark-2",
    chip: "bg-pantone-blue text-white",
    cta: "bg-pantone-blue text-white hover:bg-white hover:text-ink",
    ctaGhost: DARK_GHOST,
    shapeA: "bg-pantone-blue",
    shapeB: "bg-pantone-cloud",
    cut: "border-ink",
    stats: [{ bg: "bg-pantone-blue", title: "text-white", body: "text-white" }, { bg: "bg-ink", title: "text-white", body: "text-on-dark-2" }, CLOUD],
    steps: [{ bg: "bg-ink", title: "text-white", body: "text-on-dark-2" }],
    stepChip: "bg-pantone-blue text-white",
    bundle: { bg: "bg-pantone-blue", title: "text-white", body: "text-white" },
    bundleCta: "bg-pantone-blue text-white hover:bg-white hover:text-ink",
  },
  seniors: {
    hero: "bg-pantone-cloud text-ink",
    heroBody: "text-ink-2",
    chip: "bg-pantone-mocha text-ink",
    cta: "",
    ctaGhost: LIGHT_GHOST,
    shapeA: "bg-pantone-mocha",
    shapeB: "bg-pantone-peach",
    cut: "border-pantone-cloud",
    stats: [{ bg: "bg-pantone-mocha", title: "text-ink", body: "text-ink" }, PEACH, CLOUD],
    steps: [CLOUD, PEACH],
    stepChip: "bg-pantone-mocha text-ink",
    bundle: { bg: "bg-pantone-mocha", title: "text-ink", body: "text-ink" },
    bundleCta: "bg-pantone-peach text-ink hover:bg-white hover:text-ink",
  },
};

const H2 = "text-[26px] font-extrabold leading-[30px] tracking-[-0.02em] lg:text-[40px] lg:leading-[44px]";

export function WorldHero({
  world,
  name,
  headline,
  intro,
  hasBundle,
  products,
  locale,
}: {
  world: TopicWorld;
  name: string;
  headline: string;
  intro: string;
  hasBundle: boolean;
  products: Product[];
  locale: Locale;
}) {
  const p = PALETTE[world.accent];
  const stickers = world.stickers
    .map((slug) => products.find((x) => x.slug === slug))
    .filter((x): x is Product => !!x && !!cutoutOf(x));

  return (
    <div className="flex flex-col gap-2.5 lg:gap-3">
      <section className={cn("relative overflow-hidden rounded-[32px]", p.hero)}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)]">
          <div className="relative z-10 order-2 flex flex-col gap-3 p-5 pb-7 lg:order-1 lg:gap-5 lg:py-14 lg:pl-12 lg:pr-6">
            <span className={cn("self-start rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-[0.06em]", p.chip)}>{world.eyebrow}</span>
            <h1 className="text-[34px] font-extrabold leading-[38px] tracking-[-0.03em] lg:text-[60px] lg:leading-[62px]">{name}</h1>
            <p className="text-[17px] font-semibold leading-[24px] lg:text-[21px] lg:leading-[29px]">{headline}</p>
            <p className={cn("text-[15px] leading-[22px] lg:text-lead", p.heroBody, world.large && "text-[17px] leading-[25px]")}>{intro}</p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {hasBundle && world.ctaBundle && (
                <a href="#world-bundle" className={cn(buttonVariants("primary", "lg"), p.cta)}>
                  {world.ctaBundle}
                </a>
              )}
              <a href="#world-day" className={cn(buttonVariants("primary", "lg"), hasBundle ? p.ctaGhost : p.cta)}>
                {world.ctaDay}
              </a>
            </div>
          </div>

          {/* Collage: colour blocks, an arched photo, a round inset and the products as stickers. */}
          <div className="relative order-1 h-[360px] lg:order-2 lg:h-auto lg:min-h-[540px]">
            <span aria-hidden className={cn("absolute -right-20 -top-20 h-[240px] w-[240px] rounded-full lg:-right-24 lg:-top-24 lg:h-[340px] lg:w-[340px]", p.shapeA)} />
            <span aria-hidden className={cn("absolute bottom-24 left-2 h-14 w-14 rounded-full lg:bottom-[220px] lg:left-0 lg:h-20 lg:w-20", p.shapeB)} />
            <div className="absolute inset-x-12 bottom-0 top-6 overflow-hidden rounded-t-[999px] lg:inset-x-16 lg:top-10">
              <Image
                src={world.hero.src}
                alt={world.hero.alt}
                fill
                priority
                sizes="(min-width: 1296px) 470px, (min-width: 1024px) 36vw, calc(100vw - 128px)"
                className="object-cover"
                style={world.hero.position ? { objectPosition: world.hero.position } : undefined}
              />
            </div>
            <div className={cn("absolute bottom-4 left-3 h-[104px] w-[104px] overflow-hidden rounded-full border-[6px] lg:bottom-8 lg:left-2 lg:h-[176px] lg:w-[176px] lg:border-8", p.cut)}>
              <Image src={world.inset.src} alt={world.inset.alt} fill sizes="(min-width: 1024px) 176px, 104px" className="object-cover" />
            </div>
            {stickers.length > 0 && (
              <ul className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-2.5 lg:right-5 lg:gap-4">
                {stickers.map((x) => (
                  <li key={x.id}>
                    <Link
                      href={`/product/${x.slug}`}
                      className="flex flex-col items-center gap-1 rounded-[22px] bg-white p-2 text-ink shadow-[0_8px_24px_rgba(23,25,27,0.18)] transition-transform hover:-translate-y-0.5 lg:p-2.5"
                    >
                      <span className="relative h-[64px] w-[64px] lg:h-[92px] lg:w-[92px]">
                        <Image src={cutoutOf(x)!} alt={x.name} fill sizes="(min-width: 1024px) 92px, 64px" className="object-contain" />
                      </span>
                      <span className="rounded-full bg-ink px-2 py-0.5 text-[12px] font-bold text-white lg:text-[13px]">{formatMoney(x.price, locale)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <ul className="grid gap-2.5 sm:grid-cols-3 lg:gap-3">
        {world.stats.map((s, i) => {
          const t = p.stats[i % 3];
          return (
            <li key={s.value} className={cn("flex flex-col gap-1 rounded-[24px] px-5 py-4 lg:px-7 lg:py-6", t.bg)}>
              <span className={cn("text-[32px] font-extrabold leading-[36px] tracking-[-0.02em] lg:text-[44px] lg:leading-[48px]", t.title)}>{s.value}</span>
              <span className={cn("text-[15px] font-medium leading-[21px]", t.body, world.large && "text-[17px] leading-[24px]")}>{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function WorldDay({ world, products, locale }: { world: TopicWorld; products: Product[]; locale: Locale }) {
  const p = PALETTE[world.accent];
  const tone = (i: number) => p.steps[i % p.steps.length];
  const productOf = (step: WorldStep) => (step.productSlug ? products.find((x) => x.slug === step.productSlug) : undefined);
  const chip = (i: number, step: WorldStep) => (
    <span className={cn("rounded-full px-2.5 py-1 text-[13px] font-bold", p.stepChip)}>
      {i + 1} · {step.time}
    </span>
  );

  let list;
  if (world.layout === "list") {
    // One step per row: photo, text, product side by side — large and calm.
    list = (
      <ol className="flex flex-col gap-3">
        {world.steps.map((step, i) => (
          <li key={step.title} className={cn("grid overflow-hidden rounded-[24px] md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]", tone(i).bg)}>
            <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[200px]">
              <Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 1024px) 320px, (min-width: 768px) 260px, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col gap-2 p-4 lg:flex-row lg:items-center lg:gap-8 lg:p-7">
              <div className="flex flex-1 flex-col gap-2">
                <span className="self-start">{chip(i, step)}</span>
                <StepText world={world} step={step} tone={tone(i)} />
              </div>
              <StepActions world={world} step={step} product={productOf(step)} locale={locale} tone={tone(i)} className="lg:w-[300px] lg:shrink-0" />
            </div>
          </li>
        ))}
      </ol>
    );
  } else if (world.layout === "path") {
    // A path of round stops joined by a dashed line — reads as "growing up".
    list = (
      <ol className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5 lg:gap-4">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[88px] hidden border-t-[4px] border-dashed border-line-strong lg:block" />
        {world.steps.map((step, i) => (
          <li key={step.title} className={cn("relative flex w-[72%] shrink-0 snap-start flex-col items-center gap-3 rounded-[28px] p-4 pt-5 text-center sm:w-auto", tone(i).bg)}>
            <div className="relative h-[136px] w-[136px] overflow-hidden rounded-full border-[6px] border-white">
              <Image src={step.image.src} alt={step.image.alt} fill sizes="136px" className="object-cover" />
            </div>
            {chip(i, step)}
            <div className="flex flex-1 flex-col items-center gap-2">
              <StepText world={world} step={step} tone={tone(i)} />
              <StepActions world={world} step={step} product={productOf(step)} locale={locale} tone={tone(i)} className="w-full text-left" center />
            </div>
          </li>
        ))}
      </ol>
    );
  } else {
    list = (
      <ol className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {world.steps.map((step, i) => (
          <li key={step.title} className={cn("flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] sm:w-auto", tone(i).bg)}>
            <div className="relative aspect-[4/3]">
              <Image src={step.image.src} alt={step.image.alt} fill sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              <span className="absolute left-3 top-3">{chip(i, step)}</span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <StepText world={world} step={step} tone={tone(i)} />
              <StepActions world={world} step={step} product={productOf(step)} locale={locale} tone={tone(i)} />
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section id="world-day" aria-labelledby="world-day-title" className="flex scroll-mt-[calc(var(--header-sticky)+16px)] flex-col gap-5 lg:gap-8">
      <header className="flex max-w-[760px] flex-col gap-2">
        <h2 id="world-day-title" className={H2}>{world.dayTitle}</h2>
        <p className={cn("text-ink-2", world.large ? "text-[17px] leading-[25px] lg:text-[19px] lg:leading-[28px]" : "text-[15px] leading-[22px] lg:text-lead")}>
          {world.dayIntro}
        </p>
      </header>
      {list}
    </section>
  );
}

function StepText({ world, step, tone }: { world: TopicWorld; step: WorldStep; tone: Tone }) {
  return (
    <>
      <h3 className={cn("font-bold", tone.title, world.large ? "text-[21px] leading-[27px]" : "text-[17px] leading-[22px]")}>{step.title}</h3>
      <p className={cn(tone.body, world.large ? "text-[17px] leading-[25px]" : "text-[15px] leading-[21px]")}>{step.body}</p>
    </>
  );
}

function StepActions({
  world,
  step,
  product,
  locale,
  tone,
  className,
  center,
}: {
  world: TopicWorld;
  step: WorldStep;
  product?: Product;
  locale: Locale;
  tone: Tone;
  className?: string;
  center?: boolean;
}) {
  const cutout = product ? cutoutOf(product) : undefined;
  if (!product && !step.href) return null;
  return (
    <div className={cn("mt-auto flex flex-col pt-1", className)}>
      {product && (
        <Link href={`/product/${product.slug}`} className="flex min-h-11 items-center gap-3 rounded-[16px] bg-white p-2 text-ink transition-colors hover:bg-tile">
          {cutout && (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-tile">
              <Image src={cutout} alt="" fill sizes="48px" className="object-contain p-1" />
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="line-clamp-2 text-[13px] font-semibold leading-[17px]">{product.name}</span>
            <span className="text-[14px] font-extrabold">{formatMoney(product.price, locale)}</span>
          </span>
        </Link>
      )}
      {step.href && (
        <Link
          href={step.href}
          className={cn("inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold hover:underline", tone.title, center ? "self-center" : "self-start")}
        >
          {world.more}
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}

/** The set as it will render: in-stock products, or none when fewer than two remain. */
export function bundleProducts(world: TopicWorld, products: Product[]): Product[] {
  if (!world.bundle) return [];
  const available = world.bundle.slugs
    .map((slug) => products.find((x) => x.slug === slug))
    .filter((x): x is Product => !!x && x.inStock);
  return available.length >= 2 ? available : [];
}

export function WorldBundle({ world, products, locale, list }: { world: TopicWorld; products: Product[]; locale: Locale; list: string }) {
  const p = PALETTE[world.accent];
  const set = bundleProducts(world, products);
  const bundle = world.bundle;
  if (!bundle || set.length === 0) return null;
  const total = set.reduce((sum, x) => sum + x.price, 0);

  return (
    <section
      id="world-bundle"
      aria-labelledby="world-bundle-title"
      className={cn("scroll-mt-[calc(var(--header-sticky)+16px)] rounded-[32px] p-4 lg:p-10", p.bundle.bg)}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div className="flex max-w-[640px] flex-col gap-2 px-1">
            <h2 id="world-bundle-title" className={cn(H2, p.bundle.title)}>{bundle.title}</h2>
            <p className={cn("text-[15px] font-medium leading-[22px] lg:text-[17px] lg:leading-[25px]", p.bundle.body)}>{bundle.text}</p>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:gap-3">
            {set.map((x, i) => (
              <div key={x.id} className="h-full w-[46%] shrink-0 snap-start md:w-auto">
                <ProductCard product={x} index={i} onCard />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 self-start rounded-[24px] bg-ink p-5 text-white lg:sticky lg:top-[calc(var(--header-sticky)+16px)] lg:p-6">
          <span className="text-[15px] text-on-dark-2">
            {bundle.total} · {set.length}
          </span>
          <span className="text-[34px] font-extrabold leading-[38px] tracking-[-0.02em]">{formatMoney(total, locale)}</span>
          <BundleAddAll products={set} label={bundle.cta} list={list} className={p.bundleCta} />
        </div>
      </div>
    </section>
  );
}
