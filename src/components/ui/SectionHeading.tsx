import { cn } from "@/lib/utils";
import { Reveal } from "@/components/animation/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal index={1}>
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal index={2}>
          <p className="mt-4 text-lg text-muted">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
