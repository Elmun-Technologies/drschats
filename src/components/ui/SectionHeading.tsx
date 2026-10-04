import { cn } from "@/lib/utils";
import { Reveal } from "@/components/animation/Reveal";

/*
  Section titles, one shape.

  Three things were inconsistent before: the eyebrow colour (antique gold on
  some sections, green on others, nothing on the rest), the weight
  (font-bold here, font-extrabold there) and the size ladder (some stopped at
  text-4xl, some ran to text-5xl with `uppercase`).

  The eyebrow is neutral grey by design. Gold means "this spends money" — it
  belongs on the add-to-cart and checkout buttons, not on the label above a
  headings, which is exactly the rule the client asked for.
*/
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "light",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  /** `dark` inverts the type for the graphite bands. */
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const dark = tone === "dark";
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
          <p
            className={cn(
              "mb-3 text-xs font-semibold uppercase tracking-[0.22em]",
              dark ? "text-white/60" : "text-muted",
            )}
          >
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal index={1}>
        <Tag
          className={cn(
            "font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl lg:text-4xl",
            dark ? "text-white" : "text-fg",
          )}
        >
          {title}
        </Tag>
      </Reveal>
      {subtitle && (
        <Reveal index={2}>
          <p className={cn("mt-4 text-pretty text-base sm:text-lg", dark ? "text-white/70" : "text-muted")}>
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
