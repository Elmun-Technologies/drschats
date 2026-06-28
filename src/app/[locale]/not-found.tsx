import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <div className="flex min-h-[80svh] items-center pt-10">
      <Container size="narrow">
        <div className="text-center">
          <p className="font-display text-7xl font-bold text-accent">404</p>
          <p className="mt-4 text-lg text-muted">
            Page not found · Sahifa topilmadi · Страница не найдена
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-ink"
          >
            Home
          </Link>
        </div>
      </Container>
    </div>
  );
}
