import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { loadProgramIndex, getProgramImage } from "@/lib/content/program-loader";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

const MAX_ON_HOME = 3;

export async function ProgramsRail({ locale }: { locale: Locale }) {
  const [t, common, entries] = await Promise.all([
    getTranslations("programs"),
    getTranslations("common"),
    loadProgramIndex(locale),
  ]);

  const shown = entries.filter((entry) => entry.products.length > 0).slice(0, MAX_ON_HOME);
  if (shown.length === 0) return null;

  return (
    <section className="border-t border-line/30 bg-ink py-20 sm:py-28">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-gold/15 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-ink border border-gold/30 mb-3">
              {t("railEyebrow")}
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-deep">
              {t("indexTitle")}
            </h2>
            <p className="mt-3 text-base text-muted">{t("indexSubtitle")}</p>
          </div>
          <Link href="/programs" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-brand-deep transition-all hover:bg-gold hover:border-gold hover:scale-105">
            {common("viewAll")}
          </Link>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {shown.map(({ program, products, pricing }, i) => (
            <Reveal key={program.slug} index={Math.min(i, 4)} as="li" className="h-full">
              <Link
                href={`/programs/${program.slug}`}
                className="group relative flex h-[420px] flex-col justify-end overflow-hidden rounded-[2.25rem] border border-white/10 bg-brand-deep p-7 transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-deep/30"
              >
                <div className="absolute inset-0 z-0 bg-brand-deep">
                  <Image
                    src={getProgramImage(program.slug)}
                    alt={program.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-85 transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/75 to-brand-deep/20 opacity-95 transition-opacity duration-300 group-hover:opacity-90" />
                </div>

                <div className="relative z-10">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gold/20 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-gold border border-gold/30">
                      {t("duration", { days: program.durationDays })}
                    </span>
                    {program.discountPercent > 0 && (
                      <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold text-brand-deep shadow-md">
                        {t("savePercent", { percent: program.discountPercent })}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-extrabold text-white transition-colors duration-300 group-hover:text-gold">
                    {program.name}
                  </h3>
                  <p className="mt-2 text-sm text-surface-2/80 line-clamp-2 leading-relaxed">{program.headline}</p>

                  <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white/60">
                        {t("includes", { count: products.length, days: program.durationDays })}
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-display text-xl font-extrabold text-white">
                          {formatMoney(pricing.total, locale)}
                        </span>
                        {pricing.saved > 0 && (
                          <span className="text-xs text-white/40 line-through">
                            {formatMoney(pricing.subtotal, locale)}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition-transform group-hover:bg-gold group-hover:text-brand-deep group-hover:scale-110">
                      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
