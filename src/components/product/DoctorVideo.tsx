import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { doctorVideoFor } from "@/lib/content/doctor-videos";

/*
  A doctor's own video, next to the product it is about.

  Renders nothing at all unless the clip passes both gates in
  lib/content/doctor-videos.ts — written consent on file and an over-the-counter
  product. That is the point of building it as a component with a gate rather
  than a `<video>` tag someone drops in: the default state of the site is
  "no video", and adding one is a deliberate act with two facts attached.

  `preload="none"` on purpose: a product page should not pull a video file for
  every visitor who scrolls past. The poster frame is what they see.
*/
export async function DoctorVideo({ slug, locale }: { slug: string; locale: Locale }) {
  const video = doctorVideoFor(slug);
  if (!video) return null;

  const t = await getTranslations("product");

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
      <video
        className="aspect-video w-full bg-surface-2 object-cover"
        controls
        preload="none"
        playsInline
        poster={video.posterSrc ?? undefined}
      >
        <source src={video.videoSrc} type="video/mp4" />
      </video>
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-5 py-4">
        {/* The trust colour: a named specialist explaining the product is a
            claim about the product, so it wears the colour reserved for the
            things the shop can stand behind. */}
        <span className="font-display text-sm font-bold text-fg">{video.doctorName}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-signal">{t("reviewedBy")}</span>
        <p className="w-full text-sm text-muted">{video.caption[locale]}</p>
      </figcaption>
    </figure>
  );
}
