import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { QUIZ_LENGTH } from "@/lib/quiz/questions";
import { shopflow } from "@/lib/shopflow";
import type { Locale } from "@/lib/i18n/routing";

/*
  Entry point to the selection test — the widest funnel on the home page.

  Two things were removed here on purpose:

  - the "Aniq diagnostika / AI Diagnostic System" badge. The test is a
    rule-based questionnaire that sorts a catalogue; calling that a diagnostic
    system is a claim no supplement shop can support, and it is the kind of
    claim a pharmacy regulator reads first.
  - the stock photo of a doctor, and the "Dr. ... — Nutriologist" card laid
    over it. Neither the picture nor the name described a real person on this
    team. Named, credentialed reviewers belong in the experts section, with
    their own photo and their own bio, which is where they are now.

  The image panel shows three real products from the catalogue instead, so what
  the section promises on the left is what it shows on the right.
*/
export async function QuizPromo({ locale }: { locale: Locale }) {
  const [t, home, popular] = await Promise.all([
    getTranslations("quiz"),
    getTranslations("home.quizPromo"),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 8, assortment: "core" }),
  ]);

  const shown = popular.items.filter((p) => p.images[0]?.url).slice(0, 3);

  return (
    <section className="section-y bg-legacy-ink">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-deep shadow-[var(--shadow-card)]">
            <div className="flex flex-col items-stretch lg:flex-row">
              <div className="relative z-10 p-8 sm:p-14 lg:w-7/12 lg:py-16">
                <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-white/80">
                  {home("badge")}
                </span>

                <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{home("title")}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-surface-2/80">
                  {home("body")}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {(["step1", "step2", "step3"] as const).map((step, index) => (
                    <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-extrabold text-white">
                        {index + 1}
                      </span>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/60">
                        {home("stepLabel", { n: index + 1 })}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {home(index === 0 ? "step1Title" : index === 1 ? "step2Title" : "step3Title")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-5">
                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-xs font-extrabold uppercase tracking-widest text-brand-deep shadow-[var(--shadow-card)] transition-all duration-300 hover:bg-surface-2 active:scale-95"
                  >
                    <span>{home("cta")}</span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>{home("meta", { count: QUIZ_LENGTH })}</span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[280px] border-t border-white/10 lg:w-5/12 lg:border-l lg:border-t-0">
                <div className="flex h-full items-center justify-center gap-3 p-8">
                  {shown.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="relative aspect-[3/4] w-1/3 max-w-[140px] overflow-hidden rounded-2xl border border-white/15 bg-surface/95 transition-transform duration-300"
                    >
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 30vw, 140px"
                        className="object-contain p-2"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
