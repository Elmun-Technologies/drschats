import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

const LOGOS = ["ESSENCE", "Bustle", "NEW YORK", "Reader's Digest", "Medical Daily", "yahoo!life", "Women's Health", "Forbes"];

export function PressLogos() {
  const t = useTranslations("home");
  const row = [...LOGOS, ...LOGOS];
  return (
    <section className="border-y border-line bg-surface py-10">
      <Container>
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-faint">
          {t("pressTitle")}
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee flex shrink-0 items-center gap-12 pr-12">
            {row.map((name, i) => (
              <span key={i} className="whitespace-nowrap font-display text-xl font-bold text-faint/70">
                {name}
              </span>
            ))}
          </div>
          <div aria-hidden className="animate-marquee flex shrink-0 items-center gap-12 pr-12">
            {row.map((name, i) => (
              <span key={i} className="whitespace-nowrap font-display text-xl font-bold text-faint/70">
                {name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
