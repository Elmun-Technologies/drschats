import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

/** Simple shell for legal/info pages. Real copy is supplied by the client. */
export function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="pt-32">
      <Container size="narrow">
        <Reveal>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        </Reveal>
        <Reveal index={1}>
          <p className="my-16 whitespace-pre-line text-muted">{body}</p>
        </Reveal>
      </Container>
    </div>
  );
}
