import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { AnimatedCounter } from "@/components/visual/AnimatedCounter";

const ICONS = [
  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "M13 10V3L4 14h7v7l9-11h-7z",
  "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
];

export function StatsBand() {
  const t = useTranslations("home.trust");
  const stats = [
    { value: 50000, suffix: "+", key: "customers" },
    { value: 120, suffix: "+", key: "products" },
    { value: 48, suffix: "h", key: "delivery" },
    { value: 4.8, decimals: 1, suffix: "★", key: "rating" },
  ] as const;

  return (
    <section className="bg-surface py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="mb-14 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.key} index={i}>
              <div className="flex flex-col gap-4 rounded-2xl border border-line bg-ink p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d={ICONS[i] ?? ""} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                    <AnimatedCounter value={s.value} suffix={s.suffix} decimals={"decimals" in s ? s.decimals : 0} />
                  </div>
                  <div className="mt-1.5 text-sm text-muted">{t(`stats.${s.key}`)}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
