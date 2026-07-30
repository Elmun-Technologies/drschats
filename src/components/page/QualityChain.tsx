import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

/*
  The sourcing story: where a product comes from and what it passed through
  before it reaches a shelf. For a supplement retailer this is the single
  strongest trust asset after the medical board.

  All copy lives in messages so the company can correct it — the defaults are
  deliberately structural (what each stage means) and carry no invented
  factory names, certificate numbers or laboratory partners.
*/

const STAGE_ICONS = [
  // Origin
  "M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7zM12 6.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z",
  // Production
  "M3 21h18M5 21V9l5 3V9l5 3V9l4 2v10M9 21v-4h6v4",
  // Laboratory
  "M9 3h6M10 3v6.5L5.2 18a2 2 0 001.7 3h10.2a2 2 0 001.7-3L14 9.5V3",
  // Certification
  "M12 2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 15.4 6.8 18.1l1-5.8L3.5 8.2l5.9-.9L12 2z",
  // Delivery
  "M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z",
];

const STAGE_KEYS = ["origin", "production", "laboratory", "certification", "delivery"] as const;

export async function QualityChain() {
  const t = await getTranslations("pages.about.quality");

  return (
    <section aria-labelledby="quality-chain" className="mt-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">
          {t("eyebrow")}
        </p>
        <h2 id="quality-chain" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {STAGE_KEYS.map((key, i) => (
          <Reveal key={key} index={Math.min(i, 5)} as="li" className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={STAGE_ICONS[i]} />
                  </svg>
                </span>
                <span className="font-display text-sm font-bold text-faint">{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-fg">{t(`${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted">{t(`${key}.body`)}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-ink p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-display text-lg font-bold text-fg">{t("coaTitle")}</p>
            <p className="mt-1 text-sm text-muted">{t("coaBody")}</p>
          </div>
          <Link href="/licenses" className={`${buttonVariants("secondary")} shrink-0`}>
            {t("coaCta")}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
