import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const contact = useTranslations("contact");
  const legal = useTranslations("legal");
  const experts = useTranslations("experts");
  const loyalty = useTranslations("loyalty");
  const ingredients = useTranslations("ingredients_page");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0c1512] text-white/70">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <div className="text-2xl text-white">
              <Logo className="text-2xl" />
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/55">{t("tagline")}</p>
          </div>

          <FooterCol title={t("shop")}>
            <FooterLink href="/products">{nav("products")}</FooterLink>
            <FooterLink href="/ingredients">{ingredients("title")}</FooterLink>
            <FooterLink href="/products/vitamins">Vitamins</FooterLink>
            <FooterLink href="/products/omega">Omega</FooterLink>
          </FooterCol>

          <FooterCol title={t("company")}>
            <FooterLink href="/about">{nav("about")}</FooterLink>
            <FooterLink href="/experts">{experts("badge")}</FooterLink>
            <FooterLink href="/blog">{nav("blog")}</FooterLink>
            <FooterLink href="/contact">{nav("contact")}</FooterLink>
            <FooterLink href="/delivery">{t("delivery")}</FooterLink>
            <FooterLink href="/loyalty">{loyalty("title")}</FooterLink>
            <FooterLink href="/privacy">{t("privacy")}</FooterLink>
          </FooterCol>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">{nav("contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:+998712000000" className="transition-colors hover:text-accent">+998 71 200 00 00</a></li>
              <li><a href="mailto:info@alimkhanov.com" className="transition-colors hover:text-accent">info@alimkhanov.com</a></li>
              <li className="text-white/55">{contact("addressValue")}</li>
            </ul>
            <div className="mt-5 flex gap-3">
              {["telegram", "instagram", "facebook"].map((s) => (
                <span key={s} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-accent hover:text-accent">
                  <span className="h-2 w-2 rounded-full bg-current" />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Law-mandated БАД disclaimer (UZ Law "On Advertising", art. 35) */}
        <div className="mt-12 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-white/80">
          <span className="font-semibold text-gold">{legal("notMedicine")}.</span> {legal("footer")}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/45">
          <span>© {year} Alimkhanov Pharm Group. {t("rights")}</span>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs">EU / CH / RU quality</span>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/70 transition-colors hover:text-accent">
        {children}
      </Link>
    </li>
  );
}
