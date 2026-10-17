"use client";

import Image from "next/image";
import type { StoreBanner } from "@/lib/merch/model";
import { cn } from "@/lib/utils";
import { AbSlot } from "./AbSlot";
import { BannerLink, useUnexpired } from "./BannerLink";
import { SaleCountdown } from "./SaleCountdown";

const isLocal = (src: string) => src.startsWith("/") && !src.startsWith("//");

/* A banner placed "category": one card above the catalogue grid — the first one running. */
export function CategoryBanner({ banners }: { banners: StoreBanner[] }) {
  const live = useUnexpired(banners);
  const b = live[0];
  if (!b) return null;
  if (b.experiment && b.variantB) {
    return (
      <AbSlot
        experiment={b.experiment}
        slot="category"
        a={{ id: b.id, title: b.title, node: <CategoryCard b={b} /> }}
        b={{ id: b.variantB.id, title: b.variantB.title, node: <CategoryCard b={b.variantB} /> }}
      />
    );
  }
  return <CategoryCard b={b} />;
}

function CategoryCard({ b }: { b: StoreBanner }) {
  const dark = b.theme === "dark";
  const image = b.image;
  return (
    <BannerLink
      href={b.href}
      slot="category"
      banner={{ id: b.id, title: b.title }}
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[20px] p-5 transition-colors md:px-7 md:py-6",
        dark ? "bg-dark-panel text-white hover:bg-ink" : "bg-tile hover:bg-tile-hover",
      )}
    >
      <span className="flex flex-col items-start gap-1.5">
        <span className="text-lg font-bold leading-6 md:text-[22px] md:leading-7">{b.title}</span>
        {b.subtitle && <span className={cn("text-sm md:text-[15px]", dark ? "text-on-dark-2" : "text-ink-2")}>{b.subtitle}</span>}
        {b.countdownTo && <SaleCountdown as="span" endsAt={b.countdownTo} onDark={dark} />}
        {b.cta && (
          <span className={cn("mt-1.5 inline-flex h-11 items-center rounded-sm px-[18px] text-[15px] font-semibold", dark ? "bg-bg text-ink" : "bg-ink text-white")}>
            {b.cta}
          </span>
        )}
      </span>
      {image && (
        <span className={cn("relative h-24 w-24 md:h-32 md:w-32", b.imageMobile && "max-md:hidden")}>
          <Image src={image} alt="" fill unoptimized={!isLocal(image)} sizes="128px" className="object-contain" />
        </span>
      )}
      {b.imageMobile && (
        <span className="relative h-24 w-24 md:hidden">
          <Image src={b.imageMobile} alt="" fill unoptimized={!isLocal(b.imageMobile)} sizes="96px" className="object-contain" />
        </span>
      )}
    </BannerLink>
  );
}
