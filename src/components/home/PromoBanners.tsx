import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

const BANNERS = [
  {
    gradient: "from-accent/20 via-accent/5 to-transparent",
    iconBg: "bg-accent",
    iconColor: "text-ink",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    offKey: "b1Off" as const,
    titleKey: "b1Title" as const,
    href: "/products",
  },
  {
    gradient: "from-[#6366f1]/20 via-[#6366f1]/5 to-transparent",
    iconBg: "bg-[#6366f1]",
    iconColor: "text-white",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    offKey: "b2Off" as const,
    titleKey: "b2Title" as const,
    href: "/products",
  },
  {
    gradient: "from-gold/20 via-gold/5 to-transparent",
    iconBg: "bg-gold",
    iconColor: "text-ink",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    offKey: "b3Off" as const,
    titleKey: "b3Title" as const,
    href: "/products",
  },
];

export function PromoBanners() {
  const b = useTranslations("home.bento");

  return (
    <section className="bg-ink py-10">
      <Container>
        <div className="grid gap-4 md:grid-cols-3">
          {BANNERS.map((banner, i) => (
            <Reveal key={i} index={i}>
              <Link
                href={banner.href}
                className={`group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${banner.gradient} border border-line p-6 transition-all hover:border-accent/40 hover:-translate-y-0.5`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${banner.iconBg} ${banner.iconColor}`}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d={banner.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">{b(banner.offKey)}</p>
                  <h3 className="mt-1 font-display text-lg font-bold leading-snug text-fg">{b(banner.titleKey)}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-gap group-hover:gap-2">
                    {b("viewMore")}
                    <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
