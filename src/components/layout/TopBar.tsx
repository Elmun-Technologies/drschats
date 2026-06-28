import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";

/** HealthMart-style teal announcement bar with utility links. */
export function TopBar() {
  const t = useTranslations("topbar");
  const nav = useTranslations("nav");
  const links = [
    { key: "about", href: "/about", label: nav("about") },
    { key: "blog", href: "/blog", label: nav("blog") },
    { key: "contact", href: "/contact", label: nav("contact") },
    { key: "faqs", href: "/delivery", label: nav("faqs") },
  ];
  return (
    <div className="hidden bg-teal text-white md:block">
      <Container className="flex h-10 items-center justify-between gap-4 text-sm">
        <p className="font-medium">{t("announcement")}</p>
        <nav className="flex items-center gap-4">
          {links.map((l, i) => (
            <span key={l.key} className="flex items-center gap-4">
              <Link href={l.href} className="opacity-90 transition-opacity hover:opacity-100">
                {l.label}
              </Link>
              {i < links.length - 1 && <span className="text-white/40">|</span>}
            </span>
          ))}
          <span className="flex items-center gap-1.5 opacity-90">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0116 0" strokeLinecap="round" />
            </svg>
            {nav("account")}
          </span>
        </nav>
      </Container>
    </div>
  );
}
