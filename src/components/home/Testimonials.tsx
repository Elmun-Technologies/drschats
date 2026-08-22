import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { StarRating } from "@/components/ui/StarRating";
import { buttonVariants } from "@/components/ui/Button";
import type { Product } from "@/lib/shopflow/types";

export function Testimonials({ products }: { products: Product[] }) {
  const t = useTranslations("home.voices");

  const quotes = products
    .flatMap((p) => p.reviews.map((r) => ({ ...r, product: p.name })))
    .slice(0, 5);
  const tiles = [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
  ];

  if (quotes.length === 0) return null;

  return (
    <section className="bg-ink py-24 sm:py-32 border-t border-line/30">
      <Container>
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-gold/15 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-ink border border-gold/30 mb-3">
            {t("badge")}
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-deep">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-muted">{t("subtitle")}</p>
        </div>

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
          <ImageTile src={tiles[0]} className="aspect-[3/4]" />
          {quotes[0] && <Quote q={quotes[0]} member={t("member")} verifiedBuyer={t("verifiedBuyer")} />}
          {quotes[1] && <Quote q={quotes[1]} member={t("member")} verifiedBuyer={t("verifiedBuyer")} highlight />}
          <ImageTile src={tiles[1]} className="aspect-square" />
          <StatCard
            rating={t("statRating")}
            purchases={t("statPurchases")}
            feedback={t("statFeedback")}
          />
          {quotes[2] && <Quote q={quotes[2]} member={t("member")} verifiedBuyer={t("verifiedBuyer")} />}
          <ImageTile src={tiles[2]} className="aspect-[4/5]" />
          {quotes[3] && <Quote q={quotes[3]} member={t("member")} verifiedBuyer={t("verifiedBuyer")} />}
          <JoinCard label={t("join")} />
          {quotes[4] && <Quote q={quotes[4]} member={t("member")} verifiedBuyer={t("verifiedBuyer")} />}
          <ImageTile src={tiles[3]} className="aspect-square" />
        </div>
      </Container>
    </section>
  );
}

function Quote({
  q,
  member,
  verifiedBuyer,
  highlight,
}: {
  q: { text: string; author: string; rating: number };
  member: string;
  verifiedBuyer: string;
  highlight?: boolean;
}) {
  return (
    <figure
      className={`rounded-[2rem] border p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
        highlight
          ? "border-gold bg-gradient-to-br from-gold/15 via-brand-deep to-brand-deep text-white shadow-lg shadow-gold/10"
          : "border-white/10 bg-brand-deep text-white shadow-md"
      }`}
    >
      <StarRating rating={q.rating} className="mb-3" />
      <blockquote className="font-display text-base font-bold leading-relaxed text-white">
        “{q.text}”
      </blockquote>
      <figcaption className="mt-5 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-surface-2/80">
        <span className="font-extrabold text-white">{q.author}</span>
        <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 font-semibold text-gold">✓ {verifiedBuyer}</span>
      </figcaption>
    </figure>
  );
}

function ImageTile({ src, className }: { src: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 shadow-lg ${className}`}>
      <Image src={src} alt="" fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-105" />
    </div>
  );
}

function StatCard({
  rating,
  purchases,
  feedback,
}: {
  rating: string;
  purchases: string;
  feedback: string;
}) {
  return (
    <div className="rounded-[2rem] border border-gold/30 bg-gradient-to-br from-brand-deep via-brand-deep to-brand-deep/90 p-8 text-center shadow-xl shadow-gold/5">
      <div className="font-display text-5xl font-extrabold text-gold drop-shadow-md">{rating}</div>
      <p className="mt-2 text-sm font-bold text-white">{purchases}</p>
      <p className="mt-1 text-xs text-surface-2/70">{feedback}</p>
    </div>
  );
}

function JoinCard({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-brand-deep to-accent p-8 text-center">
      <p className="font-display text-2xl font-bold text-white">Go Vita</p>
      <Link href="/products" className={buttonVariants("primary") + " bg-gold text-brand-deep hover:bg-white"}>
        {label}
      </Link>
    </div>
  );
}
