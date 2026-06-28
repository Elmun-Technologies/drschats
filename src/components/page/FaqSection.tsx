import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { FaqAccordion } from "@/components/product/FaqAccordion";

/** FAQ block (AEO/answer-engine friendly). Emit faqLd(items) in the page too. */
export function FaqSection({ heading, items }: { heading: string; items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="py-12">
      <Container size="narrow">
        <Reveal>
          <h2 className="mb-8 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{heading}</h2>
        </Reveal>
        <FaqAccordion items={items} />
      </Container>
    </section>
  );
}
