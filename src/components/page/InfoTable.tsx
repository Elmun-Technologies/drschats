import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

/** Clean key/value info card (used for company requisites). */
export function InfoTable({ heading, rows }: { heading?: string; rows: { label: string; value: string }[] }) {
  return (
    <section className="py-12">
      <Container size="narrow">
        {heading && (
          <Reveal>
            <h2 className="mb-8 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{heading}</h2>
          </Reveal>
        )}
        <Reveal index={1}>
          <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-ink">
            {rows.map((r) => (
              <div key={r.label} className="grid gap-1 px-6 py-4 sm:grid-cols-[220px_1fr] sm:gap-4">
                <dt className="text-sm text-muted">{r.label}</dt>
                <dd className="text-sm font-semibold text-fg">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
