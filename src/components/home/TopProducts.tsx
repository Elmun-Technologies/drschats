"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Container } from "@/components/ui/Container";
import { StarRating } from "@/components/ui/StarRating";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const headers = [
  "from-zinc-100 to-zinc-300",
  "from-sky-100 to-indigo-200",
  "from-emerald-100 to-teal-200",
];

export function TopProducts({ products }: { products: Product[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("home.top");
  const common = useTranslations("common");
  const add = useCart((s) => s.add);
  const items = products.slice(0, 3);

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-muted">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((p, i) => {
            const featured = i === 1;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-[1.75rem] border bg-ink",
                  featured ? "border-accent shadow-[0_24px_60px_-24px_rgba(21,182,106,0.45)] lg:-mt-4" : "border-line",
                )}
              >
                {featured && (
                  <span className="absolute right-5 top-5 z-10 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
                    ★ {common("reviews", { count: p.reviewCount })}
                  </span>
                )}

                {/* header */}
                <div className={cn("relative flex h-60 items-center justify-center bg-gradient-to-br", headers[i])}>
                  <span className="absolute top-6 font-display text-2xl font-light uppercase tracking-[0.4em] text-fg/80">
                    {p.name.split(" ")[0]}
                  </span>
                  <div className="relative mt-6 h-40 w-32 drop-shadow-xl">
                    <Image src={p.images[0]?.url ?? ""} alt={p.name} fill sizes="128px" className="rounded-xl object-cover" />
                  </div>
                </div>

                {/* body */}
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between">
                    <StarRating rating={p.rating} />
                    <div className="text-right">
                      {p.oldPrice && (
                        <span className="mr-2 text-sm text-faint line-through">{formatMoney(p.oldPrice, locale)}</span>
                      )}
                      <span className="font-display text-xl font-bold">{formatMoney(p.price, locale)}</span>
                    </div>
                  </div>

                  <p className="mt-5 text-sm font-semibold text-muted">{t("includes")}</p>
                  <ul className="mt-3 space-y-3">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3 text-sm text-fg">
                        <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="10" cy="10" r="9" className="opacity-20" />
                          <path d="M6 10l2.5 2.5L14 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 space-y-3">
                    <button
                      onClick={() => {
                        add({
                          productId: p.id,
                          slug: p.slug,
                          name: p.name,
                          image: p.images[0]?.url ?? "",
                          price: p.price,
                          oldPrice: p.oldPrice,
                        });
                        trackAddToCart(p.slug, p.price, 1);
                      }}
                      className={cn(
                        "w-full rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-300",
                        featured
                          ? "bg-accent text-ink hover:bg-accent-strong"
                          : "bg-fg text-ink hover:opacity-90",
                      )}
                    >
                      {t("buy")}
                    </button>
                    <Link
                      href={`/product/${p.slug}`}
                      className="block w-full rounded-full border border-line-strong px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-fg transition-colors hover:border-accent hover:text-accent-strong"
                    >
                      {t("learn")}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
