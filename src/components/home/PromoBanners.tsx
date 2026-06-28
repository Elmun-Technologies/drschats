import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

/** Row of pastel promo banners (HealthMart style). */
export function PromoBanners() {
  const b = useTranslations("home.bento");
  const cta = useTranslations("home.cta");

  const banners = [
    { bg: "bg-pastel-beige", img: "/placeholders/p1.svg", off: b("b1Off"), title: cta("title"), btn: cta("button") },
    { bg: "bg-pastel-mint", img: "/placeholders/p4.svg", off: b("b2Off"), title: b("b2Title"), btn: b("viewMore") },
    { bg: "bg-pastel-sky", img: "/placeholders/p6.svg", off: b("b3Off"), title: b("b3Title"), btn: b("viewMore") },
  ];

  return (
    <section className="bg-ink py-8">
      <Container>
        <div className="grid gap-4 md:grid-cols-3">
          {banners.map((banner, i) => (
            <Reveal key={i} index={i}>
              <Link href="/products" className={`group relative flex min-h-[170px] items-center overflow-hidden rounded-2xl ${banner.bg}`}>
                <div className="relative z-10 max-w-[60%] p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-fg/70">{banner.off}</p>
                  <h3 className="mt-2 font-display text-lg font-extrabold leading-tight text-fg">{banner.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink">
                    {banner.btn} →
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 h-4/5 w-2/5">
                  <Image src={banner.img} alt="" fill sizes="160px" className="object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
