import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-2xl" />
            <p className="mt-4 max-w-xs text-sm text-muted">{t("tagline")}</p>
          </div>

          <FooterCol title={t("shop")}>
            <FooterLink href="/products">{nav("products")}</FooterLink>
            <FooterLink href="/products/vitamins">Vitamins</FooterLink>
            <FooterLink href="/products/omega">Omega</FooterLink>
          </FooterCol>

          <FooterCol title={t("company")}>
            <FooterLink href="/about">{nav("about")}</FooterLink>
            <FooterLink href="/blog">{nav("blog")}</FooterLink>
            <FooterLink href="/contact">{nav("contact")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("support")}>
            <FooterLink href="/delivery">{t("delivery")}</FooterLink>
            <FooterLink href="/offer">{t("offer")}</FooterLink>
            <FooterLink href="/privacy">{t("privacy")}</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 border-t border-line pt-6 text-sm text-faint">
          © {year} Alimkhanov Pharm Group. {t("rights")}
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-fg">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted transition-colors hover:text-accent">
        {children}
      </Link>
    </li>
  );
}
