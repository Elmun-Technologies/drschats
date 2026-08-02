"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { AuthForm } from "./AuthForm";
import { OrderHistory } from "./OrderHistory";
import { useSession } from "@/lib/auth/store";

/*
  One route for the whole account area rather than /login, /register and
  /account: the customer's question is "where are my orders", and answering it
  should not depend on their guessing which of three URLs they belong on.

  The health layer is linked from here too. This is not a shop account — the
  saved plan and the saved products are as much a reason to sign in as the
  order list.
*/
const SHORTCUTS = [
  { key: "wishlist", href: "/wishlist" },
  { key: "quiz", href: "/quiz" },
  { key: "programs", href: "/programs" },
] as const;

export function AccountView() {
  const t = useTranslations("account");
  const user = useSession((s) => s.user);
  const token = useSession((s) => s.token);
  const signOut = useSession((s) => s.signOut);

  // The session is restored from localStorage after mount, so the first render
  // must not decide that nobody is signed in.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <Container className="py-16">
        <div className="mx-auto h-64 max-w-md animate-pulse rounded-2xl bg-surface" />
      </Container>
    );
  }

  if (!token || !user) {
    return (
      <Container className="py-12 sm:py-16">
        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted">{t("subtitle")}</p>
        </header>
        <AuthForm />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-strong">{t("greeting")}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {user.name}
          </h1>
          <p className="mt-1 text-sm text-muted">{user.phone}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          {t("signOut")}
        </button>
      </header>

      <nav aria-label={t("shortcuts")} className="mb-10 grid gap-3 sm:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="rounded-2xl border border-line bg-surface px-5 py-4 transition-colors hover:border-accent"
          >
            <span className="block font-display text-base font-bold text-fg">
              {t(`shortcut.${item.key}.title`)}
            </span>
            <span className="mt-0.5 block text-sm text-muted">
              {t(`shortcut.${item.key}.description`)}
            </span>
          </Link>
        ))}
      </nav>

      <section aria-labelledby="account-orders">
        <h2 id="account-orders" className="mb-4 font-display text-xl font-extrabold tracking-tight">
          {t("orders")}
        </h2>
        <OrderHistory />
      </section>
    </Container>
  );
}
