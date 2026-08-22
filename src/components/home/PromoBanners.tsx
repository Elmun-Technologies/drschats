import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

const BANNERS = [
  {
    bgImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
    key: "b1",
    href: "/products",
  },
  {
    bgImage: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600",
    key: "b2",
    href: "/products",
  },
  {
    bgImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600",
    key: "b3",
    href: "/products",
  },
];

export function PromoBanners() {
  const b = useTranslations("home.promo");

  return (
    <section className="bg-ink py-10 border-t border-line/30">
      <Container>
        <div className="grid gap-4 md:grid-cols-3">
          {BANNERS.map((banner, i) => (
            <Reveal key={i} index={i}>
              <Link
                href={banner.href}
                className="group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-brand-deep p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-deep/30"
              >
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={banner.bgImage}
                    alt={b(`${banner.key}.title`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/80 to-brand-deep/30" />
                </div>

                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-gold px-3 py-1 text-[10px] font-extrabold tracking-wider text-brand-deep shadow-sm">
                    {b(`${banner.key}.badge`)}
                  </span>
                </div>

                <div className="relative z-10 mt-4">
                  <h3 className="font-display text-lg font-extrabold text-white group-hover:text-gold transition-colors">
                    {b(`${banner.key}.title`)}
                  </h3>
                  <p className="mt-1 text-xs text-surface-2/80">{b(`${banner.key}.subtitle`)}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                    {b("viewMore")}
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
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
