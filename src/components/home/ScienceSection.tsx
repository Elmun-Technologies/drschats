import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animation/Reveal";

/*
  Sourcing and quality, without the laboratory theatre.

  The section used to be illustrated with three Unsplash photographs (a lab
  bench, a microscope, a chemist's hands) under the heading "Evropa
  standartlaridagi sof va samarali formulalar" — stock pictures of a facility
  that has nothing to do with this catalogue, standing behind claims like
  "har bir partiya ISO va GMP standartlariga muvofiq sinovdan o'tadi". Nobody
  here can produce that batch certificate on request, which is the only test
  that matters for a claim like that.

  What is left is what the shop can actually show: where the goods come from,
  what paperwork travels with them, and what the customer can ask for. The
  third card is deliberately the one that says "ask us" — a seller who names
  the document is a seller who has it.

  The photograph above the three cards is a generated placeholder of exactly
  the subject the section is about — paperwork and a shipped carton — because a
  relevant photo of *our* shelf or *our* folder does not exist yet. It is the
  first frame to replace in the Tashkent shoot (docs/GOVITA-TAVSIYALAR.md §1,
  frame 10); it carries no readable text or logo, so nothing on it can be read
  as a certificate this shop holds.
*/

const POINT_ICONS = [
  "M9 12h6m-6 4h6M9 8h6M5 4h14v16H5z",
  "M4 7h16M4 12h16M4 17h10M17 15l3 2-3 2",
  "M12 3l8 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7l8-4z",
];

export function ScienceSection() {
  const t = useTranslations("home.science");
  const points = ["tested", "transparent", "absorb"] as const;

  return (
    <Section tone="ink" aria-labelledby="quality-heading">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-signal">{t("eyebrow")}</p>
          <h2 id="quality-heading" className="font-display text-2xl font-extrabold tracking-tight text-balance text-fg sm:text-3xl lg:text-4xl">{t("title")}
          </h2>
          <p className="mt-3 text-pretty text-base text-muted sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-line sm:mb-8">
          <div className="relative aspect-[16/9] bg-surface-2 sm:aspect-[21/9]">
            <Image
              src="/images/quality/documents.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p} index={i} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-soft text-signal">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={POINT_ICONS[i]} />
                  </svg>
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-fg">{t(`points.${p}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(`points.${p}.description`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
    </Section>
  );
}
