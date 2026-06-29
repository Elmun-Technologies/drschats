"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/shopflow/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <div className="flex gap-3 overflow-x-auto lg:max-h-[480px] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border bg-surface-2 transition-colors",
              i === active ? "border-accent" : "border-line hover:border-line-strong",
            )}
          >
            <Image src={img.url} alt={img.alt} fill sizes="64px" className="object-contain p-2" />
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0.4, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl border border-line bg-surface-2"
      >
        {current && (
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-2"
          />
        )}
      </motion.div>
    </div>
  );
}
