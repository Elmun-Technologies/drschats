import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

export function TrustRibbon() {
  const t = useTranslations("home.trustRibbon");
  const trustItems = [
    {
      icon: (
        <svg className="h-5 w-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t("t1"),
      desc: t("t1d"),
    },
    {
      icon: (
        <svg className="h-5 w-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: t("t2"),
      desc: t("t2d"),
    },
    {
      icon: (
        <svg className="h-5 w-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: t("t3"),
      desc: t("t3d"),
    },
    {
      icon: (
        <svg className="h-5 w-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: t("t4"),
      desc: t("t4d"),
    },
  ];

  return (
    <div className="border-y border-line/40 bg-surface-2/70 py-6">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3.5 rounded-2xl bg-surface/80 p-3.5 border border-line/50 shadow-xs">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15">
                {item.icon}
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-fg">{item.title}</h3>
                <p className="text-xs text-muted leading-tight mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
