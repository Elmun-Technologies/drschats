import Image from "next/image";
import type { Product } from "@/lib/shopflow/types";
import type { AdultCopy } from "@/lib/content/adult";
import { BRAND } from "@/lib/brand";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AgeGate } from "./AgeGate";

const H2 = "text-[26px] font-extrabold leading-[30px] tracking-[-0.02em] lg:text-[40px] lg:leading-[44px]";
const WHY_TONES = [
  "bg-pantone-peach text-ink",
  "bg-ink text-white",
  "bg-pantone-peri text-white",
];

/*
  /couples — the 18+ shelf, behind the age gate. Viva Magenta and a plain black
  parcel: the page is sold on calm and on the package, not on the product.
*/
export function CouplesView({ copy, products }: { copy: AdultCopy; products: Product[] }) {
  return (
    <AgeGate text={copy.gate}>
      <div className="wrap flex flex-col gap-8 pb-9 pt-1 lg:gap-14 lg:pb-[72px] lg:pt-5">
        <section className="relative overflow-hidden rounded-[32px] bg-pantone-magenta text-white">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
            <div className="relative z-10 order-2 flex flex-col gap-3 p-5 pb-7 lg:order-1 lg:gap-5 lg:py-14 lg:pl-12 lg:pr-6">
              <span className="self-start rounded-full bg-white px-3 py-1 text-[13px] font-bold uppercase tracking-[0.06em] text-ink">{copy.eyebrow}</span>
              <h1 className="text-[34px] font-extrabold leading-[38px] tracking-[-0.03em] lg:text-[58px] lg:leading-[60px]">{copy.title}</h1>
              <p className="text-[17px] font-semibold leading-[24px] lg:text-[21px] lg:leading-[29px]">{copy.headline}</p>
              <p className="text-[15px] leading-[22px] lg:text-lead">{copy.intro}</p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <a href="#couples-shop" className={cn(buttonVariants("primary", "lg"), "bg-white text-ink hover:bg-pantone-peach hover:text-ink")}>
                  {copy.ctaShop}
                </a>
                <a href="#couples-pack" className={cn(buttonVariants("primary", "lg"), "border border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white")}>
                  {copy.ctaPack}
                </a>
              </div>
            </div>

            {/* The parcel itself: black, opaque, nothing written on it. */}
            <div aria-hidden className="relative order-1 h-[340px] lg:order-2 lg:h-auto lg:min-h-[520px]">
              <span className="absolute -right-16 -top-16 h-[220px] w-[220px] rounded-full bg-pantone-peach lg:-right-20 lg:-top-20 lg:h-[320px] lg:w-[320px]" />
              <span className="absolute bottom-10 left-6 h-16 w-16 rounded-full bg-pantone-peri lg:bottom-16 lg:left-4 lg:h-24 lg:w-24" />
              <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-[44%] lg:h-[300px] lg:w-[300px]">
                <span className="absolute left-1/2 top-0 h-[54px] w-[92px] -translate-x-1/2 -translate-y-[70%] rounded-t-[46px] border-[10px] border-b-0 border-ink lg:h-[78px] lg:w-[132px] lg:border-[14px] lg:border-b-0" />
                <span className="absolute inset-0 rounded-[28px] bg-ink shadow-[0_24px_60px_rgba(23,25,27,0.45)] lg:rounded-[36px]" />
                <span className="absolute inset-x-0 top-[22%] h-[10px] bg-white/5 lg:h-[14px]" />
              </div>
              <ul className="absolute inset-0">
                {copy.tags.map((tag, i) => (
                  <li
                    key={tag}
                    className={cn(
                      "absolute rounded-full px-3.5 py-2 text-[14px] font-bold shadow-[0_8px_24px_rgba(23,25,27,0.18)] lg:text-[16px]",
                      ["left-4 top-8 bg-white text-ink lg:left-6 lg:top-16", "right-4 top-[46%] bg-pantone-sun text-ink lg:right-8", "bottom-6 right-[18%] bg-pantone-peach text-ink lg:bottom-12"][i % 3],
                    )}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <ul className="grid gap-2.5 sm:grid-cols-3 lg:gap-3">
          {copy.why.map((w, i) => (
            <li key={w.title} className={cn("flex flex-col gap-2 rounded-[24px] p-5 lg:p-7", WHY_TONES[i % 3])}>
              <h2 className="text-[21px] font-extrabold leading-[26px] lg:text-[26px] lg:leading-[31px]">{w.title}</h2>
              <p className="text-[15px] font-medium leading-[22px]">{w.text}</p>
            </li>
          ))}
        </ul>

        <section id="couples-shop" aria-labelledby="couples-shop-title" className="flex scroll-mt-[calc(var(--header-sticky)+16px)] flex-col gap-4 lg:gap-6">
          <h2 id="couples-shop-title" className={H2}>{copy.shopTitle}</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-3 md:gap-x-3 md:gap-y-6 xl:grid-cols-4">
              {products.map((p, i) => (
                <div key={p.id} className="h-full">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-[28px] bg-pantone-cloud p-5 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <p className="max-w-[680px] text-[16px] font-medium leading-[24px] text-ink-2 lg:text-[17px]">{copy.shopEmpty}</p>
              <div className="flex flex-wrap gap-2.5">
                <a href={`tel:${BRAND.contact.phoneHref}`} className={buttonVariants("primary", "lg")}>
                  {copy.call}
                </a>
                <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className={buttonVariants("light", "lg")}>
                  {copy.telegram}
                </a>
              </div>
            </div>
          )}
        </section>

        <section
          id="couples-pack"
          aria-labelledby="couples-pack-title"
          className="scroll-mt-[calc(var(--header-sticky)+16px)] overflow-hidden rounded-[32px] bg-ink p-5 text-white lg:p-12"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12">
            <div className="flex flex-col gap-3">
              <h2 id="couples-pack-title" className={H2}>{copy.packTitle}</h2>
              <p className="text-[16px] leading-[24px] text-on-dark-2 lg:text-[17px] lg:leading-[26px]">{copy.packIntro}</p>
            </div>
            <ol className="grid gap-2.5 sm:grid-cols-3 lg:gap-3">
              {copy.packSteps.map((s, i) => (
                <li key={s.title} className="flex flex-col gap-2 rounded-[24px] bg-dark-panel p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pantone-magenta text-[18px] font-extrabold text-white">{i + 1}</span>
                  <h3 className="text-[19px] font-bold leading-[24px]">{s.title}</h3>
                  <p className="text-[15px] leading-[22px] text-on-dark-2">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="couples-faq-title" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
          <div className="flex max-w-[820px] flex-col gap-3.5 lg:gap-6">
            <h2 id="couples-faq-title" className={H2}>{copy.faqTitle}</h2>
            <FaqAccordion items={copy.faq.map((f) => ({ question: f.q, answer: f.a }))} />
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[28px] lg:block">
            <Image src="/images/bank/couple-cooking-salad.webp" alt="" fill sizes="380px" className="object-cover" />
          </div>
        </section>

        <p className="rounded-[20px] bg-tile p-4 text-[14px] leading-[20px] text-ink-2 lg:p-5">{copy.note}</p>
      </div>
    </AgeGate>
  );
}
