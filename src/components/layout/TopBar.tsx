import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { isApiConfigured } from "@/lib/api/client";
import { AccountLink } from "./AccountLink";

/** Utility bar: announcement + secondary links, on the deep brand ground. */
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
    <div className="hidden bg-brand-deep text-white md:block">
      <Container className="flex h-10 items-center justify-between gap-4 text-sm">
        <p className="font-medium">{t("announcement")}</p>
        <nav className="flex items-center gap-4">
          {links.map((l, i) => (
            <span key={l.key} className="flex items-center gap-4">
              <Link href={l.href} className="opacity-90 transition-opacity hover:opacity-100">
                {l.label}
              </Link>
              {i < links.length - 1 && <span className="text-white/60">|</span>}
            </span>
          ))}
          {/* Hidden until the API exists: an account entry that leads nowhere
              is a promise the site cannot keep. */}
          {isApiConfigured() && <AccountLink />}
        </nav>
      </Container>
    </div>
  );
}
