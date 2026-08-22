import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

export type LoyaltyJourneyStep = {
  title: string;
  description: string;
  icon: "profile" | "product" | "rewards";
};

export function LoyaltyJourney({
  title,
  subtitle,
  cta,
  steps,
}: {
  title: string;
  subtitle: string;
  cta: string;
  steps: LoyaltyJourneyStep[];
}) {
  return (
    <section aria-labelledby="loyalty-journey-title" className="relative overflow-hidden py-16 sm:py-24">
      {/* The shallow champagne wash gives this section its own calm editorial
          rhythm without making the registration path feel like a promotion. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(209,172,89,0.13),_transparent_67%)]" />

      <div className="relative">
        <Reveal>
          <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold-ink">Go Vita club</p>
            <h1 id="loyalty-journey-title" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-fg sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-[1280px] items-center gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)_5rem_minmax(0,1fr)] lg:gap-0">
          {steps.slice(0, 3).map((step, index) => (
            <JourneyItem key={step.title} step={step} number={index + 1} isLast={index === 2} />
          ))}
        </div>

        <Reveal index={3}>
          <div className="mt-10 flex justify-center">
            <Link href="/account" className={buttonVariants("gold", "md")}>
              {cta}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function JourneyItem({ step, number, isLast }: { step: LoyaltyJourneyStep; number: number; isLast: boolean }) {
  return (
    <>
      <Reveal index={number - 1} className="h-full">
        <article className="relative mx-auto flex min-h-[22rem] w-full max-w-[23rem] flex-col items-center overflow-visible rounded-t-[8.5rem] rounded-b-[1.15rem] border border-line/70 bg-surface px-6 pb-8 pt-9 text-center shadow-[0_18px_45px_-36px_rgba(65,50,20,0.38)] sm:min-h-[23.5rem] sm:px-9">
          <span className="absolute -left-2 top-0 flex h-16 w-16 -translate-y-1/3 items-center justify-center rounded-full border border-line/60 bg-ink font-display text-3xl font-extrabold text-gold-ink shadow-sm sm:-left-3 sm:h-[4.75rem] sm:w-[4.75rem] sm:text-4xl">
            {number}
          </span>

          <JourneyIcon type={step.icon} />
          <h3 className="mt-7 max-w-[15rem] font-display text-xl font-extrabold leading-tight text-fg sm:text-2xl">
            {step.title}
          </h3>
          <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted sm:text-base">{step.description}</p>
        </article>
      </Reveal>

      {!isLast && <JourneyArrow />}
    </>
  );
}

function JourneyArrow() {
  return (
    <div className="flex justify-center py-1 lg:py-0" aria-hidden>
      <svg viewBox="0 0 96 40" className="h-8 w-16 rotate-90 text-gold-ink/55 lg:h-10 lg:w-20 lg:rotate-0" fill="none">
        <path d="M4 20h74M66 8l14 12-14 12" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function JourneyIcon({ type }: { type: LoyaltyJourneyStep["icon"] }) {
  if (type === "product") {
    return (
      <div className="relative mt-1 h-24 w-24 sm:h-28 sm:w-28">
        <div className="absolute inset-x-2 bottom-1 top-2 rounded-[1.5rem] bg-gold/10 blur-xl" />
        <Image
          src="/products/vitamin-d3-k2.jpg"
          alt=""
          fill
          sizes="112px"
          className="relative scale-125 object-contain drop-shadow-[0_10px_12px_rgba(65,50,20,0.18)]"
        />
      </div>
    );
  }

  if (type === "rewards") {
    return (
      <div className="mt-1 flex h-24 w-24 items-center justify-center text-gold sm:h-28 sm:w-28">
        <svg viewBox="0 0 96 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M48 12c-12 14-25 25-25 42a25 25 0 0050 0c0-17-13-28-25-42Z" />
          <path d="M48 27c-5 8-10 14-10 23a10 10 0 0020 0c0-9-5-15-10-23Z" />
          <path d="M48 69v10M39 75h18" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mt-1 flex h-24 w-24 items-center justify-center text-gold sm:h-28 sm:w-28">
      <svg viewBox="0 0 96 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="48" cy="33" r="14" />
        <path d="M22 78v-8c0-11 9-20 20-20h12c11 0 20 9 20 20v8" />
        <path d="M28 78h40" />
      </svg>
    </div>
  );
}
