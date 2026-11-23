import Image from "next/image";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { CARE_PATH, CARE_PHOTO, HOME_CARE, type CareKind } from "@/lib/care/content";
import { cn } from "@/lib/utils";

/*
  The care hubs on the home page, right under the category tiles: one banner,
  two doors. Yellow is the brand's single accent, so it marks only this block's
  badge and the baby door.
*/
export function HomeCare({ locale }: { locale: Locale }) {
  const t = HOME_CARE[locale];
  const doors: { kind: CareKind; label: string }[] = [
    { kind: "mom", label: t.mom },
    { kind: "baby", label: t.baby },
  ];
  return (
    <section aria-labelledby="home-care" className="wrap">
      <div className="grid gap-3 overflow-hidden rounded-[20px] bg-tile p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-6 lg:rounded-[28px] lg:p-6">
        <div className="flex flex-col justify-center gap-3 lg:gap-4 lg:p-6">
          <span className="self-start rounded-full bg-yellow px-3 py-1 text-[13px] font-bold">{t.badge}</span>
          <h2 id="home-care" className="text-[24px] font-extrabold leading-[30px] tracking-[-0.02em] lg:text-[34px] lg:leading-[40px]">
            {t.title}
          </h2>
          <p className="text-[15px] leading-[22px] text-ink-2 lg:text-lead">{t.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:gap-4">
          {doors.map((d) => (
            <Link
              key={d.kind}
              href={CARE_PATH[d.kind]}
              className={cn(
                "group flex flex-col overflow-hidden rounded-[18px] lg:rounded-3xl",
                d.kind === "baby" ? "bg-yellow-banner" : "bg-bg",
              )}
            >
              <span className="relative block aspect-[4/3] lg:aspect-[16/11]">
                <Image src={CARE_PHOTO[d.kind]} alt="" fill sizes="(max-width: 1023px) 50vw, 360px" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              </span>
              <span className="flex min-h-[52px] items-center justify-between gap-2 px-3.5 py-3 text-[15px] font-bold lg:px-5 lg:py-4 lg:text-lg">
                {d.label}
                <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
