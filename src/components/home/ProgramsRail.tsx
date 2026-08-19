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
    <section className="border-t border-line bg-surface py-20 sm:py-24">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="mb-2 text-sm font-semibold text-accent-strong">{t("plural")}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              {t("indexTitle")}
            </h2>
            <p className="mt-3 text-muted">{t("indexSubtitle")}</p>
          </div>
          <Link href="/programs" className={buttonVariants("secondary")}>
            {common("viewAll")}
          </Link>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {shown.map(({ program, products, pricing }, i) => (
            <Reveal key={program.slug} index={Math.min(i, 4)} as="li" className="h-full">
              <Link
                href={`/programs/${program.slug}`}
                className="group relative flex h-[360px] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-ink p-6 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-xl"
              >
                <div className="absolute inset-0 z-0 bg-brand-deep">
                  <Image
                    src={getProgramImage(program.slug)}
                    alt={program.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/60 to-brand-deep/20 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="relative z-10">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-strong">
                      {t("duration", { days: program.durationDays })}
                    </span>
                    {program.discountPercent > 0 && (
                      <span className="rounded-full bg-blue px-2.5 py-1 text-[11px] font-bold text-white">
                        −{program.discountPercent}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-accent-soft">
                    {program.name}
                  </h3>
                  <p className="mt-2 text-sm text-surface-2">{program.headline}</p>
                  <div className="mt-5 border-t border-white/20 pt-4">
                    <p className="text-xs text-white/60">
                      {t("includes", { count: products.length, days: program.durationDays })}
                    </p>
                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                      <span className="font-display text-lg font-bold text-accent-soft">
                        {formatMoney(pricing.total, locale)}
                      </span>
                      {pricing.saved > 0 && (
                        <span className="text-sm text-white/50 line-through">
                          {formatMoney(pricing.subtotal, locale)}
                        </span>
                      )}
                    </div>
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
