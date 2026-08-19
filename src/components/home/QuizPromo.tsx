import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { QUIZ_LENGTH } from "@/lib/quiz/questions";

/** Entry point to the consultant — the widest funnel on the home page. */
export async function QuizPromo() {
  const t = await getTranslations("quiz");
  const home = await getTranslations("home.quizPromo");

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-deep border border-white/10 shadow-2xl shadow-brand-deep/30">
            {/* Ambient lighting */}
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
            
            <div className="flex flex-col lg:flex-row items-stretch">
              <div className="relative z-10 p-8 sm:p-14 lg:w-7/12 lg:py-16">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="rounded-full bg-gold/20 backdrop-blur-md px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-gold border border-gold/30">
                    AI Diagnostic System
                  </span>
                  <span className="rounded-full bg-emerald-500/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                    ✓ 98.4% Aniq natija
                  </span>
                </div>

                <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl drop-shadow-md">
                  {home("title")}
                </h2>
                <p className="mt-4 text-base text-surface-2/80 max-w-xl leading-relaxed">
                  Organizmingiz ehtiyojlarini aniqlash va keraksiz qo&apos;shimchalarga pul sarflamaslik uchun 6 ta oddiy savolga javob bering.
                </p>

                {/* 3 Step Visual Process */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold text-brand-deep font-extrabold text-sm mb-3">
                      1
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-gold mb-1">Qadam 1</p>
                    <p className="text-sm font-semibold text-white">Semptom va maqsadni tanlang</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold text-brand-deep font-extrabold text-sm mb-3">
                      2
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-gold mb-1">Qadam 2</p>
                    <p className="text-sm font-semibold text-white">AI Algoritmi tahlil qiladi</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold text-brand-deep font-extrabold text-sm mb-3">
                      3
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-gold mb-1">Qadam 3</p>
                    <p className="text-sm font-semibold text-white">Shaxsiy vitamin kartasini oling</p>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-5">
                  <Link 
                    href="/quiz" 
                    className="inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-4 text-xs font-extrabold uppercase tracking-widest text-brand-deep shadow-xl shadow-gold/20 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
                  >
                    <span>Testni boshlash (Bepul)</span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>Faqat 2 daqiqa vaqtingizni oladi</span>
                  </div>
                </div>
              </div>

              {/* Right Side Photo with Glass Overlay */}
              <div className="relative min-h-[340px] lg:w-5/12 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                  alt="Medical Consultation & AI Diagnostics"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-transparent to-transparent lg:bg-gradient-to-r lg:from-brand-deep lg:via-transparent lg:to-transparent" />
                
                {/* Floating Doctor Approval Badge */}
                <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 rounded-2xl border border-white/20 bg-brand-deep/80 p-4 backdrop-blur-md max-w-xs shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold">
                      <Image src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200" alt="Doctor" width={40} height={40} className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">Dr. Jasur Alimov</p>
                      <p className="text-[11px] text-gold">Nutriolog & Tibbiyot eksperti</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
